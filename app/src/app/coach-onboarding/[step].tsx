// /coach-onboarding/0 … /coach-onboarding/9: coach onboarding screens CO-02 to CO-11, then Ready to coach.
import { router, useLocalSearchParams } from "expo-router";

import { coachFlow } from "@/features/onboarding/coachQuestions";
import { QuestionScreen } from "@/features/onboarding/QuestionScreen";

export default function CoachOnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const last = coachFlow.questions.length - 1;
  const index = Math.min(Math.max(Number(step) || 0, 0), last);

  const onNext = () =>
    index < last
      ? router.push({
          pathname: "/coach-onboarding/[step]",
          params: { step: String(index + 1) },
        })
      : router.push("/coach-onboarding/ready");
  // Opened directly (deep link) there is no history, so Back goes to the welcome.
  const onBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  return (
    <QuestionScreen
      flow={coachFlow}
      index={index}
      onNext={onNext}
      onBack={onBack}
    />
  );
}
