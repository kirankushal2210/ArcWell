// Strength helpers: estimated one-rep max and plates per side.

/**
 * Estimated 1RM with the Epley formula: load × (1 + reps / 30). It's an estimate, most accurate
 * from sets of about 10 reps or fewer; higher-rep sets aren't used.
 */
export function e1rm(kg: number | null, reps: number | null) {
  if (!kg || !reps || reps < 1 || reps > 10) return null;
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

type SetLike = { kg: number | null; reps: number | null; warmup?: boolean };

/** The best estimated 1RM among a session's working sets for one exercise. */
export function bestE1rm(sets: SetLike[]) {
  let best: number | null = null;
  for (const s of sets) {
    if (s.warmup) continue;
    const v = e1rm(s.kg, s.reps);
    if (v !== null && (best === null || v > best)) best = v;
  }
  return best;
}

export const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const BAR_KG = 20;

/** Plates to load on each side of a 20 kg bar for a total, heaviest first. */
export function platesPerSide(totalKg: number, bar = BAR_KG) {
  let side = (totalKg - bar) / 2;
  if (side < 0) return { plates: [] as number[], exact: totalKg === bar };
  const plates: number[] = [];
  for (const p of PLATES)
    while (side + 1e-6 >= p) {
      plates.push(p);
      side -= p;
    }
  return { plates, exact: side < 0.01 };
}

export const platesText = (totalKg: number) => {
  const { plates, exact } = platesPerSide(totalKg);
  if (totalKg < BAR_KG) return `Less than the ${BAR_KG} kg bar`;
  if (!plates.length) return `Empty ${BAR_KG} kg bar`;
  return `Each side: ${plates.join(" + ")} kg${exact ? "" : " (nearest)"}`;
};
