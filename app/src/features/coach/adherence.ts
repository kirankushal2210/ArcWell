// Adherence the coach sees (K-01, K-02): the share of planned workouts the client actually logged
// over the last four weeks, or since the program started if that's sooner. Only workouts that should
// already have happened count as planned, so a plan started yesterday isn't marked down.
import type { Client } from "./sampleData";

const DAY_MS = 24 * 60 * 60 * 1000;
export const ADHERENCE_WEEKS = 4;

/**
 * Percent of planned workouts done (0–100), from logged sessions. Null when there's no plan to
 * measure against, the client is paused, or no planned workout has come round yet.
 */
export function adherenceFromLogs(
  c: Pick<Client, "program" | "programStart" | "status">,
  sessions: { at: string }[],
  now = new Date(),
): number | null {
  const perWeek = c.program?.days.length ?? 0;
  if (!perWeek || c.status === "paused") return null;
  const end = now.getTime();
  const started = c.programStart ? new Date(c.programStart) : null;
  const programDay =
    started && !Number.isNaN(started.getTime())
      ? new Date(
          started.getFullYear(),
          started.getMonth(),
          started.getDate(),
        ).getTime()
      : -Infinity;
  const from = Math.max(end - ADHERENCE_WEEKS * 7 * DAY_MS, programDay);
  const planned = Math.floor((perWeek * (end - from)) / (7 * DAY_MS));
  if (planned < 1) return null;
  const done = sessions.filter((s) => {
    const t = new Date(s.at).getTime();
    return t >= from && t <= end;
  }).length;
  return Math.round(Math.min(1, done / planned) * 100);
}

/** What to show: adherence from logs, else the stored figure (sample clients with no plan yet). */
export const adherenceOf = (
  c: Pick<Client, "program" | "programStart" | "status" | "adherence">,
  sessions: { at: string }[],
  now = new Date(),
) => adherenceFromLogs(c, sessions, now) ?? c.adherence;
