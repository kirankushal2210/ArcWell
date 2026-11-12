-- Phase 1 foundations: accounts, roles, consent and the coach–client link.
--
-- profiles       One row per account. The role (athlete or coach) is chosen before sign-up and
--                fixed after (D44): users may change their display name, never their role.
-- consents       Append-only consent record (DPDP). Withdrawal is a new row with granted = false;
--                the latest row per purpose wins. Only the user sees their own consents.
-- coach_clients  Who coaches whom, from when, until when. One active coach per athlete. Rows are
--                created by the invite flow (Phase 2, service role) and ended through
--                end_coaching(); the athlete may open earlier history with set_history_access().
--
-- coach_can_read(client, at) is the single rule every client-data table uses in its policies:
-- a coach reads a row only while linked, and only if the row is dated on or after the join date
-- (or the earlier date the athlete granted). Ending the link ends access at once.

-- ---------------------------------------------------------------------------------------------
-- Types and tables
-- ---------------------------------------------------------------------------------------------

create type public.app_role as enum ('athlete', 'coach');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  display_name text check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per account; role fixed after sign-up (D44).';

create table public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  purpose text not null check (purpose in ('health_data', 'ai', 'photos')),
  granted boolean not null,
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  created_at timestamptz not null default now()
);

comment on table public.consents is 'Append-only consent log (DPDP); latest row per purpose wins.';

create index consents_user_purpose_idx on public.consents (user_id, purpose, created_at desc);

create table public.coach_clients (
  id uuid primary key default gen_random_uuid (),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  -- Earliest moment the coach may read; null means the join date. Set only by the athlete.
  history_from timestamptz,
  ended_at timestamptz,
  end_reason text check (end_reason in ('left', 'completed', 'removed', 'account_deleted')),
  created_at timestamptz not null default now(),
  check (coach_id <> client_id),
  check (history_from is null or history_from <= joined_at),
  check ((ended_at is null) = (end_reason is null)),
  check (ended_at is null or ended_at >= joined_at)
);

comment on table public.coach_clients is 'Coach–athlete links; access only while ended_at is null.';

-- One coach per athlete at a time (SPEC: relationships).
create unique index coach_clients_one_active_idx on public.coach_clients (client_id)
where
  ended_at is null;

create index coach_clients_coach_active_idx on public.coach_clients (coach_id)
where
  ended_at is null;

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

create function public.touch_updated_at () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before
update on public.profiles for each row
execute function public.touch_updated_at ();

-- A link always joins a coach account to an athlete account.
create function public.check_coach_client_roles () returns trigger language plpgsql
set
  search_path = '' as $$
begin
  if (select role from public.profiles where id = new.coach_id) is distinct from 'coach' then
    raise exception 'coach_id must be a coach account' using errcode = '23514';
  end if;
  if (select role from public.profiles where id = new.client_id) is distinct from 'athlete' then
    raise exception 'client_id must be an athlete account' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger coach_clients_check_roles before insert
or
update of coach_id,
client_id on public.coach_clients for each row
execute function public.check_coach_client_roles ();

-- ---------------------------------------------------------------------------------------------
-- Access helpers (security definer so policies can read links without RLS recursion)
-- ---------------------------------------------------------------------------------------------

-- True while the signed-in user actively coaches this athlete.
create function public.is_active_coach_of (client uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = (select auth.uid()) and client_id = client and ended_at is null
  );
$$;

-- True while this coach actively coaches the signed-in user.
create function public.is_active_client_of (coach uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select exists (
    select 1 from public.coach_clients
    where client_id = (select auth.uid()) and coach_id = coach and ended_at is null
  );
$$;

-- The rule for every client-data row: linked now, and the row dates from the join date (or the
-- earlier date the athlete granted).
create function public.coach_can_read (client uuid, at timestamptz) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = (select auth.uid())
      and client_id = client
      and ended_at is null
      and at >= coalesce(history_from, joined_at)
  );
$$;

-- Latest consent for a purpose for the signed-in user (false when never given).
create function public.has_consent (p text) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select coalesce((
    select granted from public.consents
    where user_id = (select auth.uid()) and purpose = p
    order by created_at desc, id desc
    limit 1
  ), false);
$$;

-- ---------------------------------------------------------------------------------------------
-- Link actions
-- ---------------------------------------------------------------------------------------------

-- The athlete leaves ('left'); the coach marks the client completed or removes them. Access ends
-- immediately; nothing is deleted.
create function public.end_coaching (link uuid, reason text) returns void language plpgsql security definer
set
  search_path = '' as $$
declare
  l public.coach_clients;
  me uuid := (select auth.uid());
begin
  select * into l from public.coach_clients where id = link and ended_at is null for update;
  if not found
    or not (
      (l.client_id = me and reason = 'left')
      or (l.coach_id = me and reason in ('completed', 'removed'))
    )
  then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  update public.coach_clients
  set ended_at = greatest(now(), l.joined_at), end_reason = reason
  where id = link;
end;
$$;

-- The athlete opens history from an earlier date (or null to go back to the join date).
create function public.set_history_access (link uuid, from_at timestamptz) returns void language plpgsql security definer
set
  search_path = '' as $$
declare
  l public.coach_clients;
begin
  select * into l from public.coach_clients where id = link and ended_at is null for update;
  if not found or l.client_id <> (select auth.uid()) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  update public.coach_clients
  set history_from = case when from_at is null then null else least(from_at, l.joined_at) end
  where id = link;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.profiles enable row level security;

alter table public.consents enable row level security;

alter table public.coach_clients enable row level security;

-- profiles: yourself, your active clients, your active coach.
create policy profiles_select on public.profiles for
select
  to authenticated using (
    id = (select auth.uid())
    or public.is_active_coach_of (id)
    or public.is_active_client_of (id)
  );

create policy profiles_insert on public.profiles for insert to authenticated
with
  check (id = (select auth.uid()));

create policy profiles_update on public.profiles
for update
  to authenticated using (id = (select auth.uid()))
with
  check (id = (select auth.uid()));

-- consents: your own only; no updates or deletes (append-only).
create policy consents_select on public.consents for
select
  to authenticated using (user_id = (select auth.uid()));

create policy consents_insert on public.consents for insert to authenticated
with
  check (user_id = (select auth.uid()));

-- coach_clients: both sides see their own links (including ended ones); changes go through the
-- functions above or the service role.
create policy coach_clients_select on public.coach_clients for
select
  to authenticated using (
    coach_id = (select auth.uid())
    or client_id = (select auth.uid())
  );

-- ---------------------------------------------------------------------------------------------
-- Privileges: least privilege on top of RLS
-- ---------------------------------------------------------------------------------------------

revoke all on public.profiles, public.consents, public.coach_clients from anon, authenticated;

grant select on public.profiles to authenticated;

grant insert (id, role, display_name) on public.profiles to authenticated;

-- Role is fixed after sign-up: only the display name can change.
grant
update (display_name) on public.profiles to authenticated;

grant select on public.consents to authenticated;

grant insert (user_id, purpose, granted, policy_version) on public.consents to authenticated;

grant select on public.coach_clients to authenticated;

revoke all on function public.is_active_coach_of (uuid),
public.is_active_client_of (uuid),
public.coach_can_read (uuid, timestamptz),
public.has_consent (text),
public.end_coaching (uuid, text),
public.set_history_access (uuid, timestamptz),
public.touch_updated_at (),
public.check_coach_client_roles ()
from
  public,
  anon;

grant
execute on function public.is_active_coach_of (uuid),
public.is_active_client_of (uuid),
public.coach_can_read (uuid, timestamptz),
public.has_consent (text),
public.end_coaching (uuid, text),
public.set_history_access (uuid, timestamptz) to authenticated;
