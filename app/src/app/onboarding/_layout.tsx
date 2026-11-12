// Athlete onboarding (D52): one route per question, sharing answers through OnboardingProvider.
import { Stack } from "expo-router";

import { OnboardingProvider } from "@/features/onboarding/OnboardingContext";
import { colors } from "@/theme";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </OnboardingProvider>
  );
}
