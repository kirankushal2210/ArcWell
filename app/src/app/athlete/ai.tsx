// AI coach (D57, D68, D70), opened from Today's toolbar and the + menu. Plus members get today's
// recovery-aware suggestion, the tools (tailor today, build a plan, nutrition assistant, weekly
// review) and a chat; Free members see the trial offer with the AI permission step (D35). Coached
// athletes never reach this screen (D44). Front end only: answers come from the evidence rules and
// sample text until the server AI service exists (supabase/functions/_shared/ai).
import { type Href, router } from "expo-router";
import {
  Camera,
  ChartLine,
  Dumbbell,
  Moon,
  Send,
  Sparkles,
  Utensils,
  Wand2,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Chip, IconButton, Text } from "@/components/primitives";
import { type Answer, answer, PROMPTS } from "@/features/ai/answers";
import { TodaySuggestion } from "@/features/ai/TodaySuggestion";
import { AI_DAILY_LIMIT, isoToday } from "@/features/athlete/athleteData";
import { NavRow } from "@/features/athlete/MenuParts";
import { shortCite, SOURCES } from "@/features/science/sources";
import { AIConsentPoints } from "@/features/athlete/AIConsent";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, Page, PageHeader } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";
import { TrialTimeline } from "@/features/athlete/TrialTimeline";

export default function AICoach() {
  const me = useMe();
  const { meTier, startPlus, settingsOf } = useCoachData();
  const insets = useSafeAreaInsets();
  const [consent, setConsent] = useState(false);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete");
  if (!me || meTier === "coached") return <NotJoined />;

  if (meTier === "free")
    return (
      <View style={styles.root}>
        <PageHeader
          title={consent ? "Let AI use your data?" : "Your AI coach"}
          onBack={consent ? () => setConsent(false) : back}
        />
        <Page>
          {consent ? (
            <>
              <Text tone="muted">
                To adapt your plan, Arcwell&apos;s AI reads your answers and
                what you log.
              </Text>
              <AIConsentPoints />
            </>
          ) : (
            <>
              <Text tone="muted">
                Arcwell Plus keeps your plan right for you every week.
              </Text>
              {[
                [
                  Sparkles,
                  "A plan that adapts",
                  "Training adjusted weekly from what you log",
                ],
                [
                  Utensils,
                  "Full macros and meal plans",
                  "Indian meals fitted to your targets",
                ],
                [Camera, "Photo food logging", "Snap a meal, check it, log it"],
                [Moon, "Recovery", "Sleep score and recovery trends"],
              ].map(([Icon, title, sub]) => {
                const I = Icon as typeof Sparkles;
                return (
                  <View key={title as string} style={styles.benefit}>
                    <I size={24} strokeWidth={1.6} color={colors.text} />
                    <View style={styles.flex}>
                      <Text weight="semibold">{title as string}</Text>
                      <Text variant="label" weight="regular" tone="muted">
                        {sub as string}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {settingsOf(me.id).sub ? null : <TrialTimeline />}
            </>
          )}
        </Page>
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          {consent ? (
            <Button
              label="Allow and start free trial"
              fullWidth
              onPress={() => {
                startPlus("yearly");
                setConsent(false);
                router.replace({
                  pathname: "/athlete/switch/[step]",
                  params: { step: "upgraded" },
                });
              }}
            />
          ) : (
            <Button
              label={
                settingsOf(me.id).sub
                  ? "Restart Arcwell Plus"
                  : "Start 7-day free trial"
              }
              fullWidth
              onPress={() => setConsent(true)}
            />
          )}
          <Text variant="caption" tone="muted" style={styles.center}>
            Cancel any time in Google Play before the trial ends.
          </Text>
        </View>
      </View>
    );

  return <AIHub />;
}

type Msg = {
  from: "me" | "ai";
  text: string;
  kind?: Answer["kind"];
  sources?: string[];
};

/** The AI coach for Plus members (D70): today's suggestion, tools, and a chat. Sample answers only. */
function AIHub() {
  const me = useMe();
  const { settingsOf, setAthleteSettings } = useCoachData();
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete");
  if (!me) return <NotJoined />;
  const s = settingsOf(me.id);

  // AI-02: AI turned off in Privacy. Nothing AI shows until it's back on.
  if (!s.ai)
    return (
      <View style={styles.root}>
        <PageHeader title="AI coach" onBack={back} />
        <Page>
          <View style={styles.offHero}>
            <Sparkles size={32} strokeWidth={1.6} color={colors.text} />
            <Text variant="title" style={styles.center}>
              AI features are off
            </Text>
            <Text tone="muted" style={styles.center}>
              You turned them off in Privacy. Your plan, logs and everything
              else keep working. Turning AI off doesn&apos;t cancel your
              subscription.
            </Text>
            <Button
              label="Turn AI back on"
              fullWidth
              onPress={() => setAthleteSettings(me.id, { ai: true })}
            />
          </View>
        </Page>
      </View>
    );

  const today = isoToday();
  const used = s.aiUsage?.date === today ? s.aiUsage.n : 0;
  const limited = used >= AI_DAILY_LIMIT;
  const ask = (q: string) => {
    const question = q.trim();
    if (!question || limited) return;
    const a = answer(question, {
      protein: me.nutritionPlan?.protein,
      kcal: me.nutritionPlan?.kcal,
    });
    setMsgs((m) => [
      ...m,
      { from: "me", text: question },
      { from: "ai", text: a.text, kind: a.kind, sources: a.sources },
    ]);
    setAthleteSettings(me.id, { aiUsage: { date: today, n: used + 1 } });
    setText("");
  };
  const tools: {
    icon: typeof Sparkles;
    label: string;
    sub: string;
    href: Href;
  }[] = [
    {
      icon: Wand2,
      label: "Tailor today's workout",
      sub: "Short on time, sore, or no barbell",
      href: "/athlete/assistant/tailor",
    },
    {
      icon: Dumbbell,
      label: "Build a new plan",
      sub: "From your goal, days and equipment",
      href: "/athlete/assistant/plan",
    },
    {
      icon: Utensils,
      label: "Nutrition assistant",
      sub: "Hit protein, swap a meal, eating out",
      href: "/athlete/assistant/nutrition",
    },
    {
      icon: ChartLine,
      label: "Weekly review",
      sub: "Training, food and recovery this week",
      href: "/athlete/assistant/review",
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title="AI coach" sub="Sample answers for now" onBack={back} />
      <Page>
        <TodaySuggestion />
        <Group>
          {tools.map((t, i) => (
            <NavRow
              key={t.label}
              first={i === 0}
              icon={t.icon}
              label={t.label}
              sub={t.sub}
              onPress={() => router.push(t.href)}
            />
          ))}
        </Group>
        <Eyebrow>Ask</Eyebrow>
        {msgs.length ? (
          msgs.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.from === "me" ? styles.mine : styles.theirs,
              ]}
            >
              <Text tone={m.from === "me" ? "onBrand" : "default"}>
                {m.text}
              </Text>
              {m.sources?.length ? (
                <Text variant="caption" tone="muted">
                  Based on{" "}
                  {m.sources
                    .map((id) => SOURCES[id])
                    .filter(Boolean)
                    .map((src) => shortCite(src))
                    .join("; ")}
                </Text>
              ) : null}
            </View>
          ))
        ) : (
          <View style={styles.prompts}>
            {PROMPTS.map((q) => (
              <Chip key={q} label={q} onPress={() => ask(q)} />
            ))}
          </View>
        )}
        {limited ? (
          <View style={styles.card}>
            <Text weight="semibold">
              That&apos;s today&apos;s {AI_DAILY_LIMIT} questions
            </Text>
            <Text tone="muted">
              Your AI coach is back tomorrow. Your plan, logging and Recovery
              keep working as normal.
            </Text>
          </View>
        ) : null}
      </Page>
      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, space[2]) },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          editable={!limited}
          placeholder={
            limited ? "Back tomorrow" : "Ask about training, food or sleep"
          }
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Ask the AI coach"
          onSubmitEditing={() => ask(text)}
          returnKeyType="send"
        />
        <IconButton
          icon={Send}
          variant="filled"
          disabled={!text.trim() || limited}
          accessibilityLabel="Send"
          onPress={() => ask(text)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  offHero: { alignItems: "center", gap: space[3], paddingTop: space[6] },
  prompts: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  bubble: {
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    maxWidth: "88%",
  },
  mine: { alignSelf: "flex-end", backgroundColor: colors.brand },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.surface },
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  benefit: { flexDirection: "row", alignItems: "flex-start", gap: space[4] },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: space[3],
    paddingTop: space[2],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
