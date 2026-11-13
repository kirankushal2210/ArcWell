// Minimised workout (F4-09): while a workout runs, a Honey bar above the tab bar keeps the time and
// the rest countdown in view on every tab, in the action dock's spot (D67). Tap to go back.
import { router } from "expo-router";
import { ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkoutSummary } from "@/features/athlete/ActiveWorkout";
import { PressableScale, Text } from "@/components/primitives";
import { colors, radius, rhythm, space } from "@/theme";

import { clockTime, now } from "./training";
import { tabBarTop } from "@/features/coach/parts";

const WORKOUT_BAR = 52;

export function WorkoutBar() {
  const active = useWorkoutSummary();
  const insets = useSafeAreaInsets();
  const [clock, setClock] = useState(now);
  const on = !!active;
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setClock(now()), 1000);
    return () => clearInterval(t);
  }, [on]);
  if (!active) return null;
  const resting =
    active.restEndsAt && active.restEndsAt > clock
      ? active.restEndsAt - clock
      : 0;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: tabBarTop(insets.bottom) + space[2] }]}
    >
      <PressableScale
        onPress={() => router.push("/athlete/workout")}
        accessibilityRole="button"
        accessibilityLabel={`Back to ${active.name}`}
        style={styles.bar}
      >
        <View style={styles.flex}>
          <Text weight="semibold" tone="onBrand" numeric>
            {active.name} · {clockTime(clock - active.startedAt)}
          </Text>
          <Text
            variant="label"
            weight="regular"
            tone="onBrand"
            numeric
            style={styles.sub}
          >
            {resting
              ? `Resting · ${clockTime(resting)} left`
              : "Tap to keep logging"}
          </Text>
        </View>
        <ChevronUp size={20} color={colors.onBrand} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: rhythm.gutter, right: rhythm.gutter },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    height: WORKOUT_BAR,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  flex: { flex: 1 },
  sub: { opacity: 0.75 },
});
