// Charts (PH-04, E-04): one metric at a time over 1 month, 3 months or everything, with the change
// since the start. A line needs two points; until then the frame stays empty rather than faking a
// trend, and the page points to where to start tracking.
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import {
  measureSeries,
  weighInsOf,
  within,
} from "@/features/athlete/athleteData";
import {
  backTo,
  InfoCard,
  MenuPage,
  NavRow,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, Pills, WeightChart } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Metric = "weight" | "Waist" | "Chest" | "Hips" | "kcal";
type Range = "30" | "90" | "0";

export default function Charts() {
  const me = useMe();
  const { foodLogs } = useCoachData();
  const [metric, setMetric] = useState<Metric>("weight");
  const [range, setRange] = useState<Range>("90");
  if (!me) return <NotJoined />;
  const days = Number(range);

  const weights = within(weighInsOf(me), days).map((w) => w.kg);
  const kcalByDay = Object.entries(
    within(foodLogs(me.id), days).reduce<Record<string, number>>((m, l) => {
      m[l.date] = (m[l.date] ?? 0) + l.macros.kcal;
      return m;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => Math.round(v));
  const values =
    metric === "weight"
      ? weights
      : metric === "kcal"
        ? kcalByDay
        : measureSeries(me, metric).values;
  const unit = metric === "weight" ? "kg" : metric === "kcal" ? "kcal" : "cm";
  const change = values.length > 1 ? values[values.length - 1] - values[0] : 0;
  const nothing =
    weighInsOf(me).length < 2 &&
    !me.measurements.length &&
    !(me.progressPhotos ?? []).length;

  return (
    <MenuPage title="Charts" back={backTo("/athlete/menu")}>
      <Pills
        value={metric}
        onChange={setMetric}
        options={[
          { value: "weight", label: "Bodyweight" },
          { value: "Waist", label: "Waist" },
          { value: "Chest", label: "Chest" },
          { value: "Hips", label: "Hips" },
          { value: "kcal", label: "Calories" },
        ]}
      />
      <Pills
        value={range}
        onChange={setRange}
        options={[
          { value: "30", label: "1 month" },
          { value: "90", label: "3 months" },
          { value: "0", label: "All" },
        ]}
      />
      <View style={styles.card}>
        {values.length > 1 ? (
          <>
            <Text numeric>
              <Text variant="title" numeric>
                {`${change > 0 ? "+" : change < 0 ? "−" : ""}${Math.abs(change).toFixed(metric === "kcal" ? 0 : 1)} ${unit}`}
              </Text>
              <Text tone="muted">
                {metric === "kcal"
                  ? " first day to last"
                  : " since you started"}
              </Text>
            </Text>
            <WeightChart
              values={values}
              target={metric === "weight" ? me.targetKg : undefined}
              height={160}
            />
            <Text variant="caption" tone="muted" numeric>
              {values.length} entries
              {metric === "weight" ? " · dashed line is your goal" : ""}
            </Text>
          </>
        ) : (
          <View style={styles.empty}>
            <Text weight="medium">Your chart appears after 2 entries</Text>
          </View>
        )}
      </View>

      {nothing || values.length < 2 ? (
        <>
          <Eyebrow>Start tracking</Eyebrow>
          <Group>
            <NavRow
              first
              label="Bodyweight"
              value={`${weighInsOf(me).length} entries`}
              onPress={() => router.push("/athlete/physique/bodyweight")}
            />
            <NavRow
              label="Measurements"
              value={me.measurements.length ? "Started" : "No entries yet"}
              onPress={() => router.push("/athlete/physique/measurements")}
            />
            <NavRow
              label="Progress photos"
              value={
                (me.progressPhotos ?? []).length ? "Started" : "No photos yet"
              }
              onPress={() => router.push("/athlete/physique/photos")}
            />
          </Group>
        </>
      ) : (
        <InfoCard>
          Trends beat single days. Weigh in a few times a week and measure every
          two to four weeks.
        </InfoCard>
      )}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  empty: { height: 160, alignItems: "center", justifyContent: "center" },
});
