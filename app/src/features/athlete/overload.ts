// Progressive overload (D85): for each lift trained in the last two weeks, did the top set beat the
// time before? Adding weight and adding reps both count as progress: in trained lifters they gave
// similar gains over 8 weeks (plotkin2022). No 1RM estimate: the top set is compared directly.
// Three sessions in a row without progress is a stall.
import { countsVolume, type Session } from "./training";
import { typeOf } from "./library";

export const OVERLOAD_DAYS = 14;

type TopSet = { kg: number; reps: number };

export type OverloadStatus = "up" | "same" | "down" | "stalled" | "new";

export type OverloadRow = {
  name: string;
  top: TopSet;
  status: OverloadStatus;
  /** What changed against the session before, e.g. "+2.5 kg" or "+1 rep". */
  change: string | null;
  /** Sessions with this lift in the window. */
  sessions: number;
};

/** The heaviest working set; reps break ties. Bodyweight sets count as 0 kg. */
export function topSet(
  sets: Session["exercises"][number]["sets"],
): TopSet | null {
  let best: TopSet | null = null;
  for (const s of sets) {
    if (s.warmup || !s.reps) continue;
    const t = { kg: s.kg ?? 0, reps: s.reps };
    if (!best || t.kg > best.kg || (t.kg === best.kg && t.reps > best.reps))
      best = t;
  }
  return best;
}

/** Compare two top sets: 1 better, 0 same, -1 worse. More weight wins; at the same weight, more reps. */
export function compareTop(now: TopSet, before: TopSet): -1 | 0 | 1 {
  if (now.kg !== before.kg) return now.kg > before.kg ? 1 : -1;
  if (now.reps !== before.reps) return now.reps > before.reps ? 1 : -1;
  return 0;
}

const round = (n: number) => Math.round(n * 100) / 100;

function changeText(now: TopSet, before: TopSet): string | null {
  if (now.kg !== before.kg) {
    const d = round(now.kg - before.kg);
    return `${d > 0 ? "+" : ""}${d} kg`;
  }
  if (now.reps !== before.reps) {
    const d = now.reps - before.reps;
    return `${d > 0 ? "+" : ""}${d} rep${Math.abs(d) === 1 ? "" : "s"}`;
  }
  return null;
}

/**
 * One row per weight-and-reps lift done in the last `days`, newest-trained first. `sessions` is the
 * athlete's history, newest first.
 */
export function overload(
  sessions: Session[],
  now: Date = new Date(),
  days = OVERLOAD_DAYS,
): OverloadRow[] {
  const since = now.getTime() - days * 86_400_000;
  const seen = new Map<string, TopSet[]>();
  const recent = new Map<string, number>();
  for (const s of sessions) {
    const inWindow = new Date(s.at).getTime() >= since;
    for (const e of s.exercises) {
      if (e.skipped || !countsVolume(typeOf(e.name))) continue;
      const t = topSet(e.sets);
      if (!t) continue;
      if (!seen.has(e.name)) {
        if (!inWindow) continue; // only lifts trained in the window get a row
        seen.set(e.name, []);
      }
      seen.get(e.name)!.push(t);
      if (inWindow) recent.set(e.name, (recent.get(e.name) ?? 0) + 1);
    }
  }
  const rows: OverloadRow[] = [];
  for (const [name, tops] of seen) {
    const [latest, prev, older] = tops;
    let status: OverloadStatus = "new";
    if (prev) {
      const c = compareTop(latest, prev);
      status = c > 0 ? "up" : c < 0 ? "down" : "same";
      // Stalled: no better than two sessions ago, and the last step wasn't progress either.
      if (status !== "up" && older && compareTop(prev, older) <= 0)
        status = "stalled";
    }
    rows.push({
      name,
      top: latest,
      status,
      change: prev ? changeText(latest, prev) : null,
      sessions: recent.get(name) ?? 0,
    });
  }
  return rows;
}

/** The next step for a lift, in a few words. */
export const NEXT_STEP: Record<OverloadStatus, string> = {
  up: "Keep going",
  same: "Aim for one more rep",
  down: "Normal on a hard day",
  stalled: "One more rep, or a lighter week",
  new: "First log",
};
