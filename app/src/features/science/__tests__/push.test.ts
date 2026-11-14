// Expo push tickets (supabase/functions/_shared/push.ts): only tokens Expo reports as no longer
// registered are removed; anything else (other errors, missing or odd replies) keeps the token.
import { describe, expect, it } from "@jest/globals";

import {
  CHUNK,
  deadTokens,
} from "../../../../../supabase/functions/_shared/push";

const T = [
  "ExponentPushToken[a]",
  "ExponentPushToken[b]",
  "ExponentPushToken[c]",
];

describe("deadTokens", () => {
  it("returns the tokens Expo says are not registered, by position", () => {
    const res = {
      data: [
        { status: "ok", id: "1" },
        { status: "error", details: { error: "DeviceNotRegistered" } },
        { status: "error", details: { error: "MessageRateExceeded" } },
      ],
    };
    expect(deadTokens(T, res)).toEqual(["ExponentPushToken[b]"]);
  });

  it("keeps every token when all were accepted", () => {
    expect(deadTokens(T, { data: T.map(() => ({ status: "ok" })) })).toEqual(
      [],
    );
  });

  it("keeps every token when the reply is missing or malformed", () => {
    expect(deadTokens(T, null)).toEqual([]);
    expect(
      deadTokens(T, { errors: [{ code: "PUSH_TOO_MANY_EXPERIENCE_IDS" }] }),
    ).toEqual([]);
    expect(deadTokens(T, { data: "nope" })).toEqual([]);
  });

  it("ignores tickets past the tokens it was given", () => {
    const res = {
      data: [
        { status: "ok" },
        { status: "ok" },
        { status: "ok" },
        { status: "error", details: { error: "DeviceNotRegistered" } },
      ],
    };
    expect(deadTokens(T, res)).toEqual([]);
  });

  it("sends in Expo's batch size", () => {
    expect(CHUNK).toBe(100);
  });
});
