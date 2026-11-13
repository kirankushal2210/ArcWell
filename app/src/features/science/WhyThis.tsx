// "Why this?" (D69): a small link beside a target or plan that opens a sheet with the reasoning in
// plain words and the papers behind it. Every Arcwell number can be explained this way.
import { router } from "expo-router";
import { CircleHelp } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { Sheet } from "@/features/athlete/Sheet";
import { colors, space } from "@/theme";

import { shortCite, SOURCES } from "./sources";

export function WhyThis({
  title,
  points,
  sources,
  label = "Why this?",
}: {
  title: string;
  points: string[];
  sources: string[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const cited = sources.map((id) => SOURCES[id]).filter(Boolean);
  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${title}`}
        style={styles.link}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <CircleHelp size={16} color={colors.textMuted} />
        <Text variant="label" tone="muted">
          {label}
        </Text>
      </PressableScale>
      <Sheet visible={open} onClose={() => setOpen(false)} title={title}>
        <View style={styles.points}>
          {points.map((p) => (
            <Text key={p}>{p}</Text>
          ))}
        </View>
        {cited.length ? (
          <View style={styles.sources}>
            <Text variant="eyebrow" tone="muted">
              Based on
            </Text>
            {cited.map((s) => (
              <Text key={s.id} variant="label" weight="regular" tone="muted">
                {shortCite(s)}
              </Text>
            ))}
            <Text
              variant="label"
              weight="medium"
              accessibilityRole="link"
              onPress={() => {
                setOpen(false);
                router.push("/science");
              }}
            >
              All sources
            </Text>
          </View>
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: space[1] },
  points: { gap: space[2], paddingTop: space[1] },
  sources: { gap: space[1], paddingTop: space[3], paddingBottom: space[2] },
});
