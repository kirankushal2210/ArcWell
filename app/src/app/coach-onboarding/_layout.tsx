// Coach onboarding (F2, D52): one route per screen, sharing answers through OnboardingProvider.
import { Stack } from "expo-router";

import { OnboardingProvider } from "@/features/onboarding/OnboardingContext";
import { colors } from "@/theme";

export default function CoachOnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          // Earlier questions stay in the stack; freeze them so an answer re-renders only this one.
          freezeOnBlur: true,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </OnboardingProvider>
  );
}
