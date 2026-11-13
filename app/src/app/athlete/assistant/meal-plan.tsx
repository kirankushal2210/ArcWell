// Generate a meal plan (F5-13, D70): meals a day and diet, then a day of Indian meals in home
// portions sized to the athlete's targets, ready to review. Nothing changes until "Use this plan";
// then it is their meal plan, with "Ate this" and swaps working on it. Plus only; coached athletes
// never see it (D44). Sample build: rules over the food database stand in for the AI.
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { generateMealPlan, type Targets } from "@/features/ai/mealPlanGen";
import {
  DIET_OPTIONS,
  type DietKey,
  dietKey,
} from "@/features/ai/nutritionAssist";
import { kcalText } from "@/features/athlete/FoodParts";
import {
  planItemMacros,
  planItemText,
  sumMacros,
} from "@/features/athlete/foods";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  Pills,
  StatTile,
} from "@/features/coach/parts";
import { suggestTargets } from "@/features/coach/plans";
import { WhyThis } from "@/features/science/WhyThis";
import { space } from "@/theme";

const MEALS = ["2", "3", "4", "5"];

/** Meals a day from the current plan, else the onboarding answer ("5+" is 5), else 4. */
function mealsFrom(planMeals?: number, answer?: unknown) {
  if (planMeals && planMeals >= 2 && planMeals <= 5) return String(planMeals);
  const n = parseInt(String(answer ?? ""), 10);
  return n >= 2 ? String(Math.min(5, n)) : "4";
}

export default function GenerateMealPlan() {
  const me = useMe();
  const { meTier, saveNutrition } = useCoachData();
  const [meals, setMeals] = useState(() =>
    mealsFrom(me?.nutritionPlan?.meals.length, me?.selfAnswers?.mealsPerDay),
  );
  const [diet, setDiet] = useState<DietKey>(() => dietKey(me?.basics?.diet));
  const [variant, setVariant] = useState<number | null>(null);
  if (!me) return <NotJoined />;
  // AI is Plus-only and coached athletes never see it (D44): a direct link goes back to Today.
  if (meTier !== "pro") return <Redirect href="/athlete" />;
  const back = backTo("/athlete/nutrition");

  const plan = me.nutritionPlan;
  const targets: Targets | null = plan
    ? plan
    : me.basics
      ? suggestTargets({ ...me.basics, goal: me.goal })
      : null;
  if (!targets)
    return (
      <MenuPage title="Generate a meal plan" sub="Sample" back={back}>
        <InfoCard>
          Add your height, weight and age in your profile first, so the plan can
          match your energy needs.
        </InfoCard>
      </MenuPage>
    );

  const targetLine = `${targets.kcal.toLocaleString("en-IN")} kcal · ${targets.protein} g protein · ${targets.carbs} g carbs · ${targets.fat} g fat`;

  if (variant === null)
    return (
      <MenuPage
        title="Generate a meal plan"
        sub="Sample"
        back={back}
        footer={
          <Button
            label="Build my meal plan"
            fullWidth
            onPress={() => setVariant(0)}
          />
        }
      >
        <Eyebrow>Meals a day</Eyebrow>
        <Pills
          value={meals}
          onChange={setMeals}
          options={MEALS.map((m) => ({ value: m, label: m }))}
        />
        <Eyebrow>Diet</Eyebrow>
        <Pills value={diet} onChange={setDiet} options={DIET_OPTIONS} />
        <InfoCard title="Your targets">
          <Text tone="muted" numeric>
            {targetLine}
          </Text>
        </InfoCard>
        <Text variant="caption" tone="muted">
          Indian foods in home portions, sized to your targets.
        </Text>
      </MenuPage>
    );

  const gen = generateMealPlan({
    targets,
    diet,
    meals: Number(meals),
    variant,
  });
  return (
    <MenuPage
      title="Your meal plan"
      sub={`${gen.meals.length} meals · sample`}
      back={() => setVariant(null)}
      footer={
        <View style={styles.footer}>
          <View style={styles.flex}>
            <Button
              label="Try another"
              variant="secondary"
              fullWidth
              onPress={() => setVariant(variant + 1)}
            />
          </View>
          <View style={styles.flex}>
            <Button
              label="Use this plan"
              fullWidth
              onPress={() => {
                saveNutrition(me.id, {
                  kcal: targets.kcal,
                  protein: targets.protein,
                  carbs: targets.carbs,
                  fat: targets.fat,
                  meals: gen.meals,
                });
                if (router.canDismiss()) router.dismissAll();
                router.replace("/athlete/nutrition");
              }}
            />
          </View>
        </View>
      }
    >
      <View style={styles.tiles}>
        <StatTile
          label="Energy"
          value={`${Math.round(gen.totals.kcal).toLocaleString("en-IN")}`}
          sub={`of ${targets.kcal.toLocaleString("en-IN")} kcal`}
        />
        <StatTile
          label="Protein"
          value={`${Math.round(gen.totals.p)} g`}
          sub={`of ${targets.protein} g`}
        />
      </View>
      <View style={styles.row}>
        <Text variant="label" weight="regular" tone="muted" style={styles.flex}>
          {`${Math.round(gen.totals.c)} g carbs · ${Math.round(gen.totals.f)} g fat`}
        </Text>
        <WhyThis
          title="How it's built"
          points={[
            "Protein comes first and is spread over your meals; most people who train do well on 1.6 g per kg a day or a little more.",
            "Roti, rice and other carbs are then sized to your energy target.",
          ]}
          sources={["morton2018", "jager2017"]}
        />
      </View>
      <Group>
        {gen.meals.map((m, i) => {
          const items = m.items ?? [];
          const kcal = sumMacros(items.map((x) => planItemMacros(x))).kcal;
          return (
            <GroupRow key={m.id} first={i === 0}>
              <View style={styles.flex}>
                <Text weight="semibold">
                  {m.name} <Text tone="muted">· {m.time}</Text>
                </Text>
                <Text variant="label" weight="regular" tone="muted">
                  {items.map((x) => planItemText(x)).join(" · ")}
                </Text>
              </View>
              <Text variant="label" tone="muted" numeric>
                {kcalText(kcal)}
              </Text>
            </GroupRow>
          );
        })}
      </Group>
      <Text variant="caption" tone="muted">
        It replaces your current meal plan. Your logs stay.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", gap: space[2] },
  row: { flexDirection: "row", gap: space[2], alignItems: "flex-start" },
  flex: { flex: 1, gap: space[1] / 2 },
  footer: { flexDirection: "row", gap: space[2] },
});
