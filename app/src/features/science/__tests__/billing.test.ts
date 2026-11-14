// B7: what a RevenueCat or Razorpay event means for an account (PRD launch gate: billing is tested).
import { describe, expect, it } from "@jest/globals";

import {
  coachChange,
  plusChange,
} from "../../../../../supabase/functions/_shared/billing";

const DAY = 86_400_000;
const at = Date.UTC(2026, 10, 14);

describe("plusChange (RevenueCat → Arcwell Plus)", () => {
  it("a purchase gives Plus until it expires", () => {
    const c = plusChange({
      type: "INITIAL_PURCHASE",
      product_id: "plus_monthly",
      expiration_at_ms: Date.now() + 30 * DAY,
      event_timestamp_ms: at,
    });
    expect(c).toMatchObject({
      action: "set",
      tier: "pro",
      source: "play",
      productId: "plus_monthly",
    });
    expect(c.action === "set" && c.eventAt).toBe(new Date(at).toISOString());
  });
  it("a trial is marked as a trial", () => {
    const c = plusChange({
      type: "INITIAL_PURCHASE",
      period_type: "TRIAL",
      expiration_at_ms: Date.now() + 7 * DAY,
    });
    expect(c).toMatchObject({ tier: "pro", source: "trial" });
  });
  it("a cancellation keeps Plus until the paid period ends", () => {
    expect(
      plusChange({
        type: "CANCELLATION",
        expiration_at_ms: Date.now() + 5 * DAY,
      }),
    ).toMatchObject({ tier: "pro" });
  });
  it("Google's billing retry keeps Plus during grace", () => {
    expect(
      plusChange({
        type: "BILLING_ISSUE",
        expiration_at_ms: Date.now() + 3 * DAY,
      }),
    ).toMatchObject({ tier: "pro" });
  });
  it("an event whose expiry has passed gives free", () => {
    expect(
      plusChange({ type: "RENEWAL", expiration_at_ms: Date.now() - DAY }),
    ).toMatchObject({ tier: "free", source: "none" });
  });
  it("expiration ends Plus", () => {
    expect(plusChange({ type: "EXPIRATION" })).toMatchObject({
      action: "set",
      tier: "free",
      expiresAt: null,
    });
  });
  it("events that don't change access are ignored", () => {
    for (const type of ["TEST", "TRANSFER", "SUBSCRIBER_ALIAS", "", undefined])
      expect(plusChange({ type })).toEqual({ action: "ignore" });
  });
});

describe("coachChange (Razorpay → coach billing)", () => {
  const sub = {
    id: "sub_1",
    plan_id: "plan_coach",
    current_end: at / 1000,
    notes: { coach_id: "c-1" },
  };
  it("payments make the coach active", () => {
    for (const e of [
      "subscription.activated",
      "subscription.charged",
      "subscription.resumed",
      "subscription.authenticated",
    ])
      expect(coachChange(e, sub)).toMatchObject({
        action: "set",
        status: "active",
        coachId: "c-1",
        subscriptionId: "sub_1",
      });
  });
  it("a failed charge starts the 7-day grace (D41)", () => {
    expect(coachChange("subscription.pending", sub)).toMatchObject({
      status: "grace",
    });
  });
  it("halted, paused, cancelled and completed lapse the coach", () => {
    for (const e of [
      "subscription.halted",
      "subscription.paused",
      "subscription.cancelled",
      "subscription.completed",
    ])
      expect(coachChange(e, sub)).toMatchObject({ status: "lapsed" });
  });
  it("records the period end", () => {
    const c = coachChange("subscription.charged", sub);
    expect(c.action === "set" && c.periodEnd).toBe(new Date(at).toISOString());
  });
  it("ignores unknown events and subscriptions with no coach", () => {
    expect(coachChange("payment.captured", sub)).toEqual({ action: "ignore" });
    expect(coachChange("subscription.charged", { ...sub, notes: {} })).toEqual({
      action: "ignore",
    });
    expect(
      coachChange("subscription.charged", { ...sub, id: undefined }),
    ).toEqual({ action: "ignore" });
    expect(coachChange("subscription.charged", undefined)).toEqual({
      action: "ignore",
    });
  });
});
