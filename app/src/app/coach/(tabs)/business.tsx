// Business tab (K-10, K-14): invite link and client spots, then leads.
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { Copy, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Share, StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { sampleCoach } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

export default function BusinessTab() {
  const { clients, leads } = useCoachData();
  const auth = useAuth();
  const [copied, setCopied] = useState(false);
  const used = clients.filter((c) => c.status !== "completed").length;
  const { link, clientLimit } = sampleCoach;
  const message = `Join my coaching on Arcwell: your plans, check-ins and chat in one app. ${link}`;

  return (
    <View style={styles.root}>
      <PageHeader title="Business" />
      <Page>
        <View style={styles.card}>
          <Text variant="eyebrow" tone="muted">
            Your invite link
          </Text>
          <View style={styles.link}>
            <Text weight="medium" numberOfLines={1}>
              {link}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                label={copied ? "Copied" : "Copy"}
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
                label="Share"
                icon={Share2}
                fullWidth
                onPress={() => Share.share({ message })}
              />
            </View>
          </View>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {used} of {clientLimit} client spots used
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round((used / clientLimit) * 100)}%` },
              ]}
            />
          </View>
        </View>

        <Button
          label="Preview your link as a new client"
          variant="ghost"
          fullWidth
          onPress={() => router.push("/join/coach")}
        />

        {auth.session ? (
          <Button
            label="Sign out"
            variant="ghost"
            fullWidth
            onPress={() =>
              Alert.alert(
                "Sign out?",
                "Your clients and plans stay on this phone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign out",
                    onPress: () => {
                      auth.signOut().finally(() => {
                        if (router.canDismiss()) router.dismissAll();
                        router.replace("/");
                      });
                    },
                  },
                ],
              )
            }
          />
        ) : null}
        <Eyebrow>Leads</Eyebrow>
        <Group>
          {leads.map((l, i) => (
            <GroupRow key={l.id} first={i === 0}>
              <Avatar name={l.name} />
              <View style={styles.flex}>
                <Text weight="semibold">{l.name}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {l.source}
                </Text>
              </View>
              <Text variant="label" tone="muted">
                {l.status}
              </Text>
            </GroupRow>
          ))}
        </Group>
        <Text variant="caption" tone="muted">
          Leads are people you&apos;re talking to outside Arcwell. Send them
          your link when they&apos;re ready.
        </Text>
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", gap: space[2] },
  card: {
    gap: space[3],
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
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: 6, backgroundColor: colors.brand },
});
