// Athlete onboarding questions (SPEC.md, D52): one question per screen in five sections.
// Screens follow the hi-fi mockups AO-01 to AO-17 (docs/design/hifi-mockups/onboarding-flow.html).
import {
  Activity,
  Armchair,
  Bandage,
  Bed,
  BicepsFlexed,
  Bike,
  Building2,
  Cake,
  CalendarDays,
  CircleDashed,
  CloudMoon,
  Drumstick,
  Dumbbell,
  Egg,
  FaceNeutral,
  FaceSlightlyFrowning,
  FaceSlightlySmiling,
  Flag,
  Flame,
  Flower2,
  Footprints,
  HardHat,
  Heart,
  House,
  Leaf,
  type LucideIcon,
  MapPin,
  Mars,
  Medal,
  Moon,
  MoonStar,
  PersonStanding,
  RefreshCw,
  Ruler,
  Salad,
  Scale,
  Sprout,
  Sun,
  Sunrise,
  Target,
  Timer,
  Trophy,
  UserRound,
  Utensils,
  Venus,
  Watch,
} from "lucide-react-native";

import type { ColorRole } from "@/theme";

export type SectionId = "you" | "goal" | "training" | "recovery" | "nutrition";

/** Sections on the progress bar, in order, with their pillar dot (dots only, D50). */
export const sections: Section[] = [
  { id: "you", name: "About you" },
  { id: "goal", name: "Your goal" },
  { id: "training", name: "Training", dot: "training" },
  { id: "recovery", name: "Recovery", dot: "recovery" },
  { id: "nutrition", name: "Nutrition", dot: "nutrition" },
];

export type Option = {
  value: string;
  label: string;
  sub?: string;
  icon?: LucideIcon;
  disabled?: boolean;
};
export type WheelValue = { label: string; value: number };

export type Field =
  | { kind: "single"; key: string; options: Option[]; required?: boolean }
  | {
      kind: "wheel";
      key: string;
      initial: number;
      values: WheelValue[];
      /** Alternative unit shown by the segmented control (height: ft / in). */
      alt?: { label: string; values: WheelValue[] };
      unit: string;
      /** Disabled second segment, e.g. "lb · later" (D45: kg only in v1). */
      laterUnit?: string;
      /** Show "x kg to go" against another answer (goal weight against current weight). */
      deltaFrom?: string;
      rows?: number;
    }
  | {
      kind: "timePair";
      keys: [string, string];
      labels: [string, string];
      initial: [number, number];
    }
  | {
      kind: "scale";
      key: string;
      label?: string;
      options: string[];
      initial: string;
      ends?: [string, string];
    }
  | {
      kind: "chips";
      key: string;
      label?: string;
      options: string[];
      initial?: string[];
      exclusive?: string;
      showIf?: { key: string; equals: string };
      /** Most that can be picked at once (coach specialisations: 3). */
      max?: number;
      required?: boolean;
    }
  | { kind: "days"; key: string; label: string; initial: string[] }
  | {
      kind: "text";
      key: string;
      label: string;
      placeholder: string;
      multiline?: boolean;
      maxLength?: number;
      required?: boolean;
      keyboard?: "default" | "number-pad";
      hint?: string;
    }
  | { kind: "note"; text: string }
  | { kind: "label"; text: string }
  | { kind: "mealPreview"; from: string }
  | {
      kind: "features";
      items: { icon: LucideIcon; title: string; sub: string }[];
    }
  | { kind: "agree"; key: string; label: string }
  | { kind: "photo"; key: string }
  | { kind: "services"; key: string }
  /** Coach's existing Excel, Google Sheets or CSV workout file (D55). */
  | { kind: "sheet"; key: string; showIf: { key: string; equals: string } }
  | { kind: "invite"; nameKey: string }
  /** Body fat level from drawn torsos (D84); bands follow the answer under `sexKey`. */
  | { kind: "bodyFat"; key: string; sexKey: string };

export type Question = {
  id: string;
  section: string;
  glyph: LucideIcon;
  title: string;
  sub?: string;
  fields: Field[];
  /** Shows "Skip" top right; skipping keeps whatever default the screen had. */
  skippable?: boolean;
  next?: string;
  /** Screens outside the numbered sections (coach intro, agreement, invite) hide the progress bar. */
  hideProgress?: boolean;
  /** Show the Arcwell mark instead of a glyph (coach "what you get"). */
  logoHeader?: boolean;
  /** Small line under the main button, e.g. "Takes about 5 minutes". */
  caption?: string;
  /** Only shown when earlier answers match (the HYROX branch, D76); all conditions must hold. */
  showIf?: Cond | Cond[];
};

/** equals: the answer is this; in: one of these; not: anything but this (unanswered counts). */
export type Cond = { key: string; equals?: string; in?: string[]; not?: string };

const holds = (c: Cond, answers: Record<string, unknown>) => {
  const v = answers[c.key];
  if (c.equals !== undefined) return v === c.equals;
  if (c.in) return typeof v === "string" && c.in.includes(v);
  if (c.not !== undefined) return v !== c.not;
  return true;
};

/** Whether a question applies, given the answers so far. */
export const questionShown = (q: Question, answers: Record<string, unknown>) =>
  !q.showIf ||
  (Array.isArray(q.showIf) ? q.showIf : [q.showIf]).every((c) => holds(c, answers));

export type Section = { id: string; name: string; dot?: ColorRole };
export type Flow = { sections: Section[]; questions: Question[] };

const range = (
  from: number,
  to: number,
  step: number,
  label: (v: number) => string,
): WheelValue[] => {
  const out: WheelValue[] = [];
  for (let k = 0; k <= Math.round((to - from) / step); k++) {
    const v = +(from + k * step).toFixed(2);
    out.push({ label: label(v), value: v });
  }
  return out;
};

const cm = range(120, 220, 1, (v) => String(v));
const feetInches = range(
  48,
  86,
  1,
  (inches) => `${Math.floor(inches / 12)}′ ${inches % 12}″`,
).map((w) => ({
  label: w.label,
  value: Math.round(w.value * 2.54),
}));
const kg = range(30, 200, 0.1, (v) => v.toFixed(1));
export const questions: Question[] = [
  // ---------- About you ----------
  {
    id: "AO-01",
    section: "you",
    glyph: UserRound,
    title: "Let's get to know you better",
    sub: "This helps us personalise your plan and targets.",
    skippable: true,
    fields: [
      {
        kind: "single",
        key: "sex",
        required: true,
        options: [
          { value: "male", label: "Male", icon: Mars },
          { value: "female", label: "Female", icon: Venus },
          {
            value: "unspecified",
            label: "Prefer not to say",
            icon: CircleDashed,
          },
        ],
      },
    ],
  },
  {
    id: "AO-02",
    section: "you",
    glyph: Cake,
    title: "How old are you?",
    sub: "Your age changes how many calories you burn.",
    fields: [
      {
        kind: "wheel",
        key: "age",
        initial: 27,
        unit: "years",
        values: range(13, 80, 1, (v) => String(v)),
      },
    ],
  },
  {
    id: "AO-03",
    section: "you",
    glyph: Ruler,
    title: "What's your height?",
    sub: "We use this to calculate your calorie needs.",
    fields: [
      {
        kind: "wheel",
        key: "heightCm",
        initial: 172,
        unit: "cm",
        values: cm,
        alt: { label: "ft / in", values: feetInches },
      },
    ],
  },
  {
    id: "AO-04",
    section: "you",
    glyph: Scale,
    title: "What's your current weight?",
    sub: "This is your starting point.",
    fields: [
      {
        kind: "wheel",
        key: "weightKg",
        initial: 74.5,
        unit: "kg",
        laterUnit: "lb · later",
        values: kg,
      },
    ],
  },
  {
    id: "AO-04b",
    section: "you",
    glyph: Scale,
    title: "What's your body fat level?",
    sub: "Pick the closest look. It doesn't need to be exact.",
    skippable: true,
    fields: [{ kind: "bodyFat", key: "bodyFatPct", sexKey: "sex" }],
  },
  // ---------- Your goal ----------
  {
    id: "AO-05",
    section: "goal",
    glyph: Target,
    title: "What's your main goal?",
    sub: "We'll build your plan around this.",
    fields: [
      {
        kind: "single",
        key: "goal",
        required: true,
        options: [
          {
            value: "lose_fat",
            label: "Lose fat",
            sub: "Get leaner, keep your muscle",
            icon: Flame,
          },
          {
            value: "build_muscle",
            label: "Build muscle",
            sub: "Gain size with a small surplus",
            icon: BicepsFlexed,
          },
          {
            value: "get_stronger",
            label: "Get stronger",
            sub: "Lift more on the big lifts",
            icon: Dumbbell,
          },
          {
            value: "recomposition",
            label: "Body recomposition",
            sub: "Lose fat and build muscle slowly",
            icon: RefreshCw,
          },
          {
            value: "general_fitness",
            label: "General fitness",
            sub: "Feel fitter and healthier",
            icon: Heart,
          },
          {
            value: "hyrox",
            label: "Train for a HYROX race",
            sub: "We'll plan back from your race date",
            icon: Medal,
          },
        ],
      },
    ],
  },
  // ---------- HYROX branch (D76): only after choosing the race goal, then by race experience ----------
  {
    id: "HX-01",
    section: "goal",
    glyph: Medal,
    title: "Have you raced HYROX before?",
    sub: "Your questions and your plan follow your answer.",
    showIf: { key: "goal", equals: "hyrox" },
    fields: [
      {
        kind: "single",
        key: "raceLevel",
        required: true,
        options: [
          {
            value: "first",
            label: "This will be my first race",
            sub: "We'll build your engine and teach every station",
          },
          {
            value: "returning",
            label: "I've raced before",
            sub: "We'll work on where you lost time",
          },
          {
            value: "advanced",
            label: "I race Pro, or chase podiums and qualifying",
            sub: "Pacing, compromised running and every second",
          },
        ],
      },
    ],
  },
  {
    id: "HX-02",
    section: "goal",
    glyph: CalendarDays,
    title: "How far away is your next race?",
    sub: "We count your plan back from race day.",
    showIf: { key: "goal", equals: "hyrox" },
    fields: [
      {
        kind: "wheel",
        key: "raceWeeks",
        initial: 12,
        unit: "weeks",
        values: range(4, 40, 1, (v) => String(v)),
      },
    ],
  },
  {
    id: "HX-03",
    section: "goal",
    glyph: Trophy,
    title: "Your division and kit",
    sub: "Station weights follow your division. Doubles and Mixed race at Open weights.",
    showIf: { key: "goal", equals: "hyrox" },
    fields: [
      {
        kind: "single",
        key: "raceDivision",
        required: true,
        options: [
          { value: "open_women", label: "Women Open" },
          { value: "pro_women", label: "Women Pro" },
          { value: "open_men", label: "Men Open" },
          { value: "pro_men", label: "Men Pro" },
        ],
      },
      {
        kind: "chips",
        key: "raceKit",
        label: "What can you use where you train?",
        options: ["Sled", "SkiErg", "Rower", "Wall-ball target", "Sandbag"],
      },
    ],
  },
  {
    id: "HX-04",
    section: "goal",
    glyph: Footprints,
    title: "How much do you run now?",
    sub: "Half the race is running, so this sets where your running starts.",
    showIf: { key: "goal", equals: "hyrox" },
    fields: [
      {
        kind: "single",
        key: "weeklyKm",
        required: true,
        options: [
          { value: "0", label: "I'm not running yet" },
          { value: "5", label: "Under 10 km a week" },
          { value: "15", label: "10 to 20 km a week" },
          { value: "28", label: "20 to 35 km a week" },
          { value: "40", label: "More than 35 km a week" },
        ],
      },
    ],
  },
  {
    id: "HX-05",
    section: "goal",
    glyph: Timer,
    title: "Your recent 5 km time",
    sub: "A rough guess is fine. It sets your running paces.",
    skippable: true,
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "weeklyKm", not: "0" }],
    fields: [
      {
        kind: "wheel",
        key: "recent5k",
        initial: 30,
        unit: "min",
        values: range(15, 60, 1, (v) => String(v)),
      },
    ],
  },
  // First race
  {
    id: "HX-F1",
    section: "goal",
    glyph: Dumbbell,
    title: "Which stations have you tried?",
    sub: "We'll teach the new ones early, at light weights.",
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "raceLevel", equals: "first" }],
    fields: [
      {
        kind: "chips",
        key: "stationsTried",
        options: [
          "None yet",
          "SkiErg",
          "Sled push",
          "Sled pull",
          "Burpee broad jumps",
          "Row",
          "Farmers carry",
          "Sandbag lunges",
          "Wall balls",
        ],
        exclusive: "None yet",
      },
    ],
  },
  {
    id: "HX-F2",
    section: "goal",
    glyph: Flag,
    title: "What's your aim for this race?",
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "raceLevel", equals: "first" }],
    fields: [
      {
        kind: "single",
        key: "raceAim",
        required: true,
        options: [
          { value: "finish", label: "Finish strong and enjoy it" },
          { value: "nowalk", label: "Run every kilometre without walking" },
          { value: "time", label: "Hit a target time" },
        ],
      },
    ],
  },
  // Raced before (and advanced)
  {
    id: "HX-P1",
    section: "goal",
    glyph: Timer,
    title: "Your best HYROX finish time",
    sub: "From your results page, roughly.",
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "raceLevel", in: ["returning", "advanced"] }],
    fields: [
      {
        kind: "wheel",
        key: "prevMin",
        initial: 95,
        unit: "h:mm",
        values: range(50, 180, 1, (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`),
      },
    ],
  },
  {
    id: "HX-P2",
    section: "goal",
    glyph: Target,
    title: "Where did you lose the most time?",
    sub: "Pick up to three. Your plan works on these first.",
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "raceLevel", in: ["returning", "advanced"] }],
    fields: [
      {
        kind: "single",
        key: "prevDivision",
        options: [
          { value: "open", label: "That was Open" },
          { value: "pro", label: "That was Pro" },
          { value: "doubles", label: "Doubles or relay" },
        ],
      },
      {
        kind: "chips",
        key: "weakAreas",
        label: "Where it went slow",
        max: 3,
        options: [
          "Running",
          "Slowing down on later runs",
          "Roxzone transitions",
          "SkiErg",
          "Sled push",
          "Sled pull",
          "Burpee broad jumps",
          "Row",
          "Farmers carry",
          "Sandbag lunges",
          "Wall balls",
        ],
      },
    ],
  },
  {
    id: "HX-A1",
    section: "goal",
    glyph: Activity,
    title: "Your average run pace in that race",
    sub: "Per kilometre, across all 8 runs. Your results page shows it.",
    skippable: true,
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "raceLevel", equals: "advanced" }],
    fields: [
      {
        kind: "wheel",
        key: "racePaceSec",
        initial: 270,
        unit: "/km",
        values: range(195, 480, 5, (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`),
      },
    ],
  },
  {
    id: "HX-A2",
    section: "goal",
    glyph: Trophy,
    title: "What are you racing for this season?",
    showIf: [{ key: "goal", equals: "hyrox" }, { key: "raceLevel", equals: "advanced" }],
    fields: [
      {
        kind: "single",
        key: "seasonGoal",
        required: true,
        options: [
          { value: "pb", label: "A personal best" },
          { value: "podium", label: "An age-group podium" },
          { value: "worlds", label: "Qualifying for the World Championships" },
        ],
      },
    ],
  },
  {
    id: "HX-T1",
    section: "goal",
    glyph: Flag,
    title: "Your target time",
    sub: "Be honest but ambitious. Sims will show if it's on track.",
    showIf: [
      { key: "goal", equals: "hyrox" },
      { key: "raceAim", not: "finish" },
      { key: "raceAim", not: "nowalk" },
    ],
    fields: [
      {
        kind: "wheel",
        key: "targetMin",
        initial: 90,
        unit: "h:mm",
        values: range(50, 180, 1, (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`),
      },
    ],
  },
  {
    id: "AO-06",
    section: "goal",
    glyph: Flag,
    title: "What's your goal weight?",
    sub: "Where do you want to be?",
    skippable: true,
    showIf: { key: "goal", not: "hyrox" },
    fields: [
      {
        kind: "wheel",
        key: "goalWeightKg",
        initial: 70,
        unit: "kg",
        values: kg,
        deltaFrom: "weightKg",
      },
    ],
  },
  {
    id: "AO-07",
    section: "goal",
    glyph: Footprints,
    title: "How active are you during the day?",
    sub: "Outside your workouts.",
    fields: [
      {
        kind: "single",
        key: "activity",
        required: true,
        options: [
          {
            value: "sedentary",
            label: "Mostly sitting",
            sub: "Desk job, little walking",
            icon: Armchair,
          },
          {
            value: "light",
            label: "Lightly active",
            sub: "Some walking most days",
            icon: Footprints,
          },
          {
            value: "moderate",
            label: "Moderately active",
            sub: "On your feet most of the day",
            icon: PersonStanding,
          },
          {
            value: "very",
            label: "Very active",
            sub: "Physical job or lots of walking",
            icon: Bike,
          },
          {
            value: "extra",
            label: "Extra active",
            sub: "Hard physical work every day",
            icon: HardHat,
          },
        ],
      },
    ],
  },
  // ---------- What Arcwell shows (D78): one optional screen ----------
  {
    id: "AO-07B",
    section: "goal",
    glyph: Sprout,
    title: "Anything else you'd like help with?",
    sub: "Optional. Your plan is built around your main goal; add only what you want. You can change this any time.",
    fields: [
      {
        kind: "chips",
        key: "addons",
        options: [
          "Just my main goal",
          "Cardio fitness",
          "Running",
          "Daily steps",
          "Sleep and energy habits",
          "Calm and breathing",
          "Mobility",
          "Focus",
        ],
        initial: ["Just my main goal"],
        exclusive: "Just my main goal",
      },
      {
        kind: "note",
        text: "Cardio fitness is closely linked to long-term health. It doesn't have to mean running: a bike or rower works too.",
      },
    ],
  },
  // ---------- Training ----------
  {
    id: "AO-08",
    section: "training",
    glyph: Dumbbell,
    title: "What's your gym experience?",
    sub: "So your workouts start at the right level.",
    fields: [
      {
        kind: "single",
        key: "experience",
        required: true,
        options: [
          {
            value: "new",
            label: "New to the gym",
            sub: "Under 6 months, or coming back",
            icon: Sprout,
          },
          {
            value: "some",
            label: "Some experience",
            sub: "6 months to 2 years",
            icon: Dumbbell,
          },
          {
            value: "experienced",
            label: "Experienced",
            sub: "2 to 5 years, most lifts feel familiar",
            icon: Trophy,
          },
          {
            value: "very",
            label: "Very experienced",
            sub: "5+ years, you plan your own",
            icon: Medal,
          },
        ],
      },
    ],
  },
  {
    id: "AO-09",
    section: "training",
    glyph: MapPin,
    title: "Where do you train?",
    sub: "We'll only pick exercises you can do.",
    fields: [
      {
        kind: "single",
        key: "equipment",
        required: true,
        options: [
          {
            value: "gym",
            label: "Gym",
            sub: "Machines, barbells, dumbbells",
            icon: Building2,
          },
          { value: "home", label: "Home", sub: "Some equipment", icon: House },
          {
            value: "none",
            label: "No equipment",
            sub: "Bodyweight only",
            icon: PersonStanding,
          },
        ],
      },
      {
        kind: "chips",
        key: "homeKit",
        label: "What do you have at home?",
        options: [
          "Dumbbells",
          "Resistance bands",
          "Pull-up bar",
          "Bench",
          "Kettlebell",
        ],
        showIf: { key: "equipment", equals: "home" },
      },
    ],
  },
  {
    id: "AO-10",
    section: "training",
    glyph: CalendarDays,
    title: "How often can you train?",
    sub: "Be realistic: consistency beats ambition.",
    fields: [
      {
        kind: "scale",
        key: "daysPerWeek",
        label: "Days per week",
        options: ["2", "3", "4", "5", "6"],
        initial: "4",
      },
      {
        kind: "days",
        key: "preferredDays",
        label: "Which days suit you?",
        initial: [],
      },
    ],
  },
  {
    id: "AO-11",
    section: "training",
    glyph: Timer,
    title: "How long can you train?",
    sub: "Per session, warm-up included.",
    fields: [
      {
        kind: "scale",
        key: "sessionLength",
        options: ["30 min", "45 min", "60 min", "90 min"],
        initial: "45 min",
      },
      { kind: "label", text: "When do you usually train?" },
      {
        kind: "single",
        key: "trainingTime",
        required: true,
        options: [
          {
            value: "morning",
            label: "Morning",
            sub: "Before 10 am",
            icon: Sunrise,
          },
          {
            value: "afternoon",
            label: "Afternoon",
            sub: "10 am – 4 pm",
            icon: Sun,
          },
          { value: "evening", label: "Evening", sub: "After 4 pm", icon: Moon },
        ],
      },
    ],
  },
  {
    id: "AO-12",
    section: "training",
    glyph: Bandage,
    title: "Any injuries or limitations?",
    sub: "We'll avoid exercises that could hurt.",
    skippable: true,
    fields: [
      {
        kind: "chips",
        key: "injuries",
        options: [
          "None",
          "Lower back",
          "Knee",
          "Shoulder",
          "Wrist / elbow",
          "Neck",
          "Ankle",
          "Hip",
          "Other",
        ],
        exclusive: "None",
      },
      {
        kind: "text",
        key: "injuryNote",
        label: "Anything else? (optional)",
        placeholder: "e.g. slipped disc 2 years ago",
      },
      {
        kind: "note",
        text: "Arcwell isn't a medical service. For pain or a recent injury, check with a doctor or physiotherapist first.",
      },
    ],
  },
  // ---------- Recovery (all skippable; free accounts have no Recovery tab, D2b) ----------
  {
    id: "AO-13",
    section: "recovery",
    glyph: Bed,
    title: "How much do you sleep?",
    sub: "On a normal night.",
    skippable: true,
    fields: [
      {
        kind: "wheel",
        key: "sleepHours",
        initial: 7,
        unit: "hours",
        rows: 3,
        values: range(3, 12, 0.5, (v) => v.toFixed(1)),
      },
      {
        kind: "timePair",
        keys: ["bedTime", "wakeTime"],
        labels: ["Bedtime", "Wake up"],
        initial: [23 * 60 + 30, 6 * 60 + 30],
      },
    ],
  },
  {
    id: "AO-14",
    section: "recovery",
    glyph: MoonStar,
    title: "How well do you usually sleep?",
    sub: "Be honest; it changes how hard we push you.",
    skippable: true,
    fields: [
      {
        kind: "single",
        key: "sleepQuality",
        options: [
          {
            value: "great",
            label: "Great",
            sub: "Wake up rested most days",
            icon: FaceSlightlySmiling,
          },
          {
            value: "okay",
            label: "Okay",
            sub: "Rested some days, tired others",
            icon: FaceNeutral,
          },
          {
            value: "poor",
            label: "Poor",
            sub: "Often wake up tired",
            icon: FaceSlightlyFrowning,
          },
          {
            value: "very_poor",
            label: "Very poor",
            sub: "Trouble falling or staying asleep",
            icon: CloudMoon,
          },
        ],
      },
    ],
  },
  {
    id: "AO-15",
    section: "recovery",
    glyph: Activity,
    title: "How do your days feel lately?",
    sub: "A baseline you'll update in check-ins.",
    skippable: true,
    fields: [
      {
        kind: "scale",
        key: "stress",
        label: "Stress",
        options: ["1", "2", "3", "4", "5"],
        initial: "3",
        ends: ["Calm", "Very stressed"],
      },
      {
        kind: "scale",
        key: "energy",
        label: "Energy",
        options: ["1", "2", "3", "4", "5"],
        initial: "3",
        ends: ["Very low", "Great"],
      },
      {
        kind: "chips",
        key: "soreness",
        label: "Muscle soreness after training",
        options: ["Rarely", "Sometimes", "Often"],
        exclusive: "*",
      },
    ],
  },
  {
    id: "AO-15b",
    section: "recovery",
    glyph: Watch,
    title: "Do you wear a sleep or fitness tracker?",
    sub: "Arcwell can read your sleep and heart data from it for a more accurate recovery score. You'll connect it after you sign up.",
    skippable: true,
    fields: [
      {
        kind: "single",
        key: "device",
        options: [
          { value: "whoop", label: "WHOOP", icon: Watch },
          { value: "fitbit", label: "Fitbit", icon: Watch },
          { value: "oura", label: "Oura Ring", icon: CircleDashed },
          { value: "garmin", label: "Garmin", icon: Watch },
          { value: "samsung", label: "Samsung Galaxy Watch", icon: Watch },
          { value: "pixel", label: "Pixel Watch", icon: Watch },
          { value: "other", label: "Another watch or ring", icon: Watch },
          {
            value: "none",
            label: "No tracker",
            sub: "Recovery comes from a 20-second morning check-in",
            icon: Sun,
          },
        ],
      },
    ],
  },
  // ---------- Nutrition ----------
  {
    id: "AO-16",
    section: "nutrition",
    glyph: Salad,
    title: "How do you eat?",
    sub: "We'll only suggest foods that fit.",
    fields: [
      {
        kind: "single",
        key: "diet",
        required: true,
        options: [
          {
            value: "veg",
            label: "Vegetarian",
            sub: "Dairy, no meat or eggs",
            icon: Leaf,
          },
          {
            value: "egg",
            label: "Eggetarian",
            sub: "Vegetarian plus eggs",
            icon: Egg,
          },
          {
            value: "nonveg",
            label: "Non-vegetarian",
            sub: "Meat, fish and eggs",
            icon: Drumstick,
          },
          {
            value: "vegan",
            label: "Vegan",
            sub: "No animal products",
            icon: Sprout,
          },
          {
            value: "jain",
            label: "Jain",
            sub: "No root vegetables, meat or eggs",
            icon: Flower2,
          },
        ],
      },
    ],
  },
  {
    id: "AO-17",
    section: "nutrition",
    glyph: Utensils,
    title: "How many times do you eat a day?",
    sub: "Your food log follows this.",
    next: "Finish",
    fields: [
      {
        kind: "scale",
        key: "mealsPerDay",
        options: ["2", "3", "4", "5+"],
        initial: "3",
      },
      { kind: "mealPreview", from: "mealsPerDay" },
    ],
  },
];

export const athleteFlow: Flow = { sections, questions };
