// Coach app (sitemap §5, D23): five tabs plus client, check-in and chat screens pushed on top.
// Sample data only until accounts and the database exist (PLAN.md Phases 1–2).
import { Stack } from "expo-router";

import { colors } from "@/theme";

export default function CoachLayout() {
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
