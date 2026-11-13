-- B1 (D73): invites and athlete preferences.
--
-- invites              A coach's general invite link (reusable, no expiry) or a personal invite for
--                      one client (single-use, expires; D56). Only the coach sees their invites.
--                      Athletes never read the table: they preview and redeem by code through the
--                      functions below, which reveal only the coach's display name.
-- athlete_preferences  What Arcwell shows (D78): opt-in modules, cardio machines and days (D79),
--                      and the daily habit-reminder budget (D77). Only the athlete writes it; their
--                      current coach can read it, so plans respect it; access ends with the link.

-- ---------------------------------------------------------------------------------------------
-- Invites
-- ---------------------------------------------------------------------------------------------

create table public.invites (
  id uuid primary key default gen_random_uuid (),
  coach_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('general', 'personal')),
  -- 8 characters, easy to read out and type; unique across all invites.
  code text not null unique default upper(substr(replace(gen_random_uuid ()::text, '-', ''), 1, 8)) check (code ~ '^[A-Z0-9]{6,12}$'),
  -- Personal invites name the client the coach is expecting.
  client_name text check (char_length(client_name) between 1 and 80),
  expires_at timestamptz,
  used_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (kind = 'general' or expires_at is not null),
  check (kind = 'personal' or (used_by is null and used_at is null)),
  check ((used_by is null) = (used_at is null))
);

comment on table public.invites is 'Coach invites: general (reusable) or personal (single-use, expiring).';

create index invites_coach_idx on public.invites (coach_id, created_at desc);

-- Personal invites expire after 14 days unless the coach sets otherwise.
create function public.invites_defaults () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  if new.kind = 'personal' and new.expires_at is null then
    new.expires_at := now() + interval '14 days';
  end if;
  if (select role from public.profiles where id = new.coach_id) is distinct from 'coach' then
    raise exception 'only coach accounts create invites' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger invites_defaults before insert on public.invites for each row
execute function public.invites_defaults ();

-- Whether an invite can be used now (not revoked, not expired, personal not yet used).
create function public.invite_usable (i public.invites) returns boolean language sql stable
set
  search_path = '' as $$
  select i.revoked_at is null
    and (i.expires_at is null or i.expires_at > now())
    and (i.kind = 'general' or i.used_at is null);
$$;

-- What the join screen may show before redeeming: the coach's name and whether the code works.
create function public.invite_preview (p_code text) returns table (coach_name text, kind text, usable boolean) language sql stable security definer
set
  search_path = '' as $$
  select p.display_name, i.kind, public.invite_usable (i)
  from public.invites i
  join public.profiles p on p.id = i.coach_id
  where i.code = upper(trim(p_code));
$$;

-- An athlete joins the coach behind a code. One active coach at a time (SPEC): an athlete who
-- already has a coach must leave first (the switch flow ends the old link before redeeming).
create function public.redeem_invite (p_code text) returns uuid language plpgsql security definer
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  i public.invites;
  link uuid;
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
  end if;
  return link;
end;
$$;

alter table public.invites enable row level security;

create policy invites_select on public.invites for
select
  to authenticated using (coach_id = (select auth.uid()));

create policy invites_insert on public.invites for insert to authenticated
with
  check (coach_id = (select auth.uid()));

-- Coaches can revoke (and nothing else); used_by and used_at are set only by redeem_invite().
create policy invites_update on public.invites
for update
  to authenticated using (coach_id = (select auth.uid()))
with
  check (coach_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Athlete preferences (D78)
-- ---------------------------------------------------------------------------------------------

create table public.athlete_preferences (
  athlete_id uuid primary key default auth.uid () references public.profiles (id) on delete cascade,
  modules text[] not null default array['morning']::text[] check (
    modules <@ array[
      'morning',
      'cardio_fitness',
      'running',
      'daily_movement',
      'sleep_light',
      'calm',
      'food_habits',
      'mobility',
      'focus'
    ]::text[]
  ),
  cardio_modalities text[] not null default array['bike', 'rower']::text[] check (
    cardio_modalities <@ array['bike', 'rower', 'skierg', 'run', 'incline_walk', 'stairs', 'swim']::text[]
  ),
  -- Weekdays cardio may use, 0 = Monday; empty = any day.
  cardio_days smallint[] not null default '{}' check (cardio_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  hr_max_override smallint check (hr_max_override between 120 and 230),
  resting_hr smallint check (resting_hr between 30 and 120),
  habit_nudges smallint not null default 2 check (habit_nudges between 0 and 2),
  updated_at timestamptz not null default now()
);

comment on table public.athlete_preferences is 'What Arcwell shows (D78); athlete writes, linked coach reads.';

create function public.check_preferences_owner () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  if (select role from public.profiles where id = new.athlete_id) is distinct from 'athlete' then
    raise exception 'preferences belong to athlete accounts' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger athlete_preferences_owner before insert
or
update of athlete_id on public.athlete_preferences for each row
execute function public.check_preferences_owner ();

create trigger athlete_preferences_touch before
update on public.athlete_preferences for each row
execute function public.touch_updated_at ();

alter table public.athlete_preferences enable row level security;

create policy athlete_preferences_select on public.athlete_preferences for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy athlete_preferences_insert on public.athlete_preferences for insert to authenticated
with
  check (athlete_id = (select auth.uid()));

create policy athlete_preferences_update on public.athlete_preferences
for update
  to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------------------------

revoke all on public.invites, public.athlete_preferences from anon, authenticated;

grant select on public.invites to authenticated;

grant insert (kind, code, client_name, expires_at) on public.invites to authenticated;

grant
update (revoked_at) on public.invites to authenticated;

grant select on public.athlete_preferences to authenticated;

grant insert (
  athlete_id,
  modules,
  cardio_modalities,
  cardio_days,
  hr_max_override,
  resting_hr,
  habit_nudges
) on public.athlete_preferences to authenticated;

grant
update (
  modules,
  cardio_modalities,
  cardio_days,
  hr_max_override,
  resting_hr,
  habit_nudges
) on public.athlete_preferences to authenticated;

revoke all on function public.invites_defaults (),
public.invite_usable (public.invites),
public.invite_preview (text),
public.redeem_invite (text),
public.check_preferences_owner ()
from
  public,
  anon;

grant
execute on function public.invite_preview (text),
public.redeem_invite (text) to authenticated;
