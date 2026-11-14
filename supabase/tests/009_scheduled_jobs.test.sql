-- Scheduled jobs and rate limits (D111): reminders honour the athlete's switches, reminder time,
-- paused status and what they've already logged, and never send twice; only the service role can
-- run the jobs; the per-user call cap stops at the cap and each person sees only their own counts;
-- the purge job removes what the Privacy Policy says and keeps everything recent.
begin;

select
  plan (19);

insert into
  auth.users (id, email)
values
  ('00000000-0000-0000-0000-0000000000c1', 'coach@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'a1@example.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'a2@example.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'a3@example.test'),
  ('00000000-0000-0000-0000-0000000000a4', 'a4@example.test'),
  ('00000000-0000-0000-0000-0000000000a5', 'a5@example.test'),
  ('00000000-0000-0000-0000-0000000000a6', 'a6@example.test'),
  ('00000000-0000-0000-0000-0000000000a7', 'a7@example.test'),
  ('00000000-0000-0000-0000-0000000000a8', 'a8@example.test'),
  ('00000000-0000-0000-0000-0000000000a9', 'a9@example.test');

insert into
  public.profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-0000000000c1', 'coach', 'Coach'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete', 'Defaults'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete', 'Workout switch off'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete', 'Morning trainer'),
  ('00000000-0000-0000-0000-0000000000a4', 'athlete', 'Trained today'),
  ('00000000-0000-0000-0000-0000000000a5', 'athlete', 'No phone'),
  ('00000000-0000-0000-0000-0000000000a6', 'athlete', 'Coached, check-in due'),
  ('00000000-0000-0000-0000-0000000000a7', 'athlete', 'Coached, checked in'),
  ('00000000-0000-0000-0000-0000000000a8', 'athlete', 'Coached, paused'),
  ('00000000-0000-0000-0000-0000000000a9', 'athlete', 'Coached, check-in switch off');

-- Everyone but a5 has a phone registered.
insert into
  public.push_tokens (token, user_id, platform)
select
  'ExponentPushToken[' || right(id::text, 2) || ']',
  id,
  'android'
from
  public.profiles
where
  id::text like '00000000-0000-0000-0000-0000000000a_'
  and id <> '00000000-0000-0000-0000-0000000000a5';

insert into
  public.athlete_profiles (athlete_id, payload)
values
  ('00000000-0000-0000-0000-0000000000a2', '{"athleteSettings":{"notify":{"workout":false}}}'),
  ('00000000-0000-0000-0000-0000000000a3', '{"athleteSettings":{"reminders":{"workout":{"on":true,"at":420}}}}'),
  ('00000000-0000-0000-0000-0000000000a9', '{"athleteSettings":{"notify":{"checkIns":false,"workout":false}}}');

insert into
  public.coach_clients (coach_id, client_id)
values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a6'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a7'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a8'),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a9');

insert into
  public.plans (athlete_id, kind, payload)
values
  ('00000000-0000-0000-0000-0000000000a6', 'meta', '{"checkInDay":"Friday"}'),
  ('00000000-0000-0000-0000-0000000000a7', 'meta', '{"checkInDay":"Friday"}'),
  ('00000000-0000-0000-0000-0000000000a8', 'meta', '{"checkInDay":"Friday","status":"paused"}'),
  ('00000000-0000-0000-0000-0000000000a9', 'meta', '{"checkInDay":"Friday"}');

-- Friday 13 November 2026: a4 trained in the morning (India time); a7 checked in on Wednesday.
insert into
  public.workouts (athlete_id, id, at, payload)
values
  ('00000000-0000-0000-0000-0000000000a4', 'w1', '2026-11-13 02:00:00+00', '{}');

set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a7","role":"authenticated"}';

insert into
  public.check_ins (athlete_id, id, at, payload)
values
  ('00000000-0000-0000-0000-0000000000a7', 'k1', '2026-11-11 05:00:00+00', '{}');

reset role;

-- ---------------------------------------------------------------------------------------------
-- Reminders
-- ---------------------------------------------------------------------------------------------
-- 18:00 India time (12:30 UTC): the default workout reminder.
select
  results_eq (
    $$ select right(user_id::text, 2) || ':' || kind from public.claim_reminders('2026-11-13 12:30:00+00') order by 1 $$,
    $$ values ('a1:workout'), ('a6:workout'), ('a7:workout') $$,
    'workout reminders at 18:00 skip: switch off, other time, trained today, no phone, paused'
  );

select
  is_empty (
    $$ select * from public.claim_reminders('2026-11-13 12:40:00+00') $$,
    'running again in the same slot sends nothing twice'
  );

select
  results_eq (
    $$ select right(user_id::text, 2) || ':' || kind from public.claim_reminders('2026-11-13 01:30:00+00') order by 1 $$,
    $$ values ('a3:workout') $$,
    'a reminder set for 07:00 goes at 07:00'
  );

select
  results_eq (
    $$ select right(user_id::text, 2) || ':' || kind from public.claim_reminders('2026-11-13 03:30:00+00') order by 1 $$,
    $$ values ('a6:check_in') $$,
    'check-in reminder at 09:00 on the check-in day skips: checked in this week, paused, switch off'
  );

select
  is_empty (
    $$ select * from public.claim_reminders('2026-11-14 03:30:00+00') where kind = 'check_in' $$,
    'no check-in reminder on another day'
  );

select
  is (
    (
      select
        count(*)::integer
      from
        public.reminder_sends
    ),
    5,
    'every sent reminder is recorded once'
  );

update public.coach_clients
set
  ended_at = now(),
  end_reason = 'left'
where
  client_id = '00000000-0000-0000-0000-0000000000a6';

select
  is_empty (
    $$ select * from public.claim_reminders('2026-11-20 03:30:00+00') where kind = 'check_in' and user_id = '00000000-0000-0000-0000-0000000000a6' $$,
    'no check-in reminder once the coaching link has ended'
  );

-- ---------------------------------------------------------------------------------------------
-- Jobs: service role only
-- ---------------------------------------------------------------------------------------------
select
  is (
    public.run_cron_call ('reminders'),
    null,
    'with no Vault secrets the job calls nothing'
  );

select
  ok (
    (
      select
        count(*) = 2
      from
        cron.job
      where
        jobname in ('arcwell-reminders', 'arcwell-purge')
    ),
    'both jobs are scheduled'
  );

set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  throws_ok (
    $$ select * from public.claim_reminders() $$,
    '42501',
    null,
    'a signed-in user cannot run the reminder job'
  );

select
  throws_ok (
    $$ select public.purge_expired() $$,
    '42501',
    null,
    'a signed-in user cannot run the purge job'
  );

select
  throws_ok (
    $$ select public.run_cron_call('purge') $$,
    '42501',
    null,
    'a signed-in user cannot call the cron function from the database'
  );

-- ---------------------------------------------------------------------------------------------
-- Rate limit (S-01)
-- ---------------------------------------------------------------------------------------------
select
  results_eq (
    $$ select public.call_try_use('notify', 2) union all select public.call_try_use('notify', 2) union all select public.call_try_use('notify', 2) $$,
    $$ values (true), (true), (false) $$,
    'calls stop at the daily cap'
  );

select
  throws_ok (
    $$ insert into public.call_usage (user_id, fn, count) values ('00000000-0000-0000-0000-0000000000a1', 'notify', 0) $$,
    '42501',
    null,
    'nobody writes their own counter directly'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';

select
  is_empty (
    $$ select * from public.call_usage $$,
    'a coach cannot see anyone else''s counters'
  );

select
  is_empty (
    $$ select * from public.reminder_sends $$,
    'a coach cannot see their clients'' reminders'
  );

reset role;

-- ---------------------------------------------------------------------------------------------
-- Retention purge (S-03)
-- ---------------------------------------------------------------------------------------------
insert into
  public.ai_usage (user_id, day, feature, count)
values
  ('00000000-0000-0000-0000-0000000000a1', current_date - 40, 'chat', 3),
  ('00000000-0000-0000-0000-0000000000a1', current_date - 5, 'chat', 3);

insert into
  public.invites (coach_id, kind, client_name, expires_at, revoked_at, used_by, used_at, payload)
values
  ('00000000-0000-0000-0000-0000000000c1', 'personal', 'Expired long ago', now() - interval '40 days', null, null, null, '{"basics":{"kg":80}}'),
  ('00000000-0000-0000-0000-0000000000c1', 'personal', 'Expired last week', now() - interval '7 days', null, null, null, '{}'),
  ('00000000-0000-0000-0000-0000000000c1', 'general', null, null, now() - interval '40 days', null, null, '{}'),
  ('00000000-0000-0000-0000-0000000000c1', 'personal', 'Used long ago', now() - interval '30 days', null, '00000000-0000-0000-0000-0000000000a7', now() - interval '45 days', '{"basics":{"kg":70}}');

select
  is (
    public.purge_expired () - 'reminder_sends' - 'call_usage',
    '{"ai_usage":1,"invites":2,"invite_payloads":1}'::jsonb,
    'purge removes old counters, unused invites a month past expiry or withdrawal, and copied client details'
  );

select
  results_eq (
    $$ select (select count(*)::integer from public.ai_usage where user_id = '00000000-0000-0000-0000-0000000000a1'), (select count(*)::integer from public.invites where coach_id = '00000000-0000-0000-0000-0000000000c1') $$,
    $$ values (1, 2) $$,
    'recent counters and recent or used invites are kept'
  );

select
  is (
    (
      select
        payload
      from
        public.invites
      where
        client_name = 'Used long ago'
    ),
    '{}'::jsonb,
    'a used invite keeps its row but not the client''s details'
  );

select
  *
from
  finish ();

rollback;
