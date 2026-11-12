// Arcwell programs (TR-04): multi-week plans built by the same evidence rules as onboarding (D69),
// fitted to the athlete's equipment, injuries and session length. Pro only (D13); free athletes see
// them locked (TR-05). Coached athletes follow their coach's program instead.
import type { Answers } from "@/features/onboarding/OnboardingContext";

import { selfPlan } from "./selfPlan";

export type ProgramPreset = {
  key: string;
  name: string;
  who: string;
  answers: Answers;
};

export const PRESETS: ProgramPreset[] = [
  {
    key: "full-body-3",
    name: "Full body · 3 days",
    who: "Every muscle three times a week. The best start for most people, and plenty for busy weeks.",
    answers: { daysPerWeek: 3, goal: "build_muscle", sessionLength: "60" },
  },
  {
    key: "upper-lower-4",
    name: "Upper, lower, full · 4 days",
    who: "Upper, lower and full-body days on rotation: each muscle about twice a week with more sets. A step up once full body feels easy.",
    answers: { daysPerWeek: 4, goal: "build_muscle", sessionLength: "60" },
  },
  {
    key: "split-5",
    name: "Five-day split",
    who: "More weekly sets for experienced lifters with the time to recover from them.",
    answers: {
      daysPerWeek: 5,
      goal: "build_muscle",
      sessionLength: "60",
      experience: "experienced",
    },
  },
  {
    key: "strength-4",
    name: "Strength · 4 days",
    who: "Heavier sets of 3 to 6 on the big lifts, with longer rests. For getting stronger.",
    answers: { daysPerWeek: 4, goal: "get_stronger", sessionLength: "60" },
  },
  {
    key: "fat-loss-3",
    name: "Fat loss · 3 days",
    who: "Keeps the muscle you have while you diet, in 45 minutes a session.",
    answers: { daysPerWeek: 3, goal: "lose_fat", sessionLength: "45" },
  },
];

type Me = {
  basics?: {
    weightKg: number;
    heightCm: number;
    injuries: string;
    diet: string;
  };
  profile?: { equipment?: string; homeKit?: string[]; injuries?: string[] };
};

/** Profile equipment may be an onboarding code ("gym") or an edited label ("Gym"). */
export const equipmentCode = (v?: string) =>
  !v || /^gym$/i.test(v)
    ? "gym"
    : /^home/i.test(v)
      ? "home"
      : /none|no equipment|bodyweight/i.test(v)
        ? "none"
        : "gym";

/** Answers from the athlete's own profile, so programs fit their kit and injuries. */
const base = (me: Me): Answers => ({
  equipment: equipmentCode(me.profile?.equipment),
  homeKit: me.profile?.homeKit,
  injuries: me.profile?.injuries,
  weightKg: me.basics?.weightKg,
  heightCm: me.basics?.heightCm,
  experience: "some",
});

export function buildProgram(preset: ProgramPreset, me: Me) {
  const plan = selfPlan({ ...base(me), ...preset.answers });
  return {
    program: { ...plan.program, name: preset.name },
    restDays: plan.protocol.restDays,
  };
}
