// Coach CRM (CO-15, D66): renewals, monthly value, the overview numbers and the date words coaches
// read on every card.
import { describe, expect, it } from "@jest/globals";

import {
  accountOf,
  type ClientAccount,
  crmStats,
  dayInline,
  dayOffset,
  dayText,
  inr,
  isOpen,
  type Lead,
  monthlyValue,
  onDay,
  renewsOn,
  tenureText,
  ymd,
} from "@/features/coach/crm";
import { type Client, sampleClients } from "@/features/coach/sampleData";

// Wednesday 18 November 2026, midday.
const NOW = new Date(2026, 10, 18, 12, 0, 0);
const acct = (over: Partial<ClientAccount>): ClientAccount => ({
  package: "Online coaching",
  feeInr: 3500,
  billing: "monthly",
  startedAt: "2026-09-10",
  paid: "paid",
  ...over,
});
const client = (over: Partial<Client>): Client => ({
  ...sampleClients[0],
  ...over,
});
const lead = (over: Partial<Lead>): Lead => ({
  id: "l",
  name: "Lead",
  source: "instagram",
  stage: "new",
  createdAt: "2026-11-10T10:00:00.000Z",
  events: [],
  ...over,
});

describe("dates", () => {
  it("ymd and dayOffset use the local calendar day", () => {
    expect(ymd(NOW)).toBe("2026-11-18");
    expect(dayOffset(14, NOW)).toBe("2026-12-02");
    expect(dayOffset(-18, NOW)).toBe("2026-10-31");
  });

  it("dayText: today, tomorrow, yesterday, days ago, else a short date", () => {
    expect(dayText("2026-11-18", NOW)).toBe("Today");
    expect(dayText("2026-11-19", NOW)).toBe("Tomorrow");
    expect(dayText("2026-11-17", NOW)).toBe("Yesterday");
    expect(dayText("2026-11-15", NOW)).toBe("3 days ago");
    expect(dayText("2026-11-25", NOW)).toMatch(/25 Nov/);
  });

  it("dayInline and onDay read naturally mid-sentence", () => {
    expect(dayInline("2026-11-19", NOW)).toBe("tomorrow");
    expect(dayInline("2026-11-25", NOW)).toMatch(/25 Nov/);
    expect(onDay("2026-11-18", NOW)).toBe("today");
    expect(onDay("2026-11-25", NOW)).toMatch(/^on .*25 Nov/);
  });

  it("tenureText", () => {
    expect(tenureText(0)).toBe("Joined this week");
    expect(tenureText(1)).toBe("1 week with you");
    expect(tenureText(6)).toBe("6 weeks with you");
  });

  it("inr uses Indian digit grouping", () => {
    expect(inr(125000)).toBe("₹1,25,000");
  });
});

describe("renewsOn", () => {
  it("is the first renewal after today, stepping by the billing cycle", () => {
    expect(renewsOn(acct({ startedAt: "2026-09-10" }), NOW)).toBe("2026-12-10");
    expect(
      renewsOn(acct({ startedAt: "2026-08-20", billing: "quarterly" }), NOW),
    ).toBe("2026-11-20");
    expect(
      renewsOn(acct({ startedAt: "2026-06-01", billing: "half_yearly" }), NOW),
    ).toBe("2026-12-01");
  });

  it("a renewal due today moves to the next cycle", () => {
    expect(renewsOn(acct({ startedAt: "2026-10-18" }), NOW)).toBe("2026-12-18");
  });

  it("one-off packages never renew", () => {
    expect(renewsOn(acct({ billing: "one_off" }), NOW)).toBeUndefined();
  });

  it("a start on the 31st renews on the last day of shorter months", () => {
    expect(
      renewsOn(acct({ startedAt: "2026-01-31" }), new Date(2026, 1, 10)),
    ).toBe("2026-02-28");
    expect(
      renewsOn(acct({ startedAt: "2026-01-31" }), new Date(2026, 2, 5)),
    ).toBe("2026-03-31");
    expect(renewsOn(acct({ startedAt: "2026-08-31" }), NOW)).toBe("2026-11-30");
  });
});

describe("monthlyValue", () => {
  it("spreads a cycle's fee over its months; one-off counts nothing", () => {
    expect(monthlyValue(acct({ feeInr: 3500 }))).toBe(3500);
    expect(monthlyValue(acct({ feeInr: 9000, billing: "quarterly" }))).toBe(
      3000,
    );
    expect(monthlyValue(acct({ feeInr: 18000, billing: "half_yearly" }))).toBe(
      3000,
    );
    expect(monthlyValue(acct({ feeInr: 5000, billing: "one_off" }))).toBe(0);
  });
});

describe("accountOf", () => {
  it("uses the saved account when there is one", () => {
    const a = acct({ feeInr: 4200 });
    expect(accountOf(client({ id: "x", account: a }))).toBe(a);
  });

  it("starts a new client from their join date, unpaid while pending", () => {
    const a = accountOf(
      client({
        id: "new-one",
        account: undefined,
        weeksWithYou: 0,
        pending: true,
      }),
    );
    expect(a).toMatchObject({
      package: "Online coaching",
      feeInr: 3500,
      billing: "monthly",
      paid: "due",
    });
  });
});

describe("crmStats", () => {
  const leads: Lead[] = [
    lead({ id: "1", stage: "joined", source: "instagram" }),
    lead({ id: "2", stage: "lost", lostReason: "Price", source: "instagram" }),
    lead({ id: "3", stage: "lost", lostReason: "Price", source: "referral" }),
    lead({
      id: "4",
      stage: "contacted",
      followUp: "2026-11-17",
      source: "referral",
    }),
    lead({ id: "5", stage: "call_booked", callAt: "2026-11-20T09:00:00.000Z" }),
    lead({ id: "6", stage: "new", createdAt: "2026-06-01T10:00:00.000Z" }),
  ];
  const clients = [
    client({
      id: "a",
      status: "active",
      weeksWithYou: 10,
      account: acct({ feeInr: 3500 }),
    }),
    client({
      id: "b",
      status: "paused",
      weeksWithYou: 4,
      account: acct({ paid: "due" }),
    }),
    client({
      id: "c",
      status: "completed",
      weeksWithYou: 12,
      account: acct({ paid: "overdue" }),
    }),
    client({ id: "d", status: "active", pending: true, weeksWithYou: 0 }),
  ];

  it("counts leads in the period and the conversion of decided ones", () => {
    const s = crmStats(leads, clients, "30", NOW);
    expect(s.leads).toBe(5);
    expect(s.joined).toBe(1);
    expect(s.lost).toBe(2);
    expect(s.conversion).toBe(33);
    expect(s.reasons).toEqual([{ reason: "Price", count: 2 }]);
    expect(s.bySource[0]).toEqual({ source: "instagram", leads: 3, joined: 1 });
    expect(crmStats(leads, clients, "all", NOW).leads).toBe(6);
  });

  it("open leads, due follow-ups and booked calls", () => {
    const s = crmStats(leads, clients, "30", NOW);
    expect(s.open).toBe(3);
    expect(s.followUps.map((l) => l.id)).toEqual(["4"]);
    expect(s.calls_booked.map((l) => l.id)).toEqual(["5"]);
  });

  it("no decided leads means no conversion figure, not 0%", () => {
    expect(crmStats([lead({})], clients, "30", NOW).conversion).toBeNull();
  });

  it("clients: pending invites aren't counted; completed lowers retention", () => {
    const c = crmStats(leads, clients, "30", NOW).clients;
    expect(c).toMatchObject({
      active: 1,
      paused: 1,
      completed: 1,
      total: 3,
      retention: 67,
      avgWeeks: 9,
    });
  });

  it("money: monthly revenue from active clients; due and overdue exclude completed", () => {
    const m = crmStats(leads, clients, "30", NOW).money;
    expect(m.monthly).toBe(3500);
    expect(m.due).toBe(1);
    expect(m.overdue).toBe(0);
  });

  it("renewals in the next 14 days, soonest first", () => {
    const soon = [
      client({
        id: "x",
        status: "active",
        account: acct({ startedAt: "2026-10-28" }),
      }),
      client({
        id: "y",
        status: "active",
        account: acct({ startedAt: "2026-10-20" }),
      }),
      client({
        id: "z",
        status: "active",
        account: acct({ startedAt: "2026-10-05" }),
      }),
    ];
    const r = crmStats([], soon, "30", NOW).renewals;
    expect(r.map((x) => [x.c.id, x.on])).toEqual([
      ["y", "2026-11-20"],
      ["x", "2026-11-28"],
    ]);
  });
});

describe("isOpen", () => {
  it("joined and lost are closed", () => {
    expect(isOpen("new")).toBe(true);
    expect(isOpen("call_done")).toBe(true);
    expect(isOpen("joined")).toBe(false);
    expect(isOpen("lost")).toBe(false);
  });
});
