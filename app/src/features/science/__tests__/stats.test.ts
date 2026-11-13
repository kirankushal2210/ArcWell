// Weekly training totals for the Progress chart (D91).
import { describe, expect, it } from "@jest/globals";

import {
  formatStat,
  sessionReps,
  weeklyTotals,
  workoutDays,
} from "@/features/athlete/stats";
import type { Session } from "@/features/athlete/training";

const s = (
  iso: string,
  minutes: number,
  volume: number,
  reps: number[],
): Session => ({
  id: iso,
  at: iso,
  name: "W",
  minutes,
  volume,
  setsDone: reps.length,
  setsPlanned: reps.length,
  bests: [],
  exercises: [
    {
      name: "Bench press (barbell)",
      sets: reps.map((r) => ({
        kg: 50,
        reps: r,
        seconds: null,
        warmup: false,
      })),
    },
  ],
});
// Saturday 14 Nov 2026; the current week starts Monday 9 Nov.
const now = new Date(2026, 10, 14, 12);

describe("weekly totals", () => {
  const list = [
    s(new Date(2026, 10, 10, 9).toISOString(), 50, 2000, [10, 8]),
    s(new Date(2026, 10, 12, 9).toISOString(), 40, 1500, [12]),
    s(new Date(2026, 10, 3, 9).toISOString(), 60, 3000, [5, 5, 5]),
    s(new Date(2026, 5, 1, 9).toISOString(), 60, 3000, [5]),
  ];
  it("adds up each week, current week last", () => {
    const w = weeklyTotals(list, "reps", 3, now);
    expect(w.map((x) => x.value)).toEqual([0, 15, 30]);
    expect(weeklyTotals(list, "duration", 3, now)[2].value).toBe(90);
    expect(weeklyTotals(list, "volume", 3, now)[1].value).toBe(3000);
  });
  it("counts reps over every set", () => {
    expect(sessionReps(list[0])).toBe(18);
  });
  it("leaves out workouts before the range", () => {
    const w = weeklyTotals(list, "reps", 13, now);
    expect(w.reduce((n, x) => n + x.value, 0)).toBe(45);
  });
  it("finds workout days in a month", () => {
    expect([...workoutDays(list, 2026, 10)].sort((a, b) => a - b)).toEqual([
      3, 10, 12,
    ]);
  });
});

describe("formatting", () => {
  it("formats each metric", () => {
    expect(formatStat(80, "duration")).toBe("1 h 20 min");
    expect(formatStat(12400, "volume")).toBe("12 t");
    expect(formatStat(850, "volume")).toBe("850 kg");
    expect(formatStat(114, "reps")).toBe("114 reps");
  });
});
