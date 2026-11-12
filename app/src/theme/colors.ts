/**
 * Colour tokens: monochrome light theme (D50). Mirrors docs/design/theme-tokens.css (DESIGN.md §5).
 * Black is the action colour; colour is kept for small pillar markers and status only.
 * This folder is the only place hex values may appear; `npm run tokens:check`
 * fails if this file and the CSS drift apart.
 */

/** Raw palette, named by hue. Components never read these directly. */
export const palette = {
  grey0: "#FFFFFF",
  grey25: "#F5F5F5",
  grey100: "#EBEBEB",
  grey200: "#E0E0E0",
  grey400: "#A3A3A3",
  grey500: "#7A7A7A",
  grey600: "#5C5C5C",
  charcoal700: "#333333",
  charcoal900: "#111111",
  cyan700: "#0E7490",
  amber600: "#C2570C",
  violet600: "#6D5BD0",
  green700: "#127235",
  amber700: "#A34A06",
  red700: "#C81E1E",
} as const;

/** Semantic roles: what components use. Contrast ratios are in theme-tokens.css. */
export const colors = {
  /** App background (light grey). */
  bg: palette.grey25,
  /** Cards, sheets (white). */
  surface: palette.grey0,
  /** Inputs, pressed states (one step darker than bg). */
  surfaceRaised: palette.grey100,

  text: palette.charcoal900,
  textMuted: palette.grey600,
  /** Disabled controls only (WCAG-exempt). */
  textDisabled: palette.grey400,

  /** Primary actions are black with white text. */
  brand: palette.charcoal900,
  brandHover: palette.charcoal700,
  onBrand: palette.grey0,

  /** Selection, focus, active tab: also black. */
  accent: palette.charcoal900,
  onAccent: palette.grey0,

  /** Pillars: small dots only, never text or fills; bars, rings and charts use `brand` (black). */
  training: palette.cyan700,
  nutrition: palette.amber600,
  recovery: palette.violet600,

  success: palette.green700,
  warning: palette.amber700,
  danger: palette.red700,

  /** Decorative dividers only. */
  border: palette.grey200,
  /** Input, tick-box and secondary-button outlines (3:1+). */
  borderStrong: palette.grey500,
  focus: palette.charcoal900,

  /** Behind modal sheets and dialogs: dims, never blurs. */
  scrim: "rgba(17, 17, 17, 0.4)",
} as const;

export type ColorRole = keyof typeof colors;
