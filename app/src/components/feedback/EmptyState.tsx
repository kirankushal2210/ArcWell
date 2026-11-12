import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { colors, radius, rhythm, space } from "@/theme";

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Empty list state (DESIGN.md §8). Left-aligned per C6; the spec sheet draws it
 * centred, which is flagged in docs/frontend/phase-2-report.md. Lucide icon only,
 * no illustration (illustration rule still undecided).
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <Icon size={24} strokeWidth={2} color={colors.textMuted} />
      </View>
      <View style={styles.text}>
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="label" weight="regular" tone="muted">
          {body}
        </Text>
      </View>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} fullWidth />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: rhythm.cardPad, paddingVertical: space[6] },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { gap: space[1] },
});
