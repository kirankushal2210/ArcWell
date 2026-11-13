// Tailoring today's workout (D70): deterministic rules today, the AI's job later. Each option returns
// a changed copy of one day plus what changed and why. Nothing is saved until the athlete accepts,
// and an accepted change applies to today only.
import { estimateMinutes } from "@/features/athlete/training";
import type { PlannedExercise, TrainingDay } from "@/features/coach/plans";
import { loadsArea, swapFor } from "@/features/onboarding/workouts";
import { adjustSets } from "@/features/science/rules";

export type TailorKind =
  "halve" | "trim" | "minutes30" | "knee" | "back" | "shoulder" | "noBarbell";

export const TAILOR_OPTIONS: { kind: TailorKind; label: string }[] = [
  { kind: "minutes30", label: "I only have 30 minutes" },
  { kind: "trim", label: "I'm tired, go a bit lighter" },
  { kind: "knee", label: "My knee hurts" },
  { kind: "back", label: "My lower back hurts" },
  { kind: "shoulder", label: "My shoulder hurts" },
  { kind: "noBarbell", label: "No barbell today" },
];

export type Tailored = {
  kind: TailorKind;
  exercises: PlannedExercise[];
  changes: string[];
  why: string;
  sources: string[];
};

const AREA: Partial<Record<TailorKind, string>> = {
  knee: "Knee",
  back: "Lower back",
  shoulder: "Shoulder",
};

export function tailor(day: TrainingDay, kind: TailorKind): Tailored {
  const ex = day.exercises.map((e) => ({ ...e }));
  const changes: string[] = [];

  if (kind === "halve" || kind === "trim") {
    const out = adjustSets(ex, kind);
    out.forEach((e, i) => {
      if (e.sets !== ex[i].sets)
        changes.push(`${e.name}: ${ex[i].sets} → ${e.sets} sets`);
    });
    return {
      kind,
      exercises: out,
      changes,
      why:
        kind === "halve"
          ? "Half the sets, same weights: you keep the habit and most of the stimulus without adding much fatigue on a poor day."
          : "One set fewer on each exercise keeps quality high when you're tired. The rest of the week stays as planned.",
      sources: ["craven2022"],
    };
  }

  if (kind === "minutes30") {
    // Keep every exercise, take sets off the later (usually smaller) ones first, never below 1.
    let i = ex.length - 1;
    while (estimateMinutes({ ...day, exercises: ex }) > 30 && i >= 0) {
      if (ex[i].sets > 1) ex[i].sets -= 1;
      else i -= 1;
      if (i >= 0 && ex[i].sets === 1) i -= 1;
    }
    ex.forEach((e, k) => {
      if (e.sets !== day.exercises[k].sets)
        changes.push(`${e.name}: ${day.exercises[k].sets} → ${e.sets} sets`);
    });
    return {
      kind,
      exercises: ex,
      changes,
      why: "The big lifts keep their sets; smaller exercises lose a set or two. A short session that ends close to failure still counts.",
      sources: ["schoenfeld2017volume", "refalo2023"],
    };
  }

  if (kind === "noBarbell" || AREA[kind]) {
    const area = AREA[kind];
    const out = ex
      .map((e) => {
        const alt = swapFor(e.name, {
          avoid: area,
          noBarbell: kind === "noBarbell",
        });
        if (alt) {
          changes.push(`${e.name} → ${alt}`);
          return { ...e, name: alt };
        }
        if (area && loadsArea(e.name, area)) {
          changes.push(`${e.name}: skipped today`);
          return null;
        }
        return e;
      })
      .filter((e): e is PlannedExercise => e !== null);
    return {
      kind,
      exercises: out,
      changes,
      why: area
        ? `Moves that load your ${area.toLowerCase()} are swapped for ones that load it less, with the same movement pattern so the muscles still get the work; where there's no gentler option, that exercise is skipped today. If pain is sharp, gets worse, or lasts more than a few days, see a physiotherapist or doctor.`
        : "Same movement patterns with dumbbells, machines or cables, so the muscles still get the work.",
      sources: [],
    };
  }

  return { kind, exercises: ex, changes, why: "", sources: [] };
}
