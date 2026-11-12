import { CircleAlert } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PressableScale } from "@/components/primitives/PressableScale";
import { Text } from "@/components/primitives/Text";
import { colors, radius, space, tapMin } from "@/theme";

export type ErrorStateProps = {
  /** Say what failed and reassure, e.g. "Couldn't load your food log. Your entries are safe." */
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

/**
 * Inline error (spec sheet "Error"): raised panel, danger icon + message, and a
 * 48 dp retry action. Danger marks the icon only; the message stays in the
 * primary text colour so it reads as information, not alarm.
 */
export function ErrorState({
  message,
  retryLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.panel} accessibilityRole="alert">
      <CircleAlert size={20} strokeWidth={2} color={colors.danger} />
      <View style={styles.body}>
        <Text variant="label" weight="regular">
          {message}
        </Text>
        {onRetry && (
          <PressableScale
            onPress={onRetry}
            accessibilityRole="button"
            style={styles.retry}
          >
            <Text variant="label" weight="semibold" tone="brand">
              {retryLabel}
            </Text>
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space[3],
    padding: space[3],
    paddingBottom: space[1],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  body: { flex: 1 },
  retry: {
    minHeight: tapMin,
    minWidth: tapMin,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
});
