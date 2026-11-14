// The coach's own profile and settings (D65), shown on the invite page and to their clients.
// Starts from the sample coach; finishing coach onboarding saves its answers over it.
import { router } from "expo-router";
import { Menu } from "lucide-react-native";

export const SPECIALISATIONS = [
  "Fat loss",
  "Strength",
  "Muscle gain",
  "Women's fitness",
  "Beginners",
  "Contest prep",
  "Home workouts",
  "PCOS",
  "Endurance",
  "Mobility",
];

export type CoachProfile = {
  name: string;
  city: string;
  /** Up to three (CO-07). */
  specialisations: string[];
  bio: string;
  instagram: string;
  years: number;
  /** Self-reported (D43). */
  certifications: string;
  /** Packages as shown on the profile, e.g. "Online coaching · ₹3,500 a month". */
  services: string[];
  /** Profile photo (K-20). Sample build: a local URI; real builds upload through a signed URL (D72). */
  photo?: string;
};

/**
 * Split a service into its name and price for display: the price is everything from the first
 * part with a rupee amount, e.g. "Fat loss · 3 months · ₹9,000" → "Fat loss · 3 months", "₹9,000".
 */
export function splitService(s: string): { name: string; price?: string } {
  const parts = s.split(/\s+·\s+/);
  const i = parts.findIndex((p) => /₹\s?\d/.test(p));
  if (i <= 0) return { name: s };
  return {
    name: parts.slice(0, i).join(" · "),
    price: parts.slice(i).join(" · "),
  };
}

export type CoachSettings = {
  checkIns: boolean;
  messages: boolean;
  followUps: boolean;
  renewals: boolean;
  /** Show approved transformation photos on the profile, the invite page and My coach. */
  showTransformations: boolean;
  /** The coach's Arcwell plan (D40, D41). Sample build: previewed from Plan and billing. */
  billing?: "active" | "grace" | "lapsed";
  clientLimit?: number;
  /** First-run tips already dismissed. */
  tipsSeen?: string[];
  /** One data export at a time (K-21, X-09). */
  export?: { status: "preparing" | "failed"; requestedAt: string };
};

export const defaultCoachProfile = (): CoachProfile => ({
  name: "Coach Anjali",
  city: "Bengaluru",
  specialisations: ["Fat loss", "Women's fitness", "Contest prep"],
  bio: "Online coach for busy professionals. Indian meals, simple training, steady results.",
  instagram: "anjali.trains",
  years: 6,
  certifications: "ACE Personal Trainer, K11 Sports Nutrition",
  services: [
    "Online coaching · ₹3,500 a month",
    "Fat loss · 3 months · ₹9,000",
    "Contest prep · 6 months · ₹18,000",
  ],
});

export const defaultCoachSettings = (): CoachSettings => ({
  checkIns: true,
  messages: true,
  followUps: true,
  renewals: true,
  showTransformations: true,
});

/** The hamburger on every coach tab (D65). */
export const menuAction = {
  icon: Menu,
  label: "Menu",
  onPress: () => router.push("/coach/menu"),
};

/**
 * The coach's personal invite link, from their name (CO-11), the same everywhere it's shown.
 * Placeholder domain until the invite-link domain is chosen (PLAN.md); the server issues the real one.
 */
export function coachLink(name: string, code?: string) {
  // With accounts the link carries the coach's real general invite code (D107).
  if (code) return `arcwell.app/j/${code}`;
  const slug =
    name
      .toLowerCase()
      .replace(/^coach\s+/, "")
      .replace(/[^a-z0-9]+/g, "") || "yourname";
  return `arcwell.app/j/${slug}`;
}
