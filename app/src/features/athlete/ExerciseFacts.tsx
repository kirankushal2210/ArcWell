// What an exercise is and how the athlete has done on it (F4-08): muscles, equipment, what a set
// logs, then their best and last sets. Shown on the exercise page and from the (i) in a picker.
import { Play } from "lucide-react-native";
import { Image, StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { Bars, Eyebrow } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

import {
  EQUIPMENT_LABEL,
  type Exercise,
  MUSCLE_LABEL,
  typeLabel,
} from "./library";
import { type Session, setLabel } from "./training";

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text variant="label">{label}</Text>
    </View>
  );
}

export function ExerciseFacts({
  e,
  history,
}: {
  e: Exercise;
  history: Session[];
}) {
  const logs = history
    .map((s) => ({
      at: s.at,
      sets:
        s.exercises
          .find((x) => x.name === e.name)
          ?.sets.filter((x) => !x.warmup) ?? [],
    }))
    .filter((x) => x.sets.length);
  const weighted = logs.flatMap((l) => l.sets).filter((s) => s.kg !== null);
  const best = weighted.length
    ? weighted.reduce((a, b) => ((b.kg ?? 0) > (a.kg ?? 0) ? b : a))
    : undefined;
  const last = logs[0];
  const tops = [...logs]
    .reverse()
    .slice(-8)
    .map((l) => Math.max(0, ...l.sets.map((s) => s.kg ?? 0)));

  return (
    <View style={styles.root}>
      {e.image ? (
        <Image
          source={{ uri: e.image }}
          style={styles.demo}
          accessibilityLabel={`Photo of ${e.name}`}
        />
      ) : (
        <View
          style={styles.demo}
          accessibilityLabel="Demo clip, coming with the exercise library"
        >
          <Play size={32} color={colors.textMuted} />
          <Text variant="label" tone="muted">
            {e.custom
              ? "Add a photo when you edit this exercise"
              : "Demo clip comes with the exercise library"}
          </Text>
        </View>
      )}
      <View style={styles.chips}>
        <Chip label={MUSCLE_LABEL[e.muscle]} />
        {(e.other ?? []).map((m) => (
          <Chip key={m} label={MUSCLE_LABEL[m]} />
        ))}
        <Chip
          label={
            e.equipment === "none"
              ? "No equipment"
              : EQUIPMENT_LABEL[e.equipment]
          }
        />
        <Chip label={typeLabel(e.type)} />
        {e.custom ? <Chip label="Your exercise" /> : null}
      </View>

      <Eyebrow>Your history</Eyebrow>
      {best || last ? (
        <View style={styles.card}>
          {best ? (
            <Text weight="semibold" numeric>
              Best: {setLabel(best, e.name)}
            </Text>
          ) : null}
          {last ? (
            <Text variant="label" weight="regular" tone="muted" numeric>
              Last: {last.sets.map((s) => setLabel(s, e.name)).join(", ")} ·{" "}
              {new Date(last.at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </Text>
          ) : null}
          {tops.length > 1 && tops.some(Boolean) ? (
            <Bars
              values={tops}
              labels={tops.map((_, i) => String(i + 1))}
              height={72}
            />
          ) : null}
        </View>
      ) : (
        <Text tone="muted">
          You haven&apos;t done this yet. Your best and last sets will show
          here.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space[3] },
  demo: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  chip: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
