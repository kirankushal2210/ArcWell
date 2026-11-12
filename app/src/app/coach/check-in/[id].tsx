// Check-in review (F6-08): this week against last, photos, answers and note, then a text reply.
import { router, useLocalSearchParams } from "expo-router";
import { User } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Page, PageHeader } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function CheckInReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, reply } = useCoachData();
  const insets = useSafeAreaInsets();
  const found = clients
    .flatMap((c) => c.checkIns.map((k) => ({ c, k })))
    .find(({ k }) => k.id === id);
  const [text, setText] = useState("");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/check-ins");

  if (!found)
    return (
      <View style={styles.root}>
        <PageHeader title="Check-in" onBack={back} />
      </View>
    );
  const { c, k } = found;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title={`${c.name} · Week ${k.week}`} onBack={back} />
      <Page>
        <Text tone="muted">
          {c.goal.split(" · ")[0]} · {c.weeksWithYou} weeks with you · submitted{" "}
          {k.submitted}
        </Text>
        <Group>
          <GroupRow first>
            <Text variant="label" tone="muted" style={styles.flex}>
              {" "}
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              Last wk
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              This wk
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
        <View style={styles.photos}>
          {[k.week - 1, k.week].map((w) => (
            <View
              key={w}
              style={styles.photo}
              accessibilityLabel={`Photo, week ${w}`}
            >
              <User size={28} color={colors.textMuted} />
              <Text variant="caption" weight="semibold">
                Week {w}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {k.answers}
          </Text>
          {k.note ? <Text weight="medium">“{k.note}”</Text> : null}
        </View>
        {k.reviewed ? (
          <View style={styles.card}>
            <Text variant="label" tone="muted">
              Your reply
            </Text>
            <Text>{k.reply}</Text>
          </View>
        ) : (
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`Reply to ${c.name.split(" ")[0]}`}
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.input}
            accessibilityLabel="Feedback"
          />
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
              back();
            }}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  col: { width: 64, textAlign: "right" },
  photos: { flexDirection: "row", gap: space[2] },
  photo: {
    flex: 1,
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    gap: space[1],
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  input: {
    minHeight: 120,
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
