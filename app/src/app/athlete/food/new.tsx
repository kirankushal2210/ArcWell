// Create a food (F5-08): a family recipe or a local dish that isn't in the data. Saved under My foods,
// private to the athlete and visible to their coach in logs. Numbers are per serving; the weight of
// one serving is optional. Building it from ingredients (recipe builder) is v1.1 (D45).
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import {
  backToLog,
  newLogId,
  slotNow,
  todayKey,
  useNutrition,
} from "@/features/athlete/FoodParts";
import {
  type Food,
  macrosFor,
  type MealSlot,
  slotLabel,
} from "@/features/athlete/foods";
import { Page, PageHeader, Pills } from "@/features/coach/parts";
import { uid } from "@/features/coach/plans";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

type Serving = "piece" | "katori" | "bowl" | "glass" | "g";
const DEFAULT_G: Record<Serving, number> = {
  piece: 100,
  katori: 150,
  bowl: 250,
  glass: 250,
  g: 100,
};

const num = (s: string) => {
  const v = Number(s.replace(",", "."));
  return s.trim() === "" || Number.isNaN(v) ? 0 : v;
};

export default function NewFood() {
  const p = useLocalSearchParams<{
    meal?: MealSlot;
    date?: string;
    name?: string;
    swapFor?: string;
  }>();
  const n = useNutrition();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(p.name ?? "");
  const [serving, setServing] = useState<Serving>("piece");
  const [weight, setWeight] = useState("");
  const [kcal, setKcal] = useState("");
  const [pro, setPro] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [tried, setTried] = useState(false);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/nutrition");
  const meal = p.meal ?? slotNow();

  const box = (label: string, value: string, set: (v: string) => void) => (
    <View style={styles.cell}>
      <TextInput
        value={value}
        onChangeText={set}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        style={styles.num}
        accessibilityLabel={`${label} per serving`}
      />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );

  const save = (log: boolean) => {
    setTried(true);
    if (!name.trim() || num(kcal) <= 0) return;
    const grams = serving === "g" ? 100 : num(weight) || DEFAULT_G[serving];
    const per = 100 / grams;
    const food: Food = {
      id: uid("my"),
      name: name.trim(),
      aliases: [],
      source: "mine",
      kind: "dish",
      per100: {
        kcal: num(kcal) * per,
        p: num(pro) * per,
        c: num(carb) * per,
        f: num(fat) * per,
      },
      units: serving === "g" ? [] : [{ key: serving, label: serving, grams }],
      oil: false,
    };
    n.addMyFood(food);
    if (log)
      n.add([
        {
          id: newLogId(),
          date: p.date ?? todayKey(),
          meal,
          foodId: food.id,
          name: food.name,
          qty: serving === "g" ? 100 : 1,
          unit: serving,
          grams,
          source: "mine",
          macros: macrosFor(food, grams),
          swappedFor: p.swapFor,
        },
      ]);
    if (log) backToLog();
    else back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title="Create a food" onBack={back} />
      <Page>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name, e.g. Mom's moong dal chilla"
          placeholderTextColor={colors.textMuted}
          style={[styles.name, tried && !name.trim() && styles.error]}
          autoFocus={!p.name}
          accessibilityLabel="Food name"
        />
        <Text variant="label" tone="muted">
          Serving
        </Text>
        <Pills
          value={serving}
          onChange={setServing}
          options={[
            { value: "piece", label: "Piece" },
            { value: "katori", label: "Katori" },
            { value: "bowl", label: "Bowl" },
            { value: "glass", label: "Glass" },
            { value: "g", label: "100 g" },
          ]}
        />
        {serving !== "g" ? (
          <View style={styles.weight}>
            <Text
              style={styles.flex}
            >{`Weight of 1 ${serving} (optional)`}</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="number-pad"
              placeholder={`${DEFAULT_G[serving]}`}
              placeholderTextColor={colors.textMuted}
              style={styles.small}
              accessibilityLabel={`Weight of one ${serving} in grams`}
            />
            <Text tone="muted">g</Text>
          </View>
        ) : null}
        <Text variant="label" tone="muted">
          {serving === "g" ? "Per 100 g" : `Per ${serving}`}
        </Text>
        <View style={styles.row}>
          {box("kcal", kcal, setKcal)}
          {n.macros ? (
            <>
              {box("protein", pro, setPro)}
              {box("carbs", carb, setCarb)}
              {box("fat", fat, setFat)}
            </>
          ) : null}
        </View>
        {tried && num(kcal) <= 0 ? (
          <Text variant="label" weight="regular" tone="danger">
            Add the calories for one serving.
          </Text>
        ) : null}
        <Text variant="caption" tone="muted">
          Saved under My foods. Only you{n.coached ? ` and ${n.coachName}` : ""}{" "}
          can see it.
        </Text>
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={`Save and add to ${slotLabel(meal).toLowerCase()}`}
          fullWidth
          onPress={() => save(true)}
        />
        <Button
          label="Save only"
          variant="ghost"
          fullWidth
          onPress={() => save(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: space[2] },
  name: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { borderColor: colors.danger },
  weight: { flexDirection: "row", alignItems: "center", gap: space[2] },
  small: {
    width: 80,
    minHeight: 44,
    textAlign: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  cell: {
    flex: 1,
    gap: space[1],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  num: {
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
  },
  foot: {
    gap: space[1],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});
