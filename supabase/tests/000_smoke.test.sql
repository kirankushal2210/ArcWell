-- Smoke test: proves the pgTAP pipeline runs locally and in CI.
-- Phase 1 adds the row-level security tests (coach isolation, join-date
-- visibility, access revoked on leave) alongside the first real tables.
begin;
select plan(1);
select has_schema('public', 'public schema exists');
select * from finish();
rollback;
