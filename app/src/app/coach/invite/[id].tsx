// Personal invite (D56): one link and a short code for one client, carrying the plans the coach built.
// The client opens it, installs Arcwell, gives consent and lands on their plan with no onboarding.
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Copy, MessageCircle, Share2, Smartphone } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Share, StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { PlanRows } from "@/features/coach/PlanRows";
import { colors, radius, space } from "@/theme";
import { NotFound } from "@/features/system/SystemStates";

export default function Invite() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, createInvite, coachName } = useCoachData();
  const c = client(id);
  const [copied, setCopied] = useState(false);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");

  // Creating the invite once on open; reopening shows the same one until it's claimed.
  useEffect(() => {
    if (c && !c.invite) createInvite(c.id);
  }, [c, createInvite]);

  if (!c) return <NotFound title="Invite" what="invite" onBack={back} />;
  const invite = c.invite;
  const first = c.name.split(" ")[0];
  // Placeholder domain until the invite-link domain is chosen (PLAN.md blockers).
  const link = invite ? `arcwell.app/j/${invite.token}` : "…";
  const message = `Hi ${first}! Your training, nutrition and recovery plan is ready on Arcwell. Tap to join: https://${link}\nIf the link doesn't open, install Arcwell and enter code ${invite?.code ?? ""}. ${coachName}`;
  const digits = (c.phone ?? "").replace(/\D/g, "");
  const wa = digits
    ? `whatsapp://send?phone=91${digits.slice(-10)}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?text=${encodeURIComponent(message)}`;

  if (invite?.claimed)
    return (
      <View style={styles.root}>
        <PageHeader title="Invite" onBack={back} />
        <Page>
          <Text>
            {first} joined with this invite. Their plans are live in their app.
          </Text>
        </Page>
      </View>
    );

  return (
    <View style={styles.root}>
      <PageHeader title={`Invite ${first}`} onBack={back} />
      <Page>
        <View style={styles.hero}>
          <Avatar name={c.name} size={48} />
          <View style={styles.flex}>
            <Text weight="semibold">{c.name}</Text>
            <Text variant="label" weight="regular" tone="muted">
              {c.phone ? `+91 ${c.phone}` : "No phone added"} · personal invite
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="eyebrow" tone="muted">
            Invite link
          </Text>
          <View style={styles.link}>
            <Text weight="medium" numberOfLines={1}>
              {link}
            </Text>
          </View>
          <Text variant="eyebrow" tone="muted">
            Or code
          </Text>
          <Text
            variant="display"
            numeric
            accessibilityLabel={`Invite code ${invite?.code ?? ""}`}
          >
            {invite?.code ?? "…"}
          </Text>
          <Text variant="caption" tone="muted">
            Only {first} can use this, once. It expires in 14 days; you can make
            a new one any time.
          </Text>
        </View>

        <Button
          label="Send on WhatsApp"
          icon={MessageCircle}
          fullWidth
          onPress={() =>
            Linking.openURL(wa).catch(() => Share.share({ message }))
          }
        />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button
              label={copied ? "Copied" : "Copy link"}
              icon={Copy}
              variant="secondary"
              fullWidth
              onPress={async () => {
                await Clipboard.setStringAsync(`https://${link}`);
                setCopied(true);
              }}
            />
          </View>
          <View style={styles.flex}>
            <Button
              label="More"
              icon={Share2}
              variant="secondary"
              fullWidth
              onPress={() => Share.share({ message })}
            />
          </View>
        </View>

        <Eyebrow>{`What ${first} gets`}</Eyebrow>
        <PlanRows c={c} />
        <Text variant="caption" tone="muted">
          {first} skips the onboarding questions and checks the details you
          entered. You can still edit any plan after they join.
        </Text>

        <Eyebrow>Try it</Eyebrow>
        <Button
          label={`Preview as ${first}`}
          icon={Smartphone}
          variant="ghost"
          onPress={() =>
            invite &&
            router.push({
              pathname: "/join/[code]",
              params: { code: invite.token },
            })
          }
        />
        <Text variant="caption" tone="muted">
          Sample build: opens the join screen on this phone, as {first} would
          see it after tapping the link.
        </Text>
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", gap: space[2] },
  hero: { flexDirection: "row", alignItems: "center", gap: space[3] },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  link: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
});
