// Plan and billing (D65, K-13, K-25, K-27): the coach's Arcwell plan, client spots, and how
// paying works. Coaches pay through a Razorpay link outside the app (SPEC: coaches); billing
// arrives in Phase 6, so this build is the free beta.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { StatGrid } from "@/features/coach/CrmParts";
import { useCoachLimits } from "@/features/coach/limits";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import { sampleCoach } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";
import { SAMPLE_TOOLS } from "@/features/system/store";

export default function Billing() {
  const { clients, settings, saveSettings } = useCoachData();
  const { billing, full } = useCoachLimits();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/menu");
  const used = clients.filter(
    (c) => c.id !== "me" && c.status !== "completed",
  ).length;
  const limit = settings.clientLimit ?? sampleCoach.clientLimit;
  const share = Math.min(1, used / limit);

  return (
    <View style={styles.root}>
      <PageHeader title="Plan and billing" onBack={back} />
      <Page>
        <View style={styles.card}>
          <Text variant="eyebrow" tone="muted">
            Your plan
          </Text>
          <Text variant="title">Beta · free</Text>
          <Text tone="muted">
            Everything is free while Arcwell is in beta. We&apos;ll tell you a
            month before paid plans start, with the price.
          </Text>
        </View>

        {billing !== "active" ? (
          <View style={[styles.card, styles.warn]}>
            <Text variant="title">
              {billing === "grace"
                ? "Your payment didn't go through"
                : "Invites and plan edits are paused"}
            </Text>
            <Text tone="muted">
              {billing === "grace"
                ? "You have 7 days to pay before inviting and editing plans pause. Your clients aren't affected."
                : "Pay to start again. Your clients keep their plans, chat and check-ins in the meantime."}
            </Text>
          </View>
        ) : null}

        <Eyebrow>Client spots</Eyebrow>
        <View style={styles.card}>
          <View style={styles.between}>
            <Text weight="semibold" numeric>
              {used} of {limit} used
            </Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {limit - used} left
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${share * 100}%` }]} />
          </View>
          <Text variant="caption" tone="muted">
            Active, paused and leaving clients use a spot. Finished clients
            don&apos;t.
          </Text>
        </View>

        <StatGrid
          items={[
            { label: "Next bill", value: "—", sub: "Not during the beta" },
            {
              label: "Payment method",
              value: "Razorpay",
              sub: "Link by email",
            },
          ]}
        />

        <Eyebrow>How paying will work</Eyebrow>
        <Text tone="muted">
          You&apos;ll get a Razorpay link each month by email and pay outside
          the app. If a payment fails we remind you for 7 days before pausing
          new invites; your clients keep using their plans.
        </Text>
        <Button
          label="Pay with Razorpay"
          variant="secondary"
          fullWidth
          disabled
          onPress={() => {}}
        />
        <Text variant="caption" tone="muted" style={styles.center}>
          Payments switch on with billing (PLAN Phase 6).
        </Text>

        {SAMPLE_TOOLS ? (
          <>
            <Eyebrow>Sample build: preview states</Eyebrow>
            <Pills
              value={billing}
              onChange={(v) => saveSettings({ ...settings, billing: v })}
              options={[
                { value: "active", label: "Paid" },
                { value: "grace", label: "Payment failed" },
                { value: "lapsed", label: "Lapsed" },
              ]}
            />
            <Pills
              value={full ? "full" : "room"}
              onChange={(v) =>
                saveSettings({
                  ...settings,
                  clientLimit: v === "full" ? used : undefined,
                })
              }
              options={[
                { value: "room", label: `Limit ${sampleCoach.clientLimit}` },
                { value: "full", label: "At the limit" },
              ]}
            />
          </>
        ) : null}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { textAlign: "center" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  warn: { borderWidth: 1, borderColor: colors.warning },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: radius.full, backgroundColor: colors.brand },
});
