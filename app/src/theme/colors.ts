/**
 * Colour tokens: black and red, dark only (D83, replacing D67's Stone palette). Mirrors
 * docs/design/theme-tokens.css (DESIGN.md §5). Red primary with white text, dark text on other fills;
 * glass only for the functional layer (tab bar, + button, toolbar buttons, sheets).
 * This folder is the only place hex values may appear; `npm run tokens:check`
 * fails if this file and the CSS drift apart.
 */

/** Raw palette, named by hue. Components never read these directly. */
export const palette = {
  ink900: "#0A0A0A",
  ink800: "#151515",
  ink700: "#1F1F1F",
  ink650: "#1A1A1A",
  ink600: "#2B2B2B",
  ink500: "#5C5C5C",
  ink400: "#767676",
  mist300: "#A3A3A3",
  mist50: "#F2F2F2",
  mist0: "#FFFFFF",
  red600: "#B71C1C",
  red500: "#D32F2F",
  red400: "#FF5A52",
  green400: "#7BD389",
  blue400: "#8AB4F8",
  amber400: "#F5B841",
} as const;

/** Semantic roles: what components use. Contrast ratios are in theme-tokens.css. */
export const colors = {
  /** App background (black). */
  bg: palette.ink900,
  /** Cards. */
  surface: palette.ink800,
  /** Inputs, pressed states, secondary buttons. */
  surfaceRaised: palette.ink700,

  text: palette.mist50,
  textMuted: palette.mist300,
  /** Disabled controls only (WCAG-exempt). */
  textDisabled: palette.ink500,

  /** Primary actions are red with white text. */
  brand: palette.red500,
  brandHover: palette.red600,
  onBrand: palette.mist0,

  /** Selection, focus, active tab. */
  accent: palette.red400,
  onAccent: palette.ink900,

  /** Pillars: fills, rings, numbers and markers. Text on a pillar fill uses `onPillar`. */
  training: palette.red400,
  nutrition: palette.green400,
  recovery: palette.blue400,
  onPillar: palette.ink900,

  success: palette.green400,
  /** Needs attention and new items (amber). */
  warning: palette.amber400,
  /** Errors and destructive actions only. */
  danger: palette.red400,

  /** Decorative dividers only. */
  border: palette.ink600,
  /** Input and tick-box outlines (3:1+). */
  borderStrong: palette.ink400,
  focus: palette.red400,

  /** Glass controls, drawn over a blur. */
  glass: "rgba(36, 36, 36, 0.5)",
  /** Hairline edge on glass. */
  glassEdge: "rgba(255, 255, 255, 0.14)",
  /** Glass where blur is off or reduced. */
  glassSolid: palette.ink650,

  /** Behind modal sheets and dialogs. */
  scrim: "rgba(0, 0, 0, 0.7)",
} as const;

export type ColorRole = keyof typeof colors;
