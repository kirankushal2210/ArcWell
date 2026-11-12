// Holds the athlete's onboarding answers while they move through the questions.
// Saving to the server comes with sign-up (Phase 5); for now answers live in memory.
import { createContext, type ReactNode, useContext, useState } from "react";

export type Answers = Record<string, unknown>;

type OnboardingValue = {
  answers: Answers;
  setAnswer: (key: string, value: unknown) => void;
};

const OnboardingContext = createContext<OnboardingValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const setAnswer = (key: string, value: unknown) =>
    setAnswers((a) => ({ ...a, [key]: value }));
  return (
    <OnboardingContext.Provider value={{ answers, setAnswer }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return value;
}
