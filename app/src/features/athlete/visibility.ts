// What Arcwell shows (D78): one hook every card, route, section tab and the plan generator asks.
// A module that's off leaves no trace. A coach's assigned habits always show; the race track
// exists only while a race goal is active (D76).
import { useCoachData } from "@/features/coach/CoachData";
import { defaultModules, type ModuleKey } from "@/features/science/habits";

import type { AthleteSettings } from "./athleteData";
import { goalKeyOf } from "./selfPlan";
import { useMe } from "./useMe";

export function modulesOf(
  s: AthleteSettings | undefined,
  goalLabel?: string,
): ModuleKey[] {
  return s?.modules ?? defaultModules(goalKeyOf(goalLabel));
}

export const raceActive = (s: AthleteSettings | undefined) =>
  !!s?.race?.goal && (s.race.status ?? "active") === "active";

export function useVisibility() {
  const me = useMe();
  const { meTier, settingsOf, setAthleteSettings } = useCoachData();
  const s = me ? settingsOf(me.id) : undefined;
  const modules = modulesOf(s, me?.goal);
  const race = raceActive(s);
  const has = (m: ModuleKey) =>
    modules.includes(m) ||
    // A race needs running and cardio whatever the switches say.
    (race && (m === "running" || m === "cardio_fitness"));
  const setModules = (next: ModuleKey[]) =>
    me && setAthleteSettings(me.id, { modules: next });
  return {
    me,
    settings: s,
    tier: meTier,
    coached: meTier === "coached",
    modules,
    has,
    race,
    setModules,
    toggle: (m: ModuleKey, on: boolean) =>
      setModules(
        on ? [...new Set([...modules, m])] : modules.filter((x) => x !== m),
      ),
  };
}
