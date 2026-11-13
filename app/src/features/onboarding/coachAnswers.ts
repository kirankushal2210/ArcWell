// Coach onboarding answers (CO-06 to CO-10) turned into the coach's profile and first training
// template. Pure, so the mapping is tested; the ready screen saves the result.
import type { CoachProfile } from "@/features/coach/coachProfile";
import type { SheetImport } from "@/features/coach/importSheet";
import {
  emptyProgram,
  programFromTemplate,
  type TrainingProgram,
} from "@/features/coach/plans";

import type { Answers } from "./OnboardingContext";

type Service = { name: string; price: string; includes: string };

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** "12-week fat loss · ₹4,500 / month · training + meal plan", as the profile lists services. */
export const serviceLine = (s: Service) =>
  [s.name, s.price, s.includes]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(" · ");

/** The coach's profile from their answers; anything skipped is left empty, not the sample's. */
export function profileFromAnswers(
  a: Answers,
  base: CoachProfile,
): CoachProfile {
  const services = ((a.services as Service[] | undefined) ?? [])
    .filter((s) => s.name.trim())
    .map(serviceLine);
  return {
    ...base,
    name: text(a.displayName) || base.name,
    city: text(a.city) || base.city,
    specialisations: ((a.specialisations as string[] | undefined) ?? []).slice(
      0,
      3,
    ),
    bio: text(a.bio),
    instagram: text(a.instagram)
      .replace(/^@/, "")
      .replace(/[^A-Za-z0-9._]/g, ""),
    years: Math.max(0, Number(text(a.yearsCoaching)) || 0),
    certifications: text(a.certifications),
    services,
    photo: text(a.photo) || undefined,
  };
}

/** Which Arcwell starter fits the coach's first specialisation. */
export function starterFor(specialisations: string[]) {
  const s = specialisations[0] ?? "";
  return s === "Fat loss" || s === "PCOS" || s === "Women's fitness"
    ? "Fat loss"
    : s === "Muscle gain" || s === "Contest prep"
      ? "Muscle gain"
      : s === "Strength"
        ? "Strength"
        : "Beginner";
}

export type FirstTemplate =
  | { kind: "ready"; program: TrainingProgram }
  /** A spreadsheet with rows to fix: the coach checks it on the import screen first. */
  | { kind: "review"; draft: SheetImport }
  | { kind: "none" };

/** The first training template the coach chose on CO-10. */
export function firstTemplate(a: Answers): FirstTemplate {
  if (a.firstTemplate === "arcwell")
    return {
      kind: "ready",
      program: programFromTemplate(
        starterFor((a.specialisations as string[] | undefined) ?? []),
      ),
    };
  if (a.firstTemplate === "scratch")
    return {
      kind: "ready",
      program: { ...emptyProgram(), name: "My first program" },
    };
  if (a.firstTemplate === "spreadsheet") {
    const draft = (a.templateSheet as { draft?: SheetImport } | undefined)
      ?.draft;
    if (!draft) return { kind: "none" };
    if (draft.unmatched.length) return { kind: "review", draft };
    return {
      kind: "ready",
      program: {
        ...draft.program,
        name: draft.program.name || "Imported program",
      },
    };
  }
  return { kind: "none" };
}
