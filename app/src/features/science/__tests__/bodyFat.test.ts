// Body fat in onboarding (D84, D87): eight levels by sex, used for resting energy.
import { describe, expect, it } from "@jest/globals";

import { buildPlan } from "@/features/onboarding/plan";
import { BODY_FAT_LEVELS, levelLabel } from "@/features/science/bodyFat";

describe("body fat levels", () => {
  it("has eight levels for each sex, women higher", () => {
    expect(BODY_FAT_LEVELS.male).toHaveLength(8);
    expect(BODY_FAT_LEVELS.female).toHaveLength(8);
    expect(BODY_FAT_LEVELS.female[0]).toBeGreaterThan(BODY_FAT_LEVELS.male[0]);
  });
  it("labels the last level open-ended", () => {
    expect(levelLabel(40, true)).toBe("40%+");
    expect(levelLabel(15, false)).toBe("15%");
  });
});

describe("resting energy", () => {
  const base = {
    sex: "male",
    age: 30,
    heightCm: 180,
    weightKg: 80,
    activity: "moderate",
    goal: "general_fitness",
  };
  it("uses lean mass when body fat is given", () => {
    expect(buildPlan({ ...base, bodyFatPct: 10 }).kcal).toBeGreaterThan(
      buildPlan({ ...base, bodyFatPct: 30 }).kcal,
    );
  });
  it("falls back to the weight-based equation without it", () => {
    expect(buildPlan(base).kcal).toBeGreaterThan(0);
  });
});
