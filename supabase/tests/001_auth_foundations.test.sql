-- Row-level security for profiles, consents and coach_clients (AGENTS.md non-negotiables):
-- a coach can't see another coach's clients; a coach sees client data only from the join date
-- unless the athlete grants history; access ends when the link ends. Plus: roles are fixed,
-- consents are private and append-only, anonymous users see nothing.
begin;

select
  plan (36);

-- ---------------------------------------------------------------------------------------------
-- Fixtures (as the test owner, bypassing RLS)
--   coach A coaches athlete 1 (joined 1 Nov) and used to coach athlete 3 (ended)
--   coach B coaches athlete 2
-- ---------------------------------------------------------------------------------------------
insert into
  auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'coach-b@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete-1@example.test'),
  ('00000000-0000-0000-0000-0000000000b2', 'athlete-2@example.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete-3@example.test');

insert into
  public.profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach', 'Coach A'),
  ('00000000-0000-0000-0000-00000000000b', 'coach', 'Coach B'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete', 'Athlete 1'),
  ('00000000-0000-0000-0000-0000000000b2', 'athlete', 'Athlete 2'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete', 'Athlete 3');

insert into
  public.coach_clients (id, coach_id, client_id, joined_at, ended_at, end_reason)
values
  (
    '10000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-00000000000a',
    '00000000-0000-0000-0000-0000000000a1',
    '2026-11-01',
    null,
    null
  ),
  (
    '10000000-0000-0000-0000-0000000000b2',
    '00000000-0000-0000-0000-00000000000b',
    '00000000-0000-0000-0000-0000000000b2',
    '2026-10-01',
    null,
    null
  ),
  (
    '10000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-00000000000a',
    '00000000-0000-0000-0000-0000000000a3',
    '2026-09-01',
    '2026-10-01',
    'completed'
  );

-- ---------------------------------------------------------------------------------------------
-- Structure
-- ---------------------------------------------------------------------------------------------
select
  ok (
    (
      select
        bool_and(relrowsecurity)
      from
        pg_class
      where
        oid in (
          'public.profiles'::regclass,
          'public.consents'::regclass,
          'public.coach_clients'::regclass
        )
    ),
    'RLS is enabled on profiles, consents and coach_clients'
  );

select
  throws_ok (
    $$insert into public.coach_clients (coach_id, client_id)
      values ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000a1')$$,
    '23505',
    null,
    'an athlete cannot have two active coaches'
  );

select
  throws_ok (
    $$insert into public.coach_clients (coach_id, client_id)
      values ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000b2')$$,
    '23514',
    null,
    'a link must join a coach account to an athlete account'
  );

-- ---------------------------------------------------------------------------------------------
-- Anonymous users see nothing
-- ---------------------------------------------------------------------------------------------
set local role anon;

select
  throws_ok (
    'select count(*) from public.profiles',
    '42501',
    null,
    'anon cannot read profiles'
  );

select
  throws_ok (
    'select count(*) from public.coach_clients',
    '42501',
    null,
    'anon cannot read links'
  );

reset role;

-- ---------------------------------------------------------------------------------------------
-- Coach A
-- ---------------------------------------------------------------------------------------------
set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  results_eq (
    'select id from public.profiles order by id',
    $$values ('00000000-0000-0000-0000-00000000000a'::uuid), ('00000000-0000-0000-0000-0000000000a1'::uuid)$$,
    'coach A sees only themself and their active client'
  );

select
  is (
    (
      select
        count(*)
      from
        public.profiles
      where
        id = '00000000-0000-0000-0000-0000000000b2'
    ),
    0::bigint,
    'coach A cannot see coach B''s client'
  );

select
  is (
    (
      select
        count(*)
      from
        public.profiles
      where
        id = '00000000-0000-0000-0000-0000000000a3'
    ),
    0::bigint,
    'coach A cannot see a former client'
  );

select
  results_eq (
    'select id from public.coach_clients order by id',
    $$values ('10000000-0000-0000-0000-0000000000a1'::uuid), ('10000000-0000-0000-0000-0000000000a3'::uuid)$$,
    'coach A sees only their own links'
  );

select
  ok (
    not public.coach_can_read ('00000000-0000-0000-0000-0000000000a1', '2026-10-15'),
    'coach A cannot read athlete 1''s data from before the join date'
  );

select
  ok (
    public.coach_can_read ('00000000-0000-0000-0000-0000000000a1', '2026-11-05'),
    'coach A can read athlete 1''s data from the join date on'
  );

select
  ok (
    not public.coach_can_read ('00000000-0000-0000-0000-0000000000b2', '2026-11-05'),
    'coach A cannot read coach B''s client''s data'
  );

select
  ok (
    not public.coach_can_read ('00000000-0000-0000-0000-0000000000a3', '2026-09-15'),
    'coach A cannot read a former client''s data, even from while linked'
  );

select
  throws_ok (
    $$select public.set_history_access ('10000000-0000-0000-0000-0000000000a1', '2026-01-01')$$,
    '42501',
    null,
    'a coach cannot open history for themself'
  );

select
  throws_ok (
    $$select public.end_coaching ('10000000-0000-0000-0000-0000000000b2', 'removed')$$,
    '42501',
    null,
    'coach A cannot end coach B''s link'
  );

select
  throws_ok (
    $$select public.end_coaching ('10000000-0000-0000-0000-0000000000a1', 'left')$$,
    '42501',
    null,
    'a coach cannot use the athlete''s "left" reason'
  );

select
  throws_ok (
    $$update public.coach_clients set history_from = '2026-01-01' where id = '10000000-0000-0000-0000-0000000000a1'$$,
    '42501',
    null,
    'links cannot be edited directly'
  );

select
  throws_ok (
    $$insert into public.coach_clients (coach_id, client_id)
      values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000b2')$$,
    '42501',
    null,
    'a coach cannot link themself to an athlete'
  );

-- ---------------------------------------------------------------------------------------------
-- Athlete 1: profile, consents, history access
-- ---------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  results_eq (
    'select id from public.profiles order by id',
    $$values ('00000000-0000-0000-0000-00000000000a'::uuid), ('00000000-0000-0000-0000-0000000000a1'::uuid)$$,
    'athlete 1 sees themself and their active coach'
  );

select
  throws_ok (
    $$update public.profiles set role = 'coach' where id = '00000000-0000-0000-0000-0000000000a1'$$,
    '42501',
    null,
    'the role cannot be changed after sign-up'
  );

select
  lives_ok (
    $$update public.profiles set display_name = 'Ath One' where id = '00000000-0000-0000-0000-0000000000a1'$$,
    'an athlete can change their display name'
  );

select
  throws_ok (
    $$insert into public.profiles (id, role) values ('00000000-0000-0000-0000-0000000000b2', 'athlete')$$,
    '42501',
    null,
    'nobody can create a profile for someone else'
  );

select
  lives_ok (
    $$insert into public.consents (purpose, granted, policy_version) values ('health_data', true, '2026-11')$$,
    'an athlete records health-data consent'
  );

select
  ok (
    public.has_consent ('health_data'),
    'the latest consent counts as given'
  );

select
  lives_ok (
    $$insert into public.consents (purpose, granted, policy_version) values ('health_data', false, '2026-11')$$,
    'consent is withdrawn with a new row'
  );

select
  ok (
    not public.has_consent ('health_data'),
    'withdrawal wins over the earlier grant'
  );

select
  throws_ok (
    $$delete from public.consents$$,
    '42501',
    null,
    'consents cannot be deleted'
  );

select
  throws_ok (
    $$insert into public.consents (user_id, purpose, granted, policy_version)
      values ('00000000-0000-0000-0000-0000000000b2', 'ai', true, '2026-11')$$,
    '42501',
    null,
    'nobody can record consent for someone else'
  );

select
  lives_ok (
    $$select public.set_history_access ('10000000-0000-0000-0000-0000000000a1', '2026-09-01')$$,
    'athlete 1 opens history from 1 Sep'
  );

-- Coach A again: the grant applies, and consents stay private.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  ok (
    public.coach_can_read ('00000000-0000-0000-0000-0000000000a1', '2026-10-15'),
    'after the grant, coach A can read athlete 1''s earlier data'
  );

select
  ok (
    not public.coach_can_read ('00000000-0000-0000-0000-0000000000a1', '2026-08-15'),
    'but not from before the granted date'
  );

select
  is (
    (
      select
        count(*)
      from
        public.consents
    ),
    0::bigint,
    'a coach cannot see their client''s consents'
  );

-- ---------------------------------------------------------------------------------------------
-- Athlete 1 leaves: access ends at once
-- ---------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  lives_ok (
    $$select public.end_coaching ('10000000-0000-0000-0000-0000000000a1', 'left')$$,
    'athlete 1 leaves coach A'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is (
    (
      select
        count(*)
      from
        public.profiles
      where
        id = '00000000-0000-0000-0000-0000000000a1'
    ),
    0::bigint,
    'after leaving, coach A cannot see athlete 1''s profile'
  );

select
  ok (
    not public.coach_can_read ('00000000-0000-0000-0000-0000000000a1', '2026-11-05'),
    'after leaving, coach A cannot read athlete 1''s data'
  );

-- Coach B is unaffected throughout.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  results_eq (
    'select id from public.profiles order by id',
    $$values ('00000000-0000-0000-0000-00000000000b'::uuid), ('00000000-0000-0000-0000-0000000000b2'::uuid)$$,
    'coach B sees only themself and their client'
  );

reset role;

select
  *
from
  finish ();

rollback;
