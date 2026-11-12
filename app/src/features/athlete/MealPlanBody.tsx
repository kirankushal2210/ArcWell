// The meal plan (F5-12): fixed meals with exact foods and quantities, from the coach (coached)
// or built from the athlete's answers (paid; rules, not AI). "Ate this" logs the whole meal in one
// tap; "Ate something else" opens search and records the swap, so adherence stays honest. Tap one
// food to log it alone or change its portion.
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { kcalText, newLogId, useNutrition } from "@/features/athlete/FoodParts";
import {
  findFood,
  type FoodLog,
  logFromItem,
  planItemMacros,
  planItemText,
  slotForMeal,
  sumMacros,
  unitsOf,
} from "@/features/athlete/foods";
import { colors, radius, space } from "@/theme";

export function MealPlanBody({ date }: { date: string }) {
  const n = useNutrition();
  if (!n.me) return null;
  const plan = n.plan;
  if (!plan)
    return (
      <Text tone="muted">
        {n.coached
          ? `${n.coachName} is still building your meal plan.`
          : "Your meal plan shows here."}
      </Text>
    );
  const day = n.logs.filter((l) => l.date === date);

  return (
    <>
      <Text tone="muted" numeric>
        {`${n.coached ? `From ${n.coachName}` : "Built from your answers"} · ${plan.kcal.toLocaleString("en-IN")} kcal · ${plan.protein} g protein`}
      </Text>
      {plan.meals.map((m) => {
        const items = m.items ?? [];
        const total = sumMacros(items.map((i) => planItemMacros(i, n.myFoods)));
        const ate = day.filter((l) => l.fromPlan === m.id);
        const swapped = day.filter((l) => l.swappedFor === m.id);
        const slot = slotForMeal(m.name, m.time);
        const done = ate.length > 0 || swapped.length > 0;
        return (
          <View key={m.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.flex}>
                <Text weight="semibold">
                  {m.name} <Text tone="muted">· {m.time}</Text>
                </Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {items.length ? kcalText(total.kcal) : "No exact foods yet"}
                </Text>
              </View>
              {done ? (
                <View style={styles.done}>
                  <Check size={16} strokeWidth={3} color={colors.onBrand} />
                </View>
              ) : null}
            </View>
            {items.length ? (
              items.map((i, k) => {
                const f = findFood(i.foodId, n.myFoods);
                const u = f
                  ? unitsOf(f).find((x) => x.key === i.unit)
                  : undefined;
                return (
                  <PressableScale
                    key={`${i.foodId}-${k}`}
                    onPress={() =>
                      router.push({
                        pathname: "/athlete/food/portion",
                        params: {
                          foodId: i.foodId,
                          meal: slot,
                          date,
                          qty: String(
                            u?.key === "g" ? i.qty * (u?.grams ?? 1) : i.qty,
                          ),
                          unit: u?.label ?? "g",
                          fromPlan: m.id,
                        },
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Log ${planItemText(i, n.myFoods)} only`}
                    style={styles.item}
                  >
                    <Text style={styles.flex}>
                      {planItemText(i, n.myFoods)}
                    </Text>
                    <Text variant="label" tone="muted" numeric>
                      {Math.round(planItemMacros(i, n.myFoods).kcal)}
                    </Text>
                  </PressableScale>
                );
              })
            ) : (
              <Text tone="muted">{m.foods}</Text>
            )}
            {done ? (
              <Text variant="label" weight="regular" tone="muted">
                {swapped.length
                  ? `Ate something else: ${swapped.map((l) => l.name).join(", ")}`
                  : `Logged ${ate.length === items.length ? "as planned" : `${ate.length} of ${items.length} foods`}`}
              </Text>
            ) : (
              <View style={styles.actions}>
                {items.length ? (
                  <View style={styles.flex}>
                    <Button
                      label="Ate this"
                      fullWidth
                      onPress={() =>
                        n.add(
                          items
                            .map((i) =>
                              logFromItem(i, date, slot, newLogId(), n.myFoods),
                            )
                            .filter((l): l is FoodLog => !!l)
                            .map((l) => ({ ...l, fromPlan: m.id })),
                        )
                      }
                    />
                  </View>
                ) : null}
                <View style={styles.flex}>
                  <Button
                    label="Something else"
                    variant="secondary"
                    fullWidth
                    onPress={() =>
                      router.push({
                        pathname: "/athlete/food/add",
                        params: { meal: slot, date, swapFor: m.id },
                      })
                    }
                  />
                </View>
              </View>
            )}
            {done ? (
              <Button
                label="Undo"
                variant="ghost"
                onPress={() =>
                  [...ate, ...swapped].forEach((l) => n.remove(l.id))
                }
              />
            ) : null}
          </View>
        );
      })}
      <Text variant="caption" tone="muted">
        {n.coached
          ? `Swaps are fine. ${n.coachName} sees what you ate instead.`
          : "Swaps are fine if you stay near your targets."}
      </Text>
      {n.me?.supplements?.length ? (
        <View style={styles.card}>
          <Text weight="semibold">Supplements</Text>
          {n.me.supplements.map((s) => (
            <View key={s.id} style={styles.flex}>
              <Text weight="medium">
                {s.name}
                {s.amount ? ` · ${s.amount}` : ""}
              </Text>
              <Text variant="label" weight="regular" tone="muted">
                {[s.timing, s.note].filter(Boolean).join(" · ")}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  done: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actions: { flexDirection: "row", gap: space[2] },
});
