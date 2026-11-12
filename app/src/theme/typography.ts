/**
 * Type tokens. Mirrors docs/design/theme-tokens.css §3. Inter only (D46).
 *
 * Inter is loaded at runtime from @expo-google-fonts/inter (D48 Phase 0 choice),
 * which registers one family name per weight. Screens never see those names:
 * they pick a role from `typography`, and `fontFamilyFor` maps the weight.
 */
import type { TextStyle } from "react-native";

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export type FontWeight = keyof typeof fontWeights;

/** Family names registered by useFonts in the root layout. */
export const fontFamilies: Record<FontWeight, string> = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const fontFamilyFor = (weight: FontWeight) => fontFamilies[weight];

/** Sizes in dp (1rem = 16). RN scales them with the system font-size setting. */
export const textSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  "2xl": 32,
} as const;

export type TextSize = keyof typeof textSizes;

export const leading: Record<TextSize, number> = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 24,
  xl: 28,
  "2xl": 40,
};

/** Tracking in em, from Inter's dynamic metrics. Never one value for all sizes. */
export const trackingEm: Record<TextSize, number> = {
  xs: 0,
  sm: -0.006,
  base: -0.011,
  lg: -0.014,
  xl: -0.018,
  "2xl": -0.022,
};

/** Uppercase eyebrows only. */
export const trackingCapsEm = 0.06;

/** RN letterSpacing is in dp, so convert em at each size. */
export const letterSpacingFor = (size: TextSize, em = trackingEm[size]) =>
  Math.round(textSizes[size] * em * 100) / 100;

const role = (size: TextSize, weight: FontWeight): TextStyle => ({
  fontFamily: fontFamilyFor(weight),
  fontSize: textSizes[size],
  lineHeight: leading[size],
  letterSpacing: letterSpacingFor(size),
});

/** Semantic roles (DESIGN.md §5): size, leading, weight and tracking as one set. */
export const typography = {
  display: role("2xl", "bold"),
  title: role("xl", "semibold"),
  heading: role("lg", "semibold"),
  body: role("base", "regular"),
  label: role("sm", "medium"),
  caption: role("xs", "regular"),
} as const;

export type TypeRole = keyof typeof typography;

/** Every weight, rep, kcal, timer and delta uses tabular numerals (C7). */
export const tabularNums: TextStyle = { fontVariant: ["tabular-nums"] };
