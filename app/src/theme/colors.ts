/**
 * Colour tokens: Liquid Glass with the Stone palette, dark only (D67). Mirrors
 * docs/design/theme-tokens.css (DESIGN.md §5). Colour on charcoal, dark text on colour;
 * glass only for the functional layer (tab bar, + button, toolbar buttons, sheets).
 * This folder is the only place hex values may appear; `npm run tokens:check`
 * fails if this file and the CSS drift apart.
 */

/** Raw palette, named by hue. Components never read these directly. */
export const palette = {
  ink900: "#141416",
  ink800: "#1D1E21",
  ink700: "#26272B",
  ink650: "#2A2B30",
  ink600: "#303136",
  ink500: "#5E5F66",
  ink400: "#77787F",
  mist300: "#9C9CA6",
  mist200: "#CFD2D8",
  mist100: "#E8EAEE",
  mist50: "#ECEDF0",
  honey400: "#E8B65E",
  sage400: "#A9C79E",
  slate400: "#9FB4DC",
  rose400: "#E79AA8",
  coral400: "#F2877F",
} as const;

/** Semantic roles: what components use. Contrast ratios are in theme-tokens.css. */
export const colors = {
  /** App background (charcoal). */
  bg: palette.ink900,
  /** Cards. */
  surface: palette.ink800,
  /** Inputs, pressed states, secondary buttons. */
  surfaceRaised: palette.ink700,

  text: palette.mist50,
  textMuted: palette.mist300,
  /** Disabled controls only (WCAG-exempt). */
  textDisabled: palette.ink500,

  /** Primary actions are soft white with dark text. */
  brand: palette.mist100,
  brandHover: palette.mist200,
  onBrand: palette.ink900,

  /** Selection, focus, active tab. */
  accent: palette.mist50,
  onAccent: palette.ink900,

  /** Pillars: fills, rings, numbers and markers. Text on a pillar fill uses `onPillar`. */
  training: palette.honey400,
  nutrition: palette.sage400,
  recovery: palette.slate400,
  onPillar: palette.ink900,

  success: palette.sage400,
  /** Needs attention and new items (rose). */
  warning: palette.rose400,
  /** Errors and destructive actions only. */
  danger: palette.coral400,

  /** Decorative dividers only. */
  border: palette.ink600,
  /** Input and tick-box outlines (3:1+). */
  borderStrong: palette.ink400,
  focus: palette.mist50,

  /** Glass controls, drawn over a blur. */
  glass: "rgba(60, 62, 70, 0.42)",
  /** Hairline edge on glass. */
  glassEdge: "rgba(255, 255, 255, 0.16)",
  /** Glass where blur is off or reduced. */
  glassSolid: palette.ink650,

  /** Behind modal sheets and dialogs. */
  scrim: "rgba(0, 0, 0, 0.6)",
} as const;

export type ColorRole = keyof typeof colors;
