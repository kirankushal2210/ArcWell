// Floating AI button above the tab bar (D57), frosted glass: a real blur on iOS; on Android without a
// BlurTargetView, expo-blur shows a translucent fill instead. Never rendered for coached athletes (D44).
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale, Text } from "@/components/primitives";
import { tabBarTop } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

import { WORKOUT_BAR } from "./WorkoutBar";

export function AIButton({
  locked,
  raised = false,
}: {
  locked: boolean;
  raised?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom:
            tabBarTop(insets.bottom) +
            space[3] +
            (raised ? WORKOUT_BAR + space[2] : 0),
        },
      ]}
    >
      <PressableScale
        onPress={() => router.push("/athlete/ai")}
        accessibilityRole="button"
        accessibilityLabel={locked ? "AI coach, start free trial" : "AI coach"}
        style={styles.shadowless}
      >
        <BlurView intensity={60} tint="light" style={styles.glass}>
          <Sparkles size={20} strokeWidth={2} color={colors.text} />
          <Text weight="semibold">AI</Text>
        </BlurView>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: space[4] },
  shadowless: { borderRadius: radius.full, overflow: "hidden" },
  glass: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    height: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
