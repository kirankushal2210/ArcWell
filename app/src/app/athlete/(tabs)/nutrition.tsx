// The day's food log (F5-01 to F5-03): kcal left as the hero number, eaten and target beside it,
// macro bars that fill past 100% without turning red, then Breakfast, Lunch, Snacks and Dinner.
// Free athletes see calories only and one dismissible Arcwell Plus card (D5); paid and coached
// athletes see macros and their meal plan. Swipe between days with the arrows.
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import {
  kcalText,
  slotNow,
  todayKey,
  useNutrition,
} from "@/features/athlete/FoodParts";
import {
  dateLabel,
  type FoodLog,
  type Macros,
  MEAL_SLOTS,
  type MealSlot,
  portionText,
  shiftDate,
  slotLabel,
  sumMacros,
} from "@/features/athlete/foods";
import { MealPlanBody } from "@/features/athlete/MealPlanBody";
import { AthletePage, NotJoined } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Bars, PageHeader, Pills } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

function Bar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

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
  const left = target - eaten.kcal;
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

  return (
    <AthletePage>
      <View style={styles.hero}>
        {target ? (
          <>
            <Text variant="display" numeric>
              {Math.abs(Math.round(left)).toLocaleString("en-IN")}
            </Text>
            <Text tone="muted">
              {left >= 0 ? "kcal left" : "kcal over target"}
            </Text>
            <Bar value={eaten.kcal} target={target} />
            <Text variant="label" weight="regular" tone="muted" numeric>
              {Math.round(eaten.kcal).toLocaleString("en-IN")} eaten · target{" "}
              {target.toLocaleString("en-IN")}
            </Text>
          </>
        ) : (
          <>
            <Text variant="display" numeric>
              {Math.round(eaten.kcal).toLocaleString("en-IN")}
            </Text>
            <Text tone="muted">
              kcal eaten · {n.coachName} is still setting your targets
            </Text>
          </>
        )}
      </View>

      {n.macros && plan ? (
        <View style={styles.macros}>
          {(
            [
              ["Protein", eaten.p, plan.protein],
              ["Carbs", eaten.c, plan.carbs],
              ["Fat", eaten.f, plan.fat],
            ] as const
          ).map(([label, v, t]) => (
            <View key={label} style={styles.macro}>
              <Text variant="caption" tone="muted">
                {label}
              </Text>
              <Text weight="semibold" numeric>
                {Math.round(v)} / {t} g
              </Text>
              <Bar value={v} target={t} />
            </View>
          ))}
        </View>
      ) : null}

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
          <Text variant="title" style={styles.center}>
            Nothing logged {date === today ? "yet today" : "this day"}
          </Text>
          <Text tone="muted" style={styles.center}>
            {date === today
              ? "Start with what you just ate. Your recent foods are one tap away."
              : "Add what you remember. Something beats nothing."}
          </Text>
          <Button
            label={`Log ${slotLabel(date === today ? slotNow() : "lunch").toLowerCase()}`}
            icon={Plus}
            onPress={() => open(date === today ? slotNow() : "lunch")}
          />
        </View>
      ) : null}

      {MEAL_SLOTS.map((m) => {
        const items = day.filter((l) => l.meal === m.value);
        const total = sumMacros(items.map((l) => l.macros));
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
                </View>
                <Text numeric>{Math.round(l.macros.kcal)}</Text>
              </PressableScale>
            ))}
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
      <Text variant="caption" tone="muted">
        Sample food data: numbers are estimates until the reviewed Indian food
        data arrives.
      </Text>
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
      <Text variant="caption" tone="muted">
        The line is your target. On target means within 10% of your calories.
        Days with nothing logged are left out of the averages.
      </Text>
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
  const [today] = useState(todayKey);
  const [date, setDate] = useState(today);
  const [tab, setTab] = useState<NutritionTab>("day");
  if (!n.me) return <NotJoined />;
  return (
    <View style={styles.root}>
      <PageHeader
        title="Nutrition"
        sub={n.coached && n.plan ? `Targets from ${n.coachName}` : undefined}
      />
      <View style={styles.dates}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel="Previous day"
          onPress={() => setDate((d) => shiftDate(d, -1))}
        />
        <Text weight="semibold" style={styles.center}>
          {dateLabel(date, today)}
        </Text>
        <IconButton
          icon={ChevronRight}
          accessibilityLabel="Next day"
          disabled={date >= today}
          onPress={() => setDate((d) => shiftDate(d, 1))}
        />
      </View>
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
          <AthletePage key="p">
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { flex: 1, textAlign: "center" },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space[2],
  },
  hero: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  track: {
    height: 8,
    marginTop: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: radius.full, backgroundColor: colors.brand },
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
    padding: space[6],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
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
