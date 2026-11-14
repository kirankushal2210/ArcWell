-- B1 (continued): the athlete's and coach's own profile documents, the coach's private notes per
-- client, and personal invites that carry what the coach prepared (D56).
--
-- athlete_profiles     The athlete's details and settings (name, goal, answers, basics, units,
--                      notification switches). Written only by the athlete; read by their current
--                      coach. Dated logs never live here: they go in their own tables so the
--                      join-date rule (coach_can_read) applies to every one of them.
-- coach_profiles       The coach's public-facing profile and settings. Written by the coach; read by
--                      their current clients, and on the invite page through invite_coach_profile().
-- coach_client_notes   The coach's business record about a client (package, fees, notes, CRM).
--                      Only that coach ever reads or writes it; the athlete never sees it.
-- invites.payload      What a personal invite carries: the client's basics, the plans the coach built
--                      and the coach's notes. Coach-only (invites RLS); copied to the athlete when the
--                      invite is redeemed (redeem_invite, extended in B2).

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.athlete_profiles (
  athlete_id uuid primary key default auth.uid () references public.profiles (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

comment on table public.athlete_profiles is 'Athlete details and settings; athlete writes, current coach reads.';

create table public.coach_profiles (
  coach_id uuid primary key default auth.uid () references public.profiles (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

comment on table public.coach_profiles is 'Coach profile and settings; coach writes, current clients read.';

create table public.coach_client_notes (
  coach_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (coach_id, client_id)
);

comment on table public.coach_client_notes is 'A coach''s private business record about a client; coach only.';

alter table public.invites
add column payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object');

-- ---------------------------------------------------------------------------------------------
-- Triggers: role checks and updated_at
-- ---------------------------------------------------------------------------------------------

-- Security definer: a trigger must see the account's role even where RLS hides that profile from
-- the caller (otherwise the role check fails before the policy check can give the right error).
create function public.check_role (uid uuid, want public.app_role) returns void language plpgsql security definer
set
  search_path = '' as $$
begin
  if (select role from public.profiles where id = uid) is distinct from want then
    raise exception 'account must be a % account', want using errcode = '23514';
  end if;
end;
$$;

create function public.athlete_profiles_check () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  perform public.check_role (new.athlete_id, 'athlete');
  return new;
end;
$$;

create function public.coach_profiles_check () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  perform public.check_role (new.coach_id, 'coach');
  return new;
end;
$$;

create function public.coach_client_notes_check () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  perform public.check_role (new.coach_id, 'coach');
  -- Notes belong to a real coaching link (current or past).
  if not exists (
    select 1 from public.coach_clients
    where coach_id = new.coach_id and client_id = new.client_id
  ) then
    raise exception 'no coaching link with this client' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger athlete_profiles_check before insert
or
update of athlete_id on public.athlete_profiles for each row
execute function public.athlete_profiles_check ();

create trigger coach_profiles_check before insert
or
update of coach_id on public.coach_profiles for each row
execute function public.coach_profiles_check ();

create trigger coach_client_notes_check before insert
or
update of coach_id,
client_id on public.coach_client_notes for each row
execute function public.coach_client_notes_check ();

create trigger athlete_profiles_touch before
update on public.athlete_profiles for each row
execute function public.touch_updated_at ();

create trigger coach_profiles_touch before
update on public.coach_profiles for each row
execute function public.touch_updated_at ();

create trigger coach_client_notes_touch before
update on public.coach_client_notes for each row
execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------------------------
-- Invite page: the coach's profile for a valid code (D43: shown on the invite page)
-- ---------------------------------------------------------------------------------------------

create function public.invite_coach_profile (p_code text) returns jsonb language sql stable security definer
set
  search_path = '' as $$
  select coalesce(cp.payload, '{}'::jsonb) || jsonb_build_object('name', p.display_name)
  from public.invites i
  join public.profiles p on p.id = i.coach_id
  left join public.coach_profiles cp on cp.coach_id = i.coach_id
  where i.code = upper(trim(p_code)) and public.invite_usable (i);
$$;

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.athlete_profiles enable row level security;

alter table public.coach_profiles enable row level security;

alter table public.coach_client_notes enable row level security;

create policy athlete_profiles_select on public.athlete_profiles for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.is_active_coach_of (athlete_id)
  );

create policy athlete_profiles_insert on public.athlete_profiles for insert to authenticated
with
  check (athlete_id = (select auth.uid()));

create policy athlete_profiles_update on public.athlete_profiles
for update
  to authenticated using (athlete_id = (select auth.uid()))
with
  check (athlete_id = (select auth.uid()));

create policy coach_profiles_select on public.coach_profiles for
select
  to authenticated using (
    coach_id = (select auth.uid())
    or public.is_active_client_of (coach_id)
  );

create policy coach_profiles_insert on public.coach_profiles for insert to authenticated
with
  check (coach_id = (select auth.uid()));

create policy coach_profiles_update on public.coach_profiles
for update
  to authenticated using (coach_id = (select auth.uid()))
with
  check (coach_id = (select auth.uid()));

create policy coach_client_notes_all on public.coach_client_notes for all to authenticated using (coach_id = (select auth.uid()))
with
  check (coach_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------------------------

revoke all on public.athlete_profiles,
public.coach_profiles,
public.coach_client_notes
from
  anon,
  authenticated;

grant
select
,
  insert (athlete_id, payload),
update (payload) on public.athlete_profiles to authenticated;

grant
select
,
  insert (coach_id, payload),
update (payload) on public.coach_profiles to authenticated;

grant
select
,
  insert (coach_id, client_id, payload),
update (payload),
delete on public.coach_client_notes to authenticated;

grant insert (payload),
update (payload) on public.invites to authenticated;

revoke all on function public.check_role (uuid, public.app_role),
public.athlete_profiles_check (),
public.coach_profiles_check (),
public.coach_client_notes_check (),
public.invite_coach_profile (text)
from
  public,
  anon;

grant
execute on function public.invite_coach_profile (text) to authenticated;
