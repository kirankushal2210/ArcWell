// Connect a device (D60): Arcwell reads sleep, heart rate, HRV, breathing rate, oxygen and steps
// from Android Health Connect, where WHOOP, Fitbit, Oura, Garmin, Samsung and Pixel watches can
// write them. Read-only, on the phone; disconnect any time. Without a device, recovery comes from
// the morning check-in. SAMPLE BUILD: Health Connect needs a development build, so connecting here
// simulates the device's data.
import { router } from "expo-router";
import { Check, ShieldCheck, Watch } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { plusOnly } from "@/features/athlete/PlusOnly";
import { Button, PressableScale, Text } from "@/components/primitives";
import { DEVICE_LABEL, type DeviceBrand } from "@/features/athlete/recovery";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

const BRANDS = Object.keys(DEVICE_LABEL) as DeviceBrand[];
const READS = [
  "Sleep and sleep stages",
  "Resting heart rate and HRV",
  "Breathing rate, blood oxygen, skin temperature",
  "Steps and workouts",
];

export default plusOnly(Connect);

function Connect() {
  const r = useRecovery();
  const insets = useSafeAreaInsets();
  const [brand, setBrand] = useState<DeviceBrand | null>(
    r.store.device?.brand ?? r.pendingDevice ?? null,
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;
  const device = r.store.device;

  return (
    <View style={styles.root}>
      <PageHeader
        title={device ? "Your device" : "Connect a device"}
        onBack={back}
      />
      <Page>
        {device ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Watch size={24} color={colors.text} />
              <View style={styles.flex}>
                <Text weight="semibold">{DEVICE_LABEL[device.brand]}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  Connected through Health Connect · syncs when you open Arcwell
                </Text>
              </View>
              <Check size={20} color={colors.success} />
            </View>
          </View>
        ) : (
          <>
            <Text tone="muted">
              Arcwell reads your tracker&apos;s data from Health Connect on your
              phone. Pick yours; we&apos;ll show what to allow.
            </Text>
            <View style={styles.card}>
              {BRANDS.map((b, i) => {
                const on = brand === b;
                return (
                  <PressableScale
                    key={b}
                    onPress={() => setBrand(b)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.row, styles.choice, i > 0 && styles.line]}
                  >
                    <Text weight="medium" style={styles.flex}>
                      {DEVICE_LABEL[b]}
                    </Text>
                    {on ? (
                      <Check size={20} strokeWidth={2.5} color={colors.text} />
                    ) : null}
                  </PressableScale>
                );
              })}
            </View>
          </>
        )}

        <Eyebrow>What Arcwell reads</Eyebrow>
        <View style={styles.card}>
          {READS.map((x) => (
            <Text key={x}>· {x}</Text>
          ))}
        </View>
        <View style={styles.row}>
          <ShieldCheck size={20} color={colors.text} />
          <Text
            variant="label"
            weight="regular"
            tone="muted"
            style={styles.flex}
          >
            Read-only. Arcwell never writes to your tracker, and you can turn
            access off any time in Health Connect.
            {r.coached
              ? ` ${r.coachName} sees your scores, not raw heart data.`
              : ""}
          </Text>
        </View>
        {brand && !device && (brand === "whoop" || brand === "other") ? (
          <Text variant="caption" tone="muted">
            {brand === "whoop"
              ? "In the WHOOP app, turn on Health Connect sharing first. A direct WHOOP connection is coming."
              : "Any watch or ring that shares sleep and heart data with Health Connect works."}
          </Text>
        ) : null}
        <Text variant="caption" tone="muted">
          Sample build: connecting simulates your device&apos;s data, because
          Health Connect needs the full Android app.
        </Text>
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {device ? (
          <Button
            label="Disconnect"
            variant="secondary"
            fullWidth
            onPress={() =>
              Alert.alert(
                `Disconnect ${DEVICE_LABEL[device.brand]}?`,
                "Your scores go back to the morning check-in. Past days keep their numbers.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: () => r.disconnectDevice(r.id),
                  },
                ],
              )
            }
          />
        ) : (
          <Button
            label={brand ? `Connect with Health Connect` : "Pick your device"}
            disabled={!brand}
            fullWidth
            onPress={() => {
              if (!brand) return;
              r.connectDevice(r.id, brand);
              back();
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  choice: { minHeight: 48 },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
