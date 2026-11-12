// Portion picker (F5-06): Indian units first (katori, piece, roti, glass), each with its gram weight,
// grams always available; the stepper moves in halves. Home-style or restaurant changes the oil, the
// biggest error in Indian food logs. Free athletes see the calories box only (D5). Opened on a
// logged food, the same screen edits it: change the portion, move it to another meal, or delete it.
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, PressableScale, Text } from "@/components/primitives";
import {
  backToLog,
  kcalText,
  MacroBox,
  MealSheet,
  newLogId,
  PortionStepper,
  slotNow,
  SourceTag,
  todayKey,
  useNutrition,
} from "@/features/athlete/FoodParts";
import {
  findFood,
  macrosFor,
  type MealSlot,
  portionText,
  slotLabel,
  unitsOf,
} from "@/features/athlete/foods";
import { Page, PageHeader, Pills } from "@/features/coach/parts";
import { colors, rhythm, space } from "@/theme";

export default function Portion() {
  const p = useLocalSearchParams<{
    foodId?: string;
    logId?: string;
    meal?: MealSlot;
    date?: string;
    qty?: string;
    unit?: string;
    swapFor?: string;
    fromPlan?: string;
  }>();
  const n = useNutrition();
  const insets = useSafeAreaInsets();
  const log = p.logId ? n.logs.find((l) => l.id === p.logId) : undefined;
  const food = findFood(log?.foodId ?? p.foodId, n.myFoods);
  const units = food ? unitsOf(food) : [];
  const startUnit =
    units.find((u) => u.label === (log?.unit ?? p.unit)) ?? units[0];
  const [unitKey, setUnitKey] = useState(startUnit?.key ?? "g");
  const [qty, setQty] = useState(() =>
    log ? log.qty : p.qty ? Number(p.qty) : startUnit?.key === "g" ? 100 : 1,
  );
  const [cooked, setCooked] = useState<"home" | "restaurant">(
    log?.cooked ?? "home",
  );
  const [meal, setMeal] = useState<MealSlot>(
    () => log?.meal ?? p.meal ?? slotNow(),
  );
  const [mealSheet, setMealSheet] = useState(false);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/nutrition");
  if (!food) return <PageHeader title="Food" onBack={back} />;

  const unit = units.find((u) => u.key === unitKey) ?? units[0];
  const grams = unit.key === "g" ? qty : unit.grams * qty;
  const m = macrosFor(food, grams, cooked);

  const save = () => {
    const entry = {
      id: log?.id ?? newLogId(),
      date: log?.date ?? p.date ?? todayKey(),
      meal,
      foodId: food.id,
      name: food.name,
      qty,
      unit: unit.label,
      grams,
      cooked: food.oil ? cooked : undefined,
      source: food.source,
      macros: m,
      fromPlan: log?.fromPlan ?? p.fromPlan,
      swappedFor: log?.swappedFor ?? p.swapFor,
    };
    if (log) n.update(entry);
    else n.add([entry]);
    backToLog();
  };

  return (
    <View style={styles.root}>
      <PageHeader
        title={food.name}
        onBack={back}
        actions={
          log
            ? [
                {
                  icon: Trash2,
                  label: "Delete from log",
                  onPress: () =>
                    Alert.alert(`Remove ${food.name}?`, undefined, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => {
                          n.remove(log.id);
                          back();
                        },
                      },
                    ]),
                },
              ]
            : []
        }
      />
      <Page>
        <View style={styles.tagRow}>
          <SourceTag source={food.source} />
          <Text variant="label" weight="regular" tone="muted">
            {food.source === "verified"
              ? "Reviewed dish, home-style recipe"
              : food.source === "ifct"
                ? "From India's food composition tables (IFCT)"
                : "Your food"}
          </Text>
        </View>

        <Text variant="label" tone="muted">
          Portion
        </Text>
        <Pills
          value={unitKey}
          onChange={(k) => {
            setUnitKey(k);
            setQty(k === "g" ? Math.round(grams / 10) * 10 || 100 : 1);
          }}
          options={units.map((u) => ({
            value: u.key,
            label:
              u.key === "g"
                ? "Grams"
                : `${u.label[0].toUpperCase()}${u.label.slice(1)} (${u.grams} g)`,
          }))}
        />
        <PortionStepper
          value={qty}
          grams={unit.key === "g"}
          label={portionText(qty, unit.label)}
          onChange={setQty}
        />

        {food.oil ? (
          <>
            <Text variant="label" tone="muted">
              How was it cooked?
            </Text>
            <Pills<"home" | "restaurant">
              value={cooked}
              onChange={setCooked}
              options={[
                { value: "home", label: "Home-style" },
                { value: "restaurant", label: "Restaurant (more oil)" },
              ]}
            />
          </>
        ) : null}

        <MacroBox m={m} macros={n.macros} />
        <Text variant="caption" tone="muted" numeric>
          {Math.round(grams)} g in total.
        </Text>

        <PressableScale
          onPress={() => setMealSheet(true)}
          accessibilityRole="button"
          accessibilityLabel={`Meal: ${slotLabel(meal)}. Change`}
          style={styles.mealRow}
        >
          <Text style={styles.flex}>Meal</Text>
          <Text weight="semibold">{slotLabel(meal)}</Text>
          <ChevronDown size={18} color={colors.textMuted} />
        </PressableScale>
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={
            log
              ? `Save · ${kcalText(m.kcal)}`
              : `Add to ${slotLabel(meal)} · ${kcalText(m.kcal)}`
          }
          fullWidth
          onPress={save}
        />
      </View>
      <MealSheet
        title={log ? "Move to" : "Add to"}
        visible={mealSheet}
        value={meal}
        onPick={setMeal}
        onClose={() => setMealSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
