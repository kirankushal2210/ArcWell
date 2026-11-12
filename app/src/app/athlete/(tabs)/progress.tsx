// Progress for a coached athlete: bodyweight against the goal the coach set, a quick weigh-in, and
// check-ins with the coach's replies (check-in form arrives in Phase 4).
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, NumberStepper, Text } from "@/components/primitives";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  PageHeader,
  StatTile,
  WeightChart,
} from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function Progress() {
  const me = useMe();
  const { coachName, logWeight } = useCoachData();
  const last = me?.weights[me.weights.length - 1] ?? 70;
  const [kg, setKg] = useState(last);
  const [saved, setSaved] = useState(false);
  if (!me) return <NotJoined />;
  const start = me.weights[0];

  return (
    <View style={styles.root}>
      <PageHeader title="Progress" />
      <AthletePage>
        <View style={styles.tiles}>
          <StatTile
            label="Now"
            value={`${last.toFixed(1)} kg`}
            sub={`started ${start.toFixed(1)}`}
          />
          <StatTile
            label="Goal"
            value={`${me.targetKg.toFixed(1)} kg`}
            sub={`${Math.abs(last - me.targetKg).toFixed(1)} kg to go`}
          />
        </View>
        {me.weights.length > 1 ? (
          <View style={styles.card}>
            <Text weight="semibold">Bodyweight</Text>
            <WeightChart values={me.weights} target={me.targetKg} />
          </View>
        ) : null}

        <Eyebrow>Weigh in</Eyebrow>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.flex}>This morning</Text>
            <NumberStepper
              value={kg}
              onChange={(v) => {
                setKg(v);
                setSaved(false);
              }}
              step={0.1}
              decimals={1}
              min={30}
              max={250}
              unit="kg"
              accessibilityLabel="Bodyweight"
            />
          </View>
          <Button
            label={saved ? "Saved" : "Save weight"}
            variant={saved ? "secondary" : "primary"}
            disabled={saved}
            fullWidth
            onPress={() => {
              logWeight(me.id, kg);
              setSaved(true);
            }}
          />
        </View>

        <Eyebrow>Check-ins</Eyebrow>
        <Text tone="muted">
          Your first weekly check-in is due {me.checkInDay}. {coachName}&apos;s
          replies show here.
        </Text>
      </AthletePage>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  tiles: { flexDirection: "row", gap: space[2] },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
