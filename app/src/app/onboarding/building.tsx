// AO-18: building the plan, then "your plan is ready" (D57; replace, so Back doesn't land here again).
import { router } from "expo-router";

import { useCoachData } from "@/features/coach/CoachData";
import { BuildingScreen } from "@/features/onboarding/ResultScreens";

export default function Building() {
  const { joiningCoach } = useCoachData();
  // Joined through a coach's general link: their coach sets targets, so no plan reveal or paywall (AO-21b).
  return (
    <BuildingScreen
      onDone={() =>
        router.replace(
          joiningCoach ? "/onboarding/connected" : "/onboarding/ready",
        )
      }
    />
  );
}
