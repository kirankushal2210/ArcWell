// What Arcwell shows (D78): the switches the athlete set, or the goal's defaults; a race (D76) is
// on only while its goal is active.
import { describe, expect, it, jest } from "@jest/globals";

import {
  type AthleteSettings,
  defaultSettings,
  type RaceState,
} from "@/features/athlete/athleteData";
import { modulesOf, raceActive } from "@/features/athlete/visibility";

// Only the pure rules are tested here; the hook's data sources aren't needed.
jest.mock("@/features/coach/CoachData", () => ({}));
jest.mock("@/features/athlete/useMe", () => ({}));

const s = defaultSettings();

describe("modulesOf", () => {
  it("uses the goal's defaults until the athlete chooses", () => {
    expect(modulesOf(undefined)).toEqual(["morning"]);
    expect(modulesOf(s, "Build muscle")).toEqual(["morning"]);
    expect(modulesOf(s, "General fitness")).toEqual([
      "morning",
      "cardio_fitness",
    ]);
    expect(modulesOf(s, "HYROX race")).toEqual([
      "morning",
      "cardio_fitness",
      "running",
    ]);
  });

  it("uses exactly what the athlete chose, even nothing", () => {
    expect(modulesOf({ ...s, modules: ["calm"] }, "HYROX race")).toEqual([
      "calm",
    ]);
    expect(modulesOf({ ...s, modules: [] }, "General fitness")).toEqual([]);
  });
});

describe("raceActive", () => {
  const race = (status?: RaceState["status"]): AthleteSettings => ({
    ...s,
    race: {
      goal: { date: "2027-03-01", division: "open_women", kit: [] },
      sims: [],
      ...(status ? { status } : {}),
    },
  });

  it("is on for a race goal with no status or an active one", () => {
    expect(raceActive(race())).toBe(true);
    expect(raceActive(race("active"))).toBe(true);
  });

  it("is off with no settings, no goal, or a goal that isn't active", () => {
    expect(raceActive(undefined)).toBe(false);
    expect(raceActive(s)).toBe(false);
    expect(raceActive(race("done"))).toBe(false);
    expect(raceActive(race("cancelled"))).toBe(false);
  });
});
