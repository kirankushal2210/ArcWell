import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { durationFor, easeStandard, pressScaleFor } from "@/theme";

export type PressableScaleProps = Omit<PressableProps, "style"> & {
  /** Style of the pressable box (layout, size, tap target). */
  style?: StyleProp<ViewStyle>;
};

/**
 * Press feedback for every tappable element: scale 0.98 for 120 ms on press-in,
 * starting from the current value so it can be interrupted (C10). Instant and
 * unscaled when reduced motion is on.
 */
export function PressableScale({
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  const to = (v: number) => {
    scale.set(
      withTiming(v, {
        duration: durationFor("micro", reduced),
        easing: easeStandard,
      }),
    );
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) to(pressScaleFor(reduced));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        to(1);
        onPressOut?.(e);
      }}
      style={[style, animated]}
    />
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
