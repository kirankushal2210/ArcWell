// Coach effort targets (K-07), endurance and HYROX blocks (D76, D79) and coach onboarding answers.
import { describe, expect, it } from "@jest/globals";

import {
  estimateMinutes,
  exerciseFrom,
  startFromDay,
} from "@/features/athlete/training";
import { defaultCoachProfile } from "@/features/coach/coachProfile";
import {
  cloneProgram,
  defaultRpe,
  newInterval,
  newStation,
  planLine,
  withBlock,
} from "@/features/coach/plans";
import {
  firstTemplate,
  profileFromAnswers,
  starterFor,
} from "@/features/onboarding/coachAnswers";
import { rpeTargetFor } from "@/features/science/rules";

describe("effort", () => {
  it("defaults to the rules range", () => {
    expect(defaultRpe("Squat (barbell)")).toEqual(rpeTargetFor("some", true));
    expect(defaultRpe("Lateral raise (dumbbell)", "new")).toEqual([7, 8]);
  });

  it("carries the coach's range into the logger", () => {
    const e = exerciseFrom("Squat (barbell)", 3, "5", 180, [], { rpe: [8, 9] });
    expect(e.rpe).toEqual([8, 9]);
    expect(
      exerciseFrom("Squat (barbell)", 3, "5", 180, []).rpe,
    ).toBeUndefined();
  });
});

describe("intervals and stations", () => {
  it("run intervals log distance per repeat with pace", () => {
    const run = withBlock(newInterval("Running"), {
      kind: "interval",
      measure: "distance",
      amount: 400,
      pace: "4:30",
    });
    expect(run).toMatchObject({ sets: 6, reps: "400 m", restSec: 90 });
    expect(planLine({ ...run, rpe: [8, 8] })).toBe(
      "6 × 400 m · 4:30 /km · RPE 8",
    );
    const logged = exerciseFrom(
      run.name,
      run.sets,
      run.reps,
      run.restSec,
      [],
      run,
    );
    expect(logged.type).toBe("distance_duration");
    expect(logged.sets).toHaveLength(6);
    expect(logged.sets[0].km).toBe(0.4);
    expect(logged.pace).toBe("4:30 /km");
  });

  it("erg intervals by time and pace per 500 m", () => {
    const row = withBlock(newInterval("Rowing machine"), {
      kind: "interval",
      measure: "time",
      amount: 180,
      pace: "2:05",
    });
    expect(row.reps).toBe("3 min");
    expect(planLine(row)).toBe("4 × 3 min · 2:05 /500 m");
    expect(
      exerciseFrom(row.name, row.sets, row.reps, 60, []).sets[0].seconds,
    ).toBe(180);
  });

  it("stations use race distance or reps", () => {
    const sled = newStation("sled_push");
    expect(sled).toMatchObject({ name: "Sled push", reps: "50 m", sets: 1 });
    expect(planLine(sled)).toBe("50 m");
    const balls = newStation("wall_balls");
    expect(balls).toMatchObject({ name: "Wall ball", reps: "100" });
    expect(planLine(balls)).toBe("100 reps");
    // Burpee broad jumps are a rep exercise in the library but planned in metres.
    const bbj = exerciseFrom("Burpee broad jumps", 1, "80 m", 0, []);
    expect(bbj.type).toBe("distance_duration");
    expect(bbj.sets[0].km).toBe(0.08);
  });

  it("survive copying and count towards workout length", () => {
    const day = {
      id: "d1",
      name: "Engine",
      exercises: [newStation("skierg"), newInterval("Running")],
    };
    const copy = cloneProgram({ name: "x", weeks: 4, days: [day] });
    expect(copy.days[0].exercises[0].block).toEqual(day.exercises[0].block);
    expect(copy.days[0].exercises[0].block).not.toBe(day.exercises[0].block);
    expect(startFromDay(day, []).exercises[1].sets[0].km).toBe(0.4);
    expect(estimateMinutes(day)).toBeGreaterThanOrEqual(20);
  });
});

describe("coach onboarding answers", () => {
  const answers = {
    displayName: " Coach Ravi ",
    city: "Pune",
    specialisations: ["Strength", "Beginners"],
    bio: "Strength for desk workers.",
    instagram: "@ravi.lifts",
    yearsCoaching: "4",
    certifications: "",
    services: [
      { name: "Online coaching", price: "₹3,000 / month", includes: "" },
      { name: " ", price: "", includes: "" },
    ],
    firstTemplate: "arcwell",
  };

  it("become the coach's profile", () => {
    const p = profileFromAnswers(answers, defaultCoachProfile());
    expect(p).toMatchObject({
      name: "Coach Ravi",
      city: "Pune",
      specialisations: ["Strength", "Beginners"],
      instagram: "ravi.lifts",
      years: 4,
      certifications: "",
      services: ["Online coaching · ₹3,000 / month"],
    });
  });

  it("pick the first template", () => {
    expect(starterFor(["PCOS"])).toBe("Fat loss");
    const arcwell = firstTemplate(answers);
    expect(arcwell.kind === "ready" && arcwell.program.name).toBe(
      "Strength · 4 days",
    );
    const scratch = firstTemplate({ ...answers, firstTemplate: "scratch" });
    expect(scratch.kind === "ready" && scratch.program.days).toEqual([]);
    expect(
      firstTemplate({ ...answers, firstTemplate: "spreadsheet" }).kind,
    ).toBe("none");
  });
});
