import { StyleSheet, View } from "react-native";

import { colors, radius, space } from "@/theme";

import { Text, type TextTone } from "./Text";

/** Coach client status (D39). */
export type ClientStatus = "active" | "paused" | "leaving" | "completed";

const look: Record<
  ClientStatus,
  { label: string; tone: TextTone; dot: string }
> = {
  active: { label: "Active", tone: "success", dot: colors.success },
  paused: { label: "Paused", tone: "muted", dot: colors.textMuted },
  leaving: { label: "Leaving", tone: "warning", dot: colors.warning },
  completed: { label: "Completed", tone: "brand", dot: colors.brand },
};

/** Read-only status pill (spec sheet): dot + word, so colour is never the only signal (C11). */
export function StatusChip({ status }: { status: ClientStatus }) {
  const s = look[status];
  return (
    <View style={styles.chip} accessibilityLabel={`Status: ${s.label}`}>
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <Text variant="caption" weight="semibold" tone={s.tone}>
        {s.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 24,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  dot: { width: 8, height: 8, borderRadius: radius.full },
});
