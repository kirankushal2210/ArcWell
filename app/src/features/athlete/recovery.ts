// Recovery model (D60): Sleep, Recovery and Strain for one day, plus stress, the health monitor, the
// sleep planner and suggested protocols. Every number has a source, shown to the athlete:
//   1. a connected device (Health Connect): sleep stages, HRV, resting heart rate…
//   2. else this morning's check-in (a Hooper-style wellness scale) and the sleep they logged
//   3. else their onboarding answers.
// Strain comes from training load (session RPE: effort × minutes) plus steps.
// SAMPLE BUILD: Health Connect needs a development build, so a connected device is simulated with
// steady, plausible numbers. Formulas are rules, not medical advice, and never AI.

import { dateKey, shiftDate } from "./foods";

export type DeviceBrand =
  "whoop" | "fitbit" | "oura" | "garmin" | "samsung" | "pixel" | "other";

export const DEVICE_LABEL: Record<DeviceBrand, string> = {
  whoop: "WHOOP",
  fitbit: "Fitbit",
  oura: "Oura Ring",
  garmin: "Garmin",
  samsung: "Samsung Galaxy Watch",
  pixel: "Pixel Watch",
  other: "Another watch or ring",
};

export type DeviceLink = { brand: DeviceBrand; connectedAt: string };

/** Morning check-in (1–5 each; higher is better except soreness and stress). */
export type WellnessLog = {
  date: string;
  sleepH: number;
  /** Minutes after midnight; bedtimes before midnight are negative (−60 = 11 pm). */
  bed: number;
  wake: number;
  quality: number;
  soreness: number;
  energy: number;
  stress: number;
  mood: number;
  /** Last night's habits, for insights: "caffeine", "alcohol", "screens", "late_meal". */
  habits: string[];
};

/** Something done outside a logged workout: a walk, a match, yoga. */
export type DayActivity = {
  id: string;
  date: string;
  name: string;
  minutes: number;
  /** 1 Easy … 5 All out, like the workout summary. */
  effort: number;
  /** Minutes after midnight. */
  start: number;
};

export type RecoveryStore = {
  device?: DeviceLink;
  logs: WellnessLog[];
  activities: DayActivity[];
  /** Protocols done, as "date:protocolId". */
  done: string[];
};

export const emptyRecovery = (): RecoveryStore => ({
  logs: [],
  activities: [],
  done: [],
});

/** One night and day as a device reports it (Health Connect records, summarised). */
export type DeviceDay = {
  sleepMin: number;
  inBedMin: number;
  bed: number;
  wake: number;
  stages: { awake: number; light: number; deep: number; rem: number };
  rhr: number;
  hrv: number;
  resp: number;
  spo2: number;
  /** Difference from the usual skin temperature, °C. */
  skin: number;
  steps: number;
  /** Average stress, 0–3. */
  stress: number;
};

// ---------- Simulated device (sample build only) ----------

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};
const wobble = (date: string, key: string, spread: number) =>
  (hash(`${date}:${key}`) - 0.5) * 2 * spread;

export function simulatedDay(date: string, target: number): DeviceDay {
  const sleepMin = Math.round((target - 0.6 + wobble(date, "s", 0.9)) * 60);
  const awake = Math.round(25 + wobble(date, "a", 12));
  const deep = Math.round(sleepMin * (0.19 + wobble(date, "d", 0.04)));
  const rem = Math.round(sleepMin * (0.22 + wobble(date, "r", 0.04)));
  const bed = Math.round(-45 + wobble(date, "b", 40));
  return {
    sleepMin,
    inBedMin: sleepMin + awake,
    bed,
    wake: bed + sleepMin + awake,
    stages: { awake, light: sleepMin - deep - rem, deep, rem },
    rhr: Math.round(58 + wobble(date, "h", 4)),
    hrv: Math.round(62 + wobble(date, "v", 14)),
    resp: Math.round((15.2 + wobble(date, "p", 0.8)) * 10) / 10,
    spo2: Math.round((96.5 + wobble(date, "o", 1.2)) * 10) / 10,
    skin: Math.round(wobble(date, "t", 0.5) * 10) / 10,
    steps: Math.round(7500 + wobble(date, "st", 3500)),
    stress: Math.round((1.3 + wobble(date, "x", 0.9)) * 10) / 10,
  };
}

// ---------- Helpers ----------

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const sd = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};
const scale5 = (v: number) => ((clamp(v, 1, 5) - 1) / 4) * 100;

/** "10:35 pm" from minutes after midnight (negative = the evening before). */
export const clockOf = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};
/** "7:14" for 434 minutes. */
export const hm = (min: number) =>
  `${Math.floor(Math.max(0, min) / 60)}:${String(Math.round(Math.max(0, min) % 60)).padStart(2, "0")}`;

/** Workout effort (1–5) to a 0–10 RPE for session load. */
const RPE = [6, 3, 5, 7, 8.5, 10];

export type Source = "device" | "check-in" | "answers";
export type Zone = "green" | "yellow" | "red";
export const ZONE_LABEL: Record<Zone, string> = {
  green: "Ready to push",
  yellow: "Train steady",
  red: "Take it easy",
};

export type Baseline = {
  sleepTargetH: number;
  bed: number;
  wake: number;
  /** 1–5 from onboarding or the coach's record. */
  quality: number;
  energy: number;
  stress: number;
  soreness: number;
};

/** What a day needs from the rest of the app: workouts logged that day and the plan. */
export type DayInputs = {
  store: RecoveryStore;
  baseline: Baseline;
  /** Workouts: date key, minutes, effort 1–5 (if rated), name, start minute. */
  workouts: {
    date: string;
    minutes: number;
    effort?: number;
    name: string;
    start: number;
  }[];
  restDays: number[];
};

export type StrainItem = {
  name: string;
  minutes: number;
  strain: number;
  start: number;
  kind: "workout" | "activity";
};

export type Day = {
  date: string;
  source: Source;
  device?: DeviceDay;
  log?: WellnessLog;
  sleep: {
    minutes: number;
    neededMin: number;
    performance: number;
    consistency: number;
    /** Efficiency with a device, else how well they said they slept, 0–100. */
    quality: number;
    bed: number;
    wake: number;
    debtMin: number;
  };
  recovery: {
    score: number;
    zone: Zone;
    contributors: {
      label: string;
      value: string;
      note: string;
      good: boolean;
    }[];
  };
  strain: {
    score: number;
    target: [number, number];
    items: StrainItem[];
    steps?: number;
    load: number;
  };
  stress: { value: number; label: "Low" | "Medium" | "High" };
};

const strainOf = (load: number) =>
  Math.round(21 * (1 - Math.exp(-load / 700)) * 10) / 10;

function strainFor(inp: DayInputs, date: string, dev?: DeviceDay) {
  const items: (Omit<StrainItem, "strain"> & { load: number })[] = [
    ...inp.workouts
      .filter((w) => w.date === date)
      .map((w) => ({
        name: w.name,
        minutes: w.minutes,
        start: w.start,
        load: RPE[w.effort ?? 0] * w.minutes,
        kind: "workout" as const,
      })),
    ...inp.store.activities
      .filter((a) => a.date === date)
      .map((a) => ({
        name: a.name,
        minutes: a.minutes,
        start: a.start,
        load: RPE[a.effort] * a.minutes,
        kind: "activity" as const,
      })),
  ];
  const stepLoad = dev ? dev.steps * 0.02 : 0;
  const load = items.reduce((n, i) => n + i.load, 0) + stepLoad;
  return {
    load,
    score: strainOf(load),
    steps: dev?.steps,
    items: items
      .sort((a, b) => a.start - b.start)
      .map(({ load: l, ...i }) => ({ ...i, strain: strainOf(l) })),
  };
}

function nightOf(inp: DayInputs, date: string) {
  const dev = inp.store.device
    ? simulatedDay(date, inp.baseline.sleepTargetH)
    : undefined;
  const log = inp.store.logs.find((l) => l.date === date);
  if (dev)
    return {
      minutes: dev.sleepMin,
      bed: dev.bed,
      wake: dev.wake,
      quality: Math.round((dev.sleepMin / dev.inBedMin) * 100),
      dev,
      log,
    };
  if (log)
    return {
      minutes: Math.round(log.sleepH * 60),
      bed: log.bed,
      wake: log.wake,
      quality: scale5(log.quality),
      log,
    };
  return null;
}

/** Everything for one day. Pure: the same inputs always give the same numbers. */
export function dayFor(inp: DayInputs, date: string): Day {
  const b = inp.baseline;
  const night = nightOf(inp, date);
  const dev = night?.dev;
  const log = night?.log;
  const source: Source = dev ? "device" : log ? "check-in" : "answers";
  const targetMin = b.sleepTargetH * 60;

  // Sleep needed: the target, more after a hard day, plus half the debt of the last three nights.
  const yesterday = strainFor(inp, shiftDate(date, -1), undefined).score;
  let debtMin = 0;
  for (let k = 1; k <= 3; k++) {
    const n = nightOf(inp, shiftDate(date, -k));
    if (n) debtMin += Math.max(0, targetMin - n.minutes);
  }
  debtMin = Math.min(120, debtMin);
  const neededMin =
    Math.round(
      (targetMin +
        (yesterday > 14 ? 30 : yesterday > 10 ? 15 : 0) +
        debtMin / 2) /
        5,
    ) * 5;

  const minutes = night?.minutes ?? Math.round(targetMin * 0.95);
  const bed = night?.bed ?? b.bed;
  const wake = night?.wake ?? b.wake;
  const quality = night?.quality ?? scale5(b.quality);

  // Consistency: how far bed and wake times strayed over the last four nights.
  const past = [0, 1, 2, 3]
    .map((k) => nightOf(inp, shiftDate(date, -k)))
    .filter((n): n is NonNullable<typeof n> => !!n);
  const consistency =
    past.length > 1
      ? Math.round(
          clamp(
            100 -
              (sd(past.map((n) => n.bed)) + sd(past.map((n) => n.wake))) / 2,
            0,
            100,
          ),
        )
      : 80;
  const sufficiency = clamp((minutes / neededMin) * 100, 0, 100);
  const performance = Math.round(
    sufficiency * 0.7 + consistency * 0.15 + quality * 0.15,
  );

  // Recovery.
  let score: number;
  const contributors: Day["recovery"]["contributors"] = [];
  if (dev) {
    const prior = Array.from({ length: 30 }, (_, i) =>
      simulatedDay(shiftDate(date, -(i + 1)), b.sleepTargetH),
    );
    const hrvBase = mean(prior.map((d) => d.hrv));
    const rhrBase = mean(prior.map((d) => d.rhr));
    const hrvDelta = (dev.hrv - hrvBase) / hrvBase;
    const rhrDelta = (rhrBase - dev.rhr) / rhrBase;
    score = clamp(
      Math.round(
        58 + 110 * hrvDelta + 160 * rhrDelta + 0.35 * (performance - 75),
      ),
      1,
      99,
    );
    contributors.push(
      {
        label: "Heart rate variability",
        value: `${dev.hrv} ms`,
        note: `usually ${Math.round(hrvBase)} ms`,
        good: dev.hrv >= hrvBase,
      },
      {
        label: "Resting heart rate",
        value: `${dev.rhr} bpm`,
        note: `usually ${Math.round(rhrBase)} bpm`,
        good: dev.rhr <= rhrBase,
      },
      {
        label: "Sleep performance",
        value: `${performance}%`,
        note: `${hm(minutes)} of ${hm(neededMin)} needed`,
        good: performance >= 70,
      },
      {
        label: "Breathing rate",
        value: `${dev.resp} rpm`,
        note: "while asleep",
        good: true,
      },
    );
  } else {
    const w = log ?? {
      quality: b.quality,
      soreness: b.soreness,
      energy: b.energy,
      stress: b.stress,
      mood: 3,
    };
    const wellness = mean([
      scale5(w.quality),
      scale5(6 - w.soreness),
      scale5(w.energy),
      scale5(6 - w.stress),
      scale5(w.mood),
    ]);
    score = clamp(Math.round(wellness * 0.6 + performance * 0.4), 1, 99);
    const word = (v: number, good: string, bad: string) =>
      v >= 4 ? good : v <= 2 ? bad : "Okay";
    contributors.push(
      {
        label: "Sleep performance",
        value: `${performance}%`,
        note: `${hm(minutes)} of ${hm(neededMin)} needed`,
        good: performance >= 70,
      },
      {
        label: "Soreness",
        value: word(6 - w.soreness, "Fresh", "Very sore"),
        note: `${w.soreness} of 5`,
        good: w.soreness <= 2,
      },
      {
        label: "Energy",
        value: word(w.energy, "Good", "Low"),
        note: `${w.energy} of 5`,
        good: w.energy >= 3,
      },
      {
        label: "Stress",
        value: word(6 - w.stress, "Calm", "High"),
        note: `${w.stress} of 5`,
        good: w.stress <= 3,
      },
      {
        label: "Mood",
        value: word(w.mood, "Good", "Low"),
        note: `${w.mood} of 5`,
        good: w.mood >= 3,
      },
    );
  }
  const zone: Zone = score >= 67 ? "green" : score >= 34 ? "yellow" : "red";

  const s = strainFor(inp, date, dev);
  const [y, m, d] = date.split("-").map(Number);
  const weekday = (new Date(y, m - 1, d).getDay() + 6) % 7;
  const rest = inp.restDays.includes(weekday);
  const target: [number, number] = rest
    ? [5, 9]
    : zone === "green"
      ? [14, 18]
      : zone === "yellow"
        ? [10, 14]
        : [6, 10];

  const stressValue = dev
    ? dev.stress
    : Math.round(((log?.stress ?? b.stress) - 1) * 0.75 * 10) / 10;

  return {
    date,
    source,
    device: dev,
    log,
    sleep: {
      minutes,
      neededMin,
      performance,
      consistency,
      quality: Math.round(quality),
      bed,
      wake,
      debtMin,
    },
    recovery: { score, zone, contributors },
    strain: {
      score: s.score,
      target,
      items: s.items,
      steps: s.steps,
      load: s.load,
    },
    stress: {
      value: stressValue,
      label: stressValue < 1 ? "Low" : stressValue < 2 ? "Medium" : "High",
    },
  };
}

/** The last n days ending at `date`, oldest first. */
export const daysBack = (inp: DayInputs, date: string, n: number) =>
  Array.from({ length: n }, (_, i) => dayFor(inp, shiftDate(date, i - n + 1)));

// ---------- Health monitor ----------

export function healthMetrics(inp: DayInputs, date: string) {
  if (!inp.store.device) return null;
  const today = simulatedDay(date, inp.baseline.sleepTargetH);
  const prior = Array.from({ length: 30 }, (_, i) =>
    simulatedDay(shiftDate(date, -(i + 1)), inp.baseline.sleepTargetH),
  );
  const metric = (
    label: string,
    unit: string,
    pick: (d: DeviceDay) => number,
    digits = 0,
  ) => {
    const xs = prior.map(pick);
    const m = mean(xs);
    const band = Math.max(
      sd(xs) * 1.5,
      Math.abs(m) * 0.03 + (digits ? 0.2 : 1),
    );
    const v = pick(today);
    const r = (x: number) => (digits ? Math.round(x * 10) / 10 : Math.round(x));
    return {
      label,
      unit,
      value: r(v),
      low: r(m - band),
      high: r(m + band),
      inRange: v >= m - band && v <= m + band,
    };
  };
  return [
    metric("Resting heart rate", "bpm", (d) => d.rhr),
    metric("Heart rate variability", "ms", (d) => d.hrv),
    metric("Breathing rate", "rpm", (d) => d.resp, 1),
    metric("Blood oxygen", "%", (d) => d.spo2, 1),
    metric("Skin temperature", "°C vs usual", (d) => d.skin, 1),
  ];
}

// ---------- Sleep planner ----------

export const PLANNER_MODES = [
  { key: "peak", label: "Peak", share: 1 },
  { key: "perform", label: "Perform", share: 0.85 },
  { key: "getby", label: "Get by", share: 0.7 },
] as const;
export type PlannerMode = (typeof PLANNER_MODES)[number]["key"];

/** Tonight: sleep needed after today's strain and the current debt, and when to be in bed. */
export function plannerFor(day: Day, baseline: Baseline, mode: PlannerMode) {
  const extra = day.strain.score > 14 ? 30 : day.strain.score > 10 ? 15 : 0;
  const debt = Math.max(0, day.sleep.neededMin - day.sleep.minutes);
  const need =
    Math.round(
      (baseline.sleepTargetH * 60 + extra + Math.min(60, debt) / 2) / 5,
    ) * 5;
  const share = PLANNER_MODES.find((m) => m.key === mode)?.share ?? 1;
  const sleepMin = Math.round((need * share) / 5) * 5;
  // About 15 minutes to fall asleep.
  const bed = baseline.wake - sleepMin - 15;
  return { need, sleepMin, bed, wake: baseline.wake };
}

// ---------- Protocols ----------

export type Protocol = {
  id: string;
  title: string;
  category:
    | "Sleep"
    | "Stress"
    | "Active recovery"
    | "Heat and cold"
    | "Training"
    | "Food";
  minutes: number;
  summary: string;
  steps: string[];
  why: string;
  caution?: string;
  /** Has a guided timer in the app. */
  guided?: "breathing" | "nsdr";
};

export const PROTOCOLS: Protocol[] = [
  {
    id: "wind-down",
    title: "30-minute wind-down",
    category: "Sleep",
    minutes: 30,
    summary: "Dim lights, screens away, the same calm routine every night.",
    steps: [
      "Set a reminder 30 minutes before your bedtime.",
      "Dim the lights and put the phone outside reach.",
      "Something calm: a shower, reading, stretching gently.",
      "Keep the room cool, dark and quiet.",
    ],
    why: "Sleep is the best-supported recovery habit; a regular routine helps you fall asleep faster.",
  },
  {
    id: "wake-time",
    title: "Same wake time, every day",
    category: "Sleep",
    minutes: 0,
    summary: "Wake within 30 minutes of the same time, weekends included.",
    steps: [
      "Pick a wake time you can keep seven days a week.",
      "Get daylight in the first hour after waking.",
      "If you slept badly, keep the wake time and go to bed earlier tonight.",
    ],
    why: "A steady wake time anchors your body clock and raises sleep consistency.",
  },
  {
    id: "caffeine",
    title: "Caffeine cut-off",
    category: "Sleep",
    minutes: 0,
    summary: "No coffee, tea or pre-workout within 8 hours of bed.",
    steps: [
      "Work out your cut-off: bedtime minus 8 hours.",
      "Switch to water, buttermilk or herbal tea after it.",
    ],
    why: "Caffeine lasts for hours and makes sleep lighter, even when you still fall asleep.",
  },
  {
    id: "nap",
    title: "20-minute nap",
    category: "Sleep",
    minutes: 20,
    summary: "A short early-afternoon nap to pay back sleep debt.",
    steps: [
      "Nap before 3 pm.",
      "Set an alarm for 20 to 25 minutes so you don't wake groggy.",
    ],
    why: "Short naps help when you're behind on sleep without hurting tonight's sleep.",
  },
  {
    id: "box-breathing",
    title: "Box breathing",
    category: "Stress",
    minutes: 2,
    summary: "Breathe in 4, hold 4, out 4, hold 4. Two minutes.",
    steps: [
      "Sit or lie down and relax your shoulders.",
      "In through the nose for 4, hold for 4.",
      "Out slowly for 4, hold for 4. Repeat.",
    ],
    why: "Slow breathing calms the nervous system and is a quick way to bring stress down.",
    guided: "breathing",
  },
  {
    id: "nsdr",
    title: "10-minute rest (NSDR)",
    category: "Stress",
    minutes: 10,
    summary: "Lie still, eyes closed, and scan your body slowly.",
    steps: [
      "Lie on your back somewhere quiet.",
      "Breathe slowly; move your attention from feet to head.",
      "If your mind wanders, come back to the breath.",
    ],
    why: "Deep rest without sleep, like yoga nidra, helps you feel restored on low-sleep days.",
    guided: "nsdr",
  },
  {
    id: "walk",
    title: "Easy walk outside",
    category: "Active recovery",
    minutes: 20,
    summary: "A relaxed walk you could hold a conversation on.",
    steps: [
      "Walk 20 to 30 minutes at an easy pace.",
      "Outside and in daylight if you can.",
    ],
    why: "Light movement keeps you moving on recovery days without adding much strain.",
  },
  {
    id: "easy-cardio",
    title: "Easy cardio day",
    category: "Active recovery",
    minutes: 30,
    summary: "Swap hard training for 30 minutes of easy cycling or walking.",
    steps: [
      "Keep it easy: you can breathe through your nose.",
      "Skip intervals and heavy lifting today.",
    ],
    why: "When recovery is low, lighter training lets you come back stronger tomorrow.",
  },
  {
    id: "deload",
    title: "Deload week",
    category: "Training",
    minutes: 0,
    summary: "One lighter week: same exercises, about half the sets.",
    steps: [
      "Keep your exercises and weights.",
      "Cut the sets by about half and stop well short of failure.",
      "Use it after several low-recovery days or a hard block.",
    ],
    why: "Planned lighter weeks let fatigue clear while you keep your strength.",
  },
  {
    id: "protein",
    title: "Protein at every meal",
    category: "Food",
    minutes: 0,
    summary:
      "A palm-sized protein portion at each meal, spread through the day.",
    steps: [
      "Paneer, dal, eggs, chicken, curd or a whey shake.",
      "Include one after training.",
    ],
    why: "Protein spread across meals supports muscle repair after training.",
  },
  {
    id: "sauna",
    title: "Sauna or hot bath",
    category: "Heat and cold",
    minutes: 15,
    summary: "Optional: 10 to 20 minutes of heat on easy days.",
    steps: ["Hydrate before and after.", "Leave if you feel dizzy."],
    why: "Heat can help you relax and feel recovered; treat it as an extra, not a must.",
    caution:
      "Skip it if you're unwell, and talk to a doctor if you have heart or blood pressure problems.",
  },
  {
    id: "cold",
    title: "Cold shower or plunge",
    category: "Heat and cold",
    minutes: 3,
    summary: "Optional: 2 to 5 minutes of cold water to ease soreness.",
    steps: [
      "Start with a cold shower before trying a plunge.",
      "2 to 5 minutes is enough.",
    ],
    why: "Cold water can ease soreness after hard sessions.",
    caution:
      "Avoid it in the hours after strength or muscle-building workouts: it may blunt muscle growth.",
  },
];

export const protocolById = (id: string) => PROTOCOLS.find((p) => p.id === id);

/** Two or three suggestions for the day, from its numbers. */
export function suggestFor(day: Day, trainedStrength: boolean): Protocol[] {
  const ids: string[] = [];
  if (day.recovery.zone === "red") ids.push("easy-cardio", "nsdr");
  if (day.stress.label === "High") ids.push("box-breathing");
  if (day.sleep.debtMin >= 60) ids.push("nap");
  if (day.sleep.consistency < 70) ids.push("wake-time");
  if (day.sleep.performance < 80) ids.push("wind-down");
  if (day.recovery.zone === "yellow") ids.push("walk");
  if (day.recovery.zone === "green") ids.push("protein");
  if (!trainedStrength && day.recovery.zone !== "red") ids.push("sauna");
  ids.push("caffeine");
  return Array.from(new Set(ids))
    .slice(0, 3)
    .map((id) => protocolById(id))
    .filter((p): p is Protocol => !!p);
}

/** A short morning note written by rules (never AI), so coached athletes see it too. */
export function outlookFor(
  day: Day,
  planned: string | null,
  bedtime: number,
): { title: string; lines: string[] } {
  const r = day.recovery;
  const [lo, hi] = day.strain.target;
  const lines = [
    r.zone === "green"
      ? `Recovery is ${r.score}%: a good day to train hard.`
      : r.zone === "yellow"
        ? `Recovery is ${r.score}%: train as planned, but don't chase records.`
        : `Recovery is ${r.score}%: keep today light and prioritise sleep.`,
    planned
      ? `${planned} is on today. Aim for a strain of ${lo} to ${hi}.`
      : `Rest day: aim for a strain of ${lo} to ${hi} with easy movement.`,
    day.sleep.debtMin >= 30
      ? `You're ${hm(day.sleep.debtMin)} behind on sleep. In bed by ${clockOf(bedtime)} tonight.`
      : `In bed by ${clockOf(bedtime)} tonight to stay on track.`,
  ];
  return { title: ZONE_LABEL[r.zone], lines };
}

/** Today's date key, for screens (kept out of render bodies by callers). */
export const todayDate = () => dateKey(new Date());
