// Morning check-in (D60): last night's sleep, then soreness, energy, stress and mood on 1–5 scales,
// plus last night's habits. A Hooper-style wellness check: the recovery score when there's no
// device, and context on top of a device's numbers when there is one. About 20 seconds.
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { plusOnly } from "@/features/athlete/PlusOnly";
import { Button, Chip, NumberStepper, Text } from "@/components/primitives";
import { simulatedDay, todayDate } from "@/features/athlete/recovery";
import { Scale, TimeStepper } from "@/features/athlete/RecoveryForm";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { findFood, shiftDate } from "@/features/athlete/foods";
import { journalFromFood } from "@/features/athlete/recoveryInsights";
import { colors, radius, rhythm, space } from "@/theme";

const HABITS = [
  { key: "caffeine", label: "Caffeine after 4 pm" },
  { key: "alcohol", label: "Alcohol" },
  { key: "screens", label: "Screens in bed" },
  { key: "late_meal", label: "Late heavy meal" },
];

export default plusOnly(CheckIn);

function CheckIn() {
  const r = useRecovery();
  const insets = useSafeAreaInsets();
  const [date] = useState(todayDate);
  const saved = r.store.logs.find((l) => l.date === date);
  const dev = r.store.device
    ? simulatedDay(date, r.baseline.sleepTargetH)
    : undefined;
  const [sleepH, setSleepH] = useState(
    saved?.sleepH ??
      (dev ? Math.round((dev.sleepMin / 60) * 2) / 2 : r.baseline.sleepTargetH),
  );
  const [bed, setBed] = useState(saved?.bed ?? dev?.bed ?? r.baseline.bed);
  const [wake, setWake] = useState(saved?.wake ?? dev?.wake ?? r.baseline.wake);
  const [quality, setQuality] = useState(saved?.quality ?? 3);
  const [soreness, setSoreness] = useState(saved?.soreness ?? 2);
  const [energy, setEnergy] = useState(saved?.energy ?? 3);
  const [stress, setStress] = useState(saved?.stress ?? 2);
  const [mood, setMood] = useState(saved?.mood ?? 3);
  // Last night's habits start from what was logged yesterday (D98); the athlete can change them.
  const { foodLogs, myFoods } = useCoachData();
  const [habits, setHabits] = useState<string[]>(() => {
    if (saved?.habits) return saved.habits;
    const yesterday = shiftDate(date, -1);
    return journalFromFood(
      foodLogs(r.id)
        .filter((l) => l.date === yesterday)
        .map((l) => {
          const f = findFood(l.foodId, myFoods);
          return {
            at: l.at,
            meal: l.meal,
            caffeineMg: f?.caffeine ? (f.caffeine * l.grams) / 100 : 0,
            alcohol: f?.id === "beer" || f?.id === "wine",
          };
        }),
      r.baseline.bed,
    );
  });
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;

  return (
    <View style={styles.root}>
      <PageHeader title="Morning check-in" onBack={back} />
      <Page>
        <Text tone="muted">
          {dev
            ? "Your device already has last night's sleep. Add how you feel."
            : "How you slept and how you feel decide today's recovery score."}
        </Text>
        {dev ? null : (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.flex} weight="semibold">
                Hours slept
              </Text>
              <NumberStepper
                value={sleepH}
                onChange={setSleepH}
                step={0.5}
                decimals={1}
                min={0}
                max={14}
                unit="h"
                accessibilityLabel="Hours slept"
              />
            </View>
            <TimeStepper label="Went to bed" value={bed} onChange={setBed} />
            <TimeStepper label="Woke up" value={wake} onChange={setWake} />
          </View>
        )}
        <View style={styles.card}>
          <Scale
            label="How well did you sleep?"
            value={quality}
            onChange={setQuality}
            ends={["Badly", "Very well"]}
          />
          <Scale
            label="Muscle soreness"
            value={soreness}
            onChange={setSoreness}
            ends={["None", "Very sore"]}
          />
          <Scale
            label="Energy"
            value={energy}
            onChange={setEnergy}
            ends={["Exhausted", "Full of energy"]}
          />
          <Scale
            label="Stress"
            value={stress}
            onChange={setStress}
            ends={["Calm", "Very stressed"]}
          />
          <Scale
            label="Mood"
            value={mood}
            onChange={setMood}
            ends={["Low", "Great"]}
          />
        </View>
        <Text weight="semibold">Last night (optional)</Text>
        <View style={styles.habits}>
          {HABITS.map((h) => (
            <Chip
              key={h.key}
              label={h.label}
              selected={habits.includes(h.key)}
              onPress={() =>
                setHabits((x) =>
                  x.includes(h.key)
                    ? x.filter((y) => y !== h.key)
                    : [...x, h.key],
                )
              }
            />
          ))}
        </View>
        <Text variant="caption" tone="muted">
          Habits show up later as insights, like how alcohol changes your
          recovery.{r.coached ? ` ${r.coachName} sees your check-ins.` : ""}
        </Text>
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={saved ? "Update check-in" : "Save check-in"}
          fullWidth
          onPress={() => {
            r.saveWellness(r.id, {
              date,
              sleepH: dev ? dev.sleepMin / 60 : sleepH,
              bed,
              wake,
              quality,
              soreness,
              energy,
              stress,
              mood,
              habits,
            });
            back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  card: {
    gap: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  habits: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
