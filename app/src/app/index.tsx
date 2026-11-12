// Start route: the welcome screen. Dev review screens stay at /dev/tokens and /dev/gallery.
import { router } from "expo-router";

import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export default function Index() {
  return (
    <WelcomeScreen
      // Get Started opens the role choice (D44), then athlete or coach onboarding. Sign-in arrives in Phase 5; until then it does nothing.
      onGetStarted={() => router.push("/role")}
      onSignIn={() => {}}
    />
  );
}
