// The end of athlete onboarding and coach onboarding (AO-18 building your plan, CO-12 ready to coach).
// The athlete's plan-ready, save-your-plan and AI paywall screens follow AO-18 (D57: app/onboarding/).
import { Check } from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/components/brand";
import { Text } from "@/components/primitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { colors, radius, rhythm, space } from "@/theme";

import { firstTemplate } from "./coachAnswers";
import { useOnboarding } from "./OnboardingContext";
import { NextButton } from "./parts";

// ---------- Shared frame ----------

function Frame({
  children,
  footer,
  center = false,
  scroll = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  center?: boolean;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + space[4],
          paddingBottom: Math.max(insets.bottom, space[4]),
        },
      ]}
    >
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.body, center && styles.center]}>
          {children}
        </View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

function Medal({ done = false }: { done?: boolean }) {
  return (
    <View style={styles.medal}>
      <Logo size={64} />
      {done ? (
        <View style={styles.badge}>
          <Check size={16} strokeWidth={3} color={colors.onBrand} />
        </View>
      ) : null}
    </View>
  );
}

function Title({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.titleBlock}>
      <Text
        variant="display"
        textBreakStrategy="balanced"
        lineBreakStrategyIOS="push-out"
        style={styles.centerText}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {sub ? (
        <Text
          tone="muted"
          textBreakStrategy="balanced"
          lineBreakStrategyIOS="push-out"
          style={[styles.centerText, styles.sub]}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// ---------- AO-18 Building your plan ----------

const STEPS = [
  "Daily calorie target",
  "Starter workouts for your kit",
  "Rest days from your sleep and stress",
  "Reminders on your training days",
];

export function BuildingScreen({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(0);
  useEffect(() => {
    // The plan is built on the device in a few milliseconds; each step ticks briefly so people can read
    // what was tailored. When the server builds plans this waits on that call instead.
    const step = reduced ? 120 : 380;
    const timers = STEPS.map((_, k) =>
      setTimeout(() => setDone(k + 1), step * (k + 1)),
    );
    const finish = setTimeout(onDone, step * STEPS.length + 450);
    return () => [...timers, finish].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Frame center>
      <Medal />
      <Title title="Building your plan" sub="Putting your answers together." />
      <View style={styles.loadTrack}>
        <View
          style={[
            styles.loadFill,
            { width: `${Math.round((done / STEPS.length) * 100)}%` },
          ]}
        />
      </View>
      <View style={styles.steps} accessibilityLiveRegion="polite">
        {STEPS.map((label, k) => {
          const on = k < done;
          const now = k === done;
          return (
            <View key={label} style={styles.stepRow}>
              <View style={[styles.stepCheck, on && styles.stepCheckOn]}>
                {on ? (
                  <Check size={12} strokeWidth={3} color={colors.onBrand} />
                ) : null}
              </View>
              <Text
                weight={now ? "semibold" : "regular"}
                tone={on || now ? "default" : "muted"}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </Frame>
  );
}

// ---------- AO-19 Daily calorie target ----------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  body: {
    gap: space[4],
    paddingHorizontal: rhythm.gutter,
    paddingBottom: space[4],
  },
  center: { justifyContent: "center", gap: space[6] },
  footer: { gap: space[1] },
  centerText: { textAlign: "center" },
  sub: { maxWidth: 320, alignSelf: "center" },
  titleBlock: { gap: space[2], alignItems: "center" },

  medal: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  badge: {
    position: "absolute",
    right: -space[1] / 2,
    bottom: space[1] / 2,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  loadTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  loadFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  steps: { gap: space[3] },
  stepRow: { flexDirection: "row", alignItems: "center", gap: space[3] },
  stepCheck: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCheckOn: { backgroundColor: colors.brand, borderColor: colors.brand },

  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  kv: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  kvLine: { borderTopWidth: 1, borderTopColor: colors.border },
  kvLabel: { flexDirection: "row", alignItems: "center", gap: space[2] },
  dot: { width: 8, height: 8, borderRadius: radius.full },

  features: { gap: space[4], paddingTop: space[1] },
  feature: { flexDirection: "row", alignItems: "flex-start", gap: space[4] },
  featureText: { flex: 1, gap: space[1] / 2 },
  firstUp: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space[4],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  workout: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  workoutHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: space[4],
    paddingTop: space[4],
    paddingBottom: space[2],
  },
  exercise: { paddingVertical: space[2] },
});

// ---------- CO-12 Ready to coach ----------

export function CoachReadyScreen({ onClients }: { onClients: () => void }) {
  const { answers } = useOnboarding();
  const services = (
    (answers.services as { name: string }[] | undefined) ?? []
  ).filter((s) => s.name.trim());
  const first = firstTemplate(answers);
  const template =
    first.kind === "review"
      ? `${first.draft.unmatched.length} ${first.draft.unmatched.length === 1 ? "row" : "rows"} to check next`
      : first.kind === "ready"
        ? answers.firstTemplate === "scratch"
          ? "From scratch · opens next"
          : answers.firstTemplate === "spreadsheet"
            ? "From your spreadsheet"
            : first.program.name
        : answers.firstTemplate === "spreadsheet"
          ? "Import later from Plans"
          : "To do";
  const rows: [string, string][] = [
    ["Profile", "Done"],
    ["Services", services.length ? `${services.length} added` : "To do"],
    ["Training template", template],
    ["Meal plan template", "To do"],
  ];
  return (
    <Frame
      center
      footer={
        <NextButton
          label="Go to Clients"
          disabled={false}
          onPress={onClients}
        />
      }
    >
      <Medal done />
      <Title
        title="You're ready to coach"
        sub="Your profile is set up and your link is ready to share. Anything you skipped waits on your Clients checklist."
      />
      <View style={styles.list}>
        {rows.map(([label, value], k) => (
          <View key={label} style={[styles.kv, k > 0 && styles.kvLine]}>
            <Text tone="muted">{label}</Text>
            <View style={styles.kvLabel}>
              {value === "Done" ? (
                <Check size={16} strokeWidth={2.5} color={colors.text} />
              ) : null}
              <Text
                weight="medium"
                tone={value === "To do" ? "muted" : "default"}
              >
                {value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Frame>
  );
}
