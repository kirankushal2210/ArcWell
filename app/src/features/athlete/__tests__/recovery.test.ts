// Recovery (D69): sleep need and debt, the recovery score and zone, strain and its target, the
// sleep planner, and the rules-written suggestions and morning note. Pure: the same inputs always
// give the same numbers.
import { describe, expect, it } from "@jest/globals";

import {
  type Baseline,
  clockOf,
  type DayInputs,
  dayFor,
  daysBack,
  emptyRecovery,
  healthMetrics,
  hm,
  outlookFor,
  plannerFor,
  PROTOCOLS,
  protocolById,
  suggestFor,
  type WellnessLog,
} from "@/features/athlete/recovery";

const BASE: Baseline = {
  sleepTargetH: 8,
  bed: -30,
  wake: 7 * 60 + 30,
  quality: 3,
  energy: 3,
  stress: 3,
  soreness: 3,
};
const WED = "2026-11-18";
const SUN = "2026-11-22";

const inputs = (over: Partial<DayInputs> = {}): DayInputs => ({
  store: emptyRecovery(),
  baseline: BASE,
  workouts: [],
  restDays: [6],
  ...over,
});
const log = (date: string, over: Partial<WellnessLog> = {}): WellnessLog => ({
  date,
  sleepH: 8,
  bed: -30,
  wake: 450,
  quality: 4,
  soreness: 2,
  energy: 4,
  stress: 2,
  mood: 4,
  habits: [],
  ...over,
});
const withLogs = (...logs: WellnessLog[]) =>
  inputs({ store: { ...emptyRecovery(), logs } });
const GREAT = {
  sleepH: 8.5,
  quality: 5,
  soreness: 1,
  energy: 5,
  stress: 1,
  mood: 5,
};
const AWFUL = {
  sleepH: 4,
  quality: 1,
  soreness: 5,
  energy: 1,
  stress: 5,
  mood: 1,
};

describe("clock helpers", () => {
  it("clockOf reads minutes after midnight, negatives as the evening before", () => {
    expect(clockOf(0)).toBe("12:00 am");
    expect(clockOf(-60)).toBe("11:00 pm");
    expect(clockOf(12 * 60 + 30)).toBe("12:30 pm");
    expect(clockOf(1445)).toBe("12:05 am");
  });

  it("hm shows hours and minutes, never negative", () => {
    expect(hm(434)).toBe("7:14");
    expect(hm(60)).toBe("1:00");
    expect(hm(-5)).toBe("0:00");
  });
});

describe("dayFor: sleep", () => {
  it("with nothing logged, falls back to the onboarding answers", () => {
    const d = dayFor(inputs(), WED);
    expect(d.source).toBe("answers");
    expect(d.sleep).toMatchObject({
      minutes: 456,
      neededMin: 480,
      debtMin: 0,
      consistency: 80,
    });
    expect(d.sleep.bed).toBe(BASE.bed);
  });

  it("is pure: the same inputs give the same day", () => {
    const i = withLogs(log(WED));
    expect(dayFor(i, WED)).toEqual(dayFor(i, WED));
  });

  it("counts debt from the last three nights (capped at 2 h) and adds half to tonight's need", () => {
    const short = ["2026-11-15", "2026-11-16", "2026-11-17"].map((d) =>
      log(d, { sleepH: 5 }),
    );
    const d = dayFor(withLogs(...short, log(WED)), WED);
    expect(d.sleep.debtMin).toBe(120);
    expect(d.sleep.neededMin).toBe(540);
  });

  it("needs 30 minutes more after a very hard day", () => {
    const hard = inputs({
      workouts: [
        {
          date: "2026-11-17",
          minutes: 90,
          effort: 5,
          name: "Legs",
          start: 1080,
        },
      ],
    });
    expect(dayFor(hard, WED).sleep.neededMin).toBe(510);
  });

  it("scores irregular bed and wake times as less consistent", () => {
    const steady = ["2026-11-15", "2026-11-16", "2026-11-17", WED].map((d) =>
      log(d),
    );
    const messy = steady.map((l, k) => ({
      ...l,
      bed: l.bed + (k % 2 ? 150 : -90),
    }));
    expect(dayFor(withLogs(...steady), WED).sleep.consistency).toBe(100);
    expect(dayFor(withLogs(...messy), WED).sleep.consistency).toBeLessThan(100);
  });
});

describe("dayFor: recovery zone and strain target", () => {
  it("a great morning check-in is green with a hard-day target", () => {
    const d = dayFor(withLogs(log(WED, GREAT)), WED);
    expect(d.source).toBe("check-in");
    expect(d.recovery.zone).toBe("green");
    expect(d.recovery.score).toBeGreaterThanOrEqual(67);
    expect(d.strain.target).toEqual([14, 18]);
    expect(d.stress.label).toBe("Low");
  });

  it("an awful one is red with a light target and high stress", () => {
    const d = dayFor(withLogs(log(WED, AWFUL)), WED);
    expect(d.recovery.zone).toBe("red");
    expect(d.recovery.score).toBeLessThan(34);
    expect(d.strain.target).toEqual([6, 10]);
    expect(d.stress.label).toBe("High");
    expect(
      d.recovery.contributors.find((c) => c.label === "Soreness"),
    ).toMatchObject({
      value: "Very sore",
      good: false,
    });
  });

  it("a rest day gets the rest target whatever the zone", () => {
    expect(dayFor(withLogs(log(SUN, GREAT)), SUN).strain.target).toEqual([
      5, 9,
    ]);
  });

  it("the score always stays between 1 and 99", () => {
    for (const l of [GREAT, AWFUL]) {
      const s = dayFor(withLogs(log(WED, l)), WED).recovery.score;
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(99);
    }
  });
});

describe("dayFor: strain", () => {
  const day = (
    workouts: DayInputs["workouts"],
    activities = emptyRecovery().activities,
  ) =>
    dayFor(inputs({ workouts, store: { ...emptyRecovery(), activities } }), WED)
      .strain;

  it("is zero on a day with nothing done", () => {
    expect(day([])).toMatchObject({ score: 0, load: 0, items: [] });
  });

  it("adds workouts and activities, in the order they happened", () => {
    const s = day(
      [{ date: WED, minutes: 60, effort: 4, name: "Push", start: 1080 }],
      [
        {
          id: "a",
          date: WED,
          name: "Walk",
          minutes: 30,
          effort: 1,
          start: 480,
        },
      ],
    );
    expect(s.items.map((i) => i.name)).toEqual(["Walk", "Push"]);
    expect(s.load).toBe(60 * 8.5 + 30 * 3);
    expect(s.score).toBeGreaterThan(s.items[1].strain);
  });

  it("an unrated workout counts as moderate effort", () => {
    expect(
      day([{ date: WED, minutes: 50, name: "Pull", start: 1000 }]).load,
    ).toBe(300);
  });

  it("grows with load on a 0 to 21 scale", () => {
    const hard = day([
      { date: WED, minutes: 90, effort: 5, name: "Race", start: 300 },
    ]);
    const small = day([
      { date: WED, minutes: 30, effort: 2, name: "Easy", start: 300 },
    ]);
    const extreme = day([
      { date: WED, minutes: 600, effort: 5, name: "Ultra", start: 300 },
    ]);
    expect(hard.score).toBeGreaterThan(small.score);
    expect(hard.score).toBeLessThan(21);
    expect(extreme.score).toBeLessThanOrEqual(21);
  });

  it("ignores other days", () => {
    expect(
      day([{ date: "2026-11-17", minutes: 60, effort: 5, name: "X", start: 0 }])
        .load,
    ).toBe(0);
  });
});

describe("with a device", () => {
  const dev = inputs({
    store: {
      ...emptyRecovery(),
      device: { brand: "pixel", connectedAt: "2026-11-01" },
    },
  });

  it("uses the device night and heart data, the same each time", () => {
    const d = dayFor(dev, WED);
    expect(d.source).toBe("device");
    expect(d.device).toBeDefined();
    expect(d.recovery.contributors.map((c) => c.label)).toEqual([
      "Heart rate variability",
      "Resting heart rate",
      "Sleep performance",
      "Breathing rate",
    ]);
    expect(dayFor(dev, WED)).toEqual(d);
  });

  it("health metrics: five, each with a usual range, only with a device", () => {
    expect(healthMetrics(inputs(), WED)).toBeNull();
    const m = healthMetrics(dev, WED)!;
    expect(m).toHaveLength(5);
    for (const x of m) {
      expect(x.low).toBeLessThanOrEqual(x.high);
      expect(x.inRange).toBe(x.value >= x.low && x.value <= x.high);
    }
  });
});

describe("daysBack", () => {
  it("returns the last n days, oldest first, ending on the date", () => {
    const days = daysBack(inputs(), WED, 7);
    expect(days.map((d) => d.date)).toEqual([
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
      "2026-11-16",
      "2026-11-17",
      WED,
    ]);
  });
});

describe("plannerFor", () => {
  it("bedtime is wake time minus the sleep planned and 15 minutes to fall asleep", () => {
    const d = dayFor(inputs(), WED);
    const p = plannerFor(d, BASE, "peak");
    expect(p.wake).toBe(BASE.wake);
    expect(p.bed).toBe(BASE.wake - p.sleepMin - 15);
  });

  it("peak plans the most sleep, then perform, then get by", () => {
    const d = dayFor(inputs(), WED);
    const [peak, perform, getby] = (["peak", "perform", "getby"] as const).map(
      (m) => plannerFor(d, BASE, m).sleepMin,
    );
    expect(peak).toBeGreaterThan(perform);
    expect(perform).toBeGreaterThan(getby);
  });

  it("asks for more sleep after a hard day", () => {
    const easy = dayFor(inputs(), WED);
    const hard = dayFor(
      inputs({
        workouts: [
          { date: WED, minutes: 120, effort: 5, name: "Race", start: 600 },
        ],
      }),
      WED,
    );
    expect(plannerFor(hard, BASE, "peak").need).toBe(
      plannerFor(easy, BASE, "peak").need + 30,
    );
  });
});

describe("protocols and suggestions", () => {
  it("every protocol has a unique id, steps and a reason", () => {
    expect(new Set(PROTOCOLS.map((p) => p.id)).size).toBe(PROTOCOLS.length);
    for (const p of PROTOCOLS) {
      expect(p.steps.length).toBeGreaterThan(0);
      expect(p.why.length).toBeGreaterThan(20);
      expect(protocolById(p.id)).toBe(p);
    }
  });

  it("a red day suggests easy cardio and rest first, at most three", () => {
    const s = suggestFor(dayFor(withLogs(log(WED, AWFUL)), WED), true);
    expect(s.map((p) => p.id).slice(0, 2)).toEqual(["easy-cardio", "nsdr"]);
    expect(s).toHaveLength(3);
  });

  it("never suggests the sauna on a red day", () => {
    const s = suggestFor(dayFor(withLogs(log(WED, AWFUL)), WED), false);
    expect(s.map((p) => p.id)).not.toContain("sauna");
  });

  it("a green day suggests protein", () => {
    const s = suggestFor(dayFor(withLogs(log(WED, GREAT)), WED), true);
    expect(s.map((p) => p.id)).toContain("protein");
  });
});

describe("outlookFor (rules, never AI)", () => {
  it("rest mode: no strain target, just rest and bedtime", () => {
    const o = outlookFor(dayFor(inputs(), WED), "Upper", -30, true);
    expect(o.title).toBe("Rest mode");
    expect(o.lines.join(" ")).toMatch(/In bed by 11:30 pm/);
    expect(o.lines.join(" ")).not.toMatch(/strain of/);
  });

  it("names the session and the strain range for the zone", () => {
    const d = dayFor(withLogs(log(WED, GREAT)), WED);
    const o = outlookFor(d, "Upper", -30);
    expect(o.title).toBe("Ready to push");
    expect(o.lines[1]).toBe("Upper is on today. Aim for a strain of 14 to 18.");
  });

  it("mentions sleep debt when it's half an hour or more", () => {
    const short = ["2026-11-16", "2026-11-17"].map((x) =>
      log(x, { sleepH: 7 }),
    );
    const o = outlookFor(dayFor(withLogs(...short, log(WED)), WED), null, -30);
    expect(o.lines[1]).toMatch(/^Rest day/);
    expect(o.lines[2]).toBe(
      "You're 2:00 behind on sleep. In bed by 11:30 pm tonight.",
    );
  });
});
