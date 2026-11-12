// Export my data (AC-03, X-09, X-10): a copy of everything Arcwell stores, emailed as a download
// link. One export at a time. Sample build: the request is recorded on the phone; the real one runs
// in an Edge Function and emails the link.
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
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { KeyValues } from "@/features/coach/parts";
import { colors, space } from "@/theme";

const INCLUDED = [
  "Profile",
  "Workouts and sets",
  "Food logs",
  "Recovery logs",
  "Measurements and progress photos",
  "Check-ins and messages",
];

export default function ExportData() {
  const me = useMe();
  const { settingsOf, setAthleteSettings } = useCoachData();
  if (!me) return <NotJoined />;
  const ex = settingsOf(me.id).export;
  const request = () =>
    setAthleteSettings(me.id, {
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
      <MenuPage title="Export my data" back={backTo("/athlete/menu/account")}>
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
        back={backTo("/athlete/menu/account")}
        footer={
          <View style={styles.buttons}>
            <Button label="Try again" fullWidth onPress={request} />
            <Button
              label="Contact support"
              variant="ghost"
              fullWidth
              onPress={() => router.push("/athlete/menu/help")}
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
      back={backTo("/athlete/menu/account")}
      footer={<Button label="Request export" fullWidth onPress={request} />}
    >
      <Text tone="muted">
        We&apos;ll prepare a copy of everything Arcwell stores about you.
      </Text>
      <InfoCard title="Included">
        <Bullets items={INCLUDED} />
      </InfoCard>
      <InfoCard>
        When it&apos;s ready we&apos;ll email you a download link. Large exports
        can take a while.
      </InfoCard>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[2], paddingVertical: space[6] },
  buttons: { gap: space[1] },
});
