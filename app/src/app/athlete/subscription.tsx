// Subscription details (F8-06), payment problem (F8-07) and cancelled: what plan you're on, when it
// renews or ends, and the way to manage it in Google Play, which handles billing and refunds (D19).
// Arcwell never cancels or charges itself. Sample build: preview states at the bottom.
import { router } from "expo-router";
import { CreditCard } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import {
  shortDay,
  type Subscription,
  subscriptionInfo,
} from "@/features/athlete/athleteData";
import {
  backTo,
  Bullets,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, KeyValues, Pills } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function SubscriptionDetails() {
  const me = useMe();
  const { meTier, settingsOf, setAthleteSettings, endPlus } = useCoachData();
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/menu/account");
  if (meTier !== "pro")
    return (
      <MenuPage
        title="Subscription"
        back={back}
        footer={
          <Button
            label="See Arcwell Plus"
            fullWidth
            onPress={() => router.push("/athlete/ai")}
          />
        }
      >
        <InfoCard title="You're on the free plan">
          Training, food logging by calories, and Physique are free for good.
          Arcwell Plus adds full macros, Recovery, Programs, Muscle Analytics
          and the AI coach.
        </InfoCard>
      </MenuPage>
    );

  const sub = subscriptionInfo(settingsOf(me.id).sub);
  const set = (status: Subscription["status"]) =>
    status === "expired"
      ? (endPlus(),
        router.replace({
          pathname: "/athlete/switch/[step]",
          params: { step: "ended" },
        }))
      : setAthleteSettings(me.id, {
          sub: {
            status,
            plan: sub.plan,
            startedAt: sub.startedAt,
          },
        });

  return (
    <MenuPage
      title="Arcwell Plus"
      sub={sub.plan === "yearly" ? "Yearly plan" : "Monthly plan"}
      back={back}
      footer={
        <Button
          label={
            sub.status === "grace"
              ? "Update payment in Play Store"
              : "Manage in Play Store"
          }
          variant={sub.status === "grace" ? "primary" : "secondary"}
          fullWidth
          onPress={() => {}}
        />
      }
    >
      {sub.status === "grace" ? (
        <View style={[styles.card, styles.warn]}>
          <View style={styles.row}>
            <CreditCard size={20} color={colors.warning} />
            <Text weight="semibold" style={styles.flex}>
              Your payment didn&apos;t go through
            </Text>
          </View>
          <Text tone="muted">
            {`Google Play couldn't charge your payment method. You keep Arcwell Plus until ${shortDay(sub.graceEnds)} while you update it; after that you move to the free plan.`}
          </Text>
        </View>
      ) : null}
      <KeyValues
        rows={[
          [
            "Status",
            sub.status === "trial"
              ? `Free trial · day ${Math.min(sub.day, 7)} of 7`
              : sub.status === "active"
                ? "Active"
                : sub.status === "grace"
                  ? "Payment problem"
                  : "Cancelled",
          ],
          sub.status === "trial"
            ? ["Trial ends", shortDay(sub.trialEnds)]
            : sub.status === "cancelled"
              ? ["Plus ends", shortDay(sub.renewsOn)]
              : ["Renews", shortDay(sub.renewsOn)],
          ["Billed by", "Google Play"],
        ]}
      />
      {sub.status === "trial" ? (
        <InfoCard>
          {`${sub.day < 5 ? "We'll remind you on day 5. " : ""}Cancel in the Play Store before ${shortDay(sub.trialEnds)} and you won't be charged.`}
        </InfoCard>
      ) : sub.status === "cancelled" ? (
        <InfoCard>
          {`You keep everything until ${shortDay(sub.renewsOn)}. Then you move to the free plan: your logs and history stay, and your AI plan stays read-only.`}
        </InfoCard>
      ) : null}
      <Eyebrow>Included</Eyebrow>
      <InfoCard>
        <Bullets
          items={[
            "Full macros: protein, carbs and fat",
            "Recovery: sleep, recovery and strain",
            "Programs and Muscle Analytics",
            "The AI coach for your plan, food and recovery",
          ]}
        />
      </InfoCard>
      <Text variant="caption" tone="muted">
        Refunds and cancellations happen in Google Play. Turning AI off in
        Privacy doesn&apos;t cancel your subscription.
      </Text>

      <Eyebrow>Sample build: preview states</Eyebrow>
      <Pills
        value={sub.status}
        onChange={set}
        options={[
          { value: "trial", label: "Trial" },
          { value: "active", label: "Active" },
          { value: "grace", label: "Payment problem" },
          { value: "cancelled", label: "Cancelled" },
          { value: "expired", label: "Ended" },
        ]}
      />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  warn: { borderWidth: 1, borderColor: colors.warning },
});
