// CO-12: ready to coach. Go to Clients makes the coach's account (email code, PLAN Phase 1), then
// saves the onboarding answers as the coach's profile, creates the first training template they
// chose (CO-10) and opens the coach app (CO-13 onward). Sample builds skip the account.
import { type Href, router } from "expo-router";

import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import { setPendingImport } from "@/features/coach/readSheet";
import {
  firstTemplate,
  profileFromAnswers,
} from "@/features/onboarding/coachAnswers";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { CoachReadyScreen } from "@/features/onboarding/ResultScreens";

export default function CoachReady() {
  const auth = useAuth();
  const { answers } = useOnboarding();
  const { coach, saveCoach, templates, saveTemplate } = useCoachData();

  const open = () => {
    saveCoach(profileFromAnswers(answers, coach));
    const first = firstTemplate(answers);
    let next: Href | null = null;
    if (first.kind === "ready") {
      // An Arcwell starter already in Plans isn't added twice.
      const same = templates.find(
        (t) => t.kind === "training" && t.name === first.program.name,
      );
      const id =
        same && answers.firstTemplate === "arcwell"
          ? same.id
          : saveTemplate({
              kind: "training",
              name: first.program.name,
              program: first.program,
            });
      // From scratch opens the plan builder on the new draft.
      if (answers.firstTemplate === "scratch")
        next = { pathname: "/coach/template/training/[id]", params: { id } };
    } else if (first.kind === "review") {
      // Rows to fix first: the import screen opens on top of Clients.
      setPendingImport(first.draft);
      next = "/coach/template/import";
    }
    router.replace("/coach");
    if (next) router.push(next);
  };

  return (
    <CoachReadyScreen
      onClients={() => {
        if (!auth.enabled || auth.profile?.role === "coach") return open();
        auth.begin({ role: "coach", consent: false, then: open });
        router.push("/auth/email");
      }}
    />
  );
}
