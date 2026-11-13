// What an exercise is and how the athlete has done on it (F4-08): muscles, equipment, what a set
// logs, then their best and last sets. Shown on the exercise page and from the (i) in a picker.
import { Play } from "lucide-react-native";
import { Image, StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { Bars, Eyebrow, WeightChart } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

import {
  EQUIPMENT_LABEL,
  type Exercise,
  MUSCLE_LABEL,
  typeLabel,
} from "./library";
import { type Session, setLabel } from "./training";
import { bestE1rm } from "@/features/science/strength";
import { WhyThis } from "@/features/science/WhyThis";

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
  showHistory = true,
}: {
  e: Exercise;
  history: Session[];
  /** Coaches browsing the library have no history of their own. */
  showHistory?: boolean;
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
  // Estimated 1RM per session, oldest first (Epley; sets of 10 reps or fewer).
  const strength = [...logs]
    .reverse()
    .map((l) => bestE1rm(l.sets))
    .filter((v): v is number => v !== null)
    .slice(-12);
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

      {!showHistory ? null : <Eyebrow>Your history</Eyebrow>}
      {!showHistory ? null : best || last ? (
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
          {strength.length ? (
            <View style={styles.e1rm}>
              <View style={styles.head}>
                <Text weight="semibold" numeric style={styles.grow}>
                  Estimated 1-rep max:{" "}
                  {strength[strength.length - 1].toFixed(1)} kg
                </Text>
                <WhyThis
                  title="Estimated 1-rep max"
                  points={[
                    "Worked out from your best working set with the Epley formula: weight × (1 + reps ÷ 30).",
                    "It's an estimate, most accurate from sets of 10 reps or fewer, so higher-rep sets aren't used.",
                    "Watch the trend over weeks rather than any single day.",
                  ]}
                  sources={[]}
                />
              </View>
              {strength.length > 1 ? (
                <WeightChart values={strength} height={100} />
              ) : null}
            </View>
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
  e1rm: { gap: space[2] },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  grow: { flex: 1 },
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
