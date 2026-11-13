import { describe, expect, test } from "@jest/globals";

import { DIVISIONS, FULL_RACE } from "../../race/data";
import { predict, split, stationBests, stepsFor, toSim, undo, type Live } from "../../race/sim";

const live = (kind: Live["kind"], roxzone = false): Live => ({
  id: "s1",
  kind,
  roxzone,
  division: "open_women",
  startedAt: 0,
  marks: [],
  substitutes: {},
});

describe("race simulator", () => {
  test("the race is 8 runs and 8 stations in order", () => {
    expect(FULL_RACE).toHaveLength(16);
    expect(FULL_RACE[0].kind).toBe("run");
    expect(FULL_RACE[15]).toMatchObject({ kind: "station", station: "wall_balls" });
  });

  test("half sims and Roxzone steps", () => {
    expect(stepsFor("half", false)).toHaveLength(8);
    expect(stepsFor("full", true)).toHaveLength(32);
  });

  test("splits come from timestamps; undo removes the last", () => {
    let l = live("half");
    for (let k = 1; k <= 8; k++) l = split(l, k * 300_000); // 5 minutes each
    expect(undo(l).marks).toHaveLength(7);
    const sim = toSim(l, "2026-11-13");
    expect(sim.totalSec).toBe(8 * 300);
    expect(sim.splits.filter((x) => x.kind === "run")).toHaveLength(4);
  });

  test("swapped stations never count as bests", () => {
    let l: Live = { ...live("half"), substitutes: { sled_push: "Treadmill push" } };
    for (let k = 1; k <= 8; k++) l = split(l, k * 200_000);
    const b = stationBests([toSim(l, "2026-11-13")]);
    expect(b.sled_push).toBeUndefined();
    expect(b.skierg).toBe(200);
  });

  test("a prediction is a range once there are enough splits", () => {
    let l = live("half");
    for (let k = 1; k <= 8; k++) l = split(l, k * 330_000);
    const p = predict([toSim(l, "2026-11-13")]);
    expect(p).not.toBeNull();
    expect(p![0]).toBeLessThan(p![1]);
  });

  test("division loads (25/26)", () => {
    const wo = DIVISIONS.find((d) => d.key === "open_women")!;
    expect(wo.loads.sled_push?.kg).toBe(102);
    expect(DIVISIONS.find((d) => d.key === "pro_men")!.loads.wall_balls?.kg).toBe(9);
  });
});
