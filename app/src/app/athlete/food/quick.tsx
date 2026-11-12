// Quick add (F5-07): for canteen meals, weddings and eating out, when you know the numbers or just
// need to log something fast. Logging something beats logging nothing. Macros are optional and
// hidden for free athletes (D5). Opened on a quick-add log, it edits or deletes it.
import { router, useLocalSearchParams } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
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
import { type MealSlot, slotLabel } from "@/features/athlete/foods";
import { Page, PageHeader, Pills } from "@/features/coach/parts";
import { MEAL_SLOTS } from "@/features/athlete/foods";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const num = (s: string) => {
  const v = Number(s.replace(",", "."));
  return s.trim() === "" || Number.isNaN(v) ? 0 : v;
};

export default function QuickAdd() {
  const p = useLocalSearchParams<{
    meal?: MealSlot;
    date?: string;
    logId?: string;
    swapFor?: string;
  }>();
  const n = useNutrition();
  const insets = useSafeAreaInsets();
  const log = p.logId ? n.logs.find((l) => l.id === p.logId) : undefined;
  const [name, setName] = useState(
    log?.name === "Quick add" ? "" : (log?.name ?? ""),
  );
  const [kcal, setKcal] = useState(log ? String(log.macros.kcal) : "");
  const [pro, setPro] = useState(log?.macros.p ? String(log.macros.p) : "");
  const [carb, setCarb] = useState(log?.macros.c ? String(log.macros.c) : "");
  const [fat, setFat] = useState(log?.macros.f ? String(log.macros.f) : "");
  const [meal, setMeal] = useState<MealSlot>(
    () => log?.meal ?? p.meal ?? slotNow(),
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/nutrition");
  const ok = num(kcal) > 0;

  const field = (
    label: string,
    value: string,
    set: (v: string) => void,
    big = false,
  ) => (
    <View style={big ? styles.bigField : styles.field}>
      <TextInput
        value={value}
        onChangeText={set}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textMuted}
        style={big ? styles.bigInput : styles.input}
        accessibilityLabel={label}
      />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title="Quick add"
        onBack={back}
        actions={
          log
            ? [
                {
                  icon: Trash2,
                  label: "Delete from log",
                  onPress: () =>
                    Alert.alert("Remove this entry?", undefined, [
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
        <Text tone="muted">
          For when you know the numbers, or just need to log something fast.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name (optional), e.g. Office canteen thali"
          placeholderTextColor={colors.textMuted}
          style={styles.name}
          accessibilityLabel="Name"
        />
        {field("kcal", kcal, setKcal, true)}
        {n.macros ? (
          <>
            <Text variant="label" tone="muted">
              Macros (optional)
            </Text>
            <View style={styles.row}>
              {field("protein g", pro, setPro)}
              {field("carbs g", carb, setCarb)}
              {field("fat g", fat, setFat)}
            </View>
          </>
        ) : null}
        <Text variant="label" tone="muted">
          Meal
        </Text>
        <Pills value={meal} onChange={setMeal} options={MEAL_SLOTS} />
      </Page>
      <View
        style={[
          styles.foot,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={log ? "Save" : `Add to ${slotLabel(meal)}`}
          fullWidth
          disabled={!ok}
          onPress={() => {
            const entry = {
              id: log?.id ?? newLogId(),
              date: log?.date ?? p.date ?? todayKey(),
              meal,
              name: name.trim() || "Quick add",
              qty: 1,
              unit: "serving",
              grams: 0,
              source: "quick" as const,
              macros: {
                kcal: Math.round(num(kcal)),
                p: n.macros ? num(pro) : 0,
                c: n.macros ? num(carb) : 0,
                f: n.macros ? num(fat) : 0,
              },
              swappedFor: log?.swappedFor ?? p.swapFor,
            };
            if (log) n.update(entry);
            else n.add([entry]);
            backToLog();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: "row", gap: space[2] },
  name: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  field: {
    flex: 1,
    gap: space[1],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  bigField: {
    alignItems: "center",
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  input: {
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
  },
  bigInput: {
    minWidth: 160,
    textAlign: "center",
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes["2xl"],
    color: colors.text,
  },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
