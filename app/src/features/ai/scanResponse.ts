// The scan-meal edge function's answer, checked before the app trusts it (D96). The server already
// validates the model's output; this guards the app against a changed or broken response.

export type ScannedFood = {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "high" | "check";
};

export type ScanResponse =
  { status: "ok"; foods: ScannedFood[] } | { status: "not_food" } | null;

const num = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;

function food(x: unknown): ScannedFood | null {
  if (!x || typeof x !== "object") return null;
  const f = x as Record<string, unknown>;
  if (typeof f.name !== "string" || !f.name.trim()) return null;
  if (![f.grams, f.kcal, f.protein, f.carbs, f.fat].every(num)) return null;
  return {
    name: f.name.trim(),
    grams: f.grams as number,
    kcal: f.kcal as number,
    protein: f.protein as number,
    carbs: f.carbs as number,
    fat: f.fat as number,
    confidence: f.confidence === "high" ? "high" : "check",
  };
}

/** The response as foods, "not food", or null when its shape is wrong. */
export function parseScanResponse(data: unknown): ScanResponse {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.status === "not_food") return { status: "not_food" };
  if (d.status !== "ok" || !Array.isArray(d.foods) || !d.foods.length)
    return null;
  const foods = d.foods.map(food);
  if (foods.some((f) => !f)) return null;
  return { status: "ok", foods: foods as ScannedFood[] };
}
