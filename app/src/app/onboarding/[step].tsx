// /onboarding/0 … /onboarding/16: the athlete onboarding questions, one per screen.
import { router, useLocalSearchParams } from "expo-router";

import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { QuestionScreen } from "@/features/onboarding/QuestionScreen";
import { questions, questionShown } from "@/features/onboarding/questions";

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const index = Math.min(Math.max(Number(step) || 0, 0), questions.length - 1);

  const { answers } = useOnboarding();

  const onNext = () => {
    // Skip questions that don't apply (the HYROX branch only follows the race goal).
    let next = index + 1;
    while (next < questions.length && !questionShown(questions[next], answers))
      next++;
    if (next < questions.length) {
      router.push({
        pathname: "/onboarding/[step]",
        params: { step: String(next) },
      });
    } else {
      // Finish: build the plan (AO-18), then the results. Sign-up and saving answers come in Phase 5.
      router.push("/onboarding/building");
    }
  };

  // Opened directly (deep link) there is no history, so Back goes to the welcome.
  const onBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  return <QuestionScreen index={index} onNext={onNext} onBack={onBack} />;
}
