// Today: the coach's latest message and the weekly check-in (coached), then one card per pillar:
// today's workout (or rest day), food eaten against the target, and tonight's bedtime with small
// Recovery, Strain and Stress rings (paid and coached; D60). The dock starts today's workout in
// Honey, or logs food once training is done (D67).
import { router } from "expo-router";
import {
  Camera,
  Check,
  MessageCircle,
  Play,
  Plus,
  Sparkles,
} from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";

import { Avatar, Button, PressableScale, Text } from "@/components/primitives";
import { slotNow, todayKey, useNutrition } from "@/features/athlete/FoodParts";
import { athleteMenuAction } from "@/features/athlete/MenuParts";
import { useTodayWorkout } from "@/features/athlete/QuickLog";
import { todayDate } from "@/features/athlete/recovery";
import { Ring, useRecovery } from "@/features/athlete/RecoveryParts";
import { programWeek } from "@/features/athlete/training";
import {
  AthleteDock,
  AthletePage,
  NotJoined,
  useMe,
} from "@/features/athlete/useMe";
import { useAuth } from "@/features/auth/AuthProvider";
import { dueText, sentThisWeek } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, PageHeader, PillarDot } from "@/features/coach/parts";
import { clock } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";
import {
  REMIND_DAY,
  shortDay,
  subscriptionInfo,
} from "@/features/athlete/athleteData";

const dateLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
export default function Today() {
  const me = useMe();
  const n = useNutrition();
  const { coachName, meTier, resetSample, settingsOf } = useCoachData();
  const auth = useAuth();
  const r = useRecovery();
  const tw = useTodayWorkout();
  if (!me) return <NotJoined />;

  const first = me.name.split(" ")[0];
  const coachFirst = coachName.replace(/^Coach\s+/, "");
  const sub = meTier === "pro" ? subscriptionInfo(settingsOf(me.id).sub) : null;
  const waitingPhotos = (me.transformations ?? []).find(
    (t) => t.status === "waiting",
  );
  const today = tw.day;
  const doneToday = tw.done;
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

  const kcal = (v: number) => Math.round(v).toLocaleString("en-IN");
  const plan = me.nutritionPlan;
  const eatenProtein = n.logs
    .filter((l) => l.date === todayKey())
    .reduce((s, l) => s + l.macros.p, 0);
  const checkIn = (() => {
    const k = me.checkIns[0];
    const sent = sentThisWeek(me);
    return {
      sent,
      title: !me.checkIns.length
        ? "Send your starting point"
        : sent
          ? k?.reviewed
            ? `${coachName} replied to your check-in`
            : "Check-in sent"
          : "Weekly check-in",
      sub: !me.checkIns.length
        ? "Photos and weight, so you can see how far you come"
        : sent
          ? k?.reviewed
            ? (k.reply ?? "")
            : `${coachName} will reply soon`
          : `${dueText(me)} · photos, weight and 6 questions`,
    };
  })();
  const openToday = () =>
    today &&
    router.push({
      pathname: "/athlete/workout/preview/[dayId]",
      params: { dayId: today.id },
    });

  return (
    <View style={styles.root}>
      <PageHeader
        title={meTier === "coached" ? `Hi ${first}` : "Today"}
        sub={dateLabel()}
        actions={[
          ...(meTier === "coached" || !settingsOf(me.id).ai
            ? []
            : [
                {
                  icon: Sparkles,
                  label:
                    meTier === "free"
                      ? "AI coach, start free trial"
                      : "AI coach",
                  onPress: () => router.push("/athlete/ai"),
                },
              ]),
          athleteMenuAction,
        ]}
      />
      <AthletePage dock>
        {meTier === "pro" &&
        sub &&
        (sub.status === "grace" ||
          (sub.status === "trial" && sub.day >= REMIND_DAY)) ? (
          <PressableScale
            onPress={() => router.push("/athlete/subscription")}
            accessibilityRole="button"
            accessibilityLabel={
              sub.status === "grace"
                ? "Fix your payment"
                : "Your trial is ending"
            }
            style={[styles.banner, sub.status === "grace" && styles.bannerWarn]}
          >
            <Text weight="semibold">
              {sub.status === "grace"
                ? "Your payment didn't go through"
                : sub.trialDaysLeft <= 1
                  ? "Your free trial ends tomorrow"
                  : `Your free trial ends in ${sub.trialDaysLeft} days`}
            </Text>
            <Text variant="label" weight="regular" tone="muted">
              {sub.status === "grace"
                ? `Update it in the Play Store by ${shortDay(sub.graceEnds)} to keep Arcwell Plus.`
                : `Arcwell Plus starts on ${shortDay(sub.trialEnds)}. Cancel in the Play Store before then and you won't be charged.`}
            </Text>
          </PressableScale>
        ) : null}
        {meTier === "coached" &&
        (me.status === "paused" || me.status === "leaving") ? (
          <View style={styles.banner}>
            <Text weight="semibold">
              {me.status === "paused"
                ? `Coaching paused${me.statusUntil ? ` until ${me.statusUntil}` : ""}`
                : `Coaching with ${coachFirst} ends${me.statusUntil ? ` on ${me.statusUntil}` : " soon"}`}
            </Text>
            <Text variant="label" weight="regular" tone="muted">
              {me.statusNote ? `${me.statusNote} ` : ""}
              {me.status === "paused"
                ? "Check-ins and reminders are paused. Your plan and chat still work."
                : "Everything works as normal until then. Afterwards you move to the free plan and keep the plan, read-only."}
            </Text>
          </View>
        ) : null}
        {waitingPhotos ? (
          <Group>
            <GroupRow first>
              <View style={styles.flex}>
                <Text weight="medium">
                  {`${coachFirst} would like to share your progress`}
                </Text>
                <Text variant="label" weight="regular" tone="muted">
                  You decide. Nothing is shared unless you approve.
                </Text>
              </View>
              <Button
                label="Review"
                size="sm"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/athlete/photos/review/[id]",
                    params: { id: waitingPhotos.id },
                  })
                }
              />
            </GroupRow>
          </Group>
        ) : null}
        {meTier === "coached" ? (
          <Group>
            <GroupRow
              first
              onPress={() => router.push("/athlete/chat")}
              label={`Message ${coachName}${me.coachUnread ? `, ${me.coachUnread} unread` : ""}`}
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
            </GroupRow>
            {me.status === "paused" ? null : (
              <GroupRow>
                <View style={styles.iconBox}>
                  <Camera size={18} color={colors.text} />
                </View>
                <View style={styles.flex}>
                  <Text weight="medium">{checkIn.title}</Text>
                  <Text
                    variant="label"
                    weight="regular"
                    tone="muted"
                    numberOfLines={2}
                  >
                    {checkIn.sub}
                  </Text>
                </View>
                <Button
                  label={checkIn.sent ? "Open" : "Check in"}
                  size="sm"
                  variant="secondary"
                  onPress={() => router.push("/athlete/weekly-check-in")}
                />
              </GroupRow>
            )}
            {me.enhanced?.requestedAt &&
            !me.enhanced.consentAt &&
            !me.enhanced.declinedAt ? (
              <GroupRow>
                <View style={styles.flex}>
                  <Text weight="medium">
                    {coachName} asked to track your enhanced protocol
                  </Text>
                  <Text variant="label" weight="regular" tone="muted">
                    Your choice. See what&apos;s recorded before you decide.
                  </Text>
                </View>
                <Button
                  label="Review"
                  size="sm"
                  variant="secondary"
                  onPress={() => router.push("/athlete/enhanced")}
                />
              </GroupRow>
            ) : null}
          </Group>
        ) : null}

        <PressableScale
          onPress={today ? openToday : () => router.push("/athlete/training")}
          accessibilityRole="button"
          accessibilityLabel={
            today ? `${today.name}. Open workout` : "Open Training"
          }
          style={styles.card}
        >
          <View style={styles.head}>
            <PillarDot pillar="training" />
            <Text variant="label" style={styles.flex}>
              {today
                ? doneToday
                  ? "Done today"
                  : "Up next"
                : me.program
                  ? "Rest day"
                  : "Training"}
            </Text>
            {me.program ? (
              <Text variant="label" weight="regular" tone="muted" numeric>
                Week {programWeek(me.program.weeks, me.programStart).week} of{" "}
                {me.program.weeks}
              </Text>
            ) : null}
          </View>
          {today ? (
            <>
              <View style={styles.head}>
                <Text variant="title" style={styles.flex}>
                  {today.name}
                </Text>
                {doneToday ? (
                  <View style={styles.done}>
                    <Check size={14} strokeWidth={3} color={colors.onPillar} />
                  </View>
                ) : null}
              </View>
              <Text tone="muted" numeric>
                {today.exercises.length} exercises ·{" "}
                {today.exercises.reduce((s, e) => s + e.sets, 0)} sets
              </Text>
            </>
          ) : (
            <Text tone="muted">
              {me.program
                ? me.protocol?.note ||
                  "Recover today. Your next workout is in Training."
                : `${coachName} is building your plan. It shows here as soon as it's ready.`}
            </Text>
          )}
        </PressableScale>

        <PressableScale
          onPress={() => router.push("/athlete/nutrition")}
          accessibilityRole="button"
          accessibilityLabel="Open Nutrition"
          style={styles.card}
        >
          <View style={styles.head}>
            <PillarDot pillar="nutrition" />
            <Text variant="label" style={styles.flex}>
              Nutrition
            </Text>
            {meals[0] ? (
              <Text variant="label" weight="regular" tone="muted">
                {meals[0].name} · {meals[0].time}
              </Text>
            ) : null}
          </View>
          <Text numeric>
            <Text variant="title" numeric>
              {kcal(eatenToday)}
            </Text>
            <Text tone="muted" numeric>
              {plan ? ` of ${kcal(plan.kcal)} kcal` : " kcal today"}
            </Text>
          </Text>
          {plan ? (
            <View style={styles.bars}>
              <Bar
                label="Calories"
                share={eatenToday / plan.kcal}
                text={`${kcal(eatenToday)} / ${kcal(plan.kcal)}`}
              />
              {n.macros ? (
                <Bar
                  label="Protein"
                  share={eatenProtein / plan.protein}
                  text={`${Math.round(eatenProtein)} / ${plan.protein} g`}
                />
              ) : null}
            </View>
          ) : null}
        </PressableScale>

        <View style={styles.card}>
          <PressableScale
            onPress={() => router.push("/athlete/recovery")}
            accessibilityRole="button"
            accessibilityLabel="Open Recovery"
            style={styles.head}
          >
            <PillarDot pillar="recovery" />
            <Text variant="label" style={styles.flex}>
              Recovery
            </Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {me.protocol
                ? `In bed by ${clock(me.protocol.bed)} · ${me.protocol.sleepH} h`
                : meTier === "free"
                  ? "Part of Arcwell Plus"
                  : "Set a bedtime in Recovery"}
            </Text>
          </PressableScale>
          {rings.length ? (
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
          ) : null}
        </View>

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
      {today && !doneToday ? (
        <AthleteDock
          label="Start workout"
          icon={Play}
          pillar="training"
          onPress={openToday}
        />
      ) : (
        <AthleteDock
          label="Log food"
          icon={Plus}
          pillar="nutrition"
          onPress={() =>
            router.push({
              pathname: "/athlete/food/add",
              params: { meal: slotNow() },
            })
          }
        />
      )}
    </View>
  );
}

/** A thin progress bar with its label and numbers (Today's nutrition card). */
function Bar({
  label,
  share,
  text,
}: {
  label: string;
  share: number;
  text: string;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.barHead}>
        <Text variant="caption" tone="muted" style={styles.flex}>
          {label}
        </Text>
        <Text variant="caption" tone="muted" numeric>
          {text}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(Math.max(0, Math.min(1, share)) * 100)}%` },
          ]}
        />
      </View>
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
  bannerWarn: { borderColor: colors.warning },
  banner: {
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  done: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.training,
    alignItems: "center",
    justifyContent: "center",
  },
  bars: { flexDirection: "row", gap: space[3] },
  bar: { flex: 1, gap: space[1] },
  barHead: { flexDirection: "row", gap: space[1] },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.nutrition,
  },
});
