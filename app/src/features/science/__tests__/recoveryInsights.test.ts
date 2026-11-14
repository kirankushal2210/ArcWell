// Recovery insights (D98): HRV status, early warning, fitness age, cycle, journal from food.
import { describe, expect, it } from "@jest/globals";

import {
  cycleInfo,
  fitnessAge,
  hrvStatus,
  journalFromFood,
  warningSigns,
} from "@/features/athlete/recoveryInsights";

describe("HRV status", () => {
  const steady = Array.from({ length: 21 }, (_, i) => 60 + (i % 3) - 1);
  it("needs two weeks of nights", () => {
    expect(hrvStatus(steady.slice(0, 10))).toBeNull();
  });
  it("is balanced inside the normal range", () => {
    expect(hrvStatus(steady)?.status).toBe("balanced");
  });
  it("is low when the last week drops below it", () => {
    const low = [...steady.slice(0, 14), 50, 49, 51, 50, 48, 50, 49];
    expect(hrvStatus(low)?.status).toBe("low");
  });
});

describe("early warning", () => {
  const v = (label: string, value: number) => ({
    label,
    value,
    low: 10,
    high: 20,
  });
  it("needs two vitals off together", () => {
    expect(warningSigns([v("Resting heart rate", 25)])).toBe(false);
    expect(
      warningSigns([v("Resting heart rate", 25), v("Skin temperature", 21)]),
    ).toBe(true);
  });
  it("only counts the direction that comes with illness", () => {
    expect(
      warningSigns([
        v("Resting heart rate", 5),
        v("Heart rate variability", 25),
      ]),
    ).toBe(false);
  });
});

describe("fitness age", () => {
  it("matches the median's age", () => {
    expect(fitnessAge(42.4, "male")).toBe(35);
    expect(fitnessAge(30.2, "female")).toBe(35);
  });
  it("is younger when fitter and stays within 20 to 80", () => {
    expect(fitnessAge(55, "male")).toBeLessThan(30);
    expect(fitnessAge(80, "male")).toBe(20);
    expect(fitnessAge(8, "female")).toBe(80);
  });
});

describe("cycle", () => {
  it("counts the cycle day and the next start", () => {
    const c = cycleInfo(["2026-10-01", "2026-10-30"], "2026-11-14");
    expect(c).toMatchObject({
      day: 16,
      length: 29,
      nextStart: "2026-11-28",
      daysToNext: 14,
    });
  });
  it("uses 28 days with one start, and nothing with none", () => {
    expect(cycleInfo(["2026-11-01"], "2026-11-14")?.length).toBe(28);
    expect(cycleInfo([], "2026-11-14")).toBeNull();
  });
});

describe("journal from food", () => {
  it("ticks late caffeine, alcohol and a late meal", () => {
    const j = journalFromFood(
      [
        { at: 17 * 60, meal: "snacks", caffeineMg: 95, alcohol: false },
        { at: 21 * 60 + 30, meal: "dinner", caffeineMg: 0, alcohol: true },
      ],
      22 * 60 + 30,
    );
    expect(j.sort()).toEqual(["alcohol", "caffeine", "late_meal"]);
  });
  it("leaves a normal day empty", () => {
    expect(
      journalFromFood(
        [{ at: 9 * 60, meal: "breakfast", caffeineMg: 95, alcohol: false }],
        1380,
      ),
    ).toEqual([]);
  });
});
