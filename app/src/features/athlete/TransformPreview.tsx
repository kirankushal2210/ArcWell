// Before and after preview for transformation photos (F9-03, F9-05), with the athlete's choices
// applied: face blur over the head area, full-body or waist-up crop, caption, and the Arcwell credit
// (branding stays on every export in v1, D45). Sample build: the blur is a fixed band over the top
// of the photo; the real export burns a face-detected, hand-adjustable blur into the image (F9-04).
import { Image } from "expo-image";
import { User } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { GlassSurface } from "@/components/GlassSurface";
import { Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import type { Transformation } from "./athleteData";

function Shot({
  uri,
  label,
  blur,
  crop,
}: {
  uri?: string;
  label: string;
  blur: boolean;
  crop: Transformation["crop"];
}) {
  return (
    <View style={styles.shot}>
      <View
        style={[styles.frame, { aspectRatio: crop === "waist" ? 1 : 3 / 4 }]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.fill}
            contentFit="cover"
            contentPosition="top"
            accessibilityLabel={`${label} photo`}
          />
        ) : (
          <View style={styles.empty}>
            <User size={28} color={colors.textMuted} />
          </View>
        )}
        {blur ? (
          <GlassSurface style={styles.blur}>
            <View>
              <Text variant="caption" weight="semibold">
                Face blurred
              </Text>
            </View>
          </GlassSurface>
        ) : null}
      </View>
      <Text variant="caption" weight="semibold" style={styles.center}>
        {label}
      </Text>
    </View>
  );
}

export function TransformPreview({
  t,
  name,
}: {
  t: Transformation;
  /** The athlete's first name, shown only if they chose to show it. */
  name?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Shot
          uri={t.before.uri}
          label={t.before.label}
          blur={t.blurFace}
          crop={t.crop}
        />
        <Shot
          uri={t.after.uri}
          label={t.after.label}
          blur={t.blurFace}
          crop={t.crop}
        />
      </View>
      {t.caption ? <Text weight="semibold">{t.caption}</Text> : null}
      <Text variant="caption" tone="muted">
        {t.showName && name ? `${name} · ` : ""}Coached by {t.coachName} ·
        Arcwell
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", gap: space[2] },
  shot: { flex: 1, gap: space[1] },
  frame: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  fill: { width: "100%", height: "100%" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  blur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "26%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  center: { textAlign: "center" },
});
