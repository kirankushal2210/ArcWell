// Today for a coached athlete: today's workout from the coach's program (or rest day), the next meal
// from the coach's example day, tonight's bedtime, and the coach's latest message.
import { router } from "expo-router";
import { Check, ChevronRight } from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import { todayKey, useNutrition } from "@/features/athlete/FoodParts";
import { programWeek } from "@/features/athlete/training";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  PageHeader,
  PillarDot,
} from "@/features/coach/parts";
import { clock, todayIndex, weekSchedule } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";

const dateLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
const todayShort = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export default function Today() {
  const me = useMe();
  const n = useNutrition();
  const { coachName, meTier, active, resetSample } = useCoachData();
  if (!me) return <NotJoined />;

  const first = me.name.split(" ")[0];
  const restDays = me.protocol?.restDays ?? [];
  const schedule = me.program ? weekSchedule(me.program, restDays) : [];
  const today = schedule[todayIndex()]?.day ?? null;
  const doneToday = me.training.logs.some(
    (l) => l.date === todayShort() && l.name === today?.name,
  );
  const lastCoach =
    meTier === "coached"
      ? [...me.messages].reverse().find((m) => m.from === "coach")
      : undefined;
  const meals = me.nutritionPlan?.meals ?? [];
  const eatenToday = n.logs
    .filter((l) => l.date === todayKey())
    .reduce((s, l) => s + l.macros.kcal, 0);

  return (
    <View style={styles.root}>
      <PageHeader
        title={meTier === "coached" ? `Hi ${first}` : "Today"}
        sub={dateLabel()}
      />
      <AthletePage>
        {lastCoach ? (
          <View style={styles.coach}>
            <Avatar name={coachName.replace(/^Coach\s+/, "")} />
            <View style={styles.flex}>
              <Text variant="label" tone="muted">
                {coachName}
              </Text>
              <Text>{lastCoach.text}</Text>
            </View>
          </View>
        ) : null}

        <Eyebrow>Training today</Eyebrow>
        <View style={styles.card}>
          {today ? (
            <>
              <View style={styles.head}>
                <PillarDot pillar="training" />
                <Text variant="title" style={styles.flex}>
                  {today.name}
                </Text>
                {doneToday ? (
                  <View style={styles.done}>
                    <Check size={14} strokeWidth={3} color={colors.onBrand} />
                  </View>
                ) : null}
              </View>
              <Text tone="muted" numeric>
                {today.exercises.length} exercises ·{" "}
                {today.exercises.reduce((n, e) => n + e.sets, 0)} sets · week{" "}
                {me.program
                  ? programWeek(me.program.weeks, me.programStart).week
                  : 1}{" "}
                of {me.program?.weeks}
              </Text>
              <Button
                label={
                  active?.dayId === today.id
                    ? "Resume workout"
                    : doneToday
                      ? "Done today · view"
                      : "Start workout"
                }
                variant={doneToday ? "secondary" : "primary"}
                fullWidth
                onPress={() =>
                  router.push({
                    pathname: "/athlete/workout/preview/[dayId]",
                    params: { dayId: today.id },
                  })
                }
              />
            </>
          ) : (
            <>
              <View style={styles.head}>
                <PillarDot pillar={me.program ? "recovery" : "training"} />
                <Text variant="title">
                  {me.program
                    ? "Rest day"
                    : `${coachName} is building your plan`}
                </Text>
              </View>
              <Text tone="muted">
                {me.program
                  ? me.protocol?.note ||
                    "Recover today. Your next workout is in Training."
                  : "It shows here as soon as it's ready. You can still log a workout from Training."}
              </Text>
            </>
          )}
        </View>

        <Eyebrow>Nutrition</Eyebrow>
        <Group>
          <GroupRow
            first
            onPress={() => router.push("/athlete/nutrition")}
            label="Food today"
          >
            <PillarDot pillar="nutrition" />
            <Text style={styles.flex}>
              {eatenToday ? "Eaten today" : "Daily target"}
            </Text>
            <Text weight="semibold" numeric>
              {me.nutritionPlan
                ? eatenToday
                  ? `${Math.round(eatenToday).toLocaleString("en-IN")} of ${me.nutritionPlan.kcal.toLocaleString("en-IN")} kcal`
                  : `${me.nutritionPlan.kcal.toLocaleString("en-IN")} kcal${n.macros ? ` · ${me.nutritionPlan.protein} g protein` : ""}`
                : eatenToday
                  ? `${Math.round(eatenToday).toLocaleString("en-IN")} kcal`
                  : "—"}
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
          {meals.slice(0, 2).map((m) => (
            <GroupRow key={m.id}>
              <View style={styles.dotSpace} />
              <View style={styles.flex}>
                <Text weight="medium">
                  {m.name} · {m.time}
                </Text>
                <Text variant="label" weight="regular" tone="muted">
                  {m.foods}
                </Text>
              </View>
            </GroupRow>
          ))}
        </Group>

        <Eyebrow>Tonight</Eyebrow>
        <Group>
          <GroupRow
            first
            onPress={() => router.push("/athlete/recovery")}
            label="Sleep plan"
          >
            <PillarDot pillar="recovery" />
            <Text style={styles.flex}>In bed by</Text>
            <Text weight="semibold" numeric>
              {me.protocol
                ? `${clock(me.protocol.bed)} · ${me.protocol.sleepH} h`
                : "—"}
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
        </Group>
        <Button
          label="Sample build: reset this phone"
          variant="ghost"
          fullWidth
          onPress={() =>
            Alert.alert(
              "Reset this phone?",
              "Clears your plan, workouts and history from this sample build.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => {
                    resetSample();
                    router.replace("/");
                  },
                },
              ],
            )
          }
        />
      </AthletePage>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  coach: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  done: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  dotSpace: { width: 8 },
});
