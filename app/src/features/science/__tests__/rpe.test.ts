// RPE logging and RPE-aware progression (D83, helms2016rir).
import { describe, expect, it } from "@jest/globals";

import {
  suggestion,
  type LoggedExercise,
  type Session,
} from "@/features/athlete/training";
import {
  isCompound,
  RPE_OPTIONS,
  rpeTargetFor,
} from "@/features/science/rules";

const bench: LoggedExercise = {
  id: "e1",
  name: "Bench press (barbell)",
  group: "Chest",
  target: "3 × 8–10",
  restSec: 150,
  timed: false,
  bodyweight: false,
  note: "",
  skipped: false,
  sets: [],
} as unknown as LoggedExercise;

const last = (reps: number[], rpe: (number | null)[]): Session[] => [
  {
    id: "s1",
    at: "2026-11-10T08:00:00Z",
    name: "Push",
    minutes: 50,
    volume: 0,
    setsDone: reps.length,
    setsPlanned: reps.length,
    bests: [],
    exercises: [
      {
        name: bench.name,
        sets: reps.map((r, i) => ({
          kg: 60,
          reps: r,
          seconds: null,
          rpe: rpe[i],
          warmup: false,
        })),
      },
    ],
  },
];

describe("RPE targets", () => {
  it("gives new lifters a lower range, isolation a higher one", () => {
    expect(rpeTargetFor("new", true)).toEqual([7, 8]);
    expect(rpeTargetFor("some", true)).toEqual([7, 9]);
    expect(rpeTargetFor("some", false)).toEqual([8, 10]);
  });
  it("knows compound lifts", () => {
    expect(isCompound("Bench press (barbell)")).toBe(true);
    expect(isCompound("Bicep curl (dumbbell)")).toBe(false);
  });
  it("offers 6 to 10", () => {
    expect(RPE_OPTIONS.map((o) => o.value)).toContain(10);
    expect(Math.min(...RPE_OPTIONS.map((o) => o.value))).toBe(6);
  });
});

describe("progression with RPE", () => {
  const range: [number, number] = [7, 9];
  it("adds weight when the top of the range was hit at a fair effort", () => {
    expect(suggestion(last([10, 10, 10], [8, 8.5, 9]), bench, range)?.kg).toBe(
      62.5,
    );
  });
  it("holds the weight when the top was hit only at failure", () => {
    expect(
      suggestion(last([10, 10, 10], [10, 10, 9.5]), bench, range)?.kg,
    ).toBe(60);
  });
  it("adds weight when the sets were easy even below the top", () => {
    expect(suggestion(last([8, 8, 8], [6, 6, 6]), bench, range)?.kg).toBe(62.5);
  });
  it("otherwise holds and aims for one more rep", () => {
    const s = suggestion(last([9, 8, 8], [8, 9, 9]), bench, range);
    expect(s?.kg).toBe(60);
    expect(s?.text).toMatch(/one more rep/);
  });
});
