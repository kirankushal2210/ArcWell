// Check-in review (F6-08): this week against last, photos side by side (against the starting point
// or last week), the client's scores and words, then a reply. Quick replies drop common lines in;
// after replying the coach can go straight to adjusting the plan.
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Button, Text } from "@/components/primitives";
import {
  firstPhoto,
  type PhotoPose,
  POSES,
  SCORES,
} from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { tenureText } from "@/features/coach/crm";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
  Pills,
} from "@/features/coach/parts";
import { PhotoSlot } from "@/features/coach/PhotoSlot";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const QUICK = [
  "Great week, keep it going.",
  "Let's add 20 g of protein a day.",
  "Take this week easier: a deload.",
  "Let's talk this week. When suits you?",
];

type Compare = "start" | "last";

export default function CheckInReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, reply } = useCoachData();
  const insets = useSafeAreaInsets();
  const found = clients
    .flatMap((c) => c.checkIns.map((k, i) => ({ c, k, i })))
    .find(({ k }) => k.id === id);
  const [text, setText] = useState("");
  const [pose, setPose] = useState<PhotoPose>("front");
  const [compare, setCompare] = useState<Compare>("start");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/check-ins");

  if (!found)
    return (
      <View style={styles.root}>
        <PageHeader title="Check-in" onBack={back} />
      </View>
    );
  const { c, k, i } = found;
  const first = c.name.split(" ")[0];
  const prev = c.checkIns[i + 1];
  const base =
    compare === "start"
      ? firstPhoto(c, pose)
      : prev?.photos?.[pose]
        ? prev
        : undefined;
  const hasPhotos = !!k.photos && Object.values(k.photos).some(Boolean);
  const scored = SCORES.filter((s) => k.scores?.[s.key]);
  const plan = (
    pathname: "/coach/plan/training/[id]" | "/coach/plan/nutrition/[id]",
  ) => router.push({ pathname, params: { id: c.id } });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={`${c.name} · ${k.week === 0 ? "Start" : `Week ${k.week}`}`}
        sub={`${tenureText(c.weeksWithYou)} · sent ${k.submitted}`}
        onBack={back}
      />
      <Page>
        <Group>
          <GroupRow first>
            <Text variant="label" tone="muted" style={styles.flex}>
              {" "}
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              Last
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              Now
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              Change
            </Text>
          </GroupRow>
          {k.rows.map((r) => (
            <GroupRow key={r.label}>
              <Text style={styles.flex}>{r.label}</Text>
              <Text tone="muted" numeric style={styles.col}>
                {r.last}
              </Text>
              <Text weight="semibold" numeric style={styles.col}>
                {r.now}
              </Text>
              <Text weight="semibold" numeric style={styles.col}>
                {r.delta}
              </Text>
            </GroupRow>
          ))}
        </Group>

        <Eyebrow>Photos</Eyebrow>
        {hasPhotos ? (
          <>
            <Pills
              value={pose}
              onChange={setPose}
              options={POSES.map((p) => ({ value: p.key, label: p.label }))}
            />
            <View style={styles.photos}>
              <PhotoSlot
                uri={base?.photos?.[pose]}
                label={
                  base
                    ? base.week === 0
                      ? "Start"
                      : `Week ${base.week}`
                    : compare === "start"
                      ? "No start photo"
                      : "No photo last week"
                }
              />
              <PhotoSlot
                uri={k.photos?.[pose]}
                label={k.week === 0 ? "Start" : `Week ${k.week}`}
              />
            </View>
            <Pills<Compare>
              value={compare}
              onChange={setCompare}
              options={[
                { value: "start", label: "Compare with start" },
                { value: "last", label: "Compare with last week" },
              ]}
            />
          </>
        ) : (
          <Text tone="muted">
            No photos this week. Photos are optional; {first} sent everything
            else.
          </Text>
        )}

        {scored.length ? (
          <>
            <Eyebrow>Their week, out of 5</Eyebrow>
            <View style={styles.card}>
              {scored.map((s) => {
                const v = k.scores?.[s.key] ?? 0;
                const was = prev?.scores?.[s.key];
                return (
                  <View key={s.key} style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>{s.label}</Text>
                    <View style={styles.dots}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <View
                          key={n}
                          style={[styles.dot, n <= v && styles.dotOn]}
                        />
                      ))}
                    </View>
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      {v}
                      {was !== undefined && was !== v ? ` (was ${was})` : ""}
                    </Text>
                  </View>
                );
              })}
              <Text variant="caption" tone="muted">
                Stress and hunger: higher means more.
              </Text>
            </View>
          </>
        ) : k.answers ? (
          <View style={styles.card}>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {k.answers}
            </Text>
          </View>
        ) : null}

        {k.wins || k.struggles || k.question || k.note ? (
          <>
            <Eyebrow>In their words</Eyebrow>
            <View style={styles.card}>
              {k.wins ? (
                <View style={styles.said}>
                  <Text variant="label" tone="muted">
                    {k.week === 0 ? "Wants to change" : "Wins"}
                  </Text>
                  <Text>{k.wins}</Text>
                </View>
              ) : null}
              {k.struggles || k.note ? (
                <View style={styles.said}>
                  <Text variant="label" tone="muted">
                    {k.week === 0 ? "What's got in the way" : "Hard this week"}
                  </Text>
                  <Text>{k.struggles ?? k.note}</Text>
                </View>
              ) : null}
              {k.question ? (
                <View style={styles.said}>
                  <Text variant="label" tone="muted">
                    Question for you
                  </Text>
                  <Text weight="medium">{k.question}</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {k.reviewed ? (
          <>
            <View style={styles.reply}>
              <Avatar name="You" />
              <View style={styles.flex}>
                <Text variant="label" tone="muted">
                  Your reply
                </Text>
                <Text>{k.reply}</Text>
              </View>
            </View>
            <Eyebrow>Adjust the plan</Eyebrow>
            <Group>
              <GroupRow
                first
                onPress={() => plan("/coach/plan/training/[id]")}
                label="Edit training"
              >
                <Text style={styles.flex}>Training program</Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </GroupRow>
              <GroupRow
                onPress={() => plan("/coach/plan/nutrition/[id]")}
                label="Edit nutrition"
              >
                <Text style={styles.flex}>Nutrition plan</Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </GroupRow>
            </Group>
          </>
        ) : (
          <>
            <Eyebrow>Reply</Eyebrow>
            <View style={styles.quick}>
              {QUICK.map((q) => (
                <Button
                  key={q}
                  label={q}
                  variant="secondary"
                  onPress={() =>
                    setText((t) => (t.trim() ? `${t.trim()} ${q}` : q))
                  }
                />
              ))}
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={`Reply to ${first}`}
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.input}
              accessibilityLabel="Feedback"
            />
          </>
        )}
      </Page>
      {!k.reviewed ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label="Send feedback"
            fullWidth
            disabled={!text.trim()}
            onPress={() => {
              reply(c.id, k.id, text.trim());
              setText("");
            }}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  col: { width: 64, textAlign: "right" },
  photos: { flexDirection: "row", gap: space[2] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: space[3] },
  scoreLabel: { width: 72 },
  dots: { flex: 1, flexDirection: "row", gap: space[1] },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  dotOn: { backgroundColor: colors.brand },
  said: { gap: space[1] / 2 },
  reply: {
    flexDirection: "row",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  quick: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  input: {
    minHeight: 96,
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
