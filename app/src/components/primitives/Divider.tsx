import { StyleSheet, View } from "react-native";

import { borderWidth, colors } from "@/theme";

/** Decorative 1 dp divider (border colour, 1.4:1: never the only separator of meaning). */
export function Divider() {
  return (
    <View
      style={styles.line}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: borderWidth,
    backgroundColor: colors.border,
    alignSelf: "stretch",
  },
});
