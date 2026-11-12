// The meal plan editor shared by a client's nutrition builder and the Plans tab's meal templates
// (D56, F5-12): daily targets, then an example day of meals with exact foods and quantities, so a
// client logs a planned meal in one tap. The screen around it decides what it edits and saves.
import { Minus, Plus, Trash2, X } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

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
import { FoodPicker } from "@/features/coach/FoodPicker";
import { Eyebrow } from "@/features/coach/parts";
import { describeItems, type NutritionPlan, uid } from "@/features/coach/plans";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

export function MealPlanEditor({
  value: n,
  onChange,
  heading = "Meal plan",
  who = "Your client",
}: {
  value: NutritionPlan;
  onChange: (fn: (n: NutritionPlan) => NutritionPlan) => void;
  /** Eyebrow above the meals, e.g. "Meal plan · Vegetarian". */
  heading?: string;
  /** Who logs these meals, for the help text: a first name, or "Your client". */
  who?: string;
}) {
  const [picking, setPicking] = useState<string | null>(null);
  const macroKcal = n.protein * 4 + n.carbs * 4 + n.fat * 9;
  const gap = macroKcal - n.kcal;
  const setMeal = (mid: string, k: "name" | "time" | "foods", v: string) =>
    onChange((x) => ({
      ...x,
      meals: x.meals.map((m) => (m.id === mid ? { ...m, [k]: v } : m)),
    }));
  const setItems = (mid: string, fn: (items: PlanItem[]) => PlanItem[]) =>
    onChange((x) => ({
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
    <>
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
            onChange={(v) => onChange((x) => ({ ...x, [key]: v }))}
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

      <Eyebrow>{heading}</Eyebrow>
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
        Exact foods in katori, phulka and grams. {who} taps &quot;Ate this&quot;
        to log a meal, or logs what they ate instead and you see the swap.
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
                onChange((x) => ({
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
              Add exact foods so {who} can log this meal in one tap.
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
          onChange((x) => ({
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
    </>
  );
}

const styles = StyleSheet.create({
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
