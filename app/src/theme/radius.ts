/**
 * Radius and border tokens. Mirrors docs/design/theme-tokens.css §5.
 * Depth comes from surface steps; glass controls float above content (D67).
 */

export const radius = {
  /** Chips, small buttons, set cells. */
  sm: 10,
  /** Buttons, inputs. */
  md: 12,
  /** Cards. */
  lg: 16,
  /** Sheets, the floating tab bar. */
  xl: 28,
  /** Avatars, round glass buttons, status chips. */
  full: 9999,
} as const;

export const borderWidth = 1;
/** 1 dp border plus 1 dp ring, as in the spec sheet. */
export const focusRingWidth = 2;
