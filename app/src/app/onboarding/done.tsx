// AO-21: all set. Today and the invite-code entry arrive with the athlete app shell and sign-up (Phase 5);
// until then Go to Today returns to the welcome and the invite link does nothing.
import { router } from "expo-router";

import { DoneScreen } from "@/features/onboarding/ResultScreens";

export default function Done() {
  return <DoneScreen onToday={() => router.dismissAll()} onInvite={() => {}} />;
}
