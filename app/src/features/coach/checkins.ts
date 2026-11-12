// Weekly check-ins (F6, D12): what the athlete sends (photos, weight, waist, six 1–5 scores and
// three short answers) and the week-on-week table the coach reads. Week 0 is the starting point.
import { dateKey } from "@/features/athlete/foods";

import type { CheckIn, CheckInScore, Client } from "./sampleData";

export const SCORES: {
  key: CheckInScore;
  label: string;
  low: string;
  high: string;
}[] = [
  { key: "training", label: "Training", low: "Missed most", high: "Nailed it" },
  { key: "nutrition", label: "Food", low: "Off plan", high: "On plan" },
  { key: "sleep", label: "Sleep", low: "Poor", high: "Great" },
  { key: "energy", label: "Energy", low: "Drained", high: "Full of it" },
  { key: "stress", label: "Stress", low: "Calm", high: "Very stressed" },
  {
    key: "hunger",
    label: "Hunger",
    low: "Never hungry",
    high: "Always hungry",
  },
];

export type PhotoPose = "front" | "side" | "back";
export const POSES: { key: PhotoPose; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
  { key: "back", label: "Back" },
];

export type CheckInForm = {
  photos: Partial<Record<PhotoPose, string>>;
  weightKg: number;
  waistCm?: number;
  scores: Partial<Record<CheckInScore, number>>;
  wins: string;
  struggles: string;
  question: string;
};

const one = (n: number) => n.toFixed(1);
const delta = (now: number, last: number) => {
  const d = now - last;
  if (Math.abs(d) < 0.05) return "—";
  return `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)}`;
};

/** The submitted check-in, with the table against the previous one. */
export function buildCheckIn(
  c: Client,
  f: CheckInForm,
  now = new Date(),
): CheckIn {
  const prev = c.checkIns[0];
  const week = prev ? prev.week + 1 : 0;
  const lastWeight =
    prev?.weightKg ?? c.weights[c.weights.length - 1] ?? f.weightKg;
  const lastWaist =
    prev?.waistCm ?? c.measurements.find((m) => m.label === "Waist")?.now;
  const rows: CheckIn["rows"] = [
    {
      label: "Weight",
      last: one(lastWeight),
      now: one(f.weightKg),
      delta: delta(f.weightKg, lastWeight),
    },
  ];
  if (f.waistCm !== undefined)
    rows.push({
      label: "Waist",
      last: lastWaist !== undefined ? one(lastWaist) : "—",
      now: one(f.waistCm),
      delta: lastWaist !== undefined ? delta(f.waistCm, lastWaist) : "—",
    });
  rows.push({
    label: "Workouts",
    last: "—",
    now: c.training.weekPlanned
      ? `${c.training.weekDone}/${c.training.weekPlanned}`
      : String(c.training.weekDone),
    delta: "—",
  });
  const answers = SCORES.filter((s) => f.scores[s.key])
    .map((s) => `${s.label} ${f.scores[s.key]}`)
    .join(" · ");
  return {
    id: `${c.id}-${week}-${now.getTime().toString(36)}`,
    week,
    at: now.toISOString(),
    submitted: "just now",
    rows,
    answers,
    note: f.struggles.trim() || undefined,
    photos: f.photos,
    weightKg: f.weightKg,
    waistCm: f.waistCm,
    scores: f.scores,
    wins: f.wins.trim() || undefined,
    struggles: f.struggles.trim() || undefined,
    question: f.question.trim() || undefined,
    reviewed: false,
  };
}

/** True when the latest check-in was sent in the last six days. */
export function sentThisWeek(c: Client, now = new Date()) {
  const at = c.checkIns[0]?.at;
  if (!at) return false;
  return now.getTime() - new Date(at).getTime() < 6 * 24 * 60 * 60 * 1000;
}

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** "Due today", "Due tomorrow" or "Due Sunday". */
export function dueText(c: Client, now = new Date()) {
  const d = DAY_INDEX[c.checkInDay] ?? 0;
  const diff = (d - now.getDay() + 7) % 7;
  return diff === 0
    ? "Due today"
    : diff === 1
      ? "Due tomorrow"
      : `Due ${c.checkInDay}`;
}

/** The earliest check-in with a photo for this pose: the starting point to compare against. */
export const firstPhoto = (c: Client, pose: PhotoPose) =>
  [...c.checkIns].reverse().find((k) => k.photos?.[pose]);

export const today = () => dateKey(new Date());
