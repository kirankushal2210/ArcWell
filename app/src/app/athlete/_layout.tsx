// Athlete app: Today · Training · Nutrition · Recovery, with Progress from the top right (D101).
// Everything here comes from the coach's plans (D56); the athlete executes and logs. No AI (D44).
import { Stack } from "expo-router";

import { colors } from "@/theme";

export default function AthleteLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Screens under the top one don't re-render until they're shown again.
        freezeOnBlur: true,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
