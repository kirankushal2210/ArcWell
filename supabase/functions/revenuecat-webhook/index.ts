// revenuecat-webhook (B7): RevenueCat tells Arcwell when an athlete's Arcwell Plus starts, renews,
// is cancelled or expires (Google Play underneath). The app sets RevenueCat's app user id to the
// Supabase user id, so the event names the account directly.
//
// Checks: the shared secret RevenueCat sends in the Authorization header (REVENUECAT_WEBHOOK_AUTH,
// set in the RevenueCat dashboard and as a function secret); the user is an athlete; older events
// never overwrite newer ones. Only the subscriptions row changes. Nothing from the body is logged.
import { plusChange, type RcEvent } from "../_shared/billing.ts";
import { asService, reply, safeEqual, UUID } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, { error: "method" });
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_AUTH") ?? "";
  const given = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !safeEqual(given, secret)) return reply(401, { error: "unauthorized" });

  let event: RcEvent;
  try {
    event = ((await req.json()) as { event?: RcEvent }).event ?? {};
  } catch {
    return reply(400, { error: "bad_request" });
  }
  if (event.type === "TEST") return reply(200, { ok: true });

  const userId = event.app_user_id ?? "";
  if (!UUID.test(userId)) return reply(200, { ok: true, ignored: "anonymous user" });

  const change = plusChange(event);
  if (change.action === "ignore") return reply(200, { ok: true, ignored: event.type ?? "" });

  const db = asService();
  const { data: profile } = await db.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role !== "athlete") return reply(200, { ok: true, ignored: "not an athlete" });

  const { data: current } = await db
    .from("subscriptions")
    .select("last_event_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (current?.last_event_at && current.last_event_at > change.eventAt)
    return reply(200, { ok: true, ignored: "older event" });

  const { error } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      tier: change.tier,
      source: change.source,
      product_id: change.productId,
      expires_at: change.expiresAt,
      last_event_at: change.eventAt,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("revenuecat-webhook: write failed", error.code);
    return reply(500, { error: "server" });
  }
  return reply(200, { ok: true, tier: change.tier });
});
