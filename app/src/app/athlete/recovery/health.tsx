// Health monitor (D60): overnight resting heart rate, HRV, breathing rate, blood oxygen and skin
// temperature against the athlete's own 30-day range. Only with a connected device. A training
// guide, not a diagnosis.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import {
  DEVICE_LABEL,
  healthMetrics,
  todayDate,
} from "@/features/athlete/recovery";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function Health() {
  const p = useLocalSearchParams<{ date?: string }>();
  const r = useRecovery();
  const [today] = useState(todayDate);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;
  const metrics = healthMetrics(r.inputs, p.date ?? today);
  const device = r.store.device;

  return (
    <View style={styles.root}>
      <PageHeader title="Health monitor" onBack={back} />
      <Page>
        {metrics && device ? (
          <>
            <Text tone="muted">
              From your {DEVICE_LABEL[device.brand]} overnight, against your own
              range over the last 30 days.
            </Text>
            <View style={styles.card}>
              {metrics.map((m, i) => (
                <View key={m.label} style={[styles.row, i > 0 && styles.line]}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: m.inRange
                          ? colors.success
                          : colors.warning,
                      },
                    ]}
                  />
                  <View style={styles.flex}>
                    <Text weight="semibold">{m.label}</Text>
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      Your range {m.low} to {m.high} {m.unit}
                    </Text>
                  </View>
                  <Text weight="semibold" numeric>
                    {m.value} {m.unit.split(" ")[0]}
                  </Text>
                </View>
              ))}
            </View>
            <Text variant="caption" tone="muted">
              Several numbers outside your range for a few days can mean
              you&apos;re getting ill, run down or not sleeping enough. This
              isn&apos;t a diagnosis; see a doctor if you feel unwell.
            </Text>
          </>
        ) : (
          <View style={styles.card}>
            <Text weight="semibold">Connect a device to see this</Text>
            <Text tone="muted">
              Watches and rings measure your heart and breathing overnight.
              Without one, recovery comes from your morning check-in.
            </Text>
            <Button
              label="Connect a device"
              fullWidth
              onPress={() => router.replace("/athlete/recovery/connect")}
            />
          </View>
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 56,
  },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: space[3],
  },
  dot: { width: 10, height: 10, borderRadius: radius.full },
});
