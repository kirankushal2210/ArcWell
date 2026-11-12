// Enhanced tracking, the athlete's side (D64). The coach asks; the athlete decides here, with
// exactly what is recorded and who sees it (only them and their coach). After saying yes they see
// the same record, can log blood pressure and side effects, and can stop sharing at any time.
import { router } from "expo-router";
import { Check, ShieldAlert } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button, Text } from "@/components/primitives";
import { useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { dayText, ymd } from "@/features/coach/crm";
import { LevelTag } from "@/features/coach/CrmParts";
import {
  DOCTOR_NOTE,
  enhId,
  latest,
  MARKERS,
  PHASE_LABEL,
} from "@/features/coach/enhanced";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

const WHAT = [
  "What you tell your coach you're taking, in your words",
  "Your on, off and PCT phases",
  "Blood pressure, resting heart rate and bloodwork you share",
  "Side effects you notice",
];

export default function AthleteEnhanced() {
  const me = useMe();
  const { coachName, answerEnhanced, editEnhanced } = useCoachData();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [effect, setEffect] = useState("");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete");
  const e = me?.enhanced;
  if (!me || !e?.requestedAt)
    return (
      <View style={styles.root}>
        <PageHeader title="Enhanced tracking" onBack={back} />
        <Page>
          <Text tone="muted">Your coach hasn&apos;t asked to track this.</Text>
        </Page>
      </View>
    );
  const today = ymd(new Date());
  const note = (
    <View style={styles.note}>
      <ShieldAlert size={20} color={colors.text} />
      <Text variant="label" weight="regular" style={styles.flex}>
        {DOCTOR_NOTE}
      </Text>
    </View>
  );

  if (!e.consentAt)
    return (
      <View style={styles.root}>
        <PageHeader title="Enhanced tracking" onBack={back} />
        <Page>
          <Text variant="title">
            {coachName} asked to track your enhanced protocol
          </Text>
          <Text tone="muted">
            It&apos;s your choice. Saying no changes nothing else about your
            coaching.
          </Text>
          <Eyebrow>What&apos;s recorded</Eyebrow>
          <View style={styles.card}>
            {WHAT.map((w) => (
              <View key={w} style={styles.point}>
                <Check size={16} strokeWidth={3} color={colors.text} />
                <Text style={styles.flex}>{w}</Text>
              </View>
            ))}
          </View>
          <Text variant="label" weight="regular" tone="muted">
            Only you and {coachName} see it. It never goes to AI. You can stop
            sharing at any time, and {coachName} loses access the moment you
            leave.
          </Text>
          {note}
          <Button
            label="Yes, track it"
            fullWidth
            onPress={() => answerEnhanced(me.id, true)}
          />
          <Button
            label="No thanks"
            variant="ghost"
            fullWidth
            onPress={() => {
              answerEnhanced(me.id, false);
              back();
            }}
          />
        </Page>
      </View>
    );

  const rows = latest(e);
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title="Enhanced tracking"
        sub={`${PHASE_LABEL[e.phase]}${e.phaseSince ? ` since ${dayText(e.phaseSince)}` : ""}`}
        onBack={back}
      />
      <Page>
        {note}
        <Eyebrow>Your markers</Eyebrow>
        <View style={styles.card}>
          {rows.length ? (
            rows.map((x) => (
              <View key={x.kind} style={styles.point}>
                <View style={styles.flex}>
                  <Text weight="medium">{MARKERS[x.kind].label}</Text>
                  <Text variant="label" weight="regular" tone="muted" numeric>
                    {x.now.value} {MARKERS[x.kind].unit} · {dayText(x.now.date)}
                  </Text>
                </View>
                {MARKERS[x.kind].dir === "none" ? null : (
                  <LevelTag level={x.level} />
                )}
              </View>
            ))
          ) : (
            <Text tone="muted">No readings yet.</Text>
          )}
        </View>

        <Eyebrow>Log blood pressure</Eyebrow>
        <View style={styles.row}>
          <TextInput
            value={sys}
            onChangeText={(v) => setSys(v.replace(/\D/g, ""))}
            placeholder="Top"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={[styles.field, styles.flex]}
            accessibilityLabel="Blood pressure, top number"
          />
          <TextInput
            value={dia}
            onChangeText={(v) => setDia(v.replace(/\D/g, ""))}
            placeholder="Bottom"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={[styles.field, styles.flex]}
            accessibilityLabel="Blood pressure, bottom number"
          />
          <Button
            label="Save"
            variant="secondary"
            disabled={!Number(sys) || !Number(dia)}
            onPress={() => {
              editEnhanced(me.id, (x) => ({
                ...x,
                markers: [
                  ...x.markers,
                  {
                    id: enhId("m"),
                    date: today,
                    kind: "systolic",
                    value: Number(sys),
                  },
                  {
                    id: enhId("m"),
                    date: today,
                    kind: "diastolic",
                    value: Number(dia),
                  },
                ],
              }));
              setSys("");
              setDia("");
            }}
          />
        </View>

        <Eyebrow>Note a side effect</Eyebrow>
        <TextInput
          value={effect}
          onChangeText={setEffect}
          placeholder="What you noticed"
          placeholderTextColor={colors.textMuted}
          style={styles.field}
          accessibilityLabel="Side effect"
        />
        <Button
          label="Tell my coach"
          variant="secondary"
          fullWidth
          disabled={!effect.trim()}
          onPress={() => {
            editEnhanced(me.id, (x) => ({
              ...x,
              sideEffects: [
                ...x.sideEffects,
                {
                  id: enhId("se"),
                  date: today,
                  text: effect.trim(),
                  severity: 1,
                },
              ],
            }));
            setEffect("");
          }}
        />
        <Text variant="caption" tone="muted">
          For chest pain, trouble breathing or fainting, call 112 now.
        </Text>

        <Button
          label="Stop sharing"
          variant="ghost"
          fullWidth
          onPress={() =>
            Alert.alert(
              "Stop sharing?",
              `${coachName} won't see this any more. You can share again later.`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Stop sharing",
                  style: "destructive",
                  onPress: () => answerEnhanced(me.id, false),
                },
              ],
            )
          }
        />
      </Page>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  point: { flexDirection: "row", alignItems: "center", gap: space[3] },
  note: {
    flexDirection: "row",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  field: {
    minHeight: 48,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
