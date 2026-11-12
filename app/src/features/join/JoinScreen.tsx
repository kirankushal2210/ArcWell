// Joining on a coach's personal invite (D56): the client sees what their coach planned, checks the
// details the coach entered, gives their own consent (DPDP) and starts. No onboarding questions.
import { router } from "expo-router";
import { Check, KeyRound } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/components/brand";
import { Avatar, Button, PressableScale, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  KeyValues,
  Page,
  PageHeader,
  PillarDot,
} from "@/features/coach/parts";
import { clock } from "@/features/coach/plans";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export function JoinScreen({ code: initial }: { code?: string }) {
  const { findInvite, claimInvite, coachName } = useCoachData();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(initial ?? "");
  const [tried, setTried] = useState(initial ?? "");
  const [agree, setAgree] = useState(false);
  const c = tried ? findInvite(tried) : undefined;
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  if (!c)
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <PageHeader title="Join your coach" onBack={back} />
        <Page>
          <View style={styles.glyph}>
            <KeyRound size={40} strokeWidth={1.6} color={colors.text} />
          </View>
          <Text tone="muted" style={styles.center}>
            {tried
              ? "That invite isn't valid any more. Check the code, or ask your coach for a new one."
              : "Enter the code from your coach's message, e.g. ANJ-4821."}
          </Text>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="ANJ-4821"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.code}
            accessibilityLabel="Invite code"
          />
        </Page>
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label="Continue"
            fullWidth
            disabled={code.trim().length < 4}
            onPress={() => setTried(code.trim())}
          />
        </View>
      </KeyboardAvoidingView>
    );

  const first = c.name.split(" ")[0];
  const p = c.program;
  const n = c.nutritionPlan;
  const r = c.protocol;

  return (
    <View style={styles.root}>
      <PageHeader title="" onBack={back} />
      <Page>
        <View style={styles.glyph}>
          <Logo size={48} />
        </View>
        <Text variant="display" style={styles.center}>
          {coachName} set up your plan
        </Text>
        <Text tone="muted" style={styles.center}>
          Hi {first}. Everything from your call is ready. No questions to
          answer: check your details and start.
        </Text>

        <View style={styles.coach}>
          <Avatar name={coachName.replace(/^Coach\s+/, "")} />
          <Text weight="semibold" style={styles.flex}>
            {coachName}
          </Text>
          <Text variant="label" tone="muted">
            Your coach
          </Text>
        </View>

        <Eyebrow>Your plan</Eyebrow>
        <Group>
          <GroupRow first>
            <PillarDot pillar="training" />
            <View style={styles.flex}>
              <Text weight="semibold">Training</Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {p ? `${p.name} · ${p.weeks} weeks` : "From your coach"}
              </Text>
            </View>
          </GroupRow>
          <GroupRow>
            <PillarDot pillar="nutrition" />
            <View style={styles.flex}>
              <Text weight="semibold">Nutrition</Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {n
                  ? `${n.kcal.toLocaleString("en-IN")} kcal · ${n.protein} g protein · ${n.meals.length} meals a day`
                  : "From your coach"}
              </Text>
            </View>
          </GroupRow>
          <GroupRow>
            <PillarDot pillar="recovery" />
            <View style={styles.flex}>
              <Text weight="semibold">Recovery</Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {r
                  ? `${r.sleepH} h sleep · in bed by ${clock(r.bed)} · ${r.restDays.length} rest days`
                  : "From your coach"}
              </Text>
            </View>
          </GroupRow>
        </Group>

        <Eyebrow>Check your details</Eyebrow>
        <KeyValues rows={c.answers} />
        <Text variant="caption" tone="muted">
          Something wrong? Tell {coachName} in chat after you join and
          they&apos;ll update it.
        </Text>

        <PressableScale
          onPress={() => setAgree((a) => !a)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          style={styles.agree}
        >
          <Text weight="medium" style={styles.flex}>
            I agree to the Terms and Privacy Policy, and let {coachName} see my
            training, food, sleep and progress while they coach me.
          </Text>
          <View style={[styles.tick, agree && styles.tickOn]}>
            {agree ? (
              <Check size={16} strokeWidth={3} color={colors.onBrand} />
            ) : null}
          </View>
        </PressableScale>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Start my plan"
          fullWidth
          disabled={!agree}
          onPress={() => {
            claimInvite(c.id);
            if (router.canDismiss()) router.dismissAll();
            router.replace("/athlete");
          }}
        />
        <Text variant="caption" tone="muted" style={styles.center}>
          Sign-in with Google or email comes with accounts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  glyph: { alignItems: "center", paddingTop: space[2] },
  coach: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  code: {
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.xl,
    letterSpacing: 2,
    textAlign: "center",
    color: colors.text,
  },
  agree: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.sm - space[1] / 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  footer: {
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    gap: space[2],
  },
});
