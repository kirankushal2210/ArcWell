// Google sign-in (D62): the button shows on every sign-in and sign-up screen but stays turned off
// until the development build adds Google sign-in. Email codes work everywhere meanwhile.
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { space } from "@/theme";

export function GoogleButton() {
  return (
    <View style={styles.wrap}>
      <Button
        label="Continue with Google"
        variant="secondary"
        fullWidth
        disabled
        accessibilityHint="Coming soon"
      />
      <Text variant="caption" tone="muted" style={styles.center}>
        Google sign-in is coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  center: { textAlign: "center" },
});
