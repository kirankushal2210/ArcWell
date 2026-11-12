// Minimised workout (F4-09): while a workout runs, a black bar above the tab bar keeps the time and
// the rest countdown in view on every tab. Tap to go back to the workout.
import { router } from "expo-router";
import { ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale, Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import { clockTime, now } from "./training";
import { useCoachData } from "@/features/coach/CoachData";
import { tabBarTop } from "@/features/coach/parts";

/** Height of this bar, so the AI button can sit above it. */
export const WORKOUT_BAR = 60;

export function WorkoutBar() {
  const { active } = useCoachData();
  const insets = useSafeAreaInsets();
  const [clock, setClock] = useState(now);
  useEffect(() => {
    const t = setInterval(() => setClock(now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!active) return null;
  const resting =
    active.rest && active.rest.endsAt > clock ? active.rest.endsAt - clock : 0;

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
  wrap: { position: "absolute", left: space[4], right: space[4] },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    height: WORKOUT_BAR,
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
  },
  flex: { flex: 1 },
  sub: { opacity: 0.75 },
});
