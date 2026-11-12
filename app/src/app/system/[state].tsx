// Force update (S-05) and maintenance (S-06). Shown at start when the remote config says so.
import { useLocalSearchParams } from "expo-router";
import { Download, Wrench } from "lucide-react-native";
import { Linking, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { colors, rhythm, space } from "@/theme";

export default function SystemState() {
  const { state } = useLocalSearchParams<{ state: string }>();
  const insets = useSafeAreaInsets();
  const update = state === "update";
  const Icon = update ? Download : Wrench;
  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + space[12],
          paddingBottom: Math.max(insets.bottom, space[4]),
        },
      ]}
    >
      <View style={styles.body}>
        <Icon size={40} strokeWidth={1.6} color={colors.text} />
        <Text variant="title" style={styles.center}>
          {update
            ? "Update Arcwell to keep going"
            : "Arcwell is down for a short break"}
        </Text>
        <Text tone="muted" style={styles.center}>
          {update
            ? "This version is too old to work with your account. Updating takes a minute, and everything you've logged is safe."
            : "We're making improvements. Everything you've logged is safe; try again in a few minutes."}
        </Text>
      </View>
      {update ? (
        <Button
          label="Update in the Play Store"
          fullWidth
          onPress={() =>
            Linking.openURL("market://details?id=com.arcwell.app").catch(
              () => {},
            )
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: rhythm.gutter,
    backgroundColor: colors.bg,
  },
  body: { alignItems: "center", gap: space[3] },
  center: { textAlign: "center" },
});
