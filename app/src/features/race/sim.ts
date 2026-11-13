// Race simulator logic (D76): the segments for a session, splits from saved timestamps (a locked
// phone or a killed app loses nothing), undo, results and predictions. Pure functions.
import type { RaceSim, SimSplit } from "@/features/athlete/athleteData";

import { FULL_RACE, type Segment, type StationKey, stationOf } from "./data";

export type SimKind = "full" | "half" | "race";
export type LiveStep = {
  kind: "run" | "station" | "roxzone";
  n: number;
  station?: StationKey;
  label: string;
};

/** Full race: 8 runs + 8 stations. Half sim: the first 4 of each. Roxzone adds a step before and after each station. */
export function stepsFor(kind: SimKind, roxzone: boolean): LiveStep[] {
  const base: Segment[] = kind === "half" ? FULL_RACE.slice(0, 8) : FULL_RACE;
  const out: LiveStep[] = [];
  for (const s of base) {
    if (s.kind === "run")
      out.push({ kind: "run", n: s.n, label: `Run ${s.n} · 1 km` });
    else {
      const st = stationOf(s.station);
      if (roxzone) out.push({ kind: "roxzone", n: s.n, label: "Roxzone in" });
      out.push({
        kind: "station",
        n: s.n,
        station: s.station,
        label: `${st.label} · ${st.metres ? `${st.metres.toLocaleString("en-IN")} m` : `${st.reps} reps`}`,
      });
      if (roxzone) out.push({ kind: "roxzone", n: s.n, label: "Roxzone out" });
    }
  }
  return out;
}

export type Live = {
  id: string;
  kind: SimKind;
  roxzone: boolean;
  division: string;
  startedAt: number;
  /** One timestamp per completed step. */
  marks: number[];
  substitutes: Partial<Record<StationKey, string>>;
};

export const elapsedSec = (live: Live, now: number) =>
  Math.max(0, Math.round((now - live.startedAt) / 1000));

/** Seconds spent in each completed step. */
export function stepTimes(live: Live) {
  return live.marks.map((t, i) =>
    Math.round((t - (i ? live.marks[i - 1] : live.startedAt)) / 1000),
  );
}

export const split = (live: Live, now: number): Live => ({
  ...live,
  marks: [...live.marks, now],
});
export const undo = (live: Live): Live => ({
  ...live,
  marks: live.marks.slice(0, -1),
});

/** Turn a finished live session into a saved sim. */
export function toSim(live: Live, date: string): RaceSim {
  const steps = stepsFor(live.kind, live.roxzone);
  const times = stepTimes(live);
  const splits: SimSplit[] = times.map((seconds, i) => ({
    i,
    kind: steps[i].kind,
    station: steps[i].station,
    seconds,
    substitute: steps[i].station
      ? live.substitutes[steps[i].station!]
      : undefined,
  }));
  return {
    id: live.id,
    date,
    kind: live.kind,
    division: live.division as RaceSim["division"],
    totalSec: times.reduce((a, b) => a + b, 0),
    splits,
  };
}

export const fmtTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

/** Runs, stations and Roxzone totals for the summary bar. */
export function breakdown(sim: RaceSim) {
  const sum = (k: SimSplit["kind"]) =>
    sim.splits.filter((x) => x.kind === k).reduce((a, b) => a + b.seconds, 0);
  return { run: sum("run"), station: sum("station"), roxzone: sum("roxzone") };
}

/** Best time per station across sims, ignoring substitutes (never compared with real stations). */
export function stationBests(sims: RaceSim[]) {
  const best: Partial<Record<StationKey, number>> = {};
  for (const s of sims)
    for (const x of s.splits)
      if (x.kind === "station" && x.station && !x.substitute)
        best[x.station] = Math.min(best[x.station] ?? Infinity, x.seconds);
  return best;
}

/**
 * Predicted full-race time from the athlete's own recent splits: average run × 8, best or average
 * station times, plus Roxzone (measured, or about 5% of the total when never timed). A range, never
 * a promise.
 */
export function predict(sims: RaceSim[]): [number, number] | null {
  const recent = [...sims]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const runs = recent.flatMap((s) =>
    s.splits.filter((x) => x.kind === "run").map((x) => x.seconds),
  );
  if (!runs.length) return null;
  const run = (runs.reduce((a, b) => a + b, 0) / runs.length) * 8;
  const stations = Object.values(stationBests(recent));
  if (stations.length < 4) return null;
  const avgStation =
    stations.reduce((a, b) => a + (b ?? 0), 0) / stations.length;
  const stationTotal = avgStation * 8;
  const rox = recent.flatMap((s) =>
    s.splits.filter((x) => x.kind === "roxzone").map((x) => x.seconds),
  );
  const base = run + stationTotal;
  const total =
    base +
    (rox.length
      ? (rox.reduce((a, b) => a + b, 0) / rox.length) * 16
      : base * 0.05);
  return [Math.round(total * 0.97), Math.round(total * 1.05)];
}

/** Run pace per km across the runs of a sim: shows how much the pace fades. */
export const runPaces = (sim: RaceSim) =>
  sim.splits.filter((x) => x.kind === "run").map((x) => x.seconds);
