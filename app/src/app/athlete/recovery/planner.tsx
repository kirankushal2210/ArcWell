// Sleep planner (D60): tonight's sleep need (target, extra after today's strain, part of the debt)
// and when to be in bed for Peak, Perform or Get by, with an optional wind-down reminder.
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { BellRing } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { plusOnly } from "@/features/athlete/PlusOnly";
import { Button, Text } from "@/components/primitives";
import {
  clockOf,
  hm,
  PLANNER_MODES,
  type PlannerMode,
  plannerFor,
  todayDate,
} from "@/features/athlete/recovery";
import { StatRow, useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Page, PageHeader, Pills } from "@/features/coach/parts";
import { alert } from "@/lib/alert";
import { colors, radius, space } from "@/theme";

/** Schedule tonight's wind-down reminder 30 minutes before bed (local notification). */
async function remind(bed: number) {
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  const at = new Date();
  const mins = bed - 30;
  at.setHours(0, 0, 0, 0);
  at.setMinutes(mins < 0 ? mins + 1440 : mins);
  if (at.getTime() < Date.now()) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to wind down",
      body: `In bed by ${clockOf(bed)} for tonight's sleep.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: at,
    },
  });
  return true;
}

export default plusOnly(Planner);

function Planner() {
  const p = useLocalSearchParams<{ date?: string }>();
  const r = useRecovery();
  const [today] = useState(todayDate);
  const [mode, setMode] = useState<PlannerMode>("peak");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;
  const day = r.day(p.date ?? today);
  const plan = plannerFor(day, r.baseline, mode);
  const extra = day.strain.score > 14 ? 30 : day.strain.score > 10 ? 15 : 0;
  const debt =
    Math.min(60, Math.max(0, day.sleep.neededMin - day.sleep.minutes)) / 2;

  return (
    <View style={styles.root}>
      <PageHeader title="Sleep planner" onBack={back} />
      <Page>
        <Pills
          value={mode}
          onChange={setMode}
          options={PLANNER_MODES.map((m) => ({
            value: m.key,
            label: `${m.label} · ${Math.round(m.share * 100)}%`,
          }))}
        />
        <View style={styles.hero}>
          <Text variant="caption" tone="muted">
            IN BED BY
          </Text>
          <Text variant="display" numeric>
            {clockOf(plan.bed)}
          </Text>
          <Text tone="muted" numeric>
            {hm(plan.sleepMin)} of sleep · wake at {clockOf(plan.wake)}
          </Text>
        </View>
        <View style={styles.card}>
          <Text weight="semibold">Tonight&apos;s sleep need</Text>
          <StatRow
            first
            label="Your target"
            value={hm(r.baseline.sleepTargetH * 60)}
            note={r.coached ? `Set by ${r.coachName}` : "From your plan"}
          />
          <StatRow
            label="After today's strain"
            value={`+${hm(extra)}`}
            note={`Strain ${day.strain.score.toFixed(1)}`}
          />
          <StatRow
            label="Paying back sleep debt"
            value={`+${hm(debt)}`}
            note="Half of what you're behind, up to an hour"
          />
          <StatRow label="Total need" value={hm(plan.need)} />
        </View>
        <Text variant="caption" tone="muted">
          Peak covers all of it; Perform and Get by are for nights you
          can&apos;t. Includes about 15 minutes to fall asleep.
        </Text>
        <Button
          label="Remind me to wind down"
          icon={BellRing}
          variant="secondary"
          fullWidth
          onPress={() =>
            remind(plan.bed)
              .then((ok) =>
                alert(
                  ok ? "Reminder set" : "Couldn't set a reminder",
                  ok
                    ? `We'll remind you at ${clockOf(plan.bed - 30)}.`
                    : "Turn on notifications for Arcwell, or pick a bedtime later tonight.",
                ),
              )
              .catch(() => {})
          }
        />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: "center", gap: space[1], paddingVertical: space[4] },
  card: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
