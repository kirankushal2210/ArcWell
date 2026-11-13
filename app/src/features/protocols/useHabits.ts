// Daily habits state (D74, D77, D78): which habits are active, today's logs, and the actions. A
// habit shows only when its module is on, unless the coach assigned it (coach habits always show).
import { isoDate, isoToday } from "@/features/athlete/athleteData";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import {
  bedAfterWake,
  caffeineCutoff,
  coldAllowed,
  type Habit,
  habitById,
  habitCap,
  inWindow,
  type Rhythm,
  type SafetyKey,
} from "@/features/science/habits";

import { useNow } from "./useNow";

export function useHabits() {
  const v = useVisibility();
  const rec = useRecovery();
  const { setAthleteSettings } = useCoachData();
  const now = useNow();
  const today = isoToday();
  const s = v.settings;
  const me = v.me;
  const rhythm: Rhythm = { wake: rec.baseline.wake, bed: rec.baseline.bed };
  const state = s?.habits ?? { active: [] };
  const log = s?.habitLog?.[today] ?? {};
  const active = state.active
    .map((a) => ({ a, h: habitById(a.id) }))
    .filter((x): x is { a: typeof x.a; h: Habit } => !!x.h)
    .filter(({ a, h }) => a.origin === "coach" || v.has(h.module));
  const cap = habitCap(state.firstAt, today);
  const selfCount = state.active.filter((a) => a.origin !== "coach").length;

  // Last strength session today, for the cold guard (minutes after midnight).
  const strengthEnds = rec.inputs.workouts
    .filter((w) => w.date === today)
    .map((w) => w.start + w.minutes);
  const lastStrengthEnd = strengthEnds.length
    ? Math.max(...strengthEnds)
    : null;

  const done = (h: Habit) => {
    const val = log[h.id];
    if (val === undefined) return false;
    if (h.id === "caffeine-cutoff")
      return typeof val === "number" && val <= caffeineCutoff(rhythm);
    if (h.target && typeof val === "number" && h.tracker !== "clock")
      return val >= h.target;
    return true;
  };
  const visibleNow = (h: Habit) =>
    inWindow(h, rhythm, now) &&
    (h.id !== "cold" || coldAllowed(lastStrengthEnd, now));

  const save = (patch: Parameters<typeof setAthleteSettings>[1]) =>
    me && setAthleteSettings(me.id, patch);
  const setLog = (id: string, value: number | true | undefined) => {
    const next = { ...log };
    if (value === undefined) delete next[id];
    else next[id] = value;
    save({ habitLog: { ...s?.habitLog, [today]: next } });
  };

  return {
    me,
    v,
    now,
    today,
    rhythm,
    bed: bedAfterWake(rhythm),
    active,
    log,
    cap,
    selfCount,
    canAdd: selfCount < cap,
    safetyPassed: (k: SafetyKey) => !!state.safety?.[k],
    isActive: (id: string) => state.active.some((a) => a.id === id),
    done,
    visibleNow,
    /** Habits due now (inside their window, not done) and later today. */
    now_: active.filter(
      ({ h }) => visibleNow(h) && h.window.anchor !== "anytime",
    ),
    tick: (h: Habit) =>
      setLog(
        h.id,
        done(h) ? undefined : h.tracker === "clock" ? now : (h.target ?? true),
      ),
    setLog,
    add: (id: string, safety?: SafetyKey) => {
      if (state.active.some((a) => a.id === id)) return;
      save({
        habits: {
          ...state,
          firstAt: state.firstAt ?? today,
          active: [...state.active, { id, origin: "self", since: today }],
          safety: safety ? { ...state.safety, [safety]: today } : state.safety,
        },
        // Adding a habit turns its module on (D78).
        modules: [...new Set([...v.modules, habitById(id)!.module])],
      });
    },
    remove: (id: string) =>
      save({
        habits: { ...state, active: state.active.filter((a) => a.id !== id) },
      }),
    weekDone: (id: string) => {
      let n = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = isoDate(d);
        if (s?.habitLog?.[k]?.[id] !== undefined) n++;
      }
      return n;
    },
  };
}
