-- B6: progress, recovery and daily logs, transformation approvals, and export.
--
-- body_logs         Weigh-ins and measurements, one row each, on a local calendar day.
-- progress_photos   Progress photos (the file sits in storage, athlete-files/<id>/photos/...).
-- day_logs          One row per athlete, area and day: recovery check-ins and device days, water,
--                   habits, protocols done.
-- transformations   A coach asks to share a client's before/after; the athlete approves, declines or
--                   later withdraws (F9). The coach writes the request; only the athlete decides.
-- export_my_data()  Everything the signed-in user can see about themselves, as one JSON document
--                   (AC, X-09). Deleting the account removes the auth user, and every row cascades.

create table public.body_logs (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  kind text not null check (kind in ('weight', 'measure')),
  day date not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

create index body_logs_athlete_day_idx on public.body_logs (athlete_id, day desc);

comment on table public.body_logs is 'Weigh-ins and measurements; athlete writes, coach reads from the join day.';

create table public.progress_photos (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  day date not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

comment on table public.progress_photos is 'Progress photos (files in storage); athlete writes, coach reads from the join day.';

create table public.day_logs (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  area text not null check (area in ('recovery', 'device', 'water', 'habits', 'protocols', 'activity')),
  day date not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, area, day)
);

comment on table public.day_logs is 'Daily logs by area; athlete writes, coach reads from the join day.';

create table public.transformations (
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  coach_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'approved', 'declined', 'withdrawn')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

comment on table public.transformations is 'Transformation requests; coach asks, athlete decides (F9).';

create trigger body_logs_check before insert
or
update on public.body_logs for each row
execute function public.athlete_owned_check ();

create trigger progress_photos_check before insert
or
update on public.progress_photos for each row
execute function public.athlete_owned_check ();

create trigger day_logs_check before insert
or
update on public.day_logs for each row
execute function public.athlete_owned_check ();

-- The coach asks (status waiting) and may edit the request while it waits; only the athlete sets
-- the status or their choices once asked.
create function public.transformations_guard () returns trigger language plpgsql
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
begin
  perform public.check_role (new.athlete_id, 'athlete');
  perform public.check_role (new.coach_id, 'coach');
  if tg_op = 'INSERT' then
    if me is distinct from new.coach_id or new.status <> 'waiting' then
      raise exception 'the coach asks; the athlete decides' using errcode = '42501';
    end if;
  else
    if new.coach_id is distinct from old.coach_id or new.athlete_id is distinct from old.athlete_id then
      raise exception 'not allowed' using errcode = '42501';
    end if;
    if me = old.coach_id and (new.status is distinct from old.status or old.status <> 'waiting') then
      raise exception 'only the athlete decides' using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger transformations_guard before insert
or
update on public.transformations for each row
execute function public.transformations_guard ();

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.body_logs enable row level security;

alter table public.progress_photos enable row level security;

alter table public.day_logs enable row level security;

alter table public.transformations enable row level security;

create policy body_logs_select on public.body_logs for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read_day (athlete_id, day)
  );

create policy body_logs_write on public.body_logs for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

create policy progress_photos_select on public.progress_photos for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read_day (athlete_id, day)
  );

create policy progress_photos_write on public.progress_photos for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

create policy day_logs_select on public.day_logs for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read_day (athlete_id, day)
  );

create policy day_logs_write on public.day_logs for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

-- The athlete always sees their requests. The coach sees their own requests while coaching, and
-- approved ones afterwards (until the athlete withdraws).
create policy transformations_select on public.transformations for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or (
      coach_id = (select auth.uid())
      and (
        public.is_active_coach_of (athlete_id)
        or status = 'approved'
      )
    )
  );

create policy transformations_insert on public.transformations for insert to authenticated
with
  check (
    coach_id = (select auth.uid())
    and public.is_active_coach_of (athlete_id)
  );

create policy transformations_update on public.transformations
for update
  to authenticated using (
    athlete_id = (select auth.uid())
    or (
      coach_id = (select auth.uid())
      and public.is_active_coach_of (athlete_id)
    )
  )
with
  check (
    athlete_id = (select auth.uid())
    or coach_id = (select auth.uid())
  );

-- ---------------------------------------------------------------------------------------------
-- Export (X-09): everything about the signed-in user, read through their own RLS
-- ---------------------------------------------------------------------------------------------

create function public.export_my_data () returns jsonb language sql stable security invoker
set
  search_path = '' as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = (select auth.uid())),
    'consents', (select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at), '[]') from public.consents c),
    'coaching', (select coalesce(jsonb_agg(to_jsonb(l)), '[]') from public.coach_clients l where l.client_id = (select auth.uid()) or l.coach_id = (select auth.uid())),
    'athlete_profile', (select payload from public.athlete_profiles where athlete_id = (select auth.uid())),
    'coach_profile', (select payload from public.coach_profiles where coach_id = (select auth.uid())),
    'preferences', (select to_jsonb(a) from public.athlete_preferences a where a.athlete_id = (select auth.uid())),
    'plans', (select coalesce(jsonb_object_agg(kind, payload), '{}') from public.plans where athlete_id = (select auth.uid())),
    'enhanced', (select to_jsonb(e) from public.enhanced e where e.athlete_id = (select auth.uid())),
    'workouts', (select coalesce(jsonb_agg(payload order by at), '[]') from public.workouts where athlete_id = (select auth.uid())),
    'routines', (select coalesce(jsonb_agg(payload), '[]') from public.routines where athlete_id = (select auth.uid())),
    'food_logs', (select coalesce(jsonb_agg(payload order by day), '[]') from public.food_logs where athlete_id = (select auth.uid())),
    'my_foods', (select coalesce(jsonb_agg(payload), '[]') from public.my_foods where athlete_id = (select auth.uid())),
    'check_ins', (select coalesce(jsonb_agg(to_jsonb(k) order by k.at), '[]') from public.check_ins k where k.athlete_id = (select auth.uid())),
    'messages', (select coalesce(jsonb_agg(to_jsonb(m) order by m.created_at), '[]') from public.messages m where m.athlete_id = (select auth.uid()) or m.coach_id = (select auth.uid())),
    'body_logs', (select coalesce(jsonb_agg(to_jsonb(b) order by b.day), '[]') from public.body_logs b where b.athlete_id = (select auth.uid())),
    'progress_photos', (select coalesce(jsonb_agg(payload order by day), '[]') from public.progress_photos where athlete_id = (select auth.uid())),
    'day_logs', (select coalesce(jsonb_agg(to_jsonb(d) order by d.day), '[]') from public.day_logs d where d.athlete_id = (select auth.uid())),
    'transformations', (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.transformations t where t.athlete_id = (select auth.uid()) or t.coach_id = (select auth.uid())),
    'templates', (select coalesce(jsonb_agg(payload), '[]') from public.templates where coach_id = (select auth.uid())),
    'leads', (select coalesce(jsonb_agg(payload), '[]') from public.leads where coach_id = (select auth.uid())),
    'subscription', (select to_jsonb(s) from public.subscriptions s where s.user_id = (select auth.uid()))
  );
$$;

-- ---------------------------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------------------------

revoke all on public.body_logs,
public.progress_photos,
public.day_logs,
public.transformations
from
  anon,
  authenticated;

grant
select
,
  insert (athlete_id, id, kind, day, payload),
update (kind, day, payload),
delete on public.body_logs to authenticated;

grant
select
,
  insert (athlete_id, id, day, payload),
update (day, payload),
delete on public.progress_photos to authenticated;

grant
select
,
  insert (athlete_id, area, day, payload),
update (payload),
delete on public.day_logs to authenticated;

grant
select
,
  insert (athlete_id, id, coach_id, status, payload),
update (status, payload) on public.transformations to authenticated;

revoke all on function public.transformations_guard (),
public.export_my_data ()
from
  public,
  anon;

grant
execute on function public.export_my_data () to authenticated;
