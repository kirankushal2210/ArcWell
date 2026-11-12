// First-run tips (FE-5): one short line the first time someone lands on a screen, dismissed for good
// with ×. Athlete tips are kept in their settings, coach tips in the coach's.
import { Lightbulb, X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { IconButton, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { colors, radius, space } from "@/theme";

import { useMe } from "./useMe";

export function Tip({
  id,
  text,
  coach = false,
}: {
  id: string;
  text: string;
  /** A coach-side tip (stored with the coach's settings). */
  coach?: boolean;
}) {
  const me = useMe();
  const { settings, saveSettings, settingsOf, setAthleteSettings } =
    useCoachData();
  const seen = coach
    ? (settings.tipsSeen ?? [])
    : me
      ? (settingsOf(me.id).tipsSeen ?? [])
      : [id];
  if (seen.includes(id)) return null;
  const dismiss = () =>
    coach
      ? saveSettings({ ...settings, tipsSeen: [...seen, id] })
      : me && setAthleteSettings(me.id, { tipsSeen: [...seen, id] });
  return (
    <View style={styles.tip} accessibilityRole="summary">
      <Lightbulb size={18} color={colors.training} />
      <Text variant="label" weight="regular" style={styles.flex}>
        {text}
      </Text>
      <IconButton icon={X} accessibilityLabel="Dismiss tip" onPress={dismiss} />
    </View>
  );
}

const styles = StyleSheet.create({
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingLeft: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  flex: { flex: 1 },
});
