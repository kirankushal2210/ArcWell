import { describe, expect, test } from "@jest/globals";

import {
  cooperVo2,
  hrMaxFor,
  intervalFor,
  isLowerBodyDay,
  levelFor,
  nonExerciseVo2,
  retestInDays,
  rockportVo2,
  weekCardio,
} from "../cardio";
import {
  bedAfterWake,
  caffeineCutoff,
  coldAllowed,
  cortisolCurve,
  defaultModules,
  habitById,
  habitCap,
  HABITS,
  inMorning,
  inWindow,
  typicalCortisol,
} from "../habits";
import { hybridProgram, phaseFor, runSpike, simDue } from "../hybrid";

const day = { wake: 6 * 60 + 30, bed: 22 * 60 + 30 };

describe("habits", () => {
  test("every habit has an evidence level and a module", () => {
    for (const h of HABITS) {
      expect(h.evidence).toBeTruthy();
      expect(h.module).toBeTruthy();
    }
  });

  test("morning daylight only shows in the first hour after waking", () => {
    const h = habitById("morning-daylight")!;
    expect(inWindow(h, day, 6 * 60 + 45)).toBe(true);
    expect(inWindow(h, day, 7 * 60 + 31)).toBe(false);
    expect(inWindow(h, day, 13 * 60)).toBe(false);
  });

  test("wind-down shows in the hour before bed, including past midnight bedtimes", () => {
    const h = habitById("wind-down")!;
    expect(inWindow(h, day, 21 * 60 + 45)).toBe(true);
    expect(inWindow(h, day, 20 * 60)).toBe(false);
    const late = { wake: 8 * 60, bed: 30 }; // bed 00:30
    expect(bedAfterWake(late)).toBe(1470);
    expect(inWindow(h, late, 15)).toBe(true); // 00:15
  });

  test("caffeine cut-off is 9 hours before bed", () => {
    expect(caffeineCutoff(day)).toBe(13 * 60 + 30);
  });

  test("cold waits 6 hours after strength work", () => {
    expect(coldAllowed(null, 600)).toBe(true);
    expect(coldAllowed(600, 600 + 5 * 60)).toBe(false);
    expect(coldAllowed(600, 600 + 6 * 60)).toBe(true);
  });

  test("three habits to start, five after two weeks", () => {
    expect(habitCap(undefined, "2026-11-13")).toBe(3);
    expect(habitCap("2026-11-05", "2026-11-13")).toBe(3);
    expect(habitCap("2026-10-30", "2026-11-13")).toBe(5);
  });

  test("only Morning start is on by default for a muscle goal (D78, D80)", () => {
    expect(defaultModules("build_muscle")).toEqual(["morning"]);
    expect(defaultModules("hyrox")).toEqual([
      "morning",
      "cardio_fitness",
      "running",
    ]);
  });

  test("Morning start runs from waking to 3 hours after", () => {
    expect(inMorning(day, 6 * 60 + 30)).toBe(true);
    expect(inMorning(day, 9 * 60 + 31)).toBe(false);
  });

  test("the typical cortisol curve peaks soon after waking and is low at night", () => {
    const peak = typicalCortisol(day.wake + 40, day);
    const evening = typicalCortisol(21 * 60, day);
    const night = typicalCortisol(26 * 60, day);
    expect(peak).toBeCloseTo(1, 2);
    expect(evening).toBeLessThan(0.35);
    expect(night).toBeLessThan(evening);
    const curve = cortisolCurve(day);
    expect(curve[0].v).toBeCloseTo(curve[curve.length - 1].v, 1);
    for (const p of curve) {
      expect(p.v).toBeGreaterThanOrEqual(0);
      expect(p.v).toBeLessThanOrEqual(1.0001);
    }
  });
});

describe("cardio fitness (VO2 max)", () => {
  test("estimates", () => {
    expect(hrMaxFor(30)).toBe(187);
    expect(cooperVo2(2400)).toBeCloseTo(42.4, 1);
    expect(
      rockportVo2({
        weightKg: 70,
        age: 30,
        sex: "female",
        minutes: 15,
        endHr: 130,
      }),
    ).toBeGreaterThan(30);
    expect(
      nonExerciseVo2({
        age: 30,
        sex: "male",
        weightKg: 75,
        heightCm: 178,
        activity: 5,
      }),
    ).toBeGreaterThan(40);
  });

  test("beginners build from 4 × 2 to 4 × 4 and every 4th week is lighter", () => {
    expect(intervalFor("beginner", 1).workSec).toBe(120);
    expect(intervalFor("beginner", 6).workSec).toBe(240);
    expect(intervalFor("beginner", 4).rounds).toBe(3);
    expect(intervalFor("intermediate", 2).rounds).toBe(4);
  });

  test("leg days are recognised", () => {
    expect(isLowerBodyDay([{ name: "Squat (barbell)", sets: 4 }])).toBe(true);
    expect(isLowerBodyDay([{ name: "Bench press (barbell)", sets: 4 }])).toBe(
      false,
    );
  });

  test("intervals never land on a leg day or the day before one", () => {
    // Mon push, Tue legs, Wed rest, Thu pull, Fri legs, Sat/Sun rest
    const lifting = [
      { lower: false },
      { lower: true },
      null,
      { lower: false },
      { lower: true },
      null,
      null,
    ];
    for (const level of ["beginner", "intermediate", "advanced"] as const) {
      const slots = weekCardio({
        level,
        week: 2,
        days: [],
        machines: ["bike"],
        lifting,
      });
      for (const s of slots.filter((x) => x.kind === "intervals")) {
        expect(lifting[s.day]?.lower).not.toBe(true);
        expect(lifting[(s.day + 1) % 7]?.lower).not.toBe(true);
      }
      expect(slots.every((s) => s.machine === "bike")).toBe(true);
    }
  });

  test("respects the days the athlete allowed", () => {
    const slots = weekCardio({
      level: "intermediate",
      week: 1,
      days: [3, 5],
      machines: ["rower", "bike"],
      lifting: [null, null, null, null, null, null, null],
    });
    expect(slots.every((s) => [3, 5].includes(s.day))).toBe(true);
  });

  test("level and retest timing", () => {
    expect(levelFor(30, 20)).toBe("beginner");
    expect(levelFor(45, 60)).toBe("intermediate");
    expect(levelFor(55, null)).toBe("advanced");
    expect(retestInDays(undefined, "2026-11-13")).toBe(0);
    expect(retestInDays("2026-11-01", "2026-11-13")).toBe(30);
  });
});

describe("hybrid race plan", () => {
  test("phases count back from race day", () => {
    expect(phaseFor(200)).toBe("base");
    expect(phaseFor(100)).toBe("build");
    expect(phaseFor(40)).toBe("specific");
    expect(phaseFor(10)).toBe("taper");
  });

  test("no sims in the final 10 days; a full sim 3 to 5 weeks out", () => {
    expect(simDue(8, null)).toBeNull();
    expect(simDue(28, 30)).toBe("full");
    expect(simDue(80, 25)).toBe("half");
    expect(simDue(80, 10)).toBeNull();
  });

  test("flags a run much longer than recent runs", () => {
    expect(runSpike(12, 10)).toBe(true);
    expect(runSpike(10.5, 10)).toBe(false);
  });

  test("the plan has one session per available day", () => {
    for (const d of [3, 4, 5, 6])
      expect(hybridProgram(d, 60).days).toHaveLength(d);
    expect(hybridProgram(4, 50).name).toContain("Specific");
  });
});
