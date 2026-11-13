// A small round button for logging food (D86), in place of the full-width "Log food" bar. Plus
// members get the scan (photo logging); coached and free athletes, who don't get AI (D44), get a
// "+" that opens food search.
import { router } from "expo-router";
import { type LucideIcon, Plus, ScanLine } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { tabBarTop } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

import { useWorkoutSummary } from "./ActiveWorkout";

/** A small round red action above the tab bar (D86, D100); `level` 1 sits above level 0. */
export function RoundAction({
  icon: Icon,
  label,
  onPress,
  level = 0,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  level?: 0 | 1;
}) {
  const insets = useSafeAreaInsets();
  const active = useWorkoutSummary();
  // The workout bar takes this spot while a workout runs.
  if (active) return null;
  const size = space[12] + space[2];
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom:
            tabBarTop(insets.bottom) + space[3] + level * (size + space[3]),
        },
      ]}
    >
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.button}
      >
        <Icon size={24} strokeWidth={2.3} color={colors.onBrand} />
      </PressableScale>
    </View>
  );
}

export function FoodScanButton({
  meal,
  date,
  level = 0,
}: {
  meal: string;
  date?: string;
  level?: 0 | 1;
}) {
  const { meTier } = useCoachData();
  const scan = meTier === "pro";
  return (
    <RoundAction
      icon={scan ? ScanLine : Plus}
      label={scan ? "Scan a meal" : "Log food"}
      level={level}
      onPress={() =>
        router.push({
          pathname: scan ? "/athlete/food/photo" : "/athlete/food/add",
          params: date ? { meal, date } : { meal },
        })
      }
    />
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: rhythm.gutter },
  button: {
    width: space[12] + space[2],
    height: space[12] + space[2],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.scrim,
    shadowOpacity: 0.4,
    shadowRadius: space[2],
    shadowOffset: { width: 0, height: space[1] },
    elevation: 6,
  },
});
