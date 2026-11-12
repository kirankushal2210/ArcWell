// Instagram leads (D66): most of a coach's clients start in Instagram DMs, so Instagram leads carry
// the handle, where on Instagram they came from (DM, reel, post, story, comment, bio link, ad) and
// which piece of content, so the coach sees what actually brings clients. Leads are added by hand
// in this build; importing DMs needs the Instagram messaging API and Meta app review (later).
import { crmId, type Lead, type Period } from "./crm";

export type IgTouch =
  "dm" | "reel" | "post" | "story" | "comment" | "bio_link" | "ad";

export const TOUCH_LABEL: Record<IgTouch, string> = {
  dm: "DM",
  reel: "Reel",
  post: "Post",
  story: "Story reply",
  comment: "Comment",
  bio_link: "Bio link",
  ad: "Ad",
};
export const TOUCHES = Object.keys(TOUCH_LABEL) as IgTouch[];

export type IgInfo = {
  /** Without the @. */
  handle: string;
  touch: IgTouch;
  /** The coach's name for the post or reel, e.g. "Priya's 12-week reel". */
  content?: string;
};

export const cleanHandle = (h: string) =>
  h
    .trim()
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9._]/g, "");
export const profileUrl = (h: string) => `https://instagram.com/${h}`;
export const dmUrl = (h: string) => `https://ig.me/m/${h}`;

/** Replies coaches paste into DMs; {name} becomes the lead's first name. */
export const DM_TEMPLATES: { label: string; text: string }[] = [
  {
    label: "Pricing",
    text: "Hi {name}! Thanks for reaching out. Online coaching is ₹3,500 a month: your own training and Indian meal plan, weekly check-ins and chat in the Arcwell app. Want to hop on a quick call this week?",
  },
  {
    label: "Book a call",
    text: "Hi {name}, happy to help! When suits you for a 15-minute call? I'll ask about your goals and routine and tell you exactly how I'd coach you.",
  },
  {
    label: "Follow up",
    text: "Hey {name}, just checking in. Still keen to get started? I've got two spots open this month.",
  },
  {
    label: "After the call",
    text: "Great talking, {name}! Here's the link to join: everything's set up for you in the app.",
  },
];
export const fillTemplate = (text: string, name: string) =>
  text.replaceAll("{name}", name.split(" ")[0] || "there");

const SAMPLE_IG: Record<string, IgInfo> = {
  l1: { handle: "neha.rao.fit", touch: "dm", content: "Wedding prep story" },
  l4: {
    handle: "farhan.lifts",
    touch: "reel",
    content: "Priya's 12-week reel",
  },
  l8: { handle: "kabir_m", touch: "post", content: "Fat loss myths carousel" },
};

const ago = (days: number, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const ev = (
  days: number,
  kind: Lead["events"][number]["kind"],
  text: string,
) => ({
  id: crmId("v"),
  at: ago(days),
  kind,
  text,
});

/** More Instagram leads, including the two clients who came from Instagram. */
function extraLeads(): Lead[] {
  return [
    {
      id: "l11",
      name: "Rahul Verma",
      source: "instagram",
      goal: "Build muscle",
      stage: "joined",
      createdAt: ago(38),
      clientId: "rahul",
      instagram: {
        handle: "rahulverma.gym",
        touch: "reel",
        content: "Priya's 12-week reel",
      },
      events: [
        ev(38, "created", "Commented on the reel, moved to DMs"),
        ev(36, "call", "Consultation call"),
        ev(35, "stage", "Joined · online coaching"),
      ],
    },
    {
      id: "l12",
      name: "Ananya Iyer",
      source: "instagram",
      goal: "Lose fat",
      stage: "joined",
      createdAt: ago(45),
      clientId: "ananya",
      instagram: {
        handle: "ananya.iyer",
        touch: "story",
        content: "Client wins story",
      },
      events: [
        ev(45, "created", "Replied to a client-wins story"),
        ev(44, "call", "Call, liked the check-ins"),
        ev(42, "stage", "Joined · online coaching"),
      ],
    },
    {
      id: "l13",
      name: "Ishita Bose",
      source: "instagram",
      goal: "PCOS-friendly fat loss",
      stage: "contacted",
      createdAt: ago(3),
      followUp: ago(-1).slice(0, 10),
      instagram: {
        handle: "ishita.b",
        touch: "reel",
        content: "Priya's 12-week reel",
      },
      events: [
        ev(3, "created", "DM: does your plan work with PCOS?"),
        ev(2, "message", "Sent pricing reply"),
      ],
    },
    {
      id: "l14",
      name: "Mohit Jain",
      source: "instagram",
      goal: "Gain weight, skinny since school",
      stage: "new",
      createdAt: ago(0, 8),
      followUp: ago(0).slice(0, 10),
      instagram: { handle: "mohit.j_", touch: "bio_link" },
      events: [ev(0, "created", "Tapped the link in bio, asked a question")],
    },
  ];
}

/** Adds Instagram details and leads to sample data saved before D66. */
export function withInstagram(leads: Lead[]): Lead[] {
  const out = leads.map((l) =>
    !l.instagram && SAMPLE_IG[l.id] ? { ...l, instagram: SAMPLE_IG[l.id] } : l,
  );
  const ids = new Set(out.map((l) => l.id));
  return [...out, ...extraLeads().filter((l) => !ids.has(l.id))];
}

/** Instagram numbers for the period: by touchpoint and by piece of content. */
export function igStats(leads: Lead[], period: Period, now = new Date()) {
  const since = period === "all" ? 0 : now.getTime() - Number(period) * 864e5;
  const ig = leads.filter(
    (l) => l.source === "instagram" && new Date(l.createdAt).getTime() >= since,
  );
  const all = leads.filter((l) => new Date(l.createdAt).getTime() >= since);
  const joined = ig.filter((l) => l.stage === "joined").length;
  const decided = joined + ig.filter((l) => l.stage === "lost").length;
  const byTouch = TOUCHES.map((t) => ({
    touch: t,
    leads: ig.filter((l) => l.instagram?.touch === t).length,
    joined: ig.filter((l) => l.instagram?.touch === t && l.stage === "joined")
      .length,
  }))
    .filter((x) => x.leads)
    .sort((a, b) => b.leads - a.leads);
  const names = Array.from(
    new Set(
      ig.map((l) => l.instagram?.content).filter((x): x is string => !!x),
    ),
  );
  const byContent = names
    .map((n) => ({
      content: n,
      leads: ig.filter((l) => l.instagram?.content === n).length,
      joined: ig.filter(
        (l) => l.instagram?.content === n && l.stage === "joined",
      ).length,
    }))
    .sort((a, b) => b.joined - a.joined || b.leads - a.leads);
  return {
    leads: ig.length,
    share: all.length ? Math.round((ig.length / all.length) * 100) : 0,
    joined,
    conversion: decided ? Math.round((joined / decided) * 100) : null,
    open: ig.filter((l) => l.stage !== "joined" && l.stage !== "lost").length,
    byTouch,
    byContent,
  };
}

/** Content names already used, newest first, for picking when adding a lead. */
export const contentNames = (leads: Lead[]) =>
  Array.from(
    new Set(
      [...leads]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((l) => l.instagram?.content)
        .filter((x): x is string => !!x),
    ),
  );
