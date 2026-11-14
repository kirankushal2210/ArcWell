// Notifications permission (X-07, X-08; N-06): explain first, then ask Android. If it was turned off,
// say so and offer phone settings. Never asked out of the blue.
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { BellRing } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { registerPushToken } from "@/features/accounts/repo";
import { Sheet } from "@/features/athlete/Sheet";
import { accountsEnabled } from "@/lib/supabase";
import { colors, radius, space } from "@/theme";

type Status = "granted" | "denied" | "undetermined";

export function useNotifyPermission() {
  const [status, setStatus] = useState<Status>("undetermined");
  useEffect(() => {
    if (Platform.OS === "web") return;
    Notifications.getPermissionsAsync()
      .then((p) => {
        setStatus(
          p.granted ? "granted" : p.canAskAgain ? "undetermined" : "denied",
        );
        if (p.granted) void savePushToken();
      })
      .catch(() => {});
  }, []);
  const request = async () => {
    // Web preview: there's no system dialog, so treat Allow as granted.
    if (Platform.OS === "web") return setStatus("granted");
    const p = await Notifications.requestPermissionsAsync().catch(() => null);
    setStatus(p?.granted ? "granted" : "denied");
    if (p?.granted) void savePushToken();
  };
  return { status, request };
}

/**
 * With accounts, tell the server where to send this device's notifications (B5). Needs a
 * development build with an EAS project id; Expo Go and the web simply skip it.
 */
async function savePushToken() {
  if (Platform.OS === "web" || !accountsEnabled) return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    string | undefined;
  if (!projectId) return;
  const t = await Notifications.getExpoPushTokenAsync({ projectId }).catch(
    () => null,
  );
  if (t?.data)
    await registerPushToken(t.data, Platform.OS === "ios" ? "ios" : "android");
}

const COPY = {
  athlete: {
    off: "Reminders and messages won't reach you. Turn them on in your phone's settings.",
    ask: "So your reminders, coach messages and check-in replies reach you, even with the app closed.",
    sheet:
      "Arcwell only sends what you've turned on: reminders, your coach's messages and replies, and plan updates. Change them any time.",
  },
  coach: {
    off: "Check-ins and client messages won't reach you. Turn them on in your phone's settings.",
    ask: "So check-ins, client messages, follow-ups and renewals reach you, even with the app closed.",
    sheet:
      "Arcwell only sends what you've turned on below: check-ins, client messages, lead follow-ups and renewals. Change them any time.",
  },
} as const;

/**
 * A card on Notifications and Reminders (athlete) or coach Settings (X-07) while phone
 * notifications aren't on.
 */
export function NotifyBanner({
  audience = "athlete",
}: {
  audience?: "athlete" | "coach";
} = {}) {
  const { status, request } = useNotifyPermission();
  const copy = COPY[audience];
  const [asking, setAsking] = useState(false);
  if (status === "granted") return null;
  return (
    <>
      <View style={styles.card}>
        <View style={styles.row}>
          <BellRing size={20} color={colors.warning} />
          <Text weight="semibold" style={styles.flex}>
            {status === "denied"
              ? "Notifications are off for Arcwell"
              : "Turn on notifications"}
          </Text>
        </View>
        <Text variant="label" weight="regular" tone="muted">
          {status === "denied" ? copy.off : copy.ask}
        </Text>
        <Button
          label={status === "denied" ? "Open phone settings" : "Turn on"}
          size="sm"
          variant="secondary"
          onPress={() =>
            status === "denied" ? Linking.openSettings() : setAsking(true)
          }
        />
      </View>
      <Sheet
        visible={asking}
        onClose={() => setAsking(false)}
        title="Allow notifications?"
        sub={copy.sheet}
      >
        <View style={styles.buttons}>
          <Button
            label="Continue"
            fullWidth
            onPress={() => {
              setAsking(false);
              request();
            }}
          />
          <Button
            label="Not now"
            variant="ghost"
            fullWidth
            onPress={() => setAsking(false)}
          />
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1 },
  buttons: { gap: space[1], paddingTop: space[2] },
});
