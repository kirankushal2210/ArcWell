// Muscle Analytics (TR-06, TR-07): hard sets per muscle from what the athlete actually logged, this
// week, last week or the 4-week average, against the evidence range (D69). Pro and coached; free
// athletes see it locked (D13, D28).
import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { weekStart } from "@/features/athlete/training";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Pills } from "@/features/coach/parts";
import { VolumePanel } from "@/features/science/VolumePanel";
import { colors, space } from "@/theme";

type Span = "this" | "last" | "avg";

export default function MuscleAnalytics() {
  const me = useMe();
  const { meTier, sessions } = useCoachData();
  const [span, setSpan] = useState<Span>("this");
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/menu");

  if (meTier === "free")
    return (
      <MenuPage
        title="Muscle Analytics"
        back={back}
        footer={
          <Button
            label="See Arcwell Plus"
            fullWidth
            onPress={() => router.push("/athlete/ai")}
          />
        }
      >
        <View style={styles.hero}>
          <Lock size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            See the sets each muscle really got
          </Text>
          <Text tone="muted" style={styles.center}>
            Muscle Analytics counts your logged hard sets per muscle each week
            and shows where you sit against the research range. Part of Arcwell
            Plus.
          </Text>
        </View>
      </MenuPage>
    );

  const monday = weekStart(new Date()).getTime();
  const week = 7 * 864e5;
  const from =
    span === "this"
      ? monday
      : span === "last"
        ? monday - week
        : monday - 4 * week;
  const to = span === "last" ? monday : Date.now() + week;
  const done = sessions(me.id).filter((s) => {
    const t = new Date(s.at).getTime();
    return t >= from && t < to;
  });
  // Each logged session as a "day" of completed working sets.
  const days = done.map((s) => ({
    name: s.name,
    exercises: s.exercises
      .filter((e) => !e.skipped)
      .map((e) => ({
        name: e.name,
        sets: e.sets.filter((x) => !x.warmup).length / (span === "avg" ? 4 : 1),
      })),
  }));

  return (
    <MenuPage title="Muscle Analytics" back={back}>
      <Pills
        value={span}
        onChange={setSpan}
        options={[
          { value: "this", label: "This week" },
          { value: "last", label: "Last week" },
          { value: "avg", label: "4-week average" },
        ]}
      />
      {days.length ? (
        <VolumePanel
          logged
          days={days}
          title={
            span === "avg" ? "Average hard sets a week" : "Hard sets you logged"
          }
        />
      ) : (
        <InfoCard title="Nothing logged yet">
          {span === "this"
            ? "Log a workout this week and your sets per muscle show here."
            : "No workouts in this period."}
        </InfoCard>
      )}
      <Text variant="caption" tone="muted">
        Counted from completed working sets (not warm-ups), by each
        exercise&apos;s main muscle, with half sets for the muscles that help on
        compound lifts.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[3], paddingTop: space[6] },
});
