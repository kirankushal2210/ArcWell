// What the AI permission step tells the athlete before any AI use (D35, D57): what's used, what isn't,
// where it goes and how to turn it off. Shared by the onboarding paywall and the in-app trial offer.
import { Check } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

const POINTS = [
  "Your answers, workouts, food and sleep logs",
  "Not your name, email or phone number",
  "Sent from Arcwell's server to our AI provider, never straight from the app",
  "Turn it off any time in Account → Privacy",
];

export function AIConsentPoints() {
  return (
    <View style={styles.card}>
      {POINTS.map((t) => (
        <View key={t} style={styles.point}>
          <Check size={18} strokeWidth={2.5} color={colors.text} />
          <Text style={styles.flex}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  point: { flexDirection: "row", alignItems: "center", gap: space[3] },
  flex: { flex: 1 },
});
