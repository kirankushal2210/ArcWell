// Client spots and billing state (D40, D41): at the limit, new invites stop (K-25) and the invite page
// says the coach isn't taking new clients (K-26); existing clients are unaffected. If billing lapses,
// there are 7 days' grace, then the coach can't invite clients or assign or edit plans until paid
// (K-27). Clients keep using their plans, chat and check-ins throughout.
import { router } from "expo-router";
import { CreditCard, Lock, Users } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { colors, radius, space } from "@/theme";

import { useCoachData } from "./CoachData";
import { sampleCoach } from "./sampleData";

export function useCoachLimits() {
  const { clients, settings } = useCoachData();
  const used = clients.filter(
    (c) => c.id !== "me" && c.status !== "completed",
  ).length;
  const limit = settings.clientLimit ?? sampleCoach.clientLimit;
  const billing = settings.billing ?? "active";
  return {
    used,
    limit,
    full: used >= limit,
    billing,
    lapsed: billing === "lapsed",
    /** Inviting is blocked: at the limit, or billing lapsed. */
    blocked: used >= limit || billing === "lapsed",
  };
}

/** K-25 or K-27: why new clients can't be added right now, with the way out. */
export function InviteBlocked({
  title,
  what = "Invites",
}: {
  title: string;
  /** What's paused, for the heading: invites, or plan editing. */
  what?: "Invites" | "Plan editing";
}) {
  const { used, limit, lapsed } = useCoachLimits();
  return (
    <MenuPage
      title={title}
      back={backTo("/coach")}
      footer={
        <Button
          label={lapsed ? "Pay with Razorpay" : "See plan and billing"}
          fullWidth
          onPress={() => router.push("/coach/menu/billing")}
        />
      }
    >
      <View style={styles.hero}>
        {lapsed ? (
          <Lock size={32} strokeWidth={1.6} color={colors.text} />
        ) : (
          <Users size={32} strokeWidth={1.6} color={colors.text} />
        )}
        <Text variant="title" style={styles.center}>
          {lapsed
            ? `${what} ${what === "Invites" ? "are" : "is"} paused until you pay`
            : `You're at your limit of ${limit} clients`}
        </Text>
        <Text tone="muted" style={styles.center}>
          {lapsed
            ? "Your Arcwell payment didn't go through. Your clients keep their plans, chat and check-ins; inviting and editing plans start again as soon as you pay."
            : `All ${used} spots are in use. Mark a finished client Completed to free a spot, or move to a bigger plan. Your current clients aren't affected.`}
        </Text>
      </View>
    </MenuPage>
  );
}

/** Plan editors call this first: while billing is lapsed they show this instead (K-27). */
export function useBillingGate(): ReactNode | null {
  const { lapsed } = useCoachLimits();
  if (!lapsed) return null;
  return <InviteBlocked title="Plans are locked" what="Plan editing" />;
}

/** Banner on Clients while payment is in grace or lapsed (K-27). */
export function BillingBanner() {
  const { billing } = useCoachLimits();
  if (billing === "active") return null;
  return (
    <PressableScale
      onPress={() => router.push("/coach/menu/billing")}
      accessibilityRole="button"
      accessibilityLabel="Fix your payment"
      style={styles.banner}
    >
      <CreditCard size={20} color={colors.warning} />
      <View style={styles.flex}>
        <Text weight="semibold">
          {billing === "grace"
            ? "Your payment didn't go through"
            : "Invites and plan edits are paused"}
        </Text>
        <Text variant="label" weight="regular" tone="muted">
          {billing === "grace"
            ? "Pay within 7 days to keep inviting and editing plans. Your clients aren't affected."
            : "Pay to start again. Your clients keep their plans, chat and check-ins."}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[3], paddingTop: space[6] },
  banner: {
    flexDirection: "row",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
  },
});
