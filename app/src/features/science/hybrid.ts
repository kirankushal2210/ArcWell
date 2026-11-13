// Hybrid-race plan rules (D76): phases counted back from race day, the weekly template by days
// available, the sim schedule, taper and running-load checks. Sources: stoggl2014 (intensity mix),
// schumann2022 / wilson2012 / eddens2018 (concurrent training), bosquet2007 (taper),
// frandsen2025 (single-run spikes).
import type { TrainingDay, TrainingProgram } from "@/features/coach/plans";
import { STATIONS } from "@/features/race/data";

export type Phase = "base" | "build" | "specific" | "taper";
export const PHASE_LABEL: Record<Phase, string> = {
  base: "Base",
  build: "Build",
  specific: "Specific",
  taper: "Taper",
};
export const PHASE_TEXT: Record<Phase, string> = {
  base: "Building your engine and technique: mostly easy running and strength.",
  build: "More race-pace running, stations at race weight, and half sims.",
  specific: "Race rehearsal: compromised running, a full sim, race loads.",
  taper: "Less volume, same intensity: arrive fresh.",
};

export const daysUntil = (date: string, today: string) =>
  Math.round((Date.parse(`${date}T00:00:00`) - Date.parse(`${today}T00:00:00`)) / 86400000);

/** Base > 16 weeks out; Build 16–8; Specific 8–2; Taper the final 14 days. */
export function phaseFor(daysToRace: number): Phase {
  if (daysToRace <= 14) return "taper";
  if (daysToRace <= 56) return "specific";
  if (daysToRace <= 112) return "build";
  return "base";
}

/** Taper: cut volume by about half, keep intensity and how often you train (meta-analysis). */
export const TAPER_VOLUME = 0.5;

/** About 80% of endurance time easy, 20% hard. */
export const EASY_SHARE = 0.8;

export type SessionKind = "strength" | "run_easy" | "run_hard" | "hybrid";
/** Sessions a week by days available (3–6). */
export const WEEK_TEMPLATE: Record<number, SessionKind[]> = {
  3: ["strength", "run_hard", "hybrid"],
  4: ["strength", "run_easy", "strength", "hybrid"],
  5: ["strength", "run_hard", "strength", "run_easy", "hybrid"],
  6: ["strength", "run_hard", "strength", "run_easy", "hybrid", "run_easy"],
};

/** Half sim every 3–4 weeks in Build; one full sim 3–5 weeks out; nothing in the final 10 days. */
export function simDue(daysToRace: number, daysSinceLastSim: number | null): "half" | "full" | null {
  if (daysToRace <= 10) return null;
  if (daysToRace >= 21 && daysToRace <= 35) return "full";
  const phase = phaseFor(daysToRace);
  if ((phase === "build" || phase === "specific") && (daysSinceLastSim === null || daysSinceLastSim >= 21))
    return "half";
  return null;
}

/** Flag a run more than ~10% longer than the longest run in the last 30 days. */
export const runSpike = (km: number, longestLast30: number) =>
  longestLast30 > 0 && km > longestLast30 * 1.1;

let n = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${(n++).toString(36)}`;

function strengthDay(name: string, lower: boolean): TrainingDay {
  const ex = lower
    ? [
        ["Squat (barbell)", 3, "5-8", 150],
        ["Romanian deadlift (barbell)", 3, "6-10", 150],
        ["Walking lunge (dumbbell)", 2, "10-12", 90],
        ["Standing calf raise", 2, "10-15", 90],
      ]
    : [
        ["Bench press (barbell)", 3, "6-10", 150],
        ["Pull up", 3, "6-10", 150],
        ["Overhead press (dumbbell)", 2, "8-12", 90],
        ["Seated cable row - V grip (cable)", 2, "8-12", 90],
      ];
  return {
    id: id("day"),
    name,
    note: "Leave 1 to 3 reps in reserve. No sets to failure on leg work in the 2 days before a key run.",
    exercises: ex.map(([name, sets, reps, rest]) => ({
      id: id("ex"),
      name: name as string,
      sets: sets as number,
      reps: reps as string,
      restSec: rest as number,
    })),
  };
}

function runDay(kind: "run_easy" | "run_hard", phase: Phase): TrainingDay {
  const hard =
    phase === "base" ? "6 × 400 m hard, 90 s easy" : phase === "taper" ? "3 × 1 km at race pace" : "5 × 1 km at race pace, 90 s easy";
  return {
    id: id("day"),
    name: kind === "run_easy" ? "Easy run" : "Run intervals",
    note: kind === "run_easy" ? "Easy: you can hold a conversation." : "Hard but controlled; same pace every rep.",
    exercises: [
      {
        id: id("ex"),
        name: "Running",
        sets: 1,
        reps: kind === "run_easy" ? (phase === "taper" ? "20 min easy" : "30-45 min easy") : hard,
        restSec: 0,
      },
    ],
  };
}

function hybridDay(phase: Phase): TrainingDay {
  const stations = phase === "base" ? STATIONS.slice(0, 4) : STATIONS.slice(4);
  const rounds = phase === "taper" ? 2 : phase === "base" ? 3 : 4;
  return {
    id: id("day"),
    name: phase === "base" ? "Station technique" : "Compromised running",
    note:
      phase === "base"
        ? "Learn each station at a light load; smooth, not fast."
        : `${rounds} rounds: 1 km run straight into a station at race weight.`,
    exercises: [
      ...(phase === "base"
        ? []
        : [{ id: id("ex"), name: "Running", sets: rounds, reps: "1 km at race pace", restSec: 0 }]),
      ...stations.map((s) => ({
        id: id("ex"),
        name: s.exercise,
        sets: phase === "base" ? 3 : rounds,
        reps: s.reps ? `${Math.round(s.reps / 4)} reps` : `${Math.round((s.metres ?? 0) / 4)} m`,
        restSec: phase === "base" ? 90 : 0,
      })),
    ],
  };
}

/** Build the week for the current phase from the athlete's days a week (3–6). */
export function hybridProgram(daysPerWeek: number, daysToRace: number): TrainingProgram {
  const phase = phaseFor(daysToRace);
  const kinds = WEEK_TEMPLATE[Math.min(6, Math.max(3, daysPerWeek))];
  let lower = true;
  const days = kinds.map((k) => {
    if (k === "strength") {
      const d = strengthDay(lower ? "Strength · lower body" : "Strength · upper body", lower);
      lower = !lower;
      return d;
    }
    if (k === "hybrid") return hybridDay(phase);
    return runDay(k, phase);
  });
  return {
    name: `Race plan · ${PHASE_LABEL[phase]}`,
    weeks: Math.max(1, Math.ceil(daysToRace / 7)),
    days,
  };
}
