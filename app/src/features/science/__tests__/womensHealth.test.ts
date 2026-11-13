// Women's hormonal health (D87).
import { describe, expect, it } from "@jest/globals";

import { buildPlan } from "@/features/onboarding/plan";
import { questions, questionShown } from "@/features/onboarding/questions";
import { noDeficit, womensNotes } from "@/features/science/womensHealth";

const base = {
  sex: "female",
  age: 30,
  heightCm: 165,
  weightKg: 70,
  activity: "moderate",
  goal: "lose_fat",
};
const shown = (a: Record<string, unknown>) =>
  questions.filter((q) => questionShown(q, a)).map((q) => q.id);

describe("women's questions", () => {
  it("are asked only of women", () => {
    expect(shown({ sex: "female" })).toContain("WH-01");
    expect(shown({ sex: "male" })).not.toContain("WH-01");
  });
  it("skip the cycle question during pregnancy", () => {
    expect(shown({ sex: "female", hormonal: ["Pregnant"] })).not.toContain(
      "WH-02",
    );
    expect(shown({ sex: "female", hormonal: ["PCOS / PCOD"] })).toContain(
      "WH-02",
    );
  });
});

describe("plan effects", () => {
  it("keeps calories at maintenance when pregnant", () => {
    const dieting = buildPlan(base).kcal;
    const pregnant = buildPlan({ ...base, hormonal: ["Pregnant"] }).kcal;
    expect(noDeficit({ ...base, hormonal: ["Pregnant"] })).toBe(true);
    expect(pregnant).toBeGreaterThan(dieting);
  });
  it("leaves PCOS numbers unchanged but adds a note", () => {
    const pcos = { ...base, hormonal: ["PCOS / PCOD"] };
    expect(buildPlan(pcos).kcal).toBe(buildPlan(base).kcal);
    expect(womensNotes(pcos)[0]).toMatch(/PCOS/);
  });
  it("ignores the answers for men", () => {
    expect(womensNotes({ sex: "male", hormonal: ["Pregnant"] })).toEqual([]);
  });
});
