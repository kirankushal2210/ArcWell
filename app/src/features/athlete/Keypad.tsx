// Gym keypad (F4-05): opens when a kg, reps or seconds value is tapped. Big keys and ± steps sized for
// gym hands; the kg steps match common plate jumps (1.25 / 2.5 / 5 kg). kg only in v1 (D45).
import * as Haptics from "expo-haptics";
import { Delete } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import { Sheet } from "./Sheet";

export type KeypadField = "kg" | "reps" | "seconds" | "minutes" | "km" | "m";

/** Fields that take a decimal point: plates come in 1.25 kg, runs in 5.2 km, rides in 32.5 min. */
const DECIMAL: KeypadField[] = ["kg", "km", "minutes"];

const STEPS: Record<KeypadField, number[]> = {
  kg: [-5, -2.5, -1.25, 1.25, 2.5, 5],
  reps: [-1, 1],
  seconds: [-15, 15],
  minutes: [-5, -1, 1, 5],
  km: [-1, -0.5, -0.1, 0.1, 0.5, 1],
  m: [-10, -5, 5, 10],
};
const UNIT: Record<KeypadField, string> = {
  kg: "kg",
  reps: "reps",
  seconds: "s",
  minutes: "min",
  km: "km",
  m: "m",
};

export function Keypad({
  visible,
  title,
  field,
  value,
  onDone,
  onNext,
  onClose,
}: {
  visible: boolean;
  title: string;
  field: KeypadField;
  value: number | null;
  /** Called with the new value (null when cleared). */
  onDone: (v: number | null) => void;
  /** Saves and moves to the next field, e.g. kg → reps → next set's kg. */
  onNext?: (v: number | null) => void;
  onClose: () => void;
}) {
  // Re-mounted per field by the parent (key), so the draft always starts from the current value.
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const tap = () => Haptics.selectionAsync().catch(() => {});
  const parsed = draft === "" ? null : Number(draft);
  const press = (k: string) => {
    tap();
    setDraft((d) => {
      if (k === "⌫") return d.slice(0, -1);
      if (k === ".")
        return DECIMAL.includes(field) && !d.includes(".")
          ? (d || "0") + "."
          : d;
      const next = d === "0" ? k : d + k;
      return next.length > 6 ? d : next;
    });
  };
  const bump = (delta: number) => {
    tap();
    const base = parsed ?? 0;
    const next = Math.max(0, Math.round((base + delta) * 100) / 100);
    setDraft(String(next));
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View
        style={styles.display}
        accessibilityLabel={`${draft || "empty"} ${UNIT[field]}`}
      >
        <Text variant="display" numeric>
          {draft || "–"}
        </Text>
        <Text variant="heading" tone="muted">
          {UNIT[field]}
        </Text>
      </View>
      <View style={styles.steps}>
        {STEPS[field].map((d) => (
          <PressableScale
            key={d}
            onPress={() => bump(d)}
            accessibilityRole="button"
            accessibilityLabel={`${d > 0 ? "Add" : "Take off"} ${Math.abs(d)} ${UNIT[field]}`}
            style={styles.step}
          >
            <Text weight="semibold" numeric>
              {d > 0 ? `+${d}` : `−${Math.abs(d)}`}
            </Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.grid}>
        {[
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          DECIMAL.includes(field) ? "." : "",
          "0",
          "⌫",
        ].map((k, i) =>
          k ? (
            <PressableScale
              key={i}
              onPress={() => press(k)}
              accessibilityRole="button"
              accessibilityLabel={
                k === "⌫" ? "Delete" : k === "." ? "Decimal point" : k
              }
              style={styles.key}
            >
              {k === "⌫" ? (
                <Delete size={24} color={colors.text} />
              ) : (
                <Text variant="title">{k}</Text>
              )}
            </PressableScale>
          ) : (
            <View key={i} style={styles.keyEmpty} />
          ),
        )}
      </View>
      <View style={styles.actions}>
        {onNext ? (
          <View style={styles.flex}>
            <Button
              label="Next"
              variant="secondary"
              fullWidth
              onPress={() => onNext(parsed)}
            />
          </View>
        ) : null}
        <View style={styles.flex}>
          <Button label="Done" fullWidth onPress={() => onDone(parsed)} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  display: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: space[2],
    paddingVertical: space[2],
  },
  steps: { flexDirection: "row", gap: space[2] },
  step: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  key: {
    width: "31.5%",
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  keyEmpty: { width: "31.5%", height: 56 },
  actions: { flexDirection: "row", gap: space[2], paddingTop: space[1] },
});
