-- Chat (B5): the app chooses each message's id (a hash of who sent what when, D107), so a message
-- retried after a lost reply is never stored twice. Allow inserting the id; nothing else changes.
grant insert (id) on public.messages to authenticated;
