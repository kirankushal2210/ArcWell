import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, rhythm } from "@/theme";

import { PressableScale } from "./PressableScale";

export type CardProps = {
  children: ReactNode;
  /** `surface` on the screen background; `raised` when nested inside a surface. */
  level?: "surface" | "raised";
  /** Gap between the card's groups. Defaults to in-group (8); use rhythm.betweenGroups for unrelated groups. */
  gap?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** DESIGN.md §6 card: 12 dp radius, 16 dp padding. Depth by surface step, never a shadow (C2). */
export function Card({
  children,
  level = "surface",
  gap = rhythm.inGroup,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: CardProps) {
  const box = [
    styles.card,
    level === "raised" && styles.raised,
    { gap },
    style,
  ];
  if (!onPress) {
    return (
      <View style={box} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={box}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: rhythm.cardPad,
  },
  raised: { backgroundColor: colors.surfaceRaised },
});
