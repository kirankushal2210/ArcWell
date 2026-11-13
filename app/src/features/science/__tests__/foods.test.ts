// Food data checks (D95): no duplicates, calories that match their macros, search finds the new
// tier-1 city foods, and the fermented / ultra-processed / caffeine labels are attached.
import { describe, expect, it } from "@jest/globals";

import { FOODS, searchFoods } from "@/features/athlete/foods";

// Alcohol (7 kcal/g) isn't in protein, carbs and fat, so drinks with it are left out of the check.
const ALCOHOL = new Set(["beer", "wine"]);

describe("food data", () => {
  it("has no duplicate ids or names", () => {
    const ids = FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = FOODS.map((f) => f.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
  it("has a portion for every food", () => {
    expect(FOODS.every((f) => f.units.length > 0 && f.units[0].grams > 0)).toBe(
      true,
    );
  });
  it("keeps calories within 15% of their protein, carbs, fibre and fat for the new foods", () => {
    const off = FOODS.filter(
      (f) =>
        f.source === "estimate" && !ALCOHOL.has(f.id) && f.per100.kcal >= 20,
    ).filter((f) => {
      const m = f.per100;
      // Fibre counts about 2 kcal/g rather than 4.
      const fib = f.fibre ?? 0;
      const est = 4 * m.p + 4 * (m.c - fib) + 2 * fib + 9 * m.f;
      return Math.abs(est - m.kcal) > 0.15 * m.kcal;
    });
    expect(off.map((f) => f.name)).toEqual([]);
  });
});

describe("tier-1 city foods", () => {
  it.each([
    ["cold brew", "Cold brew coffee"],
    ["latte", "Café latte"],
    ["momo", "Veg momos, steamed"],
    ["protein bar", "Protein bar"],
    ["kathi roll", "Chicken kathi roll"],
    ["overnight oats", "Overnight oats with milk"],
    ["sourdough", "Sourdough bread"],
  ])("finds %s", (q, name) => {
    expect(searchFoods(q, []).map((f) => f.name)).toContain(name);
  });
  it("labels fermented, ultra-processed and caffeinated foods", () => {
    const byId = (id: string) => FOODS.find((f) => f.id === id);
    expect(byId("curd")?.tag).toBe("fermented");
    expect(byId("kombucha")?.tag).toBe("fermented");
    expect(byId("maggi")?.tag).toBe("ultra");
    expect(byId("protein-bar")?.tag).toBe("ultra");
    expect(byId("cold-brew")?.caffeine).toBeGreaterThan(0);
    expect(byId("chai-sugar")?.caffeine).toBeGreaterThan(0);
  });
});
