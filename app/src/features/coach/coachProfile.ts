// The coach's own profile and settings (D65), shown on the invite page and to their clients.
// Starts from the sample coach; coach onboarding (CO-06 to CO-09) fills the same fields.
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
};

export type CoachSettings = {
  checkIns: boolean;
  messages: boolean;
  followUps: boolean;
  renewals: boolean;
  /** Show transformation photos (with client consent) on the invite page. */
  showTransformations: boolean;
  /** The coach's Arcwell plan (D40, D41). Sample build: previewed from Plan and billing. */
  billing?: "active" | "grace" | "lapsed";
  clientLimit?: number;
  /** First-run tips already dismissed. */
  tipsSeen?: string[];
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
