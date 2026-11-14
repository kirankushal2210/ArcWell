// Meal photo → foods (D96): the prompt and the check on the model's answer. Pure TypeScript with no
// Deno or app imports, so the edge function and the app's tests share it. Never trust the model:
// every food is checked against sane ranges, and calories that don't match the macros are
// recomputed from them.

export const MEAL_SCAN_FEATURE = "meal_scan";
/** Scans per athlete per day (UTC). */
export const MEAL_SCAN_DAILY_CAP = 20;
/** Base64 image size limit, about 3 MB of JPEG. */
export const MEAL_SCAN_MAX_BASE64 = 4_000_000;

export const MEAL_SCAN_PROMPT = `You estimate what is on a plate from one photo, for an Indian fitness app.
Users mostly live in Indian cities: expect home-cooked Indian food (dal, sabzi, roti, rice, paneer,
eggs, chicken), South Indian dishes, café food and ordered-in meals.

Return only JSON:
{"is_food": boolean, "foods": [{"name": string, "grams": number, "kcal": number,
 "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "high" | "check"}]}

Rules:
- is_food is false for anything that is not food or drink; then foods is [].
- One entry per separate item (dal, rice and roti are three), at most 8.
- name: what an Indian home cook calls it, 1 to 5 words, no brands.
- grams: the portion visible, using the plate, katori, cutlery or hand for scale.
- Numbers are for that portion, not per 100 g. Count the oil used in Indian cooking.
- protein_g*4 + carbs_g*4 + fat_g*9 should be within 10% of kcal.
- confidence is "check" when the item or its portion is a guess.`;

export type ScannedFood = {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "high" | "check";
};

export type ScanResult =
  | { status: "ok"; foods: ScannedFood[] }
  | { status: "not_food" }
  | { status: "invalid" };

const num = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max
    ? v
    : null;

/** Check and tidy the model's JSON; anything outside the rules is dropped, not trusted. */
export function parseMealScan(text: string): ScanResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { status: "invalid" };
  }
  if (!raw || typeof raw !== "object") return { status: "invalid" };
  const o = raw as { is_food?: unknown; foods?: unknown };
  if (o.is_food === false) return { status: "not_food" };
  if (o.is_food !== true || !Array.isArray(o.foods)) return { status: "invalid" };

  const foods: ScannedFood[] = [];
  for (const item of o.foods.slice(0, 8)) {
    if (!item || typeof item !== "object") continue;
    const f = item as Record<string, unknown>;
    const name =
      typeof f.name === "string" ? f.name.trim().replace(/\s+/g, " ") : "";
    const grams = num(f.grams, 1, 1500);
    const protein = num(f.protein_g, 0, 300);
    const carbs = num(f.carbs_g, 0, 500);
    const fat = num(f.fat_g, 0, 300);
    let kcal = num(f.kcal, 0, 4000);
    if (!name || name.length > 60 || grams === null) continue;
    if (protein === null || carbs === null || fat === null || kcal === null)
      continue;
    const fromMacros = protein * 4 + carbs * 4 + fat * 9;
    // Calories that don't add up are rebuilt from the macros.
    if (Math.abs(fromMacros - kcal) > Math.max(25, kcal * 0.2)) kcal = fromMacros;
    const r = (x: number) => Math.round(x * 10) / 10;
    foods.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      grams: Math.round(grams),
      kcal: Math.round(kcal),
      protein: r(protein),
      carbs: r(carbs),
      fat: r(fat),
      confidence: f.confidence === "high" ? "high" : "check",
    });
  }
  return foods.length ? { status: "ok", foods } : { status: "invalid" };
}
