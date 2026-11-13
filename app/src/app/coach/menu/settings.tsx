// Settings and privacy (D65, K-28): notifications (with the phone-permission pre-ask, X-07), what's public, data export and deleting the
// coach account. Deleting ends every client link at once; clients keep their history and plans
// read-only (SPEC: relationships, D42).
import { router } from "expo-router";
import { Download, Trash2 } from "lucide-react-native";
import { StyleSheet, Switch, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import type { CoachSettings } from "@/features/coach/coachProfile";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { NotifyBanner } from "@/features/system/NotifyAsk";
import { colors, space } from "@/theme";

/** The on/off settings (billing and the client limit are set elsewhere). */
type ToggleKey = Exclude<
  keyof CoachSettings,
  "billing" | "clientLimit" | "tipsSeen" | "export"
>;

const NOTIFY: { key: ToggleKey; label: string; sub: string }[] = [
  {
    key: "checkIns",
    label: "Check-ins",
    sub: "When a client submits or is overdue",
  },
  { key: "messages", label: "Messages", sub: "New messages from clients" },
  {
    key: "followUps",
    label: "Lead follow-ups",
    sub: "On the day a follow-up is due",
  },
  {
    key: "renewals",
    label: "Renewals and payments",
    sub: "Three days before a client renews",
  },
];

export default function SettingsScreen() {
  const { settings, saveSettings } = useCoachData();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/menu");
  const toggle = (k: ToggleKey) =>
    saveSettings({ ...settings, [k]: !settings[k] });
  const row = (k: ToggleKey, label: string, sub: string, first: boolean) => (
    <GroupRow key={k} first={first}>
      <View style={styles.flex}>
        <Text weight="medium">{label}</Text>
        <Text variant="label" weight="regular" tone="muted">
          {sub}
        </Text>
      </View>
      <Switch
        value={!!settings[k]}
        onValueChange={() => toggle(k)}
        trackColor={{ true: colors.brand, false: colors.surfaceRaised }}
        thumbColor={colors.surface}
        accessibilityLabel={label}
      />
    </GroupRow>
  );

  return (
    <View style={styles.root}>
      <PageHeader title="Settings and privacy" onBack={back} />
      <Page>
        <Eyebrow>Notifications</Eyebrow>
        <NotifyBanner audience="coach" />
        <Group>
          {NOTIFY.map((n, i) => row(n.key, n.label, n.sub, i === 0))}
        </Group>

        <Eyebrow>Privacy</Eyebrow>
        <Group>
          {row(
            "showTransformations",
            "Show transformations",
            "On your profile and invite page, only photos clients approved",
            true,
          )}
        </Group>
        <Text variant="caption" tone="muted">
          You see a client&apos;s data only while they&apos;re linked to you,
          and only from the day they joined unless they share earlier history.
          Enhanced-athlete records are visible only to you and that client.
        </Text>

        <Eyebrow>Your data</Eyebrow>
        <Button
          label="Export my data"
          icon={Download}
          variant="secondary"
          fullWidth
          onPress={() => router.push("/coach/menu/export")}
        />
        <Button
          label="Delete coach account"
          icon={Trash2}
          variant="ghost"
          fullWidth
          onPress={() => router.push("/coach/menu/delete-account")}
        />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
});
