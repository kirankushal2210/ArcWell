// Nutrition assistant (D70): rules over the food database, standing in for the AI. Everything it
// suggests is a real food with its own numbers; it never invents a nutrient value.
import {
  FOODS,
  type Food,
  type Macros,
  macrosFor,
  searchFoods,
} from "@/features/athlete/foods";

const first = (q: string) => searchFoods(q, [])[0];

export type DietKey = "veg" | "egg" | "nonveg" | "vegan" | "jain";
export const DIET_OPTIONS: { value: DietKey; label: string }[] = [
  { value: "veg", label: "Vegetarian" },
  { value: "egg", label: "Eggetarian" },
  { value: "nonveg", label: "Non-veg" },
  { value: "vegan", label: "Vegan" },
  { value: "jain", label: "Jain" },
];

/** The diet from a profile label ("Non-veg", "Vegetarian (no eggs)", "vegan"…); vegetarian if unknown. */
export function dietKey(label?: string): DietKey {
  const d = (label ?? "").trim().toLowerCase();
  if (d.startsWith("vegan")) return "vegan";
  if (d.startsWith("jain")) return "jain";
  if (d.startsWith("egg")) return "egg";
  if (d.startsWith("non") || d.includes("chicken") || d.includes("meat"))
    return "nonveg";
  return "veg";
}

/** High-protein foods people in India eat, by diet. */
const PROTEIN: Record<DietKey, string[]> = {
  veg: [
    "Paneer bhurji",
    "Soya chunks curry",
    "Greek yogurt",
    "Rajma",
    "Chana dal",
  ],
  egg: [
    "Egg, boiled",
    "Egg bhurji",
    "Paneer bhurji",
    "Greek yogurt",
    "Soya chunks curry",
  ],
  nonveg: [
    "Chicken tikka",
    "Tandoori chicken",
    "Egg, boiled",
    "Paneer bhurji",
    "Greek yogurt",
  ],
  vegan: ["Soya chunks curry", "Rajma", "Chana dal"],
  jain: ["Paneer bhurji", "Greek yogurt", "Chana dal"],
};

export type Idea = {
  food: Food;
  unit: string;
  qty: number;
  macros: Macros;
};

/** Servings that close today's protein gap, a portion at a time. `diet` is a profile label. */
export function proteinIdeas(remainingG: number, diet: string): Idea[] {
  const names = PROTEIN[dietKey(diet)];
  return names
    .map((n) => first(n))
    .filter((f): f is Food => !!f)
    .map((f) => {
      const u = f.units[0];
      const per = macrosFor(f, u?.grams ?? 100);
      const qty =
        per.p > 0
          ? Math.max(
              1,
              Math.min(2, Math.round(Math.min(remainingG, 30) / per.p)),
            )
          : 1;
      return {
        food: f,
        unit: u?.label ?? "g",
        qty,
        macros: macrosFor(f, (u?.grams ?? 100) * qty),
      };
    })
    .filter((x) => x.macros.p >= 8)
    .slice(0, 4);
}

/** Dishes with similar energy (±20%) and at least as much protein as what's being swapped. */
export function swapsFor(target: Macros, exclude: string[] = []): Idea[] {
  return FOODS.filter((f) => f.kind === "dish" && !exclude.includes(f.name))
    .map((f) => {
      const u = f.units[0];
      return {
        food: f,
        unit: u?.label ?? "g",
        qty: 1,
        macros: macrosFor(f, u?.grams ?? 100),
      };
    })
    .filter(
      (x) =>
        Math.abs(x.macros.kcal - target.kcal) <= target.kcal * 0.2 &&
        x.macros.p >= target.p,
    )
    .sort((a, b) => b.macros.p - a.macros.p)
    .slice(0, 4);
}

/** Practical eating-out guidance (energy and protein, not food rules). */
export const EATING_OUT = [
  "Pick a protein first: tandoori or tikka, dal, paneer, egg or fish dishes.",
  "Restaurant cooking uses more oil and butter. Choose Restaurant when you log and Arcwell adds it for you.",
  "Creamy and butter gravies add the most energy; dry, tandoori and dal dishes add less.",
  "Roti or phulka instead of naan or paratha saves energy if you're losing fat.",
  "One meal out doesn't undo a week. Log it honestly and carry on.",
];

/** Sample photo result (F5-10): what the AI would find on a thali, for the confirm screen. */
export const PHOTO_SAMPLE: {
  name: string;
  qty: number;
  confidence: "high" | "check";
}[] = [
  { name: "Dal tadka", qty: 1, confidence: "high" },
  { name: "Steamed rice", qty: 1, confidence: "high" },
  { name: "Phulka (roti)", qty: 2, confidence: "check" },
  { name: "Paneer bhurji", qty: 1, confidence: "check" },
];
