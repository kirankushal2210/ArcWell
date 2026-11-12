// Stress (D60): today's level on a 0–3 scale, from the device's heart data when connected, else from
// the morning check-in. The way down is one tap away: a guided two-minute breathing session.
import { router, useLocalSearchParams } from "expo-router";
import { Wind } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { daysBack, PROTOCOLS, todayDate } from "@/features/athlete/recovery";
import {
  Ring,
  sourceText,
  useRecovery,
} from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import {
  Bars,
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function Stress() {
  const p = useLocalSearchParams<{ date?: string }>();
  const r = useRecovery();
  const [today] = useState(todayDate);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;
  const date = p.date ?? today;
  const day = r.day(date);
  const week = daysBack(r.inputs, date, 7);
  const s = day.stress;
  const text =
    s.label === "High"
      ? "Your body is under a lot of stress today. Two minutes of slow breathing helps, and so does an easier session."
      : s.label === "Medium"
        ? "Some stress, which is normal on a busy day. A short walk or breathing break keeps it in check."
        : "Stress is low. A good day to train as planned.";

  return (
    <View style={styles.root}>
      <PageHeader title="Stress" onBack={back} />
      <Page>
        <View style={styles.hero}>
          <Ring
            share={s.value / 3}
            value={s.value.toFixed(1)}
            size={150}
            stroke={12}
          />
          <Text variant="title">{s.label}</Text>
          <Text variant="label" weight="regular" tone="muted">
            {sourceText(day.source, r.store.device?.brand)} · 0 calm, 3 high
          </Text>
        </View>
        <View style={styles.card}>
          <Text>{text}</Text>
          <Button
            label="Breathe for 2 minutes"
            icon={Wind}
            fullWidth
            onPress={() =>
              router.push({
                pathname: "/athlete/recovery/breathe",
                params: { date },
              })
            }
          />
        </View>
        <View style={styles.card}>
          <Text weight="semibold">Last 7 days</Text>
          <Bars
            values={week.map((d) => d.stress.value)}
            labels={week.map((d) => d.date.slice(8))}
          />
        </View>
        <Eyebrow>Ways to bring it down</Eyebrow>
        <Group>
          {PROTOCOLS.filter(
            (x) => x.category === "Stress" || x.id === "walk",
          ).map((x, i) => (
            <GroupRow
              key={x.id}
              first={i === 0}
              label={x.title}
              onPress={() =>
                router.push({
                  pathname: "/athlete/recovery/protocol/[id]",
                  params: { id: x.id },
                })
              }
            >
              <View style={styles.flex}>
                <Text weight="medium">{x.title}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {x.summary}
                </Text>
              </View>
            </GroupRow>
          ))}
        </Group>
        <Text variant="caption" tone="muted">
          Stress here is a training guide, not a medical measure. If you often
          feel overwhelmed, talk to a doctor or someone you trust.
        </Text>
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  hero: { alignItems: "center", gap: space[2], paddingVertical: space[2] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
