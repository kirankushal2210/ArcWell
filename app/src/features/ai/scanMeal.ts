// Meal scan client (D96). With accounts on, the photo goes to the scan-meal edge function, which
// checks entitlement and the daily cap, asks the vision model and validates the answer; the app
// never holds an AI key. In sample builds (no backend) it returns the sample plate, labelled as such.
import {
  findFood,
  type Macros,
  macrosFor,
  type MealSlot,
  searchFoods,
} from "@/features/athlete/foods";
import { accountsEnabled, supabase } from "@/lib/supabase";

import { PHOTO_SAMPLE } from "./nutritionAssist";

/** One food found on the plate, for the athlete to tick and adjust. */
export type ScanItem = {
  key: string;
  name: string;
  /** Portion the scan saw; the athlete scales it with the stepper. */
  grams: number;
  macros: Macros;
  confidence: "high" | "check";
  /** The matching food in the database, so labels like fermented carry over. */
  foodId?: string;
  /** Portion label for the stepper, e.g. "katori" or "g". */
  unit: string;
};

export type ScanOutcome =
  | { status: "ok"; items: ScanItem[]; sample: boolean }
  | { status: "not_food" | "daily_limit" | "not_entitled" | "error" };

function sampleItems(): ScanItem[] {
  return PHOTO_SAMPLE.flatMap((x, i) => {
    const f = searchFoods(x.name, [])[0];
    if (!f) return [];
    const u = f.units[0];
    const grams = (u?.grams ?? 100) * x.qty;
    return [
      {
        key: `s${i}`,
        name: f.name,
        grams,
        macros: macrosFor(f, grams),
        confidence: x.confidence,
        foodId: f.id,
        unit: u?.label ?? "g",
      },
    ];
  });
}

type ScanFailure = "not_food" | "daily_limit" | "not_entitled" | "error";
const STATUS_ERROR: Record<number, ScanFailure> = {
  403: "not_entitled",
  429: "daily_limit",
};

export async function scanMeal(
  photo: { base64?: string; mime?: string } | null,
  _meal: MealSlot,
): Promise<ScanOutcome> {
  if (!accountsEnabled || !supabase || !photo?.base64) {
    // Sample build: a short pause so the screen reads like the real thing.
    await new Promise((r) => setTimeout(r, 1400));
    return { status: "ok", items: sampleItems(), sample: true };
  }
  const { data, error } = await supabase.functions.invoke("scan-meal", {
    body: { image: photo.base64, mime: photo.mime ?? "image/jpeg" },
  });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    return { status: (status && STATUS_ERROR[status]) || "error" };
  }
  const out = data as
    | {
        status: "ok";
        foods: {
          name: string;
          grams: number;
          kcal: number;
          protein: number;
          carbs: number;
          fat: number;
          confidence: "high" | "check";
        }[];
      }
    | { status: "not_food" };
  if (out.status === "not_food") return { status: "not_food" };
  return {
    status: "ok",
    sample: false,
    items: out.foods.map((f, i) => {
      // Link to our database only on an exact name match; the scan's own numbers are kept.
      const hit = searchFoods(f.name, [])[0];
      const same =
        hit && hit.name.toLowerCase() === f.name.toLowerCase()
          ? hit
          : undefined;
      return {
        key: `a${i}`,
        name: f.name,
        grams: f.grams,
        macros: { kcal: f.kcal, p: f.protein, c: f.carbs, f: f.fat },
        confidence: f.confidence,
        foodId: same && findFood(same.id) ? same.id : undefined,
        unit: "g",
      };
    }),
  };
}
