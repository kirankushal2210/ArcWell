// Glass for the functional layer only (D67): tab bar, + button, toolbar buttons, sheets.
// iOS and web blur what's behind and add a translucent tint. Android blur needs the blurred
// content wrapped in a BlurTargetView, which a tab bar floating over every screen can't do,
// so Android uses the solid glass colour (the D67 fallback). Content never sits on glass.
import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import {
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { colors } from "@/theme";

export function GlassSurface({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  if (Platform.OS === "android")
    return <View style={[styles.base, styles.solid, style]}>{children}</View>;
  return (
    <View style={[styles.base, style]}>
      <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />
      <View
        style={[StyleSheet.absoluteFill, styles.tint]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
  },
  solid: { backgroundColor: colors.glassSolid },
  tint: { backgroundColor: colors.glass },
});
