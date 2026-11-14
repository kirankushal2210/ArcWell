// Nutrition assistant (D70): what's left today, foods that close the protein gap, swaps for a plan
// meal with similar energy and at least as much protein, eating-out guidance, photo logging and
// generating a meal plan (F5-13).
// Sample build: built from the food database and the evidence rules, not a model.
import { Redirect, router } from "expo-router";
import { Camera, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import {
  DIET_OPTIONS,
  dietKey,
  EATING_OUT,
  proteinIdeas,
  swapsFor,
} from "@/features/ai/nutritionAssist";
import { todayKey, useNutrition } from "@/features/athlete/FoodParts";
import { planItemMacros, sumMacros } from "@/features/athlete/foods";
import {
  backTo,
  Bullets,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { Group, GroupRow, Pills, StatTile } from "@/features/coach/parts";
import { WhyThis } from "@/features/science/WhyThis";
import { space } from "@/theme";

type Tab = "protein" | "swap" | "out";

export default function NutritionAssistant() {
  const me = useMe();
  const n = useNutrition();
  const [tab, setTab] = useState<Tab>("protein");
  const plan = me?.nutritionPlan;
  const meals = plan?.meals.filter((m) => m.items?.length) ?? [];
  const [mealId, setMealId] = useState(meals[0]?.id ?? "");
  if (!me || !n.me) return <NotJoined />;
  // AI is Plus-only and coached athletes never see it (D44): a direct link goes back to Today.
  if (n.tier !== "pro") return <Redirect href="/athlete" />;
  const back = backTo("/athlete/ai");
  const eaten = sumMacros(
    n.logs.filter((l) => l.date === todayKey()).map((l) => l.macros),
  );
  const kcalLeft = plan ? Math.max(0, plan.kcal - eaten.kcal) : 0;
  const proteinLeft = plan ? Math.max(0, plan.protein - eaten.p) : 0;
  const diet = me.basics?.diet ?? "vegetarian";
  const dietName = (
    DIET_OPTIONS.find((d) => d.value === dietKey(diet))?.label ?? "vegetarian"
  ).toLowerCase();
  const generate = () => router.push("/athlete/assistant/meal-plan");
  const meal = meals.find((m) => m.id === mealId);
  const mealMacros = meal
    ? sumMacros((meal.items ?? []).map((i) => planItemMacros(i)))
    : null;

  return (
    <MenuPage title="Nutrition assistant" sub="Sample" back={back}>
      {plan ? (
        <View style={styles.tiles}>
          <StatTile
            label="Left today"
            value={`${Math.round(kcalLeft)}`}
            sub="kcal"
          />
          <StatTile
            label="Protein left"
            value={`${Math.round(proteinLeft)} g`}
            sub={`of ${plan.protein} g`}
          />
        </View>
      ) : null}
      <Pills
        value={tab}
        onChange={setTab}
        options={[
          { value: "protein", label: "Hit my protein" },
          { value: "swap", label: "Swap a meal" },
          { value: "out", label: "Eating out" },
        ]}
      />

      {tab === "protein" ? (
        proteinLeft <= 0 && plan ? (
          <InfoCard title="Protein's done for today">
            You&apos;ve reached your target. Anything more is fine but not
            needed.
          </InfoCard>
        ) : (
          <>
            <View style={styles.row}>
              <Text tone="muted" style={styles.flex}>
                {`Foods that fit a ${dietName} diet, about ${Math.min(30, Math.round(proteinLeft || 30))} g of protein at a time.`}
              </Text>
              <WhyThis
                title="Why protein matters"
                points={[
                  "Muscle gains level off around 1.6 g of protein per kg a day on average; up to about 2.2 g helps some people more.",
                  "Spreading it over your meals makes the day's target easier to reach.",
                ]}
                sources={["morton2018", "jager2017"]}
              />
            </View>
            <Group>
              {proteinIdeas(proteinLeft || 30, diet).map((x, i) => (
                <GroupRow key={x.food.id} first={i === 0}>
                  <View style={styles.flex}>
                    <Text weight="medium">{x.food.name}</Text>
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      {`${x.qty} × ${x.unit} · ${Math.round(x.macros.p)} g protein · ${Math.round(x.macros.kcal)} kcal`}
                    </Text>
                  </View>
                </GroupRow>
              ))}
            </Group>
          </>
        )
      ) : null}

      {tab === "swap" ? (
        meals.length && meal && mealMacros ? (
          <>
            <Pills
              value={mealId}
              onChange={setMealId}
              options={meals.map((m) => ({ value: m.id, label: m.name }))}
            />
            <Text tone="muted" numeric>
              {`${meal.name} is about ${Math.round(mealMacros.kcal)} kcal and ${Math.round(mealMacros.p)} g protein. These are similar in energy with at least as much protein:`}
            </Text>
            <Group>
              {swapsFor(mealMacros).map((x, i) => (
                <GroupRow key={x.food.id} first={i === 0}>
                  <View style={styles.flex}>
                    <Text weight="medium">{x.food.name}</Text>
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      {`1 ${x.unit} · ${Math.round(x.macros.kcal)} kcal · ${Math.round(x.macros.p)} g protein`}
                    </Text>
                  </View>
                </GroupRow>
              ))}
            </Group>
          </>
        ) : (
          <>
            <InfoCard>Swaps work from a meal plan with exact foods.</InfoCard>
            <Button
              label="Generate a meal plan"
              icon={Sparkles}
              fullWidth
              onPress={generate}
            />
          </>
        )
      ) : null}

      {tab === "out" ? (
        <InfoCard title="Eating out">
          <Bullets items={EATING_OUT} />
        </InfoCard>
      ) : null}

      {meals.length ? (
        <Button
          label="Generate a new meal plan"
          icon={Sparkles}
          variant="secondary"
          fullWidth
          onPress={generate}
        />
      ) : null}
      <Button
        label="Log a meal with a photo"
        icon={Camera}
        variant="secondary"
        fullWidth
        onPress={() => router.push("/athlete/food/photo")}
      />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", gap: space[2] },
  row: { flexDirection: "row", gap: space[2], alignItems: "flex-start" },
  flex: { flex: 1, gap: space[1] / 2 },
});
