-- B3 and B4: what the athlete logs. Every row is dated, and a coach reads a row only through
-- coach_can_read() (timestamps) or coach_can_read_day() (calendar days): while linked, and only from
-- the join date or the earlier date the athlete shared. Only the athlete writes.
--
-- workouts    Finished workouts (sessions with their sets), one row each.
-- routines    The athlete's own saved workouts (templates, D92). Current, so the current coach reads.
-- food_logs   Foods logged, one row per entry, on the athlete's local calendar day.
-- my_foods    Foods the athlete created. Only the athlete.

-- ---------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------

-- The day form of coach_can_read: the athlete's local calendar day (India first, so IST) on or
-- after the join day, or the earlier date the athlete shared.
create function public.coach_can_read_day (client uuid, d date) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = (select auth.uid())
      and client_id = client
      and ended_at is null
      and d >= (coalesce(history_from, joined_at) at time zone 'Asia/Kolkata')::date
  );
$$;

create function public.athlete_owned_check () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  perform public.check_role (new.athlete_id, 'athlete');
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.workouts (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  at timestamptz not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

create index workouts_athlete_at_idx on public.workouts (athlete_id, at desc);

comment on table public.workouts is 'Finished workouts; athlete writes, coach reads from the join date.';

create table public.routines (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

comment on table public.routines is 'The athlete''s own templates; athlete writes, current coach reads.';

create table public.food_logs (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  day date not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

create index food_logs_athlete_day_idx on public.food_logs (athlete_id, day desc);

comment on table public.food_logs is 'Food log entries; athlete writes, coach reads from the join day.';

create table public.my_foods (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

comment on table public.my_foods is 'Foods the athlete created; athlete only.';

create trigger workouts_check before insert
or
update on public.workouts for each row
execute function public.athlete_owned_check ();

create trigger routines_check before insert
or
update on public.routines for each row
execute function public.athlete_owned_check ();

create trigger food_logs_check before insert
or
update on public.food_logs for each row
execute function public.athlete_owned_check ();

create trigger my_foods_check before insert
or
update on public.my_foods for each row
execute function public.athlete_owned_check ();

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.workouts enable row level security;

alter table public.routines enable row level security;

alter table public.food_logs enable row level security;

alter table public.my_foods enable row level security;

create policy workouts_select on public.workouts for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read (athlete_id, at)
  );

create policy workouts_write on public.workouts for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

create policy routines_select on public.routines for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy routines_write on public.routines for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

create policy food_logs_select on public.food_logs for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read_day (athlete_id, day)
  );

create policy food_logs_write on public.food_logs for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

create policy my_foods_all on public.my_foods for all to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------------------------

revoke all on public.workouts,
public.routines,
public.food_logs,
public.my_foods
from
  anon,
  authenticated;

grant
select
,
  insert (athlete_id, id, at, payload),
update (at, payload),
delete on public.workouts to authenticated;

grant
select
,
  insert (athlete_id, id, payload),
update (payload),
delete on public.routines to authenticated;

grant
select
,
  insert (athlete_id, id, day, payload),
update (day, payload),
delete on public.food_logs to authenticated;

grant
select
,
  insert (athlete_id, id, payload),
update (payload),
delete on public.my_foods to authenticated;

revoke all on function public.coach_can_read_day (uuid, date),
public.athlete_owned_check ()
from
  public,
  anon;

grant
execute on function public.coach_can_read_day (uuid, date) to authenticated;
