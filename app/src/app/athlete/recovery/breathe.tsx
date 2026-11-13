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
import { useHabits } from "@/features/protocols/useHabits";
import { PageHeader } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

// Two patterns: box breathing (D60) and long-exhale breathing, a double breath in then a long
// breath out (balban2023; habits D74). Each phase: label, seconds, and whether the circle grows.
type Step = { label: string; s: number; grow: boolean | null };
const PATTERNS: Record<
  "box" | "sigh",
  { title: string; steps: Step[]; total: number; intro: string; done: string }
> = {
  box: {
    title: "Box breathing",
    steps: [
      { label: "Breathe in", s: 4, grow: true },
      { label: "Hold", s: 4, grow: null },
      { label: "Breathe out", s: 4, grow: false },
      { label: "Hold", s: 4, grow: null },
    ],
    total: 120,
    intro:
      "Sit comfortably. In through the nose for 4, hold 4, out for 4, hold 4.",
    done: "Two minutes done. Notice how your body feels.",
  },
  sigh: {
    title: "Long-exhale breathing",
    steps: [
      { label: "Breathe in", s: 2, grow: true },
      { label: "A little more", s: 1, grow: true },
      { label: "Long breath out", s: 6, grow: false },
    ],
    total: 180,
    intro:
      "Through the nose: a full breath in, a short second breath in, then a slow, long breath out.",
    done: "Three minutes done. Notice how your body feels.",
  },
};
const now = () => Date.now();

export default function Breathe() {
  const p = useLocalSearchParams<{ date?: string; pattern?: string }>();
  const r = useRecovery();
  const hb = useHabits();
  const pat = PATTERNS[p.pattern === "sigh" ? "sigh" : "box"];
  const cycle = pat.steps.reduce((n, x) => n + x.s, 0);
  const TOTAL_S = pat.total;
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
  let t = elapsed % cycle;
  let phase = 0;
  while (t >= pat.steps[phase].s) {
    t -= pat.steps[phase].s;
    phase++;
  }
  const step = pat.steps[phase];
  const left = step.s - t;

  useEffect(() => {
    if (!startedAt || finished) return;
    Haptics.selectionAsync().catch(() => {});
    if (calm) return;
    size.set(
      withTiming(
        step.grow === true
          ? phase === 0
            ? 0.9
            : 1
          : step.grow === false
            ? 0.55
            : size.get(),
        {
          duration: step.s * 1000,
        },
      ),
    );
  }, [phase, startedAt, finished, calm, size, step.grow, step.s]);

  const circle = useAnimatedStyle(() => ({
    transform: [{ scale: size.get() }],
  }));

  const done = () => {
    if (p.pattern === "sigh")
      hb.setLog("long-exhale", Math.round(TOTAL_S / 60));
    else r.toggleProtocol(r.id, p.date ?? today, "box-breathing");
    back();
  };

  return (
    <View style={styles.root}>
      <PageHeader title={pat.title} onBack={back} />
      <View style={styles.body}>
        <View style={styles.stage}>
          <Animated.View style={[styles.circle, circle]} />
          <View style={styles.label}>
            <Text variant="title" style={styles.center}>
              {startedAt ? (finished ? "Well done" : step.label) : "Ready"}
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
              ? pat.done
              : `${Math.max(0, TOTAL_S - elapsed)} seconds left`
            : pat.intro}
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
