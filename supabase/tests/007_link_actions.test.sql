-- Link actions: a personal invite hands over the invited name and basics; either side ends the link
-- with end_link() (and only their own link); the athlete's share_history() switch opens and closes
-- earlier history for the coach.
begin;

select
  no_plan ();

insert into
  auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'coach-b@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete-1@example.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete-2@example.test');

insert into
  public.profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'coach', 'Coach A'),
  ('00000000-0000-0000-0000-00000000000b', 'coach', 'Coach B'),
  ('00000000-0000-0000-0000-0000000000a1', 'athlete', null),
  ('00000000-0000-0000-0000-0000000000a2', 'athlete', 'Athlete 2');

insert into
  public.coach_clients (coach_id, client_id, joined_at)
values
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000a2', now() - interval '5 days');

insert into
  public.invites (coach_id, kind, code, client_name, expires_at, payload)
values
  ('00000000-0000-0000-0000-00000000000a', 'personal', 'HANDOVER1', 'Ravi Kumar', now() + interval '7 days', '{"client":{"goal":"Lose fat","basics":{"age":31}}}');

-- Fixture for history sharing: athlete 2 logged before joining coach B.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

insert into
  public.workouts (athlete_id, id, at, payload)
values
  ('00000000-0000-0000-0000-0000000000a2', 'old', now() - interval '30 days', '{}');

set local role authenticated;

-- Handover --------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  lives_ok ($$ select public.redeem_invite ('HANDOVER1') $$, 'athlete 1 joins on the personal invite');

select
  is ((select display_name from public.profiles where id = '00000000-0000-0000-0000-0000000000a1'), 'Ravi Kumar', 'the invited name becomes the athlete''s name');

select
  is ((select payload ->> 'goal' from public.athlete_profiles), 'Lose fat', 'the coach''s details start the athlete''s profile');

-- Ending ----------------------------------------------------------------------------------------
select
  throws_ok (
    $$ select public.end_link ('00000000-0000-0000-0000-00000000000b', 'left') $$,
    'P0002',
    null,
    'athlete 1 cannot end a link they are not in'
  );

select
  throws_ok (
    $$ select public.end_link ('00000000-0000-0000-0000-00000000000a', 'completed') $$,
    '42501',
    null,
    'an athlete cannot mark themselves completed'
  );

select
  lives_ok ($$ select public.end_link ('00000000-0000-0000-0000-00000000000a', 'left') $$, 'athlete 1 leaves coach A');

select
  is (public.athlete_tier (), 'free', 'after leaving, athlete 1 is no longer coached');

-- History sharing --------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is ((select count(*)::int from public.workouts), 0, 'coach B sees nothing from before the join date');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

select
  lives_ok ($$ select public.share_history (true) $$, 'athlete 2 shares earlier history');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is ((select count(*)::int from public.workouts), 1, 'coach B now sees the earlier workout');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

select
  lives_ok ($$ select public.share_history (false) $$, 'athlete 2 turns sharing off');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is ((select count(*)::int from public.workouts), 0, 'coach B loses the earlier workout again');

select
  lives_ok ($$ select public.end_link ('00000000-0000-0000-0000-0000000000a2', 'completed') $$, 'coach B completes athlete 2');

select
  is ((select count(*)::int from public.athlete_profiles), 0, 'coach B no longer reads athlete 2''s profile');

select
  *
from
  finish ();

rollback;
