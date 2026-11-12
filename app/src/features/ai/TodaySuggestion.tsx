// Recovery-aware day (D70): after a poor night before a training day, a suggestion to train lighter,
// with the reason and its source. "Apply to today" tailors this one workout; "Keep as planned"
// leaves everything as it is. Pro athletes with AI on only; coached athletes never see it (D44).
import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { isoToday } from "@/features/athlete/athleteData";
import { todayDate } from "@/features/athlete/recovery";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { useTodayWorkout } from "@/features/athlete/QuickLog";
import { useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { dayAdjustment } from "@/features/science/rules";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

import { tailor } from "./tailor";

/** Today's suggestion, if there is one to show. */
export function useTodaySuggestion() {
  const me = useMe();
  const { meTier, settingsOf, setAthleteSettings } = useCoachData();
  const r = useRecovery();
  const today = useTodayWorkout();
  if (!me || meTier !== "pro" || !today.day || today.done) return null;
  const s = settingsOf(me.id);
  if (!s.ai) return null;
  const d = isoToday();
  const day = r.day(todayDate());
  const sleepH = day.sleep.minutes / 60;
  const adj = dayAdjustment(sleepH, day.recovery.score);
  const applied = s.dayPlan?.date === d && s.dayPlan.dayId === today.day.id;
  if (adj.kind === "none" || s.dayDeclined === d) return null;
  const workout = today.day;
  return {
    adj,
    applied,
    workout,
    accept: () => {
      const t = tailor(workout, adj.kind === "halve" ? "halve" : "trim");
      setAthleteSettings(me.id, {
        dayPlan: {
          date: d,
          dayId: workout.id,
          exercises: t.exercises,
          reason: adj.title,
        },
      });
    },
    decline: () => setAthleteSettings(me.id, { dayDeclined: d }),
  };
}

export function TodaySuggestion() {
  const s = useTodaySuggestion();
  if (!s) return null;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Sparkles size={18} color={colors.recovery} />
        <Text variant="label" tone="muted" style={styles.flex}>
          AI suggestion · sample
        </Text>
        <WhyThis
          title="Why train lighter today"
          points={[
            s.adj.why,
            "On average, performance drops after a short night, most of all after a late bedtime. The effect varies a lot from person to person.",
            "This is only a suggestion. You can keep the plan as it is.",
          ]}
          sources={s.adj.sources}
        />
      </View>
      <Text weight="semibold">
        {s.applied ? `Done: ${s.adj.title.toLowerCase()}` : s.adj.title}
      </Text>
      <Text variant="label" weight="regular" tone="muted">
        {s.applied
          ? `${s.workout.name} is tailored for today only. Tomorrow goes back to your plan.`
          : `For ${s.workout.name} today. ${s.adj.why}`}
      </Text>
      {s.applied ? (
        <Button
          label="Open today's workout"
          size="sm"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/athlete/workout/preview/[dayId]",
              params: { dayId: s.workout.id },
            })
          }
        />
      ) : (
        <View style={styles.buttons}>
          <View style={styles.flex}>
            <Button
              label="Keep as planned"
              size="sm"
              variant="secondary"
              fullWidth
              onPress={s.decline}
            />
          </View>
          <View style={styles.flex}>
            <Button
              label="Apply to today"
              size="sm"
              pillar="recovery"
              fullWidth
              onPress={s.accept}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.recovery,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1 },
  buttons: { flexDirection: "row", gap: space[2] },
});
