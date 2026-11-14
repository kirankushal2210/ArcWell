// What a billing event means for Arcwell (B7), kept free of I/O so it can be read and tested on its
// own. RevenueCat reports Arcwell Plus (Google Play); Razorpay reports coach plans.

// ---------- RevenueCat → subscriptions (athletes) ----------

export type RcEvent = {
  type?: string;
  app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number | null;
  event_timestamp_ms?: number;
  period_type?: string;
};

export type PlusChange =
  | { action: "ignore" }
  | {
      action: "set";
      tier: "pro" | "free";
      source: "play" | "trial" | "none";
      expiresAt: string | null;
      productId: string | null;
      eventAt: string;
    };

const GIVES_ACCESS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
  // A cancelled subscription keeps access until it expires; the expiry time is what matters.
  "CANCELLATION",
  // Google keeps access during a billing retry grace period.
  "BILLING_ISSUE",
]);

export function plusChange(e: RcEvent): PlusChange {
  const at = new Date(e.event_timestamp_ms ?? Date.now()).toISOString();
  const type = e.type ?? "";
  if (type === "EXPIRATION")
    return {
      action: "set",
      tier: "free",
      source: "none",
      expiresAt: null,
      productId: e.product_id ?? null,
      eventAt: at,
    };
  if (!GIVES_ACCESS.has(type)) return { action: "ignore" };
  const expires = e.expiration_at_ms ? new Date(e.expiration_at_ms) : null;
  const live = !expires || expires.getTime() > Date.now();
  return {
    action: "set",
    tier: live ? "pro" : "free",
    source: live ? (e.period_type === "TRIAL" ? "trial" : "play") : "none",
    expiresAt: expires ? expires.toISOString() : null,
    productId: e.product_id ?? null,
    eventAt: at,
  };
}

// ---------- Razorpay → coach_billing (coaches) ----------

export type RzSubscription = {
  id?: string;
  status?: string;
  plan_id?: string;
  current_end?: number | null;
  notes?: Record<string, string> | null;
};

export type CoachChange =
  | { action: "ignore" }
  | {
      action: "set";
      coachId: string;
      status: "active" | "grace" | "lapsed";
      subscriptionId: string;
      plan: string | null;
      periodEnd: string | null;
    };

const RZ_STATUS: Record<string, "active" | "grace" | "lapsed"> = {
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.resumed": "active",
  "subscription.authenticated": "active",
  // A failed charge: 7 days' grace before the coach is blocked (D41).
  "subscription.pending": "grace",
  "subscription.halted": "lapsed",
  "subscription.paused": "lapsed",
  "subscription.cancelled": "lapsed",
  "subscription.completed": "lapsed",
};

/** The coach is named in the subscription's notes when the payment link is made (coach_id). */
export function coachChange(event: string, s: RzSubscription | undefined): CoachChange {
  const status = RZ_STATUS[event];
  const coachId = s?.notes?.coach_id ?? "";
  if (!status || !s?.id || !coachId) return { action: "ignore" };
  return {
    action: "set",
    coachId,
    status,
    subscriptionId: s.id,
    plan: s.plan_id ?? null,
    periodEnd: s.current_end ? new Date(s.current_end * 1000).toISOString() : null,
  };
}
