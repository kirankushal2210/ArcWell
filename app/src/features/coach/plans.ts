// The three things a coach plans for a client (D56): a training program, a nutrition plan
// (targets plus an example day) and a recovery protocol. Each client owns their own copy, so
// editing one client's plan never changes another's.
import { type PlanItem, planItemText } from "@/features/athlete/foods";
import { type StationKey, stationOf } from "@/features/race/data";
import {
  isCompound,
  proteinTarget,
  rpeTargetFor,
} from "@/features/science/rules";

/** Target effort on the reps-in-reserve RPE scale, low to high (D83, helms2016rir). */
export type RpeRange = [number, number];

/**
 * Endurance and HYROX blocks (D76, D79). A block is still a planned exercise, so the logger, history
 * and volume checks treat it like any other: `sets` is the repeats, `reps` the distance or time each
 * ("400 m", "3 min", "100"), `restSec` the rest between repeats.
 */
export type PlannedBlock =
  | {
      kind: "interval";
      measure: "distance" | "time";
      /** Metres or seconds per repeat. */
      amount: number;
      /** Target pace "m:ss", per km for runs and per 500 m on rowers and ski ergs. */
      pace?: string;
    }
  | {
      kind: "station";
      station: StationKey;
      /** Metres or reps for the station. */
      amount: number;
      unit: "m" | "reps";
    };

export type PlannedExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  /** The coach's target effort (K-07). Unset: the athlete sees the rules range (rpeTargetFor). */
  rpe?: RpeRange;
  /** Set for run or erg intervals and HYROX stations. */
  block?: PlannedBlock;
};
export type TrainingDay = {
  id: string;
  name: string;
  exercises: PlannedExercise[];
  /** Shown above the session in the preview, e.g. "Keep 2 reps in reserve today" (F4-02). */
  note?: string;
};
export type TrainingProgram = {
  name: string;
  weeks: number;
  days: TrainingDay[];
};

export type Meal = {
  id: string;
  name: string;
  time: string;
  /** Short text of the foods; built from `items` when the meal has exact foods. */
  foods: string;
  /** Exact foods and quantities (F5-12). Older plans have text only. */
  items?: PlanItem[];
};
export type NutritionPlan = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
};

export type RecoveryProtocol = {
  sleepH: number;
  /** Minutes after midnight; bedtimes after midnight go past 1440. */
  bed: number;
  wake: number;
  /** 0 = Monday … 6 = Sunday. */
  restDays: number[];
  note: string;
};

let seq = 0;
export const uid = (p = "x") =>
  `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

const ex = (
  name: string,
  sets: number,
  reps: string,
  restSec = 90,
): PlannedExercise => ({
  id: uid("e"),
  name,
  sets,
  reps,
  restSec,
});
const day = (name: string, exercises: PlannedExercise[]): TrainingDay => ({
  id: uid("d"),
  name,
  exercises,
});

/** Starting points matching the coach's templates (K-05); a fresh copy every time. */
export function programFromTemplate(template: string): TrainingProgram {
  if (template.startsWith("Fat loss"))
    return {
      name: "Fat loss · 4 days",
      weeks: 8,
      days: [
        day("Upper A", [
          ex("Shoulder press (dumbbell)", 3, "8–10"),
          ex("Lat pulldown (cable)", 3, "10–12"),
          ex("Incline bench press (dumbbell)", 3, "10–12"),
          ex("Seated cable row - bar grip", 3, "10–12"),
          ex("Plank", 3, "40 s", 60),
        ]),
        day("Lower A", [
          ex("Goblet squat", 3, "10–12"),
          ex("Romanian deadlift (barbell)", 3, "8–10"),
          ex("Walking lunge", 3, "10 each"),
          ex("Standing calf raise", 3, "12–15", 60),
        ]),
        day("Upper B", [
          ex("Bench press (barbell)", 3, "8–10"),
          ex("Dumbbell row", 3, "10 each"),
          ex("Lateral raise (dumbbell)", 3, "12–15", 60),
          ex("Triceps pushdown", 3, "12", 60),
        ]),
        day("Lower B", [
          ex("Leg press (machine)", 3, "10–12"),
          ex("Hip thrust (barbell)", 3, "10"),
          ex("Lying leg curl (machine)", 3, "12"),
          ex("Walking", 1, "20 min", 0),
        ]),
      ],
    };
  if (template.startsWith("Muscle gain"))
    return {
      name: "Muscle gain · 5 days",
      weeks: 10,
      days: [
        day("Push", [
          ex("Bench press (barbell)", 4, "6–8", 120),
          ex("Overhead press (barbell)", 3, "8–10"),
          ex("Cable fly crossovers", 3, "12"),
          ex("Triceps pushdown", 3, "12", 60),
        ]),
        day("Pull", [
          ex("Deadlift (barbell)", 3, "5", 150),
          ex("Pull up", 3, "6–10"),
          ex("Seated cable row - bar grip", 3, "10"),
          ex("Bicep curl (barbell)", 3, "10", 60),
        ]),
        day("Legs", [
          ex("Squat (barbell)", 4, "6–8", 150),
          ex("Romanian deadlift (barbell)", 3, "8"),
          ex("Lying leg curl (machine)", 3, "12"),
          ex("Standing calf raise", 4, "12", 60),
        ]),
        day("Upper", [
          ex("Incline bench press (dumbbell)", 3, "10"),
          ex("Lat pulldown (cable)", 3, "10"),
          ex("Lateral raise (dumbbell)", 3, "15", 60),
          ex("Hammer curl (dumbbell)", 3, "12", 60),
        ]),
        day("Lower", [
          ex("Leg press (machine)", 4, "10"),
          ex("Hip thrust (barbell)", 3, "10"),
          ex("Walking lunge", 3, "10 each"),
          ex("Cable crunch", 3, "15", 60),
        ]),
      ],
    };
  if (template.startsWith("Strength"))
    return {
      name: "Strength · 4 days",
      weeks: 8,
      days: [
        day("Squat day", [
          ex("Squat (barbell)", 5, "5", 180),
          ex("Romanian deadlift (barbell)", 3, "6", 120),
          ex("Plank", 3, "45 s", 60),
        ]),
        day("Bench day", [
          ex("Bench press (barbell)", 5, "5", 180),
          ex("Dumbbell row", 4, "8"),
          ex("Face pull", 3, "15", 60),
        ]),
        day("Deadlift day", [
          ex("Deadlift (barbell)", 4, "4", 180),
          ex("Goblet squat", 3, "8"),
          ex("Dead bug", 3, "10", 60),
        ]),
        day("Press day", [
          ex("Overhead press (barbell)", 5, "5", 150),
          ex("Pull up", 4, "6"),
          ex("Triceps pushdown", 3, "10", 60),
        ]),
      ],
    };
  return {
    name: "Beginner full body · 3 days",
    weeks: 6,
    days: [
      day("Full body A", [
        ex("Goblet squat", 3, "10"),
        ex("Push up", 3, "8–12"),
        ex("Dumbbell row", 3, "10 each"),
        ex("Plank", 3, "30 s", 60),
      ]),
      day("Full body B", [
        ex("Romanian deadlift (barbell)", 3, "10"),
        ex("Shoulder press (dumbbell)", 3, "10"),
        ex("Lat pulldown (cable)", 3, "10"),
        ex("Dead bug", 3, "8 each", 60),
      ]),
      day("Full body C", [
        ex("Leg press (machine)", 3, "12"),
        ex("Incline bench press (dumbbell)", 3, "10"),
        ex("Seated cable row - bar grip", 3, "12"),
        ex("Walking", 1, "15 min", 0),
      ]),
    ],
  };
}

export const emptyProgram = (): TrainingProgram => ({
  name: "",
  weeks: 8,
  days: [],
});

/** Mifflin–St Jeor with a light activity multiplier, then a goal adjustment (as athlete onboarding). */
export function suggestTargets(p: {
  sex: "female" | "male" | "unsaid";
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
}): Omit<NutritionPlan, "meals"> {
  const s = p.sex === "male" ? 5 : p.sex === "female" ? -161 : -78;
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s;
  let kcal = bmr * 1.45;
  if (p.goal.startsWith("Lose fat"))
    kcal -= Math.min(500, (p.weightKg * 0.005 * 7700) / 7);
  else if (p.goal.startsWith("Build muscle")) kcal += 250;
  else if (p.goal.startsWith("Get stronger")) kcal += 150;
  kcal = Math.max(p.sex === "male" ? 1500 : 1200, Math.round(kcal / 50) * 50);
  const protein = proteinTarget(
    p.weightKg,
    p.heightCm ?? 170,
    p.goal.startsWith("Lose fat") ? "lose_fat" : "other",
  ).grams;
  const fat = Math.round((kcal * 0.27) / 9 / 5) * 5;
  const carbs = Math.max(
    0,
    Math.round((kcal - protein * 4 - fat * 9) / 4 / 5) * 5,
  );
  return { kcal, protein, carbs, fat };
}

const it = (foodId: string, qty: number, unit: string): PlanItem => ({
  foodId,
  qty,
  unit,
});
/** A plan meal from exact foods; its text is built from them. */
export const mealOf = (
  name: string,
  time: string,
  items: PlanItem[],
): Meal => ({
  id: uid("m"),
  name,
  time,
  items,
  foods: describeItems(items),
});
export const describeItems = (items: PlanItem[]) =>
  items
    .map((i) => planItemText(i))
    .filter(Boolean)
    .join(", ");

/** An example Indian day for the diet the client named, with exact foods; the coach edits it freely. */
export function exampleDay(diet: string): Meal[] {
  const veg = diet.startsWith("Vegetarian") || diet.startsWith("Jain");
  const egg = diet.startsWith("Eggetarian");
  return [
    mealOf(
      "Breakfast",
      "8:00 am",
      egg
        ? [
            it("egg-bhurji", 1, "katori"),
            it("bread-brown", 2, "slice"),
            it("coffee-black", 1, "cup"),
          ]
        : [it("moong-chilla", 2, "piece"), it("curd", 1, "katori")],
    ),
    mealOf(
      "Lunch",
      "1:30 pm",
      veg || egg
        ? [
            it("phulka", 2, "piece"),
            it("paneer-bhurji", 100, "g"),
            it("dal-tadka", 1, "katori"),
            it("salad", 1, "katori"),
          ]
        : [
            it("rice", 1, "katori"),
            it("chicken-curry", 1, "katori"),
            it("dal-tadka", 1, "katori"),
            it("salad", 1, "katori"),
          ],
    ),
    mealOf("Snack", "5:30 pm", [
      it("roasted-chana", 30, "g"),
      it("banana", 1, "piece"),
      it("chai-plain", 1, "cup"),
    ]),
    mealOf(
      "Dinner",
      "8:30 pm",
      veg
        ? [
            it("phulka", 2, "piece"),
            it("rajma", 1, "katori"),
            it("mixed-veg", 1, "katori"),
            it("curd", 1, "katori"),
          ]
        : egg
          ? [
              it("phulka", 2, "piece"),
              it("egg-curry", 1, "katori"),
              it("mixed-veg", 1, "katori"),
            ]
          : [
              it("phulka", 2, "piece"),
              it("chicken-tikka", 150, "g"),
              it("mixed-veg", 1, "katori"),
            ],
    ),
  ];
}

export const defaultProtocol = (): RecoveryProtocol => ({
  sleepH: 7.5,
  bed: 22 * 60 + 30,
  wake: 6 * 60,
  restDays: [2, 6],
  note: "",
});

export const clock = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Which program day falls on each weekday: rest days skipped, training days cycled in order. */
export function weekSchedule(program: TrainingProgram, restDays: number[]) {
  let k = 0;
  return WEEKDAYS.map((label, d) => {
    if (restDays.includes(d) || program.days.length === 0)
      return { label, day: null };
    const day = program.days[k % program.days.length];
    k++;
    return { label, day };
  });
}

/** Monday = 0 … Sunday = 6. */
export const todayIndex = () => (new Date().getDay() + 6) % 7;

// ---------- Templates (K-05, K-06): reusable programs and meal plans ----------

/** A fresh copy with new ids, so a client's plan never shares rows with the template (D56). */
export const cloneProgram = (p: TrainingProgram): TrainingProgram => ({
  ...p,
  days: p.days.map((d) => ({
    ...d,
    id: uid("d"),
    exercises: d.exercises.map((e) => ({
      ...e,
      id: uid("e"),
      rpe: e.rpe ? [e.rpe[0], e.rpe[1]] : undefined,
      block: e.block ? { ...e.block } : undefined,
    })),
  })),
});

export const cloneNutrition = (n: NutritionPlan): NutritionPlan => ({
  ...n,
  meals: n.meals.map((m) => ({
    ...m,
    id: uid("m"),
    items: m.items?.map((i) => ({ ...i })),
  })),
});

/** Carbs and fat for a calorie and protein target: fat at 25% of calories, carbs the rest. */
export function targetsFor(kcal: number, protein: number) {
  const fat = Math.round((kcal * 0.25) / 9 / 5) * 5;
  const carbs = Math.max(
    0,
    Math.round((kcal - protein * 4 - fat * 9) / 4 / 5) * 5,
  );
  return { kcal, protein, carbs, fat };
}

/** One line for a template row, e.g. "4 workouts · 8 weeks". */
export const programDetail = (p: TrainingProgram) =>
  `${p.days.length} ${p.days.length === 1 ? "workout" : "workouts"} · ${p.weeks} ${p.weeks === 1 ? "week" : "weeks"}`;

export const mealsDetail = (n: NutritionPlan) =>
  `${n.meals.length} ${n.meals.length === 1 ? "meal" : "meals"} · ${n.kcal.toLocaleString("en-IN")} kcal · ${n.protein} g protein`;

/** Sample templates arrive as names only; give each its program or meal plan. */
export function fillTemplate<
  T extends {
    kind: "training" | "meals";
    name: string;
    detail: string;
    program?: TrainingProgram;
    nutrition?: NutritionPlan;
  },
>(t: T): T {
  if (t.kind === "training") {
    const program = t.program ?? {
      ...programFromTemplate(t.name),
      name: t.name,
    };
    return { ...t, program, detail: programDetail(program) };
  }
  if (t.nutrition) return { ...t, detail: mealsDetail(t.nutrition) };
  const kcal =
    Number(/([\d,]+) kcal/.exec(t.name)?.[1]?.replace(",", "")) || 2000;
  const protein = Number(/(\d+) g protein/.exec(t.detail)?.[1]) || 120;
  const diet = t.name.startsWith("Vegetarian")
    ? "Vegetarian"
    : t.name.startsWith("Non-veg")
      ? "Non-vegetarian"
      : "Eggetarian";
  const nutrition = { ...targetsFor(kcal, protein), meals: exampleDay(diet) };
  return { ...t, nutrition, detail: mealsDetail(nutrition) };
}

// ---------- Effort and endurance blocks (K-07, D76, D79) ----------

/** RPE ranges a coach can pick for an exercise. */
export const RPE_RANGES: RpeRange[] = [
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
];

/** The rules range an exercise gets when the coach hasn't set one (D69). */
export const defaultRpe = (name: string, experience = "some"): RpeRange =>
  rpeTargetFor(experience, isCompound(name));

export const rpeText = (r: RpeRange) =>
  r[0] === r[1] ? `RPE ${r[0]}` : `RPE ${r[0]}–${r[1]}`;

/** Machines for run and erg intervals; all are distance-and-time exercises in the library. */
export const INTERVAL_EXERCISES = [
  "Running",
  "Treadmill",
  "Rowing machine",
  "Ski erg",
  "Air bike",
] as const;

/** What a pace is measured per: km on foot, 500 m on rowers and ski ergs, none on bikes. */
export const paceUnit = (name: string) =>
  /row|ski/i.test(name)
    ? "/500 m"
    : /bike|cycl|spin/i.test(name)
      ? null
      : "/km";

/** "m:ss" with 1–2 digit minutes; empty means no pace. */
export const validPace = (pace: string) =>
  /^\d{1,2}:[0-5]\d$/.test(pace.trim());

export const distanceText = (m: number) =>
  m >= 1000 ? `${Math.round(m / 10) / 100} km` : `${m} m`;
/** Whole minutes as "3 min", anything else in seconds, so the logger can read it back. */
const durationText = (s: number) => (s % 60 === 0 ? `${s / 60} min` : `${s} s`);

/** The plan target the logger reads: metres, a time or a rep count. */
export function blockReps(b: PlannedBlock) {
  if (b.kind === "station")
    return b.unit === "m" ? `${b.amount} m` : String(b.amount);
  return b.measure === "distance" ? `${b.amount} m` : durationText(b.amount);
}

/** A planned exercise with its block changed; keeps `reps` and the name in step with it. */
export function withBlock(
  e: PlannedExercise,
  block: PlannedBlock,
): PlannedExercise {
  return {
    ...e,
    block,
    reps: blockReps(block),
    name: block.kind === "station" ? stationOf(block.station).exercise : e.name,
  };
}

/** Run or erg intervals, e.g. 6 × 400 m on foot or 4 × 500 m on the rower. */
export function newInterval(name: string): PlannedExercise {
  const erg = paceUnit(name) === "/500 m";
  const bike = paceUnit(name) === null;
  const block: PlannedBlock = bike
    ? { kind: "interval", measure: "time", amount: 60 }
    : { kind: "interval", measure: "distance", amount: erg ? 500 : 400 };
  return withBlock(
    { id: uid("e"), name, sets: bike ? 8 : erg ? 4 : 6, reps: "", restSec: 90 },
    block,
  );
}

/** One HYROX station at race distance or reps (race/data.ts). */
export function newStation(key: StationKey): PlannedExercise {
  const s = stationOf(key);
  const block: PlannedBlock = s.reps
    ? { kind: "station", station: key, amount: s.reps, unit: "reps" }
    : { kind: "station", station: key, amount: s.metres ?? 50, unit: "m" };
  return withBlock(
    { id: uid("e"), name: s.exercise, sets: 1, reps: "", restSec: 60 },
    block,
  );
}

/**
 * One line for a planned exercise: "3 × 8–10 · RPE 7–8", "6 × 400 m · 1:45 /km · RPE 8",
 * "Sled push · 50 m". Rest is left to the screen.
 */
export function planLine(e: PlannedExercise) {
  const b = e.block;
  const what =
    b?.kind === "interval" && b.measure === "distance"
      ? distanceText(b.amount)
      : b?.kind === "station" && b.unit === "m"
        ? distanceText(b.amount)
        : b?.kind === "station"
          ? `${b.amount} reps`
          : e.reps;
  const unit = paceUnit(e.name);
  return [
    e.sets > 1 ? `${e.sets} × ${what}` : what,
    b?.kind === "interval" && b.pace && unit ? `${b.pace} ${unit}` : null,
    e.rpe ? rpeText(e.rpe) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
