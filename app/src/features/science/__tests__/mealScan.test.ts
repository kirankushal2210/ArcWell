// Meal scan answer checks (D96): the model's JSON is never trusted as is.
import { describe, expect, it } from "@jest/globals";

import { parseMealScan } from "../../../../../supabase/functions/_shared/ai/mealScan";

const food = (o: Record<string, unknown> = {}) => ({
  name: "dal tadka",
  grams: 150,
  kcal: 165,
  protein_g: 9,
  carbs_g: 21,
  fat_g: 5.3,
  confidence: "high",
  ...o,
});
const run = (foods: unknown[], isFood = true) =>
  parseMealScan(JSON.stringify({ is_food: isFood, foods }));

describe("meal scan checks", () => {
  it("accepts a sound answer and tidies names", () => {
    const r = run([food()]);
    expect(r).toEqual({
      status: "ok",
      foods: [
        {
          name: "Dal tadka",
          grams: 150,
          kcal: 165,
          protein: 9,
          carbs: 21,
          fat: 5.3,
          confidence: "high",
        },
      ],
    });
  });
  it("says not food when the photo isn't food", () => {
    expect(run([], false)).toEqual({ status: "not_food" });
  });
  it("rejects broken JSON and empty answers", () => {
    expect(parseMealScan("not json")).toEqual({ status: "invalid" });
    expect(run([])).toEqual({ status: "invalid" });
  });
  it("drops items outside sane ranges", () => {
    const r = run([
      food({ grams: 5000 }),
      food({ name: "" }),
      food({ protein_g: -3 }),
      food({ name: "roti" }),
    ]);
    expect(r.status === "ok" && r.foods.map((f) => f.name)).toEqual(["Roti"]);
  });
  it("rebuilds calories that don't match the macros", () => {
    const r = run([food({ kcal: 900 })]);
    expect(r.status === "ok" && r.foods[0].kcal).toBe(
      Math.round(9 * 4 + 21 * 4 + 5.3 * 9),
    );
  });
  it("marks unknown confidence as check and keeps at most 8 items", () => {
    const r = run(
      Array.from({ length: 12 }, (_, i) =>
        food({ name: `item ${i}`, confidence: "maybe" }),
      ),
    );
    expect(r.status === "ok" && r.foods.length).toBe(8);
    expect(r.status === "ok" && r.foods[0].confidence).toBe("check");
  });
});
