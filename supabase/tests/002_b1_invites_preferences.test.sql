-- Invites and athlete preferences (B1). Row-level security and the invite rules: coaches see only
-- their own invites; athletes never read the table and redeem by code; personal invites are
-- single-use and expire; one active coach per athlete; preferences are written only by the athlete,
-- read by the current coach, and access ends with the link.
begin;

select
  plan (22);

-- Fixtures (as the test owner, bypassing RLS)
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

insert into
  public.invites (coach_id, kind, code, client_name, expires_at, revoked_at)
values
  ('00000000-0000-0000-0000-00000000000a', 'general', 'GENERALA', null, null, null),
  ('00000000-0000-0000-0000-00000000000a', 'personal', 'PERSONA1', 'Athlete 1', now() + interval '7 days', null),
  ('00000000-0000-0000-0000-00000000000a', 'personal', 'EXPIRED1', 'Late', now() - interval '1 day', null),
  ('00000000-0000-0000-0000-00000000000a', 'general', 'REVOKED1', null, null, now()),
  ('00000000-0000-0000-0000-00000000000b', 'general', 'GENERALB', null, null, null);

select
  ok (
    (
      select
        bool_and(relrowsecurity)
      from
        pg_class
      where
        oid in ('public.invites'::regclass, 'public.athlete_preferences'::regclass)
    ),
    'RLS is on for invites and athlete_preferences'
  );

-- ------------------------------------------------------------------------------------------------
-- Coach A
-- ------------------------------------------------------------------------------------------------
set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is (
    (
      select
        count(*)::int
      from
        public.invites
    ),
    4,
    'coach A sees only their own four invites'
  );

select
  lives_ok (
    $$ insert into public.invites (kind, client_name) values ('personal', 'New client') $$,
    'coach A can create a personal invite'
  );

select
  ok (
    (
      select
        expires_at > now() + interval '13 days'
      from
        public.invites
      where
        client_name = 'New client'
    ),
    'personal invites get a 14-day expiry by default'
  );

select
  throws_ok (
    $$ select public.redeem_invite('GENERALB') $$,
    '42501',
    null,
    'a coach cannot redeem an invite'
  );

-- ------------------------------------------------------------------------------------------------
-- Athlete 1
-- ------------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  is (
    (
      select
        count(*)::int
      from
        public.invites
    ),
    0,
    'an athlete cannot read the invites table'
  );

select
  throws_ok (
    $$ insert into public.invites (kind) values ('general') $$,
    '42501',
    null,
    'an athlete cannot create invites'
  );

select
  is (
    (
      select
        coach_name
      from
        public.invite_preview ('persona1')
    ),
    'Coach A',
    'preview shows the coach name, codes are case-insensitive'
  );

select
  is (
    (
      select
        usable
      from
        public.invite_preview ('EXPIRED1')
    ),
    false,
    'preview marks an expired invite unusable'
  );

select
  throws_ok (
    $$ select public.redeem_invite('EXPIRED1') $$,
    'P0002',
    null,
    'an expired invite cannot be redeemed'
  );

select
  throws_ok (
    $$ select public.redeem_invite('REVOKED1') $$,
    'P0002',
    null,
    'a revoked invite cannot be redeemed'
  );

select
  isnt (
    public.redeem_invite ('PERSONA1'),
    null,
    'athlete 1 joins coach A with a personal invite'
  );

select
  throws_ok (
    $$ select public.redeem_invite('GENERALB') $$,
    '23505',
    null,
    'an athlete with an active coach cannot join a second coach'
  );

select
  lives_ok (
    $$ insert into public.athlete_preferences (modules) values (array['morning', 'cardio_fitness']) $$,
    'athlete 1 saves their preferences'
  );

select
  throws_ok (
    $$ update public.athlete_preferences set modules = array['bro_science'] $$,
    '23514',
    null,
    'unknown modules are rejected'
  );

-- ------------------------------------------------------------------------------------------------
-- Athlete 2: the personal invite is used up; the general one works
-- ------------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

select
  throws_ok (
    $$ select public.redeem_invite('PERSONA1') $$,
    'P0002',
    null,
    'a personal invite works only once'
  );

select
  isnt (
    public.redeem_invite ('GENERALB'),
    null,
    'athlete 2 joins coach B with a general invite'
  );

select
  is (
    (
      select
        count(*)::int
      from
        public.athlete_preferences
    ),
    0,
    'an athlete cannot see another athlete''s preferences'
  );

-- ------------------------------------------------------------------------------------------------
-- Coaches and preferences
-- ------------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is (
    (
      select
        modules
      from
        public.athlete_preferences
      where
        athlete_id = '00000000-0000-0000-0000-0000000000a1'
    ),
    array['morning', 'cardio_fitness'],
    'coach A reads their client''s preferences'
  );

update public.athlete_preferences
set
  modules = array['morning'];

select
  is (
    (
      select
        modules
      from
        public.athlete_preferences
      where
        athlete_id = '00000000-0000-0000-0000-0000000000a1'
    ),
    array['morning', 'cardio_fitness'],
    'a coach cannot change a client''s preferences'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is (
    (
      select
        count(*)::int
      from
        public.athlete_preferences
    ),
    0,
    'coach B cannot see coach A''s client preferences'
  );

-- Coaching ends: coach A loses access at once.
reset role;

update public.coach_clients
set
  ended_at = now(),
  end_reason = 'left'
where
  client_id = '00000000-0000-0000-0000-0000000000a1';

set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is (
    (
      select
        count(*)::int
      from
        public.athlete_preferences
    ),
    0,
    'access to preferences ends when coaching ends'
  );

select
  *
from
  finish ();

rollback;
