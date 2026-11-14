-- B7: billing and entitlements, enforced on the server.
--
-- subscriptions   Arcwell Plus per athlete (tier free or pro), now with where it came from and when it
--                 ends. Written only by the revenuecat-webhook Edge Function (service role).
-- coach_billing   The coach's Arcwell plan (D40, D41): status active, grace or lapsed, and the client
--                 limit. Written only by the razorpay-webhook Edge Function (service role). No row
--                 means a coach on the free beta: active, default limit.
-- athlete_tier()  coached, pro or free for the signed-in athlete, from the database alone: coached
--                 while linked to a coach (who never get AI, D44), else pro while Plus is current.
-- Limits          A lapsed coach can't invite or change plans (D41); a coach at their limit can't take
--                 new clients (D40); existing clients are never affected.

alter table public.subscriptions
add column source text not null default 'none' check (source in ('none', 'play', 'promo', 'trial')),
add column product_id text check (char_length(product_id) <= 120),
add column expires_at timestamptz,
add column last_event_at timestamptz;

create table public.coach_billing (
  coach_id uuid primary key references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'grace', 'lapsed')),
  client_limit integer not null default 40 check (client_limit between 0 and 1000),
  plan text check (char_length(plan) <= 60),
  razorpay_subscription_id text unique check (char_length(razorpay_subscription_id) <= 80),
  current_period_end timestamptz,
  last_event_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.coach_billing is 'Coach plan status and client limit; written by billing only.';

create trigger coach_billing_touch before
update on public.coach_billing for each row
execute function public.touch_updated_at ();

alter table public.coach_billing enable row level security;

create policy coach_billing_select on public.coach_billing for
select
  to authenticated using (coach_id = (select auth.uid()));

revoke all on public.coach_billing from anon, authenticated;

grant select on public.coach_billing to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Entitlements
-- ---------------------------------------------------------------------------------------------

create function public.plus_current (uid uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid and s.tier = 'pro' and (s.expires_at is null or s.expires_at > now())
  );
$$;

create function public.athlete_tier () returns text language sql stable security definer
set
  search_path = '' as $$
  select case
    when exists (
      select 1 from public.coach_clients
      where client_id = (select auth.uid()) and ended_at is null
    ) then 'coached'
    when public.plus_current ((select auth.uid())) then 'pro'
    else 'free'
  end;
$$;

-- A coach may invite and change plans unless their plan has lapsed (D41).
create function public.coach_in_good_standing (coach uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select coalesce((select status <> 'lapsed' from public.coach_billing where coach_id = coach), true);
$$;

create function public.coach_has_room (coach uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select (
    select count(*) from public.coach_clients where coach_id = coach and ended_at is null
  ) < coalesce((select client_limit from public.coach_billing where coach_id = coach), 40);
$$;

-- AI needs Plus that is still current (it already required pro, consent and no coach).
create or replace function public.ai_entitled () returns boolean language sql stable security definer
set
  search_path = '' as $$
  select
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'athlete'
    )
    and public.plus_current ((select auth.uid()))
    and public.has_consent ('ai')
    and not exists (
      select 1 from public.coach_clients cc
      where cc.client_id = (select auth.uid()) and cc.ended_at is null
    );
$$;

-- Plans: the coach must be in good standing to change them.
create or replace function public.can_write_plans (athlete uuid) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select
    (
      public.is_active_coach_of (athlete)
      and public.coach_in_good_standing ((select auth.uid()))
    )
    or (
      athlete = (select auth.uid())
      and (select role from public.profiles where id = athlete) = 'athlete'
      and not exists (
        select 1 from public.coach_clients where client_id = athlete and ended_at is null
      )
    );
$$;

-- Invites: a lapsed coach can't create them.
create policy invites_insert_standing on public.invites as restrictive for insert to authenticated
with
  check (public.coach_in_good_standing ((select auth.uid())));

-- Joining checks the coach's standing and room (D40, D41), then hands over the personal invite.
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
  if not public.coach_in_good_standing (i.coach_id) or not public.coach_has_room (i.coach_id) then
    raise exception 'coach not taking clients' using errcode = '53400';
  end if;
  insert into public.coach_clients (coach_id, client_id) values (i.coach_id, me) returning id into link;
  if i.kind = 'personal' then
    update public.invites set used_by = me, used_at = now() where id = i.id;
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

-- The invite page says when a coach isn't taking new clients (D40).
create function public.invite_open (p_code text) returns boolean language sql stable security definer
set
  search_path = '' as $$
  select public.coach_in_good_standing (i.coach_id) and public.coach_has_room (i.coach_id)
  from public.invites i
  where i.code = upper(trim(p_code)) and public.invite_usable (i);
$$;

revoke all on function public.plus_current (uuid),
public.athlete_tier (),
public.coach_in_good_standing (uuid),
public.coach_has_room (uuid),
public.invite_open (text)
from
  public,
  anon;

grant
execute on function public.athlete_tier (),
public.coach_in_good_standing (uuid),
public.invite_open (text) to authenticated;

grant
execute on function public.invite_open (text) to anon;
