// CO-12: ready to coach. Go to Clients opens the coach app (CO-13 onward) in place of onboarding.
import { router } from "expo-router";

import { CoachReadyScreen } from "@/features/onboarding/ResultScreens";

export default function CoachReady() {
  return <CoachReadyScreen onClients={() => router.replace("/coach")} />;
}
