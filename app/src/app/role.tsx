// Choose a role before sign-up (D44): Get Started on the welcome screen leads here.
// Laid out after the founder's role reference (large question, two role cards, note, Continue),
// in Arcwell's black-and-white style: the chosen card turns black, like every selection.
// Athletes go to athlete onboarding; coaches go to coach onboarding.
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Check,
  ClipboardCheck,
  Dumbbell,
  Info,
  type LucideIcon,
  UserRoundCheck,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale, Text } from "@/components/primitives";
import {
  NextButton,
  ProgressBar,
  QuestionHeader,
} from "@/features/onboarding/parts";
import { borderWidth, colors, radius, rhythm, space } from "@/theme";

type Role = "athlete" | "coach";

const ROLES: { value: Role; label: string; sub: string; icon: LucideIcon }[] = [
  {
    value: "athlete",
    label: "Athlete",
    sub: "Your own workouts, meals and recovery",
    icon: Dumbbell,
  },
  {
    value: "coach",
    label: "Coach",
    sub: "Plans, check-ins and chat for your clients",
    icon: ClipboardCheck,
  },
];

function RoleCard({
  label,
  sub,
  icon: Icon,
  on,
  onPress,
}: {
  label: string;
  sub: string;
  icon: LucideIcon;
  on: boolean;
  onPress: () => void;
}) {
  const fg = on ? colors.onBrand : colors.text;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${label}, ${sub}`}
      style={[styles.card, on && styles.cardOn]}
    >
      <View style={[styles.iconTile, on && styles.iconTileOn]}>
        <Icon size={24} strokeWidth={1.75} color={fg} />
      </View>
      <View style={styles.cardText}>
        <Text variant="heading" tone={on ? "onBrand" : "default"}>
          {label}
        </Text>
        <Text
          variant="label"
          weight="regular"
          tone={on ? "onBrand" : "muted"}
          style={on && styles.subOn}
        >
          {sub}
        </Text>
      </View>
      <View style={[styles.radio, on && styles.radioOn]}>
        {on ? <Check size={16} strokeWidth={3} color={colors.text} /> : null}
      </View>
    </PressableScale>
  );
}

export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role | null>(null);

  const go = () =>
    role === "coach"
      ? router.push({
          pathname: "/coach-onboarding/[step]",
          params: { step: "0" },
        })
      : router.push({ pathname: "/onboarding/[step]", params: { step: "0" } });

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, space[4]),
        },
      ]}
    >
      <View style={styles.top}>
        <ProgressBar
          segments={[]}
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        />
      </View>
      <View style={styles.body}>
        <QuestionHeader
          glyph={UserRoundCheck}
          title="Are you an athlete or a coach?"
          sub="We set Arcwell up around your role."
        />
        <View style={styles.cards} accessibilityRole="radiogroup">
          {ROLES.map((r) => (
            <RoleCard
              key={r.value}
              label={r.label}
              sub={r.sub}
              icon={r.icon}
              on={role === r.value}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setRole(r.value);
              }}
            />
          ))}
        </View>
      </View>
      <View style={styles.note}>
        <Info size={16} strokeWidth={1.75} color={colors.textMuted} />
        <Text variant="caption" tone="muted">
          One role per account. Invited by a coach? Open their link.
        </Text>
      </View>
      <NextButton label="Continue" disabled={role === null} onPress={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: space[1] },
  body: {
    flex: 1,
    gap: space[6],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[4],
  },
  cards: { gap: space[3] },
  card: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: space[4],
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    borderRadius: radius.lg,
    borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  iconTileOn: { backgroundColor: colors.brandHover },
  cardText: { flex: 1, gap: space[1] / 2 },
  subOn: { opacity: 0.75 },
  radio: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: colors.onBrand, borderColor: colors.onBrand },
  note: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingBottom: space[4],
  },
});
