// Recovery for a coached athlete: the coach's protocol (sleep target, bed and wake, rest days, note)
// and a quick log of last night's sleep, which the coach sees on the client profile.
import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, NumberStepper, Text } from "@/components/primitives";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Bars, Eyebrow, KeyValues, PageHeader } from "@/features/coach/parts";
import { clock, WEEKDAYS } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";

export default function Recovery() {
  const me = useMe();
  const { coachName, logSleep, meTier } = useCoachData();
  const coached = meTier === "coached";
  const [hours, setHours] = useState(7);
  const [saved, setSaved] = useState(false);
  if (!me) return <NotJoined />;
  const r = me.protocol;
  const nights = me.recovery.nights;

  // Recovery is part of Arcwell Plus for self-guided athletes (D5, D57); Free sees it locked.
  if (meTier === "free")
    return (
      <View style={styles.root}>
        <PageHeader title="Recovery" />
        <AthletePage>
          <View style={styles.locked}>
            <Lock size={32} strokeWidth={1.6} color={colors.text} />
            <Text variant="title" style={styles.center}>
              Recovery is part of Arcwell Plus
            </Text>
            <Text tone="muted" style={styles.center}>
              Track sleep, get a sleep score and see how recovery affects your
              training.
            </Text>
            {r ? (
              <Text weight="medium" style={styles.center} numeric>
                Your target: {r.sleepH} h, in bed by {clock(r.bed)}
              </Text>
            ) : null}
            <Button
              label="Start 7-day free trial"
              fullWidth
              onPress={() => router.push("/athlete/ai")}
            />
          </View>
        </AthletePage>
      </View>
    );

  return (
    <View style={styles.root}>
      <PageHeader
        title="Recovery"
        sub={
          coached ? `Protocol from ${coachName}` : "Your sleep and rest plan"
        }
      />
      <AthletePage>
        {r ? (
          <KeyValues
            rows={[
              ["Sleep target", `${r.sleepH} h`],
              ["In bed by", clock(r.bed)],
              ["Wake at", clock(r.wake)],
              [
                "Rest days",
                r.restDays.length
                  ? r.restDays.map((d) => WEEKDAYS[d]).join(", ")
                  : "None",
              ],
            ]}
          />
        ) : (
          <Text tone="muted">
            {coachName} is still setting your recovery plan.
          </Text>
        )}
        {r?.note ? (
          <View style={styles.card}>
            <Text variant="label" tone="muted">
              {coached ? `From ${coachName}` : "Note"}
            </Text>
            <Text>{r.note}</Text>
          </View>
        ) : null}

        <Eyebrow>Last night</Eyebrow>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.flex}>Hours slept</Text>
            <NumberStepper
              value={hours}
              onChange={(v) => {
                setHours(v);
                setSaved(false);
              }}
              step={0.5}
              decimals={1}
              min={0}
              max={14}
              unit="h"
              accessibilityLabel="Hours slept"
            />
          </View>
          <Button
            label={saved ? "Saved" : "Save sleep"}
            variant={saved ? "secondary" : "primary"}
            disabled={saved}
            fullWidth
            onPress={() => {
              logSleep(me.id, hours);
              setSaved(true);
            }}
          />
        </View>

        {nights.length ? (
          <View style={styles.card}>
            <Text weight="semibold">Your nights</Text>
            <Bars
              values={nights.map((n) => n.hours)}
              target={r?.sleepH}
              labels={nights.map((n) => n.day)}
            />
          </View>
        ) : null}
      </AthletePage>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { textAlign: "center" },
  locked: { alignItems: "center", gap: space[3], paddingTop: space[8] },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
