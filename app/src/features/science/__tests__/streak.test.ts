// Food logging streak (D94).
import { describe, expect, it } from "@jest/globals";

import { logStreak } from "@/features/athlete/streak";

describe("logging streak", () => {
  it("counts days in a row ending today", () => {
    expect(
      logStreak(["2026-11-14", "2026-11-13", "2026-11-12"], "2026-11-14"),
    ).toBe(3);
  });
  it("keeps yesterday's streak before today's first log", () => {
    expect(logStreak(["2026-11-13", "2026-11-12"], "2026-11-14")).toBe(2);
  });
  it("breaks on a missed day", () => {
    expect(logStreak(["2026-11-14", "2026-11-12"], "2026-11-14")).toBe(1);
  });
  it("is zero with nothing recent", () => {
    expect(logStreak(["2026-11-01"], "2026-11-14")).toBe(0);
  });
});
