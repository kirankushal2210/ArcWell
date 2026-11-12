// Shared pieces for Recovery (D60): the data for a day (device, check-in or answers), rings, and the
// small rows every Recovery page uses. Rings are black on a grey track (D50); only the zone dot has
// colour, and the zone is always said in words too.
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { todayIndex, weekSchedule } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";

import { dateKey } from "./foods";
import {
  type Baseline,
  type DayInputs,
  dayFor,
  DEVICE_LABEL,
  type DeviceBrand,
  type Source,
  type Zone,
} from "./recovery";
import { useMe } from "./useMe";

/** Protocol bedtimes run past midnight (1440+); Recovery counts the evening before as negative. */
const evening = (m: number) => (m >= 720 ? m - 1440 : m);

export function useRecovery() {
  const me = useMe();
  const data = useCoachData();
  const id = me?.id ?? "";
  const store = data.recoveryOf(id);
  const sessions = me ? data.sessions(id) : [];
  const baseline: Baseline = {
    sleepTargetH: me?.protocol?.sleepH ?? me?.recovery.sleepTargetH ?? 7.5,
    bed: evening(me?.protocol?.bed ?? 22 * 60 + 30),
    wake: me?.protocol?.wake ?? 6 * 60 + 30,
    quality: me?.recovery.quality ?? 3,
    energy: me?.recovery.energy ?? 3,
    stress: me?.recovery.stress ?? 3,
    soreness: me?.recovery.soreness ?? 3,
  };
  const inputs: DayInputs = {
    store,
    baseline,
    restDays: me?.protocol?.restDays ?? [],
    workouts: sessions.map((s) => {
      const d = new Date(s.at);
      return {
        date: dateKey(d),
        minutes: s.minutes,
        effort: s.effort,
        name: s.name,
        start: d.getHours() * 60 + d.getMinutes(),
      };
    }),
  };
  const schedule = me?.program
    ? weekSchedule(me.program, me.protocol?.restDays ?? [])
    : [];
  return {
    me,
    id,
    tier: data.meTier,
    coached: data.meTier === "coached",
    coachName: data.coachName,
    store,
    inputs,
    baseline,
    day: (date: string) => dayFor(inputs, date),
    /** Today's planned workout name, if any. */
    planned: schedule[todayIndex()]?.day?.name ?? null,
    sessions,
    saveWellness: data.saveWellness,
    connectDevice: data.connectDevice,
    disconnectDevice: data.disconnectDevice,
    addActivity: data.addActivity,
    removeActivity: data.removeActivity,
    toggleProtocol: data.toggleProtocol,
    /** Tracker named in onboarding but not connected yet. */
    pendingDevice:
      !store.device && me?.profile?.device && me.profile.device !== "none"
        ? (me.profile.device as DeviceBrand)
        : null,
  };
}

export const SOURCE_TEXT: Record<Source, string> = {
  device: "From your device",
  "check-in": "From your morning check-in",
  answers: "Estimated from your onboarding answers",
};
export const sourceText = (s: Source, brand?: DeviceBrand) =>
  s === "device" && brand ? `From your ${DEVICE_LABEL[brand]}` : SOURCE_TEXT[s];

const ZONE_COLOR: Record<Zone, string> = {
  green: colors.success,
  yellow: colors.warning,
  red: colors.danger,
};

export function ZoneDot({ zone }: { zone: Zone }) {
  return <View style={[styles.dot, { backgroundColor: ZONE_COLOR[zone] }]} />;
}

/** A progress ring with a big value inside. `share` is 0–1. */
export function Ring({
  share,
  value,
  unit,
  size = 96,
  stroke = 8,
}: {
  share: number;
  value: string;
  unit?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, share));
  return (
    <View style={{ width: size, height: size }}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.surfaceRaised}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.brand}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </View>
      <View style={styles.ringInner}>
        <Text
          variant={size >= 140 ? "display" : "title"}
          numeric
          style={styles.center}
        >
          {value}
          {unit ? (
            <Text variant="label" tone="muted">
              {unit}
            </Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
}

/** Ring with a label under it that opens its section tab. */
export function RingButton({
  label,
  onPress,
  ...ring
}: Parameters<typeof Ring>[0] & { label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${ring.value}${ring.unit ?? ""}. Open ${label}`}
      style={styles.ringButton}
    >
      <Ring {...ring} />
      <Text variant="label" weight="semibold">
        {label} ›
      </Text>
    </PressableScale>
  );
}

/** "Label ……… value / note" row in a card. */
export function StatRow({
  label,
  value,
  note,
  good,
  first,
}: {
  label: string;
  value: string;
  note?: string;
  good?: boolean;
  first?: boolean;
}) {
  return (
    <View style={[styles.stat, !first && styles.statLine]}>
      <View style={styles.flex}>
        <Text>{label}</Text>
        {note ? (
          <Text variant="label" weight="regular" tone="muted" numeric>
            {note}
          </Text>
        ) : null}
      </View>
      <Text weight="semibold" numeric>
        {value}
      </Text>
      {good === undefined ? null : (
        <View
          style={[
            styles.dot,
            { backgroundColor: good ? colors.success : colors.warning },
          ]}
          accessibilityLabel={good ? "Good" : "Worth watching"}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  dot: { width: 10, height: 10, borderRadius: radius.full },
  ringInner: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  ringButton: { alignItems: "center", gap: space[2], flex: 1 },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 56,
    paddingVertical: space[2],
  },
  statLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
