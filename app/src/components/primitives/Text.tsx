import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
} from "react-native";

import {
  colors,
  fontFamilyFor,
  letterSpacingFor,
  tabularNums,
  trackingCapsEm,
  typography,
  type FontWeight,
  type TypeRole,
} from "@/theme";

export type TextTone =
  | "default"
  | "muted"
  | "disabled"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "onBrand"
  | "onPillar";

const toneColor: Record<TextTone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  disabled: colors.textDisabled,
  brand: colors.accent,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  onBrand: colors.onBrand,
  onPillar: colors.onPillar,
};

export type TextProps = RNTextProps & {
  /** Type role from DESIGN.md §5. `eyebrow` is the uppercase 12 px section label. */
  variant?: TypeRole | "eyebrow";
  tone?: TextTone;
  /** Override the role's weight (keeps size, leading and tracking). */
  weight?: FontWeight;
  /** Tabular numerals: use for every weight, rep, kcal, timer and delta (C7). */
  numeric?: boolean;
};

/**
 * The only text component screens use. Left-aligned by default (C6) and always
 * scales with the system font size (C7: never disable font scaling).
 */
export function Text({
  variant = "body",
  tone = "default",
  weight,
  numeric,
  style,
  ...rest
}: TextProps) {
  const base = variant === "eyebrow" ? styles.eyebrow : typography[variant];
  return (
    <RNText
      {...rest}
      allowFontScaling
      style={[
        base,
        { color: toneColor[tone] },
        weight && { fontFamily: fontFamilyFor(weight) },
        numeric && tabularNums,
        styles.left,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  left: { textAlign: "left" },
  eyebrow: {
    ...typography.caption,
    fontFamily: fontFamilyFor("medium"),
    letterSpacing: letterSpacingFor("xs", trackingCapsEm),
    textTransform: "uppercase",
  },
});
