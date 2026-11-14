-- B1 profiles and notes, B2 plans, Enhanced, templates, leads and custom exercises.
-- Proves: a coach never sees another coach's clients; plans are written by the current coach (or the
-- self-guided athlete); access ends with the link; coach notes stay private to the coach; Enhanced
-- needs the athlete's own consent; personal invites hand over the coach's plans.
begin;

select
  no_plan ();

-- Fixtures ------------------------------------------------------------------------------------
insert into
  auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'coach-b@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete-1@example.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete-2@example.test'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete-3@example.test'),
  ('00000000-0000-0000-0000-0000000000a4', 'athlete-4@example.test');

insert into
  public.profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach', 'Coach A'),
  ('00000000-0000-0000-0000-00000000000b', 'coach', 'Coach B'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete', 'Athlete 1'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete', 'Athlete 2'),
  ('00000000-0000-0000-0000-0000000000a3', 'athlete', 'Athlete 3'),
  ('00000000-0000-0000-0000-0000000000a4', 'athlete', 'Athlete 4');

-- A coaches 1; B coaches 2; A used to coach 3 (ended); 4 is self-guided.
insert into
  public.coach_clients (coach_id, client_id, joined_at, ended_at, end_reason)
values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1', now() - interval '10 days', null, null),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000a2', now() - interval '10 days', null, null),
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a3', now() - interval '30 days', now() - interval '1 day', 'left');

insert into
  public.athlete_profiles (athlete_id, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', '{"goal":"Lose fat"}'),
  ('00000000-0000-0000-0000-0000000000a2', '{"goal":"Gain"}'),
  ('00000000-0000-0000-0000-0000000000a3', '{"goal":"Strength"}');

insert into
  public.coach_profiles (coach_id, payload)
values
  ('00000000-0000-0000-0000-00000000000a', '{"bio":"A"}'),
  ('00000000-0000-0000-0000-00000000000b', '{"bio":"B"}');

insert into
  public.plans (athlete_id, kind, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'training', '{"name":"Fat loss"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'training', '{"name":"Muscle"}'),
  ('00000000-0000-0000-0000-0000000000a3', 'training', '{"name":"Old"}');

insert into
  public.coach_client_notes (coach_id, client_id, payload)
values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1', '{"fee":5000}');

insert into
  public.invites (coach_id, kind, code, client_name, expires_at, payload)
values
  (
    '00000000-0000-0000-0000-00000000000a',
    'personal',
    'PLANHAND',
    'Athlete 4',
    now() + interval '7 days',
    '{"basics":{"age":30},"plans":{"training":{"name":"Prepared"},"nutrition":{"kcal":2000}},"notes":{"fee":4000}}'
  );

select
  ok (
    (
      select
        bool_and(relrowsecurity)
      from
        pg_class
      where
        oid in (
          'public.athlete_profiles'::regclass,
          'public.coach_profiles'::regclass,
          'public.coach_client_notes'::regclass,
          'public.plans'::regclass,
          'public.enhanced'::regclass,
          'public.templates'::regclass,
          'public.leads'::regclass,
          'public.custom_exercises'::regclass
        )
    ),
    'RLS is on for every B1/B2 table'
  );

-- Coach A -------------------------------------------------------------------------------------
set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is ((select count(*)::int from public.athlete_profiles), 1, 'coach A sees only their current client''s profile');

select
  is ((select count(*)::int from public.plans), 1, 'coach A sees only their current client''s plans');

select
  is (
    (select count(*)::int from public.plans where athlete_id = '00000000-0000-0000-0000-0000000000a3'),
    0,
    'coach A no longer sees a client who left'
  );

select
  lives_ok (
    $$ update public.plans set payload = '{"name":"Fat loss v2"}' where athlete_id = '00000000-0000-0000-0000-0000000000a1' and kind = 'training' $$,
    'coach A updates their client''s plan'
  );

select
  lives_ok (
    $$ insert into public.plans (athlete_id, kind, payload) values ('00000000-0000-0000-0000-0000000000a1', 'nutrition', '{"kcal":1800}') $$,
    'coach A adds a nutrition plan'
  );

select
  throws_ok (
    $$ insert into public.plans (athlete_id, kind, payload) values ('00000000-0000-0000-0000-0000000000a2', 'nutrition', '{"kcal":1}') $$,
    '42501',
    null,
    'coach A cannot write another coach''s client''s plan'
  );

select
  throws_ok (
    $$ insert into public.plans (athlete_id, kind, payload) values ('00000000-0000-0000-0000-0000000000a3', 'meta', '{}') $$,
    '42501',
    null,
    'coach A cannot write plans for a client who left'
  );

select
  is ((select count(*)::int from public.coach_client_notes), 1, 'coach A sees their own notes');

select
  throws_ok (
    $$ insert into public.coach_client_notes (client_id, payload) values ('00000000-0000-0000-0000-0000000000a2', '{}') $$,
    '42501',
    null,
    'coach A cannot keep notes on someone they never coached'
  );

select
  lives_ok (
    $$ insert into public.templates (id, kind, payload) values ('t1', 'training', '{"name":"T"}') $$,
    'coach A saves a template'
  );

select
  lives_ok (
    $$ insert into public.leads (id, payload) values ('l1', '{"name":"Lead"}') $$,
    'coach A saves a lead'
  );

select
  lives_ok (
    $$ insert into public.custom_exercises (id, payload) values ('x1', '{"name":"Sled drag"}') $$,
    'coach A adds a custom exercise'
  );

select
  is (
    (select payload ->> 'goal' from public.athlete_profiles where athlete_id = '00000000-0000-0000-0000-0000000000a1'),
    'Lose fat',
    'the athlete''s profile is unchanged by the coach'
  );

select
  lives_ok (
    $$ insert into public.enhanced (athlete_id, payload) values ('00000000-0000-0000-0000-0000000000a1', '{"requestedAt":"2026-11-14"}') $$,
    'coach A may ask for Enhanced tracking'
  );

select
  throws_ok (
    $$ update public.enhanced set payload = payload || '{"cycle":"x"}' where athlete_id = '00000000-0000-0000-0000-0000000000a1' $$,
    '42501',
    null,
    'coach A cannot record anything before the athlete says yes'
  );

select
  throws_ok (
    $$ update public.enhanced set consent_at = now() where athlete_id = '00000000-0000-0000-0000-0000000000a1' $$,
    '42501',
    null,
    'coach A cannot give consent for the athlete'
  );

-- Coach B -------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is ((select count(*)::int from public.templates), 0, 'coach B never sees coach A''s templates');

select
  is ((select count(*)::int from public.leads), 0, 'coach B never sees coach A''s leads');

select
  is ((select count(*)::int from public.coach_client_notes), 0, 'coach B never sees coach A''s notes');

select
  is (
    (select count(*)::int from public.plans where athlete_id = '00000000-0000-0000-0000-0000000000a1'),
    0,
    'coach B never sees coach A''s client''s plans'
  );

select
  is ((select count(*)::int from public.custom_exercises), 0, 'coach B never sees coach A''s exercises');

-- Athlete 1 (coached by A) -----------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  is ((select count(*)::int from public.plans), 2, 'athlete 1 reads their two plans');

select
  is (
    (select count(*)::int from public.coach_client_notes),
    0,
    'athlete 1 never sees the coach''s notes about them'
  );

select
  is ((select count(*)::int from public.coach_profiles), 1, 'athlete 1 reads their coach''s profile only');

select
  is ((select count(*)::int from public.custom_exercises), 1, 'athlete 1 reads their coach''s custom exercises');

select
  lives_ok (
    $$ update public.enhanced set consent_at = now() where athlete_id = '00000000-0000-0000-0000-0000000000a1' $$,
    'athlete 1 says yes to Enhanced tracking'
  );

-- Coach A records after consent.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  lives_ok (
    $$ update public.enhanced set payload = payload || '{"cycle":"x"}' where athlete_id = '00000000-0000-0000-0000-0000000000a1' $$,
    'coach A records once the athlete has said yes'
  );

-- Athlete 3 (left A) and athlete 4 (self-guided) ----------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}';

select
  is ((select payload ->> 'name' from public.plans where kind = 'training'), 'Old', 'athlete 3 keeps the old plan after leaving');

select
  is ((select count(*)::int from public.coach_profiles), 0, 'athlete 3 no longer reads the former coach''s profile');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a4","role":"authenticated"}';

select
  lives_ok (
    $$ insert into public.plans (athlete_id, kind, payload) values ('00000000-0000-0000-0000-0000000000a4', 'training', '{"name":"Mine"}') $$,
    'a self-guided athlete writes their own plan'
  );

select
  is ((public.invite_details ('planhand') ->> 'client_name'), 'Athlete 4', 'the invited athlete sees the details after sign-in');

select
  lives_ok ($$ select public.redeem_invite ('PLANHAND') $$, 'athlete 4 redeems the personal invite');

select
  is (
    (select payload ->> 'name' from public.plans where kind = 'training'),
    'Prepared',
    'the coach''s prepared plan replaces the athlete''s own'
  );

update public.plans
set
  payload = '{"name":"Mine again"}'
where
  kind = 'training';

select
  is (
    (select payload ->> 'name' from public.plans where kind = 'training'),
    'Prepared',
    'a coached athlete''s edit to the plan changes nothing'
  );

select
  *
from
  finish ();

rollback;
