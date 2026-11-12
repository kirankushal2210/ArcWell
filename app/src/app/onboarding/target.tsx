// AO-19: daily calorie target. "Adjust target" goes back to the goal questions (AO-05).
import { router } from "expo-router";

import { TargetScreen } from "@/features/onboarding/ResultScreens";

export default function Target() {
  return (
    <TargetScreen
      onContinue={() => router.push("/onboarding/preview")}
      onAdjust={() =>
        router.push({ pathname: "/onboarding/[step]", params: { step: "4" } })
      }
    />
  );
}
