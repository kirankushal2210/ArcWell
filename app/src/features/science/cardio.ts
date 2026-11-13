// Cardio fitness, VO2 max (D79). Pure rules: estimates from tests, the athlete's level, the weekly
// interval prescription, placement around lifting, progression and retests. Sources in sources.ts
// (helgerud2007, milanovic2015, wen2019, gist2014, montero2017, kodama2009, wilson2012, tanaka2001,
// cooper1968, kline1987, jackson1990, kaminsky2015). The Cooper and Jackson equations are confirmed
// from papers that reproduce them (the originals have no abstract online).
import { setsFor } from "./rules";

export type Machine =
  "bike" | "rower" | "skierg" | "run" | "incline_walk" | "stairs" | "swim";

export const MACHINE_LABEL: Record<Machine, string> = {
  bike: "Bike",
  rower: "Rower",
  skierg: "SkiErg",
  run: "Run",
  incline_walk: "Incline walk",
  stairs: "Stair climber",
  swim: "Swim",
};

/** The library exercise each machine logs as. */
export const MACHINE_EXERCISE: Record<Machine, string> = {
  bike: "Cycling",
  rower: "Rowing machine",
  skierg: "Ski erg",
  run: "Running",
  incline_walk: "Treadmill",
  stairs: "Stair machine (steps)",
  swim: "Swimming",
};

export type Sex = "male" | "female";

/** Age-predicted maximum heart rate (Tanaka 2001): 208 − 0.7 × age. */
export const hrMaxFor = (age: number) => Math.round(208 - 0.7 * age);

/** Interval work at 85–95% of max heart rate; easy sessions conversational. */
export const INTERVAL_ZONE = [0.85, 0.95] as const;
export const EASY_ZONE = [0.6, 0.75] as const;
export const zoneBpm = (hrMax: number, z: readonly [number, number]) =>
  [Math.round(hrMax * z[0]), Math.round(hrMax * z[1])] as const;

// ---------- Estimates ----------

/** Cooper 12-minute run: VO2max = (metres − 504.9) / 44.73. */
export const cooperVo2 = (metres: number) =>
  Math.max(10, Math.round(((metres - 504.9) / 44.73) * 10) / 10);

/**
 * Rockport 1-mile walk (Kline 1987, equation as published in the abstract, L/min):
 * 6.9652 + 0.0091·weight(lb) − 0.0257·age + 0.5955·sex − 0.2240·time(min) − 0.0115·end heart rate,
 * converted to ml/kg/min.
 */
export function rockportVo2(p: {
  weightKg: number;
  age: number;
  sex: Sex;
  minutes: number;
  endHr: number;
}) {
  const lb = p.weightKg * 2.20462;
  const lpm =
    6.9652 +
    0.0091 * lb -
    0.0257 * p.age +
    0.5955 * (p.sex === "male" ? 1 : 0) -
    0.224 * p.minutes -
    0.0115 * p.endHr;
  return Math.max(10, Math.round(((lpm * 1000) / p.weightKg) * 10) / 10);
}

/** How active you are, 0–7 (the non-exercise estimate's activity scale, simplified wording). */
export const ACTIVITY_SCALE: { value: number; label: string }[] = [
  { value: 0, label: "Rarely active" },
  { value: 2, label: "Light activity most weeks" },
  { value: 4, label: "Under 1 hour of hard exercise a week" },
  { value: 5, label: "1 to 3 hours of hard exercise a week" },
  { value: 6, label: "3 to 6 hours a week" },
  { value: 7, label: "More than 6 hours a week" },
];

/** Non-exercise estimate (Jackson 1990): 56.363 + 1.921·activity − 0.381·age − 0.754·BMI + 10.987·sex. */
export function nonExerciseVo2(p: {
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  activity: number;
}) {
  const bmi = p.weightKg / (p.heightCm / 100) ** 2;
  const v =
    56.363 +
    1.921 * p.activity -
    0.381 * p.age -
    0.754 * bmi +
    10.987 * (p.sex === "male" ? 1 : 0);
  return Math.max(10, Math.round(v * 10) / 10);
}

export type TestKind = "watch" | "cooper" | "rockport" | "questions";
export const TEST_LABEL: Record<TestKind, string> = {
  watch: "Watch estimate",
  cooper: "12-minute run",
  rockport: "1-mile walk",
  questions: "Estimate from your answers",
};
/** How much to trust each estimate: a test beats a watch, which beats questions. */
export const TEST_RANK: Record<TestKind, number> = {
  cooper: 3,
  rockport: 3,
  watch: 2,
  questions: 1,
};

export type Vo2Test = {
  id: string;
  date: string;
  kind: TestKind;
  vo2: number;
  /** Distance, time or answers behind the number. */
  detail?: string;
};

// ---------- Where you stand (FRIEND reference, Kaminsky 2022) ----------

/**
 * Treadmill VO2max percentiles by sex and decade, [p10, p25, p50, p75, p90] in ml/kg/min, from FRIEND
 * 2015 Table 3 (kaminsky2015, PMC4919021). The 2022 update's values are 1.5–4.6 lower (kaminsky2022);
 * its table couldn't be read, so these slightly understate where someone stands.
 */
export type PercentileRow = {
  age: [number, number];
  p: [number, number, number, number, number];
};
export const FRIEND: Record<Sex, PercentileRow[]> = {
  male: [
    { age: [18, 29], p: [32.1, 40.1, 48.0, 55.2, 61.8] },
    { age: [30, 39], p: [30.2, 35.9, 42.4, 49.2, 56.5] },
    { age: [40, 49], p: [26.8, 31.9, 37.8, 45.0, 52.1] },
    { age: [50, 59], p: [22.8, 27.1, 32.6, 39.7, 45.6] },
    { age: [60, 69], p: [19.8, 23.7, 28.2, 34.5, 40.3] },
    { age: [70, 99], p: [17.1, 20.4, 24.4, 30.4, 36.6] },
  ],
  female: [
    { age: [18, 29], p: [23.9, 30.5, 37.6, 44.7, 51.3] },
    { age: [30, 39], p: [20.9, 25.3, 30.2, 36.1, 41.4] },
    { age: [40, 49], p: [18.8, 22.1, 26.7, 32.4, 38.4] },
    { age: [50, 59], p: [17.3, 19.9, 23.4, 27.6, 32.0] },
    { age: [60, 69], p: [14.6, 17.2, 20.0, 23.8, 27.0] },
    { age: [70, 99], p: [13.6, 15.6, 18.3, 20.8, 23.1] },
  ],
};

const PCTS = [10, 25, 50, 75, 90];

/** Approximate percentile for age and sex, or null if the table has no row. */
export function percentileFor(
  vo2: number,
  age: number,
  sex: Sex,
): number | null {
  const rows = FRIEND[sex];
  if (!rows.length) return null;
  const row =
    rows.find((r) => age >= r.age[0] && age <= r.age[1]) ??
    (age < rows[0].age[0] ? rows[0] : rows[rows.length - 1]);
  const p = row.p;
  if (vo2 <= p[0]) return Math.max(1, Math.round((vo2 / p[0]) * 10));
  if (vo2 >= p[4])
    return Math.min(99, Math.round(90 + ((vo2 - p[4]) / p[4]) * 50));
  for (let i = 0; i < 4; i++)
    if (vo2 <= p[i + 1])
      return Math.round(
        PCTS[i] + ((vo2 - p[i]) / (p[i + 1] - p[i])) * (PCTS[i + 1] - PCTS[i]),
      );
  return 50;
}

export type Level = "beginner" | "intermediate" | "advanced";
export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Starting out",
  intermediate: "Building",
  advanced: "Fit",
};

/** Level from the percentile when known, else from the number alone. */
export function levelFor(vo2: number, pct: number | null): Level {
  if (pct !== null)
    return pct < 40 ? "beginner" : pct < 75 ? "intermediate" : "advanced";
  return vo2 < 35 ? "beginner" : vo2 < 48 ? "intermediate" : "advanced";
}

// ---------- Sessions ----------

export type Interval = {
  rounds: number;
  workSec: number;
  restSec: number;
  sets?: number;
  label: string;
};

/**
 * The interval session for a level and training week (1-based). Beginners build from 4 × 2 min to
 * 4 × 4 min over about 6 weeks; every 4th week is lighter (fewer rounds).
 */
export function intervalFor(level: Level, week: number, variant = 0): Interval {
  const light = week % 4 === 0;
  if (level === "beginner") {
    const workMin = [2, 2, 3, 3, 3, 4][Math.min(5, Math.max(0, week - 1))];
    const rounds = light ? 3 : 4;
    return {
      rounds,
      workSec: workMin * 60,
      restSec: 180,
      label: `${rounds} × ${workMin} min hard, 3 min easy`,
    };
  }
  if (level === "intermediate") {
    const rounds = light ? 3 : week >= 5 ? 5 : 4;
    return {
      rounds,
      workSec: 240,
      restSec: 180,
      label: `${rounds} × 4 min hard, 3 min easy`,
    };
  }
  // Advanced: rotate long intervals and short intervals.
  if (variant % 2 === 1)
    return {
      rounds: 13,
      sets: light ? 2 : 3,
      workSec: 30,
      restSec: 15,
      label: `${light ? 2 : 3} sets of 13 × 30 s hard, 15 s easy`,
    };
  const rounds = light ? 3 : 5;
  return {
    rounds,
    workSec: 240,
    restSec: 180,
    label: `${rounds} × 4 min hard, 3 min easy`,
  };
}

export const intervalMinutes = (i: Interval) =>
  Math.round(
    ((i.workSec + i.restSec) * i.rounds * (i.sets ?? 1)) / 60 + 10, // + warm-up and cool-down
  );

export const easyMinutes: Record<Level, number> = {
  beginner: 25,
  intermediate: 35,
  advanced: 45,
};

/** Interval sessions a week by level: 1 for beginners, 2 once building. */
export const intervalsPerWeek: Record<Level, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 2,
};

const LOWER = ["quads", "hamstrings", "glutes", "calves"];

/** True when a training day loads the legs meaningfully (3+ hard sets for a lower-body group). */
export function isLowerBodyDay(exercises: { name: string; sets: number }[]) {
  const total: Record<string, number> = {};
  for (const e of exercises)
    for (const [g, n] of Object.entries(setsFor(e.name, e.sets)))
      total[g] = (total[g] ?? 0) + (n ?? 0);
  return LOWER.some((g) => (total[g] ?? 0) >= 3);
}

export type CardioSlot = {
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  kind: "intervals" | "easy";
  machine: Machine;
  minutes: number;
  interval?: Interval;
};

/**
 * Place the week's cardio around the lifting (D79): intervals never on a leg day or the day before
 * one, easy sessions anywhere except the day before a leg day if avoidable; only on the days and
 * machines the athlete allowed; running only if chosen.
 */
export function weekCardio(p: {
  level: Level;
  week: number;
  /** Weekdays the athlete allowed for cardio (0–6). Empty means any day. */
  days: number[];
  machines: Machine[];
  /** Lifting by weekday: null for rest days, else whether it loads the legs. */
  lifting: ({ lower: boolean } | null)[];
}): CardioSlot[] {
  const allowed = p.days.length ? p.days : [0, 1, 2, 3, 4, 5, 6];
  const machines = p.machines.length ? p.machines : (["bike"] as Machine[]);
  const legDay = (d: number) => !!p.lifting[((d % 7) + 7) % 7]?.lower;
  const okForIntervals = (d: number) => !legDay(d) && !legDay(d + 1);
  const score = (d: number) =>
    (p.lifting[d] === null ? 2 : 1) + (legDay(d - 1) ? -0.5 : 0);
  const candidates = allowed
    .filter(okForIntervals)
    .sort((a, b) => score(b) - score(a));
  const n = intervalsPerWeek[p.level];
  const picked: number[] = [];
  for (const d of candidates) {
    if (picked.length >= n) break;
    if (picked.some((x) => Math.abs(x - d) < 2)) continue; // at least a day between hard sessions
    picked.push(d);
  }
  const slots: CardioSlot[] = picked
    .sort((a, b) => a - b)
    .map((day, i) => {
      const interval = intervalFor(p.level, p.week, i);
      return {
        day,
        kind: "intervals",
        machine: machines[i % machines.length],
        minutes: intervalMinutes(interval),
        interval,
      };
    });
  const easyDay = allowed
    .filter((d) => !picked.includes(d))
    .sort(
      (a, b) =>
        (legDay(a + 1) ? 1 : 0) - (legDay(b + 1) ? 1 : 0) ||
        score(b) - score(a),
    )[0];
  if (easyDay !== undefined)
    slots.push({
      day: easyDay,
      kind: "easy",
      machine: machines[machines.length > 1 ? 1 : 0],
      minutes: easyMinutes[p.level],
    });
  return slots.sort((a, b) => a.day - b.day);
}

/** Retest every 6 weeks (6–8 recommended). */
export const RETEST_DAYS = 42;
export function retestInDays(lastTestDate: string | undefined, today: string) {
  if (!lastTestDate) return 0;
  const days = Math.round(
    (Date.parse(`${today}T00:00:00`) - Date.parse(`${lastTestDate}T00:00:00`)) /
      86400000,
  );
  return Math.max(0, RETEST_DAYS - days);
}

/** Best current estimate: the most trusted kind among the latest few, newest first. */
export function bestEstimate(tests: Vo2Test[]): Vo2Test | undefined {
  const recent = [...tests]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  return recent.sort(
    (a, b) =>
      TEST_RANK[b.kind] - TEST_RANK[a.kind] || b.date.localeCompare(a.date),
  )[0];
}

/** PAR-Q+ first page, plain wording; any yes → talk to a doctor before hard intervals or tests. */
export const PARQ: string[] = [
  "Has a doctor ever said you have a heart condition or high blood pressure?",
  "Do you feel pain in your chest at rest, in daily activities, or when you exercise?",
  "Do you lose balance from dizziness, or have you lost consciousness in the last 12 months?",
  "Have you been diagnosed with another long-term medical condition (other than heart disease or high blood pressure)?",
  "Are you taking prescribed medicine for a long-term medical condition?",
  "Do you have a bone, joint or soft-tissue problem that could get worse with more activity?",
  "Has a doctor said you should only do medically supervised physical activity?",
];
