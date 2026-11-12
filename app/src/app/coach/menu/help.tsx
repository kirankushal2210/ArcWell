// Help and support (D65): common questions, how to reach us, and the coach agreement (CO-03).
import { router } from "expo-router";
import { ChevronDown, ChevronUp, Mail } from "lucide-react-native";
import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

const FAQ: { q: string; a: string }[] = [
  {
    q: "How do clients join me?",
    a: "Share your invite link from the QR button on Business. New people answer the onboarding and appear under Needs a plan. For someone you've already spoken to, use Add a client: build their plans first, then send their personal invite.",
  },
  {
    q: "What happens when a client leaves?",
    a: "Your access ends at once. They keep all their history and your plan, read-only. Nothing is deleted.",
  },
  {
    q: "Do clients pay me through Arcwell?",
    a: "No. Payments between you and your clients happen outside the app. Record packages, fees and renewals in Business → Clients so you always know who's due.",
  },
  {
    q: "Can I see a client's data from before they joined?",
    a: "Only if they choose to share it. By default you see everything from the day they joined.",
  },
  {
    q: "What's the Enhanced section?",
    a: "For competitive bodybuilders who opt in, it records what they report taking, bloodwork, blood pressure and side effects, with alerts when a marker drifts. It never suggests compounds or doses. Encourage every enhanced client to work with a doctor.",
  },
  {
    q: "Do my clients see AI?",
    a: "No. Coached clients never see AI features in Arcwell.",
  },
];

const AGREEMENT = [
  "Use client data only for coaching them.",
  "Ask before sharing a client's photos, and respect a no.",
  "When a client leaves, let them go; their data stays theirs.",
  "Don't give medical advice. Refer clients to a doctor for medical questions, including anything about PEDs.",
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/menu");
  return (
    <View style={styles.root}>
      <PageHeader title="Help and support" onBack={back} />
      <Page>
        <Eyebrow>Common questions</Eyebrow>
        <View style={styles.card}>
          {FAQ.map((f, i) => {
            const on = open === i;
            const Icon = on ? ChevronUp : ChevronDown;
            return (
              <View key={f.q} style={[styles.item, i > 0 && styles.line]}>
                <PressableScale
                  onPress={() => setOpen(on ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: on }}
                  accessibilityLabel={f.q}
                  style={styles.q}
                >
                  <Text weight="medium" style={styles.flex}>
                    {f.q}
                  </Text>
                  <Icon size={18} color={colors.textMuted} />
                </PressableScale>
                {on ? <Text tone="muted">{f.a}</Text> : null}
              </View>
            );
          })}
        </View>

        <Eyebrow>Contact us</Eyebrow>
        <Button
          label="Email support"
          icon={Mail}
          variant="secondary"
          fullWidth
          onPress={() =>
            Linking.openURL(
              "mailto:support@arcwell.app?subject=Coach%20help",
            ).catch(() => {})
          }
        />
        <Text variant="caption" tone="muted">
          We reply within one working day.
        </Text>

        <Eyebrow>Coach agreement</Eyebrow>
        <View style={styles.card}>
          {AGREEMENT.map((a, i) => (
            <View key={a} style={styles.point}>
              <Text weight="semibold" numeric style={styles.no}>
                {i + 1}
              </Text>
              <Text style={styles.flex}>{a}</Text>
            </View>
          ))}
        </View>
        <Text variant="caption" tone="muted">
          You agreed to these when you set up coaching. The full Terms and
          Privacy Policy are on arcwell.app.
        </Text>
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  item: { gap: space[2], paddingVertical: space[1] },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: space[3],
  },
  q: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 44,
  },
  point: { flexDirection: "row", gap: space[3] },
  no: { width: 20 },
});
