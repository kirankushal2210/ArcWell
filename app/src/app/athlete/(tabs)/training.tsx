// Training (T-01 to T-03, F4-13, D83): start an empty workout, routines (the plan's workouts and the
// athlete's own), history and the exercise library. The plan comes from the coach (coached) or from
// the athlete's answers (self-guided, D57).
import { router } from "expo-router";
import { Play, Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import {
  useSetActive,
  useWorkoutSummary,
} from "@/features/athlete/ActiveWorkout";
import {
  athleteMenuAction,
  progressAction,
} from "@/features/athlete/MenuParts";
import { MyRoutines } from "@/features/athlete/MyRoutines";
import { emptyWorkout, programWeek } from "@/features/athlete/training";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import { PageHeader } from "@/features/coach/parts";
import { EndurancePage } from "@/features/cardio/EndurancePage";
import { RacePage } from "@/features/race/RacePage";
import { colors, radius, space } from "@/theme";

/** Plan (D83): start an empty workout, then routines. Nothing else to read. */
function PlanPage() {
  const me = useMe();
  const { coachName, meTier, restartProgram } = useCoachData();
  const active = useWorkoutSummary();
  const setActive = useSetActive();
  if (!me) return <NotJoined />;
  const coached = meTier === "coached";
  const program = me.program;
  const pw = program ? programWeek(program.weeks, me.programStart) : null;
  const startEmpty = () => {
    if (!active) setActive(emptyWorkout());
    router.push("/athlete/workout");
  };

  return (
    <AthletePage>
      <Button
        label={active ? `Resume ${active.name}` : "Start an empty workout"}
        icon={active ? Play : Plus}
        fullWidth
        onPress={startEmpty}
      />

      {!program && coached ? (
        <Text variant="label" tone="muted">
          {`${coachName} is building your plan.`}
        </Text>
      ) : null}

      {pw?.done ? (
        <View style={styles.card}>
          <Text weight="semibold">Program complete</Text>
          {coached ? (
            <Text variant="label" tone="muted">
              {`${coachName} sets your next program.`}
            </Text>
          ) : (
            <Button
              label="Start again from week 1"
              variant="secondary"
              size="sm"
              onPress={() => restartProgram(me.id)}
            />
          )}
        </View>
      ) : null}

      <MyRoutines me={me} coached={coached} />
    </AthletePage>
  );
}

type TrainingTab = "plan" | "race" | "endurance";
/** D99: the plan tab is Hypertrophy (lifting), beside Endurance (cardio). */
const PLAN_TAB = { key: "plan" as const, label: "Hypertrophy" };
/** The Race section exists only while a race goal is active (D76). */
const RACE_TAB = { key: "race" as const, label: "Race" };
/** Endurance (D99): cardio fitness and this week's cardio sessions. Overload stays in the menu. */
const ENDURANCE_TAB = { key: "endurance" as const, label: "Endurance" };

/** Training (D61, D85, D99): Hypertrophy · Race (while racing) · Endurance as section tabs. The
 * exercise library opens only when building a routine or adding to a workout. */
export default function Training() {
  const me = useMe();
  const [tab, setTab] = useState<TrainingTab>("plan");
  const vis = useVisibility();
  if (!me) return <NotJoined />;
  return (
    <View style={styles.root}>
      <PageHeader
        title="Training"
        actions={[progressAction, athleteMenuAction]}
      />
      <SectionTabs
        tabs={
          vis.race
            ? [PLAN_TAB, RACE_TAB, ENDURANCE_TAB]
            : [PLAN_TAB, ENDURANCE_TAB]
        }
        value={!vis.race && tab === "race" ? "plan" : tab}
        onChange={setTab}
        pages={[
          <PlanPage key="p" />,
          ...(vis.race
            ? [
                <AthletePage key="r">
                  <RacePage />
                </AthletePage>,
              ]
            : []),
          <AthletePage key="e">
            <EndurancePage />
          </AthletePage>,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  newRow: { alignItems: "flex-end", paddingHorizontal: space[2] },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
