// Generate a meal plan (F5-13, D70): a day of Indian meals built by rules from the athlete's
// targets, diet and meals a day, using foods from the food database in home portions. Protein
// portions grow first until the day reaches its protein target, then roti, rice and other carbs
// are sized to the energy target. Every number comes from the food database; nothing is invented.
// Sample build: these rules stand in for the AI; the athlete reviews the day and accepts it.
import {
  findFood,
  type Macros,
  type PlanItem,
  planItemMacros,
  sumMacros,
} from "@/features/athlete/foods";
import { type Meal, mealOf } from "@/features/coach/plans";

import type { DietKey } from "./nutritionAssist";

export type Targets = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Role = "carb" | "protein" | "side";
/** foodId, portions, unit, role, most portions in one meal. */
type Part = [string, number, string, Role, number?];
type Option = { diets: DietKey[]; parts: Part[] };

const ALL: DietKey[] = ["veg", "egg", "nonveg", "vegan", "jain"];
const VEG_UP: DietKey[] = ["veg", "egg", "nonveg"];
const DAIRY: DietKey[] = ["veg", "egg", "nonveg", "jain"];
const EGG_UP: DietKey[] = ["egg", "nonveg"];

// Jain options leave out onion, garlic, potato and other root vegetables.
const BREAKFAST: Option[] = [
  {
    diets: DAIRY,
    parts: [
      ["moong-chilla", 2, "piece", "carb", 4],
      ["curd", 1, "katori", "protein", 2],
    ],
  },
  {
    diets: DAIRY,
    parts: [
      ["oats-milk", 1, "bowl", "carb", 2],
      ["greek-yogurt", 1, "cup", "protein", 2],
    ],
  },
  {
    diets: [...VEG_UP, "vegan"],
    parts: [
      ["poha", 1.5, "katori", "carb", 3],
      ["sprouts-salad", 1, "katori", "protein", 2],
    ],
  },
  {
    diets: EGG_UP,
    parts: [
      ["egg-bhurji", 1, "katori", "protein", 2],
      ["bread-brown", 2, "slice", "carb", 4],
    ],
  },
  {
    diets: EGG_UP,
    parts: [
      ["omelette", 1, "piece", "protein", 2],
      ["bread-brown", 2, "slice", "carb", 4],
      ["orange", 1, "piece", "side"],
    ],
  },
  {
    diets: ["vegan"],
    parts: [
      ["tofu-scramble", 1, "katori", "protein", 2],
      ["bread-brown", 2, "slice", "carb", 4],
    ],
  },
  {
    diets: ["vegan", "jain"],
    parts: [
      ["besan-chilla", 2, "piece", "carb", 4],
      ["sprouts-salad", 1, "katori", "protein", 2],
    ],
  },
];

/** Lunch and dinner: a carb, a protein dish and sides. Dinner takes the next option to lunch. */
const MAIN: Option[] = [
  {
    diets: ["veg", "egg", "jain"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["paneer-bhurji", 1, "katori", "protein", 1.5],
      ["dal-tadka", 1, "katori", "side"],
      ["salad", 1, "katori", "side"],
    ],
  },
  {
    diets: VEG_UP,
    parts: [
      ["rice", 1, "katori", "carb", 2.5],
      ["rajma", 1, "katori", "protein", 2],
      ["curd", 1, "katori", "side"],
      ["salad", 1, "katori", "side"],
    ],
  },
  {
    diets: ["egg", "nonveg"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["egg-curry", 1, "katori", "protein", 2],
      ["mixed-veg", 1, "katori", "side"],
    ],
  },
  {
    diets: ["nonveg"],
    parts: [
      ["rice", 1, "katori", "carb", 2.5],
      ["chicken-curry", 1, "katori", "protein", 2],
      ["dal-tadka", 1, "katori", "side"],
      ["salad", 1, "katori", "side"],
    ],
  },
  {
    diets: ["veg"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["chole", 1, "katori", "protein", 2],
      ["raita", 1, "katori", "side"],
      ["salad", 1, "katori", "side"],
    ],
  },
  {
    diets: ["nonveg"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["chicken-tikka", 4, "piece", "protein", 7],
      ["mixed-veg", 1, "katori", "side"],
      ["curd", 1, "katori", "side"],
    ],
  },
  {
    diets: ["nonveg"],
    parts: [
      ["rice", 1, "katori", "carb", 2.5],
      ["fish-curry", 1, "katori", "protein", 2],
      ["cabbage-sabzi", 1, "katori", "side"],
    ],
  },
  {
    diets: ["veg", "egg", "vegan"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["soya-curry", 1, "katori", "protein", 2],
      ["moong-dal", 1, "katori", "side"],
      ["salad", 1, "katori", "side"],
    ],
  },
  {
    diets: ["vegan"],
    parts: [
      ["rice", 1, "katori", "carb", 2.5],
      ["rajma", 1, "katori", "protein", 2],
      ["bhindi", 1, "katori", "side"],
      ["salad", 1, "katori", "side"],
    ],
  },
  {
    diets: ["vegan"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["tofu-stir-fry", 1, "katori", "protein", 2],
      ["dal-tadka", 1, "katori", "side"],
    ],
  },
  {
    diets: ["jain"],
    parts: [
      ["rice", 1, "katori", "carb", 2.5],
      ["chana-dal", 1, "katori", "protein", 2],
      ["cabbage-sabzi", 1, "katori", "side"],
      ["curd", 1, "katori", "side"],
    ],
  },
  {
    diets: ["jain"],
    parts: [
      ["phulka", 2, "piece", "carb", 5],
      ["palak-paneer", 1, "katori", "protein", 2],
      ["moong-dal", 1, "katori", "side"],
      ["lauki", 1, "katori", "side"],
    ],
  },
];

const SNACK: Option[] = [
  {
    diets: DAIRY,
    parts: [
      ["greek-yogurt", 1, "cup", "protein", 2],
      ["apple", 1, "piece", "carb", 2],
    ],
  },
  {
    diets: ALL,
    parts: [
      ["roasted-chana", 1, "handful", "protein", 2],
      ["guava", 1, "piece", "carb", 2],
    ],
  },
  {
    diets: EGG_UP,
    parts: [
      ["egg-boiled", 2, "piece", "protein", 4],
      ["banana", 1, "piece", "carb", 2],
    ],
  },
  {
    diets: [...VEG_UP, "vegan"],
    parts: [
      ["sprouts-salad", 1, "katori", "protein", 2],
      ["banana", 1, "piece", "carb", 2],
    ],
  },
];

const MID: Option[] = [
  {
    diets: DAIRY,
    parts: [
      ["buttermilk", 1, "glass", "side"],
      ["banana", 1, "piece", "carb", 2],
    ],
  },
  {
    diets: ALL,
    parts: [
      ["papaya", 1, "katori", "carb", 2],
      ["almonds", 1, "handful", "side"],
    ],
  },
];

/** Extra protein when the meals alone fall short, added to the snack (or dinner). */
const BOOST: Record<DietKey, Part[]> = {
  veg: [
    ["greek-yogurt", 1, "cup", "protein", 2],
    ["paneer", 2, "piece", "protein", 4],
  ],
  jain: [
    ["greek-yogurt", 1, "cup", "protein", 2],
    ["paneer", 2, "piece", "protein", 4],
  ],
  egg: [
    ["egg-boiled", 2, "piece", "protein", 4],
    ["greek-yogurt", 1, "cup", "protein", 2],
  ],
  nonveg: [
    ["chicken-tikka", 3, "piece", "protein", 6],
    ["egg-boiled", 2, "piece", "protein", 4],
  ],
  vegan: [
    ["soya-curry", 1, "katori", "protein", 2],
    ["tofu", 1, "piece", "protein", 2],
  ],
};

type Slot = {
  name: string;
  time: string;
  share: number;
  pool: Option[];
  offset: number;
};
const B = (share: number): Slot => ({
  name: "Breakfast",
  time: "8:00 am",
  share,
  pool: BREAKFAST,
  offset: 0,
});
const L = (share: number): Slot => ({
  name: "Lunch",
  time: "1:30 pm",
  share,
  pool: MAIN,
  offset: 0,
});
const D = (share: number): Slot => ({
  name: "Dinner",
  time: "8:30 pm",
  share,
  pool: MAIN,
  offset: 1,
});
const S = (share: number): Slot => ({
  name: "Snack",
  time: "5:30 pm",
  share,
  pool: SNACK,
  offset: 0,
});

/** How the day's energy is shared across meals, by meals a day. */
function slotsFor(meals: number): Slot[] {
  if (meals <= 2)
    return [
      {
        name: "Brunch",
        time: "11:00 am",
        share: 0.45,
        pool: BREAKFAST,
        offset: 0,
      },
      { ...D(0.55), time: "7:30 pm", offset: 0 },
    ];
  if (meals === 3) return [B(0.3), L(0.35), D(0.35)];
  if (meals === 4) return [B(0.25), L(0.3), S(0.15), D(0.3)];
  return [
    B(0.2),
    { name: "Mid-morning", time: "11:00 am", share: 0.1, pool: MID, offset: 0 },
    L(0.27),
    S(0.13),
    D(0.3),
  ];
}

type Working = { slot: Slot; parts: { part: Part; qty: number }[] };

const stepOf = (unit: string) =>
  unit === "g" ? 25 : unit === "piece" || unit === "slice" ? 1 : 0.5;
/** Bigger meals (two a day) allow up to half as much again. */
const maxOf = (p: Part, slot: Slot) => {
  const s = stepOf(p[2]);
  const k = Math.min(1.5, Math.max(1, slot.share / 0.3));
  return Math.max(p[1], Math.floor(((p[4] ?? p[1]) * k) / s) * s);
};
const itemOf = (p: Part, qty: number): PlanItem => ({
  foodId: p[0],
  qty,
  unit: p[2],
});
const mealMacros = (w: Working) =>
  sumMacros(w.parts.map((x) => planItemMacros(itemOf(x.part, x.qty))));
const dayMacros = (ws: Working[]) => sumMacros(ws.map(mealMacros));

export type GeneratedPlan = { meals: Meal[]; totals: Macros };

/**
 * A day of meals for these targets. `variant` picks a different set of dishes for "Try another".
 * Energy lands within a few percent of the target whenever the portions allow it.
 */
export function generateMealPlan(p: {
  targets: Targets;
  diet: DietKey;
  meals: number;
  variant?: number;
}): GeneratedPlan {
  const v = Math.max(0, Math.floor(p.variant ?? 0));
  const slots = slotsFor(Math.round(p.meals));
  const day: Working[] = slots.map((slot) => {
    const pool = slot.pool.filter((o) => o.diets.includes(p.diet));
    const pick = pool[(v + slot.offset) % pool.length];
    return { slot, parts: pick.parts.map((part) => ({ part, qty: part[1] })) };
  });
  const { kcal, protein } = p.targets;

  // 1. Protein: take the leanest step first (most protein per kcal), whether a bigger portion
  // of a protein dish or an extra protein food in the snack (or dinner).
  const boosts = [...BOOST[p.diet]];
  const boostMeal =
    day.find((w) => w.slot.name === "Snack") ?? day[day.length - 1];
  const lean = (part: Part, qty: number) => {
    const m = planItemMacros(itemOf(part, qty));
    return m.kcal > 0 ? m.p / m.kcal : 0;
  };
  for (let i = 0; i < 40 && dayMacros(day).p < protein - 3; i++) {
    const open = day
      .flatMap((w) =>
        w.parts.filter(
          (x) =>
            x.part[3] === "protein" &&
            x.qty + stepOf(x.part[2]) <= maxOf(x.part, w.slot),
        ),
      )
      .sort(
        (a, b) =>
          lean(b.part, stepOf(b.part[2])) - lean(a.part, stepOf(a.part[2])),
      );
    const extra = boosts.find(
      (b) => !boostMeal.parts.some((x) => x.part[0] === b[0]),
    );
    const best = open[0];
    if (
      extra &&
      (!best || lean(extra, extra[1]) > lean(best.part, stepOf(best.part[2])))
    ) {
      boosts.splice(boosts.indexOf(extra), 1);
      boostMeal.parts.push({ part: extra, qty: extra[1] });
    } else if (best) best.qty += stepOf(best.part[2]);
    else break;
  }

  // 2. Energy: size the carbs, a step at a time, in the meal furthest from its share.
  const gap = (w: Working) => kcal * w.slot.share - mealMacros(w).kcal;
  for (let i = 0; i < 80; i++) {
    const total = dayMacros(day).kcal;
    const under = total < kcal * 0.97;
    const over = total > kcal * 1.03;
    if (!under && !over) break;
    const moves = day
      .flatMap((w) =>
        w.parts
          .filter((x) => {
            if (x.part[3] !== "carb") return false;
            const s = stepOf(x.part[2]);
            return under ? x.qty + s <= maxOf(x.part, w.slot) : x.qty - s >= s;
          })
          .map((x) => ({ w, x })),
      )
      .sort((a, b) => (under ? gap(b.w) - gap(a.w) : gap(a.w) - gap(b.w)));
    if (!moves.length) break;
    const m = moves[0];
    const s = stepOf(m.x.part[2]);
    const before = Math.abs(total - kcal);
    m.x.qty += under ? s : -s;
    // Stop when a step would land further from the target than not taking it.
    if (Math.abs(dayMacros(day).kcal - kcal) > before) {
      m.x.qty -= under ? s : -s;
      break;
    }
  }

  const meals = day.map((w) =>
    mealOf(
      w.slot.name,
      w.slot.time,
      w.parts
        .filter((x) => findFood(x.part[0]))
        .map((x) => itemOf(x.part, x.qty)),
    ),
  );
  return { meals, totals: dayMacros(day) };
}
