import { describe, expect, test } from "@jest/globals";

import { raceGoalFrom } from "../../athlete/selfPlan";
import { questions, questionShown } from "../../onboarding/questions";
import { daysFor, easyRun, hybridProgram, racePace, stationOrder } from "../hybrid";

const shown = (a: Record<string, unknown>) =>
  questions.filter((q) => questionShown(q, a)).map((q) => q.id);

describe("HYROX onboarding by level", () => {
  test("non-race goals never see race questions, and keep goal weight", () => {
    const ids = shown({ goal: "build_muscle" });
    expect(ids.some((x) => x.startsWith("HX-"))).toBe(false);
    expect(ids).toContain("AO-06");
  });

  test("first race: stations tried and aim; no previous time; no goal weight", () => {
    const ids = shown({ goal: "hyrox", raceLevel: "first", raceAim: "finish", weeklyKm: "5" });
    expect(ids).toEqual(expect.arrayContaining(["HX-01", "HX-04", "HX-05", "HX-F1", "HX-F2"]));
    expect(ids).not.toContain("HX-P1");
    expect(ids).not.toContain("HX-T1");
    expect(ids).not.toContain("AO-06");
  });

  test("first race with a time aim gets the target question", () => {
    expect(shown({ goal: "hyrox", raceLevel: "first", raceAim: "time" })).toContain("HX-T1");
  });

  test("raced before: best time, weak areas, target; advanced adds pace and season goal", () => {
    const r = shown({ goal: "hyrox", raceLevel: "returning" });
    expect(r).toEqual(expect.arrayContaining(["HX-P1", "HX-P2", "HX-T1"]));
    expect(r).not.toContain("HX-A1");
    const a = shown({ goal: "hyrox", raceLevel: "advanced" });
    expect(a).toEqual(expect.arrayContaining(["HX-A1", "HX-A2", "HX-P2"]));
  });

  test("not running yet skips the 5 km time", () => {
    expect(shown({ goal: "hyrox", raceLevel: "first", weeklyKm: "0" })).not.toContain("HX-05");
  });

  test("answers become the race goal", () => {
    const g = raceGoalFrom({
      goal: "hyrox",
      raceLevel: "returning",
      raceWeeks: 10,
      weeklyKm: "15",
      recent5k: 25,
      prevMin: 92,
      targetMin: 85,
      weakAreas: ["Wall balls", "Roxzone transitions"],
    })!;
    expect(g.level).toBe("returning");
    expect(g.prevSec).toBe(92 * 60);
    expect(g.targetSec).toBe(85 * 60);
    expect(g.weak).toEqual(["wall_balls", "roxzone"]);
  });
});

describe("race plan by level", () => {
  test("first races get at most 5 days", () => {
    expect(daysFor(6, "first")).toBe(5);
    expect(daysFor(6, "advanced")).toBe(6);
  });

  test("weak stations come first and get an extra round", () => {
    expect(stationOrder({ weak: ["wall_balls"] })[0].key).toBe("wall_balls");
    const p = hybridProgram(4, 50, { level: "returning", weak: ["wall_balls"] });
    const hybrid = p.days.find((d) => d.name === "Compromised running")!;
    const wb = hybrid.exercises.find((e) => e.name === "Wall ball")!;
    const other = hybrid.exercises.find((e) => e.name !== "Wall ball" && e.name !== "Running")!;
    expect(wb.sets).toBe(other.sets + 1);
  });

  test("first races learn untried stations first", () => {
    expect(stationOrder({ level: "first", stationsTried: ["skierg", "row"] })[0].key).not.toBe("skierg");
  });

  test("paces and easy runs follow the athlete", () => {
    expect(racePace({ recent5kSec: 25 * 60 })).toBeCloseTo(375, 0); // 5:00/km → 6:15/km
    expect(racePace({ racePaceSec: 270, recent5kSec: 1200 })).toBe(270);
    expect(easyRun(0, "base")).toContain("run-walk");
    expect(easyRun(40, "build")).toContain("50-75");
  });
});
