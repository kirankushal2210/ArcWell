// Bottom sheet over a dimmed screen (scrim dims, never blurs — DESIGN.md). The sheet itself is glass,
// part of the functional layer (D67), in its solid form so what's behind never bleeds into the
// content. Tap outside to close.
import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
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
  const { height } = useWindowDimensions();
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
      <GlassSurface
        solid
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
        {/* Tall content scrolls inside the sheet instead of running off the screen. */}
        <ScrollView
          style={{ maxHeight: height * 0.75 }}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {sub ? <Text tone="muted">{sub}</Text> : null}
          {children}
        </ScrollView>
      </GlassSurface>
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
  body: { gap: space[2] },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomWidth: 0,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.glassEdge,
    marginBottom: space[2],
  },
  row: {
    minHeight: 48,
    justifyContent: "center",
    gap: space[1] / 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassEdge,
    paddingVertical: space[2],
  },
});
