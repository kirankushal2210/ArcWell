import { StyleSheet, Text, View } from "react-native";

// Placeholder home screen. Phase 1 replaces this with sign-in and the
// role-based (athlete / coach) app shell.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arcwell</Text>
      <Text style={styles.subtitle}>Training · Nutrition · Recovery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
