// One short confetti burst for "your plan is ready" (D57): black plus the three pillar colours,
// falling once and fading out. Nothing at all with reduced motion on.
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { colors, radius } from "@/theme";

const COLORS = [
  colors.brand,
  colors.training,
  colors.nutrition,
  colors.recovery,
];
const COUNT = 36;

type Piece = {
  x: number;
  delay: number;
  duration: number;
  spin: number;
  drift: number;
  size: number;
  color: string;
};

function Bit({ p, fall }: { p: Piece; fall: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withDelay(
        p.delay,
        withTiming(1, {
          duration: p.duration,
          easing: Easing.out(Easing.quad),
        }),
      ),
    );
  }, [t, p.delay, p.duration]);
  const style = useAnimatedStyle(() => ({
    opacity: t.get() < 0.75 ? 1 : 1 - (t.get() - 0.75) / 0.25,
    transform: [
      { translateY: -40 + t.get() * fall },
      { translateX: t.get() * p.drift },
      { rotate: `${t.get() * p.spin}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        styles.bit,
        {
          left: p.x,
          width: p.size,
          height: p.size * 0.6,
          backgroundColor: p.color,
        },
        style,
      ]}
    />
  );
}

export function Confetti() {
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: COUNT }, (_, k) => ({
      x: Math.random() * width,
      delay: Math.random() * 250,
      duration: 1400 + Math.random() * 900,
      spin: (Math.random() - 0.5) * 720,
      drift: (Math.random() - 0.5) * 80,
      size: 8 + Math.random() * 6,
      color: COLORS[k % COLORS.length],
    })),
  );
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, k) => (
        <Bit key={k} p={p} fall={height * 0.55} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bit: { position: "absolute", top: 0, borderRadius: radius.sm / 4 },
});
