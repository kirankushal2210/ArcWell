// Cardio fitness on Training > Plan and Today (D79): one card with the estimate, its trend, where it
// stands for age and sex, and this week's sessions. Nothing at all with the module off (D78).
import { router } from "expo-router";
import { Bike, ChevronRight, HeartPulse } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { LEVEL_LABEL, MACHINE_LABEL } from "@/features/science/cardio";
import { colors, radius, space } from "@/theme";

import { useCardio } from "./useCardio";

export const ordinal = (n: number) =>
  `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

export function CardioCard() {
  const cf = useCardio();
  if (!cf.on || !cf.me) return null;
  const open = () => router.push("/athlete/cardio");
  if (!cf.best)
    return (
      <View style={styles.card}>
        <View style={styles.head}>
          <HeartPulse size={16} color={colors.recovery} />
          <Text variant="label" weight="semibold" style={styles.flex}>
            Cardio fitness
          </Text>
        </View>
        <Button
          label="Check my cardio fitness"
          size="sm"
          onPress={() => router.push("/athlete/cardio/test")}
        />
      </View>
    );
  const first = cf.trend[0];
  const diff =
    first && first.id !== cf.best.id
      ? Math.round((cf.best.vo2 - first.vo2) * 10) / 10
      : 0;
  const max = Math.max(...cf.trend.map((t) => t.vo2));
  const min = Math.min(...cf.trend.map((t) => t.vo2));
  return (
    <PressableScale
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Cardio fitness, ${cf.best.vo2} ml per kg per minute. Open`}
      style={styles.card}
    >
      <View style={styles.head}>
        <HeartPulse size={16} color={colors.recovery} />
        <Text variant="label" weight="semibold" style={styles.flex}>
          Cardio fitness
        </Text>
        <Text variant="caption" tone="muted">
          {cf.retestIn
            ? `Retest in ${Math.ceil(cf.retestIn / 7)} wk`
            : "Time to retest"}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.big} numeric>
            {String(cf.best.vo2)}
            <Text variant="caption" tone="muted">
              {" ml/kg/min"}
            </Text>
          </Text>
          <Text variant="caption" tone="muted">
            {[
              diff
                ? `${diff > 0 ? "+" : ""}${diff} since ${first.date.slice(5)}`
                : LEVEL_LABEL[cf.level],
              cf.pct !== null
                ? `${ordinal(cf.pct)} percentile for your age`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
        {cf.trend.length > 1 ? (
          <View style={styles.spark}>
            {cf.trend.slice(-6).map((t) => (
              <View
                key={t.id}
                style={[
                  styles.bar,
                  { height: 8 + ((t.vo2 - min) / Math.max(1, max - min)) * 28 },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

/** Today: one slim row on a cardio day, nothing otherwise. */
export function TodayCardio() {
  const cf = useCardio();
  if (!cf.on || !cf.today || cf.doneToday) return null;
  const s = cf.today;
  return (
    <PressableScale
      onPress={() =>
        router.push({
          pathname: "/athlete/cardio/session",
          params: { kind: s.kind, machine: s.machine },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`${s.kind === "intervals" ? "Intervals" : "Easy cardio"} today. Start`}
      style={styles.slim}
    >
      <Bike size={16} color={colors.recovery} />
      <View style={styles.flex}>
        <Text variant="label" weight="semibold">
          {`${s.kind === "intervals" ? "Intervals" : "Easy"} on the ${MACHINE_LABEL[s.machine].toLowerCase()}`}
        </Text>
        <Text variant="caption" tone="muted">
          {s.interval
            ? `${s.interval.label} · ${s.minutes} min`
            : `${s.minutes} min, able to talk`}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[2],
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  row: { flexDirection: "row", alignItems: "flex-end", gap: space[3] },
  big: { fontSize: 26, lineHeight: 30, fontWeight: "800" },
  spark: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[1],
    height: 38,
  },
  bar: { width: 10, borderRadius: radius.sm, backgroundColor: colors.recovery },
  slim: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
});
