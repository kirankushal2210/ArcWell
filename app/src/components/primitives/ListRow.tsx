import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { borderWidth, colors, space } from "@/theme";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Avatar or icon on the left. */
  leading?: ReactNode;
  /** Short value on the right, e.g. "2 h ago". */
  trailing?: string;
  /** Show a chevron (row opens another screen). Defaults to true when pressable. */
  chevron?: boolean;
  onPress?: () => void;
  /** Hide the bottom divider (last row in a group). */
  last?: boolean;
  testID?: string;
};

/**
 * DESIGN.md §6 list row: 56 dp minimum, 12 dp gap, title truncates rather than
 * wrapping the trailing value off-screen.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  chevron,
  onPress,
  last,
  testID,
}: ListRowProps) {
  const showChevron = chevron ?? !!onPress;
  const content = (
    <>
      {leading}
      <View style={styles.text}>
        <Text variant="body" weight="medium">
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="label"
            weight="regular"
            tone="muted"
            numeric
          >
            {subtitle}
          </Text>
        )}
      </View>
      {trailing && (
        <Text variant="label" weight="regular" tone="muted" numeric>
          {trailing}
        </Text>
      )}
      {showChevron && (
        <ChevronRight size={20} strokeWidth={2} color={colors.textMuted} />
      )}
    </>
  );
  const style = [styles.row, !last && styles.divider];

  if (!onPress) {
    return (
      <View style={style} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, trailing]
        .filter(Boolean)
        .join(", ")}
      testID={testID}
      style={style}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[3],
  },
  divider: { borderBottomWidth: borderWidth, borderBottomColor: colors.border },
  text: { flex: 1, minWidth: 0, gap: space[1] },
});
