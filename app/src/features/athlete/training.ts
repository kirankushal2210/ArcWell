// Workout logging model (F4, Hevy-style): a workout in progress is a list of exercises with set rows
// pre-filled from the plan or the last session; finishing turns it into a session in history.
// Warm-up sets are marked W and left out of volume (F4-03). kg only in v1 (D45). What a set records
// (kg, reps, time, distance) follows the exercise type in the library.
import { type TrainingDay, uid } from "@/features/coach/plans";

import {
  type ExerciseType,
  fieldsOf,
  muscleOf,
  type SetField,
  typeOf,
} from "./library";

export type LoggedSet = {
  id: string;
  warmup: boolean;
  /** Weight in kg; null for bodyweight or not entered yet. */
  kg: number | null;
  reps: number | null;
  /** Timed sets (planks, walks) log seconds instead of reps (TR-08). */
  seconds: number | null;
  /** Distance for runs, rides and carries. Missing on sets logged before distance existed. */
  km?: number | null;
  /** Effort on the reps-in-reserve RPE scale (6–10), optional (helms2016rir). */
  rpe?: number | null;
  done: boolean;
};

export type LoggedExercise = {
  id: string;
  name: string;
  group: string;
  /** Planned target, e.g. "3 × 8–10". */
  target: string;
  restSec: number;
  /** Decides the set columns; older saved workouts only have `timed`. */
  type?: ExerciseType;
  timed: boolean;
  bodyweight: boolean;
  note: string;
  skipped: boolean;
  /** Set when swapped during the workout; the coach sees it (F4-07). */
  swappedFrom?: string;
  sets: LoggedSet[];
};

export type ActiveWorkout = {
  dayId: string | null;
  name: string;
  startedAt: number;
  exercises: LoggedExercise[];
  /** Rest timer, shown in the workout and on the minimised bar (F4-05, F4-09). */
  rest: { endsAt: number; total: number; next: string } | null;
  /** A timed set counting down (TR-08). */
  timer?: { setId: string; endsAt: number } | null;
};

export type Session = {
  id: string;
  /** ISO date-time. */
  at: string;
  name: string;
  minutes: number;
  volume: number;
  setsDone: number;
  setsPlanned: number;
  exercises: {
    name: string;
    sets: {
      kg: number | null;
      reps: number | null;
      seconds: number | null;
      km?: number | null;
      rpe?: number | null;
      warmup: boolean;
    }[];
    note?: string;
    skipped?: boolean;
    swappedFrom?: string;
  }[];
  bests: { name: string; text: string }[];
  effort?: number;
  note?: string;
};

/** Event-handler clock; keeps Date.now() out of render (React Compiler purity rule). */
export const now = () => Date.now();

export const groupOf = muscleOf;

/** The exercise's type, from the library, or from what an older saved workout recorded. */
export const exType = (e: Pick<LoggedExercise, "name" | "type" | "timed">) =>
  e.type ?? (e.timed ? "duration" : typeOf(e.name));
export const setFields = (e: Pick<LoggedExercise, "name" | "type" | "timed">) =>
  fieldsOf(exType(e));
const isBodyweight = (name: string) => {
  const t = typeOf(name);
  return t === "bodyweight_reps" || t === "weighted_bodyweight";
};

/** Seconds for timed targets like "40 s" or "20 min"; null for rep targets. */
export function targetSeconds(reps: string): number | null {
  const m = reps.match(/^(\d+)\s*(s|sec|min)\b/);
  if (!m) return null;
  return m[2] === "min" ? Number(m[1]) * 60 : Number(m[1]);
}

/** First number in a rep target: "8–10" → 8, "10 each" → 10. */
export const targetReps = (reps: string) => {
  const m = reps.match(/\d+/);
  return m ? Number(m[0]) : null;
};

/** The athlete's last logged sets for an exercise (the Previous column). */
export function previousSets(sessions: Session[], name: string) {
  for (const s of sessions) {
    const e = s.exercises.find((x) => x.name === name);
    if (e) return e.sets.filter((x) => !x.warmup);
  }
  return [];
}

const time = (sec: number) =>
  sec >= 60 && sec % 60 === 0
    ? `${sec / 60} min`
    : sec >= 60
      ? clockTime(sec * 1000)
      : `${sec} s`;
const dist = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km * 100) / 100} km`;

/**
 * One set in words, by exercise type: "60 kg × 8", "12 reps", "+10 kg × 6", "45 s",
 * "20 kg · 45 s", "5 km · 28:30", "24 kg · 40 m". "– kg" when no weight was entered.
 */
export function setLabel(
  s: {
    kg: number | null;
    reps: number | null;
    seconds: number | null;
    km?: number | null;
  },
  name?: string,
) {
  const t: ExerciseType = name
    ? typeOf(name)
    : s.seconds !== null
      ? "duration"
      : "weight_reps";
  const reps = s.reps ?? "–";
  // A plan can time a rep exercise ("Burpee 40 s"); show the time it was logged with.
  if (s.seconds !== null && s.reps === null && !fieldsOf(t).includes("seconds"))
    return time(s.seconds);
  switch (t) {
    case "bodyweight_reps":
      return s.kg ? `${s.kg} kg × ${reps}` : `${reps} reps`;
    case "weighted_bodyweight":
      return s.kg ? `+${s.kg} kg × ${reps}` : `BW × ${reps}`;
    case "assisted_bodyweight":
      return s.kg ? `−${s.kg} kg × ${reps}` : `BW × ${reps}`;
    case "duration":
      return s.seconds !== null ? time(s.seconds) : `${reps} reps`;
    case "duration_weight":
      return `${s.kg !== null ? `${s.kg} kg` : "BW"} · ${s.seconds !== null ? time(s.seconds) : "–"}`;
    case "distance_duration":
      return (
        [
          s.km != null ? dist(s.km) : null,
          s.seconds !== null ? time(s.seconds) : null,
        ]
          .filter(Boolean)
          .join(" · ") || "–"
      );
    case "weight_distance":
      return `${s.kg !== null ? `${s.kg} kg` : "– kg"} · ${s.km != null ? dist(s.km) : "–"}`;
    default:
      return `${s.kg !== null ? `${s.kg} kg` : name && isBodyweight(name) ? "BW" : "– kg"} × ${reps}`;
  }
}

/** Default plan target for a newly added exercise, by type. */
export const defaultTarget = (name: string) => {
  const t = typeOf(name);
  return t === "distance_duration"
    ? "20 min"
    : t === "duration" || t === "duration_weight"
      ? "40 s"
      : t === "weight_distance"
        ? "40 m"
        : "10";
};

/** Volume counts lifted weight: kg × reps, including the added weight on weighted bodyweight moves. */
export const countsVolume = (t: ExerciseType) =>
  t === "weight_reps" || t === "weighted_bodyweight";

export function exerciseFrom(
  name: string,
  sets: number,
  reps: string,
  restSec: number,
  sessions: Session[],
): LoggedExercise {
  const secs = targetSeconds(reps);
  const prev = previousSets(sessions, name);
  // A plan can time an exercise the library counts in reps ("Burpee 40 s"): then it's timed.
  const libType = typeOf(name);
  const type: ExerciseType =
    secs !== null && !fieldsOf(libType).includes("seconds")
      ? "duration"
      : libType;
  const fields: SetField[] = fieldsOf(type);
  const metres = reps.match(/^(\d+)\s*m\b/);
  const plannedKm = metres ? Number(metres[1]) / 1000 : null;
  return {
    id: uid("x"),
    name,
    group: groupOf(name),
    target: `${sets} × ${reps}`,
    restSec,
    type,
    timed: fields.includes("seconds"),
    bodyweight: type === "bodyweight_reps",
    note: "",
    skipped: false,
    sets: Array.from({ length: sets }, (_, k) => {
      const p = prev[k] ?? prev[prev.length - 1];
      return {
        id: uid("s"),
        warmup: false,
        kg: fields.includes("kg") ? (p?.kg ?? null) : null,
        reps: fields.includes("reps")
          ? (prev[k]?.reps ?? targetReps(reps))
          : null,
        seconds: fields.includes("seconds")
          ? (secs ?? p?.seconds ?? null)
          : null,
        km: fields.includes("km") ? (p?.km ?? plannedKm) : null,
        done: false,
      };
    }),
  };
}

export function startFromDay(
  day: TrainingDay,
  sessions: Session[],
): ActiveWorkout {
  return {
    dayId: day.id,
    name: day.name,
    startedAt: now(),
    exercises: day.exercises.map((e) =>
      exerciseFrom(e.name, e.sets, e.reps, e.restSec, sessions),
    ),
    rest: null,
  };
}

export const emptyWorkout = (): ActiveWorkout => ({
  dayId: null,
  name: "Workout",
  startedAt: now(),
  exercises: [],
  rest: null,
});

/** Rough length of a planned day: about 45 s of work per set plus its rest. */
export const estimateMinutes = (day: TrainingDay) =>
  Math.max(
    10,
    Math.round(
      day.exercises.reduce((n, e) => n + e.sets * (45 + e.restSec), 0) / 60 / 5,
    ) * 5,
  );

export const volumeOf = (w: ActiveWorkout) =>
  w.exercises.reduce(
    (n, e) =>
      n +
      (countsVolume(exType(e)) ? 1 : 0) *
        e.sets.reduce(
          (m, s) =>
            m + (s.done && !s.warmup && s.kg && s.reps ? s.kg * s.reps : 0),
          0,
        ),
    0,
  );

/** Heaviest weight per exercise compared with every earlier session: the "new bests" (F4-12). */
function bestsOf(w: ActiveWorkout, sessions: Session[]) {
  const out: { name: string; text: string }[] = [];
  for (const e of w.exercises) {
    if (!countsVolume(exType(e))) continue;
    const done = e.sets.filter(
      (s) => s.done && !s.warmup && s.kg !== null && s.reps,
    );
    if (!done.length) continue;
    const top = done.reduce((a, b) => ((b.kg ?? 0) > (a.kg ?? 0) ? b : a));
    const before = sessions
      .flatMap((s) => s.exercises.filter((x) => x.name === e.name))
      .flatMap((x) => x.sets)
      .filter((s) => !s.warmup && s.kg !== null);
    if (!before.length) continue;
    const prevBest = Math.max(...before.map((s) => s.kg ?? 0));
    if ((top.kg ?? 0) > prevBest)
      out.push({
        name: e.name,
        text: `${top.kg} kg × ${top.reps} · up from ${prevBest} kg`,
      });
  }
  return out;
}

export function toSession(
  w: ActiveWorkout,
  sessions: Session[],
  markAll: boolean,
): Session {
  const kept = w.exercises.filter((e) => !e.skipped);
  const done = (s: LoggedSet) => s.done || markAll;
  const finished: ActiveWorkout = {
    ...w,
    exercises: kept.map((e) => ({
      ...e,
      sets: e.sets.map((s) => ({ ...s, done: done(s) })),
    })),
  };
  return {
    id: uid("w"),
    at: new Date(w.startedAt).toISOString(),
    name: w.name,
    minutes: Math.max(1, Math.round((now() - w.startedAt) / 60000)),
    volume: Math.round(volumeOf(finished)),
    setsDone: finished.exercises.reduce(
      (n, e) => n + e.sets.filter((s) => s.done && !s.warmup).length,
      0,
    ),
    setsPlanned: kept.reduce(
      (n, e) => n + e.sets.filter((s) => !s.warmup).length,
      0,
    ),
    // Skipped exercises stay in the log, flagged, so a coach can see why something changed (F4-06).
    exercises: w.exercises.map((e) => {
      const f = finished.exercises.find((x) => x.id === e.id);
      return {
        name: e.name,
        sets: f
          ? f.sets
              .filter((s) => s.done)
              .map((s) => ({
                kg: s.kg,
                reps: s.reps,
                seconds: s.seconds,
                km: s.km ?? null,
                rpe: s.rpe ?? null,
                warmup: s.warmup,
              }))
          : [],
        note: e.note || undefined,
        skipped: e.skipped || undefined,
        swappedFrom: e.swappedFrom,
      };
    }),
    bests: bestsOf(finished, sessions),
  };
}

/** Top of a rep range: "8–10" → 10, "10" → 10. */
const topReps = (target: string) => {
  const nums = (target.split(" × ")[1] ?? target).match(/\d+/g);
  return nums ? Number(nums[nums.length - 1]) : null;
};

/** Smallest sensible jump: 2 kg for dumbbell moves, 2.5 kg for barbell and machine lifts. */
const step = (name: string) =>
  /dumbbell|goblet|curl|lateral|fly/i.test(name) ? 2 : 2.5;

/**
 * Progression hint (double progression, rules only): if every working set last time reached the top
 * of the rep range, suggest the next weight; otherwise keep the weight and add a rep. Null when
 * there's nothing to compare (first time or timed).
 */
export function suggestion(
  sessions: Session[],
  e: LoggedExercise,
  /** Target RPE range for this exercise; with it, last session's effort steers the advice. */
  rpe?: [number, number],
): { text: string; kg: number | null } | null {
  if (!countsVolume(exType(e))) return null;
  const last = previousSets(sessions, e.name);
  const top = topReps(e.target);
  if (!last.length || top === null) return null;
  const kg = Math.max(...last.map((s) => s.kg ?? 0));
  const allTop = last.every((s) => (s.reps ?? 0) >= top);
  const rated = last
    .map((s) => s.rpe)
    .filter((v): v is number => typeof v === "number");
  const avgRpe = rated.length
    ? rated.reduce((a, b) => a + b, 0) / rated.length
    : null;
  const next = Math.round((kg + step(e.name)) * 4) / 4;
  if (!kg)
    return allTop
      ? {
          text: `You hit ${top} reps on every set. Try a harder version or add weight.`,
          kg: null,
        }
      : null;
  if (allTop && avgRpe !== null && rpe && avgRpe >= 9.5)
    return {
      text: `${top} reps every set last time, but close to failure (RPE ${avgRpe.toFixed(1)}). Stay at ${kg} kg and aim for RPE ${rpe[1]}.`,
      kg,
    };
  if (allTop)
    return {
      text: `Hit ${top} reps on every set last time${avgRpe !== null ? ` at RPE ${avgRpe.toFixed(1)}` : ""}. Try ${next} kg.`,
      kg: next,
    };
  // Easy: a full rep or more below the bottom of the range, so 4+ reps left on compounds.
  if (avgRpe !== null && rpe && avgRpe <= rpe[0] - 1)
    return {
      text: `Last time felt easy (RPE ${avgRpe.toFixed(1)}). Try ${next} kg.`,
      kg: next,
    };
  return {
    text: `Stay at ${kg} kg and aim for one more rep than last time${rpe ? `, around RPE ${rpe[0]}–${rpe[1]}` : ""}.`,
    kg,
  };
}

export const clockTime = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

/** Monday-based start of the week containing `d`. */
export function weekStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** Which week of the program this is ("Week 3 of 8"), counted in calendar weeks from its start. */
export function programWeek(weeks: number, start?: string) {
  const from = weekStart(start ? new Date(start) : new Date()).getTime();
  const week =
    Math.floor((weekStart(new Date()).getTime() - from) / (7 * 86400000)) + 1;
  return { week: Math.max(1, week), weeks, done: week > weeks };
}
