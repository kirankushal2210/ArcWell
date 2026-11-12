// CO-12: ready to coach. Go to Clients makes the coach's account (email code, PLAN Phase 1), then
// opens the coach app (CO-13 onward) in place of onboarding. Sample builds skip the account.
import { router } from "expo-router";

import { useAuth } from "@/features/auth/AuthProvider";
import { CoachReadyScreen } from "@/features/onboarding/ResultScreens";

export default function CoachReady() {
  const auth = useAuth();
  const open = () => router.replace("/coach");
  return (
    <CoachReadyScreen
      onClients={() => {
        if (!auth.enabled || auth.profile?.role === "coach") return open();
        auth.begin({ role: "coach", consent: false, then: open });
        router.push("/auth/email");
      }}
    />
  );
}
