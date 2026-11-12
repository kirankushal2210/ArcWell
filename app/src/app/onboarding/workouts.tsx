// The tailored starter workouts, built from the onboarding answers.
import { router } from "expo-router";

import { WorkoutsScreen } from "@/features/onboarding/ResultScreens";

export default function Workouts() {
  return <WorkoutsScreen onNext={() => router.push("/onboarding/done")} />;
}
