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
import { recentNames } from "@/features/athlete/ExercisePicker";
import { ExerciseList } from "@/features/athlete/ExerciseList";
import { HistoryWeeks } from "@/features/athlete/HistoryWeeks";
import { athleteMenuAction } from "@/features/athlete/MenuParts";
import { MyRoutines } from "@/features/athlete/MyRoutines";
import { emptyWorkout, programWeek } from "@/features/athlete/training";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import { PageHeader } from "@/features/coach/parts";
import { HYROX_EXERCISES } from "@/features/race/data";
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

      <MyRoutines me={me} explore={!coached} />
    </AthletePage>
  );
}

type TrainingTab = "plan" | "history" | "exercises" | "race";
const TABS: { key: TrainingTab; label: string }[] = [
  { key: "plan", label: "Plan" },
  { key: "history", label: "History" },
  { key: "exercises", label: "Exercises" },
];
/** The Race section exists only while a race goal is active (D76). */
const RACE_TAB = { key: "race" as const, label: "Race" };

/** Training (D61): Plan · History · Exercises as section tabs under the title. */
export default function Training() {
  const me = useMe();
  const { coachName, meTier, sessions } = useCoachData();
  const [tab, setTab] = useState<TrainingTab>("plan");
  const vis = useVisibility();
  if (!me) return <NotJoined />;
  const program = me.program;
  const pw = program ? programWeek(program.weeks, me.programStart) : null;
  return (
    <View style={styles.root}>
      <PageHeader
        title="Training"
        sub={
          program && pw
            ? `${program.name} · ${pw.done ? "complete" : `week ${pw.week} of ${pw.weeks}`} · ${meTier === "coached" ? `by ${coachName}` : me.formerCoach ? `from ${me.formerCoach.coachName}, read-only` : "from your answers"}`
            : undefined
        }
        actions={[athleteMenuAction]}
      />
      <SectionTabs
        tabs={vis.race ? [...TABS, RACE_TAB] : TABS}
        value={!vis.race && tab === "race" ? "plan" : tab}
        onChange={setTab}
        pages={[
          <PlanPage key="p" />,
          <AthletePage key="h">
            <HistoryWeeks me={me} />
          </AthletePage>,
          <View key="e" style={styles.root}>
            <View style={styles.newRow}>
              <Button
                label="New exercise"
                icon={Plus}
                variant="ghost"
                onPress={() => router.push("/athlete/exercises/new")}
              />
            </View>
            <ExerciseList
              recent={recentNames(sessions(me.id))}
              suggested={
                vis.hyrox
                  ? { title: "HYROX", names: HYROX_EXERCISES }
                  : undefined
              }
              onPress={(e) =>
                router.push({
                  pathname: "/athlete/exercises/[name]",
                  params: { name: e.name },
                })
              }
            />
          </View>,
          ...(vis.race
            ? [
                <AthletePage key="r">
                  <RacePage />
                </AthletePage>,
              ]
            : []),
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
