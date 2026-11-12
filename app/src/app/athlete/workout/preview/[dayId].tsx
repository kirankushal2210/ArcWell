// Workout preview (F4-01 → F4-02): what today's session holds, with the last result for each exercise
// so the athlete can plan. Self-guided athletes can edit the program; coached athletes can only swap
// during the workout (D45).
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight, PencilLine, Play } from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import {
  clockTime,
  estimateMinutes,
  previousSets,
  setLabel,
  startFromDay,
} from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

export default function Preview() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const me = useMe();
  const { active, setActive, sessions, meTier, coachName } = useCoachData();
  const insets = useSafeAreaInsets();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/training");
  if (!me) return <NotJoined />;
  // A program day, or one of the athlete's own routines (F4-01).
  const routine = me.routines?.find((d) => d.id === dayId);
  const day = me.program?.days.find((d) => d.id === dayId) ?? routine;
  if (!day) return <PageHeader title="Workout" onBack={back} />;
  const history = sessions(me.id);
  const coached = meTier === "coached";
  const sets = day.exercises.reduce((n, e) => n + e.sets, 0);

  const start = () => {
    if (active && active.dayId !== day.id) {
      Alert.alert(
        "A workout is already running",
        `Finish or discard ${active.name} first.`,
        [
          { text: "Not now", style: "cancel" },
          { text: "Open it", onPress: () => router.push("/athlete/workout") },
        ],
      );
      return;
    }
    if (!active) setActive(startFromDay(day, history));
    // Replace the preview, so minimising the workout lands on the tabs (F4-09).
    router.replace("/athlete/workout");
  };

  return (
    <View style={styles.root}>
      <PageHeader
        title={day.name}
        onBack={back}
        actions={
          routine
            ? [
                {
                  icon: PencilLine,
                  label: "Edit routine",
                  onPress: () =>
                    router.push({
                      pathname: "/athlete/routine/[id]",
                      params: { id: routine.id },
                    }),
                },
              ]
            : coached
              ? []
              : [
                  {
                    icon: PencilLine,
                    label: "Edit program",
                    onPress: () =>
                      router.push({
                        pathname: "/coach/plan/training/[id]",
                        params: { id: me.id },
                      }),
                  },
                ]
        }
      />
      <Page>
        <Text tone="muted" numeric>
          About {estimateMinutes(day)} min · {day.exercises.length} exercises ·{" "}
          {sets} sets
          {routine ? " · your routine" : coached ? ` · from ${coachName}` : ""}
        </Text>
        {day.note?.trim() ? (
          <View style={styles.note}>
            <Text variant="label" tone="muted">
              {coached && !routine ? `From ${coachName}` : "Your note"}
            </Text>
            <Text>{day.note.trim()}</Text>
          </View>
        ) : null}
        <Group>
          {day.exercises.map((e, i) => {
            const last = previousSets(history, e.name);
            return (
              <GroupRow
                key={e.id}
                first={i === 0}
                onPress={() =>
                  router.push({
                    pathname: "/athlete/exercises/[name]",
                    params: { name: e.name },
                  })
                }
                label={`${e.name}, ${e.sets} sets of ${e.reps}`}
              >
                <View style={styles.flex}>
                  <Text weight="semibold">{e.name}</Text>
                  <Text variant="label" weight="regular" tone="muted" numeric>
                    {e.sets} × {e.reps}
                    {e.restSec ? ` · rest ${clockTime(e.restSec * 1000)}` : ""}
                    {last.length ? ` · last ${setLabel(last[0], e.name)}` : ""}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </GroupRow>
            );
          })}
        </Group>
        <Text variant="caption" tone="muted">
          {coached
            ? `${coachName} set this session. If equipment is busy, swap an exercise during the workout.`
            : "Change anything with Edit, or swap an exercise during the workout."}
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={active?.dayId === day.id ? "Resume workout" : "Start workout"}
          icon={Play}
          pillar="training"
          fullWidth
          onPress={start}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  note: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
