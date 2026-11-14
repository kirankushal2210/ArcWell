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

const DAY_MS = 24 * 60 * 60 * 1000;
/** A check-in counts for the nearest due day: up to three days early, or late until the next one. */
const EARLY_DAYS = 3;
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** Local midnight of the day. */
const dayStart = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) =>
  Math.round((dayStart(b).getTime() - dayStart(a).getTime()) / DAY_MS);

/**
 * When a check-in was sent: its timestamp, else read from the shown text ("just now", "2 h ago",
 * "Yesterday", "2 Nov"), which is all older sample check-ins carry. Null when it can't be read.
 */
export function sentAt(
  k: Pick<CheckIn, "at" | "submitted">,
  now = new Date(),
): Date | null {
  if (k.at) {
    const d = new Date(k.at);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const t = k.submitted.trim().toLowerCase();
  if (t === "just now" || t === "today") return now;
  if (t === "yesterday") return addDays(now, -1);
  const ago = t.match(/^(\d+)\s*(min|m|h|hour|hours|d|day|days)\s+ago$/);
  if (ago) {
    const n = Number(ago[1]);
    const unit = ago[2];
    const ms = unit.startsWith("m")
      ? 60_000
      : unit.startsWith("h")
        ? 3_600_000
        : DAY_MS;
    return new Date(now.getTime() - n * ms);
  }
  const dm = t.match(/^(\d{1,2})\s+([a-z]{3})/);
  if (dm) {
    const month = MONTHS.indexOf(dm[2]);
    if (month < 0) return null;
    const d = new Date(now.getFullYear(), month, Number(dm[1]));
    // "2 Nov" read in January means last November.
    return d.getTime() > now.getTime()
      ? new Date(now.getFullYear() - 1, month, Number(dm[1]))
      : d;
  }
  return null;
}

export type CheckInStatus =
  /** Sent for the current due day (or the last one, until the next one opens). */
  | { kind: "sent"; due: Date }
  /** Not sent yet and not late: due in `inDays` (0 = today). */
  | { kind: "due"; due: Date; inDays: number }
  /** The last due day passed without a check-in. */
  | { kind: "overdue"; due: Date; daysLate: number };

/**
 * Where this client's weekly check-in stands, from their check-in day and when they last sent one.
 * A check-in counts for the nearest due day: from three days before it until three days after.
 * The starting point (no check-ins yet) is never overdue.
 */
export function checkInStatus(
  c: Pick<Client, "checkInDay" | "checkIns">,
  now = new Date(),
): CheckInStatus {
  const today = dayStart(now);
  const wd = DAY_INDEX[c.checkInDay] ?? 0;
  const next = addDays(today, (wd - today.getDay() + 7) % 7);
  const prev = addDays(next, -7);
  const sent = c.checkIns
    .map((k) => sentAt(k, now))
    .filter((d): d is Date => d !== null)
    .map(dayStart)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const inDays = daysBetween(today, next);
  if (!c.checkIns.length) return { kind: "due", due: next, inDays };
  // Undated sample check-ins: trust that the latest one is on time.
  if (!sent) return { kind: "due", due: next, inDays };
  const opens = (due: Date) => addDays(due, -EARLY_DAYS);
  if (sent >= opens(next)) return { kind: "sent", due: next };
  const coveredPrev = sent >= opens(prev);
  if (coveredPrev && today < opens(next)) return { kind: "sent", due: prev };
  if (coveredPrev) return { kind: "due", due: next, inDays };
  return { kind: "overdue", due: prev, daysLate: daysBetween(prev, today) };
}

/** True when this week's check-in is in. */
export const sentThisWeek = (
  c: Pick<Client, "checkInDay" | "checkIns">,
  now = new Date(),
) => checkInStatus(c, now).kind === "sent";

export const isOverdue = (
  c: Pick<Client, "checkInDay" | "checkIns">,
  now = new Date(),
) => checkInStatus(c, now).kind === "overdue";

const shortDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** The missed due day, for an overdue check-in: "yesterday", "Sunday" or "7 Nov". */
export const missedDay = (
  c: Pick<Client, "checkInDay">,
  s: Extract<CheckInStatus, { kind: "overdue" }>,
) =>
  s.daysLate === 1
    ? "yesterday"
    : s.daysLate < 7
      ? c.checkInDay
      : shortDate(s.due);

/** "Due today", "Due tomorrow", "Due Sunday", "Overdue since Sunday" or "Sent". */
export function dueText(
  c: Pick<Client, "checkInDay" | "checkIns">,
  now = new Date(),
) {
  const s = checkInStatus(c, now);
  if (s.kind === "sent") return "Sent";
  if (s.kind === "overdue") return `Overdue since ${missedDay(c, s)}`;
  return s.inDays === 0
    ? "Due today"
    : s.inDays === 1
      ? "Due tomorrow"
      : `Due ${c.checkInDay}`;
}

/** Clients whose check-ins the coach can chase: joined, with a plan, and not paused or finished. */
export const expectsCheckIns = (
  c: Pick<Client, "isNew" | "pending" | "status">,
) =>
  !c.isNew && !c.pending && (c.status === "active" || c.status === "leaving");

/** Below this share of planned workouts, the coach sees the client under "Needs attention". */
export const LOW_ADHERENCE = 60;

/**
 * Why the client sits under "Needs attention" (K-01), worked out now: the stored reason (a check-in
 * to review, a note), with the overdue check-in and low adherence computed rather than stored.
 * Pass `fromLogs` (adherence from logged workouts) when it exists; it replaces a stored
 * low-adherence line.
 */
export function attentionOf(
  c: Pick<
    Client,
    "attention" | "checkInDay" | "checkIns" | "isNew" | "pending" | "status"
  >,
  now = new Date(),
  fromLogs?: number | null,
) {
  const computed = fromLogs !== undefined && fromLogs !== null;
  const stored =
    c.attention?.startsWith("Check-in overdue") ||
    (computed && c.attention?.startsWith("Low adherence"))
      ? undefined
      : c.attention;
  if (stored) return stored;
  if (!expectsCheckIns(c)) return undefined;
  const s = checkInStatus(c, now);
  if (s.kind === "overdue") return `Check-in overdue · due ${missedDay(c, s)}`;
  if (computed && fromLogs < LOW_ADHERENCE)
    return `Low adherence · ${fromLogs}% of planned workouts`;
  return undefined;
}

/** The coach should look at this client first (K-01): attention reasons or unread messages. */
export const needsAttentionNow = (
  c: Client,
  now = new Date(),
  fromLogs?: number | null,
) => expectsCheckIns(c) && (!!attentionOf(c, now, fromLogs) || c.unread > 0);

/** The earliest check-in with a photo for this pose: the starting point to compare against. */
export const firstPhoto = (c: Client, pose: PhotoPose) =>
  [...c.checkIns].reverse().find((k) => k.photos?.[pose]);

export const today = () => dateKey(new Date());
