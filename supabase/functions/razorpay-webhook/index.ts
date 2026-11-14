// razorpay-webhook (B7): Razorpay tells Arcwell when a coach's plan is paid, fails or ends. Coaches
// pay outside the app through subscription links made with notes.coach_id = their Supabase user id.
//
// Checks: the X-Razorpay-Signature HMAC-SHA256 of the raw body with RAZORPAY_WEBHOOK_SECRET; the
// account is a coach. Only coach_billing changes; clients are never affected (D41). Works the same in
// Razorpay test mode, which needs no KYC. Nothing from the body is logged.
import { coachChange, type RzSubscription } from "../_shared/billing.ts";
import { asService, hmacSha256Hex, reply, safeEqual, UUID } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, { error: "method" });
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
  const raw = await req.text();
  const signature = req.headers.get("X-Razorpay-Signature") ?? "";
  if (!secret || !safeEqual(await hmacSha256Hex(secret, raw), signature))
    return reply(401, { error: "unauthorized" });

  let body: { event?: string; created_at?: number; payload?: { subscription?: { entity?: RzSubscription } } };
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: "bad_request" });
  }
  const change = coachChange(body.event ?? "", body.payload?.subscription?.entity);
  if (change.action === "ignore" || !UUID.test(change.coachId))
    return reply(200, { ok: true, ignored: body.event ?? "" });

  const db = asService();
  const { data: profile } = await db.from("profiles").select("role").eq("id", change.coachId).maybeSingle();
  if (profile?.role !== "coach") return reply(200, { ok: true, ignored: "not a coach" });

  const eventAt = new Date((body.created_at ?? Date.now() / 1000) * 1000).toISOString();
  const { data: current } = await db
    .from("coach_billing")
    .select("last_event_at")
    .eq("coach_id", change.coachId)
    .maybeSingle();
  if (current?.last_event_at && current.last_event_at > eventAt)
    return reply(200, { ok: true, ignored: "older event" });

  const { error } = await db.from("coach_billing").upsert(
    {
      coach_id: change.coachId,
      status: change.status,
      plan: change.plan,
      razorpay_subscription_id: change.subscriptionId,
      current_period_end: change.periodEnd,
      last_event_at: eventAt,
    },
    { onConflict: "coach_id" },
  );
  if (error) {
    console.error("razorpay-webhook: write failed", error.code);
    return reply(500, { error: "server" });
  }
  return reply(200, { ok: true, status: change.status });
});
