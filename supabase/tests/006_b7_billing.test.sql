-- B7 billing and entitlements: the tier comes from the database (coached beats Plus; coached
-- athletes never get AI), expired Plus stops AI, coaches see only their own billing, a lapsed coach
-- can't invite or change plans, and a coach at their limit can't take new clients.
begin;

select
  no_plan ();

insert into
  auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'coach-b@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete-1@example.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete-2@example.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete-3@example.test');

insert into
  public.profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach', 'Coach A'),
  ('00000000-0000-0000-0000-00000000000b', 'coach', 'Coach B'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete', 'Athlete 1'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete', 'Athlete 2'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete', 'Athlete 3');

-- Athlete 1: Plus, current. Athlete 2: Plus, expired. Athlete 3: Plus but coached by A.
insert into
  public.subscriptions (user_id, tier, source, expires_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'pro', 'play', now() + interval '20 days'),
  ('00000000-0000-0000-0000-0000000000a2', 'pro', 'play', now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000a3', 'pro', 'play', now() + interval '20 days');

insert into
  public.coach_clients (coach_id, client_id)
values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a3');

insert into
  public.consents (user_id, purpose, granted, policy_version)
values
  ('00000000-0000-0000-0000-0000000000a1', 'ai', true, 'test'),
  ('00000000-0000-0000-0000-0000000000a2', 'ai', true, 'test'),
  ('00000000-0000-0000-0000-0000000000a3', 'ai', true, 'test');

-- Coach A is at their limit of 1; coach B has lapsed.
insert into
  public.coach_billing (coach_id, status, client_limit)
values
  ('00000000-0000-0000-0000-00000000000a', 'active', 1),
  ('00000000-0000-0000-0000-00000000000b', 'lapsed', 40);

insert into
  public.invites (coach_id, kind, code)
values
  ('00000000-0000-0000-0000-00000000000a', 'general', 'FULLCOACH'),
  ('00000000-0000-0000-0000-00000000000b', 'general', 'LAPSEDCO');

select
  ok ((select relrowsecurity from pg_class where oid = 'public.coach_billing'::regclass), 'RLS is on for coach_billing');

set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  is (public.athlete_tier (), 'pro', 'current Plus is pro');

select
  ok (public.ai_entitled (), 'current Plus with consent may use AI');

select
  throws_ok (
    $$ update public.subscriptions set tier = 'pro', expires_at = now() + interval '10 years' $$,
    '42501',
    null,
    'an athlete cannot change their own subscription'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

select
  is (public.athlete_tier (), 'free', 'expired Plus is free');

select
  ok (not public.ai_entitled (), 'expired Plus may not use AI');

select
  ok (not public.invite_open ('FULLCOACH'), 'the invite page knows coach A is full');

select
  throws_ok ($$ select public.redeem_invite ('FULLCOACH') $$, '53400', null, 'a coach at their limit takes no new client');

select
  throws_ok ($$ select public.redeem_invite ('LAPSEDCO') $$, '53400', null, 'a lapsed coach takes no new client');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}';

select
  is (public.athlete_tier (), 'coached', 'a coached athlete is coached even with Plus');

select
  ok (not public.ai_entitled (), 'a coached athlete never gets AI');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is ((select count(*)::int from public.coach_billing), 1, 'coach A sees only their own billing');

select
  lives_ok (
    $$ insert into public.plans (athlete_id, kind, payload) values ('00000000-0000-0000-0000-0000000000a3', 'training', '{}') $$,
    'a coach in good standing changes plans'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  throws_ok (
    $$ insert into public.invites (kind) values ('general') $$,
    '42501',
    null,
    'a lapsed coach cannot create invites'
  );

select
  ok (not public.coach_in_good_standing ('00000000-0000-0000-0000-00000000000b'), 'coach B is not in good standing');

select
  *
from
  finish ();

rollback;
