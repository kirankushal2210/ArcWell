// Body fat levels for onboarding (D84, D87): the eight visual reference levels for men and for
// women. Women carry more essential fat, so their levels sit higher. Pure data, shared by the
// picker and tests.
export const BODY_FAT_LEVELS: Record<"male" | "female", number[]> = {
  male: [8, 10, 15, 20, 25, 30, 35, 40],
  female: [12, 15, 20, 25, 30, 35, 40, 45],
};

export const levelLabel = (v: number, last: boolean) =>
  last ? `${v}%+` : `${v}%`;
