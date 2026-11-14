-- Schema hygiene (doc 05 rules 2, 8 and 11): checks that hold for every table and function, so a new
-- table that forgets one fails here even before its own access tests are written.
begin;
select plan(5);

select is(
  (select count(*)::int from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and not c.relrowsecurity),
  0,
  'every public table has row-level security on'
);

select is(
  (select count(*)::int from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
      and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname)),
  0,
  'every public table has at least one policy'
);

select is(
  (select count(*)::int from information_schema.role_table_grants
    where grantee = 'anon' and table_schema = 'public'),
  0,
  'signed-out users have no table privileges'
);

select is(
  (select count(*)::int from pg_constraint c
    where c.contype = 'f' and c.connamespace = 'public'::regnamespace
      and not exists (select 1 from pg_index i where i.indrelid = c.conrelid and i.indkey[0] = c.conkey[1])),
  0,
  'every foreign key has an index'
);

select is(
  (select count(*)::int from pg_proc p
    where p.pronamespace = 'public'::regnamespace and p.prosecdef
      and not coalesce(p.proconfig @> array['search_path=""'], false)),
  0,
  'every security definer function pins an empty search_path'
);

select * from finish();
rollback;
