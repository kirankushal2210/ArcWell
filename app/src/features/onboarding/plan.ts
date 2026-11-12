// Builds the starter plan shown at the end of onboarding (AO-18 to AO-21) from the answers.
// Free accounts get calories only (D5): no protein, carb or fat targets here.
// This runs on the device for now; when sign-up exists the server computes and stores the plan.
import type { Answers } from "./OnboardingContext";
import { buildWorkouts, type Workout } from "./workouts";

const ACTIVITY: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};
const KCAL_PER_KG = 7700;
const DIET: Record<string, string> = {
  veg: "vegetarian",
  egg: "eggetarian",
  nonveg: "non-vegetarian",
  vegan: "vegan",
  jain: "Jain",
};
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REMINDER_TIME: Record<string, string> = {
  morning: "6:00 am",
  afternoon: "12:30 pm",
  evening: "6:00 pm",
};

export type Plan = {
  kcal: number;
  /** Expected change per week in kg (negative = losing). */
  weeklyKg: number;
  goalWeightKg?: number;
  daysPerWeek: number;
  minutes: number;
  sleepTargetHours: number;
  workoutNames: string[];
  workouts: Workout[];
  equipment: string;
  diet: string;
  reminders: string;
  firstWorkout: { name: string; minutes: number; exercises: number };
};

const num = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

export function buildPlan(a: Answers): Plan {
  const weight = num(a.weightKg, 74.5);
  const height = num(a.heightCm, 172);
  const age = num(a.age, 27);
  const sex = (a.sex as string | undefined) ?? "unspecified";

  // Mifflin–St Jeor; "Prefer not to say" uses the average of the two constants (D44).
  const sexConstant = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexConstant;
  const tdee = bmr * (ACTIVITY[(a.activity as string) ?? "moderate"] ?? 1.55);

  // Fat loss is capped at about 0.5% of body weight a week; gains stay small.
  const goal = (a.goal as string | undefined) ?? "general_fitness";
  const maxDeficit = (0.005 * weight * KCAL_PER_KG) / 7;
  const adjustment =
    goal === "lose_fat"
      ? -Math.min(500, maxDeficit)
      : goal === "build_muscle"
        ? 250
        : goal === "get_stronger"
          ? 150
          : goal === "recomposition"
            ? -200
            : 0;
  const floor = sex === "male" ? 1500 : sex === "female" ? 1200 : 1350;
  const kcal = Math.max(floor, Math.round((tdee + adjustment) / 10) * 10);
  const weeklyKg = ((kcal - tdee) * 7) / KCAL_PER_KG;

  const daysPerWeek = Number(a.daysPerWeek ?? 4);
  const minutes = parseInt(String(a.sessionLength ?? "45"), 10);
  const workouts = buildWorkouts(a);
  const workoutNames = workouts.map((w) => w.name);

  const kit = (a.homeKit as string[] | undefined) ?? [];
  const equipment =
    a.equipment === "home"
      ? kit.length
        ? kit.map((k) => k.toLowerCase()).join(", ")
        : "home"
      : a.equipment === "none"
        ? "bodyweight"
        : "gym";

  const preferred = ((a.preferredDays as number[] | undefined) ?? [])
    .slice()
    .sort();
  const when =
    REMINDER_TIME[(a.trainingTime as string) ?? "morning"] ??
    REMINDER_TIME.morning;
  const reminders = preferred.length
    ? `${preferred.map((d) => DAY_NAMES[d]).join(", ")} at ${when}`
    : `On your ${daysPerWeek} training days at ${when}`;

  const sleep = typeof a.sleepHours === "number" ? a.sleepHours : 7;
  const sleepTargetHours = Math.min(
    9,
    Math.max(7, Math.round((sleep + 0.5) * 2) / 2),
  );

  return {
    kcal,
    weeklyKg,
    goalWeightKg:
      typeof a.goalWeightKg === "number" ? a.goalWeightKg : undefined,
    daysPerWeek,
    minutes,
    sleepTargetHours,
    workoutNames,
    workouts,
    equipment,
    diet: DIET[(a.diet as string) ?? "veg"] ?? "vegetarian",
    reminders,
    firstWorkout: {
      name: workouts[0].name,
      minutes,
      exercises: workouts[0].exercises.length,
    },
  };
}

export const formatKcal = (kcal: number) => kcal.toLocaleString("en-IN");
export const formatWeekly = (kg: number) =>
  Math.abs(kg) < 0.05
    ? "Steady"
    : `${kg < 0 ? "−" : "+"}${Math.abs(kg).toFixed(1)} kg`;
