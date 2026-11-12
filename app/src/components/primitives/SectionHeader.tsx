import { StyleSheet, View } from "react-native";

import { colors, radius, space, tapMin } from "@/theme";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type Pillar = "training" | "nutrition" | "recovery";

export type SectionHeaderProps = {
  title: string;
  /** Small pillar marker before the title (spec sheet eyebrow dot). */
  pillar?: Pillar;
  /** Optional text action on the right, e.g. "See all". */
  actionLabel?: string;
  onAction?: () => void;
};

/** Uppercase 12 px eyebrow with an optional pillar dot and a 48 dp text action. */
export function SectionHeader({
  title,
  pillar,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.title} accessibilityRole="header">
        {pillar && (
          <View style={[styles.dot, { backgroundColor: colors[pillar] }]} />
        )}
        <Text variant="eyebrow" tone="muted">
          {title}
        </Text>
      </View>
      {actionLabel && onAction && (
        <PressableScale
          onPress={onAction}
          accessibilityRole="button"
          style={styles.action}
        >
          <Text variant="label" weight="semibold" tone="brand">
            {actionLabel}
          </Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 24,
  },
  title: { flexDirection: "row", alignItems: "center", gap: space[2] },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  action: {
    minHeight: tapMin,
    minWidth: tapMin,
    justifyContent: "center",
    paddingLeft: space[2],
  },
});
