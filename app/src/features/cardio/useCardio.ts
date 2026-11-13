// Cardio fitness state (D79): the best VO2 max estimate, where it stands for age and sex, the level,
// this week's sessions placed around the lifting, and logging. Exists only with the module on.
import {
  isoDate,
  isoToday,
  type CardioState,
} from "@/features/athlete/athleteData";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import { todayIndex, weekSchedule } from "@/features/coach/plans";
import {
  bestEstimate,
  type CardioSlot,
  isLowerBodyDay,
  levelFor,
  type Machine,
  MACHINE_EXERCISE,
  percentileFor,
  retestInDays,
  type Sex,
  type Vo2Test,
  weekCardio,
} from "@/features/science/cardio";

export const emptyCardio = (): CardioState => ({
  machines: ["bike", "rower"],
  days: [],
  tests: [],
  startedAt: isoToday(),
});

export function useCardio() {
  const v = useVisibility();
  const { setAthleteSettings, addActivity } = useCoachData();
  const me = v.me;
  const on = v.has("cardio_fitness");
  const c = v.settings?.cardio ?? emptyCardio();
  const age = me?.basics?.age ?? 30;
  const sex: Sex | null =
    me?.basics?.sex === "male" || me?.basics?.sex === "female"
      ? me.basics.sex
      : null;
  const best = bestEstimate(c.tests);
  const pct = best && sex ? percentileFor(best.vo2, age, sex) : null;
  const level = levelFor(best?.vo2 ?? 32, pct);
  const week =
    Math.floor(
      (Date.parse(`${isoToday()}T00:00:00`) -
        Date.parse(`${c.startedAt}T00:00:00`)) /
        (7 * 86400000),
    ) + 1;
  const machines = c.machines.filter((m) => m !== "run" || v.has("running"));
  const lifting = me?.program
    ? weekSchedule(me.program, me.protocol?.restDays ?? []).map((d) =>
        d.day ? { lower: isLowerBodyDay(d.day.exercises) } : null,
      )
    : [null, null, null, null, null, null, null];
  const slots: CardioSlot[] = on
    ? weekCardio({
        level,
        week: Math.max(1, week),
        days: c.days,
        machines,
        lifting,
      })
    : [];
  const today = slots.find((s) => s.day === todayIndex());
  const doneToday = (c.done ?? []).some((d) => d.date === isoToday());

  const save = (patch: Partial<CardioState>) =>
    me && setAthleteSettings(me.id, { cardio: { ...c, ...patch } });

  return {
    on,
    me,
    c,
    age,
    sex,
    best,
    pct,
    level,
    week: Math.max(1, week),
    machines,
    slots,
    today,
    doneToday,
    retestIn: retestInDays(best?.date, isoToday()),
    trend: [...c.tests].sort((a, b) => a.date.localeCompare(b.date)),
    addTest: (t: Omit<Vo2Test, "id" | "date">) =>
      save({
        tests: [
          ...c.tests,
          { ...t, id: `t${Date.now().toString(36)}`, date: isoToday() },
        ],
      }),
    setParq: (clear: boolean) => save({ parq: { date: isoToday(), clear } }),
    logSession: (slot: {
      kind: "intervals" | "easy";
      machine: Machine;
      minutes: number;
    }) => {
      if (!me) return;
      const d = new Date();
      save({ done: [...(c.done ?? []), { date: isoDate(d), ...slot }] });
      // Counts toward strain (D60) like any activity.
      addActivity(me.id, {
        id: `a${Date.now().toString(36)}`,
        date: isoDate(d),
        name: `${slot.kind === "intervals" ? "Intervals" : "Easy cardio"} · ${MACHINE_EXERCISE[slot.machine]}`,
        minutes: slot.minutes,
        effort: slot.kind === "intervals" ? 4 : 2,
        start: Math.max(0, d.getHours() * 60 + d.getMinutes() - slot.minutes),
      });
    },
  };
}
