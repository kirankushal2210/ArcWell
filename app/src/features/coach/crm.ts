// Coach CRM (D63): leads with a stage and a dated timeline, client accounts (package, fee, renewal,
// payment status recorded by hand; payments stay outside the app, D56), and the numbers the
// Business overview shows. Plain functions over sample data; the real build reads the same
// shapes from Supabase.
import type { Client } from "./sampleData";

// ---------- Leads ----------

export type LeadSource =
  "instagram" | "whatsapp" | "referral" | "walk_in" | "invite_link" | "other";

export const SOURCE_LABEL: Record<LeadSource, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  referral: "Referral",
  walk_in: "Walk-in",
  invite_link: "Invite link",
  other: "Other",
};

export type LeadStage =
  "new" | "contacted" | "call_booked" | "call_done" | "joined" | "lost";

/** The pipeline in order; "lost" (not joined) sits beside it. */
export const STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "call_booked", label: "Call booked" },
  { key: "call_done", label: "Call done" },
  { key: "joined", label: "Joined" },
  { key: "lost", label: "Not joined" },
];
export const STAGE_LABEL = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
) as Record<LeadStage, string>;
export const isOpen = (s: LeadStage) => s !== "joined" && s !== "lost";

export const LOST_REASONS = [
  "Price",
  "Timing",
  "Chose another coach",
  "Stopped replying",
  "Wanted in person",
  "Other",
] as const;

export type LeadEventKind =
  "created" | "call" | "message" | "note" | "stage" | "follow_up";

export type LeadEvent = {
  id: string;
  /** ISO date-time. */
  at: string;
  kind: LeadEventKind;
  text: string;
};

export type Lead = {
  id: string;
  name: string;
  phone?: string;
  source: LeadSource;
  goal?: string;
  stage: LeadStage;
  /** ISO date-time. */
  createdAt: string;
  /** Next follow-up, YYYY-MM-DD. */
  followUp?: string;
  /** Booked call, ISO date-time. */
  callAt?: string;
  lostReason?: string;
  /** Set when the lead joined as a client. */
  clientId?: string;
  events: LeadEvent[];
};

let seq = 0;
export const crmId = (p: string) =>
  `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** YYYY-MM-DD n days from today (negative for the past). */
export function dayOffset(n: number, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

const at = (daysAgo: number, hour = 11) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const ev = (
  daysAgo: number,
  kind: LeadEventKind,
  text: string,
  hour?: number,
): LeadEvent => ({ id: crmId("v"), at: at(daysAgo, hour), kind, text });

/** Sample pipeline: a believable month for a coach with ~8 clients. */
export function sampleLeads(): Lead[] {
  return [
    {
      id: "l1",
      name: "Neha Rao",
      phone: "98450 11223",
      source: "instagram",
      goal: "Lose fat before a wedding in March",
      stage: "new",
      createdAt: at(0, 9),
      followUp: dayOffset(0),
      events: [ev(0, "created", "Asked about pricing in a DM", 9)],
    },
    {
      id: "l2",
      name: "Siddharth Gupta",
      phone: "99001 22334",
      source: "referral",
      goal: "Build muscle, trains at home",
      stage: "call_booked",
      createdAt: at(4),
      callAt: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(19, 0, 0, 0);
        return d.toISOString();
      })(),
      events: [
        ev(4, "created", "Referred by Priya Sharma"),
        ev(3, "message", "Sent services and fees on WhatsApp"),
        ev(2, "stage", "Call booked for tomorrow, 7 pm"),
      ],
    },
    {
      id: "l3",
      name: "Aisha Khan",
      phone: "98861 33445",
      source: "walk_in",
      goal: "General fitness after a back injury",
      stage: "contacted",
      createdAt: at(6),
      followUp: dayOffset(-1),
      events: [
        ev(6, "created", "Met at the gym front desk"),
        ev(5, "call", "Short call, wants to start next month", 18),
      ],
    },
    {
      id: "l4",
      name: "Farhan Ali",
      phone: "97400 44556",
      source: "instagram",
      goal: "Stage prep, first show in April",
      stage: "call_done",
      createdAt: at(9),
      followUp: dayOffset(1),
      events: [
        ev(9, "created", "Replied to a transformation post"),
        ev(8, "message", "Sent the competition prep package"),
        ev(6, "call", "40 min call; deciding between 3 and 6 months", 20),
      ],
    },
    {
      id: "l5",
      name: "Meera Nair",
      source: "invite_link",
      goal: "Lose fat",
      stage: "joined",
      createdAt: at(1),
      clientId: "meera",
      events: [ev(1, "created", "Joined with your invite link")],
    },
    {
      id: "l6",
      name: "Rohan Das",
      source: "invite_link",
      goal: "Get stronger",
      stage: "joined",
      createdAt: at(2),
      clientId: "rohan",
      events: [ev(2, "created", "Joined with your invite link")],
    },
    {
      id: "l7",
      name: "Priya Sharma",
      phone: "98111 55667",
      source: "referral",
      goal: "Lose fat",
      stage: "joined",
      createdAt: at(26),
      clientId: "priya",
      events: [
        ev(26, "created", "Referred by a gym member"),
        ev(25, "call", "Consultation call", 19),
        ev(24, "stage", "Joined on the 3-month plan"),
      ],
    },
    {
      id: "l8",
      name: "Kabir Malhotra",
      phone: "99881 66778",
      source: "instagram",
      goal: "Build muscle",
      stage: "lost",
      lostReason: "Price",
      createdAt: at(14),
      events: [
        ev(14, "created", "Asked about online coaching"),
        ev(13, "call", "Liked the plan, found the fee high", 21),
        ev(10, "stage", "Not joined · Price"),
      ],
    },
    {
      id: "l9",
      name: "Tanvi Shah",
      source: "whatsapp",
      goal: "Postpartum fitness",
      stage: "lost",
      lostReason: "Timing",
      createdAt: at(20),
      events: [
        ev(20, "created", "Message from a friend's referral"),
        ev(12, "stage", "Not joined · Timing, will come back in January"),
      ],
    },
    {
      id: "l10",
      name: "Dev Patel",
      source: "other",
      goal: "Marathon strength",
      stage: "lost",
      lostReason: "Stopped replying",
      createdAt: at(40),
      events: [
        ev(40, "created", "Website form"),
        ev(31, "stage", "Not joined · Stopped replying"),
      ],
    },
  ];
}

// ---------- Client accounts ----------

export type Billing = "monthly" | "quarterly" | "half_yearly" | "one_off";
export const BILLING_LABEL: Record<Billing, string> = {
  monthly: "Monthly",
  quarterly: "Every 3 months",
  half_yearly: "Every 6 months",
  one_off: "One-off",
};
const BILLING_MONTHS: Record<Billing, number> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  one_off: 0,
};

export type PaymentStatus = "paid" | "due" | "overdue";
export const PAID_LABEL: Record<PaymentStatus, string> = {
  paid: "Paid",
  due: "Due",
  overdue: "Overdue",
};

export type ClientAccount = {
  package: string;
  /** What the client pays per billing cycle, in rupees. */
  feeInr: number;
  billing: Billing;
  /** YYYY-MM-DD. */
  startedAt: string;
  paid: PaymentStatus;
  source?: LeadSource;
  leadId?: string;
};

/** Next renewal on or after today (YYYY-MM-DD), or undefined for one-off packages. */
export function renewsOn(a: ClientAccount, today = new Date()) {
  const step = BILLING_MONTHS[a.billing];
  if (!step) return undefined;
  const d = new Date(`${a.startedAt}T00:00:00`);
  const t = ymd(today);
  for (let i = 0; i < 240 && ymd(d) <= t; i++) d.setMonth(d.getMonth() + step);
  return ymd(d);
}

/** Monthly value of a client's fee, for the revenue estimate. */
export const monthlyValue = (a: ClientAccount) =>
  a.billing === "one_off"
    ? 0
    : Math.round(a.feeInr / BILLING_MONTHS[a.billing]);

const SAMPLE_ACCOUNTS: Record<string, Partial<ClientAccount>> = {
  priya: {
    package: "Fat loss · 3 months",
    feeInr: 9000,
    billing: "quarterly",
    source: "referral",
    leadId: "l7",
  },
  rahul: {
    package: "Online coaching",
    feeInr: 3500,
    billing: "monthly",
    paid: "due",
    source: "instagram",
  },
  ananya: {
    package: "Online coaching",
    feeInr: 3500,
    billing: "monthly",
    source: "instagram",
  },
  karan: {
    package: "Strength · 6 months",
    feeInr: 18000,
    billing: "half_yearly",
    source: "walk_in",
  },
  venkata: {
    package: "Online coaching",
    feeInr: 3500,
    billing: "monthly",
    paid: "overdue",
    source: "referral",
  },
  arjun: {
    package: "Online coaching",
    feeInr: 3500,
    billing: "monthly",
    source: "whatsapp",
  },
  meera: {
    package: "Online coaching",
    feeInr: 3500,
    billing: "monthly",
    paid: "due",
    source: "invite_link",
    leadId: "l5",
  },
  rohan: {
    package: "Online coaching",
    feeInr: 3500,
    billing: "monthly",
    paid: "due",
    source: "invite_link",
    leadId: "l6",
  },
};

/** The client's account, or a starting one from their join date. */
export function accountOf(c: Client): ClientAccount {
  if (c.account) return c.account;
  const s = SAMPLE_ACCOUNTS[c.id] ?? {};
  return {
    package: s.package ?? "Online coaching",
    feeInr: s.feeInr ?? 3500,
    billing: s.billing ?? "monthly",
    startedAt: dayOffset(-(c.weeksWithYou || 0) * 7),
    paid: s.paid ?? (c.pending ? "due" : "paid"),
    source: s.source,
    leadId: s.leadId,
  };
}

// ---------- Numbers for the overview ----------

export type Period = "30" | "90" | "all";

export function crmStats(
  leads: Lead[],
  clients: Client[],
  period: Period,
  now = new Date(),
) {
  const since =
    period === "all" ? 0 : now.getTime() - Number(period) * 24 * 60 * 60 * 1000;
  const inPeriod = (iso: string) => new Date(iso).getTime() >= since;
  const newLeads = leads.filter((l) => inPeriod(l.createdAt));
  const calls = leads
    .flatMap((l) => l.events)
    .filter((e) => e.kind === "call" && inPeriod(e.at)).length;
  const joined = newLeads.filter((l) => l.stage === "joined").length;
  const lost = newLeads.filter((l) => l.stage === "lost");
  const decided = joined + lost.length;
  const bySource = (Object.keys(SOURCE_LABEL) as LeadSource[])
    .map((s) => ({
      source: s,
      leads: newLeads.filter((l) => l.source === s).length,
      joined: newLeads.filter((l) => l.source === s && l.stage === "joined")
        .length,
    }))
    .filter((x) => x.leads > 0)
    .sort((a, b) => b.leads - a.leads);
  const reasons = LOST_REASONS.map((r) => ({
    reason: r,
    count: lost.filter((l) => l.lostReason === r).length,
  })).filter((x) => x.count > 0);

  const linked = clients.filter((c) => !c.pending && c.id !== "me");
  const count = (s: Client["status"]) =>
    linked.filter((c) => c.status === s).length;
  const completed = count("completed");
  const avgWeeks = linked.length
    ? Math.round(
        linked.reduce((s, c) => s + (c.weeksWithYou || 0), 0) / linked.length,
      )
    : 0;
  const coached = linked.filter((c) => c.status !== "completed");
  const accounts = coached.map((c) => ({ c, a: accountOf(c) }));
  const today = ymd(now);
  const in14 = dayOffset(14, now);
  return {
    leads: newLeads.length,
    open: leads.filter((l) => isOpen(l.stage)).length,
    calls,
    joined,
    lost: lost.length,
    conversion: decided ? Math.round((joined / decided) * 100) : null,
    bySource,
    reasons,
    clients: {
      active: count("active"),
      paused: count("paused"),
      leaving: count("leaving"),
      completed,
      total: linked.length,
      /** Share of everyone you've coached who is still with you. */
      retention: linked.length
        ? Math.round(((linked.length - completed) / linked.length) * 100)
        : null,
      avgWeeks,
    },
    money: {
      monthly: accounts
        .filter(({ c }) => c.status === "active" || c.status === "leaving")
        .reduce((s, { a }) => s + monthlyValue(a), 0),
      due: accounts.filter(({ a }) => a.paid === "due").length,
      overdue: accounts.filter(({ a }) => a.paid === "overdue").length,
    },
    followUps: leads.filter(
      (l) => isOpen(l.stage) && l.followUp && l.followUp <= today,
    ),
    calls_booked: leads
      .filter((l) => l.stage === "call_booked" && l.callAt)
      .sort((a, b) => (a.callAt ?? "").localeCompare(b.callAt ?? "")),
    renewals: accounts
      .map(({ c, a }) => ({ c, a, on: renewsOn(a, now) }))
      .filter((x) => x.on && x.on <= in14)
      .sort((x, y) => (x.on ?? "").localeCompare(y.on ?? "")),
  };
}

/** "Today", "Tomorrow", "Yesterday", "3 days ago", or "Fri, 14 Nov". */
export function dayText(day: string, now = new Date()) {
  const t = ymd(now);
  if (day === t) return "Today";
  if (day === dayOffset(1, now)) return "Tomorrow";
  if (day === dayOffset(-1, now)) return "Yesterday";
  const d = new Date(`${day}T00:00:00`);
  const diff = Math.round(
    (new Date(`${t}T00:00:00`).getTime() - d.getTime()) / 86400000,
  );
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export const timeText = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** dayText for the middle of a sentence: "renews tomorrow", "renews Fri, 22 Jan". */
export function dayInline(day: string, now = new Date()) {
  const t = dayText(day, now);
  return /^(Today|Tomorrow|Yesterday|\d+ days ago)$/.test(t)
    ? t.toLowerCase()
    : t;
}

/** "Joined this week" or "6 weeks with you". */
export const tenureText = (weeks: number) =>
  weeks < 1
    ? "Joined this week"
    : `${weeks} ${weeks === 1 ? "week" : "weeks"} with you`;

/** "today", "yesterday", "3 days ago" or "on Fri, 22 Jan", after a verb: "opted in today". */
export function onDay(day: string, now = new Date()) {
  const t = dayInline(day, now);
  return /^(today|tomorrow|yesterday|\d+ days ago)$/.test(t) ? t : `on ${t}`;
}
