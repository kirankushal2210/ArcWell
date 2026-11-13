// One recovery protocol: what to do, why it helps, any caution, and "Done today" so it shows on the
// day (and to the coach). Breathing protocols open the guided timer.
import { router, useLocalSearchParams } from "expo-router";
import { Check, Play } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { plusOnly } from "@/features/athlete/PlusOnly";
import { Button, Text } from "@/components/primitives";
import { protocolById, todayDate } from "@/features/athlete/recovery";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

export default plusOnly(ProtocolDetail);

function ProtocolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRecovery();
  const insets = useSafeAreaInsets();
  const [today] = useState(todayDate);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  const p = protocolById(id);
  if (!r.me) return <NotJoined />;
  if (!p) return <PageHeader title="Protocol" onBack={back} />;
  const done = r.store.done.includes(`${today}:${p.id}`);

  return (
    <View style={styles.root}>
      <PageHeader
        title={p.title}
        sub={`${p.category}${p.minutes ? ` · ${p.minutes} min` : ""}`}
        onBack={back}
      />
      <Page>
        <Text>{p.summary}</Text>
        <Eyebrow>How</Eyebrow>
        <View style={styles.card}>
          {p.steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <Text weight="semibold" numeric style={styles.no}>
                {i + 1}
              </Text>
              <Text style={styles.flex}>{s}</Text>
            </View>
          ))}
        </View>
        <Eyebrow>Why it helps</Eyebrow>
        <Text tone="muted">{p.why}</Text>
        {p.caution ? (
          <View style={styles.caution}>
            <Text weight="semibold">Before you try it</Text>
            <Text tone="muted">{p.caution}</Text>
          </View>
        ) : null}
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {p.guided === "breathing" ? (
          <Button
            label="Start guided breathing"
            icon={Play}
            fullWidth
            onPress={() => router.push("/athlete/recovery/breathe")}
          />
        ) : null}
        <Button
          label={done ? "Done today" : "Mark as done today"}
          icon={done ? Check : undefined}
          variant={done || p.guided === "breathing" ? "secondary" : "primary"}
          fullWidth
          onPress={() => r.toggleProtocol(r.id, today, p.id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  step: { flexDirection: "row", gap: space[3] },
  no: { width: 20 },
  caution: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
  },
  foot: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});
