// Export my data for coaches (K-21, X-09, X-10): profile, templates, leads, client accounts, notes and
// messages, emailed as a download link. One export at a time. Sample build: the request is recorded on
// the phone; the real one runs in an Edge Function.
import { router } from "expo-router";
import { Loader } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import {
  backTo,
  Bullets,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import { KeyValues } from "@/features/coach/parts";
import { colors, space } from "@/theme";

const INCLUDED = [
  "Your profile and services",
  "Templates, meal plans and supplement stacks",
  "Leads, calls and follow-ups",
  "Client accounts and payments you recorded",
  "Your private notes and messages",
];

export default function CoachExport() {
  const { settings, saveSettings } = useCoachData();
  const back = backTo("/coach/menu/settings");
  const ex = settings.export;
  const request = () =>
    saveSettings({
      ...settings,
      export: {
        status: "preparing",
        requestedAt: new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    });

  if (ex?.status === "preparing")
    return (
      <MenuPage title="Export my data" back={back}>
        <View style={styles.hero}>
          <Loader size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            We&apos;re preparing your export
          </Text>
          <Text tone="muted" style={styles.center}>
            We&apos;ll email you a download link when it&apos;s ready. You can
            close Arcwell; this keeps going.
          </Text>
        </View>
        <KeyValues
          rows={[
            ["Requested", ex.requestedAt],
            ["Sent to", "Your sign-in email"],
          ]}
        />
      </MenuPage>
    );

  if (ex?.status === "failed")
    return (
      <MenuPage
        title="Export my data"
        back={back}
        footer={
          <View style={styles.buttons}>
            <Button label="Try again" fullWidth onPress={request} />
            <Button
              label="Contact support"
              variant="ghost"
              fullWidth
              onPress={() => router.push("/coach/menu/help")}
            />
          </View>
        }
      >
        <InfoCard title="Your export didn't finish">
          Nothing was lost. Please try again. If it keeps happening, contact
          support and we&apos;ll send it to you.
        </InfoCard>
      </MenuPage>
    );

  return (
    <MenuPage
      title="Export my data"
      back={back}
      footer={<Button label="Request export" fullWidth onPress={request} />}
    >
      <Text tone="muted">
        A copy of everything you keep in Arcwell as a coach.
      </Text>
      <InfoCard title="Included">
        <Bullets items={INCLUDED} />
      </InfoCard>
      <InfoCard>
        Your clients&apos; own logs belong to them; they export those from their
        app.
      </InfoCard>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[2], paddingVertical: space[6] },
  buttons: { gap: space[1] },
});
