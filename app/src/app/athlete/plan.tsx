// The plan (D89): Arcwell's plan from the athlete's answers, or the coach's plan. Its workouts as
// routine cards, each starting in one tap. Self-guided athletes can switch programs from here.
import { router } from "expo-router";

import { Button } from "@/components/primitives";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { RoutineCard } from "@/features/athlete/MyRoutines";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";

export default function Plan() {
  const me = useMe();
  const { meTier } = useCoachData();
  if (!me) return <NotJoined />;
  const coached = meTier === "coached";
  const back = backTo("/athlete/training");
  const plan = me.program;
  return (
    <MenuPage
      title={coached ? "Coach plan" : "Arcwell plan"}
      back={back}
      footer={
        coached ? undefined : (
          <Button
            label="Explore other programs"
            variant="secondary"
            fullWidth
            onPress={() => router.push("/athlete/programs")}
          />
        )
      }
    >
      {(plan?.days ?? []).map((d) => (
        <RoutineCard key={d.id} day={d} />
      ))}
    </MenuPage>
  );
}
