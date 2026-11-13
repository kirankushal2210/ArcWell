// Nutrition day parts (D94), in Arcwell's black and red: a progress ring, the week strip with each
// day's calories as a ring around its date, the streak pill and sheet, the calories card and the
// three macro cards.
import { Drumstick, Droplet, Flame, Wheat } from "lucide-react-native";
import { type ReactNode, useRef, useState } from "react";
import {
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

import { shiftDate } from "./foods";
import { Sheet } from "./Sheet";
import { streakLine } from "./streak";

/** A ring that fills clockwise from the top; anything inside sits in the middle. */
export function Ring({
  size,
  stroke,
  progress,
  color = colors.accent,
  children,
}: {
  size: number;
  stroke: number;
  progress: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceRaised}
          strokeWidth={stroke}
          fill="none"
        />
        {p > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={styles.ringInner}>{children}</View>
    </View>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 3;

/**
 * Three weeks of days, a week per page, landing on this week. Each date sits in a ring that fills
 * with that day's calories against the target; future days are greyed out.
 */
export function DateStrip({
  date,
  today,
  onSelect,
  share,
}: {
  date: string;
  today: string;
  onSelect: (d: string) => void;
  /** That day's calories as a share of the target (0 when nothing is logged). */
  share: (d: string) => number;
}) {
  const [width, setWidth] = useState(0);
  const strip = useRef<ScrollViewInstance>(null);
  const t = new Date(`${today}T12:00:00`);
  const monday = shiftDate(today, -((t.getDay() + 6) % 7));
  const first = shiftDate(monday, -7 * (WEEKS - 1));
  const days = Array.from({ length: 7 * WEEKS }, (_, i) => shiftDate(first, i));
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <ScrollView
          ref={strip}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() =>
            strip.current?.scrollToEnd({ animated: false })
          }
        >
          {days.map((d, i) => {
            const on = d === date;
            const future = d > today;
            return (
              <PressableScale
                key={d}
                disabled={future}
                onPress={() => onSelect(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: future }}
                accessibilityLabel={`${WEEKDAYS[i % 7]} ${Number(d.slice(8))}`}
                style={[styles.dayCell, { width: width / 7 }]}
              >
                <View style={[styles.dayInner, on && styles.dayOn]}>
                  <Text
                    variant="caption"
                    weight={on ? "semibold" : "medium"}
                    tone={future ? "disabled" : on ? "default" : "muted"}
                  >
                    {WEEKDAYS[i % 7]}
                  </Text>
                  <Ring size={36} stroke={2.5} progress={future ? 0 : share(d)}>
                    <Text
                      variant="label"
                      weight="semibold"
                      tone={future ? "disabled" : "default"}
                      numeric
                    >
                      {String(Number(d.slice(8)))}
                    </Text>
                  </Ring>
                </View>
              </PressableScale>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.stripSpace} />
      )}
    </View>
  );
}

/** The flame and the number of days in a row with food logged; tap for the sheet. */
export function StreakPill({ streak }: { streak: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Logging streak, ${streak} ${streak === 1 ? "day" : "days"}`}
        style={styles.pill}
      >
        <Flame size={16} color={colors.accent} fill={colors.accent} />
        <Text weight="bold" numeric>
          {String(streak)}
        </Text>
      </PressableScale>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        <View style={styles.sheet}>
          <View style={styles.flameBig}>
            <Flame size={40} color={colors.accent} fill={colors.accent} />
          </View>
          <Text variant="title" numeric>
            {`${streak}-day streak`}
          </Text>
          <Text tone="muted" style={styles.center}>
            {streakLine(streak)}
          </Text>
        </View>
      </Sheet>
    </>
  );
}

/** Calories left (or eaten, tap to switch) beside a ring that fills as the day's food goes in. */
export function CaloriesCard({
  eaten,
  target,
  waiting,
}: {
  eaten: number;
  target: number;
  /** Shown instead of a target while none is set. */
  waiting?: string;
}) {
  const [showEaten, setShowEaten] = useState(false);
  const left = target - eaten;
  const value = !target || showEaten ? eaten : Math.abs(left);
  return (
    <View style={styles.calCard}>
      <View style={styles.flex}>
        <Text style={styles.calNum} numeric>
          {Math.round(value).toLocaleString("en-IN")}
        </Text>
        {target ? (
          <PressableScale
            onPress={() => setShowEaten((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              showEaten ? "Show calories left" : "Show calories eaten"
            }
          >
            <Text tone="muted">
              {showEaten
                ? "Calories eaten ⇅"
                : left >= 0
                  ? "Calories left ⇅"
                  : "Calories over ⇅"}
            </Text>
          </PressableScale>
        ) : (
          <Text tone="muted">{waiting ?? "Calories eaten"}</Text>
        )}
        <WhyThis
          label="Why?"
          title="How your targets are set"
          points={[
            "Resting energy from your lean mass if you gave a body fat level, otherwise from the Mifflin–St Jeor equation, times your activity, then a small change for your goal.",
            "Fat loss is kept to about 0.5–1% of bodyweight a week, so you keep muscle.",
            "Protein is about 1.8 g per kg a day, or 2.0 g while losing fat.",
          ]}
          sources={["mifflin1990", "cunningham1980", "helms2014", "morton2018"]}
        />
      </View>
      <Ring size={96} stroke={9} progress={target ? eaten / target : 0}>
        <Flame size={28} color={colors.text} fill={colors.text} />
      </Ring>
    </View>
  );
}

const MACRO_LOOK = {
  protein: { label: "Protein", icon: Drumstick, color: colors.accent },
  carbs: { label: "Carbs", icon: Wheat, color: colors.warning },
  fat: { label: "Fat", icon: Droplet, color: colors.nutrition },
} as const;
export type MacroKey = keyof typeof MACRO_LOOK;
export const macroColor = (k: MacroKey) => MACRO_LOOK[k].color;

/** Grams left of each macro, each with its own ring. */
export function MacroCards({
  eaten,
  target,
}: {
  eaten: Record<MacroKey, number>;
  target: Record<MacroKey, number>;
}) {
  return (
    <View style={styles.macros}>
      {(Object.keys(MACRO_LOOK) as MacroKey[]).map((k) => {
        const m = MACRO_LOOK[k];
        const left = target[k] - eaten[k];
        return (
          <View key={k} style={styles.macroCard}>
            <Text style={styles.macroNum} numeric>
              {`${Math.round(Math.abs(left))}g`}
            </Text>
            <Text variant="caption" tone="muted">
              {`${m.label} ${left >= 0 ? "left" : "over"}`}
            </Text>
            <View style={styles.macroRing}>
              <Ring
                size={58}
                stroke={6}
                progress={target[k] ? eaten[k] / target[k] : 0}
                color={m.color}
              >
                <m.icon size={18} color={m.color} />
              </Ring>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  ringInner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  stripSpace: { height: space[12] + space[6] },
  dayCell: { alignItems: "center" },
  dayInner: {
    alignItems: "center",
    gap: space[1],
    paddingVertical: space[1] + space[1] / 2,
    paddingHorizontal: space[1],
    borderRadius: radius.lg,
  },
  dayOn: { backgroundColor: colors.surface },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[3],
    paddingVertical: space[1] + space[1] / 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  sheet: { alignItems: "center", gap: space[2], paddingVertical: space[4] },
  flameBig: {
    width: space[12] * 2 - space[4],
    height: space[12] * 2 - space[4],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  calCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  calNum: { fontSize: 44, lineHeight: 50, fontWeight: "700" },
  macros: { flexDirection: "row", gap: space[2] },
  macroCard: {
    flex: 1,
    gap: space[1] / 2,
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  macroNum: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  macroRing: { alignItems: "center", paddingTop: space[2] },
});
