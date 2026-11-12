// Nutrition plan builder (D56): daily targets (suggested from the client's details) plus an example
// day of Indian meals with exact foods and quantities (F5-12), so the client logs a planned meal in
// one tap and the coach sees honest adherence and swaps.
import { router, useLocalSearchParams } from "expo-router";
import { Minus, Plus, Trash2, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  NumberStepper,
  Text,
} from "@/components/primitives";
import { kcalText } from "@/features/athlete/FoodParts";
import {
  findFood,
  type PlanItem,
  planItemMacros,
  planItemText,
  sumMacros,
  unitsOf,
} from "@/features/athlete/foods";
import { useCoachData } from "@/features/coach/CoachData";
import { FoodPicker } from "@/features/coach/FoodPicker";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import {
  describeItems,
  exampleDay,
  type NutritionPlan,
  suggestTargets,
  uid,
} from "@/features/coach/plans";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function NutritionBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, saveNutrition } = useCoachData();
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
  const [picking, setPicking] = useState<string | null>(null);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <PageHeader title="Nutrition" onBack={back} />;

  const macroKcal = n.protein * 4 + n.carbs * 4 + n.fat * 9;
  const gap = macroKcal - n.kcal;
  const setMeal = (mid: string, k: "name" | "time" | "foods", v: string) =>
    setN((x) => ({
      ...x,
      meals: x.meals.map((m) => (m.id === mid ? { ...m, [k]: v } : m)),
    }));
  const setItems = (mid: string, fn: (items: PlanItem[]) => PlanItem[]) =>
    setN((x) => ({
      ...x,
      meals: x.meals.map((m) => {
        if (m.id !== mid) return m;
        const items = fn(m.items ?? []);
        return { ...m, items, foods: describeItems(items) };
      }),
    }));
  const planned = sumMacros(
    n.meals.flatMap((m) => (m.items ?? []).map((i) => planItemMacros(i))),
  );
  const pickingMeal = n.meals.find((m) => m.id === picking);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title={`Nutrition · ${c.name.split(" ")[0]}`} onBack={back} />
      <Page>
        <View style={styles.card}>
          <Text weight="semibold">
            Suggested from {c.name.split(" ")[0]}&apos;s details
          </Text>
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

        <Eyebrow>Daily targets</Eyebrow>
        {(
          [
            ["Calories", "kcal", "kcal", 50, 1000, 5000],
            ["Protein", "protein", "g", 5, 20, 350],
            ["Carbs", "carbs", "g", 5, 0, 700],
            ["Fat", "fat", "g", 5, 10, 250],
          ] as const
        ).map(([label, key, unit, step, min, max]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.flex}>{label}</Text>
            <NumberStepper
              value={n[key]}
              onChange={(v) => setN((x) => ({ ...x, [key]: v }))}
              step={step}
              min={min}
              max={max}
              unit={unit}
              accessibilityLabel={label}
            />
          </View>
        ))}
        <Text
          variant="caption"
          tone={Math.abs(gap) > 100 ? "warning" : "muted"}
          numeric
        >
          Protein, carbs and fat add up to {macroKcal.toLocaleString("en-IN")}{" "}
          kcal
          {Math.abs(gap) > 100
            ? `, ${Math.abs(gap)} ${gap > 0 ? "over" : "under"} the calorie target.`
            : "."}
        </Text>

        <Eyebrow>{`Meal plan · ${basics.diet}`}</Eyebrow>
        <View style={styles.card}>
          <Text weight="semibold" numeric>
            {kcalText(planned.kcal)} planned · target{" "}
            {n.kcal.toLocaleString("en-IN")}
          </Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            Protein {Math.round(planned.p)} of {n.protein} g · carbs{" "}
            {Math.round(planned.c)} of {n.carbs} g · fat {Math.round(planned.f)}{" "}
            of {n.fat} g
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          Exact foods in katori, phulka and grams. {c.name.split(" ")[0]} taps
          &quot;Ate this&quot; to log a meal, or logs what they ate instead and
          you see the swap.
        </Text>
        {n.meals.map((m) => (
          <View key={m.id} style={styles.meal}>
            <View style={styles.mealHead}>
              <TextInput
                value={m.name}
                onChangeText={(v) => setMeal(m.id, "name", v)}
                style={styles.mealName}
                accessibilityLabel="Meal name"
              />
              <TextInput
                value={m.time}
                onChangeText={(v) => setMeal(m.id, "time", v)}
                style={styles.mealTime}
                accessibilityLabel={`${m.name} time`}
              />
              <IconButton
                icon={Trash2}
                color={colors.textMuted}
                accessibilityLabel={`Remove ${m.name}`}
                onPress={() =>
                  setN((x) => ({
                    ...x,
                    meals: x.meals.filter((y) => y.id !== m.id),
                  }))
                }
              />
            </View>
            {m.items?.length ? (
              m.items.map((i, k) => {
                const f = findFood(i.foodId);
                const units = f ? unitsOf(f) : [];
                const grams = i.unit === "g";
                return (
                  <View key={`${i.foodId}-${k}`} style={styles.item}>
                    <View style={styles.flex}>
                      <Text weight="medium" numberOfLines={2}>
                        {planItemText(i)}
                      </Text>
                      <Text
                        variant="label"
                        weight="regular"
                        tone="muted"
                        numeric
                        onPress={() => {
                          // Tap the portion to switch unit (katori, piece, grams…).
                          const at = units.findIndex((u) => u.key === i.unit);
                          const next = units[(at + 1) % units.length];
                          if (next)
                            setItems(m.id, (list) =>
                              list.map((x, j) =>
                                j === k
                                  ? {
                                      ...x,
                                      unit: next.key,
                                      qty: next.key === "g" ? 100 : 1,
                                    }
                                  : x,
                              ),
                            );
                        }}
                      >
                        {kcalText(planItemMacros(i).kcal)} · change unit
                      </Text>
                    </View>
                    <IconButton
                      icon={Minus}
                      accessibilityLabel="Less"
                      disabled={i.qty <= (grams ? 10 : 0.5)}
                      onPress={() =>
                        setItems(m.id, (list) =>
                          list.map((x, j) =>
                            j === k
                              ? { ...x, qty: x.qty - (grams ? 10 : 0.5) }
                              : x,
                          ),
                        )
                      }
                    />
                    <IconButton
                      icon={Plus}
                      accessibilityLabel="More"
                      onPress={() =>
                        setItems(m.id, (list) =>
                          list.map((x, j) =>
                            j === k
                              ? { ...x, qty: x.qty + (grams ? 10 : 0.5) }
                              : x,
                          ),
                        )
                      }
                    />
                    <IconButton
                      icon={X}
                      color={colors.textMuted}
                      accessibilityLabel={`Remove ${f?.name ?? "food"}`}
                      onPress={() =>
                        setItems(m.id, (list) => list.filter((_, j) => j !== k))
                      }
                    />
                  </View>
                );
              })
            ) : m.foods ? (
              <TextInput
                value={m.foods}
                onChangeText={(v) => setMeal(m.id, "foods", v)}
                placeholder="Foods and portions"
                placeholderTextColor={colors.textMuted}
                multiline
                style={styles.foods}
                accessibilityLabel={`${m.name} foods`}
              />
            ) : null}
            {!m.items?.length && m.foods ? (
              <Text variant="caption" tone="muted">
                Add exact foods so {c.name.split(" ")[0]} can log this meal in
                one tap.
              </Text>
            ) : null}
            <Button
              label="Add food"
              icon={Plus}
              variant="ghost"
              onPress={() => setPicking(m.id)}
            />
          </View>
        ))}
        <Button
          label="Add a meal"
          icon={Plus}
          variant="secondary"
          fullWidth
          onPress={() =>
            setN((x) => ({
              ...x,
              meals: [
                ...x.meals,
                {
                  id: uid("m"),
                  name: "Snack",
                  time: "11:00 am",
                  foods: "",
                  items: [],
                },
              ],
            }))
          }
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
      <FoodPicker
        visible={picking !== null}
        title={pickingMeal ? `Add to ${pickingMeal.name}` : "Add food"}
        onClose={() => setPicking(null)}
        onPick={(f) => {
          if (picking)
            setItems(picking, (list) => [
              ...list,
              {
                foodId: f.id,
                qty: f.units[0] ? 1 : 100,
                unit: f.units[0]?.key ?? "g",
              },
            ]);
          setPicking(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  meal: {
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  mealHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
  mealName: {
    flex: 1,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.base,
    color: colors.text,
    paddingVertical: space[1],
  },
  mealTime: {
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.textMuted,
    paddingVertical: space[1],
    minWidth: 72,
    textAlign: "right",
  },
  foods: {
    minHeight: 48,
    padding: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
