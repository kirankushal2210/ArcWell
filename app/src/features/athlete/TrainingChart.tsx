// Training by week on Progress (D91): this week's total on top, weekly bars for the chosen range,
// and Duration · Volume · Reps underneath. The current week's bar is the brighter red.
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import { Sheet, SheetRow } from "./Sheet";
import {
  formatStat,
  RANGES,
  type RangeKey,
  type StatMetric,
  weeklyTotals,
} from "./stats";
import type { Session } from "./training";

const METRICS: { key: StatMetric; label: string }[] = [
  { key: "duration", label: "Duration" },
  { key: "volume", label: "Volume" },
  { key: "reps", label: "Reps" },
];
const HEIGHT = 160;
const LEFT = 44;
const BOTTOM = 18;
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

/** Round a maximum up to a tidy axis top. */
function niceTop(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10) * p;
}

export function TrainingChart({ sessions }: { sessions: Session[] }) {
  const [metric, setMetric] = useState<StatMetric>("reps");
  const [range, setRange] = useState<RangeKey>("3m");
  const [picking, setPicking] = useState(false);
  const [width, setWidth] = useState(0);
  const r = RANGES.find((x) => x.key === range) ?? RANGES[1];
  const weeks = weeklyTotals(sessions, metric, r.weeks);
  const now = weeks[weeks.length - 1]?.value ?? 0;
  const top = niceTop(Math.max(...weeks.map((w) => w.value)));
  const plotW = Math.max(0, width - LEFT);
  const plotH = HEIGHT - BOTTOM;
  const slot = plotW / weeks.length;
  const bar = Math.max(3, slot * 0.62);
  const every = Math.ceil(weeks.length / 5);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.big} numeric>
          {formatStat(now, metric)}
        </Text>
        <Text tone="muted" style={styles.flex}>
          this week
        </Text>
        <PressableScale
          onPress={() => setPicking(true)}
          accessibilityRole="button"
          accessibilityLabel={`Range: ${r.label}. Change`}
          style={styles.range}
        >
          <Text variant="label" weight="semibold" tone="accent">
            {r.label}
          </Text>
          <ChevronDown size={16} color={colors.accent} />
        </PressableScale>
      </View>

      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessibilityLabel={`${METRICS.find((m) => m.key === metric)?.label} by week, ${r.label.toLowerCase()}`}
      >
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {[0, 0.5, 1].map((f) => {
              const y = plotH - f * (plotH - 8);
              return (
                <Line
                  key={f}
                  x1={LEFT}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={1}
                />
              );
            })}
            {[0, 0.5, 1].map((f) => (
              <SvgText
                key={`l${f}`}
                x={0}
                y={plotH - f * (plotH - 8) + 4}
                fill={colors.textMuted}
                fontSize={10}
              >
                {formatStat(top * f, metric, true)}
              </SvgText>
            ))}
            {weeks.map((w, i) => {
              const h = (w.value / top) * (plotH - 8);
              const x = LEFT + i * slot + (slot - bar) / 2;
              return (
                <Rect
                  key={w.start.toISOString()}
                  x={x}
                  y={plotH - h}
                  width={bar}
                  height={Math.max(0, h)}
                  rx={2}
                  fill={i === weeks.length - 1 ? colors.accent : colors.brand}
                />
              );
            })}
            {weeks.map((w, i) =>
              i % every === 0 ? (
                <SvgText
                  key={`x${i}`}
                  // Keep the last labels inside the card.
                  x={Math.min(LEFT + i * slot + slot / 2, width - 18)}
                  y={HEIGHT - 4}
                  fill={colors.textMuted}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {`${MONTHS[w.start.getMonth()]} ${w.start.getDate()}`}
                </SvgText>
              ) : null,
            )}
          </Svg>
        ) : (
          <View style={{ height: HEIGHT }} />
        )}
      </View>

      <View style={styles.chips}>
        {METRICS.map((m) => {
          const on = m.key === metric;
          return (
            <PressableScale
              key={m.key}
              onPress={() => setMetric(m.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text weight="semibold" tone={on ? "onBrand" : "default"}>
                {m.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <Sheet visible={picking} onClose={() => setPicking(false)} title="Show">
        {RANGES.map((x) => (
          <SheetRow
            key={x.key}
            label={x.label}
            onPress={() => {
              setRange(x.key);
              setPicking(false);
            }}
          />
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "baseline", gap: space[2] },
  big: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  range: { flexDirection: "row", alignItems: "center", gap: space[1] },
  chips: { flexDirection: "row", gap: space[2] },
  chip: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  chipOn: { backgroundColor: colors.brand },
});
