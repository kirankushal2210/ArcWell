-- B5: weekly check-ins, chat, push tokens and private files.
--
-- check_ins    The athlete's weekly check-in. The athlete writes the check-in; the coach writes only
--              the reply (reply, reviewed_at). Coach reads from the join date.
-- messages     Coach–athlete chat. Either side sends only while linked; each side reads its own
--              conversation (the coach only from the join date). The recipient marks read.
--              Realtime is on for this table.
-- push_tokens  Expo push tokens per device. Only the owner.
-- Storage      One private bucket, athlete-files, laid out as <athlete id>/<area>/<file>. The
--              athlete reads and writes their folder; the current coach reads it and may add chat
--              attachments. Photos are opened through short-lived signed URLs (D72).

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.check_ins (
  athlete_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  at timestamptz not null default now(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  reply text check (char_length(reply) <= 4000),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (athlete_id, id)
);

create index check_ins_athlete_at_idx on public.check_ins (athlete_id, at desc);

comment on table public.check_ins is 'Weekly check-ins; athlete writes, coach replies, coach reads from join date.';

create table public.messages (
  id uuid primary key default gen_random_uuid (),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  sender uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  body text not null default '' check (char_length(body) <= 4000),
  -- {"kind":"image"|"file","path":"<athlete id>/chat/...","name":"..."}
  attachment jsonb check (attachment is null or jsonb_typeof(attachment) = 'object'),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender = coach_id or sender = athlete_id),
  check (char_length(body) > 0 or attachment is not null)
);

create index messages_pair_idx on public.messages (athlete_id, coach_id, created_at desc);

comment on table public.messages is 'Coach–athlete chat; sent only while linked.';

create table public.push_tokens (
  token text primary key check (char_length(token) between 10 and 300),
  user_id uuid not null default auth.uid () references public.profiles (id) on delete cascade,
  platform text not null default 'android' check (platform in ('android', 'ios', 'web')),
  updated_at timestamptz not null default now()
);

comment on table public.push_tokens is 'Expo push tokens; owner only.';

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

-- The athlete writes the check-in; the coach writes only the reply.
create function public.check_ins_guard () returns trigger language plpgsql
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
begin
  perform public.check_role (new.athlete_id, 'athlete');
  if tg_op = 'UPDATE' then
    if me = new.athlete_id then
      if new.reply is distinct from old.reply or new.reviewed_at is distinct from old.reviewed_at then
        raise exception 'only the coach replies' using errcode = '42501';
      end if;
    else
      if new.payload is distinct from old.payload or new.at is distinct from old.at then
        raise exception 'only the athlete edits a check-in' using errcode = '42501';
      end if;
    end if;
  elsif me is distinct from new.athlete_id or new.reply is not null or new.reviewed_at is not null then
    raise exception 'only the athlete sends a check-in' using errcode = '42501';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger check_ins_guard before insert
or
update on public.check_ins for each row
execute function public.check_ins_guard ();

-- Messages: sent only inside a current link; afterwards only read_at changes, by the recipient.
create function public.messages_guard () returns trigger language plpgsql
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if new.sender is distinct from me then
      raise exception 'send as yourself' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.coach_clients
      where coach_id = new.coach_id and client_id = new.athlete_id and ended_at is null
    ) then
      raise exception 'not linked' using errcode = '42501';
    end if;
    new.created_at := now();
    new.read_at := null;
  else
    if (to_jsonb(new) - 'read_at') is distinct from (to_jsonb(old) - 'read_at') then
      raise exception 'messages cannot be edited' using errcode = '42501';
    end if;
    if me = old.sender then
      raise exception 'only the recipient marks read' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger messages_guard before insert
or
update on public.messages for each row
execute function public.messages_guard ();

create trigger push_tokens_touch before
update on public.push_tokens for each row
execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

alter table public.check_ins enable row level security;

alter table public.messages enable row level security;

alter table public.push_tokens enable row level security;

create policy check_ins_select on public.check_ins for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read (athlete_id, at)
  );

create policy check_ins_insert on public.check_ins for insert to authenticated
with
  check (athlete_id = (select auth.uid()));

create policy check_ins_update on public.check_ins
for update
  to authenticated using (
    athlete_id = (select auth.uid())
    or public.coach_can_read (athlete_id, at)
  )
with
  check (
    athlete_id = (select auth.uid())
    or public.coach_can_read (athlete_id, at)
  );

create policy check_ins_delete on public.check_ins for delete to authenticated using (athlete_id = (select auth.uid()));

create policy messages_select on public.messages for
select
  to authenticated using (
    athlete_id = (select auth.uid())
    or (
      coach_id = (select auth.uid())
      and public.coach_can_read (athlete_id, created_at)
    )
  );

create policy messages_insert on public.messages for insert to authenticated
with
  check (
    sender = (select auth.uid())
    and (
      athlete_id = (select auth.uid())
      or coach_id = (select auth.uid())
    )
  );

create policy messages_update on public.messages
for update
  to authenticated using (
    athlete_id = (select auth.uid())
    or (
      coach_id = (select auth.uid())
      and public.coach_can_read (athlete_id, created_at)
    )
  )
with
  check (
    athlete_id = (select auth.uid())
    or coach_id = (select auth.uid())
  );

create policy push_tokens_all on public.push_tokens for all to authenticated using (user_id = (select auth.uid()))
with
  check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Privileges and realtime
-- ---------------------------------------------------------------------------------------------

revoke all on public.check_ins,
public.messages,
public.push_tokens
from
  anon,
  authenticated;

grant
select
,
  insert (athlete_id, id, at, payload),
update (at, payload, reply, reviewed_at),
delete on public.check_ins to authenticated;

grant
select
,
  insert (coach_id, athlete_id, sender, body, attachment),
update (read_at) on public.messages to authenticated;

grant
select
,
  insert (token, user_id, platform),
update (user_id, platform),
delete on public.push_tokens to authenticated;

alter publication supabase_realtime
add table public.messages;

revoke all on function public.check_ins_guard (),
public.messages_guard ()
from
  public,
  anon;

-- ---------------------------------------------------------------------------------------------
-- Storage: athlete-files
-- ---------------------------------------------------------------------------------------------

insert into
  storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'athlete-files',
    'athlete-files',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do nothing;

-- The athlete whose folder an object sits in, or null for anything else.
create function public.storage_owner (object_name text) returns uuid language plpgsql immutable
set
  search_path = '' as $$
begin
  return (string_to_array(object_name, '/'))[1]::uuid;
exception when others then
  return null;
end;
$$;

create policy athlete_files_select on storage.objects for
select
  to authenticated using (
    bucket_id = 'athlete-files'
    and (
      public.storage_owner (name) = (select auth.uid())
      or public.is_active_coach_of (public.storage_owner (name))
    )
  );

create policy athlete_files_insert on storage.objects for insert to authenticated
with
  check (
    bucket_id = 'athlete-files'
    and (
      public.storage_owner (name) = (select auth.uid())
      -- The coach adds chat attachments to a current client's chat folder.
      or (
        public.is_active_coach_of (public.storage_owner (name))
        and (string_to_array(name, '/'))[2] = 'chat'
      )
    )
  );

create policy athlete_files_update on storage.objects
for update
  to authenticated using (
    bucket_id = 'athlete-files'
    and public.storage_owner (name) = (select auth.uid())
  );

create policy athlete_files_delete on storage.objects for delete to authenticated using (
  bucket_id = 'athlete-files'
  and public.storage_owner (name) = (select auth.uid())
);

grant
execute on function public.storage_owner (text) to authenticated;
