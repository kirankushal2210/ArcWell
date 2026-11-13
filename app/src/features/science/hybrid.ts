// Hybrid-race plan rules (D76): phases counted back from race day, the weekly template by days
// available, the sim schedule, taper and running-load checks. Sources: stoggl2014 (intensity mix),
// schumann2022 / wilson2012 / eddens2018 (concurrent training), bosquet2007 (taper),
// frandsen2025 (single-run spikes), gutierrezhellin2026hyrox (race running pace).
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
  Math.round(
    (Date.parse(`${date}T00:00:00`) - Date.parse(`${today}T00:00:00`)) /
      86400000,
  );

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
export function simDue(
  daysToRace: number,
  daysSinceLastSim: number | null,
): "half" | "full" | null {
  if (daysToRace <= 10) return null;
  if (daysToRace >= 21 && daysToRace <= 35) return "full";
  const phase = phaseFor(daysToRace);
  if (
    (phase === "build" || phase === "specific") &&
    (daysSinceLastSim === null || daysSinceLastSim >= 21)
  )
    return "half";
  return null;
}

/** Flag a run more than ~10% longer than the longest run in the last 30 days. */
export const runSpike = (km: number, longestLast30: number) =>
  longestLast30 > 0 && km > longestLast30 * 1.1;

let n = 0;
const id = (p: string) =>
  `${p}-${Date.now().toString(36)}-${(n++).toString(36)}`;

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

/** What the athlete told us (onboarding or race setup) that shapes the plan. */
export type RaceProfile = {
  level?: "first" | "returning" | "advanced";
  weeklyKm?: number;
  recent5kSec?: number;
  /** Advanced: real in-race pace. */
  racePaceSec?: number;
  weak?: string[];
  stationsTried?: string[];
};

const pace = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

/**
 * Race-day running pace per km. Pro men averaged about 84% of second-threshold speed in a race
 * (gutierrezhellin2026hyrox); threshold sits a little slower than 5 km pace, so race pace is about
 * 1.25 × 5 km pace. A starting estimate, replaced by real sim splits.
 */
export function racePace(p: RaceProfile): number | null {
  if (p.racePaceSec) return p.racePaceSec;
  if (p.recent5kSec) return (p.recent5kSec / 5) * 1.25;
  return null;
}

/** Easy run length by how much the athlete runs now. */
export function easyRun(weeklyKm: number | undefined, phase: Phase) {
  if (phase === "taper") return "20 min easy";
  const k = weeklyKm ?? 5;
  return k === 0
    ? "20-25 min run-walk: 2 min run, 1 min walk"
    : k < 10
      ? "25-35 min easy"
      : k < 20
        ? "30-45 min easy"
        : k < 35
          ? "40-60 min easy"
          : "50-75 min easy";
}

function runDay(
  kind: "run_easy" | "run_hard",
  phase: Phase,
  p: RaceProfile = {},
): TrainingDay {
  const rp = racePace(p);
  const at = rp ? ` at about ${pace(rp)}/km` : " at race pace";
  const fast = p.recent5kSec
    ? ` at about ${pace(p.recent5kSec / 5)}/km`
    : " hard";
  const hard =
    phase === "base"
      ? p.level === "advanced"
        ? `6 × 1 km${fast}, 90 s easy`
        : `6 × 400 m${fast}, 90 s easy`
      : phase === "taper"
        ? `3 × 1 km${at}`
        : `5 × 1 km${at}, 90 s easy`;
  return {
    id: id("day"),
    name: kind === "run_easy" ? "Easy run" : "Run intervals",
    note:
      kind === "run_easy"
        ? "Easy: you can hold a conversation."
        : "Hard but controlled; same pace every rep.",
    exercises: [
      {
        id: id("ex"),
        name: "Running",
        sets: 1,
        reps: kind === "run_easy" ? easyRun(p.weeklyKm, phase) : hard,
        restSec: 0,
      },
    ],
  };
}

/** Stations in practice order: weak ones first, then (for first races) untried ones, then the rest. */
export function stationOrder(p: RaceProfile) {
  const weak = new Set(p.weak ?? []);
  const tried = new Set(p.stationsTried ?? []);
  const rank = (k: string) =>
    weak.has(k) ? 0 : p.level === "first" && !tried.has(k) ? 1 : 2;
  return [...STATIONS].sort((a, b) => rank(a.key) - rank(b.key));
}

function hybridDay(phase: Phase, p: RaceProfile = {}): TrainingDay {
  const weak = new Set(p.weak ?? []);
  const technique = phase === "base" && p.level !== "advanced";
  const stations = stationOrder(p).slice(0, 4);
  const rounds = phase === "taper" ? 2 : technique ? 3 : 4;
  const rp = racePace(p);
  const notes = [
    technique
      ? "Learn each station at a light load; smooth, not fast."
      : `${rounds} rounds: 1 km run straight into a station at race weight.`,
    weak.has("roxzone")
      ? "Practise transitions: jog into each station and start at once."
      : "",
    weak.has("fade") || weak.has("running")
      ? `Hold the same pace on the last run as the first${rp ? ` (about ${pace(rp)}/km)` : ""}.`
      : "",
  ].filter(Boolean);
  return {
    id: id("day"),
    name: technique ? "Station technique" : "Compromised running",
    note: notes.join(" "),
    exercises: [
      ...(technique
        ? []
        : [
            {
              id: id("ex"),
              name: "Running",
              sets: rounds,
              reps: rp ? `1 km at about ${pace(rp)}/km` : "1 km at race pace",
              restSec: 0,
            },
          ]),
      ...stations.map((s) => ({
        id: id("ex"),
        name: s.exercise,
        // One extra round on a weak station.
        sets: (technique ? 3 : rounds) + (weak.has(s.key) ? 1 : 0),
        reps: s.reps
          ? `${Math.round(s.reps / 4)} reps`
          : `${Math.round((s.metres ?? 0) / 4)} m`,
        restSec: technique ? 90 : 0,
      })),
    ],
  };
}

/** Days a week for the level: first races at most 5, so recovery keeps up. */
export const daysFor = (daysPerWeek: number, level?: RaceProfile["level"]) =>
  Math.min(level === "first" ? 5 : 6, Math.max(3, daysPerWeek));

/** Build the week for the current phase from the athlete's days a week (3–6) and race profile. */
export function hybridProgram(
  daysPerWeek: number,
  daysToRace: number,
  p: RaceProfile = {},
): TrainingProgram {
  const phase = phaseFor(daysToRace);
  const kinds = WEEK_TEMPLATE[daysFor(daysPerWeek, p.level)];
  let lower = true;
  const days = kinds.map((k) => {
    if (k === "strength") {
      const d = strengthDay(
        lower ? "Strength · lower body" : "Strength · upper body",
        lower,
      );
      lower = !lower;
      return d;
    }
    if (k === "hybrid") return hybridDay(phase, p);
    return runDay(k, phase, p);
  });
  return {
    name: `Race plan · ${PHASE_LABEL[phase]}`,
    weeks: Math.max(1, Math.ceil(daysToRace / 7)),
    days,
  };
}
