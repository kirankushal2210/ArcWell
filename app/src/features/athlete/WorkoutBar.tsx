// Minimised workout (F4-09): while a workout runs, a Honey bar above the tab bar keeps the time and
// the rest countdown in view on every tab, in the action dock's spot (D67). Tap to go back; the bin
// at the end discards the workout after a confirm (D102).
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useSetActive,
  useWorkoutSummary,
} from "@/features/athlete/ActiveWorkout";
import { confirmDiscard } from "@/features/athlete/discardWorkout";
import { cancelRestAlert } from "@/features/athlete/restAlert";
import { IconButton, PressableScale, Text } from "@/components/primitives";
import { colors, radius, rhythm, space } from "@/theme";

import { clockTime, now } from "./training";
import { tabBarTop } from "@/features/coach/parts";

const WORKOUT_BAR = 52;

export function WorkoutBar() {
  const active = useWorkoutSummary();
  const setActive = useSetActive();
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

  const discard = () =>
    confirmDiscard(() => {
      cancelRestAlert();
      setActive(null);
    });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: tabBarTop(insets.bottom) + space[2] }]}
    >
      <View style={styles.bar}>
        <PressableScale
          onPress={() => router.push("/athlete/workout")}
          accessibilityRole="button"
          accessibilityLabel={`Back to ${active.name}`}
          style={styles.open}
        >
          <View>
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
        </PressableScale>
        <IconButton
          icon={Trash2}
          color={colors.onBrand}
          accessibilityLabel="Discard workout"
          onPress={discard}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: rhythm.gutter, right: rhythm.gutter },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: WORKOUT_BAR,
    paddingRight: space[1],
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  open: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingLeft: space[4],
  },
  sub: { opacity: 0.75 },
});
