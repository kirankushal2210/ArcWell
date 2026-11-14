// AI plan paywall at the end of onboarding (D57): 7-day trial into Arcwell Plus (D6, D17), with the
// AI permission step before the trial starts (D35). "Continue with the free plan" stays one tap away.
// Prices come from Google Play (PLAN.md blocker); purchases arrive with RevenueCat in Phase 6.
import { router } from "expo-router";
import { Bot, Camera, Moon, Sparkles, Utensils } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, PressableScale, Text } from "@/components/primitives";
import { AIConsentPoints } from "@/features/athlete/AIConsent";
import { selfClient, selfPlan } from "@/features/athlete/selfPlan";
import { demoBilling, demoPlus } from "@/features/accounts/repo";
import { recordConsent } from "@/features/auth/consent";
import { useCoachData } from "@/features/coach/CoachData";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { ProgressBar, QuestionHeader } from "@/features/onboarding/parts";
import { colors, radius, rhythm, space } from "@/theme";
import { defaultSettings, isoToday } from "@/features/athlete/athleteData";
import { TrialTimeline } from "@/features/athlete/TrialTimeline";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "A plan that adapts",
    sub: "AI adjusts your training each week from what you log, within safe programming rules",
  },
  {
    icon: Utensils,
    title: "Full macros and meal plans",
    sub: "Indian meal plans fitted to your targets",
  },
  {
    icon: Camera,
    title: "Photo food logging",
    sub: "Snap a meal, check the estimate, log it",
  },
  { icon: Moon, title: "Recovery", sub: "Sleep score and recovery trends" },
];

type Billing = "yearly" | "monthly";

export default function Pro() {
  const insets = useSafeAreaInsets();
  const { answers } = useOnboarding();
  const { startSelf } = useCoachData();
  const [billing, setBilling] = useState<Billing>("yearly");
  const [step, setStep] = useState<"offer" | "consent">("offer");

  const begin = (tier: "pro" | "free") => {
    const c = selfClient(answers, selfPlan(answers));
    startSelf(
      tier === "pro"
        ? {
            ...c,
            athleteSettings: {
              ...defaultSettings(),
              ...c.athleteSettings,
              sub: { status: "trial", plan: billing, startedAt: isoToday() },
            },
          }
        : c,
      tier,
    );
    // "Allow and start free trial" is the AI consent asked at sign-up (SPEC key rules).
    if (tier === "pro") void recordConsent("ai", true);
    // Demo builds with accounts: the trial is granted on the server, as a Play purchase would be.
    if (tier === "pro" && demoBilling) void demoPlus("trial");
    if (router.canDismiss()) router.dismissAll();
    router.replace("/athlete");
  };
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  if (step === "consent")
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
          <ProgressBar segments={[]} onBack={() => setStep("offer")} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <QuestionHeader
            glyph={Bot}
            title="Let AI use your data?"
            sub="To adapt your plan, Arcwell's AI reads your answers and what you log."
          />
          <AIConsentPoints />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="Allow and start free trial"
            fullWidth
            onPress={() => begin("pro")}
          />
          <Button
            label="Not now"
            variant="ghost"
            fullWidth
            onPress={() => setStep("offer")}
          />
        </View>
      </View>
    );

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
        <ProgressBar segments={[]} onBack={back} />
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <QuestionHeader
          glyph={Sparkles}
          title="Get your AI coach"
          sub="Your plan is a starting point. Arcwell Plus keeps it right for you every week."
        />
        <View style={styles.benefits}>
          {BENEFITS.map(({ icon: Icon, title, sub }) => (
            <View key={title} style={styles.benefit}>
              <Icon size={26} strokeWidth={1.6} color={colors.text} />
              <View style={styles.flex}>
                <Text weight="semibold">{title}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {sub}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TrialTimeline />
        <View style={styles.options} accessibilityRole="radiogroup">
          {(
            [
              ["yearly", "Yearly", "Best value"],
              ["monthly", "Monthly", ""],
            ] as const
          ).map(([value, label, tag]) => {
            const on = billing === value;
            return (
              <PressableScale
                key={value}
                onPress={() => setBilling(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.option, on && styles.optionOn]}
              >
                <View style={styles.flex}>
                  <Text weight="semibold" tone={on ? "onBrand" : "default"}>
                    {label}
                  </Text>
                  <Text
                    variant="label"
                    weight="regular"
                    tone={on ? "onBrand" : "muted"}
                  >
                    7 days free, then billed {value}
                  </Text>
                </View>
                {tag ? (
                  <View style={[styles.tag, on && styles.tagOn]}>
                    <Text
                      variant="caption"
                      weight="semibold"
                      tone={on ? "default" : "onBrand"}
                    >
                      {tag}
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            );
          })}
        </View>
        <Text variant="caption" tone="muted" style={styles.center}>
          Price shown by Google Play. Cancel any time in Google Play before the
          trial ends and you won&apos;t be charged.
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label="Start 7-day free trial"
          fullWidth
          onPress={() => setStep("consent")}
        />
        <Button
          label="Continue with the free plan"
          variant="ghost"
          fullWidth
          onPress={() => begin("free")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: space[1] },
  body: {
    gap: space[4],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    paddingBottom: space[4],
  },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  benefits: { gap: space[4] },
  benefit: { flexDirection: "row", alignItems: "flex-start", gap: space[4] },
  options: { gap: space[2] },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 64,
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  tag: {
    paddingHorizontal: space[2],
    paddingVertical: space[1] / 2,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  tagOn: { backgroundColor: colors.onBrand },
  footer: { gap: space[1], paddingHorizontal: rhythm.gutter },
});
