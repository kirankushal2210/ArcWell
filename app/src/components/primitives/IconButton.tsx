import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { borderWidth, colors, radius, tapMin } from "@/theme";

import { PressableScale } from "./PressableScale";

export type IconButtonVariant = "plain" | "outline" | "filled";

export type IconButtonProps = {
  icon: LucideIcon;
  /** Required: icon-only controls must be named for screen readers (C9). */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  disabled?: boolean;
  /** Icon colour for the plain variant (e.g. accent for a selected state). */
  color?: string;
  testID?: string;
};

/** 48 × 48 dp icon-only button (C5). The glyph is centred in its box (C6 exception). */
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = "plain",
  disabled,
  color,
  testID,
}: IconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      style={styles.hit}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.box,
            variant === "outline" && styles.outline,
            variant === "filled" && styles.filled,
            pressed && !disabled && styles.pressed,
          ]}
        >
          <Icon
            size={24}
            strokeWidth={2}
            color={disabled ? colors.textDisabled : (color ?? colors.text)}
          />
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  hit: { width: tapMin, height: tapMin },
  box: {
    width: tapMin,
    height: tapMin,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth,
    borderColor: "transparent",
  },
  outline: { borderColor: colors.borderStrong },
  filled: { backgroundColor: colors.surface },
  pressed: { backgroundColor: colors.surfaceRaised },
});
