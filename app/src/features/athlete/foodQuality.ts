// Food quality for a day (D96, Nutrition phase 2): research-backed habits beside calories and
// macros, computed from the day's logs and the food labels (D95). Pure, so it's tested directly.
// - Fibre: at least 25 g a day, with 25–29 g linked to better health (reynolds2019).
// - Fermented foods: a high-fermented-food diet raised gut microbe diversity and lowered
//   inflammation markers (wastyk2021); counted as servings, aiming for at least 2 a day.
// - Whole foods: an ultra-processed diet led people to eat about 500 kcal a day more (hall2019);
//   shown as the share of the day's calories from foods that aren't ultra-processed.
// - Protein per meal: about 0.4 g per kg at each main meal (schoenfeld2018meal).
// - Caffeine: a coffee at least 8.8 hours before bed to avoid losing sleep (gardiner2023).
import { findFood, type Food, type FoodLog, type MealSlot } from "./foods";

export const FIBRE_TARGET_G = 25;
export const FERMENTED_TARGET = 2;
export const PROTEIN_PER_MEAL_G_PER_KG = 0.4;
/** Hours before bed for the last caffeine (gardiner2023, for a coffee-sized dose). */
export const CAFFEINE_CUTOFF_H = 8.8;

const MAIN_MEALS: MealSlot[] = ["breakfast", "lunch", "dinner"];

/** Typical clock time of each slot, for logs saved before times were recorded. */
const SLOT_MINUTE: Record<MealSlot, number> = {
  breakfast: 8 * 60,
  lunch: 13 * 60,
  snacks: 17 * 60,
  dinner: 20 * 60 + 30,
};

export type FoodQuality = {
  /** Fibre from logs whose food has a known fibre value. */
  fibre: number;
  fermented: number;
  /** Share of calories from foods that aren't ultra-processed, 0–1; null with nothing logged. */
  whole: number | null;
  /** Protein per main meal with anything logged, against the per-meal target. */
  proteinByMeal: { meal: MealSlot; grams: number; target: number }[];
  caffeineMg: number;
  /** Clock minute of the day's last caffeine, if any. */
  lastCaffeineAt: number | null;
  /** Clock minute by which the last caffeine should be. */
  cutoffAt: number;
  /** True when caffeine was had after the cut-off. */
  lateCaffeine: boolean;
};

const per100 = (food: Food | undefined, grams: number, v?: number) =>
  food && typeof v === "number" ? (v * grams) / 100 : 0;

export function foodQuality(
  logs: FoodLog[],
  opts: { weightKg: number; bedMinute: number; mine?: Food[] },
): FoodQuality {
  let fibre = 0;
  let fermented = 0;
  let kcal = 0;
  let ultraKcal = 0;
  let caffeineMg = 0;
  let lastCaffeineAt: number | null = null;
  for (const l of logs) {
    const food = findFood(l.foodId, opts.mine);
    fibre += per100(food, l.grams, food?.fibre);
    if (food?.tag === "fermented") fermented += 1;
    kcal += l.macros.kcal;
    if (food?.tag === "ultra") ultraKcal += l.macros.kcal;
    const mg = per100(food, l.grams, food?.caffeine);
    if (mg > 0) {
      caffeineMg += mg;
      const at = l.at ?? SLOT_MINUTE[l.meal];
      lastCaffeineAt = Math.max(lastCaffeineAt ?? 0, at);
    }
  }
  const cutoffAt =
    (((opts.bedMinute - CAFFEINE_CUTOFF_H * 60) % 1440) + 1440) % 1440;
  const target = Math.round(PROTEIN_PER_MEAL_G_PER_KG * opts.weightKg);
  return {
    fibre: Math.round(fibre * 10) / 10,
    fermented,
    whole: kcal > 0 ? (kcal - ultraKcal) / kcal : null,
    proteinByMeal: MAIN_MEALS.filter((m) => logs.some((l) => l.meal === m)).map(
      (m) => ({
        meal: m,
        grams: Math.round(
          logs.filter((l) => l.meal === m).reduce((s, l) => s + l.macros.p, 0),
        ),
        target,
      }),
    ),
    caffeineMg: Math.round(caffeineMg),
    lastCaffeineAt,
    cutoffAt: Math.round(cutoffAt),
    lateCaffeine: lastCaffeineAt !== null && lastCaffeineAt > cutoffAt,
  };
}

/** "13:42". */
export const clockText = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;
