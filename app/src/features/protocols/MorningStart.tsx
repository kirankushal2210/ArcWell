// Cortisol graph on Today (D80, D82, founder request): the day's cortisol curve from waking to the
// next waking. Four morning non-negotiables (sunlight, water, caffeine, movement) shape it: all four
// done gives a high morning peak and a low night, ready for sleep; fewer gives a flatter curve. A faint
// dashed line shows the all-four pattern to aim for, and a dot marks now. An illustration of the
// pattern from the morning steps and the typical daily rhythm, never a measurement. One compact card;
// the to-do shows only in the morning window.
import {
  Activity,
  Check,
  Coffee,
  Droplet,
  Footprints,
  Sun,
} from "lucide-react-native";
import { useState } from "react";
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
  clock,
  cortisolDay,
  cortisolMeter,
  followRules,
  meterLabel,
  MORNING_ITEMS,
  MORNING_WINDOW_MIN,
  type MorningItem,
  type Rhythm,
} from "@/features/science/habits";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, controlHeightSm, radius, space } from "@/theme";

import { useNow } from "./useNow";

const ICON = { light: Sun, water: Droplet, move: Footprints, caffeine: Coffee };
const HEIGHT = 92;

/** The day's curve: waking on the left, the next waking on the right. */
export function CortisolGraph({
  rhythm,
  now,
  done,
  width,
}: {
  rhythm: Rhythm;
  now: number;
  done: number;
  width: number;
}) {
  const left = 26;
  const right = 6;
  const top = 8;
  const bottom = 16;
  const x = (t: number) =>
    left + ((t - rhythm.wake) / 1440) * (width - left - right);
  const y = (v: number) => top + (1 - v) * (HEIGHT - top - bottom);
  const path = (pts: { t: number; v: number }[]) =>
    pts
      .map(
        (p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`,
      )
      .join(" ");
  const today = cortisolDay(done, rhythm);
  const ideal = cortisolDay(4, rhythm);
  const bed = bedAfterWake(rhythm);
  const t = now < rhythm.wake ? now + 1440 : now;
  const nowPt = today.reduce((a, b) =>
    Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a,
  );
  const night = t >= bed - 60 || t < rhythm.wake;
  const stroke = night ? colors.recovery : colors.training;
  return (
    <View aria-hidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={HEIGHT}>
        <SvgText x={0} y={top + 8} fill={colors.textMuted} fontSize={9}>
          High
        </SvgText>
        <SvgText x={0} y={HEIGHT - bottom} fill={colors.textMuted} fontSize={9}>
          Low
        </SvgText>
        <Line
          x1={x(bed)}
          x2={x(bed)}
          y1={top}
          y2={HEIGHT - bottom}
          stroke={colors.border}
          strokeDasharray="2,3"
        />
        {done < 4 ? (
          <Path
            d={path(ideal)}
            stroke={colors.textMuted}
            strokeWidth={1.5}
            strokeDasharray="3,4"
            fill="none"
            opacity={0.6}
          />
        ) : null}
        <Path
          d={path(today)}
          stroke={stroke}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={x(nowPt.t)} cy={y(nowPt.v)} r={4.5} fill={colors.text} />
        <SvgText
          x={x(rhythm.wake)}
          y={HEIGHT - 3}
          fill={colors.textMuted}
          fontSize={9}
        >
          {`Wake ${clock(rhythm.wake)}`}
        </SvgText>
        <SvgText
          x={Math.min(width - right - 52, x(bed) - 24)}
          y={HEIGHT - 3}
          fill={colors.textMuted}
          fontSize={9}
        >
          {`Bed ${clock(bed)}`}
        </SvgText>
      </Svg>
    </View>
  );
}

const WHY = {
  title: "Your cortisol curve",
  points: [
    "Cortisol follows a daily rhythm: it rises after waking, falls through the day and is lowest at night. High in the morning and low at night is the healthy pattern, and low at night helps you sleep.",
    "Bright morning light, caffeine and exercise each raised cortisol in studies. A steep day, high in the morning and low at night, has been linked with better health in long-term studies; a flatter day with poorer health. Those studies can't prove cause.",
    "Water is on the list because you wake up after hours without drinking. Caffeine only if you already drink it; there's no need to start.",
    "The graph is an illustration from your morning steps and the typical daily rhythm. It doesn't measure your cortisol.",
  ],
  sources: ["leproult2001", "hill2008", "lovallo2005", "adam2017", "fries2009"],
};

export function MorningStart() {
  const v = useVisibility();
  const rec = useRecovery();
  const water = useWater();
  const { setAthleteSettings } = useCoachData();
  const now = useNow();
  const [width, setWidth] = useState(0);
  if (!v.me || !v.settings || !v.has("morning")) return null;
  const me = v.me;
  const rhythm: Rhythm = { wake: rec.baseline.wake, bed: rec.baseline.bed };

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
  const count = MORNING_ITEMS.filter((i) => done(i.key)).length;
  const m = cortisolMeter(count, now, rhythm);
  const headline =
    m.phase === "night"
      ? count === 4
        ? "Night cortisol: low, ready for sleep"
        : "Night cortisol"
      : m.phase === "morning"
        ? `Morning cortisol: ${meterLabel(m.value)}`
        : "Your cortisol curve";
  const note =
    m.phase === "morning"
      ? count === 4
        ? "All four non-negotiables done: high now, low tonight."
        : `Do all four non-negotiables for a high morning and a low night (${count} of 4).`
      : count === 4
        ? "All four done this morning: coming down to low at night."
        : `${count} of 4 done this morning, so today's curve is flatter. Dashed: the all-four day.`;

  return (
    <View
      style={styles.card}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - space[3] * 2)}
    >
      <View style={styles.head}>
        <Activity
          size={16}
          color={m.phase === "night" ? colors.recovery : colors.training}
        />
        <Text variant="label" weight="semibold" style={styles.flex}>
          {headline}
        </Text>
        <WhyThis {...WHY} label="Why?" />
      </View>
      {width > 0 ? (
        <CortisolGraph rhythm={rhythm} now={now} done={count} width={width} />
      ) : null}
      <Text variant="caption" tone="muted">
        {`${note} Illustration, not measured.`}
      </Text>
      <View style={styles.cols}>
        <View style={styles.col}>
          <Text variant="caption" weight="semibold">
            Do · morning
          </Text>
          {MORNING_ITEMS.map((i) => {
            const on = done(i.key);
            const Icon = ICON[i.key];
            const canTick = m.phase === "morning";
            return (
              <PressableScale
                key={i.key}
                onPress={() => canTick && toggle(i.key)}
                disabled={!canTick}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: !canTick }}
                accessibilityLabel={`${i.label}: ${i.hint}`}
                style={styles.row}
              >
                <View style={[styles.box, on && styles.boxOn]}>
                  {on ? (
                    <Check size={12} strokeWidth={3} color={colors.onPillar} />
                  ) : (
                    <Icon size={12} color={colors.textMuted} />
                  )}
                </View>
                <Text
                  variant="caption"
                  weight={on ? "semibold" : "regular"}
                  style={styles.flex}
                >
                  {i.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.col}>
          <Text variant="caption" weight="semibold">
            Follow · evening
          </Text>
          {followRules(rhythm).map((r) => (
            <View key={r.key} style={styles.rule}>
              <Text variant="caption">{r.label}</Text>
              <Text variant="caption" tone="muted">
                {r.detail}
              </Text>
            </View>
          ))}
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
  cols: { flexDirection: "row", gap: space[3] },
  col: { flex: 1, gap: space[1] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: controlHeightSm,
  },
  box: {
    width: space[4] + space[1],
    height: space[4] + space[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.success },
  rule: { minHeight: controlHeightSm, justifyContent: "center" },
});
