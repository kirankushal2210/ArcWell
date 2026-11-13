// Daily habits (D74, D77, D80): the catalog and its rules. Pure functions only, so the Today selector,
// the library and the tests share one source. Every habit carries an evidence level and the sources
// behind it (D69); nothing here names the book or its author (D75). Times are minutes after
// midnight; a bedtime after midnight is stored past 1440.

/** Opt-in areas (D78). An off module leaves no trace anywhere. */
export type ModuleKey =
  | "morning"
  | "cardio_fitness"
  | "running"
  | "daily_movement"
  | "sleep_light"
  | "calm"
  | "food_habits"
  | "mobility"
  | "focus";

export const MODULES: {
  key: ModuleKey;
  label: string;
  sub: string;
}[] = [
  {
    key: "morning",
    label: "Morning start",
    sub: "Daylight, water, moving and coffee after waking, with your day's rhythm",
  },
  {
    key: "cardio_fitness",
    label: "Cardio fitness",
    sub: "VO2 max: an estimate, interval sessions around your lifting, retests",
  },
  {
    key: "running",
    label: "Running",
    sub: "Runs in your cardio plan. Off: bike, rower and other machines only",
  },
  {
    key: "daily_movement",
    label: "Daily steps",
    sub: "Steps and a short walk after meals",
  },
  {
    key: "sleep_light",
    label: "Sleep and energy habits",
    sub: "Morning daylight, wind-down, caffeine cut-off, steady wake time",
  },
  {
    key: "calm",
    label: "Calm and breathing",
    sub: "Breathing, rest and short meditation on Today",
  },
  {
    key: "food_habits",
    label: "Food habits",
    sub: "Fermented foods and fatty fish",
  },
  { key: "mobility", label: "Mobility", sub: "10 minutes, a few times a week" },
  { key: "focus", label: "Focus", sub: "A focus timer and if-then plans" },
];

/** On by default (D78, D80): Morning start for everyone; cardio for general fitness and race goals. */
export function defaultModules(goal?: string): ModuleKey[] {
  const out: ModuleKey[] = ["morning"];
  if (goal === "general_fitness" || goal === "hyrox") out.push("cardio_fitness");
  if (goal === "hyrox") out.push("running");
  return out;
}

export type Area = "sleep_light" | "movement" | "calm" | "nutrition" | "focus";
export const AREA_LABEL: Record<Area, string> = {
  sleep_light: "Sleep and light",
  movement: "Movement",
  calm: "Calm",
  nutrition: "Food",
  focus: "Focus",
};

export type Evidence = "strong" | "moderate" | "early" | "practice";
export const EVIDENCE_LABEL: Record<Evidence, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  early: "Early evidence",
  practice: "Practice, not trial-tested",
};

export type Tracker = "check" | "minutes" | "count" | "clock" | "timer" | "amount";

/** A window relative to the athlete's day: anchor plus offsets in minutes. */
export type Window = {
  anchor: "wake" | "bed" | "anytime";
  start: number;
  end: number;
};

export type SafetyKey = "cold";

export type Habit = {
  id: string;
  module: ModuleKey;
  area: Area;
  name: string;
  summary: string;
  steps: string[];
  tracker: Tracker;
  target?: number;
  unit?: string;
  window: Window;
  evidence: Evidence;
  sources: string[];
  /** Asked once before the habit can be added (Cold: heart, pregnancy, cold reactions). */
  safety?: SafetyKey;
  /** Hidden for this many minutes after a strength session (cold blunts muscle gain). */
  afterStrengthGapMin?: number;
};

const H = 60;

export const HABITS: Habit[] = [
  {
    id: "morning-daylight",
    module: "sleep_light",
    area: "sleep_light",
    name: "Morning daylight",
    summary: "Daylight in your eyes soon after waking sets your body clock.",
    steps: [
      "Go outside, facing the sky. Glass windows block most of it.",
      "Sunglasses off; your normal glasses are fine.",
      "Never look straight at the sun.",
    ],
    tracker: "minutes",
    target: 10,
    unit: "min",
    window: { anchor: "wake", start: 0, end: H },
    evidence: "strong",
    sources: ["leproult2001", "gooley2011"],
  },
  {
    id: "afternoon-daylight",
    module: "sleep_light",
    area: "sleep_light",
    name: "Afternoon daylight",
    summary: "A few minutes outside in the late afternoon.",
    steps: ["Step outside for 5 to 30 minutes before sunset.", "No phone needed."],
    tracker: "minutes",
    target: 10,
    unit: "min",
    window: { anchor: "wake", start: 6 * H, end: 10 * H },
    evidence: "early",
    sources: [],
  },
  {
    id: "wind-down",
    module: "sleep_light",
    area: "sleep_light",
    name: "Wind-down",
    summary: "Lights low and screens away in the last hour before bed.",
    steps: [
      "Use lamps instead of ceiling lights.",
      "Put the phone outside the bedroom.",
      "Keep the room cool, around 18 to 20 °C.",
    ],
    tracker: "check",
    window: { anchor: "bed", start: -H, end: 0 },
    evidence: "strong",
    sources: ["gooley2011", "chang2015"],
  },
  {
    id: "same-wake",
    module: "sleep_light",
    area: "sleep_light",
    name: "Same wake time",
    summary: "Waking within 30 minutes of your usual time, weekends too.",
    steps: ["Keep the alarm the same every day.", "After a late night, nap rather than sleep in."],
    tracker: "check",
    window: { anchor: "wake", start: 0, end: 2 * H },
    evidence: "moderate",
    sources: ["windred2024"],
  },
  {
    id: "caffeine-cutoff",
    module: "sleep_light",
    area: "sleep_light",
    name: "Caffeine cut-off",
    summary: "Last coffee or tea well before bed, so it doesn't cut into your sleep.",
    steps: [
      "Have your last caffeine by the time shown.",
      "Decaf and caffeine-free tea are fine after that.",
    ],
    tracker: "clock",
    window: { anchor: "bed", start: -10 * H, end: -8 * H },
    evidence: "strong",
    sources: ["drake2013", "gardiner2023"],
  },
  {
    id: "alcohol",
    module: "sleep_light",
    area: "sleep_light",
    name: "Alcohol and sleep",
    summary: "Alcohol in the evening makes sleep lighter and more broken.",
    steps: ["Log drinks if you have them. There's no target here."],
    tracker: "count",
    unit: "drinks",
    window: { anchor: "bed", start: -8 * H, end: 0 },
    evidence: "strong",
    sources: ["ebrahim2013"],
  },
  {
    id: "steps",
    module: "daily_movement",
    area: "movement",
    name: "Daily steps",
    summary: "More daily steps are linked with longer life, levelling off around 8,000 to 10,000.",
    steps: ["Walk calls, take the stairs, walk after meals."],
    tracker: "amount",
    target: 8000,
    unit: "steps",
    window: { anchor: "wake", start: 2 * H, end: 14 * H },
    evidence: "strong",
    sources: ["paluch2022"],
  },
  {
    id: "walk-after-meal",
    module: "daily_movement",
    area: "movement",
    name: "Walk after a meal",
    summary: "A short walk within 30 minutes of eating lowers the rise in blood sugar.",
    steps: ["5 to 15 minutes at an easy pace, soon after lunch or dinner."],
    tracker: "check",
    window: { anchor: "wake", start: 5 * H, end: 8 * H },
    evidence: "moderate",
    sources: ["buffey2022"],
  },
  {
    id: "mobility",
    module: "mobility",
    area: "movement",
    name: "Mobility, 10 minutes",
    summary: "Gentle range-of-motion work. Lifting through a full range also helps.",
    steps: [
      "Deep squat hold, hip-flexor stretch, chest opener, hamstring hinge.",
      "Slow, painless, about 10 minutes.",
    ],
    tracker: "check",
    window: { anchor: "anytime", start: 0, end: 0 },
    evidence: "practice",
    sources: ["alizadeh2023"],
  },
  {
    id: "long-exhale",
    module: "calm",
    area: "calm",
    name: "Long-exhale breathing",
    summary: "A double breath in through the nose, then a long breath out, for a few minutes.",
    steps: ["Breathe in, then a second short breath in.", "Breathe out slowly and fully.", "Repeat for 1 to 5 minutes."],
    tracker: "timer",
    target: 5,
    unit: "min",
    window: { anchor: "anytime", start: 0, end: 0 },
    evidence: "moderate",
    sources: ["balban2023"],
  },
  {
    id: "meditation",
    module: "calm",
    area: "calm",
    name: "5-minute meditation",
    summary: "Short daily meditation improved attention and mood in trials.",
    steps: ["Sit or lie down, eyes closed.", "Rest attention on your breath; when it wanders, bring it back."],
    tracker: "timer",
    target: 5,
    unit: "min",
    window: { anchor: "wake", start: 0, end: 2 * H },
    evidence: "moderate",
    sources: ["basso2019"],
  },
  {
    id: "nsdr",
    module: "calm",
    area: "calm",
    name: "10-minute rest (NSDR)",
    summary: "Lying still with slow breathing and a body scan. It doesn't replace sleep.",
    steps: ["Lie down, long slow breaths out.", "Move attention slowly through the body.", "10 to 20 minutes."],
    tracker: "timer",
    target: 10,
    unit: "min",
    window: { anchor: "wake", start: 6 * H, end: 10 * H },
    evidence: "early",
    sources: ["datta2021"],
  },
  {
    id: "cold",
    module: "calm",
    area: "calm",
    name: "Cold shower",
    summary: "Cold water for 1 to 3 minutes, as an optional extra. Kept away from lifting.",
    steps: ["Uncomfortably cold, never painful.", "1 to 3 minutes, never more than 5.", "Never with breath holds."],
    tracker: "timer",
    target: 2,
    unit: "min",
    window: { anchor: "anytime", start: 0, end: 0 },
    evidence: "early",
    sources: ["roberts2015"],
    safety: "cold",
    afterStrengthGapMin: 6 * H,
  },
  {
    id: "fermented",
    module: "food_habits",
    area: "nutrition",
    name: "Fermented foods",
    summary: "Curd, buttermilk, idli or dosa batter, kanji. One small trial found more variety in gut bacteria.",
    steps: ["2 or more small servings a day, low in sugar."],
    tracker: "count",
    target: 2,
    unit: "servings",
    window: { anchor: "wake", start: 3 * H, end: 14 * H },
    evidence: "early",
    sources: ["wastyk2021"],
  },
  {
    id: "fatty-fish",
    module: "food_habits",
    area: "nutrition",
    name: "Fatty fish",
    summary: "Fish like salmon, mackerel or sardines once or twice a week.",
    steps: ["Count servings this week. Vegetarian? This one isn't for you, and that's fine."],
    tracker: "count",
    target: 2,
    unit: "a week",
    window: { anchor: "wake", start: 5 * H, end: 14 * H },
    evidence: "moderate",
    sources: ["rimm2018"],
  },
  {
    id: "focus-block",
    module: "focus",
    area: "focus",
    name: "Focus block",
    summary: "A timed block of work with the phone in another room.",
    steps: ["Choose 25, 45, 60 or 90 minutes.", "Phone in another room.", "Short pauses help; no scrolling in them."],
    tracker: "timer",
    target: 45,
    unit: "min",
    window: { anchor: "wake", start: H, end: 12 * H },
    evidence: "early",
    sources: ["albulescu2022"],
  },
];

export const habitById = (id: string) => HABITS.find((h) => h.id === id);

/** At most five active habits; up to three to start, more after two weeks (D77). */
export const MAX_HABITS = 5;
export const START_HABITS = 3;
export function habitCap(firstHabitDate: string | undefined, today: string) {
  if (!firstHabitDate) return START_HABITS;
  const days =
    (Date.parse(`${today}T00:00:00`) - Date.parse(`${firstHabitDate}T00:00:00`)) /
    86400000;
  return days >= 14 ? MAX_HABITS : START_HABITS;
}

// ---------- The athlete's day ----------

export type Rhythm = { wake: number; bed: number };

/** Bedtime as minutes after the day's midnight, always after wake (23:00 → 1380, 00:30 → 1470). */
export function bedAfterWake(r: Rhythm) {
  let b = r.bed;
  while (b <= r.wake) b += 1440;
  while (b - r.wake > 1440) b -= 1440;
  return b;
}

/** A habit's window today, in minutes after midnight, or null for "any time". */
export function windowOf(h: Habit, r: Rhythm): [number, number] | null {
  if (h.window.anchor === "anytime") return null;
  const base = h.window.anchor === "wake" ? r.wake : bedAfterWake(r);
  return [base + h.window.start, base + h.window.end];
}

/** Is `now` (minutes after midnight) inside the habit's window? "Any time" habits always are. */
export function inWindow(h: Habit, r: Rhythm, now: number) {
  const w = windowOf(h, r);
  if (!w) return true;
  // Times after midnight but before waking belong to the previous evening.
  const t = now < r.wake - 3 * H ? now + 1440 : now;
  return t >= w[0] && t <= w[1];
}

/** Daylight target by sky: about 10 min clear, 20 some cloud, 30 overcast (practical guide). */
export type Sky = "clear" | "cloud" | "overcast";
export const DAYLIGHT_MIN: Record<Sky, number> = { clear: 10, cloud: 20, overcast: 30 };

/** Last caffeine about 9 hours before bed (caffeine 6 h before bed still cut sleep; meta-analysis). */
export const CAFFEINE_GAP_MIN = 9 * H;
export const caffeineCutoff = (r: Rhythm) => bedAfterWake(r) - CAFFEINE_GAP_MIN;

/** Cold water waits at least 6 hours after strength work (it blunts muscle gain). */
export function coldAllowed(lastStrengthEnd: number | null, now: number) {
  return lastStrengthEnd === null || now - lastStrengthEnd >= 6 * H;
}

export const clock = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

// ---------- Morning start (D80) ----------

export type MorningItem = "light" | "water" | "move" | "caffeine";
export const MORNING_ITEMS: {
  key: MorningItem;
  label: string;
  hint: string;
  optional?: boolean;
}[] = [
  { key: "light", label: "Daylight", hint: "10 min outside" },
  { key: "water", label: "Water", hint: "A glass or two" },
  { key: "move", label: "Move", hint: "A walk or your workout" },
  {
    key: "caffeine",
    label: "Coffee or tea",
    hint: "Only if you drink it",
    optional: true,
  },
];

/** Morning start shows from waking until 3 hours after. */
export const MORNING_WINDOW_MIN = 3 * H;
export const inMorning = (r: Rhythm, now: number) =>
  now >= r.wake && now <= r.wake + MORNING_WINDOW_MIN;

/**
 * The typical daily cortisol rhythm, 0–1, for drawing only (never a measurement): it climbs to a
 * peak about 30–45 minutes after waking, falls through the day, is lowest in the first part of the
 * night and starts rising again in the hours before waking.
 */
export function typicalCortisol(t: number, r: Rhythm) {
  const bed = bedAfterWake(r);
  const sinceWake = (((t - r.wake) % 1440) + 1440) % 1440;
  const peakAt = 40;
  const lowAt = bed - r.wake + 3 * H; // lowest a few hours into sleep
  const riseFrom = 1440 - 3 * H; // starts climbing ~3 h before waking
  if (sinceWake <= peakAt) return 0.62 + 0.38 * Math.sin((sinceWake / peakAt) * (Math.PI / 2));
  if (sinceWake <= lowAt) {
    const x = (sinceWake - peakAt) / (lowAt - peakAt);
    const e = Math.exp(-3);
    return 0.08 + 0.92 * ((Math.exp(-3 * x) - e) / (1 - e));
  }
  if (sinceWake < riseFrom) return 0.08 + 0.02 * ((sinceWake - lowAt) / Math.max(1, riseFrom - lowAt));
  return 0.1 + 0.52 * ((sinceWake - riseFrom) / (1440 - riseFrom));
}

/** Points for a small curve from waking to the next waking. */
export function cortisolCurve(r: Rhythm, n = 48) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = r.wake + (i / n) * 1440;
    return { t, v: typicalCortisol(t, r) };
  });
}
