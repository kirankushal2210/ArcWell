// Welcome screen: the first screen people see (D83). Black and red, and as little as possible:
// the mark, the name, one line, and the two ways in.
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { colors, space } from "@/theme";

const mark = require("../../../assets/brand/arcwell-mark.png");

export type WelcomeScreenProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + space[12],
          paddingBottom: insets.bottom + space[6],
        },
      ]}
      testID="welcome"
    >
      <View style={styles.center}>
        <Image
          source={mark}
          tintColor={colors.accent}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          style={styles.mark}
        />
        <Text variant="display" accessibilityRole="header">
          ARCWELL
        </Text>
        <Text tone="muted" style={styles.line}>
          Train by the science.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="Get started"
          fullWidth
          onPress={onGetStarted}
          testID="welcome-get-started"
        />
        <Button
          label="I have an account"
          variant="ghost"
          fullWidth
          onPress={onSignIn}
          testID="welcome-sign-in"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: space[6],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[3],
  },
  mark: { width: space[12] + space[6], height: space[12] + space[6] },
  line: { textAlign: "center" },
  actions: { gap: space[2] },
});
