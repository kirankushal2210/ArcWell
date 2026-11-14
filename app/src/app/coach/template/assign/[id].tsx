// Assign a template to clients (sitemap §5 Plans: "Assign template to client → customise per
// client"). Each chosen client gets their own copy, replacing their current program or meal plan;
// workouts and food they've logged stay. The coach then customises one client without touching
// the others (D56).
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Page, PageHeader } from "@/features/coach/parts";
import { alert } from "@/lib/alert";
import { colors, radius, rhythm, space } from "@/theme";
import { useBillingGate } from "@/features/coach/limits";
import { NotFound } from "@/features/system/SystemStates";

function AssignTemplateEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { templates, clients, assignTemplate } = useCoachData();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<string[]>([]);
  const t = templates.find((x) => x.id === id);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/plans");
  if (!t) return <NotFound title="Template" what="template" onBack={back} />;

  const training = t.kind === "training";
  const list = clients.filter((c) => c.status !== "completed");
  const current = (c: (typeof list)[number]) =>
    training
      ? c.program?.name || c.plan?.training || "No training program yet"
      : c.nutritionPlan
        ? `${c.nutritionPlan.kcal.toLocaleString("en-IN")} kcal · ${c.nutritionPlan.protein} g protein`
        : c.plan?.meals || "No meal plan yet";
  const toggle = (cid: string) =>
    setPicked((p) =>
      p.includes(cid) ? p.filter((x) => x !== cid) : [...p, cid],
    );
  const replacing = list.filter(
    (c) =>
      picked.includes(c.id) &&
      (training
        ? c.program || c.plan?.training
        : c.nutritionPlan || c.plan?.meals),
  ).length;

  return (
    <View style={styles.root}>
      <PageHeader title="Assign template" sub={t.name} onBack={back} />
      <Page>
        <Text tone="muted">
          Each client gets their own copy to adjust for them.{" "}
          {training
            ? "It replaces their current training program; workouts they've logged stay."
            : "It replaces their current meal plan and targets; food they've logged stays."}
        </Text>
        {list.length ? (
          <Group>
            {list.map((c, i) => {
              const on = picked.includes(c.id);
              return (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() => toggle(c.id)}
                  label={`${c.name}${on ? ", selected" : ""}`}
                >
                  <Avatar name={c.name} />
                  <View style={styles.flex}>
                    <Text weight="semibold">{c.name}</Text>
                    <Text
                      variant="label"
                      weight="regular"
                      tone="muted"
                      numberOfLines={1}
                    >
                      {c.pending ? "Not joined yet · " : ""}
                      {current(c)}
                    </Text>
                  </View>
                  <View style={[styles.tick, on && styles.tickOn]}>
                    {on ? (
                      <Check size={16} strokeWidth={3} color={colors.onBrand} />
                    ) : null}
                  </View>
                </GroupRow>
              );
            })}
          </Group>
        ) : (
          <Text tone="muted">
            No clients yet. Add one from Clients, or share your invite link.
          </Text>
        )}
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {replacing ? (
          <Text variant="caption" tone="muted" style={styles.center}>
            Replaces the current {training ? "program" : "meal plan"} for{" "}
            {replacing} {replacing === 1 ? "client" : "clients"}.
          </Text>
        ) : null}
        <Button
          label={
            picked.length
              ? `Assign to ${picked.length} ${picked.length === 1 ? "client" : "clients"}`
              : "Choose clients"
          }
          fullWidth
          disabled={!picked.length}
          onPress={() => {
            assignTemplate(t.id, picked);
            const n = picked.length;
            back();
            alert(
              "Template assigned",
              `${n} ${n === 1 ? "client has" : "clients have"} their own copy of ${t.name}. Open a client to adjust theirs.`,
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.sm - space[1] / 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function AssignTemplate() {
  const gate = useBillingGate();
  return gate ?? <AssignTemplateEditor />;
}
