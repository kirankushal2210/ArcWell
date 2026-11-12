// Trial timeline (F8-02): what happens when, so the trial never surprises anyone. Today full access,
// a reminder on day 5, and Google Play charges on day 7 unless cancelled before.
import {
  Bell,
  CreditCard,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

const STEPS: [LucideIcon, string, string][] = [
  [Sparkles, "Today", "Everything in Arcwell Plus, free for 7 days."],
  [Bell, "Day 5", "We remind you that the trial is ending."],
  [
    CreditCard,
    "Day 7",
    "Google Play starts your plan. Cancel before then and you pay nothing.",
  ],
];

export function TrialTimeline() {
  return (
    <View style={styles.card} accessibilityRole="list">
      {STEPS.map(([Icon, when, what], i) => (
        <View key={when} style={styles.row}>
          <View style={styles.rail}>
            <View style={styles.icon}>
              <Icon size={16} color={colors.text} />
            </View>
            {i < STEPS.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.flex}>
            <Text weight="semibold">{when}</Text>
            <Text variant="label" weight="regular" tone="muted">
              {what}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", gap: space[3] },
  rail: { alignItems: "center" },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: space[3],
    backgroundColor: colors.border,
  },
  flex: { flex: 1, gap: space[1] / 2, paddingBottom: space[3] },
});
