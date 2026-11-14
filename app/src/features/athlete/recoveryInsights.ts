// Recovery insights beyond the daily scores (D98), tailored from what recovery apps offer, each on
// evidence. Pure, so they're tested directly.
// - HRV status: the 7-day average against your own normal range, the way elite endurance
//   monitoring reads HRV trends rather than single nights (plews2013).
// - Early warning: resting heart rate, HRV and skin temperature moving the wrong way together
//   showed up days before symptoms of infection in smartwatch data (mishra2020).
// - Fitness age: the age at which an average person has your VO2max (nes2014), from the FRIEND
//   medians already used for percentiles (kaminsky2015).
// - Cycle: period starts, cycle day and the next expected start. No training rules, since cycle
//   phase changed performance only trivially on average (mcnulty2020).
import { FRIEND } from "@/features/science/cardio";

import { shiftDate } from "./foods";

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const sd = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

export type HrvStatus = {
  avg7: number;
  low: number;
  high: number;
  status: "balanced" | "low" | "high";
};

/**
 * `nights` is HRV per night, oldest first, ending last night: at least 14 nights. The normal range
 * is the mean of the nights before the last 7, ± half a standard deviation (at least 3%).
 */
export function hrvStatus(nights: number[]): HrvStatus | null {
  if (nights.length < 14) return null;
  const recent = nights.slice(-7);
  const before = nights.slice(0, -7);
  const m = mean(before);
  const band = Math.max(sd(before) * 0.5, m * 0.03);
  const avg7 = mean(recent);
  const r = (x: number) => Math.round(x);
  return {
    avg7: r(avg7),
    low: r(m - band),
    high: r(m + band),
    status: avg7 < m - band ? "low" : avg7 > m + band ? "high" : "balanced",
  };
}

export type Vital = { label: string; value: number; low: number; high: number };

/**
 * True when at least two of these are off in the direction that comes with illness: resting heart
 * rate above range, HRV below, breathing rate above, skin temperature above.
 */
export function warningSigns(vitals: Vital[]): boolean {
  const off = (label: string, dir: "up" | "down") => {
    const v = vitals.find((x) => x.label === label);
    if (!v) return false;
    return dir === "up" ? v.value > v.high : v.value < v.low;
  };
  return (
    [
      off("Resting heart rate", "up"),
      off("Heart rate variability", "down"),
      off("Breathing rate", "up"),
      off("Skin temperature", "up"),
    ].filter(Boolean).length >= 2
  );
}

/** Age at which the median VO2max equals this one, between 20 and 80. */
export function fitnessAge(vo2: number, sex: "male" | "female"): number {
  // Medians at each decade's midpoint, youngest first; median falls with age.
  const pts = FRIEND[sex].map((r) => ({
    age: Math.min(75, (r.age[0] + Math.min(r.age[1], 79)) / 2),
    v: r.p[2],
  }));
  if (vo2 >= pts[0].v) {
    // Fitter than the youngest median: extend the first slope, no younger than 20.
    const slope = (pts[0].v - pts[1].v) / (pts[1].age - pts[0].age);
    return Math.max(20, Math.round(pts[0].age - (vo2 - pts[0].v) / slope));
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (vo2 <= a.v && vo2 >= b.v)
      return Math.round(a.age + ((a.v - vo2) / (a.v - b.v)) * (b.age - a.age));
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const slope = (prev.v - last.v) / (last.age - prev.age);
  return Math.min(80, Math.round(last.age + (last.v - vo2) / slope));
}

export type CycleInfo = {
  /** Day of the current cycle, 1 = first day of the last period. */
  day: number;
  /** Average length of recent cycles, 21–35 days; 28 until there are two starts. */
  length: number;
  nextStart: string;
  daysToNext: number;
};

const daysBetween = (a: string, b: string) =>
  Math.round(
    (Date.parse(`${b}T12:00:00`) - Date.parse(`${a}T12:00:00`)) / 86_400_000,
  );

/** From logged period start dates (any order) and today's date. */
export function cycleInfo(starts: string[], today: string): CycleInfo | null {
  const s = [...new Set(starts)].filter((d) => d <= today).sort();
  if (!s.length) return null;
  const gaps = s
    .slice(1)
    .map((d, i) => daysBetween(s[i], d))
    .filter((g) => g >= 15 && g <= 60)
    .slice(-6);
  const length = gaps.length
    ? Math.min(35, Math.max(21, Math.round(mean(gaps))))
    : 28;
  const last = s[s.length - 1];
  const day = daysBetween(last, today) + 1;
  let next = shiftDate(last, length);
  while (next < today) next = shiftDate(next, length);
  return { day, length, nextStart: next, daysToNext: daysBetween(today, next) };
}

/**
 * Journal ticks for last night from what was logged (D98): caffeine after 4 pm, alcohol, and a
 * meal within 2 hours of bed. The athlete can still change them.
 */
export function journalFromFood(
  logs: { at?: number; meal: string; caffeineMg: number; alcohol: boolean }[],
  bedMinute: number,
): string[] {
  const usual: Record<string, number> = {
    breakfast: 480,
    lunch: 780,
    snacks: 1020,
    dinner: 1230,
  };
  const out = new Set<string>();
  for (const l of logs) {
    const at = l.at ?? usual[l.meal] ?? 780;
    if (l.caffeineMg > 0 && at >= 16 * 60) out.add("caffeine");
    if (l.alcohol) out.add("alcohol");
    if (at >= bedMinute - 120) out.add("late_meal");
  }
  return [...out];
}
