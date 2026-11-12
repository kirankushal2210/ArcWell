// Athlete records added for the side menu (D9): physique entries, account settings and consents,
// transformation photo approvals (F9) and how coaching ended (D21, D39, D42). Sample build: these
// live on the client record on the phone; with the backend each becomes its own RLS-protected table.
import type { PhotoPose } from "@/features/coach/checkins";
import type { PlannedExercise } from "@/features/coach/plans";

const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD in the phone's own time zone (toISOString would use UTC). */
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** ISO date (YYYY-MM-DD) for today, on the phone's clock. */
export const isoToday = () => isoDate(new Date());

export const shortDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

/** "Today", "Yesterday" or "12 Nov". */
export const dayText = (iso: string) => {
  const t = isoToday();
  if (iso === t) return "Today";
  const y = isoDate(new Date(Date.now() - 864e5));
  if (iso === y) return "Yesterday";
  return shortDay(iso);
};

// ---------- Physique (PH-01 to PH-04, free for everyone: D5, D9) ----------

export type WeighIn = { id: string; date: string; kg: number };

/** The same body parts as the weekly check-in, so a coached client's entries show here too. */
export const MEASURES = [
  { key: "Waist", label: "Waist" },
  { key: "Chest", label: "Chest" },
  { key: "Hips", label: "Hips" },
  { key: "Arm", label: "Arm (right)" },
  { key: "Thigh", label: "Thigh (right)" },
] as const;
export type MeasureKey = (typeof MEASURES)[number]["key"];
export type MeasureEntry = {
  date: string;
  values: Partial<Record<MeasureKey, number>>;
};

export type ProgressPhoto = {
  id: string;
  date: string;
  pose: PhotoPose;
  uri: string;
};

// ---------- Account settings and consents (AC-02, AC-08, N-06) ----------

export type AthleteSettings = {
  notify: {
    messages: boolean;
    checkIns: boolean;
    plan: boolean;
    workout: boolean;
  };
  length: "cm" | "ftin";
  portions: "indian" | "grams";
  /** Optional photo consent (D12): off by default, never blocks a check-in. */
  photos: boolean;
  /** AI features (D8, D20): turning off hides AI at once; billing is managed in Play. */
  ai: boolean;
  /** One export at a time (X-09). */
  export?: { status: "preparing" | "failed"; requestedAt: string };
  /** When "Share my history from before I joined" last changed (AC-10, D37). */
  historyChangedAt?: string;
  /** Arcwell Plus through Google Play (F8). Sample build: set on the phone; later from RevenueCat. */
  sub?: Subscription;
  /** Reminders (FE-5). Delivered by Expo Notifications once the backend schedules them. */
  reminders?: Reminders;
  /** First-run tips already dismissed. */
  tipsSeen?: string[];
  /** Today's accepted tailoring (D70): applies to this date and workout only. */
  dayPlan?: DayPlan;
  /** The date a recovery suggestion was declined, so it isn't asked again that day. */
  dayDeclined?: string;
  /** AI questions asked today, for the daily cap (X-01). */
  aiUsage?: { date: string; n: number };
};

export type DayPlan = {
  date: string;
  dayId: string;
  exercises: PlannedExercise[];
  reason: string;
};

/** Daily cap on AI questions (SPEC: paid AI users have a daily request cap). */
export const AI_DAILY_LIMIT = 30;

export type Reminders = {
  workout: { on: boolean; at: number };
  weighIn: { on: boolean; at: number };
  meals: boolean;
  windDown: boolean;
};

export const defaultReminders = (): Reminders => ({
  workout: { on: true, at: 18 * 60 },
  weighIn: { on: false, at: 7 * 60 },
  meals: false,
  windDown: true,
});

export type Subscription = {
  status: "trial" | "active" | "grace" | "cancelled" | "expired";
  plan: "monthly" | "yearly";
  /** YYYY-MM-DD the trial or subscription started. */
  startedAt: string;
};

export const TRIAL_DAYS = 7;
export const REMIND_DAY = 5;

const addDays = (iso: string, n: number) =>
  isoDate(new Date(new Date(`${iso}T12:00:00`).getTime() + n * 864e5));

/** Where the subscription stands today, with the dates the screens need. */
export function subscriptionInfo(sub: Subscription | undefined) {
  const s: Subscription = sub ?? {
    status: "trial",
    plan: "yearly",
    startedAt: isoToday(),
  };
  const day =
    Math.floor(
      (new Date(`${isoToday()}T12:00:00`).getTime() -
        new Date(`${s.startedAt}T12:00:00`).getTime()) /
        864e5,
    ) + 1;
  const trialEnds = addDays(s.startedAt, TRIAL_DAYS);
  const renewsOn =
    s.status === "trial"
      ? trialEnds
      : addDays(trialEnds, s.plan === "yearly" ? 365 : 30);
  return {
    ...s,
    day,
    trialDaysLeft: Math.max(0, TRIAL_DAYS - day + 1),
    trialEnds,
    renewsOn,
    graceEnds: addDays(isoToday(), 16),
  };
}

export const defaultSettings = (): AthleteSettings => ({
  notify: { messages: true, checkIns: true, plan: true, workout: true },
  length: "cm",
  portions: "indian",
  photos: false,
  ai: true,
});

// ---------- Transformation photos (F9): the athlete owns them ----------

export type TransformUse = "profile" | "instagram" | "whatsapp";
export const USES: { key: TransformUse; label: string }[] = [
  { key: "profile", label: "My Arcwell profile" },
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp status" },
];
export const usesText = (u: TransformUse[]) =>
  u
    .map((k) =>
      k === "profile"
        ? "Arcwell profile"
        : (USES.find((x) => x.key === k)?.label ?? k),
    )
    .join(", ");

export type Transformation = {
  id: string;
  coachName: string;
  requestedAt: string;
  before: { uri?: string; label: string };
  after: { uri?: string; label: string };
  caption: string;
  message: string;
  uses: TransformUse[];
  status: "waiting" | "approved" | "declined" | "withdrawn";
  decidedAt?: string;
  withdrawnAt?: string;
  /** The athlete's choices; the blur is burned into anything exported (F9-04). */
  blurFace: boolean;
  showName: boolean;
  crop: "full" | "waist";
  /** Coach side: shown on the coach's Arcwell profile (only while approved). */
  onProfile: boolean;
};

// ---------- How coaching ended (L-03, K-29) ----------

export type CoachingEnd = {
  coachName: string;
  /** left: the athlete left (L-02); completed: the coach completed them (K-30); closed: the coach deleted their account (K-28). */
  reason: "left" | "completed" | "closed";
  at: string;
};

// ---------- Physique helpers ----------

type PhysiqueSource = {
  weights: number[];
  weighIns?: WeighIn[];
  measurements: { label: string; start: number; now: number }[];
  measureLog?: MeasureEntry[];
};

/**
 * Dated weigh-ins, oldest first. Older sample records only have bare numbers: those are spread
 * a week apart back from today and can't be edited.
 */
export function weighInsOf(
  c: PhysiqueSource,
): (WeighIn & { editable: boolean })[] {
  if (c.weighIns?.length) {
    const dated = [...c.weighIns].sort((a, b) => a.date.localeCompare(b.date));
    // Weigh-ins logged before dates existed come first, a week apart.
    const older = c.weights.slice(
      0,
      Math.max(0, c.weights.length - dated.length),
    );
    const first = new Date(`${dated[0].date}T12:00:00`).getTime();
    return [
      ...older.map((kg, i) => ({
        id: `old${i}`,
        kg,
        editable: false,
        date: isoDate(new Date(first - (older.length - i) * 7 * 864e5)),
      })),
      ...dated.map((w) => ({ ...w, editable: true })),
    ];
  }
  const n = c.weights.length;
  return c.weights.map((kg, i) => ({
    id: `old${i}`,
    kg,
    editable: false,
    date: isoDate(new Date(Date.now() - (n - 1 - i) * 7 * 864e5)),
  }));
}

/** Entries from the last `days` days (all when `days` is 0). */
export const within = <T extends { date: string }>(list: T[], days: number) =>
  days
    ? list.filter(
        (e) =>
          Date.now() - new Date(`${e.date}T12:00:00`).getTime() <= days * 864e5,
      )
    : list;

/** Average of the last 7 days' weigh-ins, or the latest one. */
export function weekAverage(list: { date: string; kg: number }[]) {
  const week = within(list, 7);
  const use = week.length ? week : list.slice(-1);
  return use.length ? use.reduce((s, w) => s + w.kg, 0) / use.length : null;
}

/** One body part's history, oldest first: the start value, then dated entries. */
export function measureSeries(c: PhysiqueSource, key: MeasureKey) {
  const base = c.measurements.find((m) => m.label === key);
  const dated = (c.measureLog ?? [])
    .filter((e) => e.values[key] !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, value: e.values[key] as number }));
  const start = base?.start ?? dated[0]?.value;
  const now = dated.length ? dated[dated.length - 1].value : base?.now;
  const values = [
    ...(base ? [base.start] : []),
    ...(base && !dated.length && base.now !== base.start ? [base.now] : []),
    ...dated.map((d) => d.value),
  ];
  return { start, now, values };
}
