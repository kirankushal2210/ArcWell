// Start route: the welcome screen. Dev review screens stay at /dev/tokens and /dev/gallery.
import { Redirect, router } from "expo-router";

import { useCoachData } from "@/features/coach/CoachData";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export default function Index() {
  const { hydrated, meId } = useCoachData();
  // Someone who already finished onboarding (saved on this phone) goes straight back to their app.
  if (!hydrated) return null;
  if (meId) return <Redirect href="/athlete" />;
  return (
    <WelcomeScreen
      // Get Started opens the role choice (D44), then athlete or coach onboarding. Sign-in arrives in Phase 5; until then it does nothing.
      onGetStarted={() => router.push("/role")}
      onSignIn={() => {}}
    />
  );
}
