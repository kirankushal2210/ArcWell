import {
  CircleAlert,
  CloudOff,
  Info,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives/Text";
import { colors, radius, space } from "@/theme";

export type BannerTone = "info" | "offline" | "warning";

const look: Record<BannerTone, { icon: LucideIcon; color: string }> = {
  info: { icon: Info, color: colors.textMuted },
  offline: { icon: CloudOff, color: colors.textMuted },
  warning: { icon: CircleAlert, color: colors.warning },
};

/**
 * Slim inline banner (spec sheet), e.g. "Saved on your phone — will sync" (F4-09)
 * or a coach "Leaving" notice (D39). Icon + text, never colour alone.
 */
export function Banner({
  message,
  tone = "info",
}: {
  message: string;
  tone?: BannerTone;
}) {
  const { icon: Icon, color } = look[tone];
  return (
    <View
      style={styles.banner}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <Icon size={16} strokeWidth={2} color={color} />
      <Text variant="label" weight="regular" tone="muted" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  text: { flex: 1 },
});
