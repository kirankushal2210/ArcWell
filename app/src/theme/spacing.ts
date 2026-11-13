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
/** Main buttons look 36 dp tall; their tap area stays `tapMin` (D81, was 40 in D67). */
export const controlHeight = 36;
/** Small buttons look 28 dp tall; tap area still `tapMin`. */
export const controlHeightSm = 28;
/** Text inputs stay 40 dp so typing isn't cramped. */
export const inputHeight = 40;
