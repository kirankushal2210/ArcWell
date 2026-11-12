import { Minus, Plus } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { colors, durationFor, easeStandard, radius, space } from "@/theme";

import { IconButton } from "./IconButton";
import { Text } from "./Text";

export type NumberStepperProps = {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** e.g. "kg" or "reps". kg only in v1 (D45). */
  unit?: string;
  /** Decimal places to show (kg uses 1, reps 0). */
  decimals?: number;
  /** What the number is, for screen readers, e.g. "Weight". */
  accessibilityLabel: string;
  testID?: string;
};

/**
 * DESIGN.md §6 number stepper for kg and reps: big ± targets (48 dp) either side
 * of a 32 px tabular number that rolls when it changes (C10 motion rule 1).
 */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  unit,
  decimals = 0,
  accessibilityLabel,
  testID,
}: NumberStepperProps) {
  const set = (next: number) =>
    onChange(Math.min(max, Math.max(min, Number(next.toFixed(decimals)))));
  const text = value.toFixed(decimals);
  const spoken = `${accessibilityLabel}, ${text}${unit ? ` ${unit}` : ""}`;

  return (
    <View
      style={styles.box}
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={spoken}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) =>
        set(value + (e.nativeEvent.actionName === "increment" ? step : -step))
      }
    >
      <IconButton
        icon={Minus}
        variant="filled"
        accessibilityLabel={`Decrease ${accessibilityLabel.toLowerCase()} by ${step}`}
        disabled={value <= min}
        onPress={() => set(value - step)}
      />
      <View style={styles.value}>
        <RollingNumber text={text} />
        {unit && (
          <Text variant="label" tone="muted">
            {unit}
          </Text>
        )}
      </View>
      <IconButton
        icon={Plus}
        variant="filled"
        accessibilityLabel={`Increase ${accessibilityLabel.toLowerCase()} by ${step}`}
        disabled={value >= max}
        onPress={() => set(value + step)}
      />
    </View>
  );
}

/** Slides the new value in from the direction of change over 200 ms; instant with reduced motion. */
function RollingNumber({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const prev = useRef(text);
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (prev.current === text) return;
    const up = Number(text) > Number(prev.current);
    prev.current = text;
    if (reduced) return;
    offset.set(up ? space[2] : -space[2]);
    opacity.set(0.4);
    const cfg = { duration: durationFor("std", reduced), easing: easeStandard };
    offset.set(withTiming(0, cfg));
    opacity.set(withTiming(1, cfg));
  }, [text, reduced, offset, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: offset.get() }],
  }));

  return (
    <Animated.View style={style}>
      <Text variant="display" numeric>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: space[1],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  value: { flexDirection: "row", alignItems: "baseline", gap: space[1] },
});
