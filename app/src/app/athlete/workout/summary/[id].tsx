// Workout summary (F4-12): a calm acknowledgement, no confetti or streaks. Sets ring fills once over
// 600 ms (the only "big" motion, DESIGN.md), then volume, sets and new bests. "How did it feel?" is the
// per-workout effort rating (D45) that feeds the coach or the AI plan.
import { router, useLocalSearchParams } from "expo-router";
import { Trophy, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { Button, IconButton, Text } from "@/components/primitives";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { PillarDot } from "@/features/coach/parts";
import { Segmented } from "@/features/onboarding/parts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  colors,
  durationFor,
  easeStandard,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const RING = 132;
const STROKE = 10;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const EFFORT = ["Easy", "Moderate", "Hard", "Very hard", "All out"];

export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const { sessions, rateSession, meTier, coachName } = useCoachData();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [effort, setEffort] = useState<string>("Hard");
  const [note, setNote] = useState("");
  const s = me ? sessions(me.id).find((x) => x.id === id) : undefined;
  const ratio = s && s.setsPlanned ? s.setsDone / s.setsPlanned : 0;
  const progress = useSharedValue(reduced ? ratio : 0);
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - progress.get()),
  }));

  useEffect(() => {
    progress.set(
      withTiming(ratio, {
        duration: durationFor("big", reduced),
        easing: easeStandard,
      }),
    );
  }, [progress, ratio, reduced]);

  if (!me) return <NotJoined />;
  const close = () => {
    if (s) rateSession(me.id, s.id, EFFORT.indexOf(effort) + 1, note.trim());
    if (router.canDismiss()) router.dismissAll();
    else router.replace("/athlete/training");
  };
  if (!s)
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <IconButton icon={X} accessibilityLabel="Close" onPress={close} />
      </View>
    );

  const when = new Date(s.at).toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, space[4]),
        },
      ]}
    >
      <View style={styles.top}>
        <IconButton
          icon={X}
          accessibilityLabel="Close summary"
          onPress={close}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.eyebrow}>
          <PillarDot pillar="training" />
          <Text variant="eyebrow" tone="muted">
            Workout complete
          </Text>
        </View>
        <Text variant="display" accessibilityRole="header">
          {s.name}
        </Text>
        <Text tone="muted" numeric>
          {when} · {s.minutes} min
        </Text>

        <View style={styles.stats}>
          <View
            style={styles.ring}
            accessibilityLabel={`${s.setsDone} of ${s.setsPlanned} sets`}
          >
            <View pointerEvents="none" style={styles.ringSvg}>
              <Svg width={RING} height={RING}>
                <Circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={R}
                  stroke={colors.surfaceRaised}
                  strokeWidth={STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={R}
                  stroke={colors.brand}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={`${C} ${C}`}
                  strokeLinecap="round"
                  animatedProps={ringProps}
                />
              </Svg>
            </View>
            <Text variant="display" numeric>
              {s.setsDone}
            </Text>
            <Text variant="caption" tone="muted">
              sets
            </Text>
          </View>
          <View style={styles.flex}>
            <Text variant="label" tone="muted">
              Total volume
            </Text>
            <Text variant="title" numeric>
              {s.volume.toLocaleString("en-IN")} kg
            </Text>
            <Text variant="label" tone="muted">
              Sets
            </Text>
            <Text variant="title" numeric>
              {s.setsDone} of {s.setsPlanned}
            </Text>
          </View>
        </View>

        {s.bests.length ? (
          <>
            <Text variant="eyebrow" tone="muted">
              New bests
            </Text>
            <View style={styles.card}>
              {s.bests.map((b, i) => (
                <View key={b.name} style={[styles.best, i > 0 && styles.line]}>
                  <View style={styles.trophy}>
                    <Trophy size={20} color={colors.text} />
                  </View>
                  <View style={styles.flex}>
                    <Text weight="semibold">{b.name}</Text>
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      {b.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <Text variant="eyebrow" tone="muted">
          How did it feel?
        </Text>
        <Segmented
          stretch
          options={EFFORT}
          value={effort}
          onChange={setEffort}
        />
        <Text variant="caption" tone="muted">
          {meTier === "coached"
            ? `${coachName} sees this with your log.`
            : meTier === "pro"
              ? "Your AI coach uses this to set next week."
              : "Shown in your history."}
        </Text>
        {meTier === "coached" ? (
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={`Note for ${coachName} (optional)`}
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.note}
            accessibilityLabel="Note for your coach"
          />
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Done" fullWidth onPress={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: space[1] },
  body: {
    gap: space[3],
    paddingHorizontal: rhythm.gutter,
    paddingBottom: space[6],
  },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1, gap: space[1] / 2 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[6],
    paddingVertical: space[3],
  },
  ring: {
    width: RING,
    height: RING,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  card: {
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  best: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[3],
  },
  line: { borderTopWidth: 1, borderTopColor: colors.border },
  trophy: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    minHeight: 72,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: rhythm.gutter },
});
