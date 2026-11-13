// Visual body-fat bands for onboarding (D84). Pure data and helpers, shared by the picker and tests.
export type Range = [number, number];

/** Visual body-fat bands. Women carry more essential fat, so their bands sit higher. */
export const BODY_FAT_BANDS: Record<"male" | "female", Range[]> = {
  male: [
    [3, 4],
    [5, 7],
    [8, 12],
    [13, 17],
    [18, 23],
    [24, 29],
    [30, 34],
    [35, 39],
    [40, 50],
  ],
  female: [
    [10, 13],
    [14, 17],
    [18, 22],
    [23, 27],
    [28, 32],
    [33, 37],
    [38, 42],
    [43, 47],
    [48, 55],
  ],
};

export const bandLabel = (r: Range, last: boolean) =>
  last ? `${r[0]}% +` : `${r[0]}–${r[1]}%`;

/** The answer stored for a band: its middle, rounded. */
export const bandValue = (r: Range) => Math.round((r[0] + r[1]) / 2);
