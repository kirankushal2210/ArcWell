// Save your plan (D57): sign-up comes after the athlete has seen their plan. Health-data consent is
// given here, before any answer leaves the phone. Email signs up with a 6-digit code (PLAN Phase 1);
// Google follows with the development build. Sample builds without accounts continue straight on.
import { router } from "expo-router";
import { Check, Mail, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, PressableScale, Text } from "@/components/primitives";
import { newClientFromAnswers } from "@/features/athlete/selfPlan";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { ProgressBar, QuestionHeader } from "@/features/onboarding/parts";
import { colors, radius, rhythm, space } from "@/theme";

export default function SavePlan() {
  const insets = useSafeAreaInsets();
  const [agree, setAgree] = useState(false);
  const { joiningCoach, joinAsNewClient } = useCoachData();
  const { answers } = useOnboarding();
  const auth = useAuth();
  const withEmail = () => {
    if (!auth.enabled) return next();
    auth.begin({ role: "athlete", consent: true, then: next });
    router.push("/auth/email");
  };
  const next = () => {
    if (!joiningCoach) return router.push("/onboarding/pro");
    // General-link join: into the coach's "Needs a plan" list, then the app, waiting for the plan.
    joinAsNewClient(newClientFromAnswers(answers));
    if (router.canDismiss()) router.dismissAll();
    router.replace("/athlete");
  };

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
        <ProgressBar
          segments={[]}
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        />
      </View>
      <View style={styles.body}>
        <QuestionHeader
          glyph={ShieldCheck}
          title="Save your plan"
          sub="Create your account so your plan, workouts and progress are kept safe and follow you to a new phone."
        />
        <PressableScale
          onPress={() => setAgree((a) => !a)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          style={styles.agree}
        >
          <Text weight="medium" style={styles.flex}>
            I agree to the Terms and Privacy Policy, and to Arcwell storing my
            health data (answers, workouts, food and sleep) to run my plan.
          </Text>
          <View style={[styles.tick, agree && styles.tickOn]}>
            {agree ? (
              <Check size={16} strokeWidth={3} color={colors.onBrand} />
            ) : null}
          </View>
        </PressableScale>
      </View>
      <View style={styles.footer}>
        <Button
          label="Continue with email"
          icon={Mail}
          fullWidth
          disabled={!agree}
          onPress={withEmail}
        />
        <Button
          label="Continue with Google"
          variant="secondary"
          fullWidth
          disabled
          onPress={withEmail}
        />
        <Text variant="caption" tone="muted" style={styles.center}>
          {auth.enabled
            ? "Google sign-in comes with the next build."
            : "Sample build: accounts are off, so this continues without one."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: space[1] },
  body: {
    flex: 1,
    gap: space[6],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
  flex: { flex: 1 },
  center: { textAlign: "center" },
  agree: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.sm - space[1] / 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  footer: { gap: space[2], paddingHorizontal: rhythm.gutter },
});
