// Onboarding landing screen (replaces the F1-02 wireframe layout at the founder's request, 2026-11-11).
// Draft, not approved or user-tested. Every value comes from app/src/theme (D47); no hex here.
import { StyleSheet, View } from "react-native";

import { Logo } from "@/components/brand";
import { Button, PressableScale, Screen, Text } from "@/components/primitives";
import { rhythm, space, tapMin } from "@/theme";

export type OnboardingScreenProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export function OnboardingScreen({
  onGetStarted,
  onSignIn,
}: OnboardingScreenProps) {
  return (
    <Screen
      testID="onboarding"
      gap={rhythm.section}
      footer={
        <View style={styles.actions}>
          <Button
            label="Get Started"
            fullWidth
            onPress={onGetStarted}
            testID="onboarding-get-started"
          />
          <View style={styles.signInRow}>
            <Text variant="label" weight="regular" tone="muted">
              Have an account?
            </Text>
            <PressableScale
              onPress={onSignIn}
              accessibilityRole="link"
              accessibilityLabel="Sign In"
              testID="onboarding-sign-in"
              style={styles.signIn}
            >
              <Text variant="label" weight="semibold" tone="brand">
                Sign In
              </Text>
            </PressableScale>
          </View>
        </View>
      }
    >
      <Header />
      <View style={styles.copy}>
        <Text variant="display" accessibilityRole="header">
          For all your{" "}
          <Text variant="display" tone="brand">
            training
          </Text>{" "}
          and{" "}
          <Text variant="display" tone="brand">
            nutrition
          </Text>{" "}
          needs.
        </Text>
        <Text tone="muted">
          {/* No AI claim: everyone sees this before sign-up, and coached athletes never see AI (C12). */}
          The one-place health application where you can track everything. Track
          your training, nutrition, and recovery, on your own or with your
          coach.
        </Text>
      </View>
    </Screen>
  );
}

/** Logo lock-up: the pull-up mark (D51) beside the name. */
function Header() {
  return (
    <View
      style={styles.brand}
      accessibilityRole="header"
      accessibilityLabel="Arcwell"
    >
      <Logo size={36} />
      <Text variant="heading" weight="bold">
        Arcwell
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: space[2] },
  copy: { gap: rhythm.betweenGroups },
  actions: { gap: space[2] },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    minHeight: tapMin,
  },
  signIn: {
    minHeight: tapMin,
    minWidth: tapMin,
    justifyContent: "center",
    paddingHorizontal: space[1],
  },
});
