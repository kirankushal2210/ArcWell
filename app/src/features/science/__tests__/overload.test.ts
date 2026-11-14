// Progressive overload rows (D85).
import { describe, expect, it } from "@jest/globals";

import { compareTop, overload, topSet } from "@/features/athlete/overload";
import type { Session } from "@/features/athlete/training";

const day = (d: number) => new Date(Date.UTC(2026, 10, d, 9)).toISOString();
const session = (
  d: number,
  sets: [number, number][],
  name = "Bench press (barbell)",
): Session => ({
  id: `s${d}`,
  at: day(d),
  name: "Push",
  minutes: 50,
  volume: 0,
  setsDone: sets.length,
  setsPlanned: sets.length,
  bests: [],
  exercises: [
    {
      name,
      sets: sets.map(([kg, reps]) => ({
        kg,
        reps,
        seconds: null,
        warmup: false,
      })),
    },
  ],
});
const now = new Date(Date.UTC(2026, 10, 14, 12));

describe("top set", () => {
  it("is the heaviest working set, reps breaking ties", () => {
    expect(
      topSet([
        { kg: 60, reps: 8, seconds: null, warmup: false },
        { kg: 62.5, reps: 6, seconds: null, warmup: false },
        { kg: 62.5, reps: 7, seconds: null, warmup: false },
        { kg: 80, reps: 1, seconds: null, warmup: true },
      ]),
    ).toEqual({ kg: 62.5, reps: 7 });
  });
  it("counts more weight or more reps as better", () => {
    expect(compareTop({ kg: 62.5, reps: 6 }, { kg: 60, reps: 8 })).toBe(1);
    expect(compareTop({ kg: 60, reps: 9 }, { kg: 60, reps: 8 })).toBe(1);
    expect(compareTop({ kg: 60, reps: 8 }, { kg: 60, reps: 8 })).toBe(0);
  });
});

describe("overload rows", () => {
  it("marks progress with the change", () => {
    const [r] = overload(
      [session(12, [[62.5, 8]]), session(9, [[60, 8]])],
      now,
    );
    expect(r.status).toBe("up");
    expect(r.change).toBe("+2.5 kg");
  });
  it("marks reps progress", () => {
    const [r] = overload([session(12, [[60, 9]]), session(9, [[60, 8]])], now);
    expect(r.change).toBe("+1 rep");
  });
  it("flags a stall after three sessions without progress", () => {
    const [r] = overload(
      [session(13, [[60, 8]]), session(10, [[60, 8]]), session(7, [[60, 8]])],
      now,
    );
    expect(r.status).toBe("stalled");
  });
  it("leaves out lifts not trained in the last two weeks", () => {
    expect(overload([session(-5, [[60, 8]])], now)).toHaveLength(0);
  });
  it("shows a first log as new", () => {
    expect(overload([session(12, [[60, 8]])], now)[0].status).toBe("new");
  });
});
