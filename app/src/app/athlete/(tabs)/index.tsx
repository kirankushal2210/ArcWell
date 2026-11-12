// Today for a coached athlete: today's workout from the coach's program (or rest day), the next meal
// from the coach's example day, tonight's bedtime with small Recovery, Strain and Stress rings
// (paid and coached; D60), and the coach's latest message.
import { router } from "expo-router";
import {
  Camera,
  Check,
  ChevronRight,
  MessageCircle,
} from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";

import { Avatar, Button, PressableScale, Text } from "@/components/primitives";
import { todayKey, useNutrition } from "@/features/athlete/FoodParts";
import { todayDate } from "@/features/athlete/recovery";
import { Ring, useRecovery } from "@/features/athlete/RecoveryParts";
import { programWeek } from "@/features/athlete/training";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useAuth } from "@/features/auth/AuthProvider";
import { dueText, sentThisWeek } from "@/features/coach/checkins";
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
  const auth = useAuth();
  const r = useRecovery();
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
  const day = meTier !== "free" ? r.day(todayDate()) : null;
  const rings = day
    ? [
        {
          label: "Recovery",
          share: day.recovery.score / 100,
          value: String(day.recovery.score),
          unit: "%",
          open: () =>
            router.push({
              pathname: "/athlete/recovery",
              params: { tab: "recovery" },
            }),
        },
        {
          label: "Strain",
          share: day.strain.score / 21,
          value: day.strain.score.toFixed(1),
          open: () =>
            router.push({
              pathname: "/athlete/recovery",
              params: { tab: "strain" },
            }),
        },
        {
          label: "Stress",
          share: day.stress.value / 3,
          value: day.stress.value.toFixed(1),
          open: () => router.push("/athlete/recovery/stress"),
        },
      ]
    : [];
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
        {meTier === "coached" ? (
          <PressableScale
            onPress={() => router.push("/athlete/chat")}
            accessibilityRole="button"
            accessibilityLabel={`Message ${coachName}${me.coachUnread ? `, ${me.coachUnread} unread` : ""}`}
            style={styles.coach}
          >
            <Avatar name={coachName.replace(/^Coach\s+/, "")} />
            <View style={styles.flex}>
              <Text variant="label" tone="muted">
                {coachName}
              </Text>
              <Text numberOfLines={2}>
                {lastCoach?.text ?? "Message your coach any time."}
              </Text>
            </View>
            {me.coachUnread ? (
              <View style={styles.badge}>
                <Text
                  variant="caption"
                  weight="semibold"
                  tone="onBrand"
                  numeric
                >
                  {me.coachUnread}
                </Text>
              </View>
            ) : (
              <MessageCircle size={20} color={colors.textMuted} />
            )}
          </PressableScale>
        ) : null}

        {meTier === "coached" &&
        me.enhanced?.requestedAt &&
        !me.enhanced.consentAt &&
        !me.enhanced.declinedAt ? (
          <View style={styles.card}>
            <Text weight="semibold">
              {coachName} asked to track your enhanced protocol
            </Text>
            <Text tone="muted">
              Your choice. See what&apos;s recorded before you decide.
            </Text>
            <Button
              label="Review"
              variant="secondary"
              fullWidth
              onPress={() => router.push("/athlete/enhanced")}
            />
          </View>
        ) : null}
        {meTier === "coached" ? (
          <View style={styles.card}>
            {(() => {
              const k = me.checkIns[0];
              const sent = sentThisWeek(me);
              const title = !me.checkIns.length
                ? "Send your starting point"
                : sent
                  ? k?.reviewed
                    ? `${coachName} replied to your check-in`
                    : "Check-in sent"
                  : "Weekly check-in";
              const sub = !me.checkIns.length
                ? "Photos and weight, so you can see how far you come"
                : sent
                  ? k?.reviewed
                    ? k.reply
                    : `${coachName} will reply soon`
                  : `${dueText(me)} · photos, weight and 6 questions`;
              return (
                <>
                  <View style={styles.head}>
                    <Camera size={20} color={colors.text} />
                    <Text weight="semibold" style={styles.flex}>
                      {title}
                    </Text>
                  </View>
                  <Text tone="muted" numberOfLines={3}>
                    {sub}
                  </Text>
                  <Button
                    label={sent ? "Open" : "Check in"}
                    variant={sent ? "secondary" : "primary"}
                    fullWidth
                    onPress={() => router.push("/athlete/weekly-check-in")}
                  />
                </>
              );
            })()}
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
          {rings.length ? (
            <GroupRow>
              <View style={styles.rings}>
                {rings.map((g) => (
                  <PressableScale
                    key={g.label}
                    onPress={g.open}
                    accessibilityRole="button"
                    accessibilityLabel={`${g.label} ${g.value}${g.unit ?? ""}. Open ${g.label}`}
                    style={styles.ring}
                  >
                    <Ring
                      share={g.share}
                      value={g.value}
                      unit={g.unit}
                      size={52}
                      stroke={5}
                    />
                    <Text variant="caption" tone="muted">
                      {g.label}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </GroupRow>
          ) : null}
        </Group>
        {auth.session ? (
          <Button
            label="Sign out"
            variant="ghost"
            fullWidth
            onPress={() =>
              Alert.alert(
                "Sign out?",
                "Your plan and history stay on this phone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign out",
                    onPress: () => {
                      auth.signOut().finally(() => {
                        if (router.canDismiss()) router.dismissAll();
                        router.replace("/");
                      });
                    },
                  },
                ],
              )
            }
          />
        ) : null}
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
  rings: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  ring: { alignItems: "center", gap: space[1] },
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: space[1],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
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
