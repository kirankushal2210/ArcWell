-- AI entitlement and daily cap (D44, D96): only a pro athlete with AI consent and no active coach
-- may use AI; uses are counted per day and stop at the cap; users see only their own rows; nobody
-- can give themselves pro; a coach never sees a client's AI usage.
begin;

select
  plan (14);

insert into
  auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach-a@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'pro-athlete@example.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'free-athlete@example.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'coached-pro@example.test');

insert into
  public.profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach', 'Coach A'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete', 'Pro'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete', 'Free'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete', 'Coached');

insert into
  public.subscriptions (user_id, tier)
values
  ('00000000-0000-0000-0000-0000000000a1', 'pro'),
  ('00000000-0000-0000-0000-0000000000a3', 'pro');

insert into
  public.consents (user_id, purpose, granted, policy_version)
values
  ('00000000-0000-0000-0000-0000000000a1', 'ai', true, '2026-11'),
  ('00000000-0000-0000-0000-0000000000a2', 'ai', true, '2026-11'),
  ('00000000-0000-0000-0000-0000000000a3', 'ai', true, '2026-11');

insert into
  public.coach_clients (coach_id, client_id)
values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a3');

select
  ok (
    (
      select
        bool_and(relrowsecurity)
      from
        pg_class
      where
        oid in ('public.subscriptions'::regclass, 'public.ai_usage'::regclass)
    ),
    'RLS is on for subscriptions and ai_usage'
  );

set local role authenticated;

-- Pro athlete, consented, no coach
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  ok (public.ai_entitled (), 'a pro athlete with AI consent and no coach is entitled');

select
  ok (public.ai_try_use ('meal_scan', 2), 'first use under the cap goes ahead');

select
  ok (public.ai_try_use ('meal_scan', 2), 'second use under the cap goes ahead');

select
  ok (not public.ai_try_use ('meal_scan', 2), 'the third use is stopped at the cap');

select
  is (
    (
      select
        count
      from
        public.ai_usage
      where
        feature = 'meal_scan'
    ),
    2,
    'usage is counted, and the stopped call is not'
  );

select
  ok (public.ai_try_use ('coach_chat', 2), 'each feature has its own cap');

select
  throws_ok (
    $$ update public.subscriptions set tier = 'pro' $$,
    '42501',
    null,
    'users cannot change their own plan'
  );

select
  throws_ok (
    $$ insert into public.ai_usage (user_id, feature, count) values ('00000000-0000-0000-0000-0000000000a1', 'meal_scan', 0) $$,
    '42501',
    null,
    'users cannot write usage directly'
  );

-- Free athlete
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

select
  ok (not public.ai_entitled (), 'a free athlete is not entitled');

select
  ok (not public.ai_try_use ('meal_scan', 20), 'a free athlete cannot use AI');

select
  is (
    (
      select
        count(*)::int
      from
        public.ai_usage
    ),
    0,
    'a user cannot see another user''s usage'
  );

-- Coached athlete on pro: never AI (D44)
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}';

select
  ok (not public.ai_entitled (), 'a coached athlete is not entitled, even on pro');

-- The coach sees none of it
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is (
    (
      select
        count(*)::int
      from
        public.ai_usage
    ),
    0,
    'a coach cannot see a client''s AI usage'
  );

select
  *
from
  finish ();

rollback;
