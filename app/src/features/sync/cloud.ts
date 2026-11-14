// The network side of sync (D107): pull everything a signed-in account can read, push the rows that
// changed, and move files between the phone and private storage. RLS on every table decides what a
// pull returns and what a push may write; errors returned here never include anyone's data.
import { supabase } from "@/lib/supabase";

import { isLocalUri, isStored, STORED } from "./ids";
import type { Ctx, Pulled, PushRow, Tier } from "./map";

const BUCKET = "athlete-files";
const SIGNED_SECONDS = 60 * 60;

const TABLES = [
  "profiles",
  "coach_clients",
  "athlete_profiles",
  "coach_profiles",
  "coach_client_notes",
  "plans",
  "enhanced",
  "templates",
  "leads",
  "custom_exercises",
  "workouts",
  "routines",
  "food_logs",
  "my_foods",
  "check_ins",
  "messages",
  "body_logs",
  "progress_photos",
  "day_logs",
  "transformations",
  "invites",
  "coach_billing",
] as const;

/** Tables only one side ever reads; skip the rest to keep pulls small. */
const COACH_ONLY = new Set([
  "templates",
  "leads",
  "invites",
  "coach_billing",
  "coach_client_notes",
]);
const ATHLETE_ONLY = new Set(["my_foods"]);

export async function pull(ctx: Ctx): Promise<Pulled> {
  if (!supabase) throw new Error("accounts off");
  const db = supabase;
  const tables = TABLES.filter((t) =>
    ctx.role === "coach" ? !ATHLETE_ONLY.has(t) : !COACH_ONLY.has(t),
  );
  const results = await Promise.all(
    tables.map(async (t) => {
      const { data, error } = await db.from(t).select("*").limit(5000);
      if (error) throw new Error(`pull ${t}: ${error.code ?? "error"}`);
      return [t, data ?? []] as const;
    }),
  );
  const out = Object.fromEntries(
    TABLES.map((t) => [t, []]),
  ) as unknown as Pulled;
  for (const [t, rows] of results) (out as Record<string, unknown>)[t] = rows;
  out.tier = "free";
  if (ctx.role === "athlete") {
    const { data } = await db.rpc("athlete_tier");
    out.tier = (data as Tier) ?? "free";
  }
  return out;
}

// ---------- Files ----------

/** Local file URI → stored path ("sb:athlete-files/…"), so a file is uploaded once. */
const uploaded = new Map<string, string>();
/** Signed URL handed to the screens → stored path, so pushes write the path back, not the URL. */
const signedToStored = new Map<string, string>();

const walk = (v: unknown, fn: (s: string) => string): unknown => {
  if (typeof v === "string") return fn(v);
  if (Array.isArray(v)) return v.map((x) => walk(x, fn));
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) o[k] = walk(x, fn);
    return o;
  }
  return v;
};

/** Replace signed URLs and already-uploaded local files with their stored paths. */
export function normalise<T>(v: T): T {
  return walk(v, (s) => signedToStored.get(s) ?? uploaded.get(s) ?? s) as T;
}

const extOf = (uri: string, type: string) =>
  type.includes("pdf")
    ? "pdf"
    : type.includes("png")
      ? "png"
      : type.includes("webp")
        ? "webp"
        : "jpg";

async function uploadOne(uri: string, owner: string, area: string) {
  if (!supabase) return;
  const res = await fetch(uri);
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}.${extOf(uri, type)}`;
  const path = `${owner}/${area}/${name}`;
  const body = await blob.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType: type });
  if (!error) uploaded.set(uri, `${STORED}${BUCKET}/${path}`);
}

const AREA: Record<string, string> = {
  athlete_profiles: "profile",
  check_ins: "checkins",
  progress_photos: "photos",
  messages: "chat",
  transformations: "transformations",
};

/** Upload every local file named in these rows, into the owner's folder. */
export async function uploadFiles(rows: PushRow[]) {
  const jobs: Promise<void>[] = [];
  for (const r of rows) {
    if (!r.filesOwner) continue;
    walk([r.insert, r.update], (s) => {
      if (isLocalUri(s) && !uploaded.has(s))
        jobs.push(
          uploadOne(s, r.filesOwner!, AREA[r.table] ?? "files").catch(() => {}),
        );
      return s;
    });
  }
  await Promise.all(jobs);
}

/** Turn stored paths in a pulled world into signed URLs the screens can show. */
export async function signFiles<T>(world: T): Promise<T> {
  if (!supabase) return world;
  const paths = new Set<string>();
  walk(world, (s) => {
    if (isStored(s)) paths.add(s);
    return s;
  });
  if (!paths.size) return world;
  const list = [...paths].map((p) => p.slice(`${STORED}${BUCKET}/`.length));
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(list, SIGNED_SECONDS);
  const url = new Map<string, string>();
  for (const d of data ?? [])
    if (d.signedUrl && d.path) {
      const stored = `${STORED}${BUCKET}/${d.path}`;
      url.set(stored, d.signedUrl);
      signedToStored.set(d.signedUrl, stored);
    }
  return walk(world, (s) => url.get(s) ?? s) as T;
}

// ---------- Push ----------

/**
 * `failed` rows weren't saved. `retry` is the part that failed for a passing reason (offline, a
 * timeout): the phone keeps them and doesn't let a pull overwrite them until they're saved.
 */
export type PushResult = { ok: number; failed: PushRow[]; retry: PushRow[] };

/** No code (network) or a connection or timeout error: worth trying again. */
const passing = (e: { code?: string }) =>
  !e.code ||
  e.code.startsWith("08") ||
  e.code === "57014" ||
  e.code === "PGRST301";

const without = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export async function push(
  write: PushRow[],
  remove: PushRow[],
  isNew: (r: PushRow) => boolean,
): Promise<PushResult> {
  if (!supabase) return { ok: 0, failed: write, retry: [] };
  const db = supabase;
  const failed: PushRow[] = [];
  const retry: PushRow[] = [];
  let ok = 0;
  // Parents first: profiles and links before the rows that refer to them.
  const order = [
    "profiles",
    "athlete_profiles",
    "coach_profiles",
    "invites",
    "coach_client_notes",
    "plans",
  ];
  const rank = (t: string) =>
    order.includes(t) ? order.indexOf(t) : order.length;
  const sorted = [...write].sort((a, b) => rank(a.table) - rank(b.table));

  for (const r of sorted) {
    const insert = without(r.insert);
    const update = without(r.update);
    const mode = r.mode ?? "upsert";
    let error: { code?: string } | null = null;
    if (mode === "update" || (mode === "upsert" && !isNew(r))) {
      if (!Object.keys(update).length) continue;
      const res = await db.from(r.table).update(update).match(r.match).select();
      error = res.error;
      // Nothing there yet (changed on the phone before its first push landed): create it.
      if (!error && mode === "upsert" && !res.data?.length)
        ({ error } = await db.from(r.table).insert(insert));
    } else {
      ({ error } = await db.from(r.table).insert(insert));
      // Already there (another device, or an earlier push whose reply was lost).
      if (error?.code === "23505") {
        error = null;
        if (mode === "upsert" && Object.keys(update).length)
          ({ error } = await db.from(r.table).update(update).match(r.match));
      }
    }
    if (error) {
      failed.push(r);
      if (passing(error)) retry.push(r);
    } else ok++;
  }
  for (const r of remove) {
    const { error } = await db.from(r.table).delete().match(r.match);
    if (error) {
      failed.push(r);
      if (passing(error)) retry.push(r);
    } else ok++;
  }
  return { ok, failed, retry };
}

/** Mark received messages read once the chat has been opened. */
export async function markRead(ids: string[]) {
  if (!supabase || !ids.length) return;
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .in("id", ids);
}
