// HYROX race track state (D76): the goal, phase, sims and the live session.
import { isoToday, type RaceState } from "@/features/athlete/athleteData";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import {
  daysUntil,
  hybridProgram,
  phaseFor,
  simDue,
} from "@/features/science/hybrid";

import type { DivisionKey, StationKey } from "./data";
import { type Live, type SimKind, split, toSim, undo } from "./sim";

export function useRace() {
  const v = useVisibility();
  const { setAthleteSettings, startProgram } = useCoachData();
  const me = v.me;
  const r: RaceState = v.settings?.race ?? { sims: [] };
  const goal = v.race ? r.goal : undefined;
  const days = goal ? daysUntil(goal.date, isoToday()) : null;
  const phase = days !== null ? phaseFor(days) : null;
  const sims = [...r.sims].sort((a, b) => b.date.localeCompare(a.date));
  const lastSim = sims[0];
  const sinceSim = lastSim ? daysUntil(isoToday(), lastSim.date) : null;
  const save = (patch: Partial<RaceState>) =>
    me && setAthleteSettings(me.id, { race: { ...r, ...patch } });

  return {
    me,
    v,
    active: v.race,
    goal,
    days,
    phase,
    sims,
    lastSim,
    due: days !== null ? simDue(days, sinceSim) : null,
    live: r.live as Live | undefined,
    setGoal: (g: NonNullable<RaceState["goal"]>) =>
      save({ goal: g, status: "active" }),
    end: (status: "done" | "cancelled") => save({ status }),
    /** Replace the plan with the race plan (self-guided only; a coach decides for coached athletes). */
    switchPlan: (daysPerWeek: number) => {
      if (!me || !goal) return;
      const p = hybridProgram(daysPerWeek, daysUntil(goal.date, isoToday()), goal);
      startProgram(me.id, p, me.protocol?.restDays ?? []);
    },
    start: (
      kind: SimKind,
      division: DivisionKey,
      roxzone: boolean,
      substitutes: Partial<Record<StationKey, string>>,
    ) =>
      save({
        live: {
          id: `s${Date.now().toString(36)}`,
          kind,
          roxzone,
          division,
          startedAt: Date.now(),
          marks: [],
          substitutes,
        },
      }),
    split: () => r.live && save({ live: split(r.live as Live, Date.now()) }),
    undo: () => r.live && save({ live: undo(r.live as Live) }),
    discard: () => save({ live: undefined }),
    finish: () => {
      if (!r.live) return undefined;
      const sim = toSim(r.live as Live, isoToday());
      save({ live: undefined, sims: [...r.sims, sim] });
      return sim.id;
    },
  };
}
