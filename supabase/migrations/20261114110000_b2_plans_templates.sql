-- B2: plans and the coach's library.
--
-- plans             One row per athlete and kind: training, nutrition, recovery, supplements, and
--                   meta (plan names, check-in day, status note). The current coach writes them; a
--                   self-guided athlete (no current coach) writes their own. Both read.
-- enhanced          Competitive bodybuilders' Enhanced record (D64). The coach may only ask until the
--                   athlete says yes; after that the coach records. The athlete alone sets consent.
-- templates         The coach's training and meal templates and supplement stacks. Coach only.
-- leads             The coach's CRM pipeline (D63, D66). Coach only.
-- custom_exercises  Exercises someone added to the library. The owner writes; their current coach or
--                   current clients read, so programs and logs that name them still show.
--
-- Also: personal invites hand over what the coach prepared. invite_details() shows the invited
-- athlete their details after sign-in, and redeem_invite() now copies the coach's plans and notes.

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.plans (
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('training', 'nutrition', 'recovery', 'supplements', 'meta')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_by uuid default auth.uid () references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (athlete_id, kind)
);

comment on table public.plans is 'An athlete''s plans; the current coach (or the self-guided athlete) writes.';

create table public.enhanced (
  athlete_id uuid primary key references public.profiles (id) on delete cascade,
  consent_at timestamptz,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

comment on table public.enhanced is 'Enhanced record (D64); coach records only after the athlete''s consent.';

create table public.templates (
  coach_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  kind text not null check (kind in ('training', 'meals', 'stack')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (coach_id, id)
);

comment on table public.templates is 'Coach templates and supplement stacks; coach only.';

create table public.leads (
  coach_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (coach_id, id)
);

comment on table public.leads is 'Coach CRM leads; coach only.';

create table public.custom_exercises (
  owner_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

comment on table public.custom_exercises is 'Custom exercises; owner writes, current coach or clients read.';

-- ---------------------------------------------------------------------------------------------
-- Helpers and triggers
-- ---------------------------------------------------------------------------------------------

-- Who may change an athlete's plans: their current coach, or the athlete while self-guided.
create function public.can_write_plans (athlete uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select
    public.is_active_coach_of (athlete)
    or (
      athlete = (select auth.uid())
      and (select role from public.profiles where id = athlete) = 'athlete'
      and not exists (
        select 1 from public.coach_clients where client_id = athlete and ended_at is null
      )
    );
$$;

create function public.plans_stamp () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  perform public.check_role (new.athlete_id, 'athlete');
  new.updated_by := (select auth.uid());
  new.updated_at := now();
  return new;
end;
$$;

create trigger plans_stamp before insert
or
update on public.plans for each row
execute function public.plans_stamp ();

-- Enhanced: only the athlete sets or clears consent. Before consent the coach may only ask
-- (payload.requestedAt); after it the coach may record.
create function public.enhanced_guard () returns trigger language plpgsql
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  before_consent timestamptz := case when tg_op = 'UPDATE' then old.consent_at end;
  before_payload jsonb := case when tg_op = 'UPDATE' then old.payload else '{}'::jsonb end;
begin
  perform public.check_role (new.athlete_id, 'athlete');
  if me is distinct from new.athlete_id then
    if new.consent_at is distinct from before_consent then
      raise exception 'only the athlete gives or withdraws consent' using errcode = '42501';
    end if;
    if before_consent is null
      and (new.payload - 'requestedAt') is distinct from (before_payload - 'requestedAt')
    then
      raise exception 'nothing is recorded before the athlete says yes' using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger enhanced_guard before insert
or
update on public.enhanced for each row
execute function public.enhanced_guard ();

create function public.coach_owned_check () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  perform public.check_role (new.coach_id, 'coach');
  new.updated_at := now();
  return new;
end;
$$;

create trigger templates_check before insert
or
update on public.templates for each row
execute function public.coach_owned_check ();

create trigger leads_check before insert
or
update on public.leads for each row
execute function public.coach_owned_check ();

create trigger custom_exercises_touch before
update on public.custom_exercises for each row
execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------------------------
-- Personal invites hand over what the coach prepared (D56)
-- ---------------------------------------------------------------------------------------------

-- After sign-in, the invited athlete sees the details the coach entered, to confirm them.
create function public.invite_details (p_code text) returns jsonb language sql stable security definer
set
  search_path = '' as $$
  select jsonb_build_object(
    'coach_name', p.display_name,
    'kind', i.kind,
    'client_name', i.client_name,
    'basics', i.payload -> 'basics',
    'plans', (select coalesce(jsonb_agg(k), '[]'::jsonb) from jsonb_object_keys(coalesce(i.payload -> 'plans', '{}'::jsonb)) k)
  )
  from public.invites i
  join public.profiles p on p.id = i.coach_id
  where i.code = upper(trim(p_code))
    and public.invite_usable (i)
    and (select role from public.profiles where id = (select auth.uid())) = 'athlete';
$$;

create or replace function public.redeem_invite (p_code text) returns uuid language plpgsql security definer
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  i public.invites;
  link uuid;
  k text;
  v jsonb;
begin
  if (select role from public.profiles where id = me) is distinct from 'athlete' then
    raise exception 'only athlete accounts can join a coach' using errcode = '42501';
  end if;
  select * into i from public.invites where code = upper(trim(p_code)) for update;
  if not found or not public.invite_usable (i) then
    raise exception 'invite not valid' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.coach_clients where client_id = me and ended_at is null) then
    raise exception 'already coached' using errcode = '23505';
  end if;
  insert into public.coach_clients (coach_id, client_id) values (i.coach_id, me) returning id into link;
  if i.kind = 'personal' then
    update public.invites set used_by = me, used_at = now() where id = i.id;
    -- The coach's plans replace the athlete's active guidance (SPEC: joining a coach).
    for k, v in select * from jsonb_each(coalesce(i.payload -> 'plans', '{}'::jsonb)) loop
      if k in ('training', 'nutrition', 'recovery', 'supplements', 'meta') and jsonb_typeof(v) = 'object' then
        insert into public.plans (athlete_id, kind, payload)
        values (me, k, v)
        on conflict (athlete_id, kind) do update set payload = excluded.payload;
      end if;
    end loop;
    if jsonb_typeof(i.payload -> 'notes') = 'object' then
      insert into public.coach_client_notes (coach_id, client_id, payload)
      values (i.coach_id, me, i.payload -> 'notes')
      on conflict (coach_id, client_id) do update set payload = excluded.payload;
    end if;
  end if;
  return link;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.plans enable row level security;

alter table public.enhanced enable row level security;

alter table public.templates enable row level security;

alter table public.leads enable row level security;

alter table public.custom_exercises enable row level security;

create policy plans_select on public.plans for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy plans_insert on public.plans for insert to authenticated
with
  check (public.can_write_plans (athlete_id));

create policy plans_update on public.plans
for update
  to authenticated using (public.can_write_plans (athlete_id))
with
  check (public.can_write_plans (athlete_id));

create policy plans_delete on public.plans for delete to authenticated using (public.can_write_plans (athlete_id));

create policy enhanced_select on public.enhanced for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy enhanced_insert on public.enhanced for insert to authenticated
with
  check (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy enhanced_update on public.enhanced
for update
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  )
with
  check (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy enhanced_delete on public.enhanced for delete to authenticated using (athlete_id = (select auth.uid()));

create policy templates_all on public.templates for all to authenticated using (coach_id = (select auth.uid()))
with
  check (coach_id = (select auth.uid()));

create policy leads_all on public.leads for all to authenticated using (coach_id = (select auth.uid()))
with
  check (coach_id = (select auth.uid()));

create policy custom_exercises_select on public.custom_exercises for
select
  to authenticated using (
    owner_id = (select auth.uid())
    or public.is_active_client_of (owner_id)
    or public.is_active_coach_of (owner_id)
  );

create policy custom_exercises_write on public.custom_exercises for all to authenticated using (owner_id = (select auth.uid()))
with
  check (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------------------------

revoke all on public.plans,
public.enhanced,
public.templates,
public.leads,
public.custom_exercises
from
  anon,
  authenticated;

grant
select
,
  insert (athlete_id, kind, payload),
update (payload),
delete on public.plans to authenticated;

grant
select
,
  insert (athlete_id, consent_at, payload),
update (consent_at, payload),
delete on public.enhanced to authenticated;

grant
select
,
  insert (coach_id, id, kind, payload),
update (kind, payload),
delete on public.templates to authenticated;

grant
select
,
  insert (coach_id, id, payload),
update (payload),
delete on public.leads to authenticated;

grant
select
,
  insert (owner_id, id, payload),
update (payload),
delete on public.custom_exercises to authenticated;

revoke all on function public.can_write_plans (uuid),
public.plans_stamp (),
public.enhanced_guard (),
public.coach_owned_check (),
public.invite_details (text)
from
  public,
  anon;

grant
execute on function public.can_write_plans (uuid),
public.invite_details (text) to authenticated;

-- The invite page opens before sign-up: anyone holding a code may see the coach's name and
-- profile (never the invited client's details, which need sign-in through invite_details()).
grant
execute on function public.invite_preview (text),
public.invite_coach_profile (text) to anon;
