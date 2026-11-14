// Women's hormonal health in onboarding (D87). Asked only when sex is female, all optional. It
// changes little by design: the research supports the same evidence-based plan, with two safety
// rules and a few short notes.
// - PCOS / PCOD: healthy eating and activity for everyone with PCOS, no single diet preferred, and
//   benefits even without weight loss (teede2023). The plan's numbers don't change.
// - Pregnant, or a baby in the last year: no calorie deficit; aim for about 150 minutes of moderate
//   activity a week if there's no medical reason not to (mottola2018). Check with a doctor or midwife.
// - Cycle: phase changed performance only trivially on average, so training isn't scheduled around
//   it; notice your own pattern (mcnulty2020).
import type { Answers } from "@/features/onboarding/OnboardingContext";

export const HORMONAL_OPTIONS = [
  "None",
  "PCOS / PCOD",
  "Thyroid condition",
  "Endometriosis",
  "Perimenopause or menopause",
  "Pregnant",
  "Had a baby in the last year",
] as const;

export const WOMENS_SOURCES = ["teede2023", "mottola2018", "mcnulty2020"];

const list = (a: Answers) =>
  a.sex === "female" && Array.isArray(a.hormonal)
    ? (a.hormonal as string[])
    : [];

/** Pregnant or within a year of giving birth: keep calories at maintenance (no deficit). */
export const noDeficit = (a: Answers) => {
  const h = list(a);
  return h.includes("Pregnant") || h.includes("Had a baby in the last year");
};

/** Short notes for the plan screen, most important first. */
export function womensNotes(a: Answers): string[] {
  const h = list(a);
  const out: string[] = [];
  if (h.includes("Pregnant"))
    out.push(
      "Pregnant: calories stay at maintenance, no deficit. Aim for about 150 minutes of moderate activity a week if your doctor or midwife agrees.",
    );
  else if (h.includes("Had a baby in the last year"))
    out.push(
      "New mum: calories stay at maintenance for now. Build back gradually and check with your doctor first.",
    );
  if (h.includes("PCOS / PCOD"))
    out.push(
      "PCOS: no single diet is best. Regular training, protein and fibre help, even without weight loss.",
    );
  if (h.includes("Thyroid condition"))
    out.push("Thyroid: keep taking your treatment; your plan is set as usual.");
  if (h.includes("Endometriosis"))
    out.push(
      "Endometriosis: on painful days, lighter sessions or rest are fine.",
    );
  if (h.includes("Perimenopause or menopause"))
    out.push(
      "Menopause: strength training and enough protein matter more now. Your plan keeps both.",
    );
  if (a.sex === "female" && a.cycle === "irregular")
    out.push(
      "Irregular periods can have many causes. It's worth mentioning to a doctor.",
    );
  return out;
}
