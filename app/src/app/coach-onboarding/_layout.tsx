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
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </OnboardingProvider>
  );
}
