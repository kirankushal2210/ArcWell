// Notifications permission (X-07, X-08; N-06): explain first, then ask Android. If it was turned off,
// say so and offer phone settings. Never asked out of the blue.
import * as Notifications from "expo-notifications";
import { BellRing } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { Sheet } from "@/features/athlete/Sheet";
import { colors, radius, space } from "@/theme";

type Status = "granted" | "denied" | "undetermined";

export function useNotifyPermission() {
  const [status, setStatus] = useState<Status>("undetermined");
  useEffect(() => {
    if (Platform.OS === "web") return;
    Notifications.getPermissionsAsync()
      .then((p) =>
        setStatus(
          p.granted ? "granted" : p.canAskAgain ? "undetermined" : "denied",
        ),
      )
      .catch(() => {});
  }, []);
  const request = async () => {
    // Web preview: there's no system dialog, so treat Allow as granted.
    if (Platform.OS === "web") return setStatus("granted");
    const p = await Notifications.requestPermissionsAsync().catch(() => null);
    setStatus(p?.granted ? "granted" : "denied");
  };
  return { status, request };
}

/** A card on Notifications and Reminders while phone notifications aren't on. */
export function NotifyBanner() {
  const { status, request } = useNotifyPermission();
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
          {status === "denied"
            ? "Reminders and messages won't reach you. Turn them on in your phone's settings."
            : "So your reminders, coach messages and check-in replies reach you, even with the app closed."}
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
        sub="Arcwell only sends what you've turned on: reminders, your coach's messages and replies, and plan updates. Change them any time."
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
