// Meal plan template builder (K-05): targets plus an example day of Indian meals with exact foods,
// reused across clients. "new" starts from a diet's example day. Changing a template never changes
// clients already on it (each has their own copy, D56); assigning it again gives them the update.
import { router, useLocalSearchParams } from "expo-router";
import { Copy, Trash2, UserPlus } from "lucide-react-native";
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
import { useCoachData } from "@/features/coach/CoachData";
import { MealPlanEditor } from "@/features/coach/MealPlanEditor";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  exampleDay,
  type NutritionPlan,
  targetsFor,
} from "@/features/coach/plans";
import { alert } from "@/lib/alert";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";
import { useBillingGate } from "@/features/coach/limits";
import { NotFound } from "@/features/system/SystemStates";

const DIETS = ["Vegetarian", "Eggetarian", "Non-vegetarian", "Jain"] as const;

function MealTemplateEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { templates, saveTemplate, deleteTemplate, duplicateTemplate } =
    useCoachData();
  const insets = useSafeAreaInsets();
  const t = templates.find((x) => x.id === id && x.kind === "meals");
  const [name, setName] = useState(t?.name ?? "");
  const [diet, setDiet] = useState<string>("Vegetarian");
  const [n, setN] = useState<NutritionPlan>(
    () =>
      t?.nutrition ?? {
        ...targetsFor(2000, 120),
        meals: exampleDay("Vegetarian"),
      },
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/plans");
  if (id !== "new" && !t)
    return <NotFound title="Template" what="template" onBack={back} />;

  const ready = n.meals.length > 0;
  const save = () =>
    saveTemplate({
      id: t?.id,
      kind: "meals",
      name:
        name.trim() ||
        `${diet === "Non-vegetarian" ? "Non-veg" : diet} ${n.kcal.toLocaleString("en-IN")} kcal`,
      nutrition: n,
    });
  const remove = () =>
    alert(`Delete ${t?.name}?`, "Clients already on it keep their own copy.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (t) deleteTemplate(t.id);
          back();
        },
      },
    ]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={t ? "Meal plan template" : "New meal plan template"}
        sub={
          t
            ? `${t.clients} ${t.clients === 1 ? "client has" : "clients have"} a copy`
            : undefined
        }
        onBack={back}
        actions={
          t
            ? [
                {
                  icon: Copy,
                  label: "Duplicate template",
                  onPress: () =>
                    router.replace({
                      pathname: "/coach/template/meals/[id]",
                      params: { id: duplicateTemplate(t.id) },
                    }),
                },
                { icon: Trash2, label: "Delete template", onPress: remove },
              ]
            : []
        }
      />
      <Page>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Template name, e.g. Vegetarian 1,800 kcal"
          placeholderTextColor={colors.textMuted}
          style={styles.name}
          accessibilityLabel="Template name"
        />
        {t ? null : (
          <>
            <Eyebrow>Start from</Eyebrow>
            <Pills
              value={diet}
              onChange={(v) => {
                setDiet(v);
                setN((x) => ({ ...x, meals: exampleDay(v) }));
              }}
              options={DIETS.map((d) => ({ value: d, label: d }))}
            />
            <Text variant="caption" tone="muted">
              A sample day for this diet. Change any meal, food or amount below.
            </Text>
          </>
        )}
        <MealPlanEditor value={n} onChange={setN} />
        <Text variant="caption" tone="muted">
          Editing a template doesn&apos;t change clients already on it. Assign
          it again to give them this version.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save template"
          fullWidth
          disabled={!ready}
          onPress={() => {
            save();
            back();
          }}
        />
        <Button
          label="Save and assign to clients"
          icon={UserPlus}
          variant="secondary"
          fullWidth
          disabled={!ready}
          onPress={() =>
            router.replace({
              pathname: "/coach/template/assign/[id]",
              params: { id: save() },
            })
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  name: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
  },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function MealTemplate() {
  const gate = useBillingGate();
  return gate ?? <MealTemplateEditor />;
}
