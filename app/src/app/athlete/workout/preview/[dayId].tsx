// Workout preview (F4-01 → F4-02): what today's session holds, with the last result for each exercise
// so the athlete can plan. Self-guided athletes can edit the program; coached athletes can only swap
// during the workout (D45).
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight, PencilLine, Play } from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useSetActive,
  useWorkoutSummary,
} from "@/features/athlete/ActiveWorkout";
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
import { planLine } from "@/features/coach/plans";
import { colors, radius, rhythm, space } from "@/theme";
import { isoToday } from "@/features/athlete/athleteData";

export default function Preview() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const me = useMe();
  const { sessions, meTier, coachName, settingsOf, setAthleteSettings } =
    useCoachData();
  const active = useWorkoutSummary();
  const setActive = useSetActive();
  const insets = useSafeAreaInsets();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/training");
  if (!me) return <NotJoined />;
  // A program day, or one of the athlete's own routines (F4-01).
  const routine = me.routines?.find((d) => d.id === dayId);
  const planned = me.program?.days.find((d) => d.id === dayId) ?? routine;
  if (!planned) return <PageHeader title="Workout" onBack={back} />;
  // An accepted tailoring for today (D70) replaces the exercises for this one session.
  const dp = settingsOf(me.id).dayPlan;
  const tailored =
    dp?.date === isoToday() && dp.dayId === planned.id ? dp : null;
  const day = tailored
    ? { ...planned, exercises: tailored.exercises }
    : planned;
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
                  label: "Edit template",
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
        {tailored ? (
          <View style={styles.tailored}>
            <Text weight="semibold">Tailored for today: {tailored.reason}</Text>
            <Text
              variant="label"
              weight="medium"
              accessibilityRole="link"
              onPress={() => setAthleteSettings(me.id, { dayPlan: undefined })}
            >
              Use the original plan
            </Text>
          </View>
        ) : null}
        <Text tone="muted" numeric>
          About {estimateMinutes(day)} min
          {day.exercises.length > 1
            ? ` · ${day.exercises.length} exercises · ${sets} sets`
            : ""}
          {routine ? " · your template" : coached ? ` · from ${coachName}` : ""}
        </Text>
        {/* Only notes a person wrote: the coach's, or the athlete's own on a routine (D88). */}
        {day.note?.trim() && (routine || coached) ? (
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
                label={`${e.name}, ${planLine(e)}`}
              >
                <View style={styles.flex}>
                  {e.block ? (
                    <Text variant="eyebrow" tone="muted">
                      {e.block.kind === "station"
                        ? "HYROX station"
                        : "Intervals"}
                    </Text>
                  ) : null}
                  <Text weight="semibold">{e.name}</Text>
                  <Text variant="label" weight="regular" tone="muted" numeric>
                    {planLine(e)}
                    {e.restSec ? ` · rest ${clockTime(e.restSec * 1000)}` : ""}
                    {last.length ? ` · last ${setLabel(last[0], e.name)}` : ""}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </GroupRow>
            );
          })}
        </Group>
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
  tailored: {
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.recovery,
    backgroundColor: colors.surface,
  },
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
