-- Indexes for foreign keys that had none (backend audit, 14 November 2026).
--
-- Without them, deleting an account (every table cascades from auth.users) scans whole tables, and
-- the lookups the app and functions make by these columns do too: a coach's messages, the push
-- tokens `notify` reads, a coach's transformation requests, a client's notes.
create index if not exists messages_coach_idx on public.messages (coach_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender);
create index if not exists push_tokens_user_idx on public.push_tokens (user_id);
create index if not exists coach_client_notes_client_idx on public.coach_client_notes (client_id);
create index if not exists transformations_coach_idx on public.transformations (coach_id);
create index if not exists invites_used_by_idx on public.invites (used_by) where used_by is not null;
create index if not exists plans_updated_by_idx on public.plans (updated_by) where updated_by is not null;
