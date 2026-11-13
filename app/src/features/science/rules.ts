// Evidence rules (D69): the one place Arcwell's training, nutrition and recovery numbers come from.
// The plan generator, templates, the coach builder's warnings, the explainers and (later) the AI
// all use these functions, so a number is never invented on a screen. Each rule names the sources
// it rests on (see sources.ts); anything that rests on expert consensus rather than trials says so.
import { findExercise, type Muscle } from "@/features/athlete/library";

// ---------- Training volume ----------

/** Muscle groups we count weekly volume for. Lats and upper back count together as Back. */
export type Group =
  | "chest"
  | "back"
  | "shoulders"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "biceps"
  | "triceps"
  | "calves"
  | "abs";

export const GROUPS: { key: Group; label: string }[] = [
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "shoulders", label: "Shoulders" },
  { key: "quads", label: "Quads" },
  { key: "hamstrings", label: "Hamstrings" },
  { key: "glutes", label: "Glutes" },
  { key: "biceps", label: "Biceps" },
  { key: "triceps", label: "Triceps" },
  { key: "calves", label: "Calves" },
  { key: "abs", label: "Abs" },
];

const PRIMARY: Partial<Record<Muscle, Group>> = {
  chest: "chest",
  lats: "back",
  upper_back: "back",
  shoulders: "shoulders",
  quadriceps: "quads",
  hamstrings: "hamstrings",
  glutes: "glutes",
  biceps: "biceps",
  triceps: "triceps",
  calves: "calves",
  abdominals: "abs",
};

/**
 * Compound lifts also train other muscles. Like recent volume research, a set counts in full for
 * its main muscle and as half a set for the muscles it trains secondarily ("fractional" counting).
 */
const COMPOUND =
  /press|bench|dip|push up|row|pull ?up|chin ?up|pulldown|squat|deadlift|lunge|split squat|leg press|hip thrust|step up|good morning/i;
const SECONDARY: Partial<Record<Group, Group[]>> = {
  chest: ["triceps", "shoulders"],
  shoulders: ["triceps"],
  back: ["biceps"],
  quads: ["glutes"],
  hamstrings: ["glutes"],
  glutes: ["hamstrings"],
};

/** Sets an exercise contributes to each muscle group. */
export function setsFor(name: string, sets: number) {
  const e = findExercise(name);
  const main = e ? PRIMARY[e.muscle] : undefined;
  const out: Partial<Record<Group, number>> = {};
  if (!main) return out;
  out[main] = sets;
  if (COMPOUND.test(name))
    for (const g of SECONDARY[main] ?? []) out[g] = (out[g] ?? 0) + sets / 2;
  return out;
}

export type VolumeLevel = "none" | "low" | "moderate" | "in_range" | "high";

/**
 * Weekly hard sets per muscle (schoenfeld2017volume, pelland2026): more sets give more growth with
 * diminishing returns. Arcwell's practical target is 10–20 per muscle; above 20 each extra set adds
 * less while costing more recovery, so it's flagged for a second look (the research found no hard
 * ceiling, so we don't call it harmful).
 */
export const WEEKLY_SETS = { low: 5, range: [10, 20] as const };

export function volumeLevel(sets: number): VolumeLevel {
  if (sets <= 0) return "none";
  if (sets < WEEKLY_SETS.low) return "low";
  if (sets < WEEKLY_SETS.range[0]) return "moderate";
  if (sets <= WEEKLY_SETS.range[1]) return "in_range";
  return "high";
}

export const LEVEL_TEXT: Record<VolumeLevel, string> = {
  none: "Not trained",
  low: "Low",
  moderate: "Moderate",
  in_range: "In range",
  high: "High",
};

/**
 * Arcwell's practical guide, not a research threshold: past about 10 hard sets for one muscle in a
 * session, spread the rest over another day. Splitting weekly sets across days doesn't cost growth
 * (schoenfeld2019frequency) and helps strength (pelland2026).
 */
export const SESSION_SET_CAP = 10;

type DayLike = { name: string; exercises: { name: string; sets: number }[] };

/** Weekly sets per group, given how many times each day runs per week (usually once). */
export function weeklyVolume(days: DayLike[], timesPerWeek: number[] = []) {
  const total: Record<Group, number> = Object.fromEntries(
    GROUPS.map((g) => [g.key, 0]),
  ) as Record<Group, number>;
  days.forEach((d, i) => {
    const times = timesPerWeek[i] ?? 1;
    for (const ex of d.exercises) {
      const s = setsFor(ex.name, ex.sets);
      for (const [g, n] of Object.entries(s))
        total[g as Group] += (n as number) * times;
    }
  });
  return total;
}

export type VolumeIssue = {
  group: Group;
  label: string;
  sets: number;
  kind: "missing" | "low" | "high" | "session";
  day?: string;
  text: string;
};

/** Plain warnings for a program: junk volume, a muscle left out, or too much in one session. */
export function volumeIssues(days: DayLike[], timesPerWeek: number[] = []) {
  const weekly = weeklyVolume(days, timesPerWeek);
  const issues: VolumeIssue[] = [];
  for (const g of GROUPS) {
    const n = weekly[g.key];
    if (n > WEEKLY_SETS.range[1])
      issues.push({
        group: g.key,
        label: g.label,
        sets: n,
        kind: "high",
        text: `${g.label}: ${setsWord(n)} a week. Above about 20, each extra set adds less and costs more recovery. Check it's intended.`,
      });
    else if (n === 0 && g.key !== "abs" && g.key !== "calves")
      issues.push({
        group: g.key,
        label: g.label,
        sets: 0,
        kind: "missing",
        text: `${g.label}: no sets this week.`,
      });
    else if (n > 0 && n < WEEKLY_SETS.low)
      issues.push({
        group: g.key,
        label: g.label,
        sets: n,
        kind: "low",
        text: `${g.label}: ${setsWord(n)} a week. That still builds muscle; more weekly sets usually build more.`,
      });
  }
  for (const d of days) {
    const day = weeklyVolume([d]);
    for (const g of GROUPS)
      if (day[g.key] > SESSION_SET_CAP)
        issues.push({
          group: g.key,
          label: g.label,
          sets: day[g.key],
          kind: "session",
          day: d.name,
          text: `${d.name}: ${fmt(day[g.key])} ${g.label.toLowerCase()} sets in one session. Past about 10, move some to another day.`,
        });
  }
  return issues;
}

export const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(1);
const setsWord = (n: number) => `${fmt(n)} set${n === 1 ? "" : "s"}`;

// ---------- Effort, reps and rest ----------

/**
 * Proximity to failure (refalo2023, robinson2024): growth rises as sets end closer to failure, but
 * going all the way gives at most a trivial extra benefit. So: 0–3 reps in reserve. Beginners learn
 * the lifts at 2–3 in reserve. RIR scale: helms2016rir.
 */
/**
 * RPE on the reps-in-reserve scale (helms2016rir): RPE 10 = no more reps possible, 9 = one left,
 * 8 = two left, and so on. Targets mirror rirFor: RPE = 10 − reps in reserve.
 */
export const RPE_OPTIONS: { value: number; label: string }[] = [
  { value: 10, label: "10 · couldn't do another rep" },
  { value: 9.5, label: "9.5 · maybe one more" },
  { value: 9, label: "9 · one more rep left" },
  { value: 8.5, label: "8.5 · one, maybe two left" },
  { value: 8, label: "8 · two reps left" },
  { value: 7.5, label: "7.5 · two or three left" },
  { value: 7, label: "7 · three reps left" },
  { value: 6, label: "6 · four or more left" },
];

/** Target RPE range for an exercise, from the reps-in-reserve rule. */
export function rpeTargetFor(
  experience: string,
  compound: boolean,
): [number, number] {
  if (experience === "new") return [7, 8];
  return compound ? [7, 9] : [8, 10];
}

export const isCompound = (name: string) => COMPOUND.test(name);

export function rirFor(experience: string, compound: boolean) {
  if (experience === "new") return "2–3";
  return compound ? "1–3" : "0–2";
}

/**
 * Loads from about 6 to 30 reps all build muscle when sets are taken close to failure; heavier
 * loads build more strength (schoenfeld2017load).
 */
export const REP_RANGES = {
  strength: { main: "3–6", accessory: "6–10" },
  hypertrophy: { main: "6–10", accessory: "10–15" },
  general: { main: "8–12", accessory: "10–15" },
} as const;

/**
 * Rest: one trial found 3 minutes beat 1 minute on big lifts (schoenfeld2016rest), so compound lifts
 * get 2–3 minutes; small isolation exercises about 1–2 minutes.
 */
export const restFor = (name: string) => (COMPOUND.test(name) ? 150 : 90);

/** Progression: add reps within the range, then add load and start again at the bottom. */
export const PROGRESSION =
  "Add a rep or two each week within the range. When every set hits the top of the range with good form, add the smallest load step and start again at the bottom.";

/**
 * Deloads: athletes commonly take a lighter week every 5 to 6 weeks (rogerson2024deload); coaches
 * agree on what a deload is for (bell2023deload). This is practice and consensus, not trial
 * evidence, and the app says so.
 */
export const DELOAD = {
  everyWeeks: [5, 6] as const,
  text: "Every 5 to 6 weeks, or when your lifts drop for a week or two, take a lighter week with about half the sets.",
  evidence:
    "What experienced athletes and coaches do; trials are still limited.",
};

// ---------- Recovery and the day's training ----------

/** Sleep need for adults (hirshkowitz2015, watson2015). */
export const SLEEP_NEED_H = [7, 9] as const;

export type DayAdjustment = {
  kind: "none" | "trim" | "halve";
  title: string;
  why: string;
  sources: string[];
};

/**
 * After a short night, especially a late bedtime, performance on the day drops on average
 * (craven2022). Arcwell suggests,
 * the athlete decides (D70): under 5 hours or a very low recovery score, halve the working sets and
 * keep the load; under 6 hours or a low score, drop one set from each exercise.
 */
export function dayAdjustment(
  sleepH: number | null,
  recoveryScore: number | null,
): DayAdjustment {
  const sources = ["craven2022"];
  if ((sleepH !== null && sleepH < 5) || (recoveryScore ?? 100) < 34)
    return {
      kind: "halve",
      title: "Halve today's sets",
      why: `You slept ${sleepH !== null ? `${fmt(sleepH)} hours` : "very little"}. After a short night, performance on average drops the next day and hard sessions feel harder. Keeping the weights but doing half the sets keeps the habit and the stimulus without adding much fatigue.`,
      sources,
    };
  if ((sleepH !== null && sleepH < 6) || (recoveryScore ?? 100) < 50)
    return {
      kind: "trim",
      title: "Drop one set from each exercise",
      why: `You slept ${sleepH !== null ? `${fmt(sleepH)} hours` : "less than usual"}. A slightly lighter session today keeps quality high; the rest of the week stays as planned.`,
      sources,
    };
  return {
    kind: "none",
    title: "Train as planned",
    why: "You're recovered enough for the planned session.",
    sources: [],
  };
}

/** Apply an accepted adjustment to one day's exercises (only that day; D70). */
export function adjustSets<T extends { sets: number }>(
  exercises: T[],
  kind: DayAdjustment["kind"],
): T[] {
  if (kind === "none") return exercises;
  return exercises.map((e) => ({
    ...e,
    sets:
      kind === "halve"
        ? Math.max(1, Math.ceil(e.sets / 2))
        : Math.max(1, e.sets - 1),
  }));
}

// ---------- Nutrition ----------

/**
 * Protein: gains level off around 1.6 g/kg a day on average, with up to about 2.2 g/kg for those
 * wanting the most (morton2018); 1.4–2.0 g/kg suits most people who exercise, more while dieting
 * (jager2017). Arcwell uses 1.8 g/kg, or 2.0 while losing fat.
 * Arcwell's own choice (not from these papers): with a BMI of 30 or more, use a reference weight
 * (BMI 25 at the person's height) so the target isn't inflated by body fat.
 */
export function proteinTarget(
  weightKg: number,
  heightCm: number,
  goal: string,
) {
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  const reference = bmi >= 30 ? 25 * h * h : weightKg;
  const perKg = goal.startsWith("lose") || goal.startsWith("Lose") ? 2.0 : 1.8;
  return {
    grams: Math.round((reference * perKg) / 5) * 5,
    perKg,
    usedReference: bmi >= 30,
    referenceKg: Math.round(reference),
  };
}

/** Fat loss of about 0.5–1% of bodyweight a week keeps more muscle than faster loss (helms2014, garthe2011). */
export const LOSS_RATE = [0.005, 0.01] as const;
/** Muscle gain: about 0.25–0.5% of bodyweight a week, slower for advanced lifters (iraki2019). */
export const GAIN_RATE_WEEK = [0.0025, 0.005] as const;

/** Fibre at least 25 g a day (efsa2010fibre), with 25–29 g linked to better health (reynolds2019). Water about 2 L (women) or 2.5 L (men) a day in total, counting food (efsa2010water). */
export const FIBRE_G = [25, 29] as const;
export const WATER_L = { female: 2.0, male: 2.5 } as const;

/** Calorie targets use the Mifflin–St Jeor equation for resting energy (mifflin1990). */
export const ENERGY_EQUATION = "mifflin1990";

/**
 * Nudge a generated program into the evidence range: add a set to exercises for muscles below the
 * weekly minimum and take sets off muscles above 20, within the time the athlete has. Exercises keep
 * between 2 and 5 working sets.
 */
export function balanceVolume<
  D extends { name: string; exercises: { name: string; sets: number }[] },
>(
  days: D[],
  opts: { min: number; minutes: number; timesPerWeek?: number[] },
): D[] {
  const out = days.map((d) => ({
    ...d,
    exercises: d.exercises.map((e) => ({ ...e })),
  }));
  const times = opts.timesPerWeek ?? [];
  const maxSessionSets = Math.floor(opts.minutes / 2.5);
  const primaryOf = (name: string) => {
    const e = findExercise(name);
    return e ? PRIMARY[e.muscle] : undefined;
  };
  const stuck = new Set<Group>();
  for (let i = 0; i < 80; i++) {
    const weekly = weeklyVolume(out, times);
    const over = GROUPS.find(
      (g) => !stuck.has(g.key) && weekly[g.key] > WEEKLY_SETS.range[1],
    );
    if (over) {
      const ex = out
        .flatMap((d) => d.exercises)
        .filter((e) => primaryOf(e.name) === over.key && e.sets > 2)
        .sort((a, b) => b.sets - a.sets)[0];
      if (ex) ex.sets -= 1;
      else stuck.add(over.key);
      continue;
    }
    const under = GROUPS.find(
      (g) =>
        !stuck.has(g.key) &&
        g.key !== "abs" &&
        g.key !== "calves" &&
        weekly[g.key] > 0 &&
        weekly[g.key] < opts.min,
    );
    if (!under) break;
    let added = false;
    for (const d of out) {
      const total = d.exercises.reduce((s, e) => s + e.sets, 0);
      if (total >= maxSessionSets) continue;
      const ex = d.exercises.find(
        (e) => primaryOf(e.name) === under.key && e.sets < 5,
      );
      if (ex && weeklyVolume([d])[under.key] < SESSION_SET_CAP) {
        ex.sets += 1;
        added = true;
        break;
      }
    }
    // A muscle that can't go higher (sessions full, exercises at 5 sets) is left as it is.
    if (!added) stuck.add(under.key);
  }
  return out;
}

/** How many times each program day runs in a week, from the rest days (rotation as weekSchedule). */
export function timesPerWeek(dayCount: number, restDays: number[]) {
  const counts = Array.from({ length: dayCount }, () => 0);
  let k = 0;
  for (let d = 0; d < 7; d++) {
    if (restDays.includes(d) || dayCount === 0) continue;
    counts[k % dayCount] += 1;
    k++;
  }
  return counts;
}

/** Weekly minimum the generator aims for, by goal and experience. */
export const weeklyMin = (goal: string, experience: string) =>
  experience === "new"
    ? 6
    : goal === "build_muscle" ||
        goal === "recomposition" ||
        goal === "get_stronger"
      ? 10
      : 6;
