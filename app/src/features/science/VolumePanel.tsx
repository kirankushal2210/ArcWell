// Weekly volume per muscle (D69): hard sets a week for each muscle group against the researched
// range, with plain warnings for junk volume, a muscle left out, or too much in one session. Shown
// live in the coach's program builder and template editor, and to athletes in Training.
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import {
  fmt,
  GROUPS,
  LEVEL_TEXT,
  volumeIssues,
  volumeLevel,
  WEEKLY_SETS,
  weeklyVolume,
} from "./rules";
import { WhyThis } from "./WhyThis";

type DayLike = { name: string; exercises: { name: string; sets: number }[] };

const SCALE = 24;

export function VolumePanel({
  days,
  title = "Weekly sets per muscle",
  compact = false,
  logged = false,
  timesPerWeek,
}: {
  /** How many times each day runs a week (a repeated workout counts twice). */
  timesPerWeek?: number[];
  /** Counting what was logged so far: only flag high volume, not muscles still to train. */
  logged?: boolean;
  days: DayLike[];
  title?: string;
  /** Hide muscles with no sets and the per-session checks (athlete view). */
  compact?: boolean;
}) {
  const weekly = weeklyVolume(days, timesPerWeek);
  const issues = volumeIssues(days, timesPerWeek).filter((i) =>
    logged ? i.kind === "high" : !compact || i.kind !== "missing",
  );
  const rows = GROUPS.filter((g) => !compact || weekly[g.key] > 0);
  if (!days.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text weight="semibold" style={styles.flex}>
          {title}
        </Text>
        <WhyThis
          title="Weekly sets per muscle"
          points={[
            "A hard set is one taken close to failure, with about 0 to 3 good reps left.",
            "More hard sets a week build more muscle, with smaller gains for each extra set. Arcwell aims for 10 to 20 per muscle as a practical range; fewer still works, just less.",
            "Above about 20, each extra set adds less and costs more recovery, so we flag it for a second look.",
            "Compound lifts count in full for their main muscle and as half a set for the muscles that help, which matches the research best.",
            "With the same weekly sets, how many days you spread them over makes little difference to growth. Arcwell's own guide: past about 10 sets for one muscle in a session, move the rest to another day.",
          ]}
          sources={[
            "schoenfeld2017volume",
            "pelland2026",
            "schoenfeld2019frequency",
            "refalo2023",
            "robinson2024",
          ]}
        />
      </View>
      {rows.map((g) => {
        const n = weekly[g.key];
        const level = volumeLevel(n);
        const tone =
          level === "in_range"
            ? colors.success
            : level === "high"
              ? colors.danger
              : level === "none"
                ? colors.surfaceRaised
                : colors.textMuted;
        return (
          <View key={g.key} style={styles.row}>
            <Text variant="label" style={styles.name}>
              {g.label}
            </Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.band,
                  {
                    left: `${(WEEKLY_SETS.range[0] / SCALE) * 100}%`,
                    width: `${((WEEKLY_SETS.range[1] - WEEKLY_SETS.range[0]) / SCALE) * 100}%`,
                  },
                ]}
              />
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(1, n / SCALE) * 100}%`,
                    backgroundColor: tone,
                  },
                ]}
              />
            </View>
            <Text variant="label" weight="semibold" numeric style={styles.num}>
              {fmt(n)}
            </Text>
            <Text
              variant="caption"
              tone={level === "high" ? "danger" : "muted"}
              style={styles.level}
            >
              {LEVEL_TEXT[level]}
            </Text>
          </View>
        );
      })}
      <Text variant="caption" tone="muted">
        Shaded band: 10 to 20 sets a week.
      </Text>
      {issues.length ? (
        <View style={styles.issues}>
          {issues.map((i) => (
            <Text
              key={`${i.kind}-${i.group}-${i.day ?? ""}`}
              variant="label"
              weight="regular"
              tone={
                i.kind === "high" || i.kind === "session" ? "danger" : "muted"
              }
            >
              {i.text}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  name: { width: 84 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  band: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: colors.border,
  },
  fill: { height: 8, borderRadius: radius.full },
  num: { width: 32, textAlign: "right" },
  level: { width: 64 },
  issues: { gap: space[1], paddingTop: space[1] },
});
