// AI coach (D57), opened from the floating button. Plus members ask about training, food or recovery;
// Free members see the trial offer with the AI permission step (D35). Coached athletes never reach
// this screen (D44). Replies come from the server AI service (supabase/functions/_shared/ai, Phase 7);
// until then the suggestions below are written by rules from the athlete's plan and say so.
import { router } from "expo-router";
import {
  Camera,
  Dumbbell,
  Moon,
  Send,
  Sparkles,
  Utensils,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, Text } from "@/components/primitives";
import { AIConsentPoints } from "@/features/athlete/AIConsent";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader, PillarDot } from "@/features/coach/parts";
import { clock } from "@/features/coach/plans";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";
import { TrialTimeline } from "@/features/athlete/TrialTimeline";

export default function AICoach() {
  const me = useMe();
  const { meTier, startPlus, settingsOf } = useCoachData();
  const insets = useSafeAreaInsets();
  const [consent, setConsent] = useState(false);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete");
  if (!me || meTier === "coached") return <NotJoined />;

  if (meTier === "free")
    return (
      <View style={styles.root}>
        <PageHeader
          title={consent ? "Let AI use your data?" : "Your AI coach"}
          onBack={consent ? () => setConsent(false) : back}
        />
        <Page>
          {consent ? (
            <>
              <Text tone="muted">
                To adapt your plan, Arcwell&apos;s AI reads your answers and
                what you log.
              </Text>
              <AIConsentPoints />
            </>
          ) : (
            <>
              <Text tone="muted">
                Arcwell Plus keeps your plan right for you every week.
              </Text>
              {[
                [
                  Sparkles,
                  "A plan that adapts",
                  "Training adjusted weekly from what you log",
                ],
                [
                  Utensils,
                  "Full macros and meal plans",
                  "Indian meals fitted to your targets",
                ],
                [Camera, "Photo food logging", "Snap a meal, check it, log it"],
                [Moon, "Recovery", "Sleep score and recovery trends"],
              ].map(([Icon, title, sub]) => {
                const I = Icon as typeof Sparkles;
                return (
                  <View key={title as string} style={styles.benefit}>
                    <I size={24} strokeWidth={1.6} color={colors.text} />
                    <View style={styles.flex}>
                      <Text weight="semibold">{title as string}</Text>
                      <Text variant="label" weight="regular" tone="muted">
                        {sub as string}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {settingsOf(me.id).sub ? null : <TrialTimeline />}
            </>
          )}
        </Page>
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          {consent ? (
            <Button
              label="Allow and start free trial"
              fullWidth
              onPress={() => {
                startPlus("yearly");
                setConsent(false);
                router.replace({
                  pathname: "/athlete/switch/[step]",
                  params: { step: "upgraded" },
                });
              }}
            />
          ) : (
            <Button
              label={
                settingsOf(me.id).sub
                  ? "Restart Arcwell Plus"
                  : "Start 7-day free trial"
              }
              fullWidth
              onPress={() => setConsent(true)}
            />
          )}
          <Text variant="caption" tone="muted" style={styles.center}>
            Cancel any time in Google Play before the trial ends.
          </Text>
        </View>
      </View>
    );

  const p = me.program;
  const n = me.nutritionPlan;
  const r = me.protocol;
  const suggestions = [
    p && {
      pillar: "training" as const,
      icon: Dumbbell,
      title: "Training",
      text: `${r ? 7 - r.restDays.length : p.days.length} workouts a week. Add 1–2 reps each session until you hit the top of the range, then add weight.`,
    },
    n && {
      pillar: "nutrition" as const,
      icon: Utensils,
      title: "Nutrition",
      text: `Aim for ${n.protein} g protein: spread it over ${n.meals.length} meals, about ${Math.round(n.protein / n.meals.length)} g each.`,
    },
    r && {
      pillar: "recovery" as const,
      icon: Moon,
      title: "Recovery",
      text: `Your ${r.sleepH} h target means lights out by ${clock(r.wake - r.sleepH * 60)} for a ${clock(r.wake)} alarm.`,
    },
  ].filter(Boolean) as {
    pillar: "training" | "nutrition" | "recovery";
    icon: typeof Dumbbell;
    title: string;
    text: string;
  }[];

  return (
    <View style={styles.root}>
      <PageHeader title="AI coach" onBack={back} />
      <Page>
        <Text tone="muted">
          Ask about your training, food or recovery. I see your plan and what
          you log.
        </Text>
        <Eyebrow>Starter suggestions from your plan</Eyebrow>
        {suggestions.map((s) => (
          <View key={s.title} style={styles.card}>
            <View style={styles.head}>
              <PillarDot pillar={s.pillar} />
              <Text variant="label" tone="muted">
                {s.title}
              </Text>
            </View>
            <Text>{s.text}</Text>
          </View>
        ))}
        <Text variant="caption" tone="muted">
          Sample build: answers to your questions connect when the AI service is
          live.
        </Text>
      </Page>
      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, space[2]) },
        ]}
      >
        <TextInput
          editable={false}
          placeholder="Ask about training, food or sleep"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Ask the AI coach (not available yet)"
        />
        <IconButton
          icon={Send}
          variant="filled"
          disabled
          accessibilityLabel="Send"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  benefit: { flexDirection: "row", alignItems: "flex-start", gap: space[4] },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: space[3],
    paddingTop: space[2],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
