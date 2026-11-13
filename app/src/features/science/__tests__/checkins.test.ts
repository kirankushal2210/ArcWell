// Weekly check-in due, sent and overdue (F6, K-01) and adherence from logged workouts.
import { describe, expect, it } from "@jest/globals";

import { adherenceFromLogs, adherenceOf } from "@/features/coach/adherence";
import {
  attentionOf,
  checkInStatus,
  dueText,
  isOverdue,
  needsAttentionNow,
  sentAt,
  sentThisWeek,
} from "@/features/coach/checkins";
import type { CheckIn, Client } from "@/features/coach/sampleData";

// Saturday 14 Nov 2026, 10:00 local.
const NOW = new Date(2026, 10, 14, 10, 0);
const local = (d: number, h = 9) => new Date(2026, 10, d, h).toISOString();

const k = (at?: string, submitted = "earlier"): CheckIn => ({
  id: `k-${at ?? submitted}`,
  week: 1,
  at,
  submitted,
  rows: [],
  answers: "",
  reviewed: false,
});

const client = (over: Partial<Client> = {}): Client =>
  ({
    id: "c",
    name: "Test",
    status: "active",
    joined: "1 Sep",
    weeksWithYou: 8,
    goal: "",
    line: "",
    adherence: 75,
    checkInDay: "Sunday",
    checkIns: [],
    unread: 0,
    ...over,
  }) as Client;

describe("sentAt", () => {
  it("prefers the timestamp", () => {
    expect(sentAt(k(local(10)), NOW)?.getDate()).toBe(10);
  });
  it("reads sample text", () => {
    expect(sentAt(k(undefined, "2 h ago"), NOW)?.getHours()).toBe(8);
    expect(sentAt(k(undefined, "Yesterday"), NOW)?.getDate()).toBe(13);
    expect(sentAt(k(undefined, "2 Nov"), NOW)?.getDate()).toBe(2);
    expect(sentAt(k(undefined, "just now"), NOW)?.getTime()).toBe(
      NOW.getTime(),
    );
    expect(sentAt(k(undefined, "someday"), NOW)).toBeNull();
  });
  it("puts a future day-month in last year", () => {
    expect(sentAt(k(undefined, "20 Dec"), NOW)?.getFullYear()).toBe(2025);
  });
});

describe("checkInStatus", () => {
  it("is due, not overdue, before the first check-in", () => {
    const s = checkInStatus(client(), NOW);
    expect(s.kind).toBe("due");
    expect(dueText(client(), NOW)).toBe("Due tomorrow");
  });

  it("is overdue when last Sunday passed without one", () => {
    // Due Sunday; last sent Sunday 1 Nov, nothing for Sunday 8 Nov.
    const c = client({ checkIns: [k(local(1))] });
    const s = checkInStatus(c, NOW);
    expect(s).toMatchObject({ kind: "overdue", daysLate: 6 });
    expect(isOverdue(c, NOW)).toBe(true);
    expect(dueText(c, NOW)).toBe("Overdue since Sunday");
  });

  it("says yesterday the day after the due day", () => {
    const c = client({ checkInDay: "Friday", checkIns: [k(local(5))] });
    expect(dueText(c, NOW)).toBe("Overdue since yesterday");
  });

  it("names the date when a whole week was missed", () => {
    // Due Saturday (today); last sent 1 Nov, so 7 Nov was missed.
    const c = client({ checkInDay: "Saturday", checkIns: [k(local(1))] });
    expect(checkInStatus(c, NOW)).toMatchObject({
      kind: "overdue",
      daysLate: 7,
    });
    expect(dueText(c, NOW)).toMatch(/^Overdue since 7 Nov/);
  });

  it("counts a check-in sent up to three days early", () => {
    const c = client({ checkIns: [k(local(12))] });
    expect(sentThisWeek(c, NOW)).toBe(true);
    expect(dueText(c, NOW)).toBe("Sent");
  });

  it("keeps last week's as sent until the next window opens", () => {
    // Wednesday 11 Nov, sent Sunday 8 Nov: still sent; Thursday 12 Nov opens Sunday 15 Nov's.
    const c = client({ checkIns: [k(local(8))] });
    expect(sentThisWeek(c, new Date(2026, 10, 11, 10))).toBe(true);
    expect(checkInStatus(c, new Date(2026, 10, 12, 10))).toMatchObject({
      kind: "due",
      inDays: 3,
    });
  });

  it("is due today on the day", () => {
    const c = client({ checkInDay: "Saturday", checkIns: [k(local(7))] });
    expect(dueText(c, NOW)).toBe("Due today");
  });

  it("reads sample check-ins with no timestamp", () => {
    const c = client({ checkIns: [k(undefined, "2 Nov")] });
    expect(isOverdue(c, NOW)).toBe(true);
    expect(
      isOverdue(client({ checkIns: [k(undefined, "2 h ago")] }), NOW),
    ).toBe(false);
  });
});

describe("attentionOf", () => {
  it("computes overdue instead of trusting the stored line", () => {
    const late = client({
      attention: "Check-in overdue · due Sunday",
      checkIns: [k(local(1))],
    });
    expect(attentionOf(late, NOW)).toBe("Check-in overdue · due Sunday");
    const onTime = client({
      attention: "Check-in overdue · due Sunday",
      checkIns: [k(local(13))],
    });
    expect(attentionOf(onTime, NOW)).toBeUndefined();
    expect(needsAttentionNow(onTime, NOW)).toBe(false);
  });

  it("keeps other stored reasons", () => {
    const c = client({ attention: "Check-in to review · submitted 2 h ago" });
    expect(attentionOf(c, NOW)).toBe("Check-in to review · submitted 2 h ago");
  });

  it("flags low adherence from logs and drops a stale stored one", () => {
    const c = client({
      attention: "Low adherence this week",
      checkIns: [k(local(13))],
    });
    expect(attentionOf(c, NOW, 90)).toBeUndefined();
    expect(attentionOf(c, NOW, 40)).toBe(
      "Low adherence · 40% of planned workouts",
    );
    expect(attentionOf(c, NOW)).toBe("Low adherence this week");
  });

  it("doesn't chase paused or new clients", () => {
    const late = { checkIns: [k(local(1))] };
    expect(
      attentionOf(client({ ...late, status: "paused" }), NOW),
    ).toBeUndefined();
    expect(attentionOf(client({ ...late, isNew: true }), NOW)).toBeUndefined();
  });
});

describe("adherenceFromLogs", () => {
  const program = (days: number) => ({
    name: "Plan",
    weeks: 8,
    days: Array.from({ length: days }, (_, i) => ({
      id: `d${i}`,
      name: `Day ${i}`,
      exercises: [],
    })),
  });
  const sessions = (n: number, fromDay = 13) =>
    Array.from({ length: n }, (_, i) => ({ at: local(fromDay - i) }));

  it("is null with no plan, and falls back to the stored figure", () => {
    expect(adherenceFromLogs(client(), [], NOW)).toBeNull();
    expect(adherenceOf(client(), [], NOW)).toBe(75);
  });

  it("is done over planned across four weeks", () => {
    // 4 days a week × 4 weeks = 16 planned; 12 done = 75%.
    const c = client({ program: program(4) });
    expect(adherenceFromLogs(c, sessions(12), NOW)).toBe(75);
  });

  it("caps at 100%", () => {
    const c = client({ program: program(2) });
    expect(adherenceFromLogs(c, sessions(20), NOW)).toBe(100);
  });

  it("only counts since the program started", () => {
    // Started Sunday 1 Nov (13.4 days ago): floor(3 × 13.4 / 7) = 5 planned; 4 done = 80%.
    const c = client({
      program: program(3),
      programStart: new Date(2026, 10, 1, 15).toISOString(),
    });
    expect(adherenceFromLogs(c, sessions(4), NOW)).toBe(80);
    // A session before the start doesn't count.
    const before = { at: new Date(2026, 9, 31, 9).toISOString() };
    expect(adherenceFromLogs(c, [...sessions(4), before], NOW)).toBe(80);
  });

  it("waits until a planned workout has come round", () => {
    const c = client({
      program: program(3),
      programStart: new Date(2026, 10, 14, 8).toISOString(),
    });
    expect(adherenceFromLogs(c, [], NOW)).toBeNull();
    expect(adherenceOf(c, [], NOW)).toBe(75);
  });

  it("isn't counted while paused", () => {
    const c = client({ program: program(4), status: "paused" });
    expect(adherenceFromLogs(c, sessions(2), NOW)).toBeNull();
  });
});
