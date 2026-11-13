// Habits on Today (D77): only active habits inside their time window, at most three tiles, then one
// "Later today" line. In the hour before bed, Today shows the wind-down card instead. Tap ticks;
// timers and amounts open the habit page. Nothing at all when no habit module is on (D78).
import { router } from "expo-router";
import {
  Activity,
  Check,
  Clock3,
  Coffee,
  Dumbbell,
  Fish,
  Footprints,
  Leaf,
  type LucideIcon,
  Moon,
  Snowflake,
  Sun,
  Target,
  Wind,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { clock, type Habit, windowOf } from "@/features/science/habits";
import { colors, radius, space } from "@/theme";

import { useHabits } from "./useHabits";

export const HABIT_ICON: Record<string, LucideIcon> = {
  "morning-daylight": Sun,
  "afternoon-daylight": Sun,
  "wind-down": Moon,
  "same-wake": Clock3,
  "caffeine-cutoff": Coffee,
  alcohol: Moon,
  steps: Activity,
  "walk-after-meal": Footprints,
  mobility: Dumbbell,
  "long-exhale": Wind,
  meditation: Wind,
  nsdr: Moon,
  cold: Snowflake,
  fermented: Leaf,
  "fatty-fish": Fish,
  "focus-block": Target,
};

const opensPage = (h: Habit) =>
  h.tracker === "timer" || h.tracker === "amount" || h.tracker === "count";

export function TodayHabits() {
  const hb = useHabits();
  if (!hb.me || !hb.active.length) return null;
  const t = hb.now < hb.rhythm.wake - 180 ? hb.now + 1440 : hb.now;
  const evening = t >= hb.bed - 60;

  const due = hb.active.filter(
    ({ h }) => hb.visibleNow(h) && h.window.anchor !== "anytime",
  );
  const shown = (
    evening ? due.filter(({ h }) => h.id === "wind-down") : due
  ).slice(0, 3);
  const later = hb.active.filter(({ h }) => {
    const w = windowOf(h, hb.rhythm);
    return w && w[0] > t && !hb.done(h) && !(evening && h.id !== "wind-down");
  });
  if (!shown.length && !later.length) return null;

  const open = (h: Habit) =>
    router.push({ pathname: "/athlete/habits/[id]", params: { id: h.id } });

  return (
    <View style={styles.wrap}>
      {shown.length ? (
        <View style={styles.grid}>
          {shown.map(({ h }, i) => {
            const on = hb.done(h);
            const Icon = HABIT_ICON[h.id] ?? Check;
            const w = windowOf(h, hb.rhythm);
            const wide = shown.length === 3 ? i === 2 : shown.length === 1;
            const sub =
              h.id === "caffeine-cutoff"
                ? `Last coffee by ${clock(w ? w[1] - 60 * 1 : 0)}`
                : on
                  ? "Done"
                  : w
                    ? `Until ${clock(w[1])}`
                    : h.summary;
            return (
              <PressableScale
                key={h.id}
                onPress={() => (opensPage(h) ? open(h) : hb.tick(h))}
                onLongPress={() => open(h)}
                accessibilityRole={opensPage(h) ? "button" : "checkbox"}
                accessibilityState={opensPage(h) ? undefined : { checked: on }}
                accessibilityLabel={`${h.name}. ${sub}`}
                accessibilityHint="Long press for details"
                style={[styles.tile, wide && styles.wide]}
              >
                <View style={styles.tileHead}>
                  <View style={styles.chip}>
                    <Icon size={15} color={colors.text} />
                  </View>
                  {!opensPage(h) ? (
                    <View style={[styles.tick, on && styles.tickOn]}>
                      {on ? (
                        <Check
                          size={13}
                          strokeWidth={3}
                          color={colors.onPillar}
                        />
                      ) : null}
                    </View>
                  ) : null}
                </View>
                <Text variant="label" weight="semibold">
                  {h.name}
                </Text>
                <Text variant="caption" tone="muted">
                  {sub}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      ) : null}
      {later.length ? (
        <PressableScale
          onPress={() => router.push("/athlete/habits")}
          accessibilityRole="button"
          accessibilityLabel={`Later today: ${later.map(({ h }) => h.name).join(", ")}`}
          style={styles.later}
        >
          <Clock3 size={16} color={colors.textMuted} />
          <View style={styles.flex}>
            <Text variant="label" weight="semibold">
              Later today
            </Text>
            <Text variant="caption" tone="muted">
              {later
                .slice(0, 3)
                .map(({ h }) => {
                  const w = windowOf(h, hb.rhythm);
                  return w ? `${h.name} ${clock(w[0])}` : h.name;
                })
                .join(" · ")}
            </Text>
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: space[2] },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[1],
  },
  wide: { flexBasis: "100%" },
  tileHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.success, borderColor: colors.success },
  later: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
});
