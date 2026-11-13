// Small inputs for Recovery detail pages: a 1–5 scale with end words, and a time stepper.
import { Minus, Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import { clockOf } from "./recovery";

export function Scale({
  label,
  value,
  onChange,
  ends,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  ends: [string, string];
}) {
  return (
    <View style={styles.wrap}>
      <Text weight="semibold">{label}</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((v) => {
          const on = v === value;
          return (
            <PressableScale
              key={v}
              onPress={() => onChange(v)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${label} ${v} of 5`}
              style={[styles.cell, on && styles.cellOn]}
            >
              <Text weight="semibold" tone={on ? "onBrand" : "default"} numeric>
                {v}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <View style={styles.ends}>
        <Text variant="caption" tone="muted">
          {ends[0]}
        </Text>
        <Text variant="caption" tone="muted">
          {ends[1]}
        </Text>
      </View>
    </View>
  );
}

export function TimeStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.timeRow}>
      <Text style={styles.flex}>{label}</Text>
      <IconButton
        icon={Minus}
        variant="outline"
        accessibilityLabel={`${label} 15 minutes earlier`}
        onPress={() => onChange(value - 15)}
      />
      <Text weight="semibold" numeric style={styles.time}>
        {clockOf(value)}
      </Text>
      <IconButton
        icon={Plus}
        variant="outline"
        accessibilityLabel={`${label} 15 minutes later`}
        onPress={() => onChange(value + 15)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: space[2] },
  row: { flexDirection: "row", gap: space[2] },
  cell: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  cellOn: { backgroundColor: colors.brand },
  ends: { flexDirection: "row", justifyContent: "space-between" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  time: { minWidth: 88, textAlign: "center" },
});
