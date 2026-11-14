// Shared pieces for food logging (F5): the athlete's nutrition context (tier rules, today's logs),
// food rows with source tags, the macros box, the ½-step portion stepper, the meal picker and the
// Arcwell Plus upgrade sheet. Free athletes see calories only (D5); coached athletes never see AI or
// the upgrade (D44).
import { router } from "expo-router";
import { Check, Minus, Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { uid } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";

import {
  dateKey,
  type Food,
  type FoodLog,
  type Macros,
  MEAL_SLOTS,
  type MealSlot,
  slotForHour,
  SOURCE_LABEL,
} from "./foods";
import { Sheet, SheetRow } from "./Sheet";
import { useMe } from "./useMe";

/** Event-time clock helpers, kept out of render bodies (React Compiler purity rule). */
export const todayKey = () => dateKey(new Date());
export const slotNow = () => slotForHour(new Date().getHours());

/** Everything a nutrition screen needs about the athlete using the app. */
export function useNutrition() {
  const me = useMe();
  const data = useCoachData();
  const id = me?.id ?? "";
  return {
    me,
    tier: data.meTier,
    /** Free is calories only (D5); paid and coached get full macros. */
    macros: data.meTier !== "free",
    coached: data.meTier === "coached",
    coachName: data.coachName,
    plan: me?.nutritionPlan,
    logs: data.foodLogs(id),
    myFoods: data.myFoods,
    add: (logs: FoodLog[]) => data.addFoodLogs(id, logs),
    update: (log: FoodLog) => data.updateFoodLog(id, log),
    remove: (logId: string) => data.deleteFoodLog(id, logId),
    addMyFood: data.addMyFood,
  };
}

export const newLogId = () => uid("f");

/** Back to the day log after adding or editing (the add screens sit above the tabs). */
export const backToLog = () =>
  router.canDismiss()
    ? router.dismissAll()
    : router.replace("/athlete/nutrition");

export const kcalText = (n: number) =>
  `${Math.round(n).toLocaleString("en-IN")} kcal`;

export function SourceTag({ source }: { source: Food["source"] | "quick" }) {
  return (
    <View style={styles.tag}>
      <Text variant="caption" tone="muted">
        {SOURCE_LABEL[source]}
      </Text>
    </View>
  );
}

/** One food in a list: name, source, portion and calories, with a one-tap add. */
export function FoodRow({
  name,
  source,
  sub,
  onPress,
  onAdd,
  added,
}: {
  name: string;
  source: Food["source"] | "quick";
  sub: string;
  onPress: () => void;
  onAdd?: () => void;
  added?: boolean;
}) {
  // The row and the add button are siblings, not one inside the other (nested buttons break on
  // web and hide the inner one from screen readers).
  return (
    <View style={styles.row}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${sub}`}
        style={styles.rowMain}
      >
        <View style={styles.nameRow}>
          <Text weight="medium" numberOfLines={2} style={styles.shrink}>
            {name}
          </Text>
          <SourceTag source={source} />
        </View>
        <Text variant="label" weight="regular" tone="muted" numeric>
          {sub}
        </Text>
      </PressableScale>
      {onAdd ? (
        <IconButton
          icon={added ? Check : Plus}
          variant={added ? "filled" : "outline"}
          accessibilityLabel={added ? `${name} added` : `Add ${name}`}
          onPress={onAdd}
        />
      ) : null}
    </View>
  );
}

/** Calories, plus protein, carbs and fat when the tier includes macros (F5-06). */
export function MacroBox({ m, macros }: { m: Macros; macros: boolean }) {
  const cell = (value: string, label: string) => (
    <View style={styles.cell}>
      <Text variant="title" numeric>
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
  return (
    <View style={styles.box}>
      {cell(String(Math.round(m.kcal)), "kcal")}
      {macros ? (
        <>
          {cell(String(Math.round(m.p)), "protein g")}
          {cell(String(Math.round(m.c)), "carbs g")}
          {cell(String(Math.round(m.f)), "fat g")}
        </>
      ) : null}
    </View>
  );
}

/** − 1½ katori + : moves in halves, or 10 g steps for grams. */
export function PortionStepper({
  value,
  label,
  grams,
  onChange,
}: {
  value: number;
  label: string;
  grams: boolean;
  onChange: (v: number) => void;
}) {
  const step = grams ? 10 : 0.5;
  const min = grams ? 10 : 0.5;
  return (
    <View style={styles.stepper}>
      <IconButton
        icon={Minus}
        variant="outline"
        accessibilityLabel="Less"
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - step))}
      />
      <Text variant="title" numeric style={styles.stepValue}>
        {label}
      </Text>
      <IconButton
        icon={Plus}
        variant="outline"
        accessibilityLabel="More"
        onPress={() => onChange(value + step)}
      />
    </View>
  );
}

export function MealSheet({
  visible,
  value,
  onPick,
  onClose,
  title = "Add to",
}: {
  visible: boolean;
  value: MealSlot;
  onPick: (m: MealSlot) => void;
  onClose: () => void;
  title?: string;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {MEAL_SLOTS.map((m) => (
        <SheetRow
          key={m.value}
          label={m.value === value ? `${m.label} ✓` : m.label}
          onPress={() => {
            onPick(m.value);
            onClose();
          }}
        />
      ))}
    </Sheet>
  );
}

/** F5-14: only when a free athlete taps a paid feature. Short, honest and easy to dismiss. */
export function UpgradeSheet({
  visible,
  title,
  onClose,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      sub="Part of Arcwell Plus, with full macros, meal plans, AI training plans and recovery tracking."
    >
      <SheetRow
        label="See plans"
        onPress={() => {
          onClose();
          router.push("/athlete/ai");
        }}
      />
      <SheetRow label="Not now" onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  shrink: { flexShrink: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 64,
  },
  rowMain: {
    flex: 1,
    gap: space[1] / 2,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingVertical: space[2],
  },
  tag: {
    paddingHorizontal: space[2],
    paddingVertical: space[1] / 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  box: {
    flexDirection: "row",
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  cell: { flex: 1, gap: space[1] / 2 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space[3],
  },
  stepValue: { flex: 1, textAlign: "center" },
});
