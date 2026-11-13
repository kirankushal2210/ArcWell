import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { borderWidth, colors, controlHeight, radius, tapMin } from "@/theme";

import { PressableScale } from "./PressableScale";

export type IconButtonVariant = "plain" | "outline" | "filled" | "glass";

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

/**
 * Icon-only button: a 40 dp round shape inside a 48 × 48 dp tap area (C5, D67). The glyph is
 * centred in its box (C6 exception). "glass" is for floating toolbar buttons (functional layer).
 */
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
            variant === "glass" && styles.glass,
            pressed && !disabled && styles.pressed,
          ]}
        >
          <Icon
            size={20}
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
    width: controlHeight,
    height: controlHeight,
    margin: (tapMin - controlHeight) / 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth,
    borderColor: "transparent",
  },
  outline: { borderColor: colors.borderStrong },
  filled: { backgroundColor: colors.surfaceRaised },
  glass: { backgroundColor: colors.glassSolid, borderColor: colors.glassEdge },
  pressed: { backgroundColor: colors.surfaceRaised },
});
