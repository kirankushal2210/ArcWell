// Tailored starter workouts (D13, D27: 2–3 standalone templates for free athletes), built from the
// onboarding answers: goal, experience, where they train (and home kit), injuries, days and session length.
// Picks only exercises the athlete has the equipment for and that don't load an injured area.
import type { Answers } from "./OnboardingContext";

type Kit =
  | "gym"
  | "dumbbells"
  | "bands"
  | "pullup"
  | "bench"
  | "kettlebell"
  | "bodyweight";
type Area =
  | "Lower back"
  | "Knee"
  | "Shoulder"
  | "Wrist / elbow"
  | "Neck"
  | "Ankle"
  | "Hip";
type Pattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "push_h"
  | "push_v"
  | "pull_h"
  | "pull_v"
  | "core"
  | "arms"
  | "calves";

type Exercise = { name: string; pattern: Pattern; kit: Kit[]; loads: Area[] };

// Each exercise lists every equipment option that can do it; "bodyweight" means nothing is needed.
const LIBRARY: Exercise[] = [
  {
    name: "Back squat",
    pattern: "squat",
    kit: ["gym"],
    loads: ["Knee", "Lower back", "Hip"],
  },
  { name: "Leg press", pattern: "squat", kit: ["gym"], loads: ["Knee"] },
  {
    name: "Goblet squat",
    pattern: "squat",
    kit: ["dumbbells", "kettlebell"],
    loads: ["Knee"],
  },
  {
    name: "Box squat",
    pattern: "squat",
    kit: ["bench", "bodyweight"],
    loads: ["Knee"],
  },
  { name: "Glute bridge", pattern: "hinge", kit: ["bodyweight"], loads: [] },
  {
    name: "Romanian deadlift",
    pattern: "hinge",
    kit: ["gym", "dumbbells", "kettlebell"],
    loads: ["Lower back"],
  },
  {
    name: "Hip thrust",
    pattern: "hinge",
    kit: ["gym", "bench"],
    loads: ["Hip"],
  },
  {
    name: "Kettlebell swing",
    pattern: "hinge",
    kit: ["kettlebell"],
    loads: ["Lower back", "Shoulder"],
  },
  {
    name: "Reverse lunge",
    pattern: "lunge",
    kit: ["bodyweight", "dumbbells"],
    loads: ["Knee", "Ankle"],
  },
  {
    name: "Step-up",
    pattern: "lunge",
    kit: ["bench", "gym"],
    loads: ["Knee", "Ankle"],
  },
  { name: "Leg curl", pattern: "lunge", kit: ["gym"], loads: [] },
  {
    name: "Bench press",
    pattern: "push_h",
    kit: ["gym"],
    loads: ["Shoulder", "Wrist / elbow"],
  },
  {
    name: "Dumbbell bench press",
    pattern: "push_h",
    kit: ["dumbbells"],
    loads: ["Shoulder", "Wrist / elbow"],
  },
  {
    name: "Push-up",
    pattern: "push_h",
    kit: ["bodyweight"],
    loads: ["Shoulder", "Wrist / elbow"],
  },
  {
    name: "Band chest press",
    pattern: "push_h",
    kit: ["bands"],
    loads: ["Shoulder"],
  },
  {
    name: "Overhead press",
    pattern: "push_v",
    kit: ["gym", "dumbbells", "kettlebell"],
    loads: ["Shoulder", "Lower back", "Neck"],
  },
  {
    name: "Pike push-up",
    pattern: "push_v",
    kit: ["bodyweight"],
    loads: ["Shoulder", "Wrist / elbow", "Neck"],
  },
  { name: "Seated cable row", pattern: "pull_h", kit: ["gym"], loads: [] },
  {
    name: "One-arm dumbbell row",
    pattern: "pull_h",
    kit: ["dumbbells", "kettlebell"],
    loads: ["Lower back"],
  },
  { name: "Band row", pattern: "pull_h", kit: ["bands"], loads: [] },
  {
    name: "Table row",
    pattern: "pull_h",
    kit: ["bodyweight"],
    loads: ["Wrist / elbow"],
  },
  {
    name: "Lat pulldown",
    pattern: "pull_v",
    kit: ["gym"],
    loads: ["Shoulder"],
  },
  {
    name: "Pull-up",
    pattern: "pull_v",
    kit: ["pullup"],
    loads: ["Shoulder", "Wrist / elbow"],
  },
  { name: "Band pulldown", pattern: "pull_v", kit: ["bands"], loads: [] },
  {
    name: "Plank",
    pattern: "core",
    kit: ["bodyweight"],
    loads: ["Lower back", "Shoulder"],
  },
  { name: "Dead bug", pattern: "core", kit: ["bodyweight"], loads: [] },
  {
    name: "Hanging knee raise",
    pattern: "core",
    kit: ["pullup", "gym"],
    loads: ["Shoulder", "Wrist / elbow"],
  },
  {
    name: "Dumbbell curl",
    pattern: "arms",
    kit: ["dumbbells", "gym"],
    loads: ["Wrist / elbow"],
  },
  {
    name: "Band triceps pushdown",
    pattern: "arms",
    kit: ["bands", "gym"],
    loads: ["Wrist / elbow"],
  },
  {
    name: "Calf raise",
    pattern: "calves",
    kit: ["bodyweight", "gym"],
    loads: ["Ankle"],
  },
];

const KIT_FROM_ANSWER: Record<string, Kit> = {
  Dumbbells: "dumbbells",
  "Resistance bands": "bands",
  "Pull-up bar": "pullup",
  Bench: "bench",
  Kettlebell: "kettlebell",
};

// Session shapes by days per week. Movement order: big lifts first, accessories last.
const SPLITS: { name: string; patterns: Pattern[] }[][] = [
  [
    {
      name: "Full body A",
      patterns: [
        "squat",
        "push_h",
        "pull_h",
        "hinge",
        "core",
        "calves",
        "arms",
        "lunge",
      ],
    },
    {
      name: "Full body B",
      patterns: [
        "hinge",
        "push_v",
        "pull_v",
        "lunge",
        "core",
        "arms",
        "calves",
        "squat",
      ],
    },
    {
      name: "Full body C",
      patterns: [
        "lunge",
        "push_h",
        "pull_v",
        "squat",
        "core",
        "arms",
        "hinge",
        "calves",
      ],
    },
  ],
  [
    {
      name: "Upper",
      patterns: [
        "push_h",
        "pull_h",
        "push_v",
        "pull_v",
        "arms",
        "core",
        "arms",
        "core",
      ],
    },
    {
      name: "Lower",
      patterns: [
        "squat",
        "hinge",
        "lunge",
        "calves",
        "core",
        "hinge",
        "squat",
        "calves",
      ],
    },
    {
      name: "Full body",
      patterns: [
        "squat",
        "push_h",
        "pull_v",
        "hinge",
        "core",
        "arms",
        "lunge",
        "calves",
      ],
    },
  ],
  [
    {
      name: "Push",
      patterns: [
        "push_h",
        "push_v",
        "push_h",
        "arms",
        "core",
        "push_v",
        "arms",
        "core",
      ],
    },
    {
      name: "Pull",
      patterns: [
        "pull_v",
        "pull_h",
        "pull_h",
        "arms",
        "core",
        "pull_v",
        "arms",
        "core",
      ],
    },
    {
      name: "Legs",
      patterns: [
        "squat",
        "hinge",
        "lunge",
        "calves",
        "core",
        "squat",
        "hinge",
        "calves",
      ],
    },
  ],
];

export type PlannedExercise = { name: string; sets: number; reps: string };
export type Workout = {
  name: string;
  minutes: number;
  exercises: PlannedExercise[];
};

function prescription(
  goal: string,
  experience: string,
): { sets: number; reps: string; main: string } {
  const extraSet =
    experience === "experienced" || experience === "very" ? 1 : 0;
  switch (goal) {
    case "get_stronger":
      return {
        sets: 3 + extraSet,
        reps: "8",
        main: experience === "new" ? "6" : "5",
      };
    case "build_muscle":
      return { sets: 3 + extraSet, reps: "10–12", main: "8–10" };
    case "lose_fat":
      return { sets: 3, reps: "12–15", main: "10–12" };
    case "recomposition":
      return { sets: 3 + extraSet, reps: "10–12", main: "8–10" };
    default:
      return { sets: 3, reps: "10–12", main: "10" };
  }
}

export function buildWorkouts(a: Answers): Workout[] {
  const days = Number(a.daysPerWeek ?? 4);
  const minutes = parseInt(String(a.sessionLength ?? "45"), 10);
  const count = minutes <= 30 ? 4 : minutes <= 45 ? 6 : minutes <= 60 ? 7 : 8;
  const injuries = ((a.injuries as string[] | undefined) ?? []).filter(
    (x) => x !== "None" && x !== "Other",
  ) as Area[];

  const have = new Set<Kit>(["bodyweight"]);
  if (a.equipment === "gym" || a.equipment === undefined)
    ["gym", "dumbbells", "bench", "pullup", "bands", "kettlebell"].forEach(
      (k) => have.add(k as Kit),
    );
  if (a.equipment === "home")
    ((a.homeKit as string[] | undefined) ?? []).forEach(
      (k) => KIT_FROM_ANSWER[k] && have.add(KIT_FROM_ANSWER[k]),
    );

  const usable = LIBRARY.filter(
    (e) =>
      e.kit.some((k) => have.has(k)) &&
      !e.loads.some((area) => injuries.includes(area)),
  );
  const { sets, reps, main } = prescription(
    (a.goal as string) ?? "general_fitness",
    (a.experience as string) ?? "some",
  );
  const split = SPLITS[days <= 3 ? 0 : days === 4 ? 1 : 2];

  return split.map((session) => {
    const picked: Exercise[] = [];
    for (const pattern of session.patterns) {
      if (picked.length >= count) break;
      // Prefer gym or loaded versions when available; fall back to bodyweight.
      const option = usable.find(
        (e) => e.pattern === pattern && !picked.includes(e),
      );
      if (option) picked.push(option);
    }
    // Top up from anything usable if the patterns ran out (very limited kit or many injuries).
    for (const e of usable) {
      if (picked.length >= count) break;
      if (!picked.includes(e)) picked.push(e);
    }
    return {
      name: session.name,
      minutes,
      exercises: picked.map((e, k) => ({
        name: e.name,
        sets: e.pattern === "core" ? 3 : sets,
        reps:
          e.name === "Plank"
            ? "30 s"
            : k < 2 && e.pattern !== "core"
              ? main
              : reps,
      })),
    };
  });
}
