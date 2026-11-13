// Body fat in onboarding (D84): bands by sex, stored as the band middle, used for resting energy.
import { describe, expect, it } from "@jest/globals";

import {
  BODY_FAT_BANDS,
  bandLabel,
  bandValue,
} from "@/features/science/bodyFat";
import { buildPlan } from "@/features/onboarding/plan";

describe("body fat bands", () => {
  it("has nine bands for each sex, women higher", () => {
    expect(BODY_FAT_BANDS.male).toHaveLength(9);
    expect(BODY_FAT_BANDS.female).toHaveLength(9);
    expect(BODY_FAT_BANDS.female[0][0]).toBeGreaterThan(
      BODY_FAT_BANDS.male[0][0],
    );
  });
  it("stores the middle and labels the last band open-ended", () => {
    expect(bandValue([30, 34])).toBe(32);
    expect(bandLabel([40, 50], true)).toBe("40% +");
    expect(bandLabel([13, 17], false)).toBe("13–17%");
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
    const lean = buildPlan({ ...base, bodyFatPct: 10 });
    const high = buildPlan({ ...base, bodyFatPct: 32 });
    // Same weight, more lean mass: more calories.
    expect(lean.kcal).toBeGreaterThan(high.kcal);
  });
  it("falls back to the weight-based equation without it", () => {
    expect(buildPlan(base).kcal).toBeGreaterThan(0);
  });
});
