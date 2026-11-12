// Start route: the welcome screen. Dev review screens stay at /dev/tokens and /dev/gallery.
import { Redirect, router } from "expo-router";

import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import { APP_STATUS } from "@/features/system/status";
import { LoadingScreen } from "@/features/system/SystemStates";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export default function Index() {
  const { hydrated, meId } = useCoachData();
  const auth = useAuth();
  // Signed in (or a sample build without accounts) and set up on this phone: straight to the app.
  if (APP_STATUS !== "ok")
    return (
      <Redirect
        href={{ pathname: "/system/[state]", params: { state: APP_STATUS } }}
      />
    );
  if (!hydrated || !auth.ready) return <LoadingScreen />;
  const signedIn = !auth.enabled || !!auth.session;
  if (signedIn && auth.profile?.role === "coach")
    return <Redirect href="/coach" />;
  if (signedIn && meId) return <Redirect href="/athlete" />;
  return (
    <WelcomeScreen
      // Get Started opens the role choice (D44), then athlete or coach onboarding. Sign In sends an
      // email code; it does nothing in sample builds without accounts.
      onGetStarted={() => router.push("/role")}
      onSignIn={() => {
        if (!auth.enabled) return;
        auth.begin(null);
        router.push("/auth/email");
      }}
    />
  );
}
