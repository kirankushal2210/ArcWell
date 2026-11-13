// Save your plan (D57): sign-up comes after the athlete has seen their plan. Health-data consent is
// given here, before any answer leaves the phone; progress-photo consent is asked here too but is
// optional and never blocks sign-up (F1-05, D12; Privacy can change it later). Email signs up with a
// 6-digit code (PLAN Phase 1); Google follows with the development build (D62). Sample builds
// without accounts continue straight on.
import { router } from "expo-router";
import { Check, Mail, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, PressableScale, Text } from "@/components/primitives";
import { newClientFromAnswers } from "@/features/athlete/selfPlan";
import { useAuth } from "@/features/auth/AuthProvider";
import { recordConsent } from "@/features/auth/consent";
import { GoogleButton } from "@/features/auth/GoogleButton";
import { useCoachData } from "@/features/coach/CoachData";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { ProgressBar, QuestionHeader } from "@/features/onboarding/parts";
import { colors, radius, rhythm, space } from "@/theme";

export default function SavePlan() {
  const insets = useSafeAreaInsets();
  const [agree, setAgree] = useState(false);
  const { joiningCoach, joinAsNewClient } = useCoachData();
  const { answers, setAnswer } = useOnboarding();
  // Kept with the answers so the new athlete record starts with it (athleteSettings.photos).
  const photos = answers.photoConsent === true;
  const auth = useAuth();
  const withEmail = () => {
    if (!auth.enabled) return next();
    auth.begin({
      role: "athlete",
      consent: true,
      then: () => {
        // Signed in by now: the server's consent log gets the photo choice too.
        void recordConsent("photos", photos);
        next();
      },
    });
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
        <View style={styles.choices}>
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
          <PressableScale
            onPress={() => setAnswer("photoConsent", !photos)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: photos }}
            style={styles.agree}
          >
            <View style={styles.flex}>
              <Text weight="medium">Progress photos can be stored</Text>
              <Text variant="label" weight="regular" tone="muted">
                Optional. Only you, and a coach if you have one, see them.
                Change it any time in Privacy.
              </Text>
            </View>
            <View style={[styles.tick, photos && styles.tickOn]}>
              {photos ? (
                <Check size={16} strokeWidth={3} color={colors.onBrand} />
              ) : null}
            </View>
          </PressableScale>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          label="Continue with email"
          icon={Mail}
          fullWidth
          disabled={!agree}
          onPress={withEmail}
        />
        <GoogleButton />
        {auth.enabled ? null : (
          <Text variant="caption" tone="muted" style={styles.center}>
            Sample build: accounts are off, so this continues without one.
          </Text>
        )}
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
  choices: { gap: space[3] },
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
