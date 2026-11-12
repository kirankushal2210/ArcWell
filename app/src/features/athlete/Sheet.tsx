// Bottom sheet over a dimmed screen (scrim dims, never blurs — DESIGN.md). Tap outside to close.
import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale, Text } from "@/components/primitives";
import { colors, radius, rhythm, space } from "@/theme";

export function Sheet({
  visible,
  onClose,
  title,
  sub,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  sub?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.scrim}
        onPress={onClose}
        accessibilityLabel="Close"
      />
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <View style={styles.grabber} />
        {title ? (
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {sub ? <Text tone="muted">{sub}</Text> : null}
        {children}
      </View>
    </Modal>
  );
}

/** One tappable row in a sheet menu. */
export function SheetRow({
  label,
  sub,
  onPress,
  tone = "default",
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={styles.row}
    >
      <Text weight="medium" tone={tone}>
        {label}
      </Text>
      {sub ? (
        <Text variant="label" weight="regular" tone="muted">
          {sub}
        </Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: space[2],
  },
  row: {
    minHeight: 52,
    justifyContent: "center",
    gap: space[1] / 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: space[2],
  },
});
