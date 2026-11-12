// The exercises in one planned workout (K-06, F4-01): tap a row to set sets, the target and rest,
// move it or remove it. Shared by the program builder and the athlete's routine editor.
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import {
  Button,
  NumberStepper,
  PressableScale,
  Text,
} from "@/components/primitives";
import { typeOf } from "@/features/athlete/library";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

import type { PlannedExercise } from "./plans";

export const restText = (s: number) =>
  s === 0 ? "no rest" : s < 60 ? `${s} s rest` : `${s / 60} min rest`;

/** What the target means for this exercise: reps, a time or a distance. */
const targetLabel = (name: string) => {
  const t = typeOf(name);
  return t === "duration" ||
    t === "duration_weight" ||
    t === "distance_duration"
    ? { label: "Time", hint: "Time, for example 40 s or 20 min" }
    : t === "weight_distance"
      ? { label: "Distance", hint: "Distance, for example 40 m" }
      : { label: "Reps", hint: "Reps, for example 8 to 10" };
};

export function ExerciseRows({
  exercises,
  onChange,
}: {
  exercises: PlannedExercise[];
  onChange: (next: PlannedExercise[]) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const patch = (id: string, p: Partial<PlannedExercise>) =>
    onChange(exercises.map((y) => (y.id === id ? { ...y, ...p } : y)));
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= exercises.length) return;
    const list = [...exercises];
    [list[i], list[j]] = [list[j], list[i]];
    onChange(list);
  };

  return (
    <>
      {exercises.map((e, ei) => {
        const editing = open === e.id;
        const target = targetLabel(e.name);
        return (
          <View key={e.id} style={[styles.ex, ei > 0 && styles.exLine]}>
            <PressableScale
              onPress={() => setOpen(editing ? null : e.id)}
              accessibilityRole="button"
              accessibilityLabel={`${e.name}, ${e.sets} sets of ${e.reps}, ${restText(e.restSec)}`}
              style={styles.exRow}
            >
              <View style={styles.flex}>
                <Text weight="medium">{e.name}</Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {e.sets} × {e.reps} · {restText(e.restSec)}
                </Text>
              </View>
              {editing ? (
                <ChevronUp size={18} color={colors.textMuted} />
              ) : (
                <ChevronDown size={18} color={colors.textMuted} />
              )}
            </PressableScale>
            {editing ? (
              <View style={styles.edit}>
                <View style={styles.row}>
                  <Text style={styles.flex}>Sets</Text>
                  <NumberStepper
                    value={e.sets}
                    min={1}
                    max={10}
                    onChange={(v) => patch(e.id, { sets: v })}
                    accessibilityLabel="Sets"
                  />
                </View>
                <View style={styles.row}>
                  <Text style={styles.flex}>{target.label}</Text>
                  <TextInput
                    value={e.reps}
                    onChangeText={(v) => patch(e.id, { reps: v })}
                    style={styles.reps}
                    accessibilityLabel={target.hint}
                  />
                </View>
                <View style={styles.row}>
                  <Text style={styles.flex}>Rest</Text>
                  <NumberStepper
                    value={e.restSec}
                    step={15}
                    min={0}
                    max={300}
                    unit="s"
                    onChange={(v) => patch(e.id, { restSec: v })}
                    accessibilityLabel="Rest"
                  />
                </View>
                <View style={styles.actions}>
                  <Button
                    label="Up"
                    variant="ghost"
                    icon={ArrowUp}
                    disabled={ei === 0}
                    onPress={() => move(ei, -1)}
                  />
                  <Button
                    label="Down"
                    variant="ghost"
                    icon={ArrowDown}
                    disabled={ei === exercises.length - 1}
                    onPress={() => move(ei, 1)}
                  />
                  <Button
                    label="Remove"
                    variant="ghost"
                    icon={Trash2}
                    onPress={() =>
                      onChange(exercises.filter((y) => y.id !== e.id))
                    }
                  />
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  ex: { paddingVertical: space[1] },
  exLine: { borderTopWidth: 1, borderTopColor: colors.border },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 52,
  },
  edit: { gap: space[2], paddingBottom: space[2] },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space[1] },
  reps: {
    minWidth: 120,
    minHeight: 48,
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("medium"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
