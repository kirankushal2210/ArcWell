// Tailoring today's workout (D70): rules only, a changed copy of one day with what changed and why.
import { describe, expect, it } from "@jest/globals";

import { TAILOR_OPTIONS, tailor } from "@/features/ai/tailor";
import { estimateMinutes } from "@/features/athlete/training";
import type { TrainingDay } from "@/features/coach/plans";
import { loadsArea } from "@/features/onboarding/workouts";

const DAY: TrainingDay = {
  id: "d1",
  name: "Full body",
  exercises: [
    { id: "e1", name: "Squat (barbell)", sets: 4, reps: "6–8", restSec: 180 },
    {
      id: "e2",
      name: "Romanian deadlift (barbell)",
      sets: 3,
      reps: "8",
      restSec: 120,
    },
    {
      id: "e3",
      name: "Bench press (barbell)",
      sets: 4,
      reps: "8",
      restSec: 120,
    },
    {
      id: "e4",
      name: "Seated cable row - bar grip",
      sets: 3,
      reps: "10",
      restSec: 90,
    },
    { id: "e5", name: "Glute bridge", sets: 1, reps: "12", restSec: 60 },
  ],
};
const names = (t: { exercises: { name: string }[] }) =>
  t.exercises.map((e) => e.name);
const sets = (t: { exercises: { sets: number }[] }) =>
  t.exercises.map((e) => e.sets);

describe("tailor", () => {
  it("never changes the planned day itself", () => {
    const before = JSON.stringify(DAY);
    for (const { kind } of [...TAILOR_OPTIONS, { kind: "halve" as const }])
      tailor(DAY, kind);
    expect(JSON.stringify(DAY)).toBe(before);
  });

  it("every option the athlete can pick explains itself", () => {
    for (const { kind } of TAILOR_OPTIONS)
      expect(tailor(DAY, kind).why.length).toBeGreaterThan(20);
  });

  it("halve: half the sets rounded up, never below one, each change listed", () => {
    const t = tailor(DAY, "halve");
    expect(sets(t)).toEqual([2, 2, 2, 2, 1]);
    expect(t.changes).toEqual([
      "Squat (barbell): 4 → 2 sets",
      "Romanian deadlift (barbell): 3 → 2 sets",
      "Bench press (barbell): 4 → 2 sets",
      "Seated cable row - bar grip: 3 → 2 sets",
    ]);
    expect(t.sources).toEqual(["craven2022"]);
  });

  it("trim: one set fewer each, a one-set exercise stays at one", () => {
    const t = tailor(DAY, "trim");
    expect(sets(t)).toEqual([3, 2, 3, 2, 1]);
    expect(t.changes).toHaveLength(4);
    expect(names(t)).toEqual(names(DAY));
  });

  it("30 minutes: fits in 30, keeps every exercise and the big lifts' sets", () => {
    expect(estimateMinutes(DAY)).toBeGreaterThan(30);
    const t = tailor(DAY, "minutes30");
    expect(
      estimateMinutes({ ...DAY, exercises: t.exercises }),
    ).toBeLessThanOrEqual(30);
    expect(names(t)).toEqual(names(DAY));
    expect(t.exercises[0].sets).toBe(4);
    expect(t.exercises[1].sets).toBe(3);
    expect(Math.min(...sets(t))).toBeGreaterThanOrEqual(1);
    expect(t.sources).toEqual(["schoenfeld2017volume", "refalo2023"]);
  });

  it("30 minutes: a session that already fits is left alone", () => {
    const short = { ...DAY, exercises: DAY.exercises.slice(3) };
    const t = tailor(short, "minutes30");
    expect(t.changes).toEqual([]);
    expect(sets(t)).toEqual(sets(short));
  });

  it("knee: no knee-friendly squat exists, so the squat is skipped; the rest stays", () => {
    const t = tailor(DAY, "knee");
    expect(names(t)).not.toContain("Squat (barbell)");
    expect(t.changes).toContain("Squat (barbell): skipped today");
    expect(t.exercises.every((e) => !loadsArea(e.name, "Knee"))).toBe(true);
    expect(t.why).toMatch(/physiotherapist or doctor/);
  });

  it("lower back: swaps for moves that spare it, keeping the exercise count", () => {
    const t = tailor(DAY, "back");
    expect(t.exercises).toHaveLength(DAY.exercises.length);
    expect(t.exercises.every((e) => !loadsArea(e.name, "Lower back"))).toBe(
      true,
    );
    expect(t.changes.some((c) => c.startsWith("Squat (barbell) → "))).toBe(
      true,
    );
    expect(
      t.changes.some((c) => c.startsWith("Romanian deadlift (barbell) → ")),
    ).toBe(true);
  });

  it("no barbell: every barbell lift becomes another kit, nothing is skipped", () => {
    const t = tailor(DAY, "noBarbell");
    expect(t.exercises).toHaveLength(DAY.exercises.length);
    expect(names(t).some((n) => /barbell/i.test(n))).toBe(false);
    expect(t.changes).toContain(
      "Bench press (barbell) → Bench press (dumbbell)",
    );
    // Same sets and reps on the swapped exercise.
    expect(t.exercises[2]).toMatchObject({ id: "e3", sets: 4, reps: "8" });
  });

  it("an exercise outside the library is kept as it is", () => {
    const custom: TrainingDay = {
      ...DAY,
      exercises: [
        {
          id: "c",
          name: "My own knee drill",
          sets: 2,
          reps: "10",
          restSec: 60,
        },
      ],
    };
    expect(tailor(custom, "knee").exercises).toEqual(custom.exercises);
  });
});
