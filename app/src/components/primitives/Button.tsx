import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import {
  colors,
  controlHeight,
  controlHeightSm,
  radius,
  rhythm,
  space,
  tapMin,
} from "@/theme";

import { PressableScale } from "./PressableScale";
import { Text, type TextTone } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonPillar = "training" | "nutrition" | "recovery";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Fills a primary button with a pillar colour (dark text), for that pillar's main action (D67). */
  pillar?: ButtonPillar;
  /** "sm" is 32 dp to look at; both sizes keep a 48 dp tap area. */
  size?: "md" | "sm";
  icon?: LucideIcon;
  disabled?: boolean;
  /** Shows `loadingLabel` and blocks presses. Never a spinner (C10). */
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
};

type Look = { bg: string; pressedBg: string; fg: string; tone: TextTone };

const look: Record<ButtonVariant, Look> = {
  primary: {
    bg: colors.brand,
    pressedBg: colors.brandHover,
    fg: colors.onBrand,
    tone: "onBrand",
  },
  secondary: {
    bg: colors.surfaceRaised,
    pressedBg: colors.border,
    fg: colors.text,
    tone: "default",
  },
  ghost: {
    bg: "transparent",
    pressedBg: colors.surfaceRaised,
    fg: colors.text,
    tone: "default",
  },
  destructive: {
    bg: colors.surfaceRaised,
    pressedBg: colors.border,
    fg: colors.danger,
    tone: "danger",
  },
};

const pillarFill: Record<ButtonPillar, string> = {
  training: colors.training,
  nutrition: colors.nutrition,
  recovery: colors.recovery,
};

/**
 * DESIGN.md §6 button (D81): 36 dp tall (28 dp small), 12 dp corners (10 small), label
 * 14/600. The tap area is always at least 48 dp: the shape is smaller, the
 * finger target is not. Labels never truncate; the button grows to fit. One coloured
 * button per screen. Disabled is a raised fill with disabled text, never opacity alone.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  pillar,
  size = "md",
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
  const fill = pillar && variant === "primary" ? pillarFill[pillar] : v.bg;
  const fg = pillar && variant === "primary" ? colors.onPillar : v.fg;
  const tone: TextTone = inactive ? "disabled" : v.tone;
  const height = size === "sm" ? controlHeightSm : controlHeight;
  const slop = Math.max(0, (tapMin - height) / 2);

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      hitSlop={{ top: slop, bottom: slop }}
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={testID}
      style={[styles.hit, { minHeight: height }, fullWidth && styles.full]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.body,
            {
              minHeight: height,
              borderRadius: size === "sm" ? radius.sm : radius.md,
              paddingHorizontal:
                size === "sm" ? space[2] + space[1] / 2 : space[3] + space[1] / 2,
            },
            inactive
              ? styles.inactive
              : {
                  backgroundColor:
                    pressed && !(pillar && variant === "primary")
                      ? v.pressedBg
                      : fill,
                  opacity:
                    pressed && pillar && variant === "primary" ? 0.85 : 1,
                },
          ]}
        >
          {Icon && (
            <Icon
              size={size === "sm" ? 14 : 16}
              color={inactive ? colors.textDisabled : fg}
              strokeWidth={2.2}
            />
          )}
          <Text
            variant="label"
            weight="semibold"
            tone={tone}
            style={!inactive ? { color: fg } : undefined}
          >
            {loading && loadingLabel ? loadingLabel : label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  hit: { minWidth: tapMin, alignSelf: "flex-start" },
  full: { alignSelf: "stretch" },
  body: {
    flexDirection: "row",
    alignItems: "center",
    // A lone label is centred inside its button (C6 exception).
    justifyContent: "center",
    gap: rhythm.inline,
    paddingVertical: space[1],
  },
  inactive: {
    backgroundColor: colors.surfaceRaised,
  },
});
