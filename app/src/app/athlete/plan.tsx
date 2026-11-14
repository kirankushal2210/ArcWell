// The plan (D89, D105): Arcwell's plan from the athlete's answers, or, for athletes who joined
// through a coach, the coach's plan: the program the coach assigned, under the coach's name. Its
// workouts as routine cards, each starting in one tap. Self-guided athletes can switch programs
// from here; coached athletes ask their coach.
import { router } from "expo-router";

import { Button, Text } from "@/components/primitives";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { RoutineCard } from "@/features/athlete/MyRoutines";
import { programWeek } from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";

export default function Plan() {
  const me = useMe();
  const { meTier, coachName } = useCoachData();
  if (!me) return <NotJoined />;
  const coached = meTier === "coached";
  const back = backTo("/athlete/training");
  const plan = me.program;
  const pw = plan ? programWeek(plan.weeks, me.programStart) : null;
  const week = pw
    ? pw.done
      ? `${pw.weeks} weeks · complete`
      : `Week ${pw.week} of ${pw.weeks}`
    : undefined;
  const sub = plan
    ? [plan.name, coached ? `from ${coachName}` : undefined]
        .filter(Boolean)
        .join(" · ")
    : undefined;
  return (
    <MenuPage
      title={coached ? "Coach plan" : "Arcwell plan"}
      sub={sub}
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
      {week ? (
        <Text variant="label" tone="muted" numeric>
          {week}
        </Text>
      ) : null}
      {plan ? null : (
        <Text tone="muted">
          {coached
            ? `${coachName} is building your plan.`
            : "Pick a program to get your plan."}
        </Text>
      )}
      {(plan?.days ?? []).map((d) => (
        <RoutineCard key={d.id} day={d} />
      ))}
    </MenuPage>
  );
}
