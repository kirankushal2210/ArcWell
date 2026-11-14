-- Scheduled jobs and rate limits (D111; tickets D-04, S-01, S-03).
--
-- reminder_sends      One row per reminder actually sent (user, kind, local day), so a job that runs
--                     twice never sends the same reminder twice. Holds no health data. Cleared after
--                     30 days.
-- call_usage          Calls per user, function and UTC day for the non-AI functions (notify,
--                     delete-account), written only through call_try_use(). Same shape as ai_usage.
-- claim_reminders()   The reminders due in this 15-minute slot (India time), honouring the athlete's
--                     notification switches and reminder times. Records each one as sent and returns
--                     only new ones. Service role only: the `cron` Edge Function calls it.
-- purge_expired()     The retention job the Privacy Policy promises: counters and send logs older
--                     than 30 days, unused invites 30 days after they expired or were withdrawn, and
--                     the copied client details on used invites after 30 days.
-- run_cron_call(job)  Calls the `cron` Edge Function from pg_cron through pg_net. The function URL and
--                     the shared secret are read from Vault (`project_url`, `cron_secret`); with either
--                     missing it does nothing, so local and fresh projects are safe by default.
--
-- Account deletion itself is immediate (delete-account; every table cascades). The purge job is the
-- safety net for anything left behind, and the storage sweep runs in the `cron` function because
-- files must be removed through the Storage API, not by deleting rows.
-- ---------------------------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------------------------
create extension if not exists pg_cron;

create extension if not exists pg_net
with
  schema extensions;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------
create table public.reminder_sends (
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('workout', 'check_in')),
  day date not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, kind, day)
);

comment on table public.reminder_sends is 'Scheduled reminders already sent, per user, kind and India-time day.';

alter table public.reminder_sends enable row level security;

create policy reminder_sends_select on public.reminder_sends for
select
  to authenticated using (user_id = (select auth.uid()));

-- Keyed to the auth user, not the profile: someone who signed up but hasn't finished onboarding can
-- still delete their account.
create table public.call_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  fn text not null check (fn ~ '^[a-z_]{2,40}$'),
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day, fn)
);

comment on table public.call_usage is 'Non-AI function calls per user, function and UTC day; written via call_try_use().';

alter table public.call_usage enable row level security;

create policy call_usage_select on public.call_usage for
select
  to authenticated using (user_id = (select auth.uid()));

revoke all on public.reminder_sends,
public.call_usage
from
  anon,
  authenticated;

grant
select
  on public.reminder_sends,
  public.call_usage to authenticated;

-- The primary keys lead with user_id, so both foreign keys are already indexed.
-- ---------------------------------------------------------------------------------------------
-- Rate limit for non-AI functions (S-01)
-- ---------------------------------------------------------------------------------------------
create function public.call_try_use (p_fn text, p_cap integer) returns boolean language plpgsql security definer
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  used integer;
begin
  if me is null then
    return false;
  end if;
  if p_cap is null or p_cap < 1 or p_cap > 1000 then
    raise exception 'cap out of range' using errcode = '22023';
  end if;
  insert into public.call_usage (user_id, fn, count)
  values (me, p_fn, 0)
  on conflict (user_id, day, fn) do nothing;
  update public.call_usage
  set count = count + 1
  where user_id = me
    and day = (now() at time zone 'utc')::date
    and fn = p_fn
    and count < p_cap
  returning count into used;
  return used is not null;
end;
$$;

revoke all on function public.call_try_use (text, integer)
from
  public,
  anon;

grant
execute on function public.call_try_use (text, integer) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Scheduled reminders (D-04)
-- ---------------------------------------------------------------------------------------------
-- Workout: athletes whose "Daily workout reminder" switch and reminder are on (defaults: on, 18:00),
-- in the slot of their reminder time, who haven't logged a workout today.
-- Check-in: coached athletes whose "Check-in reminders" switch is on, on their check-in day (from the
-- coach's plan details, default Monday) at 09:00, with no check-in in the last 6 days.
-- Paused clients get neither (D39). Only people with a registered phone are considered.
create function public.claim_reminders (p_now timestamptz default now()) returns table (user_id uuid, kind text) language sql volatile
set
  search_path = '' as $$
  with t as (
    select
      (p_now at time zone 'Asia/Kolkata') as l
  ),
  slot as (
    select
      l,
      l::date as d,
      ((extract(hour from l) * 60 + extract(minute from l))::int / 15) as s,
      to_char(l, 'FMDay') as wd
    from t
  ),
  people as (
    select
      p.id,
      coalesce(ap.payload -> 'athleteSettings', '{}'::jsonb) as st,
      cc.coach_id,
      coalesce(m.payload, '{}'::jsonb) as meta
    from public.profiles p
    left join public.athlete_profiles ap on ap.athlete_id = p.id
    left join public.coach_clients cc on cc.client_id = p.id and cc.ended_at is null
    left join public.plans m on m.athlete_id = p.id and m.kind = 'meta' and cc.coach_id is not null
    where p.role = 'athlete'
      and exists (select 1 from public.push_tokens pt where pt.user_id = p.id)
  ),
  due as (
    select
      pe.id as user_id,
      'workout'::text as kind
    from people pe, slot
    where pe.st -> 'notify' -> 'workout' is distinct from 'false'::jsonb
      and pe.st -> 'reminders' -> 'workout' -> 'on' is distinct from 'false'::jsonb
      and (
        case
          when jsonb_typeof(pe.st -> 'reminders' -> 'workout' -> 'at') = 'number'
            then (pe.st -> 'reminders' -> 'workout' ->> 'at')::numeric::int
          else 18 * 60
        end
      ) / 15 = slot.s
      and pe.meta ->> 'status' is distinct from 'paused'
      and not exists (
        select 1 from public.workouts w
        where w.athlete_id = pe.id
          and (w.at at time zone 'Asia/Kolkata')::date = slot.d
      )
    union all
    select
      pe.id,
      'check_in'
    from people pe, slot
    where pe.coach_id is not null
      and pe.st -> 'notify' -> 'checkIns' is distinct from 'false'::jsonb
      and slot.s = (9 * 60) / 15
      and coalesce(pe.meta ->> 'checkInDay', 'Monday') = slot.wd
      and pe.meta ->> 'status' is distinct from 'paused'
      and not exists (
        select 1 from public.check_ins k
        where k.athlete_id = pe.id
          and (k.at at time zone 'Asia/Kolkata')::date > slot.d - 7
      )
  )
  insert into public.reminder_sends (user_id, kind, day)
  select due.user_id, due.kind, slot.d from due, slot
  on conflict do nothing
  returning reminder_sends.user_id, reminder_sends.kind;
$$;

revoke all on function public.claim_reminders (timestamptz)
from
  public,
  anon,
  authenticated;

grant
execute on function public.claim_reminders (timestamptz) to service_role;

-- ---------------------------------------------------------------------------------------------
-- Retention purge (S-03)
-- ---------------------------------------------------------------------------------------------
create function public.purge_expired (p_now timestamptz default now()) returns jsonb language plpgsql volatile
set
  search_path = '' as $$
declare
  cutoff date := (p_now at time zone 'utc')::date - 30;
  n_ai integer;
  n_calls integer;
  n_sends integer;
  n_invites integer;
  n_payloads integer;
begin
  delete from public.ai_usage where day < cutoff;
  get diagnostics n_ai = row_count;
  delete from public.call_usage where day < cutoff;
  get diagnostics n_calls = row_count;
  delete from public.reminder_sends where day < cutoff;
  get diagnostics n_sends = row_count;
  delete from public.invites
  where used_by is null
    and (expires_at < p_now - interval '30 days' or revoked_at < p_now - interval '30 days');
  get diagnostics n_invites = row_count;
  -- The client details a personal invite carried were copied to the athlete when it was used.
  update public.invites set payload = '{}'::jsonb
  where used_at < p_now - interval '30 days' and payload <> '{}'::jsonb;
  get diagnostics n_payloads = row_count;
  return jsonb_build_object(
    'ai_usage', n_ai,
    'call_usage', n_calls,
    'reminder_sends', n_sends,
    'invites', n_invites,
    'invite_payloads', n_payloads
  );
end;
$$;

revoke all on function public.purge_expired (timestamptz)
from
  public,
  anon,
  authenticated;

grant
execute on function public.purge_expired (timestamptz) to service_role;

-- ---------------------------------------------------------------------------------------------
-- pg_cron → cron Edge Function
-- ---------------------------------------------------------------------------------------------
create function public.run_cron_call (p_job text) returns bigint language plpgsql security definer
set
  search_path = '' as $$
declare
  base text;
  secret text;
begin
  if p_job not in ('reminders', 'purge') then
    raise exception 'unknown job' using errcode = '22023';
  end if;
  select decrypted_secret into base from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'cron_secret';
  if base is null or secret is null then
    return null;
  end if;
  return net.http_post(
    url := rtrim(base, '/') || '/functions/v1/cron',
    body := jsonb_build_object('job', p_job),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function public.run_cron_call (text)
from
  public,
  anon,
  authenticated;

-- Every 15 minutes: reminders. Daily at 03:00 India time (21:30 UTC): purge, then the storage sweep.
select
  cron.schedule (
    'arcwell-reminders',
    '*/15 * * * *',
    $$select public.run_cron_call('reminders')$$
  );

select
  cron.schedule (
    'arcwell-purge',
    '30 21 * * *',
    $$select public.purge_expired(); select public.run_cron_call('purge')$$
  );
