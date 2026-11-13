// Food quality (D96): fibre, fermented servings, whole-food share, protein per meal, caffeine.
import { describe, expect, it } from "@jest/globals";

import { foodQuality } from "@/features/athlete/foodQuality";
import {
  findFood,
  type FoodLog,
  macrosFor,
  type MealSlot,
} from "@/features/athlete/foods";

const log = (
  foodId: string,
  grams: number,
  meal: MealSlot,
  at?: number,
): FoodLog => {
  const f = findFood(foodId);
  if (!f) throw new Error(`no food ${foodId}`);
  return {
    id: `${foodId}-${meal}`,
    date: "2026-11-14",
    meal,
    foodId,
    name: f.name,
    qty: 1,
    unit: "g",
    grams,
    source: f.source,
    macros: macrosFor(f, grams),
    ...(at !== undefined ? { at } : {}),
  };
};
const opts = { weightKg: 75, bedMinute: 23 * 60 };

describe("food quality", () => {
  it("adds fibre from foods with a known value", () => {
    const q = foodQuality(
      [log("quinoa", 150, "lunch"), log("curd", 100, "lunch")],
      opts,
    );
    expect(q.fibre).toBeCloseTo(4.2, 1);
  });
  it("counts fermented servings", () => {
    const q = foodQuality(
      [log("curd", 100, "lunch"), log("kombucha", 250, "snacks")],
      opts,
    );
    expect(q.fermented).toBe(2);
  });
  it("gives the share of calories from foods that aren't ultra-processed", () => {
    const q = foodQuality(
      [log("quinoa", 100, "lunch"), log("potato-chips", 30, "snacks")],
      opts,
    );
    expect(q.whole).toBeGreaterThan(0.4);
    expect(q.whole).toBeLessThan(0.5);
    expect(foodQuality([], opts).whole).toBeNull();
  });
  it("checks protein at each main meal against 0.4 g/kg", () => {
    const q = foodQuality([], opts);
    expect(q.proteinByMeal).toEqual([]);
    const r = foodQuality([log("chicken-breast-cooked", 120, "lunch")], opts);
    expect(r.proteinByMeal[0]).toMatchObject({ meal: "lunch", target: 30 });
  });
  it("flags caffeine after the cut-off, 8.8 hours before bed", () => {
    const early = foodQuality(
      [log("cold-brew", 350, "breakfast", 9 * 60)],
      opts,
    );
    expect(early.caffeineMg).toBe(193);
    expect(early.cutoffAt).toBe(14 * 60 + 12);
    expect(early.lateCaffeine).toBe(false);
    const late = foodQuality([log("cold-brew", 350, "snacks", 16 * 60)], opts);
    expect(late.lateCaffeine).toBe(true);
  });
  it("uses the meal's usual time for older logs without one", () => {
    expect(
      foodQuality([log("coffee-black", 240, "dinner")], opts).lateCaffeine,
    ).toBe(true);
  });
});
