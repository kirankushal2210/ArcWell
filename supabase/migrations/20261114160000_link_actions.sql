-- Link actions for the app (B1, D107).
--
-- redeem_invite()  Also hands over the details the coach entered on a personal invite: the invited
--                  name (when the athlete has none yet) and the basics, as the start of the athlete's
--                  profile document. The athlete can change both afterwards.
-- end_link()       Ends the current link with the other person, from either side: the athlete
--                  leaves ('left'); the coach completes or removes. Wraps end_coaching(), so the
--                  same rules apply.
-- share_history()  The athlete's one switch (D37): share everything from before joining, or go back
--                  to the join date.

create or replace function public.redeem_invite (p_code text) returns uuid language plpgsql security definer
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  i public.invites;
  link uuid;
  k text;
  v jsonb;
begin
  if (select role from public.profiles where id = me) is distinct from 'athlete' then
    raise exception 'only athlete accounts can join a coach' using errcode = '42501';
  end if;
  select * into i from public.invites where code = upper(trim(p_code)) for update;
  if not found or not public.invite_usable (i) then
    raise exception 'invite not valid' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.coach_clients where client_id = me and ended_at is null) then
    raise exception 'already coached' using errcode = '23505';
  end if;
  if not public.coach_in_good_standing (i.coach_id) or not public.coach_has_room (i.coach_id) then
    raise exception 'coach not taking clients' using errcode = '53400';
  end if;
  insert into public.coach_clients (coach_id, client_id) values (i.coach_id, me) returning id into link;
  if i.kind = 'personal' then
    update public.invites set used_by = me, used_at = now() where id = i.id;
    update public.profiles set display_name = coalesce(display_name, i.client_name) where id = me;
    if jsonb_typeof(i.payload -> 'client') = 'object' then
      -- The coach's details start the profile; anything the athlete already saved wins.
      insert into public.athlete_profiles (athlete_id, payload)
      values (me, i.payload -> 'client')
      on conflict (athlete_id) do update
      set payload = excluded.payload || public.athlete_profiles.payload;
    end if;
    for k, v in select * from jsonb_each(coalesce(i.payload -> 'plans', '{}'::jsonb)) loop
      if k in ('training', 'nutrition', 'recovery', 'supplements', 'meta') and jsonb_typeof(v) = 'object' then
        insert into public.plans (athlete_id, kind, payload)
        values (me, k, v)
        on conflict (athlete_id, kind) do update set payload = excluded.payload;
      end if;
    end loop;
    if jsonb_typeof(i.payload -> 'notes') = 'object' then
      insert into public.coach_client_notes (coach_id, client_id, payload)
      values (i.coach_id, me, i.payload -> 'notes')
      on conflict (coach_id, client_id) do update set payload = excluded.payload;
    end if;
  end if;
  return link;
end;
$$;

create function public.end_link (other uuid, reason text) returns void language plpgsql security definer
set
  search_path = '' as $$
declare
  me uuid := (select auth.uid());
  link uuid;
begin
  select id into link from public.coach_clients
  where ended_at is null
    and ((coach_id = me and client_id = other) or (client_id = me and coach_id = other));
  if link is null then
    raise exception 'no current link' using errcode = 'P0002';
  end if;
  perform public.end_coaching (link, reason);
end;
$$;

create function public.share_history (share boolean) returns void language plpgsql security definer
set
  search_path = '' as $$
declare
  link uuid;
begin
  select id into link from public.coach_clients
  where client_id = (select auth.uid()) and ended_at is null;
  if link is null then
    raise exception 'no current coach' using errcode = 'P0002';
  end if;
  perform public.set_history_access (link, case when share then '1970-01-01'::timestamptz end);
end;
$$;

revoke all on function public.end_link (uuid, text),
public.share_history (boolean)
from
  public,
  anon;

grant
execute on function public.end_link (uuid, text),
public.share_history (boolean) to authenticated;
