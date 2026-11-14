// The workout in progress (F4-02, F4-09), kept in its own store so logging a set re-renders only
// the screens that show the workout, not every screen that reads the sample data. Three contexts:
// - the full workout, for the logger;
// - a summary (name, start, plan day, rest end) that changes only when those do, for the
//   minimised bar, Resume buttons and docks;
// - the setter, which never changes, for buttons that start a workout.
// Saved on the phone shortly after each change and at once when the app goes to the background.
import { localStore } from "@/lib/localStore";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import type { ActiveWorkout } from "./training";

type SetActive = (
  next:
    ActiveWorkout | null | ((w: ActiveWorkout | null) => ActiveWorkout | null),
) => void;

export type WorkoutSummary = {
  name: string;
  startedAt: number;
  dayId: string | null;
  restEndsAt: number | null;
};

const ACTIVE_KEY = "arcwell.active.v1";
/** Older builds kept the workout inside the sample store; read it once if the new key is empty. */
const LEGACY_KEY = "arcwell.sample.v1";
const SAVE_DELAY_MS = 400;
const BACKUP_KEY = "arcwell.active.backup";

const FullCtx = createContext<ActiveWorkout | null>(null);
const SummaryCtx = createContext<WorkoutSummary | null>(null);
const SetCtx = createContext<SetActive>(() => {});

export function ActiveWorkoutProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveWorkout | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Same safety rules as the sample store: an unreadable saved workout is backed up and never
  // overwritten, and a change still waiting for its save is written if the provider goes away.
  const saveBlocked = useRef(false);
  const pendingSave = useRef<(() => void) | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    (async () => {
      const raw = await localStore.getItem(ACTIVE_KEY);
      stored = raw;
      if (raw) return JSON.parse(raw) as ActiveWorkout | null;
      const legacy = await localStore.getItem(LEGACY_KEY);
      return legacy
        ? ((JSON.parse(legacy) as { active?: ActiveWorkout | null }).active ??
            null)
        : null;
    })()
      .then((w) => {
        // A workout started before hydration finished wins over the saved one.
        if (w) setActive((cur) => cur ?? w);
      })
      .catch(() => {
        saveBlocked.current = true;
        if (stored) localStore.setItem(BACKUP_KEY, stored).catch(() => {});
      })
      .finally(() => setHydrated(true));
  }, []);
  useEffect(() => () => pendingSave.current?.(), []);

  // Debounced save, flushed when the app leaves the foreground.
  useEffect(() => {
    if (!hydrated) return;
    const save = () => {
      pendingSave.current = null;
      if (saveBlocked.current) return;
      localStore.setItem(ACTIVE_KEY, JSON.stringify(active)).catch(() => {});
    };
    pendingSave.current = save;
    const t = setTimeout(save, SAVE_DELAY_MS);
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") save();
    });
    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, [active, hydrated]);

  const name = active?.name;
  const startedAt = active?.startedAt;
  const dayId = active?.dayId ?? null;
  const restEndsAt = active?.rest?.endsAt ?? null;
  const summary = useMemo<WorkoutSummary | null>(
    () =>
      name !== undefined && startedAt !== undefined
        ? { name, startedAt, dayId, restEndsAt }
        : null,
    [name, startedAt, dayId, restEndsAt],
  );

  return (
    <SetCtx.Provider value={setActive}>
      <SummaryCtx.Provider value={summary}>
        <FullCtx.Provider value={active}>{children}</FullCtx.Provider>
      </SummaryCtx.Provider>
    </SetCtx.Provider>
  );
}

/** The whole workout; re-renders on every logged set. Only the logger needs this. */
export const useActiveWorkout = () => useContext(FullCtx);
/** Name, start and rest of the workout in progress, or null; re-renders only when those change. */
export const useWorkoutSummary = () => useContext(SummaryCtx);
/** Start, change or end the workout; stable, never re-renders. */
export const useSetActive = () => useContext(SetCtx);
