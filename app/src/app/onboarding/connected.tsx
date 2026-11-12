// AO-21b: connected to a coach through their general link. No calorie target, paywall or AI here:
// the coach sets targets and plans (D44, D57). The plan arrives later; no turnaround promise (D45).
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { NextButton } from "@/features/onboarding/parts";
import { colors, radius, rhythm, space } from "@/theme";

export default function Connected() {
  const { coachName } = useCoachData();
  const insets = useSafeAreaInsets();
  const first = coachName.replace(/^Coach\s+/, "");
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, space[4]),
        },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.badge}>
          <Check size={40} strokeWidth={3} color={colors.onBrand} />
        </View>
        <Text variant="display" style={styles.center}>
          You&apos;re connected to {coachName}
        </Text>
        <Text tone="muted" style={styles.center}>
          {first} has your answers and is building your plan: training, food and
          sleep. You&apos;ll get a notification when it&apos;s ready.
        </Text>
        <View style={styles.coach}>
          <Avatar name={first} />
          <View style={styles.flex}>
            <Text weight="semibold">{coachName}</Text>
            <Text variant="label" weight="regular" tone="muted">
              Your coach
            </Text>
          </View>
        </View>
        <Text variant="caption" tone="muted" style={styles.center}>
          Until then you can log any workout you do.
        </Text>
      </View>
      <NextButton
        label="Save my account"
        disabled={false}
        onPress={() => router.push("/onboarding/save")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: space[4],
    paddingHorizontal: rhythm.gutter,
  },
  center: { textAlign: "center" },
  badge: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  coach: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  flex: { flex: 1, gap: space[1] / 2 },
});
