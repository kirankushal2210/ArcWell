import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import {
  borderWidth,
  colors,
  controlHeight,
  radius,
  rhythm,
  space,
  tapMin,
} from "@/theme";

import { PressableScale } from "./PressableScale";
import { Text, type TextTone } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  /** Shows `loadingLabel` and blocks presses. Never a spinner (C10). */
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
};

const look: Record<
  ButtonVariant,
  { bg: string; pressedBg: string; border: string; tone: TextTone }
> = {
  primary: {
    bg: colors.brand,
    pressedBg: colors.brandHover,
    border: colors.brand,
    tone: "onBrand",
  },
  secondary: {
    bg: "transparent",
    pressedBg: colors.surfaceRaised,
    border: colors.borderStrong,
    tone: "default",
  },
  ghost: {
    bg: "transparent",
    pressedBg: colors.surfaceRaised,
    border: "transparent",
    tone: "muted",
  },
  destructive: {
    bg: "transparent",
    pressedBg: colors.surfaceRaised,
    border: colors.danger,
    tone: "danger",
  },
};

const iconColor: Record<TextTone, string> = {
  onBrand: colors.onBrand,
  default: colors.text,
  muted: colors.textMuted,
  danger: colors.danger,
  disabled: colors.textDisabled,
  brand: colors.brand,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
};

/**
 * DESIGN.md §6 button: 48 dp tall, 12 dp radius, label 16/600. One primary per
 * screen, in the bottom half (spec sheet). Disabled is a raised fill with
 * disabled text, so it never relies on opacity alone.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon: Icon,
  disabled,
  loading,
  loadingLabel,
  fullWidth,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const v = look[variant];
  const tone: TextTone = inactive ? "disabled" : v.tone;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={testID}
      style={[styles.hit, fullWidth && styles.full]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.body,
            inactive
              ? styles.inactive
              : {
                  backgroundColor: pressed ? v.pressedBg : v.bg,
                  borderColor: v.border,
                },
          ]}
        >
          {Icon && <Icon size={20} color={iconColor[tone]} strokeWidth={2} />}
          <Text variant="body" weight="semibold" tone={tone} numberOfLines={1}>
            {loading && loadingLabel ? loadingLabel : label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  hit: { minHeight: controlHeight, minWidth: tapMin, alignSelf: "flex-start" },
  full: { alignSelf: "stretch" },
  body: {
    minHeight: controlHeight,
    flexDirection: "row",
    alignItems: "center",
    // A lone label is centred inside its button (C6 exception).
    justifyContent: "center",
    gap: rhythm.inline,
    paddingHorizontal: space[4],
    // Height comes from minHeight (48 incl. the 1 dp border); the label grows it at large font sizes.
    paddingVertical: 0,
    borderRadius: radius.md,
    borderWidth,
  },
  inactive: {
    backgroundColor: colors.surfaceRaised,
    borderColor: "transparent",
  },
});
