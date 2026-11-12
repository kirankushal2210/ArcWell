// Weekly check-in for coached athletes (F6, D12): front, side and back photos (optional, coach
// only), weight and waist, six 1–5 scores for the week, and three short answers. The first one is
// the starting point (week 0). After sending, this page shows the coach's reply and the history.
import { router } from "expo-router";
import { Check, Lock } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Button, NumberStepper, Text } from "@/components/primitives";
import { Scale } from "@/features/athlete/RecoveryForm";
import { useMe } from "@/features/athlete/useMe";
import {
  type CheckInForm,
  dueText,
  type PhotoPose,
  POSES,
  SCORES,
  sentThisWeek,
} from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import { choosePhoto, PhotoSlot } from "@/features/coach/PhotoSlot";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function WeeklyCheckIn() {
  const me = useMe();
  const { meTier, coachName, submitCheckIn } = useCoachData();
  const insets = useSafeAreaInsets();
  const [again, setAgain] = useState(false);
  const last = me?.checkIns[0];
  const [f, setF] = useState<CheckInForm>(() => ({
    photos: {},
    weightKg: last?.weightKg ?? me?.weights[me.weights.length - 1] ?? 70,
    waistCm:
      last?.waistCm ?? me?.measurements.find((m) => m.label === "Waist")?.now,
    scores: {},
    wins: "",
    struggles: "",
    question: "",
  }));
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete");

  if (!me || meTier !== "coached")
    return (
      <View style={styles.root}>
        <PageHeader title="Weekly check-in" onBack={back} />
        <Page>
          <Text tone="muted">
            Weekly check-ins go to your coach. Join a coach to use them.
          </Text>
        </Page>
      </View>
    );

  const first = coachName.replace(/^Coach\s+/, "");
  const start = !me.checkIns.length;
  const sent = sentThisWeek(me) && !again;
  const answered = SCORES.filter((s) => f.scores[s.key]).length;
  const setPhoto = (p: PhotoPose, uri: string) =>
    setF((x) => ({ ...x, photos: { ...x.photos, [p]: uri } }));

  if (sent && last)
    return (
      <View style={styles.root}>
        <PageHeader title="Weekly check-in" onBack={back} />
        <Page>
          <View style={styles.card}>
            <View style={styles.done}>
              <Check size={20} strokeWidth={3} color={colors.onBrand} />
            </View>
            <Text variant="title">
              {last.week === 0
                ? "Starting point sent"
                : `Week ${last.week} sent`}
            </Text>
            <Text tone="muted">
              {last.reviewed
                ? `${coachName} replied.`
                : `${coachName} will look at it and reply here.`}
            </Text>
          </View>
          {last.reviewed && last.reply ? (
            <View style={styles.reply}>
              <Avatar name={first} />
              <View style={styles.flex}>
                <Text variant="label" tone="muted">
                  {coachName}
                </Text>
                <Text>{last.reply}</Text>
              </View>
            </View>
          ) : null}
          <History c={me} />
          <Button
            label="Send another"
            variant="ghost"
            fullWidth
            onPress={() => setAgain(true)}
          />
        </Page>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={start ? "Your starting point" : "Weekly check-in"}
        sub={start ? "Week 0 · so you can see how far you come" : dueText(me)}
        onBack={back}
      />
      <Page>
        <Eyebrow>Photos · optional</Eyebrow>
        <View style={styles.photos}>
          {POSES.map((p) => (
            <PhotoSlot
              key={p.key}
              uri={f.photos[p.key]}
              label={p.label}
              onPress={() => choosePhoto((u) => setPhoto(p.key, u))}
            />
          ))}
        </View>
        <View style={styles.private}>
          <Lock size={14} color={colors.textMuted} />
          <Text variant="caption" tone="muted" style={styles.flex}>
            Only {coachName} sees these. Same light, same spot, morning before
            food makes weeks easy to compare.
          </Text>
        </View>

        <Eyebrow>Body</Eyebrow>
        <View style={styles.row}>
          <Text style={styles.flex}>Weight</Text>
          <NumberStepper
            value={f.weightKg}
            onChange={(v) => setF((x) => ({ ...x, weightKg: v }))}
            step={0.1}
            decimals={1}
            min={30}
            max={250}
            unit="kg"
            accessibilityLabel="Weight"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.flex}>Waist (at the navel)</Text>
          <NumberStepper
            value={f.waistCm ?? 80}
            onChange={(v) => setF((x) => ({ ...x, waistCm: v }))}
            step={0.5}
            decimals={1}
            min={40}
            max={200}
            unit="cm"
            accessibilityLabel="Waist"
          />
        </View>

        {start ? null : (
          <>
            <Eyebrow>{`How was your week · ${answered} of ${SCORES.length}`}</Eyebrow>
            {SCORES.map((s) => (
              <Scale
                key={s.key}
                label={s.label}
                value={f.scores[s.key] ?? 0}
                onChange={(v) =>
                  setF((x) => ({ ...x, scores: { ...x.scores, [s.key]: v } }))
                }
                ends={[s.low, s.high]}
              />
            ))}
          </>
        )}

        <Eyebrow>{start ? "Tell your coach" : "In your words"}</Eyebrow>
        {(
          [
            ["wins", start ? "What do you want to change?" : "Wins this week"],
            [
              "struggles",
              start ? "What's got in the way before?" : "What was hard",
            ],
            ["question", `A question for ${first} (optional)`],
          ] as const
        ).map(([k, label]) => (
          <TextInput
            key={k}
            value={f[k]}
            onChangeText={(v) => setF((x) => ({ ...x, [k]: v }))}
            placeholder={label}
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.input}
            accessibilityLabel={label}
          />
        ))}
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={start ? "Send my starting point" : "Send check-in"}
          fullWidth
          onPress={() => {
            const go = () => {
              submitCheckIn(me.id, f);
              setAgain(false);
            };
            if (!start && answered < SCORES.length)
              Alert.alert(
                "Send without every score?",
                `${SCORES.length - answered} left blank. ${first} reads them all.`,
                [
                  { text: "Keep going", style: "cancel" },
                  { text: "Send", onPress: go },
                ],
              );
            else go();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function History({ c }: { c: NonNullable<ReturnType<typeof useMe>> }) {
  const past = c.checkIns.slice(1);
  if (!past.length) return null;
  return (
    <>
      <Eyebrow>Earlier</Eyebrow>
      {past.map((k) => (
        <View key={k.id} style={styles.card}>
          <Text weight="semibold">
            {k.week === 0 ? "Starting point" : `Week ${k.week}`} ·{" "}
            <Text tone="muted">{k.submitted}</Text>
          </Text>
          <Text variant="label" weight="regular" tone="muted">
            {k.reviewed && k.reply
              ? `Reply: ${k.reply}`
              : "Waiting for a reply"}
          </Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  photos: { flexDirection: "row", gap: space[2] },
  private: { flexDirection: "row", gap: space[2], alignItems: "flex-start" },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  done: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  reply: {
    flexDirection: "row",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  input: {
    minHeight: 56,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
