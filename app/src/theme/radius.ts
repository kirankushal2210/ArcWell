/**
 * Radius and border tokens. Mirrors docs/design/theme-tokens.css §5.
 * Depth comes from surface steps only: there are no shadow or elevation tokens (C2).
 */

export const radius = {
  /** Inputs, chips, set cells. */
  sm: 8,
  /** Cards, buttons. */
  md: 12,
  /** Bottom sheets, drawer edge. */
  lg: 20,
  /** Pills, avatars, status chips. */
  full: 9999,
} as const;

export const borderWidth = 1;
/** 1 dp border plus 1 dp ring, as in the spec sheet. */
export const focusRingWidth = 2;
