-- AI entitlement and daily cap (D44, D96). AGENTS.md: check entitlement and the daily cap
-- server-side before every AI call.
--
-- subscriptions  The account's plan: free or pro (Arcwell Plus). Written only by billing (service
--                role); the user reads their own row. No row means free.
-- ai_usage       How many times a user used each AI feature on a day (UTC). Read your own; written
--                only through ai_try_use().
--
-- ai_entitled()        True for an athlete on pro, with AI consent, and no active coach: coached
--                      athletes never get AI (D44).
-- ai_try_use(f, cap)   Counts one use of feature f today if entitled and under the cap; returns
--                      whether the call may go ahead.

create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Plan per account (free or pro); written by billing only.';

create trigger subscriptions_touch before
update on public.subscriptions for each row
execute function public.touch_updated_at ();

alter table public.subscriptions enable row level security;

create policy subscriptions_select on public.subscriptions for
select
  to authenticated using (user_id = (select auth.uid()));

create table public.ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  feature text not null check (feature ~ '^[a-z_]{2,40}$'),
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day, feature)
);

comment on table public.ai_usage is 'AI uses per user, feature and UTC day; written via ai_try_use().';

alter table public.ai_usage enable row level security;

create policy ai_usage_select on public.ai_usage for
select
  to authenticated using (user_id = (select auth.uid()));

create function public.ai_entitled () returns boolean language sql stable security definer
set
  search_path = '' as $$
  select
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'athlete'
    )
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = (select auth.uid()) and s.tier = 'pro'
    )
    and public.has_consent ('ai')
    and not exists (
      select 1 from public.coach_clients cc
      where cc.client_id = (select auth.uid()) and cc.ended_at is null
    );
$$;

create function public.ai_try_use (p_feature text, p_cap integer) returns boolean language plpgsql security definer
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  used integer;
begin
  if me is null or not public.ai_entitled () then
    return false;
  end if;
  if p_cap is null or p_cap < 1 or p_cap > 200 then
    raise exception 'cap out of range' using errcode = '22023';
  end if;
  insert into public.ai_usage (user_id, feature, count)
  values (me, p_feature, 0)
  on conflict (user_id, day, feature) do nothing;
  update public.ai_usage
  set count = count + 1
  where user_id = me
    and day = (now() at time zone 'utc')::date
    and feature = p_feature
    and count < p_cap
  returning count into used;
  return used is not null;
end;
$$;

revoke all on public.subscriptions, public.ai_usage from anon, authenticated;

grant select on public.subscriptions, public.ai_usage to authenticated;

revoke all on function public.ai_entitled (),
public.ai_try_use (text, integer)
from
  public,
  anon;

grant
execute on function public.ai_entitled (),
public.ai_try_use (text, integer) to authenticated;
