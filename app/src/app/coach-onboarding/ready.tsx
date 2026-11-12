// CO-12: ready to coach. The Clients tab (CO-13 onward) arrives with the coach app shell; until then
// Go to Clients returns to the welcome.
import { router } from "expo-router";

import { CoachReadyScreen } from "@/features/onboarding/ResultScreens";

export default function CoachReady() {
  return <CoachReadyScreen onClients={() => router.dismissAll()} />;
}
