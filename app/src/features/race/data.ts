// HYROX race data (D76): season data, never logic. Check against the official rulebook each season;
// 25/26 singles loads taken from the HYROX 25/26 Singles Rulebook (sleds include the sled).
// "HYROX" is a trademark: we only describe training for the race (no logo, no implied partnership).

export type StationKey =
  | "skierg"
  | "sled_push"
  | "sled_pull"
  | "burpee_broad_jumps"
  | "row"
  | "farmers_carry"
  | "sandbag_lunges"
  | "wall_balls";

export type Segment =
  | { kind: "run"; n: number; metres: number }
  | {
      kind: "station";
      n: number;
      station: StationKey;
      metres?: number;
      reps?: number;
    };

export const SEASON = "25/26";

export const STATIONS: {
  key: StationKey;
  label: string;
  metres?: number;
  reps?: number;
  exercise: string;
}[] = [
  { key: "skierg", label: "SkiErg", metres: 1000, exercise: "Ski erg" },
  { key: "sled_push", label: "Sled push", metres: 50, exercise: "Sled push" },
  { key: "sled_pull", label: "Sled pull", metres: 50, exercise: "Sled pull" },
  {
    key: "burpee_broad_jumps",
    label: "Burpee broad jumps",
    metres: 80,
    exercise: "Burpee broad jumps",
  },
  { key: "row", label: "Row", metres: 1000, exercise: "Rowing machine" },
  {
    key: "farmers_carry",
    label: "Farmers carry",
    metres: 200,
    exercise: "Farmers walk",
  },
  {
    key: "sandbag_lunges",
    label: "Sandbag lunges",
    metres: 100,
    exercise: "Sandbag walking lunge",
  },
  { key: "wall_balls", label: "Wall balls", reps: 100, exercise: "Wall ball" },
];
export const stationOf = (k: StationKey) => STATIONS.find((s) => s.key === k)!;

/** The full race: 8 × (1 km run + station), always in this order. */
export const FULL_RACE: Segment[] = STATIONS.flatMap((s, i) => [
  { kind: "run" as const, n: i + 1, metres: 1000 },
  {
    kind: "station" as const,
    n: i + 1,
    station: s.key,
    metres: s.metres,
    reps: s.reps,
  },
]);

export type DivisionKey = "open_women" | "open_men" | "pro_women" | "pro_men";
export type Load = { kg: number; perHand?: boolean; heightM?: number };

export const DIVISIONS: {
  key: DivisionKey;
  label: string;
  loads: Partial<Record<StationKey, Load>>;
}[] = [
  {
    key: "open_women",
    label: "Women Open",
    loads: {
      sled_push: { kg: 102 },
      sled_pull: { kg: 78 },
      farmers_carry: { kg: 16, perHand: true },
      sandbag_lunges: { kg: 10 },
      wall_balls: { kg: 4, heightM: 2.7 },
    },
  },
  {
    key: "pro_women",
    label: "Women Pro",
    loads: {
      sled_push: { kg: 152 },
      sled_pull: { kg: 103 },
      farmers_carry: { kg: 24, perHand: true },
      sandbag_lunges: { kg: 20 },
      wall_balls: { kg: 6, heightM: 2.7 },
    },
  },
  {
    key: "open_men",
    label: "Men Open",
    loads: {
      sled_push: { kg: 152 },
      sled_pull: { kg: 103 },
      farmers_carry: { kg: 24, perHand: true },
      sandbag_lunges: { kg: 20 },
      wall_balls: { kg: 6, heightM: 3.0 },
    },
  },
  {
    key: "pro_men",
    label: "Men Pro",
    loads: {
      sled_push: { kg: 202 },
      sled_pull: { kg: 153 },
      farmers_carry: { kg: 32, perHand: true },
      sandbag_lunges: { kg: 30 },
      wall_balls: { kg: 9, heightM: 3.0 },
    },
  },
];
export const divisionOf = (k: DivisionKey) =>
  DIVISIONS.find((d) => d.key === k)!;

export const loadText = (l?: Load) =>
  !l
    ? ""
    : `${l.perHand ? "2 × " : ""}${l.kg} kg${l.heightM ? ` to ${l.heightM.toFixed(2)} m` : ""}`;

export const segmentLabel = (s: Segment) =>
  s.kind === "run"
    ? `Run ${s.n}`
    : `${stationOf(s.station).label}${s.metres ? ` ${s.metres.toLocaleString("en-IN")} m` : ` ${s.reps} reps`}`;
