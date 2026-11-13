// Your plan is ready (D57): one short celebration, then the three things the athlete's answers set:
// training preference, daily calorie target and sleep. Built by rules from the answers, not by AI.
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/primitives";
import { Confetti } from "@/features/athlete/Confetti";
import { selfPlan } from "@/features/athlete/selfPlan";
import { PillarDot } from "@/features/coach/parts";
import { clock } from "@/features/coach/plans";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { NextButton } from "@/features/onboarding/parts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { colors, radius, rhythm, space } from "@/theme";
import { WhyThis } from "@/features/science/WhyThis";
import { womensNotes, WOMENS_SOURCES } from "@/features/science/womensHealth";

export default function Ready() {
  const { answers } = useOnboarding();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [plan] = useState(() => selfPlan(answers));
  const scale = useSharedValue(reduced ? 1 : 0.4);
  const badge = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  useEffect(() => {
    // Critically damped spring: lands without wobble (D53 motion).
    scale.set(withSpring(1, { dampingRatio: 0.8, duration: 450 }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  }, [scale]);

  const n = plan.nutrition;
  const notes = womensNotes(answers);
  const r = plan.protocol;

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
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.badge, badge]}>
          <Check size={44} strokeWidth={3} color={colors.onBrand} />
        </Animated.View>
        <Text
          variant="display"
          accessibilityRole="header"
          style={styles.center}
        >
          Your plan is ready
        </Text>
        <Text tone="muted" style={styles.center}>
          Training, nutrition and recovery, built from your answers. Use it as
          it is or change anything later.
        </Text>

        <View style={styles.card}>
          <View style={styles.head}>
            <PillarDot pillar="training" />
            <Text variant="eyebrow" tone="muted">
              Training
            </Text>
          </View>
          <Text variant="title">{plan.summary.goal}</Text>
          <Text tone="muted" numeric>
            {plan.summary.training}
          </Text>
          <Text variant="label" weight="regular" tone="muted">
            Equipment: {plan.summary.equipment}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.head}>
            <PillarDot pillar="nutrition" />
            <Text variant="eyebrow" tone="muted" style={styles.grow}>
              Daily calorie target
            </Text>
            <WhyThis
              title="How your targets are set"
              points={[
                "Resting energy from the Mifflin–St Jeor equation, times your daily activity.",
                "Then a small change for your goal: losing fat stays at about 0.5–1% of bodyweight a week, so you keep muscle.",
                "Protein of about 1.8–2.0 g per kg a day. Muscle gains level off around 1.6 g on average.",
              ]}
              sources={["mifflin1990", "helms2014", "morton2018"]}
            />
          </View>
          <Text variant="display" numeric>
            {n.kcal.toLocaleString("en-IN")}{" "}
            <Text variant="heading" tone="muted">
              kcal
            </Text>
          </Text>
          <View style={styles.macros}>
            {(
              [
                ["Protein", n.protein],
                ["Carbs", n.carbs],
                ["Fat", n.fat],
              ] as const
            ).map(([label, g]) => (
              <View key={label} style={styles.macro}>
                <Text weight="semibold" numeric>
                  {g} g
                </Text>
                <Text variant="caption" tone="muted">
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="label" weight="regular" tone="muted">
            {plan.summary.diet} · {n.meals.length} meals a day
          </Text>
        </View>

        {notes.length ? (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text variant="eyebrow" tone="muted" style={styles.grow}>
                For you
              </Text>
              <WhyThis
                label="Why?"
                title="Hormonal health and your plan"
                points={[
                  "PCOS: healthy eating and activity help everyone with PCOS, with no single diet preferred, even without weight loss.",
                  "Pregnancy: without medical reasons not to, about 150 minutes of moderate activity a week is advised. No calorie deficit.",
                  "Your cycle changed performance only slightly on average, so training isn't scheduled around it.",
                ]}
                sources={WOMENS_SOURCES}
              />
            </View>
            {notes.map((t) => (
              <Text key={t} variant="label" weight="regular">
                {t}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.head}>
            <PillarDot pillar="recovery" />
            <Text variant="eyebrow" tone="muted">
              Sleep
            </Text>
          </View>
          <Text variant="title" numeric>
            {r.sleepH} hours a night
          </Text>
          <Text tone="muted" numeric>
            In bed by {clock(r.bed)} · up at {clock(r.wake)}
          </Text>
        </View>
      </ScrollView>
      <NextButton
        label="Save my plan"
        disabled={false}
        onPress={() => router.push("/onboarding/save")}
      />
      <Confetti />
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg },
  body: {
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[8],
    paddingBottom: space[6],
    gap: space[4],
  },
  center: { textAlign: "center" },
  badge: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  macros: { flexDirection: "row", gap: space[2] },
  macro: {
    flex: 1,
    gap: space[1] / 2,
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
});
