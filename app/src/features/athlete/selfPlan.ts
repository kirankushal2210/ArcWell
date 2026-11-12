// Turns a self-guided athlete's onboarding answers into their own training program, nutrition plan
// and recovery protocol (D57), in the same shape coaches use, so the athlete tabs show either the
// same way. Rules only (onboarding plan.ts and workouts.ts); nothing here is AI.
import {
  exampleDay,
  type NutritionPlan,
  type RecoveryProtocol,
  type TrainingProgram,
  uid,
} from "@/features/coach/plans";
import type { Client } from "@/features/coach/sampleData";
import type { Answers } from "@/features/onboarding/OnboardingContext";
import { buildPlan } from "@/features/onboarding/plan";
import {
  balanceVolume,
  timesPerWeek,
  PROGRESSION,
  proteinTarget,
  restFor,
  rirFor,
  weeklyMin,
} from "@/features/science/rules";

const GOAL: Record<string, string> = {
  lose_fat: "Lose fat",
  build_muscle: "Build muscle",
  get_stronger: "Get stronger",
  recomposition: "Body recomposition",
  general_fitness: "General fitness",
};
const DIET: Record<string, string> = {
  veg: "Vegetarian",
  egg: "Eggetarian",
  nonveg: "Non-veg",
  vegan: "Vegan",
  jain: "Jain",
};

/** Training days spread across the week when the athlete didn't pick days (Mon = 0). */
const SPREAD: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type SelfPlan = {
  program: TrainingProgram;
  nutrition: NutritionPlan;
  protocol: RecoveryProtocol;
  /** For the ready screen. */
  summary: { training: string; equipment: string; goal: string; diet: string };
};

/** Rest days from the athlete's chosen days, or a sensible spread for their days per week. */
function restDaysFor(a: Answers) {
  const picked = ((a.preferredDays as number[] | undefined) ?? [])
    .slice()
    .sort();
  const days = Number(a.daysPerWeek ?? 4);
  const training = picked.length ? picked : (SPREAD[days] ?? SPREAD[4]);
  return [0, 1, 2, 3, 4, 5, 6].filter((d) => !training.includes(d));
}

export function selfPlan(a: Answers): SelfPlan {
  const p = buildPlan(a);
  const goalKey = (a.goal as string | undefined) ?? "general_fitness";
  const goal = GOAL[goalKey] ?? "General fitness";
  const diet = DIET[(a.diet as string | undefined) ?? "veg"] ?? "Vegetarian";
  const weight = typeof a.weightKg === "number" ? a.weightKg : 74.5;

  const program: TrainingProgram = {
    name: `${goal} · ${p.daysPerWeek} days`,
    weeks: 8,
    days: p.workouts.map((w) => ({
      id: uid("d"),
      name: w.name,
      exercises: w.exercises.map((e) => ({
        id: uid("e"),
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSec: restFor(e.name),
      })),
    })),
  };
  // Evidence pass (D69): weekly sets per muscle into range, effort and rest by the rules.
  const experience = (a.experience as string | undefined) ?? "some";
  program.days = balanceVolume(program.days, {
    min: weeklyMin(goalKey, experience),
    minutes: parseInt(String(a.sessionLength ?? "45"), 10),
    timesPerWeek: timesPerWeek(program.days.length, restDaysFor(a)),
  }).map((d) => ({
    ...d,
    note: `Leave ${rirFor(experience, true)} reps in reserve on big lifts and ${rirFor(experience, false)} on the rest. ${PROGRESSION}`,
  }));

  const protein = proteinTarget(
    weight,
    typeof a.heightCm === "number" ? a.heightCm : 172,
    goalKey,
  ).grams;
  const fat = Math.round((p.kcal * 0.27) / 9 / 5) * 5;
  const carbs = Math.max(
    0,
    Math.round((p.kcal - protein * 4 - fat * 9) / 4 / 5) * 5,
  );
  const meals = Number(a.mealsPerDay ?? 3);
  const day = exampleDay(diet);
  const nutrition: NutritionPlan = {
    kcal: p.kcal,
    protein,
    carbs,
    fat,
    meals: meals <= 3 ? day.filter((m) => m.name !== "Snack") : day,
  };

  const protocol: RecoveryProtocol = {
    sleepH: p.sleepTargetHours,
    bed: typeof a.bedTime === "number" ? a.bedTime : 22 * 60 + 30,
    wake: typeof a.wakeTime === "number" ? a.wakeTime : 6 * 60 + 30,
    restDays: restDaysFor(a),
    note: "",
  };

  return {
    program,
    nutrition,
    protocol,
    summary: {
      training: `${p.daysPerWeek} days a week · ${p.minutes} min · ${p.workoutNames.slice(0, 3).join(" / ")}`,
      equipment: p.equipment,
      goal,
      diet,
    },
  };
}

/** The athlete's own record, in the shape the athlete tabs read. */
export function selfClient(a: Answers, plan: SelfPlan): Client {
  const weight = typeof a.weightKg === "number" ? a.weightKg : 74.5;
  const target = typeof a.goalWeightKg === "number" ? a.goalWeightKg : weight;
  return {
    id: "me",
    name: "You",
    status: "active",
    joined: "today",
    weeksWithYou: 0,
    goal: plan.summary.goal,
    line: "",
    adherence: null,
    checkInDay: "Sunday",
    answers: [],
    weights: [weight],
    targetKg: target,
    training: {
      weekDone: 0,
      weekPlanned: 7 - plan.protocol.restDays.length,
      logs: [],
    },
    nutrition: {
      targetKcal: plan.nutrition.kcal,
      proteinG: plan.nutrition.protein,
      days: [],
    },
    // Recovery baseline from the onboarding answers: the score until a check-in or a device (D60).
    recovery: {
      sleepTargetH: plan.protocol.sleepH,
      nights: [],
      quality:
        { great: 5, okay: 3, poor: 2, very_poor: 1 }[
          String(a.sleepQuality ?? "okay")
        ] ?? 3,
      stress: Number(a.stress ?? 3),
      energy: Number(a.energy ?? 3),
      soreness:
        { Rarely: 1, Sometimes: 3, Often: 4 }[
          ((a.soreness as string[] | undefined) ?? [])[0] ?? "Sometimes"
        ] ?? 3,
    },
    measurements: [{ label: "Weight", start: weight, now: weight, unit: "kg" }],
    photoWeeks: [],
    checkIns: [],
    messages: [],
    unread: 0,
    notes: "",
    program: plan.program,
    nutritionPlan: plan.nutrition,
    protocol: plan.protocol,
    programStart: new Date().toISOString(),
    profile: {
      equipment: a.equipment as string | undefined,
      homeKit: a.homeKit as string[] | undefined,
      injuries: a.injuries as string[] | undefined,
      device: a.device as string | undefined,
    },
  };
}

/**
 * Someone who joined through a coach's general link (not a personal invite): they answered the
 * standard onboarding, and arrive in the coach's "Needs a plan" list with those answers (CO-14, AO-21b).
 */
export function newClientFromAnswers(a: Answers): Client {
  const plan = selfPlan(a);
  const weight = typeof a.weightKg === "number" ? a.weightKg : 74.5;
  const target = typeof a.goalWeightKg === "number" ? a.goalWeightKg : weight;
  const age = typeof a.age === "number" ? a.age : undefined;
  const height = typeof a.heightCm === "number" ? a.heightCm : undefined;
  const sex = a.sex === "male" || a.sex === "female" ? a.sex : undefined;
  const injuries = ((a.injuries as string[] | undefined) ?? []).filter(
    (x) => x !== "None",
  );
  return {
    id: `c${Date.now().toString(36)}`,
    name: "New athlete",
    status: "active",
    isNew: true,
    joined: "just now",
    weeksWithYou: 0,
    goal: plan.summary.goal,
    line: "Joined with your link",
    adherence: null,
    checkInDay: "Sunday",
    answers: [
      ["Goal", plan.summary.goal],
      [
        "Body",
        [age, height ? `${height} cm` : null, `${weight} kg`, sex]
          .filter(Boolean)
          .join(" · "),
      ],
      ["Training", `${plan.summary.equipment} · ${plan.summary.training}`],
      ["Injuries", injuries.length ? injuries.join(", ") : "None"],
      ["Sleep", `${plan.protocol.sleepH} h target`],
      ["Diet", `${plan.summary.diet} · ${plan.nutrition.meals.length} meals`],
    ],
    weights: [weight],
    targetKg: target,
    training: { weekDone: 0, weekPlanned: 0, logs: [] },
    nutrition: { targetKcal: 0, proteinG: 0, days: [] },
    // Recovery baseline from the onboarding answers: the score until a check-in or a device (D60).
    recovery: {
      sleepTargetH: plan.protocol.sleepH,
      nights: [],
      quality:
        { great: 5, okay: 3, poor: 2, very_poor: 1 }[
          String(a.sleepQuality ?? "okay")
        ] ?? 3,
      stress: Number(a.stress ?? 3),
      energy: Number(a.energy ?? 3),
      soreness:
        { Rarely: 1, Sometimes: 3, Often: 4 }[
          ((a.soreness as string[] | undefined) ?? [])[0] ?? "Sometimes"
        ] ?? 3,
    },
    measurements: [{ label: "Weight", start: weight, now: weight, unit: "kg" }],
    photoWeeks: [],
    checkIns: [],
    messages: [],
    unread: 1,
    notes: "",
    profile: {
      equipment: a.equipment as string | undefined,
      homeKit: a.homeKit as string[] | undefined,
      injuries: a.injuries as string[] | undefined,
      device: a.device as string | undefined,
    },
  };
}
