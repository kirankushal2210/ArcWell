// demo-billing (B7, investor demos only): stands in for a Google Play purchase until the Play Console
// account exists (paid, after funding). It writes the same subscriptions row the revenuecat-webhook
// writes, so everything downstream (athlete_tier, AI entitlement) is the real path.
//
// Off unless the DEMO_BILLING secret is "on"; never set it in production. Acts only on the caller.
import { asCaller, asService, cors, reply } from "../_shared/http.ts";

const TRIAL_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (Deno.env.get("DEMO_BILLING") !== "on") return reply(404, { error: "off" });
  if (req.method !== "POST") return reply(405, { error: "method" });
  const auth = req.headers.get("Authorization");
  if (!auth) return reply(401, { error: "signed_out" });
  const { data } = await asCaller(auth).auth.getUser();
  const id = data?.user?.id;
  if (!id) return reply(401, { error: "signed_out" });

  let action = "trial";
  try {
    action = ((await req.json()) as { action?: string }).action ?? "trial";
  } catch {
    // No body: start a trial.
  }
  const db = asService();
  const { data: profile } = await db.from("profiles").select("role").eq("id", id).maybeSingle();
  if (profile?.role !== "athlete") return reply(403, { error: "athletes_only" });

  const row =
    action === "cancel"
      ? { user_id: id, tier: "free", source: "none", expires_at: null }
      : {
          user_id: id,
          tier: "pro",
          source: "trial",
          product_id: "demo_plus",
          expires_at: new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString(),
        };
  const { error } = await db
    .from("subscriptions")
    .upsert({ ...row, last_event_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return reply(500, { error: "server" });
  return reply(200, { ok: true, tier: row.tier });
});
