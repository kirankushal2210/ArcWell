// Add food (F5-04, F5-05): opens on Recent, because Indian diets repeat and most logs are one tap on
// "+" (the last-used portion). Search matches Hindi names and spellings, dishes before ingredients.
// The meal follows the time of day and can be changed in the header. The camera is photo logging:
// free athletes get the upgrade sheet, Plus scans the meal (D96), coached never see it.
import { router, useLocalSearchParams } from "expo-router";
import { Camera, ChevronDown, Search, X } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import {
  FoodRow,
  kcalText,
  MealSheet,
  newLogId,
  slotNow,
  todayKey,
  UpgradeSheet,
  useNutrition,
} from "@/features/athlete/FoodParts";
import {
  type Food,
  type FoodLog,
  logFromItem,
  macrosFor,
  type MealSlot,
  planItemMacros,
  portionText,
  searchFoods,
  slotForMeal,
  slotLabel,
  sumMacros,
} from "@/features/athlete/foods";
import { Pills } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

type Tab = "recent" | "frequent" | "mine" | "plan";

export default function AddFood() {
  const params = useLocalSearchParams<{
    meal?: MealSlot;
    date?: string;
    swapFor?: string;
  }>();
  const n = useNutrition();
  const insets = useSafeAreaInsets();
  const [meal, setMeal] = useState<MealSlot>(() => params.meal ?? slotNow());
  const [date] = useState(() => params.date ?? todayKey());
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("recent");
  const [mealSheet, setMealSheet] = useState(false);
  const [camera, setCamera] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/nutrition");

  const swapFor = params.swapFor;
  const swapMeal = n.plan?.meals.find((m) => m.id === swapFor);

  // Newest log per food: Recent, with the portion it was last logged in.
  const latest = new Map<string, FoodLog>();
  const counts = new Map<string, number>();
  for (const l of [...n.logs].reverse()) {
    const key = l.foodId ?? `quick:${l.name}`;
    if (!latest.has(key)) latest.set(key, l);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const recent = [...latest.values()].slice(0, 20);
  const frequent = [...latest.entries()]
    .filter(([k]) => (counts.get(k) ?? 0) > 1)
    .sort((a, b) => (counts.get(b[0]) ?? 0) - (counts.get(a[0]) ?? 0))
    .slice(0, 20)
    .map(([, l]) => l);
  const results = searchFoods(q, n.myFoods);

  const tag = (l: FoodLog) => (swapFor ? { ...l, swappedFor: swapFor } : l);
  const flash = (key: string) => setAdded((a) => [...a, key]);
  const relog = (l: FoodLog) => {
    n.add([
      tag({
        ...l,
        id: newLogId(),
        date,
        meal,
        fromPlan: undefined,
        swappedFor: undefined,
      }),
    ]);
    flash(l.id);
  };
  const quickAdd = (f: Food) => {
    const u = f.units[0];
    const grams = u ? u.grams : 100;
    n.add([
      tag({
        id: newLogId(),
        date,
        meal,
        foodId: f.id,
        name: f.name,
        qty: u ? 1 : 100,
        unit: u ? u.label : "g",
        grams,
        cooked: f.oil ? "home" : undefined,
        source: f.source,
        macros: macrosFor(f, grams),
      }),
    ]);
    flash(f.id);
  };
  const openFood = (foodId: string) =>
    router.push({
      pathname: "/athlete/food/portion",
      params: { foodId, meal, date, ...(swapFor ? { swapFor } : {}) },
    });
  const defaultSub = (f: Food) => {
    const u = f.units[0];
    const m = macrosFor(f, u ? u.grams : 100);
    return `${u ? portionText(1, u.label) : "100 g"} · ${kcalText(m.kcal)}`;
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: "recent", label: "Recent" },
    { value: "frequent", label: "Frequent" },
    { value: "mine", label: "My foods" },
    ...(n.macros && n.plan?.meals.some((m) => m.items?.length)
      ? [{ value: "plan" as Tab, label: "Meal plan" }]
      : []),
  ];

  const logRows = (list: FoodLog[], empty: string) =>
    list.length ? (
      list.map((l) => (
        <FoodRow
          key={l.id}
          name={l.name}
          source={l.source}
          sub={`${l.source === "quick" ? "Quick add" : portionText(l.qty, l.unit)} · ${kcalText(l.macros.kcal)}`}
          onPress={() =>
            l.foodId
              ? router.push({
                  pathname: "/athlete/food/portion",
                  params: {
                    foodId: l.foodId,
                    meal,
                    date,
                    qty: String(l.qty),
                    unit: l.unit,
                    ...(swapFor ? { swapFor } : {}),
                  },
                })
              : relog(l)
          }
          onAdd={() => relog(l)}
          added={added.includes(l.id)}
        />
      ))
    ) : (
      <Text tone="muted" style={styles.hint}>
        {empty}
      </Text>
    );

  return (
    <View style={[styles.root, { paddingTop: insets.top + space[1] }]}>
      <View style={styles.head}>
        <IconButton icon={X} accessibilityLabel="Close" onPress={close} />
        <PressableScale
          onPress={() => setMealSheet(true)}
          accessibilityRole="button"
          accessibilityLabel={`Adding to ${slotLabel(meal)}. Change meal`}
          style={styles.mealPick}
        >
          <Text variant="heading">{`Add to ${slotLabel(meal)}`}</Text>
          <ChevronDown size={18} color={colors.text} />
        </PressableScale>
        {n.coached ? null : (
          <IconButton
            icon={Camera}
            accessibilityLabel="Log with a photo"
            onPress={() =>
              n.tier === "pro"
                ? router.push({
                    pathname: "/athlete/food/photo",
                    params: { meal, date: params.date ?? "" },
                  })
                : setCamera(true)
            }
          />
        )}
      </View>
      {swapMeal ? (
        <Text variant="label" weight="regular" tone="muted" style={styles.swap}>
          {`Instead of your planned ${swapMeal.name.toLowerCase()}. ${n.coached ? `${n.coachName} sees the swap.` : ""}`}
        </Text>
      ) : null}
      <View style={styles.search}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder='Search foods, e.g. "rajma"'
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search foods"
        />
      </View>
      {q.trim() ? null : (
        <View style={styles.tabs}>
          <Pills value={tab} onChange={setTab} options={tabs} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, space[4]) + space[8] },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {q.trim() ? (
          results.length ? (
            results.map((f) => (
              <FoodRow
                key={f.id}
                name={f.name}
                source={f.source}
                sub={defaultSub(f)}
                onPress={() => openFood(f.id)}
                onAdd={() => quickAdd(f)}
                added={added.includes(f.id)}
              />
            ))
          ) : (
            <Text tone="muted" style={styles.hint}>
              {`Nothing for "${q.trim()}" yet.`}
            </Text>
          )
        ) : tab === "recent" ? (
          logRows(recent, "Foods you log show here, so next time it's one tap.")
        ) : tab === "frequent" ? (
          logRows(frequent, "Foods you log more than once show here.")
        ) : tab === "mine" ? (
          n.myFoods.length ? (
            n.myFoods.map((f) => (
              <FoodRow
                key={f.id}
                name={f.name}
                source="mine"
                sub={defaultSub(f)}
                onPress={() => openFood(f.id)}
                onAdd={() => quickAdd(f)}
                added={added.includes(f.id)}
              />
            ))
          ) : (
            <Text tone="muted" style={styles.hint}>
              Foods you create, like your mother&apos;s chilla, are saved here.
            </Text>
          )
        ) : (
          (n.plan?.meals ?? [])
            .filter((m) => m.items?.length)
            .map((m) => {
              const total = sumMacros(
                (m.items ?? []).map((i) => planItemMacros(i, n.myFoods)),
              );
              return (
                <FoodRow
                  key={m.id}
                  name={m.name}
                  source="verified"
                  sub={`${m.foods} · ${kcalText(total.kcal)}`}
                  onPress={() =>
                    router.push({
                      pathname: "/athlete/food/plan",
                      params: { date },
                    })
                  }
                  onAdd={() => {
                    const slot = slotForMeal(m.name, m.time);
                    n.add(
                      (m.items ?? [])
                        .map((i) =>
                          logFromItem(i, date, slot, newLogId(), n.myFoods),
                        )
                        .filter((l): l is FoodLog => !!l)
                        .map((l) => ({ ...l, fromPlan: m.id })),
                    );
                    flash(m.id);
                  }}
                  added={added.includes(m.id)}
                />
              );
            })
        )}

        <View style={styles.more}>
          <Text tone="muted">Can&apos;t find it?</Text>
          <View style={styles.moreRow}>
            <Button
              label="Create a food"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/athlete/food/new",
                  params: {
                    meal,
                    date,
                    name: q.trim(),
                    ...(swapFor ? { swapFor } : {}),
                  },
                })
              }
            />
            <Button
              label="Quick add"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/athlete/food/quick",
                  params: { meal, date, ...(swapFor ? { swapFor } : {}) },
                })
              }
            />
          </View>
        </View>
      </ScrollView>

      {added.length ? (
        <View
          style={[
            styles.foot,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label={`Done · ${added.length} added to ${slotLabel(meal).toLowerCase()}`}
            fullWidth
            onPress={close}
          />
        </View>
      ) : null}

      <MealSheet
        visible={mealSheet}
        value={meal}
        onPick={setMeal}
        onClose={() => setMealSheet(false)}
      />
      {n.tier === "free" ? (
        <UpgradeSheet
          visible={camera}
          title="Snap a photo, we'll do the logging"
          onClose={() => setCamera(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, gap: space[2] },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[2],
  },
  mealPick: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    minHeight: 48,
  },
  swap: { paddingHorizontal: rhythm.gutter },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 48,
    marginHorizontal: rhythm.gutter,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  tabs: { paddingHorizontal: rhythm.gutter },
  list: { paddingHorizontal: rhythm.gutter },
  hint: { paddingVertical: space[4] },
  more: { gap: space[2], paddingTop: space[4] },
  moreRow: { flexDirection: "row", gap: space[2] },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
