// Morning start on Today (D80): four quick ticks after waking (daylight, water, moving, and coffee or
// tea for people who drink it) beside a small curve of the typical daily cortisol rhythm: high
// soon after waking, low at night. The curve is drawn from the athlete's own wake and bed times; it
// is a typical rhythm, never a measurement. Water ticks for hydration, not cortisol. Compact by
// design: one card in the morning, one slim row later in the day, nothing in the evening.
import {
  Check,
  Coffee,
  Droplet,
  Footprints,
  Sun,
  Sunrise,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import { isoToday } from "@/features/athlete/athleteData";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { useWater } from "@/features/athlete/Water";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import {
  bedAfterWake,
  cortisolCurve,
  inMorning,
  MORNING_ITEMS,
  MORNING_WINDOW_MIN,
  type MorningItem,
  type Rhythm,
  typicalCortisol,
} from "@/features/science/habits";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, controlHeightSm, radius, space } from "@/theme";

import { useNow } from "./useNow";

const ICON = { light: Sun, water: Droplet, move: Footprints, caffeine: Coffee };

/** The small curve: waking on the left, the next waking on the right, a dot at "now". */
export function CortisolCurve({
  rhythm,
  now,
  width,
  height,
  labels = true,
}: {
  rhythm: Rhythm;
  now: number;
  width: number;
  height: number;
  labels?: boolean;
}) {
  const pad = labels ? 12 : 3;
  const top = 4;
  const bottom = labels ? 14 : 3;
  const pts = cortisolCurve(rhythm, 60);
  const x = (t: number) => pad + ((t - rhythm.wake) / 1440) * (width - pad * 2);
  const y = (v: number) => top + (1 - v) * (height - top - bottom);
  const d = pts
    .map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(" ");
  const t = now < rhythm.wake ? now + 1440 : now;
  const bed = bedAfterWake(rhythm);
  return (
    <View aria-hidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height}>
        <Line
          x1={x(bed)}
          x2={x(bed)}
          y1={top}
          y2={height - bottom}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="2,3"
        />
        <Path
          d={d}
          stroke={colors.recovery}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx={x(t)}
          cy={y(typicalCortisol(t, rhythm))}
          r={4}
          fill={colors.text}
        />
        {labels ? (
          <>
            <SvgText
              x={x(rhythm.wake + 40) + 6}
              y={y(1) + 8}
              fill={colors.textMuted}
              fontSize={9}
            >
              High
            </SvgText>
            <SvgText
              x={Math.min(width - pad - 18, x(bed + 180) - 8)}
              y={height - 2}
              fill={colors.textMuted}
              fontSize={9}
            >
              Low
            </SvgText>
          </>
        ) : null}
      </Svg>
    </View>
  );
}

const WHY = {
  title: "Morning start",
  points: [
    "Cortisol has a daily rhythm: it rises soon after waking, falls through the day and is lowest at night. The curve shows that typical rhythm on your wake and bed times. It is not measured.",
    "Bright morning light, exercise and caffeine each raised cortisol in studies. A rhythm that is high in the morning and low at night has been linked with better health in long-term studies, which can't prove cause.",
    "Water is here because you wake up after hours without drinking, not because it changes cortisol.",
    "Coffee or tea only if you already drink it; there's no need to start.",
  ],
  sources: ["leproult2001", "hill2008", "lovallo2005", "adam2017", "fries2009"],
};

export function MorningStart() {
  const v = useVisibility();
  const rec = useRecovery();
  const water = useWater();
  const { setAthleteSettings } = useCoachData();
  const now = useNow();
  if (!v.me || !v.settings || !v.has("morning")) return null;
  const me = v.me;
  const rhythm: Rhythm = { wake: rec.baseline.wake, bed: rec.baseline.bed };
  const bed = bedAfterWake(rhythm);
  const t = now < rhythm.wake - 180 ? now + 1440 : now;
  // Evening (from an hour before bed) Today calms down: no Morning start at all (D77).
  if (t >= bed - 60) return null;

  const today = isoToday();
  const ticks = v.settings.morning?.[today] ?? {};
  const end = rhythm.wake + MORNING_WINDOW_MIN;
  const movedEarly =
    rec.inputs.workouts.some(
      (w) => w.date === today && w.start >= rhythm.wake && w.start <= end,
    ) ||
    rec.store.activities.some(
      (a) => a.date === today && a.start >= rhythm.wake && a.start <= end,
    );
  const done = (k: MorningItem) =>
    ticks[k] !== undefined ||
    (k === "water" && water.today > 0) ||
    (k === "move" && movedEarly);
  const toggle = (k: MorningItem) => {
    const next = { ...ticks };
    if (next[k] !== undefined) delete next[k];
    else next[k] = now;
    setAthleteSettings(me.id, {
      morning: { ...v.settings?.morning, [today]: next },
    });
  };
  const core = MORNING_ITEMS.filter((i) => !i.optional);
  const count = core.filter((i) => done(i.key)).length;

  // Later in the day: one slim row with the curve and the morning's count.
  if (!inMorning(rhythm, now))
    return (
      <View style={styles.slim}>
        <CortisolCurve
          rhythm={rhythm}
          now={now}
          width={72}
          height={30}
          labels={false}
        />
        <View style={styles.flex}>
          <Text variant="label" weight="semibold">
            Your day&apos;s rhythm
          </Text>
          <Text variant="caption" tone="muted">
            {`Morning start ${count} of ${core.length} · typical, not measured`}
          </Text>
        </View>
        <WhyThis {...WHY} label="Why?" />
      </View>
    );

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Sunrise size={16} color={colors.training} />
        <Text variant="label" weight="semibold" style={styles.flex}>
          {`Morning start · ${count} of ${core.length}`}
        </Text>
        <WhyThis {...WHY} />
      </View>
      <View style={styles.body}>
        <View style={styles.ticks}>
          {MORNING_ITEMS.map((i) => {
            const on = done(i.key);
            const Icon = ICON[i.key];
            return (
              <PressableScale
                key={i.key}
                onPress={() => toggle(i.key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${i.label}: ${i.hint}`}
                style={[styles.tick, on && styles.tickOn]}
              >
                {on ? (
                  <Check size={14} strokeWidth={3} color={colors.onPillar} />
                ) : (
                  <Icon size={14} color={colors.textMuted} />
                )}
                <Text
                  variant="caption"
                  weight="semibold"
                  style={on ? styles.onText : undefined}
                >
                  {i.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.curve}>
          <CortisolCurve rhythm={rhythm} now={now} width={116} height={64} />
          <Text variant="caption" tone="muted" style={styles.center}>
            Cortisol, typical day
          </Text>
        </View>
      </View>
    </View>
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
  body: { flexDirection: "row", alignItems: "center", gap: space[2] },
  ticks: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space[1] + space[1] / 2,
  },
  tick: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    minHeight: controlHeightSm,
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  tickOn: { backgroundColor: colors.success },
  onText: { color: colors.onPillar },
  curve: { alignItems: "center" },
  center: { textAlign: "center" },
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
