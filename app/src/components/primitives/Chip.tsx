import { Check } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { colors, radius, space, tapMin } from "@/theme";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Optional count shown after the label, e.g. "Active · 28". */
  count?: number;
  testID?: string;
};

/**
 * Filter / portion chip (spec sheet): 32 dp visual inside a 48 dp tap target (C5).
 * Selected = cyan outline + cyan text + raised fill + a tick, so the state is
 * never shown by colour alone (C11).
 */
export function Chip({ label, selected, onPress, count, testID }: ChipProps) {
  const text = count === undefined ? label : `${label} · ${count}`;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={text}
      testID={testID}
      style={styles.hit}
    >
      <View style={[styles.chip, selected && styles.on]}>
        {selected && (
          <Check size={16} strokeWidth={2.5} color={colors.onAccent} />
        )}
        <Text
          variant="label"
          weight="semibold"
          tone="default"
          style={selected ? { color: colors.onAccent } : undefined}
          numeric
        >
          {text}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  hit: { minHeight: tapMin, minWidth: tapMin, justifyContent: "center" },
  chip: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  on: { backgroundColor: colors.accent },
});
