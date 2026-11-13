// The coach's public profile (D43): photo, name, city, specialisations, a short bio that opens with
// "More", services with prices and self-reported certifications. Shown on the invite page (F3-02)
// and to the coach's own clients. Kept short so it scans in a few seconds.
import { Image } from "expo-image";
import { BadgeCheck, MapPin } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import { type CoachProfile, splitService } from "./coachProfile";
import { Eyebrow } from "./parts";

const PHOTO = 88;
/** Bios longer than this start folded to three lines. */
const BIO_FOLD = 120;

const initials = (name: string) =>
  name
    .replace(/^Coach\s+/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

/** Round coach photo, or initials when there isn't one. */
export function CoachPhoto({
  name,
  uri,
  size = PHOTO,
}: {
  name: string;
  uri?: string;
  size?: number;
}) {
  const box = { width: size, height: size, borderRadius: radius.full };
  return (
    <View
      style={[styles.photo, box]}
      accessibilityRole="image"
      accessibilityLabel={uri ? `${name}, photo` : name}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={box}
          contentFit="cover"
          accessible={false}
        />
      ) : (
        <Text variant="title" tone="muted">
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

/** A bio folded to three lines with "More" when it's long. */
export function FoldedBio({ bio }: { bio: string }) {
  const long = bio.length > BIO_FOLD;
  const [open, setOpen] = useState(false);
  if (!bio.trim()) return null;
  return (
    <View style={styles.bio}>
      <Text tone="muted" numberOfLines={long && !open ? 3 : undefined}>
        {bio}
      </Text>
      {long ? (
        <PressableScale
          onPress={() => setOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={open ? "Show less" : "Read more"}
          style={styles.more}
        >
          <Text variant="label" weight="semibold" tone="accent">
            {open ? "Less" : "More"}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

export function CoachProfileView({ coach }: { coach: CoachProfile }) {
  const meta = [
    coach.city,
    coach.years ? `${coach.years} yrs coaching` : "",
  ].filter(Boolean);
  const services = coach.services.map(splitService);
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <CoachPhoto name={coach.name} uri={coach.photo} />
        <Text variant="display" style={styles.center}>
          {coach.name}
        </Text>
        {meta.length ? (
          <View style={styles.meta}>
            {coach.city ? <MapPin size={14} color={colors.textMuted} /> : null}
            <Text variant="label" weight="regular" tone="muted">
              {meta.join(" · ")}
            </Text>
          </View>
        ) : null}
        {coach.specialisations.length ? (
          <View style={styles.tags}>
            {coach.specialisations.map((s) => (
              <View key={s} style={styles.tag}>
                <Text variant="caption" weight="semibold">
                  {s}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <FoldedBio bio={coach.bio} />

      {services.length ? (
        <View style={styles.section}>
          <Eyebrow>Services</Eyebrow>
          <View style={styles.card}>
            {services.map((s, i) => (
              <View
                key={`${s.name}-${i}`}
                style={[styles.service, i > 0 && styles.line]}
              >
                <Text weight="medium" style={styles.flex}>
                  {s.name}
                </Text>
                {s.price ? (
                  <Text weight="semibold" numeric>
                    {s.price}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {coach.certifications.trim() ? (
        <View style={styles.certs}>
          <BadgeCheck size={18} color={colors.textMuted} />
          <View style={styles.flex}>
            <Text variant="label" weight="semibold">
              {coach.certifications}
            </Text>
            <Text variant="caption" tone="muted">
              Self-reported. Arcwell doesn&apos;t check certifications.
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space[4] },
  hero: { alignItems: "center", gap: space[2] },
  photo: {
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  center: { textAlign: "center" },
  meta: { flexDirection: "row", alignItems: "center", gap: space[1] },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space[1],
  },
  tag: {
    paddingHorizontal: space[2],
    paddingVertical: space[1] / 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  bio: { gap: space[1] },
  more: { alignSelf: "flex-start", paddingVertical: space[1] },
  section: { gap: space[2] },
  card: {
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  service: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[3],
  },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  flex: { flex: 1, gap: space[1] / 2 },
  certs: { flexDirection: "row", alignItems: "flex-start", gap: space[2] },
});
