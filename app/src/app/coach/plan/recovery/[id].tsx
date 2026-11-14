// Recovery protocol builder (D56, extends D31): sleep target, bed and wake window, rest days and a
// note for the client. No stretching or mobility routines in v1 (SPEC: Recovery).
import { router, useLocalSearchParams } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  NumberStepper,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import {
  clock,
  defaultProtocol,
  type RecoveryProtocol,
  WEEKDAYS,
} from "@/features/coach/plans";
import { DayPicker } from "@/features/onboarding/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";
import { useBillingGate } from "@/features/coach/limits";
import { NotFound } from "@/features/system/SystemStates";

function TimeStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.flex}>{label}</Text>
      <View
        style={styles.time}
        accessible
        accessibilityLabel={`${label}, ${clock(value)}`}
      >
        <IconButton
          icon={Minus}
          variant="filled"
          accessibilityLabel={`${label} 30 minutes earlier`}
          onPress={() => onChange(value - 30)}
        />
        <Text weight="semibold" numeric style={styles.timeText}>
          {clock(value)}
        </Text>
        <IconButton
          icon={Plus}
          variant="filled"
          accessibilityLabel={`${label} 30 minutes later`}
          onPress={() => onChange(value + 30)}
        />
      </View>
    </View>
  );
}

function RecoveryBuilderEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, saveProtocol } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const [r, setR] = useState<RecoveryProtocol>(
    () =>
      c?.protocol ?? {
        ...defaultProtocol(),
        sleepH: c?.recovery.sleepTargetH ?? 7.5,
      },
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <NotFound title="Recovery" what="client" onBack={back} />;

  const span = (r.wake + 1440 - (r.bed % 1440)) % 1440;
  const trainingDays = 7 - r.restDays.length;
  const programDays = c.program?.days.length;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title={`Recovery · ${c.name.split(" ")[0]}`} onBack={back} />
      <Page>
        <Eyebrow>Sleep</Eyebrow>
        <View style={styles.row}>
          <Text style={styles.flex}>Sleep target</Text>
          <NumberStepper
            value={r.sleepH}
            onChange={(v) => setR((x) => ({ ...x, sleepH: v }))}
            step={0.5}
            decimals={1}
            min={5}
            max={10}
            unit="h"
            accessibilityLabel="Sleep target"
          />
        </View>
        <TimeStepper
          label="In bed by"
          value={r.bed}
          onChange={(v) => setR((x) => ({ ...x, bed: v }))}
        />
        <TimeStepper
          label="Wake at"
          value={r.wake}
          onChange={(v) => setR((x) => ({ ...x, wake: v }))}
        />
        <Text
          variant="caption"
          tone={span / 60 < r.sleepH ? "warning" : "muted"}
          numeric
        >
          That window is {(span / 60).toFixed(1)} h
          {span / 60 < r.sleepH
            ? `, shorter than the ${r.sleepH} h target.`
            : "."}
        </Text>

        <Eyebrow>Rest days</Eyebrow>
        <DayPicker
          selected={r.restDays}
          onToggle={(d) =>
            setR((x) => ({
              ...x,
              restDays: x.restDays.includes(d)
                ? x.restDays.filter((y) => y !== d)
                : [...x.restDays, d].sort(),
            }))
          }
        />
        <Text
          variant="caption"
          tone={programDays && trainingDays < programDays ? "warning" : "muted"}
        >
          {r.restDays.length
            ? `Rest on ${r.restDays.map((d) => WEEKDAYS[d]).join(", ")}. ${trainingDays} training days a week.`
            : "No rest days picked."}
          {programDays && trainingDays < programDays
            ? ` The program has ${programDays} workouts, so they'll roll into next week.`
            : ""}
        </Text>

        <Eyebrow>{`Note for ${c.name.split(" ")[0]}`}</Eyebrow>
        <TextInput
          value={r.note}
          onChangeText={(v) => setR((x) => ({ ...x, note: v }))}
          placeholder="e.g. No screens 30 min before bed. Walk 20 min on rest days."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.note}
          accessibilityLabel="Recovery note"
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save recovery protocol"
          fullWidth
          onPress={() => {
            saveProtocol(c.id, { ...r, note: r.note.trim() });
            back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  time: { flexDirection: "row", alignItems: "center", gap: space[1] },
  timeText: { minWidth: 84, textAlign: "center" },
  note: {
    minHeight: 120,
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function RecoveryBuilder() {
  const gate = useBillingGate();
  return gate ?? <RecoveryBuilderEditor />;
}
