// "Week 3 of 8" (training.ts): counted in calendar weeks (Monday start) from the program's start.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { programWeek, weekStart } from "@/features/athlete/training";

// Wednesday 18 November 2026, mid-afternoon.
const NOW = new Date(2026, 10, 18, 15, 0, 0);

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});
afterEach(() => {
  jest.useRealTimers();
});

describe("weekStart", () => {
  it("is Monday 00:00 of the same week, Sunday included", () => {
    expect(weekStart(NOW)).toEqual(new Date(2026, 10, 16));
    expect(weekStart(new Date(2026, 10, 22, 23, 59))).toEqual(
      new Date(2026, 10, 16),
    );
    expect(weekStart(new Date(2026, 10, 16, 0, 0))).toEqual(
      new Date(2026, 10, 16),
    );
  });
});

describe("programWeek", () => {
  it("is week 1 when the program started this week, or has no start", () => {
    expect(programWeek(8, new Date(2026, 10, 16, 9).toISOString())).toEqual({
      week: 1,
      weeks: 8,
      done: false,
    });
    expect(programWeek(8)).toEqual({ week: 1, weeks: 8, done: false });
  });

  it("counts calendar weeks, not days: last Sunday's start is already week 2", () => {
    expect(programWeek(8, new Date(2026, 10, 15, 18).toISOString()).week).toBe(
      2,
    );
    expect(programWeek(8, new Date(2026, 10, 2).toISOString()).week).toBe(3);
  });

  it("is done once the weeks have run out", () => {
    const start = new Date(2026, 8, 7).toISOString(); // 11 weeks before this Monday
    expect(programWeek(8, start)).toEqual({ week: 11, weeks: 8, done: true });
    expect(programWeek(12, start).done).toBe(false);
  });

  it("never goes below week 1 for a start in the future", () => {
    expect(programWeek(8, new Date(2026, 11, 7).toISOString())).toEqual({
      week: 1,
      weeks: 8,
      done: false,
    });
  });
});
