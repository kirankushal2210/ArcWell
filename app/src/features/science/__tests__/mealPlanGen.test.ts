// Generated meal plans (F5-13, D70): real foods, the athlete's diet, close to their targets.
import { describe, expect, it } from "@jest/globals";

import { generateMealPlan } from "@/features/ai/mealPlanGen";
import { type DietKey, dietKey } from "@/features/ai/nutritionAssist";
import { findFood } from "@/features/athlete/foods";

const DIETS: DietKey[] = ["veg", "egg", "nonveg", "vegan", "jain"];
const TARGETS = [
  { kcal: 1600, protein: 100, carbs: 170, fat: 50 },
  { kcal: 2000, protein: 120, carbs: 230, fat: 60 },
  { kcal: 2600, protein: 150, carbs: 310, fat: 75 },
];
const ids = (diet: DietKey, meals = 4, variant = 0) =>
  generateMealPlan({ targets: TARGETS[1], diet, meals, variant }).meals.flatMap(
    (m) => (m.items ?? []).map((i) => i.foodId),
  );

describe("meal plan generator", () => {
  it("builds the meals asked for, each with real foods", () => {
    for (const meals of [2, 3, 4, 5]) {
      const g = generateMealPlan({ targets: TARGETS[1], diet: "veg", meals });
      expect(g.meals).toHaveLength(meals);
      for (const m of g.meals) {
        expect(m.items?.length).toBeGreaterThan(0);
        for (const i of m.items ?? []) expect(findFood(i.foodId)).toBeTruthy();
        expect(m.foods.length).toBeGreaterThan(0);
      }
    }
  });

  it("lands near the energy target and reaches most of the protein", () => {
    for (const diet of DIETS)
      for (const t of TARGETS)
        for (const meals of [3, 4, 5])
          for (const variant of [0, 1, 2]) {
            const g = generateMealPlan({ targets: t, diet, meals, variant });
            expect(Math.abs(g.totals.kcal - t.kcal) / t.kcal).toBeLessThan(0.1);
            expect(g.totals.p).toBeGreaterThanOrEqual(t.protein * 0.85);
          }
  });

  it("keeps to the diet", () => {
    const meat = /chicken|fish|mutton|prawn|keema/;
    const egg = /egg|omelette/;
    const dairy = /curd|paneer|yogurt|milk|raita|buttermilk|ghee/;
    const root = /aloo|potato|poha|onion/;
    for (const v of [0, 1, 2, 3]) {
      for (const d of ["veg", "jain", "vegan"] as DietKey[])
        for (const id of ids(d, 4, v)) {
          expect(id).not.toMatch(meat);
          expect(id).not.toMatch(egg);
        }
      for (const id of ids("vegan", 5, v)) expect(id).not.toMatch(dairy);
      for (const id of ids("jain", 5, v)) expect(id).not.toMatch(root);
      for (const id of ids("egg", 4, v)) expect(id).not.toMatch(meat);
    }
  });

  it("gives a different day for another variant", () => {
    expect(ids("veg", 4, 0)).not.toEqual(ids("veg", 4, 1));
  });

  it("uses Indian home portions, not grams", () => {
    for (const d of DIETS)
      for (const id of generateMealPlan({
        targets: TARGETS[2],
        diet: d,
        meals: 4,
      }).meals.flatMap((m) => m.items ?? []))
        expect(id.unit).not.toBe("g");
  });
});

describe("diet labels", () => {
  it("reads profile labels", () => {
    expect(dietKey("Vegetarian")).toBe("veg");
    expect(dietKey("Non-veg")).toBe("nonveg");
    expect(dietKey("Eggetarian")).toBe("egg");
    expect(dietKey("Vegan")).toBe("vegan");
    expect(dietKey("Jain")).toBe("jain");
    expect(dietKey(undefined)).toBe("veg");
  });
});
