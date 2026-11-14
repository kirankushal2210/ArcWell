// Weekly check-in for coached athletes (F6, D12), in steps (F6-02 to F6-05): measurements, photos
// (optional, coach only, skipped when photo consent is off), the week (six 1–5 scores and three short
// answers), then a review of every answer, each one editable, and Send. The first one is the
// starting point (week 0). After sending, this page shows the coach's reply and the history.
import { router } from "expo-router";
import { Check, Lock } from "lucide-react-native";
import { type ReactNode, useState } from "react";
import {
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
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { choosePhoto, PhotoSlot } from "@/features/coach/PhotoSlot";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

type Step = "body" | "photos" | "week" | "review";
type Words = "wins" | "struggles" | "question";

const one = (n: number) => n.toFixed(1);

export default function WeeklyCheckIn() {
  const me = useMe();
  const { meTier, coachName, submitCheckIn, settingsOf } = useCoachData();
  const insets = useSafeAreaInsets();
  const [again, setAgain] = useState(false);
  const [step, setStep] = useState<Step>("body");
  // Opened from the review: Next goes straight back to it.
  const [editing, setEditing] = useState(false);
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
  const photosOn = settingsOf(me.id).photos;
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
            onPress={() => {
              setAgain(true);
              setStep("body");
              setEditing(false);
            }}
          />
        </Page>
      </View>
    );

  const steps: { key: Step; label: string }[] = [
    { key: "body", label: "Measurements" },
    ...(photosOn ? [{ key: "photos" as const, label: "Photos" }] : []),
    { key: "week", label: start ? "About you" : "The week" },
    { key: "review", label: "Review and send" },
  ];
  const at = Math.max(
    0,
    steps.findIndex((s) => s.key === step),
  );
  // The step on screen (a step that went away, like photos turned off, falls back to the first).
  const shown = steps[at].key;
  const next = () => {
    if (editing) {
      setEditing(false);
      setStep("review");
    } else setStep(steps[Math.min(at + 1, steps.length - 1)].key);
  };
  const edit = (to: Step) => {
    setEditing(true);
    setStep(to);
  };
  const words: [Words, string][] = [
    ["wins", start ? "What do you want to change?" : "Wins this week"],
    ["struggles", start ? "What's got in the way before?" : "What was hard"],
    ["question", `A question for ${first} (optional)`],
  ];
  const photoCount = POSES.filter((p) => f.photos[p.key]).length;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={start ? "Your starting point" : "Weekly check-in"}
        sub={
          start
            ? "Week 0 · so you can see how far you come"
            : sentThisWeek(me)
              ? undefined
              : dueText(me)
        }
        onBack={() => (at > 0 ? setStep(steps[at - 1].key) : back())}
      />
      {/* Keyed by step so each one opens at the top. */}
      <Page key={shown}>
        <View
          style={styles.progress}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${at + 1} of ${steps.length}, ${steps[at].label}`}
          accessibilityValue={{ min: 1, max: steps.length, now: at + 1 }}
        >
          <View style={styles.track}>
            {steps.map((s, i) => (
              <View
                key={s.key}
                style={[styles.segment, i <= at && styles.segmentOn]}
              />
            ))}
          </View>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {`Step ${at + 1} of ${steps.length} · ${steps[at].label}`}
          </Text>
        </View>

        {shown === "body" ? (
          <>
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
            <Text variant="caption" tone="muted">
              Morning, after the toilet, before food.
            </Text>
          </>
        ) : null}

        {shown === "photos" ? (
          <>
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
                Optional. Only {coachName} sees these. Same light, same spot,
                morning before food makes weeks easy to compare.
              </Text>
            </View>
          </>
        ) : null}

        {shown === "week" ? (
          <>
            {start ? null : (
              <>
                <Eyebrow>{`How was your week · ${answered} of ${SCORES.length}`}</Eyebrow>
                {SCORES.map((s) => (
                  <Scale
                    key={s.key}
                    label={s.label}
                    value={f.scores[s.key] ?? 0}
                    onChange={(v) =>
                      setF((x) => ({
                        ...x,
                        scores: { ...x.scores, [s.key]: v },
                      }))
                    }
                    ends={[s.low, s.high]}
                  />
                ))}
              </>
            )}
            <Eyebrow>{start ? "Tell your coach" : "In your words"}</Eyebrow>
            {words.map(([k, label]) => (
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
          </>
        ) : null}

        {shown === "review" ? (
          <>
            <Section title="Measurements" onEdit={() => edit("body")}>
              <Group>
                <GroupRow first>
                  <Text tone="muted" style={styles.flex}>
                    Weight
                  </Text>
                  <Text weight="medium" numeric>
                    {one(f.weightKg)} kg
                  </Text>
                </GroupRow>
                <GroupRow>
                  <Text tone="muted" style={styles.flex}>
                    Waist
                  </Text>
                  <Text weight="medium" numeric>
                    {f.waistCm === undefined ? "—" : `${one(f.waistCm)} cm`}
                  </Text>
                </GroupRow>
              </Group>
            </Section>

            {photosOn ? (
              <Section title="Photos" onEdit={() => edit("photos")}>
                {photoCount ? (
                  <View style={styles.photos}>
                    {POSES.filter((p) => f.photos[p.key]).map((p) => (
                      <PhotoSlot
                        key={p.key}
                        uri={f.photos[p.key]}
                        label={p.label}
                        onPress={() => edit("photos")}
                      />
                    ))}
                  </View>
                ) : (
                  <Text tone="muted">No photos this time.</Text>
                )}
              </Section>
            ) : (
              <Text variant="caption" tone="muted">
                Photos are off, so this goes without them. Turn them on in
                Privacy any time.
              </Text>
            )}

            <Section
              title={start ? "About you" : "The week"}
              onEdit={() => edit("week")}
            >
              <Group>
                {start ? null : (
                  <GroupRow first>
                    <View style={styles.flex}>
                      <Text variant="label" weight="regular" tone="muted">
                        {`Scores · ${answered} of ${SCORES.length}`}
                      </Text>
                      <Text numeric>
                        {answered
                          ? SCORES.filter((s) => f.scores[s.key])
                              .map((s) => `${s.label} ${f.scores[s.key]}`)
                              .join(" · ")
                          : "None yet"}
                      </Text>
                    </View>
                  </GroupRow>
                )}
                {words.map(([k, label], i) => (
                  <GroupRow key={k} first={start && i === 0}>
                    <View style={styles.flex}>
                      <Text variant="label" weight="regular" tone="muted">
                        {label}
                      </Text>
                      <Text tone={f[k].trim() ? "default" : "muted"}>
                        {f[k].trim() || "—"}
                      </Text>
                    </View>
                  </GroupRow>
                ))}
              </Group>
            </Section>
          </>
        ) : null}
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {shown === "review" ? (
          <Button
            label={start ? "Send my starting point" : "Send check-in"}
            fullWidth
            onPress={() => {
              submitCheckIn(me.id, f);
              setAgain(false);
              setStep("body");
              setEditing(false);
            }}
          />
        ) : (
          <Button
            label={
              editing
                ? "Back to review"
                : shown === "photos" && !photoCount
                  ? "Skip photos"
                  : "Next"
            }
            fullWidth
            onPress={next}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/** A review section: its title, an Edit button that opens that step, and the answers. */
function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text variant="eyebrow" tone="muted" style={styles.flex}>
          {title}
        </Text>
        <Button label="Edit" variant="ghost" size="sm" onPress={onEdit} />
      </View>
      {children}
    </View>
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
  progress: { gap: space[2] },
  track: { flexDirection: "row", gap: space[1] },
  segment: {
    flex: 1,
    height: space[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  segmentOn: { backgroundColor: colors.brand },
  section: { gap: space[2] },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
});
