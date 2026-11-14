// cron (D111, tickets D-04 and S-03): called by pg_cron through pg_net, never by the app.
//   { job: "reminders" }  every 15 minutes: the workout and check-in reminders due now. The database
//                         picks them (claim_reminders: notification switches, reminder times, paused
//                         clients) and records each one, so a repeated run never sends twice.
//   { job: "purge" }      daily: removes files left in storage by accounts that no longer exist (the
//                         database part of the retention job runs in purge_expired()).
// The caller proves itself with the shared CRON_SECRET (stored in Vault as cron_secret), checked
// before anything else. Pushes carry no health data.
import { asService, reply, safeEqual, UUID } from "../_shared/http.ts";
import { removeUserFiles, userFolders } from "../_shared/files.ts";
import { type Push, sendPush } from "../_shared/push.ts";

const PUSHES: Record<string, Push> = {
  workout: {
    title: "Training time",
    body: "Your workout reminder. Open Arcwell for your next session.",
    data: { route: "/athlete/training" },
  },
  check_in: {
    title: "Check-in due today",
    body: "Your weekly check-in is ready for you.",
    data: { route: "/athlete/weekly-check-in" },
  },
};

async function reminders() {
  const db = asService();
  const { data: due, error } = await db.rpc("claim_reminders");
  if (error) {
    console.error("cron: claim_reminders failed", error.code ?? "error");
    return reply(500, { error: "server" });
  }
  const rows = (due ?? []) as { user_id: string; kind: string }[];
  let sent = 0;
  const dead: string[] = [];
  for (const kind of Object.keys(PUSHES)) {
    const ids = rows.filter((r) => r.kind === kind).map((r) => r.user_id);
    if (!ids.length) continue;
    const { data: toks } = await db.from("push_tokens").select("token").in("user_id", ids);
    const res = await sendPush((toks ?? []).map((t) => t.token as string), PUSHES[kind]);
    sent += res.sent;
    dead.push(...res.dead);
  }
  if (dead.length) await db.from("push_tokens").delete().in("token", dead);
  return reply(200, { ok: true, due: rows.length, sent });
}

async function purge() {
  const db = asService();
  const folders = (await userFolders(db)).filter((n) => UUID.test(n));
  let removed = 0;
  let orphans = 0;
  for (let i = 0; i < folders.length; i += 200) {
    const part = folders.slice(i, i + 200);
    const { data: live, error } = await db.from("profiles").select("id").in("id", part);
    if (error) {
      console.error("cron: profile lookup failed", error.code ?? "error");
      return reply(500, { error: "server" });
    }
    const keep = new Set((live ?? []).map((p) => p.id as string));
    for (const id of part.filter((f) => !keep.has(f))) {
      orphans++;
      removed += await removeUserFiles(db, id);
    }
  }
  return reply(200, { ok: true, orphans, removed });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, { error: "method" });
  const secret = Deno.env.get("CRON_SECRET") ?? "";
  const given = req.headers.get("x-cron-secret") ?? "";
  if (!secret || !safeEqual(given, secret)) return reply(401, { error: "not_allowed" });

  let job: unknown;
  try {
    job = (await req.json())?.job;
  } catch {
    return reply(400, { error: "bad_request" });
  }
  if (job === "reminders") return reminders();
  if (job === "purge") return purge();
  return reply(400, { error: "bad_request" });
});
