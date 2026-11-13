// The day's food log (F5-01 to F5-03): kcal left as the hero number, eaten and target beside it,
// macro bars that fill past 100% without turning red, then Breakfast, Lunch, Snacks and Dinner.
// Free athletes see calories only and one dismissible Arcwell Plus card (D5); paid and coached
// athletes see macros and their meal plan. Swipe between days with the arrows.
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronRight,
  Plus,
  RotateCcw,
  Utensils,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import {
  kcalText,
  newLogId,
  slotNow,
  useNutrition,
} from "@/features/athlete/FoodParts";
import { useDayPicker } from "@/features/athlete/useToday";
import {
  type FoodLog,
  type Macros,
  MEAL_SLOTS,
  type MealSlot,
  portionText,
  shiftDate,
  sumMacros,
} from "@/features/athlete/foods";
import {
  athleteMenuAction,
  progressAction,
} from "@/features/athlete/MenuParts";
import { MealPlanBody } from "@/features/athlete/MealPlanBody";
import { AthletePage, NotJoined } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Bars, PageHeader, Pills } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";
import { WaterCard } from "@/features/athlete/Water";
import { UndoDock } from "@/features/athlete/UndoDock";
import { FoodScanButton } from "@/features/athlete/FoodScanButton";
import {
  CaloriesCard,
  DateStrip,
  MacroCards,
  macroColor,
  StreakPill,
} from "@/features/athlete/NutritionParts";
import { logStreak } from "@/features/athlete/streak";
import { FIBRE_TARGET_G, foodQuality } from "@/features/athlete/foodQuality";
import { FoodQualityCard } from "@/features/athlete/FoodQualityCard";

function DayPage({
  date,
  today,
  openPlan,
}: {
  date: string;
  today: string;
  openPlan: () => void;
}) {
  const n = useNutrition();
  const { hideUpgrade, setHideUpgrade } = useCoachData();
  if (!n.me) return null;

  const plan = n.plan;
  const day = n.logs.filter((l) => l.date === date);
  const eaten = sumMacros(day.map((l) => l.macros));
  const target = plan?.kcal ?? 0;
  const open = (meal: MealSlot) =>
    router.push({ pathname: "/athlete/food/add", params: { meal, date } });
  const edit = (l: FoodLog) =>
    router.push({
      pathname: l.foodId ? "/athlete/food/portion" : "/athlete/food/quick",
      params: { logId: l.id, date },
    });
  const hasPlan = n.macros && !!plan?.meals.some((m) => m.items?.length);
  const planDone = plan
    ? plan.meals.filter((m) =>
        day.some((l) => l.fromPlan === m.id || l.swappedFor === m.id),
      ).length
    : 0;

  // Fibre comes from the foods with a known fibre value (D103).
  const quality = foodQuality(day, {
    weightKg: n.me.weights.at(-1) ?? 70,
    bedMinute: n.me.protocol?.bed ?? 22 * 60 + 30,
    mine: n.myFoods,
  });

  return (
    <AthletePage dock>
      <CaloriesCard
        eaten={eaten.kcal}
        target={target}
        waiting={
          n.coached
            ? `${n.coachName} is setting your targets`
            : "Calories eaten"
        }
      />
      {n.macros && plan ? (
        <MacroCards
          eaten={{
            protein: eaten.p,
            carbs: eaten.c,
            fat: eaten.f,
            fibre: quality.fibre,
          }}
          target={{
            protein: plan.protein,
            carbs: plan.carbs,
            fat: plan.fat,
            fibre: FIBRE_TARGET_G,
          }}
        />
      ) : null}

      {n.macros && day.length ? <FoodQualityCard q={quality} /> : null}

      {date === today ? <WaterCard /> : null}

      {n.tier === "free" && !hideUpgrade ? (
        <View style={styles.upsell}>
          <View style={styles.flex}>
            <Text weight="semibold">See protein, carbs and fat</Text>
            <Text variant="label" weight="regular" tone="muted">
              Full macros and meal plans come with Arcwell Plus.
            </Text>
            <PressableScale
              onPress={() => router.push("/athlete/ai")}
              accessibilityRole="link"
            >
              <Text variant="label" style={styles.link}>
                Learn more
              </Text>
            </PressableScale>
          </View>
          <IconButton
            icon={X}
            accessibilityLabel="Hide this card"
            onPress={() => setHideUpgrade(true)}
          />
        </View>
      ) : null}

      {hasPlan && plan ? (
        <PressableScale
          onPress={openPlan}
          accessibilityRole="button"
          style={styles.planRow}
        >
          <View style={styles.flex}>
            <Text weight="semibold">
              {n.coached ? `Meal plan from ${n.coachName}` : "Your meal plan"}
            </Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {planDone} of {plan.meals.length} meals logged · tap a meal to log
              it in one go
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </PressableScale>
      ) : null}

      {day.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.ghost}>
            <View style={styles.thumb}>
              <Utensils size={20} color={colors.textMuted} />
            </View>
            <View style={styles.ghostLines}>
              <View style={styles.ghostLine} />
              <View style={[styles.ghostLine, styles.ghostShort]} />
            </View>
          </View>
          <Text tone="muted" style={styles.center}>
            {date === today
              ? "Scan or add your first meal of the day."
              : "Nothing logged this day."}
          </Text>
        </View>
      ) : null}

      {MEAL_SLOTS.map((m) => {
        const items = day.filter((l) => l.meal === m.value);
        const total = sumMacros(items.map((l) => l.macros));
        // One tap to repeat yesterday's meal into an empty slot (D96): urban routines repeat.
        const yesterday = items.length
          ? []
          : n.logs.filter(
              (l) => l.date === shiftDate(date, -1) && l.meal === m.value,
            );
        return (
          <View key={m.value} style={styles.meal}>
            <View style={styles.mealHead}>
              <Text weight="semibold" style={styles.flex}>
                {m.label}
              </Text>
              <Text variant="label" tone="muted" numeric>
                {items.length ? kcalText(total.kcal) : "—"}
              </Text>
            </View>
            {items.map((l) => (
              <PressableScale
                key={l.id}
                onPress={() => edit(l)}
                accessibilityRole="button"
                accessibilityLabel={`${l.name}, ${portionText(l.qty, l.unit)}, ${Math.round(l.macros.kcal)} kcal. Edit`}
                style={styles.item}
              >
                {l.photoUri ? (
                  <Image
                    source={{ uri: l.photoUri }}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.thumb}>
                    <Utensils size={18} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.flex}>
                  <Text weight="medium" numberOfLines={1}>
                    {l.name}
                  </Text>
                  <Text variant="label" weight="regular" tone="muted" numeric>
                    {l.source === "quick"
                      ? "Quick add"
                      : portionText(l.qty, l.unit)}
                    {l.cooked === "restaurant" ? " · restaurant" : ""}
                    {l.swappedFor ? " · instead of plan" : ""}
                  </Text>
                  {n.macros ? (
                    <View style={styles.dots}>
                      {(
                        [
                          ["protein", l.macros.p],
                          ["carbs", l.macros.c],
                          ["fat", l.macros.f],
                        ] as const
                      ).map(([k, g]) => (
                        <View key={k} style={styles.dotItem}>
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: macroColor(k) },
                            ]}
                          />
                          <Text variant="caption" tone="muted" numeric>
                            {`${Math.round(g)}g`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
                <Text weight="semibold" numeric>
                  {Math.round(l.macros.kcal)}
                </Text>
              </PressableScale>
            ))}
            {yesterday.length ? (
              <PressableScale
                onPress={() =>
                  n.add(
                    yesterday.map((l) => ({
                      ...l,
                      id: newLogId(),
                      date,
                      at: undefined,
                      fromPlan: undefined,
                      swappedFor: undefined,
                    })),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Log the same ${m.label.toLowerCase()} as yesterday`}
                style={styles.addRow}
              >
                <RotateCcw size={18} color={colors.accent} />
                <Text weight="medium" style={styles.flex}>
                  Same as yesterday
                </Text>
                <Text variant="label" tone="muted" numeric>
                  {kcalText(sumMacros(yesterday.map((l) => l.macros)).kcal)}
                </Text>
              </PressableScale>
            ) : null}
            <PressableScale
              onPress={() => open(m.value)}
              accessibilityRole="button"
              accessibilityLabel={`Add food to ${m.label}`}
              style={styles.addRow}
            >
              <Plus size={18} color={colors.text} />
              <Text weight="medium">Add food</Text>
            </PressableScale>
          </View>
        );
      })}
    </AthletePage>
  );
}

/** Trends (D61): the last 7 or 30 days of calories, and protein for paid and coached athletes. */
function TrendsPage({ date }: { date: string }) {
  const n = useNutrition();
  const [span, setSpan] = useState<"7" | "30">("7");
  const count = Number(span);
  const days = Array.from({ length: count }, (_, i) =>
    shiftDate(date, i - count + 1),
  ).map((d) => {
    const ls = n.logs.filter((l) => l.date === d);
    return {
      date: d,
      m: sumMacros(ls.map((l) => l.macros)),
      logged: ls.length > 0,
    };
  });
  const logged = days.filter((d) => d.logged);
  const avg = (pick: (m: Macros) => number) =>
    logged.length
      ? Math.round(logged.reduce((s, d) => s + pick(d.m), 0) / logged.length)
      : 0;
  const target = n.plan?.kcal ?? 0;
  const onTarget = target
    ? logged.filter((d) => Math.abs(d.m.kcal - target) <= target * 0.1).length
    : 0;
  const labels = days.map((d, i) =>
    count === 7 || i % 5 === 0 ? d.date.slice(8) : "",
  );
  return (
    <AthletePage>
      <Pills
        value={span}
        onChange={setSpan}
        options={[
          { value: "7", label: "7 days" },
          { value: "30", label: "30 days" },
        ]}
      />
      <View style={styles.macros}>
        <View style={styles.macro}>
          <Text variant="caption" tone="muted">
            Average
          </Text>
          <Text weight="semibold" numeric>
            {kcalText(avg((m) => m.kcal))}
          </Text>
        </View>
        {n.macros ? (
          <View style={styles.macro}>
            <Text variant="caption" tone="muted">
              Protein
            </Text>
            <Text weight="semibold" numeric>
              {avg((m) => m.p)} g
            </Text>
          </View>
        ) : null}
        <View style={styles.macro}>
          <Text variant="caption" tone="muted">
            On target
          </Text>
          <Text weight="semibold" numeric>
            {onTarget} of {logged.length}
          </Text>
        </View>
      </View>
      <View style={styles.meal}>
        <Text weight="semibold">Calories</Text>
        <Bars
          values={days.map((d) => d.m.kcal)}
          target={target || undefined}
          labels={labels}
        />
      </View>
      {n.macros && n.plan ? (
        <View style={styles.meal}>
          <Text weight="semibold">Protein</Text>
          <Bars
            values={days.map((d) => d.m.p)}
            target={n.plan.protein}
            labels={labels}
          />
        </View>
      ) : null}
    </AthletePage>
  );
}

type NutritionTab = "day" | "plan" | "trends";
const TABS: { key: NutritionTab; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "plan", label: "Meal plan" },
  { key: "trends", label: "Trends" },
];

/** Nutrition (D61): Day · Meal plan · Trends as section tabs, sharing one date. */
export default function Nutrition() {
  const n = useNutrition();
  const { removedFood } = useCoachData();
  const { today, date, setDate } = useDayPicker();
  const [tab, setTab] = useState<NutritionTab>("day");
  if (!n.me) return <NotJoined />;
  const slot = date === today ? slotNow() : "lunch";
  return (
    <View style={styles.root}>
      <PageHeader
        title="Nutrition"
        right={
          <StreakPill
            streak={logStreak(
              n.logs.map((l) => l.date),
              today,
            )}
          />
        }
        actions={[progressAction, athleteMenuAction]}
      />
      <DateStrip
        date={date}
        today={today}
        onSelect={setDate}
        share={(d) => {
          const kcal = sumMacros(
            n.logs.filter((l) => l.date === d).map((l) => l.macros),
          ).kcal;
          return n.plan?.kcal ? kcal / n.plan.kcal : kcal > 0 ? 1 : 0;
        }}
      />
      <SectionTabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        pages={[
          <DayPage
            key="d"
            date={date}
            today={today}
            openPlan={() => setTab("plan")}
          />,
          <AthletePage key="p" dock>
            {n.macros ? (
              <MealPlanBody date={date} />
            ) : (
              <View style={styles.upsell}>
                <View style={styles.flex}>
                  <Text weight="semibold">
                    Meal plans come with Arcwell Plus
                  </Text>
                  <Text variant="label" weight="regular" tone="muted">
                    Indian meals fitted to your targets, logged in one tap.
                  </Text>
                  <PressableScale
                    onPress={() => router.push("/athlete/ai")}
                    accessibilityRole="link"
                  >
                    <Text variant="label" style={styles.link}>
                      Learn more
                    </Text>
                  </PressableScale>
                </View>
              </View>
            )}
          </AthletePage>,
          <TrendsPage key="t" date={date} />,
        ]}
      />
      {removedFood?.clientId === n.me?.id ? (
        <UndoDock />
      ) : tab === "trends" ? null : (
        <FoodScanButton meal={slot} date={date} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { flex: 1, textAlign: "center" },
  macros: { flexDirection: "row", gap: space[2] },
  macro: {
    flex: 1,
    gap: space[1] / 2,
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  upsell: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  link: { textDecorationLine: "underline" },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  empty: {
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  ghost: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  ghostLines: { flex: 1, gap: space[2] },
  ghostLine: {
    height: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  ghostShort: { width: "60%" },
  thumb: {
    width: space[12],
    height: space[12],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: { flexDirection: "row", gap: space[2], paddingTop: space[1] / 2 },
  dotItem: { flexDirection: "row", alignItems: "center", gap: space[1] },
  dot: { width: 7, height: 7, borderRadius: radius.full },
  meal: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  mealHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: space[1],
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
