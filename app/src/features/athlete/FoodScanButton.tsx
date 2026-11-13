// A small round button for logging food (D86), in place of the full-width "Log food" bar. Plus
// members get the scan (photo logging); coached and free athletes, who don't get AI (D44), get a
// "+" that opens food search.
import { router } from "expo-router";
import { Plus, ScanLine } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { tabBarTop } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

import { useWorkoutSummary } from "./ActiveWorkout";

export function FoodScanButton({
  meal,
  date,
}: {
  meal: string;
  date?: string;
}) {
  const insets = useSafeAreaInsets();
  const { meTier } = useCoachData();
  const active = useWorkoutSummary();
  // The workout bar takes this spot while a workout runs.
  if (active) return null;
  const scan = meTier === "pro";
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: tabBarTop(insets.bottom) + space[3] }]}
    >
      <PressableScale
        onPress={() =>
          router.push({
            pathname: scan ? "/athlete/food/photo" : "/athlete/food/add",
            params: date ? { meal, date } : { meal },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={scan ? "Scan a meal" : "Log food"}
        style={styles.button}
      >
        {scan ? (
          <ScanLine size={24} strokeWidth={2.2} color={colors.onBrand} />
        ) : (
          <Plus size={24} strokeWidth={2.4} color={colors.onBrand} />
        )}
      </PressableScale>
    </View>
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
