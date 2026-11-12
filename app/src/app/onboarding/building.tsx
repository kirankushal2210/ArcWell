// AO-18: building the plan, then on to the calorie target (replace, so Back doesn't land here again).
import { router } from "expo-router";

import { BuildingScreen } from "@/features/onboarding/ResultScreens";

export default function Building() {
  return <BuildingScreen onDone={() => router.replace("/onboarding/target")} />;
}
