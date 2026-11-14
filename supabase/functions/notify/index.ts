// notify (B5): push notifications for the six events in SPEC, sent through Expo's free push service.
// The app calls this right after the action: a message sent, a check-in submitted, a check-in reply,
// or a plan changed. The function checks the caller really did it and finds the other person's
// devices. Notifications never carry health data or message text: only who and what kind
// ("New message from Coach Anjali").
import { asCaller, asService, cors, reply } from "../_shared/http.ts";

type Event =
  | { kind: "message"; id: string }
  | { kind: "check_in"; id: string }
  | { kind: "check_in_reply"; athleteId: string; id: string }
  | { kind: "plan"; athleteId: string };

async function sendPush(tokens: string[], title: string, body: string, data: Record<string, string>) {
  if (!tokens.length) return 0;
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(tokens.map((to) => ({ to, title, body, data, sound: "default" }))),
  }).catch(() => null);
  return res?.ok ? tokens.length : 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });
  const auth = req.headers.get("Authorization");
  if (!auth) return reply(401, { error: "signed_out" });

  let ev: Event;
  try {
    ev = await req.json();
  } catch {
    return reply(400, { error: "bad_request" });
  }
  const me = asCaller(auth);
  const { data: u } = await me.auth.getUser();
  const caller = u?.user?.id;
  if (!caller) return reply(401, { error: "signed_out" });

  // Every lookup runs as the caller first, so RLS proves they can see what they're notifying about.
  let to = "";
  let title = "";
  let route = "";
  if (ev.kind === "message") {
    const { data: m } = await me.from("messages").select("coach_id, athlete_id, sender").eq("id", ev.id).maybeSingle();
    if (!m || m.sender !== caller) return reply(403, { error: "not_allowed" });
    to = caller === m.coach_id ? m.athlete_id : m.coach_id;
    title = "New message";
    route = caller === m.coach_id ? "/athlete/chat" : `/coach/chat/${m.athlete_id}`;
  } else if (ev.kind === "check_in") {
    const { data: k } = await me.from("check_ins").select("athlete_id").eq("id", ev.id).eq("athlete_id", caller).maybeSingle();
    const { data: link } = await me.from("coach_clients").select("coach_id").eq("client_id", caller).is("ended_at", null).maybeSingle();
    if (!k || !link) return reply(403, { error: "not_allowed" });
    to = link.coach_id;
    title = "Check-in submitted";
    route = "/coach/check-ins";
  } else if (ev.kind === "check_in_reply") {
    const { data: k } = await me.from("check_ins").select("reply").eq("athlete_id", ev.athleteId).eq("id", ev.id).maybeSingle();
    if (!k?.reply) return reply(403, { error: "not_allowed" });
    to = ev.athleteId;
    title = "Your coach replied to your check-in";
    route = "/athlete/weekly-check-in";
  } else if (ev.kind === "plan") {
    const { data: ok } = await me.rpc("can_write_plans", { athlete: ev.athleteId });
    if (!ok || ev.athleteId === caller) return reply(403, { error: "not_allowed" });
    to = ev.athleteId;
    title = "Your plan was updated";
    route = "/athlete/training";
  } else {
    return reply(400, { error: "bad_request" });
  }

  const db = asService();
  const { data: who } = await db.from("profiles").select("display_name").eq("id", caller).maybeSingle();
  const { data: rows } = await db.from("push_tokens").select("token").eq("user_id", to);
  const sent = await sendPush(
    (rows ?? []).map((r) => r.token as string),
    title,
    who?.display_name ? `From ${who.display_name}` : "Open Arcwell to see it",
    { route },
  );
  return reply(200, { ok: true, sent });
});
