// Add an activity (D60): anything outside a logged workout (a walk, a match, yoga) with its length
// and how hard it felt, so it counts towards the day's strain. Logged workouts count on their own.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, NumberStepper, Text } from "@/components/primitives";
import { todayDate } from "@/features/athlete/recovery";
import { Scale, TimeStepper } from "@/features/athlete/RecoveryForm";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Page, PageHeader, Pills } from "@/features/coach/parts";
import { uid } from "@/features/coach/plans";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const KINDS = ["Walk", "Run", "Cycling", "Sport", "Yoga", "Swim", "Other"];
const nowMinute = () => {
  const d = new Date();
  return Math.round((d.getHours() * 60 + d.getMinutes()) / 15) * 15;
};

export default function AddActivity() {
  const p = useLocalSearchParams<{ date?: string }>();
  const r = useRecovery();
  const insets = useSafeAreaInsets();
  const [today] = useState(todayDate);
  const [kind, setKind] = useState("Walk");
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [effort, setEffort] = useState(2);
  const [start, setStart] = useState(nowMinute);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  if (!r.me) return <NotJoined />;

  return (
    <View style={styles.root}>
      <PageHeader title="Add activity" onBack={back} />
      <Page>
        <Pills
          value={kind}
          onChange={setKind}
          options={KINDS.map((k) => ({ value: k, label: k }))}
        />
        {kind === "Other" || kind === "Sport" ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={
              kind === "Sport"
                ? "Which sport? e.g. Cricket"
                : "What did you do?"
            }
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            accessibilityLabel="Activity name"
          />
        ) : null}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text weight="semibold" style={styles.flex}>
              How long
            </Text>
            <NumberStepper
              value={minutes}
              onChange={setMinutes}
              step={5}
              min={5}
              max={300}
              unit="min"
              accessibilityLabel="Minutes"
            />
          </View>
          <TimeStepper label="Started" value={start} onChange={setStart} />
          <Scale
            label="How hard did it feel?"
            value={effort}
            onChange={setEffort}
            ends={["Easy", "All out"]}
          />
        </View>
        <Text variant="caption" tone="muted">
          Workouts you log in Training count automatically.
        </Text>
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Add activity"
          fullWidth
          onPress={() => {
            r.addActivity(r.id, {
              id: uid("a"),
              date: p.date ?? today,
              name: name.trim() || kind,
              minutes,
              effort,
              start,
            });
            back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  card: {
    gap: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
