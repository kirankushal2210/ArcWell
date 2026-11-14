// Cloud sync for signed-in accounts (D107). Sample builds and signed-out use never reach here.
//
// - On sign-in: the phone's cached copy shows at once, then a pull replaces it. On an account's
//   first pull, what onboarding built on the phone is kept and pushed.
// - Every change to the store is pushed shortly after it settles: only the rows that changed.
// - A pull runs every 20 seconds, when the app comes back to the foreground, and at once when a new
//   message arrives (Realtime). It never overwrites a change made while it was running.
// - Messages received are marked read once the chat has been opened (the store's unread count).
import { localStore } from "@/lib/localStore";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { supabase } from "@/lib/supabase";

import { notify } from "@/features/accounts/repo";

import {
  markRead,
  normalise,
  pull,
  push,
  signFiles,
  uploadFiles,
} from "./cloud";
import {
  assemble,
  coachOf,
  type Ctx,
  decompose,
  diff,
  type PushRow,
  unreadFor,
  type World,
} from "./map";

const PUSH_DELAY_MS = 1200;
const PULL_EVERY_MS = 20000;
export const cloudCacheKey = (uid: string) => `arcwell.cloud.${uid}`;

export type SyncState = "off" | "loading" | "ready" | "offline";

/** The pushes that should reach the other person's phone (SPEC's six notifications). */
function notifyFor(rows: PushRow[], isNew: (r: PushRow) => boolean) {
  const plans = new Set<string>();
  for (const r of rows) {
    if (r.table === "messages")
      void notify({ kind: "message", id: String(r.insert.id) });
    else if (r.table === "check_ins" && r.mode !== "update" && isNew(r))
      void notify({ kind: "check_in", id: String(r.insert.id) });
    else if (r.table === "check_ins" && r.mode === "update" && r.update.reply)
      void notify({
        kind: "check_in_reply",
        athleteId: String(r.match.athlete_id),
        id: String(r.match.id),
      });
    else if (r.table === "plans" && r.match.athlete_id)
      plans.add(String(r.match.athlete_id));
  }
  for (const athleteId of plans) void notify({ kind: "plan", athleteId });
}

export function useCloudSync({
  uid,
  role,
  world,
  apply,
}: {
  uid: string | null;
  role: "athlete" | "coach" | null;
  world: World;
  apply: (w: World) => void;
}) {
  const [state, setState] = useState<SyncState>("off");
  const worldRef = useRef(world);
  const version = useRef(0);
  const prev = useRef<Map<string, PushRow>>(new Map());
  const ctx = useRef<Ctx | null>(null);
  const unread = useRef<Record<string, string[]>>({});
  const busy = useRef<Promise<void> | null>(null);
  const ready = useRef(false);

  // Track the latest world and count changes, so a pull can tell if the store moved meanwhile.
  useEffect(() => {
    worldRef.current = world;
    version.current += 1;
  }, [world]);

  /** Push what changed. Resolves true while some changes still wait to be saved (offline). */
  const flush = async (): Promise<boolean> => {
    const c = ctx.current;
    if (!c || !ready.current) return false;
    let next = decompose(normalise(worldRef.current), c);
    let d = diff(prev.current, next);
    if (!d.write.length && !d.remove.length) return false;
    await uploadFiles(d.write);
    next = decompose(normalise(worldRef.current), c);
    d = diff(prev.current, next);
    const res = await push(d.write, d.remove, d.isNew);
    notifyFor(
      d.write.filter((r) => !res.failed.includes(r)),
      d.isNew,
    );
    // Keep failed rows out of the "pushed" set so they're tried again next time.
    const pushed = new Map(next);
    for (const r of res.failed) {
      const old = prev.current.get(r.key);
      if (old) pushed.set(r.key, old);
      else pushed.delete(r.key);
    }
    for (const r of d.remove) if (res.failed.includes(r)) pushed.set(r.key, r);
    // Rows the server refused for good (not allowed, invalid) are dropped from the retry set; they
    // can't be saved, and the next pull shows what the server holds.
    for (const r of res.failed)
      if (!res.retry.includes(r)) {
        const old = prev.current.get(r.key);
        if (old) pushed.set(r.key, old);
        else pushed.set(r.key, r);
      }
    prev.current = pushed;
    setState(res.retry.length ? "offline" : "ready");
    return res.retry.length > 0;
  };

  const sync = async (first = false) => {
    const c = ctx.current;
    if (!c) return;
    try {
      // Offline changes not saved yet: keep showing them rather than pulling over them.
      if (!first && (await flush())) return;
      const started = version.current;
      const pulled = await pull(c);
      c.coachId = coachOf(pulled, c.uid);
      const server = assemble(pulled, c, worldRef.current, false);
      const shown = await signFiles(
        assemble(pulled, c, worldRef.current, first),
      );
      // What the server holds is the baseline; anything only on the phone gets pushed.
      const base = decompose(normalise(server), c);
      if (!pulled.athlete_profiles.some((r) => r.athlete_id === c.uid))
        base.delete(`athlete_profiles:${c.uid}`);
      if (!pulled.coach_profiles.some((r) => r.coach_id === c.uid))
        base.delete(`coach_profiles:${c.uid}`);
      // Invites worked out on the phone (the coach's general one) count only once the server has them.
      for (const [k, r] of base)
        if (
          r.table === "invites" &&
          !pulled.invites.some((i) => i.code === r.match.code)
        )
          base.delete(k);
      unread.current = unreadFor(pulled, c);
      if (!first && version.current !== started) return; // the store moved while pulling; next round
      prev.current = base;
      ready.current = true;
      worldRef.current = shown;
      apply(shown);
      localStore
        .setItem(cloudCacheKey(c.uid), JSON.stringify(shown))
        .catch(() => {});
      setState("ready");
      if (first) await flush();
    } catch {
      setState(ready.current ? "offline" : "loading");
    }
  };

  const run = (fn: () => Promise<unknown>) => {
    if (busy.current) return busy.current;
    busy.current = fn()
      .then(() => {})
      .finally(() => {
        busy.current = null;
      });
    return busy.current;
  };

  // Start (and stop) with the account.
  useEffect(() => {
    if (!uid || !role || !supabase) {
      ctx.current = null;
      ready.current = false;
      prev.current = new Map();
      return;
    }
    ctx.current = { uid, role };
    let live = true;
    localStore
      .getItem(cloudCacheKey(uid))
      .then((raw) => {
        if (live && raw) apply(JSON.parse(raw) as World);
      })
      .catch(() => {})
      .finally(() => {
        if (live) void run(() => sync(true));
      });

    const timer = setInterval(() => void run(() => sync()), PULL_EVERY_MS);
    const app = AppState.addEventListener("change", (s) => {
      if (s === "active") void run(() => sync());
      else void run(flush);
    });
    const channel = supabase
      .channel(`messages-${uid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => setTimeout(() => void run(() => sync()), 300),
      )
      .subscribe();
    return () => {
      live = false;
      clearInterval(timer);
      app.remove();
      void supabase?.removeChannel(channel);
    };
    // apply is stable enough: it only calls the store's setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, role]);

  // Push changes once they settle; mark messages read once their chat is opened.
  useEffect(() => {
    if (!ctx.current || !ready.current) return;
    const t = setTimeout(() => void run(flush), PUSH_DELAY_MS);
    const c = ctx.current;
    const seen: string[] = [];
    for (const [id, ids] of Object.entries(unread.current)) {
      const opened =
        c.role === "coach"
          ? world.clients.find((x) => x.id === id)?.unread === 0
          : (world.meTier === "coached"
              ? world.clients.find((x) => x.id === world.meId)
              : world.self
            )?.coachUnread === 0;
      if (opened) seen.push(...ids);
      if (opened) delete unread.current[id];
    }
    if (seen.length) void markRead(seen);
    return () => clearTimeout(t);
  }, [world]);

  // "off" without an account; until the first pull lands, "loading".
  const shown: SyncState =
    !uid || !role ? "off" : state === "off" ? "loading" : state;
  // Waits for anything in flight first, so the pull that follows sees the latest server state.
  const syncNow = async () => {
    await busy.current?.catch(() => {});
    await run(() => sync());
  };
  return { state: shown, syncNow };
}
