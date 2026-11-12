// Guided box breathing (D60): in 4, hold 4, out 4, hold 4, for two minutes. The circle grows on the
// in-breath and shrinks on the out-breath; a light haptic marks each phase. Reduced motion keeps
// the words and the countdown without the movement.
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { todayDate } from "@/features/athlete/recovery";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { PageHeader } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

const PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"] as const;
const PHASE_S = 4;
const TOTAL_S = 120;
const now = () => Date.now();

export default function Breathe() {
  const p = useLocalSearchParams<{ date?: string }>();
  const r = useRecovery();
  const insets = useSafeAreaInsets();
  const [today] = useState(todayDate);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [clock, setClock] = useState(now);
  const [calm, setCalm] = useState(false);
  const size = useSharedValue(0.55);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setCalm)
      .catch(() => {});
    const t = setInterval(() => setClock(now()), 250);
    return () => clearInterval(t);
  }, []);

  const elapsed = startedAt ? Math.floor((clock - startedAt) / 1000) : 0;
  const finished = startedAt !== null && elapsed >= TOTAL_S;
  const phase = Math.floor(elapsed / PHASE_S) % 4;
  const left = PHASE_S - (elapsed % PHASE_S);

  useEffect(() => {
    if (!startedAt || finished) return;
    Haptics.selectionAsync().catch(() => {});
    if (calm) return;
    size.set(
      withTiming(phase === 0 ? 1 : phase === 2 ? 0.55 : size.get(), {
        duration: PHASE_S * 1000,
      }),
    );
  }, [phase, startedAt, finished, calm, size]);

  const circle = useAnimatedStyle(() => ({
    transform: [{ scale: size.get() }],
  }));

  const done = () => {
    r.toggleProtocol(r.id, p.date ?? today, "box-breathing");
    back();
  };

  return (
    <View style={styles.root}>
      <PageHeader title="Box breathing" onBack={back} />
      <View style={styles.body}>
        <View style={styles.stage}>
          <Animated.View style={[styles.circle, circle]} />
          <View style={styles.label}>
            <Text variant="title" style={styles.center}>
              {startedAt ? (finished ? "Well done" : PHASES[phase]) : "Ready"}
            </Text>
            {startedAt && !finished ? (
              <Text variant="display" numeric style={styles.center}>
                {left}
              </Text>
            ) : null}
          </View>
        </View>
        <Text tone="muted" style={styles.center} numeric>
          {startedAt
            ? finished
              ? "Two minutes done. Notice how your body feels."
              : `${Math.max(0, TOTAL_S - elapsed)} seconds left`
            : "Sit comfortably. In through the nose for 4, hold 4, out for 4, hold 4."}
        </Text>
      </View>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {finished ? (
          <Button label="Done" fullWidth onPress={done} />
        ) : startedAt ? (
          <Button label="Stop" variant="secondary" fullWidth onPress={back} />
        ) : (
          <Button label="Start" fullWidth onPress={() => setStartedAt(now())} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { textAlign: "center" },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[6],
    paddingHorizontal: rhythm.gutter,
  },
  stage: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.brand,
  },
  label: { alignItems: "center", gap: space[1] },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
