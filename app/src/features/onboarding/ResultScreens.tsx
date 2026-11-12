// The end of athlete onboarding (AO-18 to AO-21, plus the tailored workouts), following the hi-fi mockups:
// building your plan → daily calorie target → what the plan includes → your workouts → all set.
// Free accounts see calories only (D5); nothing here mentions AI (D44).
import {
  Bell,
  Check,
  Dumbbell,
  Flag,
  Flame,
  ListChecks,
  type LucideIcon,
  Timer,
  TrendingUp,
} from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { Logo } from "@/components/brand";
import { PressableScale, Text } from "@/components/primitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  colors,
  durationFor,
  easeStandard,
  radius,
  rhythm,
  space,
  tapMin,
} from "@/theme";

import { useOnboarding } from "./OnboardingContext";
import { NextButton, QuestionHeader } from "./parts";
import { buildPlan, formatKcal, formatWeekly } from "./plan";

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

export function TextLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={styles.link}
    >
      <Text weight="medium">{label}</Text>
    </PressableScale>
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

const RING = 184;
const STROKE = 13;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TargetScreen({
  onContinue,
  onAdjust,
}: {
  onContinue: () => void;
  onAdjust: () => void;
}) {
  const { answers } = useOnboarding();
  const plan = buildPlan(answers);
  const reduced = useReducedMotion();
  const fill = useSharedValue(reduced ? 1 : 0);
  const [shown, setShown] = useState(reduced ? plan.kcal : 0);

  useEffect(() => {
    // The one big moment of onboarding: the ring fills and the number counts up once (600 ms). No confetti.
    const duration = durationFor("big", reduced);
    fill.set(withTiming(1, { duration, easing: easeStandard }));
    if (reduced) return;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(plan.kcal * eased));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - fill.get()),
  }));
  const goal =
    plan.goalWeightKg !== undefined
      ? `This gets you to ${plan.goalWeightKg.toFixed(1)} kg at a steady pace.`
      : "Set to match your goal, at a steady pace.";

  return (
    <Frame
      footer={
        <>
          <NextButton label="Continue" disabled={false} onPress={onContinue} />
          <TextLink label="Adjust target" onPress={onAdjust} />
        </>
      }
    >
      <Title title="Your daily target" sub={goal} />
      <View
        style={styles.ring}
        accessibilityRole="summary"
        accessibilityLabel={`${formatKcal(plan.kcal)} calories a day`}
      >
        <Svg width={RING} height={RING} style={styles.ringSvg}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={colors.surfaceRaised}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={colors.brand}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            animatedProps={ringProps}
          />
        </Svg>
        <View style={styles.ringLabel}>
          <Text variant="display" numeric>
            {formatKcal(shown)}
          </Text>
          <Text variant="label" weight="regular" tone="muted">
            kcal a day
          </Text>
        </View>
      </View>
      <View style={styles.list}>
        {[
          {
            dot: colors.nutrition,
            label: "Weekly change",
            value: formatWeekly(plan.weeklyKg),
          },
          {
            dot: colors.training,
            label: "Workouts",
            value: `${plan.daysPerWeek} a week · ${plan.minutes} min`,
          },
          {
            dot: colors.recovery,
            label: "Sleep target",
            value: `${plan.sleepTargetHours.toFixed(1)} h`,
          },
        ].map((row, k) => (
          <View key={row.label} style={[styles.kv, k > 0 && styles.kvLine]}>
            <View style={styles.kvLabel}>
              <View style={[styles.dot, { backgroundColor: row.dot }]} />
              <Text tone="muted">{row.label}</Text>
            </View>
            <Text weight="medium" numeric>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </Frame>
  );
}

// ---------- AO-20 What your plan includes ----------

function Feature({
  icon: Icon,
  title,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.feature}>
      <Icon size={28} strokeWidth={1.6} color={colors.text} />
      <View style={styles.featureText}>
        <Text weight="semibold">{title}</Text>
        <Text variant="label" weight="regular" tone="muted">
          {sub}
        </Text>
      </View>
    </View>
  );
}

export function PreviewScreen({ onNext }: { onNext: () => void }) {
  const { answers } = useOnboarding();
  const plan = buildPlan(answers);
  const reach =
    plan.goalWeightKg !== undefined
      ? `Built from your answers to help you reach ${plan.goalWeightKg.toFixed(1)} kg.`
      : "Built from your answers.";
  return (
    <Frame
      scroll
      footer={<NextButton label="Next" disabled={false} onPress={onNext} />}
    >
      <QuestionHeader
        glyph={ListChecks}
        title="Here's what your plan includes"
        sub={reach}
      />
      <View style={styles.features}>
        <Feature
          icon={Flame}
          title="Calorie tracking"
          sub={`${formatKcal(plan.kcal)} kcal a day · Indian dishes, ${plan.diet}`}
        />
        <Feature
          icon={Dumbbell}
          title={`${plan.workouts.length} starter workouts`}
          sub={`${plan.workoutNames.join(", ")} · ${plan.minutes} min · ${plan.equipment}`}
        />
        <Feature
          icon={Timer}
          title="Workout logging"
          sub="Sets, reps and a rest timer that buzzes"
        />
        <Feature
          icon={TrendingUp}
          title="Progress tracking"
          sub="Weight, measurements and private photos"
        />
        <Feature icon={Bell} title="Smart reminders" sub={plan.reminders} />
      </View>
    </Frame>
  );
}

// ---------- Your workouts (tailored) ----------

export function WorkoutsScreen({ onNext }: { onNext: () => void }) {
  const { answers } = useOnboarding();
  const plan = buildPlan(answers);
  return (
    <Frame
      scroll
      footer={<NextButton label="Next" disabled={false} onPress={onNext} />}
    >
      <QuestionHeader
        glyph={Dumbbell}
        section="Training"
        dot="training"
        title="Your starter workouts"
        sub={`Picked for your goal, your ${plan.equipment} and ${plan.minutes} minutes.`}
      />
      {plan.workouts.map((w) => (
        <View key={w.name} style={styles.workout}>
          <View style={styles.workoutHead}>
            <Text variant="heading">{w.name}</Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {w.exercises.length} exercises · {w.minutes} min
            </Text>
          </View>
          {w.exercises.map((e, k) => (
            <View
              key={`${e.name}-${k}`}
              style={[styles.kv, styles.exercise, k > 0 && styles.kvLine]}
            >
              <Text>{e.name}</Text>
              <Text weight="medium" numeric>
                {e.sets} × {e.reps}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <Text variant="caption" tone="muted" style={styles.centerText}>
        {
          "Weights start where you're comfortable; Arcwell suggests the next step after each session."
        }
      </Text>
    </Frame>
  );
}

// ---------- AO-21 All set ----------

export function DoneScreen({
  onToday,
  onInvite,
}: {
  onToday: () => void;
  onInvite: () => void;
}) {
  const { answers } = useOnboarding();
  const plan = buildPlan(answers);
  const first = plan.firstWorkout;
  return (
    <Frame
      center
      footer={
        <>
          <NextButton label="Go to Today" disabled={false} onPress={onToday} />
          <TextLink
            label="Have a coach? Enter invite code"
            onPress={onInvite}
          />
        </>
      }
    >
      <Medal done />
      <Title
        title="All set, let's go"
        sub="Your plan is ready. Show up, log it, and we'll handle the maths."
      />
      <View style={styles.firstUp}>
        <Flag size={24} strokeWidth={1.6} color={colors.text} />
        <View style={styles.featureText}>
          <Text weight="semibold">First up: {first.name}</Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            Today · {first.minutes} min · {first.exercises} exercises
          </Text>
        </View>
      </View>
    </Frame>
  );
}

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

  ring: {
    width: RING,
    height: RING,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  ringLabel: { alignItems: "center" },

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

  link: {
    alignSelf: "center",
    minHeight: tapMin,
    justifyContent: "center",
    paddingHorizontal: space[3],
  },
});

// ---------- CO-12 Ready to coach ----------

export function CoachReadyScreen({ onClients }: { onClients: () => void }) {
  const { answers } = useOnboarding();
  const services = (
    (answers.services as { name: string }[] | undefined) ?? []
  ).filter((s) => s.name.trim());
  const template =
    answers.firstTemplate === "arcwell"
      ? "Arcwell template · edit later"
      : answers.firstTemplate === "scratch"
        ? "From scratch · in Plans"
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
