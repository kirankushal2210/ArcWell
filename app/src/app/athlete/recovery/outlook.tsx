// Daily outlook (D60): a short morning note from the day's numbers, written by rules (never AI, so
// coached athletes see it too): how hard to go, today's strain target, tonight's bedtime, and what
// to do about it.
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import {
  outlookFor,
  plannerFor,
  suggestFor,
  todayDate,
} from "@/features/athlete/recovery";
import {
  sourceText,
  useRecovery,
  ZoneDot,
} from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function Outlook() {
  const p = useLocalSearchParams<{ date?: string }>();
  const r = useRecovery();
  const [today] = useState(todayDate);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;
  const date = p.date ?? today;
  const day = r.day(date);
  const bed = plannerFor(day, r.baseline, "peak").bed;
  const o = outlookFor(day, date === today ? r.planned : null, bed);
  const strength = day.strain.items.some((i) => i.kind === "workout");

  return (
    <View style={styles.root}>
      <PageHeader title="Your daily outlook" onBack={back} />
      <Page>
        <View style={styles.head}>
          <ZoneDot zone={day.recovery.zone} />
          <Text variant="title">{o.title}</Text>
        </View>
        <View style={styles.card}>
          {o.lines.map((l) => (
            <Text key={l}>{l}</Text>
          ))}
        </View>
        <Text variant="caption" tone="muted">
          {sourceText(day.source, r.store.device?.brand)}. Written from your
          numbers each morning.
        </Text>
        <Eyebrow>Do today</Eyebrow>
        {suggestFor(day, strength).map((x) => (
          <PressableScale
            key={x.id}
            onPress={() =>
              router.push({
                pathname: "/athlete/recovery/protocol/[id]",
                params: { id: x.id },
              })
            }
            accessibilityRole="button"
            style={styles.row}
          >
            <View style={styles.flex}>
              <Text weight="semibold">{x.title}</Text>
              <Text variant="label" weight="regular" tone="muted">
                {x.summary}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </PressableScale>
        ))}
        {r.coached && r.me.protocol?.note ? (
          <View style={styles.card}>
            <Text variant="label" tone="muted">
              From {r.coachName}
            </Text>
            <Text>{r.me.protocol.note}</Text>
          </View>
        ) : null}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
