// Training's Overload section (D85): every lift from the last two weeks, whether its top set beat the
// time before, and the workout history underneath.
import { router } from "expo-router";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Equal,
  Pause,
  Sparkle,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow } from "@/features/coach/parts";
import type { Client } from "@/features/coach/sampleData";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

import { HistoryWeeks } from "./HistoryWeeks";
import {
  NEXT_STEP,
  overload,
  type OverloadRow,
  type OverloadStatus,
} from "./overload";

const LOOK: Record<
  OverloadStatus,
  { icon: typeof ArrowUp; color: string; label: string }
> = {
  up: { icon: ArrowUp, color: colors.success, label: "Up" },
  same: { icon: Equal, color: colors.textMuted, label: "Same" },
  down: { icon: ArrowDown, color: colors.warning, label: "Down" },
  stalled: { icon: Pause, color: colors.accent, label: "Stalled" },
  new: { icon: Sparkle, color: colors.textMuted, label: "New" },
};

const setText = (r: OverloadRow) =>
  r.top.kg ? `${r.top.kg} kg × ${r.top.reps}` : `${r.top.reps} reps`;

function Row({ r, first }: { r: OverloadRow; first: boolean }) {
  const look = LOOK[r.status];
  const Icon = look.icon;
  return (
    <PressableScale
      onPress={() =>
        router.push({
          pathname: "/athlete/exercises/[name]",
          params: { name: r.name },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`${r.name}, ${look.label}, top set ${setText(r)}${r.change ? `, ${r.change}` : ""}`}
      style={[styles.row, !first && styles.line]}
    >
      <View style={[styles.badge, { borderColor: look.color }]}>
        <Icon size={14} strokeWidth={2.6} color={look.color} />
      </View>
      <View style={styles.flex}>
        <Text weight="semibold">{r.name}</Text>
        <Text variant="label" weight="regular" tone="muted" numeric>
          {r.status === "stalled" || r.status === "same"
            ? `${setText(r)} · ${NEXT_STEP[r.status]}`
            : setText(r)}
        </Text>
      </View>
      {r.change ? (
        <Text
          variant="label"
          weight="semibold"
          numeric
          style={{ color: look.color }}
        >
          {r.change}
        </Text>
      ) : null}
      <ChevronRight size={18} color={colors.textMuted} />
    </PressableScale>
  );
}

export function OverloadPage({ me }: { me: Client }) {
  const { sessions } = useCoachData();
  const rows = overload(sessions(me.id));
  const count = (s: OverloadStatus) =>
    rows.filter((r) => r.status === s).length;
  const order: OverloadStatus[] = ["stalled", "down", "same", "up", "new"];
  const sorted = [...rows].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status),
  );

  return (
    <>
      <View style={styles.head}>
        <Text variant="heading" style={styles.flex}>
          Last 2 weeks
        </Text>
        <WhyThis
          label="Why?"
          title="Progressive overload"
          points={[
            "Each lift's best set is compared with the session before: more weight, or more reps at the same weight, counts as progress.",
            "In trained lifters, adding reps and adding weight gave similar gains over 8 weeks.",
            "Three sessions in a row without progress is a stall: try one more rep at the same weight, or a lighter week.",
          ]}
          sources={["plotkin2022", "helms2016rir"]}
        />
      </View>

      {rows.length ? (
        <>
          <View style={styles.stats}>
            {(["up", "same", "stalled"] as const).map((s) => (
              <View key={s} style={styles.stat}>
                <Text
                  style={[styles.statNum, { color: LOOK[s].color }]}
                  numeric
                >
                  {String(count(s) + (s === "same" ? count("down") : 0))}
                </Text>
                <Text variant="caption" tone="muted">
                  {s === "up"
                    ? "Progressing"
                    : s === "same"
                      ? "Holding"
                      : "Stalled"}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.group}>
            {sorted.map((r, i) => (
              <Row key={r.name} r={r} first={i === 0} />
            ))}
          </View>
        </>
      ) : (
        <Text tone="muted">Log a workout to see your progress here.</Text>
      )}

      <Eyebrow>Workouts</Eyebrow>
      <HistoryWeeks me={me} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  stats: { flexDirection: "row", gap: space[2] },
  stat: {
    flex: 1,
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: space[1] / 2,
  },
  statNum: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  group: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: space[12] + space[4],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  badge: {
    width: space[8],
    height: space[8],
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
