// A self-guided athlete's own plan from their onboarding answers (D57): rules only, same shape as a
// coach's plan. Checks the parts a person relies on: training days and rest days, protein and
// macros that add up, an example day that fits their diet, and the HYROX race goal (D76).
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { findFood, unitsOf } from "@/features/athlete/foods";
import {
  goalKeyOf,
  modulesFrom,
  raceGoalFrom,
  selfPlan,
} from "@/features/athlete/selfPlan";
import { exampleDay } from "@/features/coach/plans";
import { proteinTarget } from "@/features/science/rules";

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 10, 18, 9, 0, 0));
});
afterEach(() => {
  jest.useRealTimers();
});

const MUSCLE = {
  goal: "build_muscle",
  experience: "some",
  daysPerWeek: 4,
  sessionLength: "60",
  weightKg: 70,
  heightCm: 175,
  age: 28,
  sex: "male",
  diet: "nonveg",
  mealsPerDay: 4,
};

// Never in a vegan day: meat, fish, egg or dairy.
const ANIMAL =
  /chicken|mutton|fish|prawn|egg|paneer|curd|dahi|milk|chai|lassi|ghee|yogurt|cheese|butter|raita|kheer/i;

describe("goalKeyOf", () => {
  it("maps a goal label back to its key", () => {
    expect(goalKeyOf("Build muscle")).toBe("build_muscle");
    expect(goalKeyOf("HYROX race")).toBe("hyrox");
    expect(goalKeyOf("Something else")).toBeUndefined();
    expect(goalKeyOf(undefined)).toBeUndefined();
  });
});

describe("selfPlan: training", () => {
  it("builds an 8-week program: 4 days a week rotate Upper, Lower, Full body", () => {
    const p = selfPlan(MUSCLE);
    expect(p.program.name).toBe("Build muscle · 4 days");
    expect(p.program.weeks).toBe(8);
    expect(p.program.days.map((d) => d.name)).toEqual([
      "Upper",
      "Lower",
      "Full body",
    ]);
    for (const d of p.program.days) {
      expect(d.exercises.length).toBeGreaterThan(0);
      for (const e of d.exercises) {
        expect(e.sets).toBeGreaterThanOrEqual(1);
        expect(e.restSec).toBeGreaterThan(0);
      }
    }
  });

  it("rests on the days the athlete didn't pick, or spreads training evenly", () => {
    expect(selfPlan(MUSCLE).protocol.restDays).toEqual([2, 5, 6]);
    expect(selfPlan({ ...MUSCLE, daysPerWeek: 3 }).protocol.restDays).toEqual([
      1, 3, 5, 6,
    ]);
    expect(
      selfPlan({ ...MUSCLE, preferredDays: [5, 1, 3] }).protocol.restDays,
    ).toEqual([0, 2, 4, 6]);
  });

  it("starts from sensible defaults with no answers", () => {
    const p = selfPlan({});
    expect(p.summary.goal).toBe("General fitness");
    expect(p.summary.diet).toBe("Vegetarian");
    expect(p.program.days.length).toBeGreaterThan(0);
    expect(p.protocol).toMatchObject({ bed: 22 * 60 + 30, wake: 6 * 60 + 30 });
  });
});

describe("selfPlan: nutrition", () => {
  it("uses the evidence protein target and macros that add up to the calories", () => {
    const n = selfPlan(MUSCLE).nutrition;
    expect(n.protein).toBe(proteinTarget(70, 175, "build_muscle").grams);
    const fromMacros = n.protein * 4 + n.carbs * 4 + n.fat * 9;
    // Each macro is rounded to 5 g, so allow for that rounding.
    expect(Math.abs(fromMacros - n.kcal)).toBeLessThanOrEqual(60);
    expect(n.carbs).toBeGreaterThanOrEqual(0);
  });

  it("drops the snack for three meals a day and keeps it for more", () => {
    const names = (m: number) =>
      selfPlan({ ...MUSCLE, mealsPerDay: m }).nutrition.meals.map(
        (x) => x.name,
      );
    expect(names(3)).toEqual(["Breakfast", "Lunch", "Dinner"]);
    expect(names(4)).toEqual(["Breakfast", "Lunch", "Snack", "Dinner"]);
  });

  it("gives a vegan athlete a fully plant-based example day", () => {
    const p = selfPlan({ ...MUSCLE, diet: "vegan" });
    expect(p.summary.diet).toBe("Vegan");
    for (const m of p.nutrition.meals) expect(m.foods).not.toMatch(ANIMAL);
  });

  it("keeps vegetarian and Jain days meat- and egg-free", () => {
    for (const diet of ["Vegetarian", "Jain"])
      for (const m of exampleDay(diet))
        expect(m.foods).not.toMatch(/chicken|mutton|fish|egg/i);
  });

  it("every example-day food and portion exists in the food library", () => {
    for (const diet of ["Vegetarian", "Eggetarian", "Non-veg", "Vegan", "Jain"])
      for (const m of exampleDay(diet))
        for (const i of m.items ?? []) {
          const f = findFood(i.foodId);
          expect(f).toBeDefined();
          expect(unitsOf(f!).map((u) => u.key)).toContain(i.unit);
        }
  });
});

describe("HYROX (D76)", () => {
  const HYROX = {
    goal: "hyrox",
    daysPerWeek: 4,
    raceWeeks: 10,
    raceLevel: "first",
    raceAim: "finish",
    weeklyKm: 15,
    recent5k: 28,
    weakAreas: ["Wall balls", "Slowing down on later runs", "Not a real area"],
    stationsTried: ["SkiErg", "Row"],
  };

  it("has no race goal for other goals", () => {
    expect(raceGoalFrom(MUSCLE)).toBeUndefined();
  });

  it("dates the race from the weeks away and maps what they told us", () => {
    const r = raceGoalFrom(HYROX)!;
    expect(r.date).toBe("2027-01-27");
    expect(r.division).toBe("open_women");
    expect(r.recent5kSec).toBe(28 * 60);
    expect(r.weak).toEqual(["wall_balls", "fade"]);
    expect(r.stationsTried).toEqual(["skierg", "row"]);
    // A first-timer aiming to finish has no target time; advanced-only fields stay empty.
    expect(r.targetSec).toBeUndefined();
    expect(r.racePaceSec).toBeUndefined();
    expect(r.seasonGoal).toBeUndefined();
  });

  it("ignores a 5 km time from someone who doesn't run yet", () => {
    expect(
      raceGoalFrom({ ...HYROX, weeklyKm: 0 })!.recent5kSec,
    ).toBeUndefined();
  });

  it("keeps a target time when they're racing for one", () => {
    expect(
      raceGoalFrom({ ...HYROX, raceAim: "time", targetMin: 95 })!.targetSec,
    ).toBe(95 * 60);
  });

  it("builds the race plan instead of the muscle plan", () => {
    const p = selfPlan(HYROX);
    expect(p.program.name).not.toBe("HYROX race · 4 days");
    expect(p.program.days.length).toBeGreaterThan(0);
  });
});

describe("modulesFrom (D78)", () => {
  it("adds the athlete's extras to the goal's defaults, once each", () => {
    expect(
      modulesFrom({
        goal: "general_fitness",
        addons: ["Cardio fitness", "Mobility", "Unknown"],
      }),
    ).toEqual(["morning", "cardio_fitness", "mobility"]);
    expect(modulesFrom({})).toEqual(["morning"]);
  });
});
