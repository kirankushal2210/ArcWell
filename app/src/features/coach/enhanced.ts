// Enhanced athletes (D64): opt-in tracking for competitive bodybuilders. It records what the
// client reports taking, health markers and side effects, and flags markers outside usual ranges.
// It never suggests compounds, doses or protocols. Ranges are general adult reference points for
// a heads-up only; the client's lab ranges and doctor come first.

export type Phase = "off" | "on" | "cruise" | "pct";
export const PHASE_LABEL: Record<Phase, string> = {
  off: "Off cycle",
  on: "On cycle",
  cruise: "Cruise",
  pct: "PCT",
};

/** One thing the client reports taking, written as they report it. */
export type CycleItem = {
  id: string;
  compound: string;
  amount: string;
  frequency: string;
  /** YYYY-MM-DD. */
  startedAt: string;
  endsAt?: string;
  note?: string;
};

export type MarkerKind =
  | "systolic"
  | "diastolic"
  | "rhr"
  | "haematocrit"
  | "ldl"
  | "hdl"
  | "alt"
  | "ast"
  | "egfr"
  | "oestradiol"
  | "testosterone";

type Range = {
  label: string;
  unit: string;
  /** Group for the screen: vitals are logged often, bloodwork with each lab test. */
  group: "vitals" | "blood";
  /** Heads-up and alert thresholds; "high" markers alert above, "low" ones below. */
  dir: "high" | "low" | "none";
  watch?: number;
  alert?: number;
};

export const MARKERS: Record<MarkerKind, Range> = {
  systolic: {
    label: "Blood pressure, top",
    unit: "mmHg",
    group: "vitals",
    dir: "high",
    watch: 130,
    alert: 140,
  },
  diastolic: {
    label: "Blood pressure, bottom",
    unit: "mmHg",
    group: "vitals",
    dir: "high",
    watch: 80,
    alert: 90,
  },
  rhr: {
    label: "Resting heart rate",
    unit: "bpm",
    group: "vitals",
    dir: "high",
    watch: 90,
    alert: 100,
  },
  haematocrit: {
    label: "Haematocrit",
    unit: "%",
    group: "blood",
    dir: "high",
    watch: 50,
    alert: 54,
  },
  ldl: {
    label: "LDL cholesterol",
    unit: "mg/dL",
    group: "blood",
    dir: "high",
    watch: 130,
    alert: 160,
  },
  hdl: {
    label: "HDL cholesterol",
    unit: "mg/dL",
    group: "blood",
    dir: "low",
    watch: 40,
    alert: 30,
  },
  alt: {
    label: "ALT (liver)",
    unit: "U/L",
    group: "blood",
    dir: "high",
    watch: 45,
    alert: 120,
  },
  ast: {
    label: "AST (liver)",
    unit: "U/L",
    group: "blood",
    dir: "high",
    watch: 40,
    alert: 120,
  },
  egfr: {
    label: "eGFR (kidneys)",
    unit: "mL/min",
    group: "blood",
    dir: "low",
    watch: 90,
    alert: 60,
  },
  oestradiol: {
    label: "Oestradiol",
    unit: "pg/mL",
    group: "blood",
    dir: "high",
    watch: 40,
    alert: 80,
  },
  testosterone: {
    label: "Testosterone, total",
    unit: "ng/dL",
    group: "blood",
    dir: "none",
  },
};
export const MARKER_KINDS = Object.keys(MARKERS) as MarkerKind[];

export type Marker = {
  id: string;
  /** YYYY-MM-DD. */
  date: string;
  kind: MarkerKind;
  value: number;
};

export type SideEffect = {
  id: string;
  date: string;
  text: string;
  /** 1 mild, 2 moderate, 3 severe. */
  severity: 1 | 2 | 3;
};

export type Enhanced = {
  /** The coach asked to start tracking (ISO). */
  requestedAt?: string;
  /** The client's own consent (DPDP sensitive data); nothing is tracked without it. */
  consentAt?: string;
  declinedAt?: string;
  phase: Phase;
  /** YYYY-MM-DD the current phase started. */
  phaseSince?: string;
  items: CycleItem[];
  markers: Marker[];
  sideEffects: SideEffect[];
};

export const emptyEnhanced = (): Enhanced => ({
  phase: "off",
  items: [],
  markers: [],
  sideEffects: [],
});

export type Level = "ok" | "watch" | "alert";
export const LEVEL_LABEL: Record<Level, string> = {
  ok: "In range",
  watch: "Keep an eye on",
  alert: "Talk to a doctor",
};

export function levelOf(kind: MarkerKind, value: number): Level {
  const r = MARKERS[kind];
  if (r.dir === "none" || r.watch === undefined || r.alert === undefined)
    return "ok";
  if (r.dir === "high")
    return value >= r.alert ? "alert" : value > r.watch ? "watch" : "ok";
  return value < r.alert ? "alert" : value < r.watch ? "watch" : "ok";
}

/** The latest reading per marker, newest first within each group. */
export function latest(e: Enhanced) {
  const by = new Map<MarkerKind, Marker[]>();
  for (const m of [...e.markers].sort((a, b) => a.date.localeCompare(b.date))) {
    by.set(m.kind, [...(by.get(m.kind) ?? []), m]);
  }
  return MARKER_KINDS.filter((k) => by.has(k)).map((k) => {
    const list = by.get(k) ?? [];
    const now = list[list.length - 1];
    return {
      kind: k,
      now,
      prev: list[list.length - 2],
      history: list,
      level: levelOf(k, now.value),
    };
  });
}

/** Markers needing attention, worst first. */
export const flags = (e: Enhanced) =>
  latest(e)
    .filter((x) => x.level !== "ok")
    .sort((a, b) => (a.level === b.level ? 0 : a.level === "alert" ? -1 : 1));

let seq = 0;
export const enhId = (p = "e") =>
  `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

const ago = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Sample record for the competitive client (Karan): consented, on cycle, BP creeping up. */
export function sampleEnhanced(): Enhanced {
  return {
    requestedAt: new Date(Date.now() - 50 * 864e5).toISOString(),
    consentAt: new Date(Date.now() - 49 * 864e5).toISOString(),
    phase: "on",
    phaseSince: ago(42),
    items: [
      {
        id: "ci1",
        compound: "As reported by Karan (prescribed TRT)",
        amount: "As prescribed",
        frequency: "Weekly",
        startedAt: ago(42),
        note: "Under their endocrinologist; bloodwork every 6 weeks",
      },
    ],
    markers: [
      { id: "m1", date: ago(45), kind: "systolic", value: 124 },
      { id: "m2", date: ago(45), kind: "diastolic", value: 78 },
      { id: "m3", date: ago(14), kind: "systolic", value: 131 },
      { id: "m4", date: ago(14), kind: "diastolic", value: 82 },
      { id: "m5", date: ago(2), kind: "systolic", value: 136 },
      { id: "m6", date: ago(2), kind: "diastolic", value: 86 },
      { id: "m7", date: ago(2), kind: "rhr", value: 72 },
      { id: "m8", date: ago(45), kind: "haematocrit", value: 47.5 },
      { id: "m9", date: ago(5), kind: "haematocrit", value: 51.2 },
      { id: "m10", date: ago(5), kind: "ldl", value: 142 },
      { id: "m11", date: ago(5), kind: "hdl", value: 36 },
      { id: "m12", date: ago(5), kind: "alt", value: 38 },
      { id: "m13", date: ago(5), kind: "egfr", value: 96 },
    ],
    sideEffects: [
      { id: "se1", date: ago(9), text: "Some acne on shoulders", severity: 1 },
    ],
  };
}

export const DOCTOR_NOTE =
  "Work with a doctor. Get bloodwork before, during and after, and act on what it shows. Arcwell records what's reported; it doesn't advise on compounds or doses.";
