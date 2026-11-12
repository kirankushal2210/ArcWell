// AO-20: what the free plan includes.
import { router } from "expo-router";

import { PreviewScreen } from "@/features/onboarding/ResultScreens";

export default function Preview() {
  return <PreviewScreen onNext={() => router.push("/onboarding/workouts")} />;
}
