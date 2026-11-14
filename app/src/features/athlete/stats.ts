// Training totals by week for the Progress chart (D91): duration, volume or reps per week, oldest
// first, ending with the current week. Pure, so it's tested without the app.
import { type Session, weekStart } from "./training";

export type StatMetric = "duration" | "volume" | "reps";

export const RANGES = [
  { key: "1m", label: "Last month", weeks: 5 },
  { key: "3m", label: "Last 3 months", weeks: 13 },
  { key: "6m", label: "Last 6 months", weeks: 26 },
  { key: "1y", label: "Last year", weeks: 52 },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"];

const WEEK = 7 * 86_400_000;

/** Reps in a session: every logged set, warm-ups included. */
export const sessionReps = (s: Session) =>
  s.exercises.reduce(
    (n, e) => n + e.sets.reduce((m, x) => m + (x.reps ?? 0), 0),
    0,
  );

const valueOf = (s: Session, m: StatMetric) =>
  m === "duration" ? s.minutes : m === "volume" ? s.volume : sessionReps(s);

export function weeklyTotals(
  sessions: Session[],
  metric: StatMetric,
  weeks: number,
  now: Date = new Date(),
): { start: Date; value: number }[] {
  const last = weekStart(now).getTime();
  const first = last - (weeks - 1) * WEEK;
  const out = Array.from({ length: weeks }, (_, i) => ({
    start: new Date(first + i * WEEK),
    value: 0,
  }));
  for (const s of sessions) {
    const t = weekStart(new Date(s.at)).getTime();
    const i = Math.round((t - first) / WEEK);
    if (i >= 0 && i < weeks) out[i].value += valueOf(s, metric);
  }
  return out;
}

/** "1 h 20 min", "12.4 t", "114 reps". */
export function formatStat(v: number, m: StatMetric, short = false): string {
  if (m === "duration") {
    const h = Math.floor(v / 60);
    const min = Math.round(v % 60);
    return short
      ? h
        ? `${h} h`
        : `${min} min`
      : h
        ? `${h} h ${min} min`
        : `${min} min`;
  }
  if (m === "volume")
    return v >= 1000
      ? `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1)} t`
      : `${Math.round(v)} kg`;
  return `${Math.round(v)} reps`;
}

/** Days in a month that had a workout, as day-of-month numbers. */
export function workoutDays(sessions: Session[], year: number, month: number) {
  const days = new Set<number>();
  for (const s of sessions) {
    const d = new Date(s.at);
    if (d.getFullYear() === year && d.getMonth() === month)
      days.add(d.getDate());
  }
  return days;
}
