// Nutrition plan builder (D56): daily targets (suggested from the client's details) plus an example
// day of Indian meals with exact foods and quantities (F5-12), so the client logs a planned meal in
// one tap and the coach sees honest adherence and swaps. Can start from a meal template.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { MealPlanEditor } from "@/features/coach/MealPlanEditor";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  cloneNutrition,
  exampleDay,
  type NutritionPlan,
  suggestTargets,
} from "@/features/coach/plans";
import { colors, radius, rhythm, space } from "@/theme";

export default function NutritionBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, saveNutrition, templates } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const basics = c?.basics ?? {
    sex: "unsaid" as const,
    age: 30,
    heightCm: 168,
    weightKg: c?.weights[c.weights.length - 1] ?? 70,
    diet: c?.answers.find(([k]) => k === "Diet")?.[1] ?? "Vegetarian",
    injuries: "",
  };
  const suggested = suggestTargets({ ...basics, goal: c?.goal ?? "" });
  const [n, setN] = useState<NutritionPlan>(
    () => c?.nutritionPlan ?? { ...suggested, meals: exampleDay(basics.diet) },
  );
  const meals = templates.filter((t) => t.kind === "meals" && t.nutrition);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <PageHeader title="Nutrition" onBack={back} />;
  const first = c.name.split(" ")[0];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title={`Nutrition · ${first}`} onBack={back} />
      <Page>
        <View style={styles.card}>
          <Text weight="semibold">Suggested from {first}&apos;s details</Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {suggested.kcal.toLocaleString("en-IN")} kcal · {suggested.protein}{" "}
            g protein · {suggested.carbs} g carbs · {suggested.fat} g fat. Based
            on {basics.age} yrs, {basics.heightCm} cm, {basics.weightKg} kg and
            the goal.
          </Text>
          <Button
            label="Use these"
            variant="secondary"
            onPress={() => setN((x) => ({ ...x, ...suggested }))}
          />
        </View>
        {meals.length ? (
          <>
            <Eyebrow>Or start from a template</Eyebrow>
            <Pills
              value=""
              onChange={(v) => {
                const t = meals.find((x) => x.id === v);
                if (t?.nutrition) setN(cloneNutrition(t.nutrition));
              }}
              options={meals.map((t) => ({ value: t.id, label: t.name }))}
            />
          </>
        ) : null}
        <MealPlanEditor
          value={n}
          onChange={setN}
          heading={`Meal plan · ${basics.diet}`}
          who={first}
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save nutrition plan"
          fullWidth
          disabled={n.meals.length === 0}
          onPress={() => {
            saveNutrition(c.id, n);
            back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
