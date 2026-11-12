import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { colors, radius } from "@/theme";

import { Text } from "./Text";

export type AvatarProps = {
  /** Full name, used for initials and the accessibility label. */
  name: string;
  uri?: string;
  size?: 32 | 40 | 48;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

/** Round avatar: photo when given, otherwise initials on raised (spec sheet list row). */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const box = { width: size, height: size, borderRadius: radius.full };
  return (
    <View
      style={[styles.box, box]}
      accessibilityRole="image"
      accessibilityLabel={name}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={box}
          contentFit="cover"
          accessible={false}
        />
      ) : (
        <Text
          variant={size === 32 ? "caption" : "label"}
          weight="semibold"
          tone="muted"
        >
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
