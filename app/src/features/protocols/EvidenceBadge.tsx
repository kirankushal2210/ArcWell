// Evidence level badge (D69, D74): every habit shows how strong the research behind it is.
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { type Evidence, EVIDENCE_LABEL } from "@/features/science/habits";
import { colors, radius, space } from "@/theme";

const TONE: Record<Evidence, { bg: string; fg: string }> = {
  strong: { bg: colors.surfaceRaised, fg: colors.success },
  moderate: { bg: colors.surfaceRaised, fg: colors.recovery },
  early: { bg: colors.surfaceRaised, fg: colors.warning },
  practice: { bg: colors.surfaceRaised, fg: colors.textMuted },
};

export function EvidenceBadge({ level }: { level: Evidence }) {
  const t = TONE[level];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text variant="caption" weight="semibold" style={{ color: t.fg }}>
        {EVIDENCE_LABEL[level]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: space[1] + space[1] / 2,
    paddingVertical: space[1] / 2,
    borderRadius: radius.sm,
  },
});
