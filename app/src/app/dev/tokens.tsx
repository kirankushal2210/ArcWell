// dev/tokens: live check of the theme against docs/design/phase-1-artboard.html (Phase 1).
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  borderWidth,
  colors,
  fontFamilyFor,
  letterSpacingFor,
  radius,
  rhythm,
  space,
  tabularNums,
  trackingCapsEm,
  typography,
  type ColorRole,
  type TypeRole,
} from "@/theme";

const swatches: { role: ColorRole; name: string; use: string }[] = [
  { role: "bg", name: "Background", use: "App background" },
  { role: "surface", name: "Surface", use: "Cards, sheets" },
  { role: "surfaceRaised", name: "Raised", use: "Inputs, pressed" },
  { role: "brand", name: "Electric blue", use: "Primary actions" },
  { role: "success", name: "Success", use: "Status only" },
  { role: "danger", name: "Danger", use: "Destructive, errors" },
];

const supporting: { role: ColorRole; name: string }[] = [
  { role: "text", name: "Text" },
  { role: "textMuted", name: "Muted" },
  { role: "accent", name: "Cyan" },
  { role: "nutrition", name: "Nutrition" },
  { role: "recovery", name: "Recovery" },
  { role: "warning", name: "Warning" },
  { role: "borderStrong", name: "Outline" },
];

const typeRows: {
  role: TypeRole;
  token: string;
  meta: string;
  sample: string;
}[] = [
  {
    role: "display",
    token: "2xl",
    meta: "32 / 40 · Bold",
    sample: "73.8 kg this week",
  },
  {
    role: "title",
    token: "xl",
    meta: "22 / 28 · Semibold",
    sample: "Check-ins",
  },
  {
    role: "heading",
    token: "lg",
    meta: "18 / 24 · Semibold",
    sample: "Priya Sharma · Week 3",
  },
  {
    role: "body",
    token: "base",
    meta: "16 / 24 · Regular",
    sample: "Weekend wedding — overate on Saturday.",
  },
  {
    role: "label",
    token: "sm",
    meta: "14 / 20 · Medium",
    sample: "Send feedback",
  },
  {
    role: "caption",
    token: "xs",
    meta: "12 / 16 · Regular",
    sample: "Submitted 2 h ago",
  },
];

const spaceSteps = [1, 2, 3, 4, 6, 8, 12] as const;
const radiusSteps = ["sm", "md", "lg", "full"] as const;

export default function TokensScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + rhythm.betweenGroups,
          paddingBottom: insets.bottom + rhythm.sectionBreak,
        },
      ]}
    >
      <View style={styles.head}>
        <Text style={styles.eyebrow}>DEV · PHASE 1</Text>
        <Text style={[typography.display, styles.text]}>Theme tokens</Text>
        <Text style={[typography.body, styles.muted]}>
          Rendered from app/src/theme, which mirrors theme-tokens.css (D47).
        </Text>
      </View>

      <Section index="01" title="Colour">
        <View style={styles.swatchGrid}>
          {swatches.map((s) => (
            <View key={s.role} style={styles.swatch}>
              <View
                style={[styles.chip, { backgroundColor: colors[s.role] }]}
              />
              <View style={styles.swatchText}>
                <Text style={[typography.label, styles.text]}>{s.name}</Text>
                <Text style={[typography.caption, styles.muted, tabularNums]}>
                  {colors[s.role]} · {s.use}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.pillRow}>
          {supporting.map((s) => (
            <View key={s.role} style={styles.pill}>
              <View style={[styles.dot, { backgroundColor: colors[s.role] }]} />
              <Text style={[typography.caption, styles.muted]}>
                {s.name} {colors[s.role]}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section index="02" title="Typography">
        {typeRows.map((t) => (
          <View key={t.role} style={styles.typeRow}>
            <Text style={[typography[t.role], styles.text, tabularNums]}>
              {t.sample}
            </Text>
            <Text style={[typography.caption, styles.muted]}>
              text-{t.token} · {t.meta} · {t.role}
            </Text>
          </View>
        ))}
      </Section>

      <Section index="03" title="Spacing">
        <View style={styles.inGroup}>
          {spaceSteps.map((step) => (
            <View key={step} style={styles.spaceRow}>
              <Text
                style={[
                  typography.caption,
                  styles.muted,
                  tabularNums,
                  styles.spaceLabel,
                ]}
              >
                space-{step} · {space[step]}
              </Text>
              <View style={[styles.spaceBar, { width: space[step] }]} />
            </View>
          ))}
        </View>
      </Section>

      <Section index="04" title="Radius">
        <View style={styles.radiusRow}>
          {radiusSteps.map((r) => (
            <View key={r} style={styles.radiusItem}>
              <View style={[styles.radiusBox, { borderRadius: radius[r] }]} />
              <Text style={[typography.caption, styles.muted, tabularNums]}>
                {r} · {r === "full" ? "full" : radius[r]}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={[typography.caption, styles.muted, tabularNums]}>
          {index}
        </Text>
        <Text style={[typography.title, styles.text]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: rhythm.gutter, gap: rhythm.section },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  head: { gap: rhythm.inGroup },
  eyebrow: {
    fontFamily: fontFamilyFor("semibold"),
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    letterSpacing: letterSpacingFor("xs", trackingCapsEm),
    color: colors.textMuted,
  },
  section: { gap: rhythm.betweenGroups },
  sectionHead: { gap: space[1] },
  swatchGrid: { flexDirection: "row", flexWrap: "wrap", gap: rhythm.cardPad },
  swatch: { width: "47%", gap: space[3] },
  chip: {
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    borderWidth,
    borderColor: colors.border,
  },
  swatchText: { gap: space[1] },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: rhythm.inline },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rhythm.inline,
    paddingVertical: space[1],
    paddingLeft: space[1],
    paddingRight: space[3],
    borderRadius: radius.full,
    borderWidth,
    borderColor: colors.border,
  },
  dot: {
    width: space[6] - space[1],
    height: space[6] - space[1],
    borderRadius: radius.full,
  },
  typeRow: {
    gap: space[1],
    paddingBottom: rhythm.cardPad,
    borderBottomWidth: borderWidth,
    borderBottomColor: colors.border,
  },
  inGroup: { gap: rhythm.inGroup },
  spaceRow: { flexDirection: "row", alignItems: "center", gap: rhythm.cardPad },
  spaceLabel: { width: space[12] * 2 + space[6] },
  spaceBar: {
    height: space[4],
    backgroundColor: colors.brand,
    borderRadius: radius.sm,
  },
  radiusRow: { flexDirection: "row", flexWrap: "wrap", gap: rhythm.cardPad },
  radiusItem: { gap: space[2] },
  radiusBox: {
    width: space[12] + space[6],
    height: space[12] + space[6],
    backgroundColor: colors.surfaceRaised,
    borderWidth,
    borderColor: colors.borderStrong,
  },
});
