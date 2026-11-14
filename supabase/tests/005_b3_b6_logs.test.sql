-- B3 to B6 logs: workouts, routines, food, check-ins, chat, body logs, photos, day logs,
-- transformations, storage and export.
-- Proves for every dated table: a coach sees a client's rows only from the join date (or the earlier
-- date the athlete shares), never another coach's client, and nothing once the link ends; only the
-- athlete writes their logs; the coach only replies to check-ins; chat needs a current link; only the
-- athlete decides on transformations.
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

-- Athlete 1 joined coach A 10 days ago; athlete 2 is coach B's; athlete 3 left coach A yesterday.
insert into
  public.coach_clients (id, coach_id, client_id, joined_at, ended_at, end_reason)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1', now() - interval '10 days', null, null),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000a2', now() - interval '10 days', null, null),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a3', now() - interval '30 days', now() - interval '1 day', 'left');

-- Athlete 1's logs: one before joining (20 days ago), one after (2 days ago), in every dated table.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

insert into
  public.workouts (athlete_id, id, at, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'w-old', now() - interval '20 days', '{}'),
  ('00000000-0000-0000-0000-0000000000a1', 'w-new', now() - interval '2 days', '{}');

insert into
  public.food_logs (athlete_id, id, day, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'f-old', current_date - 20, '{}'),
  ('00000000-0000-0000-0000-0000000000a1', 'f-new', current_date - 2, '{}');

insert into
  public.body_logs (athlete_id, id, kind, day, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'b-old', 'weight', current_date - 20, '{"kg":70}'),
  ('00000000-0000-0000-0000-0000000000a1', 'b-new', 'weight', current_date - 2, '{"kg":69}');

insert into
  public.day_logs (athlete_id, area, day, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'recovery', current_date - 20, '{}'),
  ('00000000-0000-0000-0000-0000000000a1', 'recovery', current_date - 2, '{}');

insert into
  public.progress_photos (athlete_id, id, day, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'p-old', current_date - 20, '{}'),
  ('00000000-0000-0000-0000-0000000000a1', 'p-new', current_date - 2, '{}');

insert into
  public.check_ins (athlete_id, id, at, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'k-old', now() - interval '20 days', '{}'),
  ('00000000-0000-0000-0000-0000000000a1', 'k-new', now() - interval '2 days', '{"wins":"good week"}');

insert into
  public.routines (athlete_id, id, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'r1', '{"name":"Arms"}');

insert into
  public.my_foods (athlete_id, id, payload)
values
  ('00000000-0000-0000-0000-0000000000a1', 'm1', '{"name":"Mom''s dal"}');

-- Athlete 3 (left coach A) logged while coached.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}';

insert into
  public.workouts (athlete_id, id, at, payload)
values
  ('00000000-0000-0000-0000-0000000000a3', 'w3', now() - interval '5 days', '{}');

insert into
  public.food_logs (athlete_id, id, day, payload)
values
  ('00000000-0000-0000-0000-0000000000a3', 'f3', current_date - 5, '{}');

select
  ok (
    (
      select
        bool_and(relrowsecurity)
      from
        pg_class
      where
        oid in (
          'public.workouts'::regclass,
          'public.routines'::regclass,
          'public.food_logs'::regclass,
          'public.my_foods'::regclass,
          'public.check_ins'::regclass,
          'public.messages'::regclass,
          'public.push_tokens'::regclass,
          'public.body_logs'::regclass,
          'public.progress_photos'::regclass,
          'public.day_logs'::regclass,
          'public.transformations'::regclass
        )
    ),
    'RLS is on for every B3 to B6 table'
  );

-- Coach A: join-date visibility -------------------------------------------------------------------
set local role authenticated;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is ((select array_agg(id) from public.workouts), array['w-new'], 'coach A sees workouts only from the join date');

select
  is ((select array_agg(id) from public.food_logs), array['f-new'], 'coach A sees food only from the join day');

select
  is ((select array_agg(id) from public.body_logs), array['b-new'], 'coach A sees weigh-ins only from the join day');

select
  is ((select count(*)::int from public.day_logs), 1, 'coach A sees day logs only from the join day');

select
  is ((select array_agg(id) from public.progress_photos), array['p-new'], 'coach A sees photos only from the join day');

select
  is ((select array_agg(id) from public.check_ins), array['k-new'], 'coach A sees check-ins only from the join date');

select
  is ((select count(*)::int from public.routines), 1, 'coach A sees the client''s templates');

select
  is ((select count(*)::int from public.my_foods), 0, 'coach A never sees the athlete''s own foods');

select
  is (
    (select count(*)::int from public.workouts where athlete_id = '00000000-0000-0000-0000-0000000000a3'),
    0,
    'coach A sees nothing from a client who left, even from while coached'
  );

select
  lives_ok (
    $$ update public.check_ins set reply = 'Great work', reviewed_at = now() where id = 'k-new' $$,
    'coach A replies to a check-in'
  );

select
  throws_ok (
    $$ update public.check_ins set payload = '{"wins":"edited"}' where id = 'k-new' $$,
    '42501',
    null,
    'coach A cannot edit what the athlete wrote'
  );

select
  throws_ok (
    $$ insert into public.workouts (athlete_id, id, at, payload) values ('00000000-0000-0000-0000-0000000000a1', 'fake', now(), '{}') $$,
    '42501',
    null,
    'coach A cannot log a workout for the athlete'
  );

-- Athlete 1 shares earlier history: coach A then sees the older rows too.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  lives_ok (
    $$ select public.set_history_access ('10000000-0000-0000-0000-000000000001', now() - interval '60 days') $$,
    'athlete 1 shares history from before joining'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is ((select count(*)::int from public.workouts), 2, 'coach A now sees the shared older workout');

select
  is ((select count(*)::int from public.food_logs), 2, 'coach A now sees the shared older food');

-- Coach B: never another coach's client ----------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is (
    (
      select count(*)::int from (
        select 1 from public.workouts
        union all select 1 from public.food_logs
        union all select 1 from public.body_logs
        union all select 1 from public.day_logs
        union all select 1 from public.progress_photos
        union all select 1 from public.check_ins
        union all select 1 from public.routines
      ) x
    ),
    0,
    'coach B sees none of coach A''s client''s logs'
  );

-- Athlete 1: check-ins and replies --------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  is ((select reply from public.check_ins where id = 'k-new'), 'Great work', 'athlete 1 reads the coach''s reply');

select
  throws_ok (
    $$ update public.check_ins set reply = 'self praise' where id = 'k-new' $$,
    '42501',
    null,
    'athlete 1 cannot write the coach''s reply'
  );

-- Chat ---------------------------------------------------------------------------------------------
select
  lives_ok (
    $$ insert into public.messages (coach_id, athlete_id, body) values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1', 'Hi coach') $$,
    'athlete 1 messages their coach'
  );

select
  throws_ok (
    $$ insert into public.messages (coach_id, athlete_id, body) values ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000a1', 'Hi stranger') $$,
    '42501',
    null,
    'athlete 1 cannot message a coach they are not linked to'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is ((select count(*)::int from public.messages), 1, 'coach A reads the message');

select
  lives_ok (
    $$ update public.messages set read_at = now() where body = 'Hi coach' $$,
    'coach A marks it read'
  );

select
  throws_ok (
    $$ update public.messages set read_at = now(), body = 'changed' where body = 'Hi coach' $$,
    '42501',
    null,
    'messages cannot be edited'
  );

select
  lives_ok (
    $$ insert into public.messages (coach_id, athlete_id, body) values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1', 'Hi Athlete 1') $$,
    'coach A replies'
  );

select
  throws_ok (
    $$ insert into public.messages (coach_id, athlete_id, body) values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a3', 'Come back') $$,
    '42501',
    null,
    'coach A cannot message a client who left'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is ((select count(*)::int from public.messages), 0, 'coach B reads none of coach A''s chat');

-- Storage ------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  lives_ok (
    $$ insert into storage.objects (bucket_id, name, owner_id) values ('athlete-files', '00000000-0000-0000-0000-0000000000a1/photos/front.jpg', '00000000-0000-0000-0000-0000000000a1') $$,
    'athlete 1 uploads into their own folder'
  );

select
  throws_ok (
    $$ insert into storage.objects (bucket_id, name, owner_id) values ('athlete-files', '00000000-0000-0000-0000-0000000000a2/photos/x.jpg', '00000000-0000-0000-0000-0000000000a1') $$,
    '42501',
    null,
    'athlete 1 cannot upload into someone else''s folder'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  is ((select count(*)::int from storage.objects where bucket_id = 'athlete-files'), 1, 'coach A reads their client''s files');

select
  lives_ok (
    $$ insert into storage.objects (bucket_id, name, owner_id) values ('athlete-files', '00000000-0000-0000-0000-0000000000a1/chat/plan.pdf', '00000000-0000-0000-0000-00000000000a') $$,
    'coach A adds a chat attachment for their client'
  );

select
  throws_ok (
    $$ insert into storage.objects (bucket_id, name, owner_id) values ('athlete-files', '00000000-0000-0000-0000-0000000000a1/photos/sneaky.jpg', '00000000-0000-0000-0000-00000000000a') $$,
    '42501',
    null,
    'coach A cannot add to the client''s photos'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select
  is ((select count(*)::int from storage.objects where bucket_id = 'athlete-files'), 0, 'coach B reads none of coach A''s client''s files');

-- Transformations ----------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select
  lives_ok (
    $$ insert into public.transformations (athlete_id, id, payload) values ('00000000-0000-0000-0000-0000000000a1', 't1', '{"caption":"12 weeks"}') $$,
    'coach A asks to share a transformation'
  );

select
  throws_ok (
    $$ update public.transformations set status = 'approved' where id = 't1' $$,
    '42501',
    null,
    'coach A cannot approve it themselves'
  );

select
  throws_ok (
    $$ insert into public.transformations (athlete_id, id, payload) values ('00000000-0000-0000-0000-0000000000a2', 't2', '{}') $$,
    '42501',
    null,
    'coach A cannot ask another coach''s client'
  );

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select
  lives_ok (
    $$ update public.transformations set status = 'approved' where id = 't1' $$,
    'athlete 1 approves'
  );

-- Export -------------------------------------------------------------------------------------------
select
  is (
    jsonb_array_length(public.export_my_data () -> 'workouts'),
    2,
    'athlete 1''s export holds all their workouts'
  );

select
  is (
    jsonb_array_length(public.export_my_data () -> 'messages'),
    2,
    'athlete 1''s export holds their chat'
  );

select
  *
from
  finish ();

rollback;
