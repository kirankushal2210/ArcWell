// Meal plan page (F5-12). The same plan is Nutrition's Meal plan section tab (D61); this page stays
// for links from the day log and Add food.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { todayKey } from "@/features/athlete/FoodParts";
import { dateLabel } from "@/features/athlete/foods";
import { MealPlanBody } from "@/features/athlete/MealPlanBody";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function MealPlan() {
  const p = useLocalSearchParams<{ date?: string }>();
  const [today] = useState(todayKey);
  const date = p.date ?? today;
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/nutrition");
  return (
    <View style={styles.root}>
      <PageHeader
        title={`${dateLabel(date, today)}'s meal plan`}
        onBack={back}
      />
      <Page>
        <MealPlanBody date={date} />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
