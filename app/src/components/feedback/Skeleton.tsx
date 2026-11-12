import { useEffect } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { colors, radius, rhythm, skeletonPulse } from "@/theme";

export type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  /** Card-shaped blocks use md (12); text lines use sm (8). */
  shape?: "line" | "card" | "circle";
};

/**
 * Loading placeholder in the shape of the content, never a spinner (C10).
 * Pulses gently; stays still with reduced motion.
 */
export function Skeleton({
  width = "100%",
  height,
  shape = "line",
}: SkeletonProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(opacity);
      opacity.set(1);
      return;
    }
    opacity.set(skeletonPulse.minOpacity);
    opacity.set(
      withRepeat(
        withTiming(1, {
          duration: skeletonPulse.period / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [reduced, opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const r =
    shape === "circle" ? radius.full : shape === "card" ? radius.md : radius.sm;

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: r }, animated]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** A labelled loading region: screen readers hear "Loading" once instead of empty blocks. */
export function SkeletonGroup({
  children,
  label = "Loading",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <View
      style={styles.group}
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surfaceRaised },
  group: { gap: rhythm.inGroup },
});
