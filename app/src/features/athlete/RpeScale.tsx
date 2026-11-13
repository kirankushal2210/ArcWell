// RPE picker for a set (D87): a 1 to 10 scale, 10 being failure. The lift's target range is
// outlined in red, and the scale's meaning sits under it (reps in reserve, helms2016rir).
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { RPE_OPTIONS } from "@/features/science/rules";
import { colors, radius, space } from "@/theme";

export function RpeScale({
  value,
  target,
  onPick,
}: {
  value: number | null | undefined;
  target: [number, number];
  onPick: (v: number | null) => void;
}) {
  const label = (v: number) =>
    RPE_OPTIONS.find((o) => o.value === v)?.label ?? "";
  return (
    <View style={styles.wrap}>
      {[
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ].map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((v) => {
            const on = value === v;
            const aim = v >= target[0] && v <= target[1];
            return (
              <PressableScale
                key={v}
                onPress={() => onPick(on ? null : v)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`RPE ${v}, ${label(v)}${aim ? ", in your target" : ""}`}
                style={[styles.cell, aim && styles.aim, on && styles.on]}
              >
                <Text
                  weight="semibold"
                  tone={on ? "onBrand" : "default"}
                  numeric
                >
                  {String(v)}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      ))}
      <Text variant="caption" tone="muted" style={styles.center}>
        {`10 = failure · 9 = 1 rep left · 8 = 2 left · 7 = 3 left. Target ${target[0]}–${target[1]}, outlined.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2], paddingBottom: space[2] },
  row: { flexDirection: "row", gap: space[2] },
  cell: {
    flex: 1,
    height: space[12],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  aim: { borderColor: colors.accent },
  on: { backgroundColor: colors.brand, borderColor: colors.brand },
  center: { textAlign: "center" },
});
