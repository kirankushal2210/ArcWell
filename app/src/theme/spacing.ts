/**
 * Spacing tokens. Mirrors docs/design/theme-tokens.css §4.
 * Rigid 4-point grid: only these steps exist. Use the rhythm aliases so
 * related items sit tight and unrelated groups sit far apart (no uniform spacing).
 */

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

export type SpaceStep = keyof typeof space;

export const rhythm = {
  /** Icon to label, chip to chip. */
  inline: space[2],
  /** Rows within one group. */
  inGroup: space[2],
  /** Card and sheet padding. */
  cardPad: space[4],
  /** Screen side margins. */
  gutter: space[4],
  /** Between unrelated groups. */
  betweenGroups: space[6],
  /** Major sections. */
  section: space[8],
  /** Top of a new page region. */
  sectionBreak: space[12],
} as const;

/** Android 48 dp minimum, stricter than Apple's 44 pt (C5). */
export const tapMin = 48;
export const controlHeight = 48;
