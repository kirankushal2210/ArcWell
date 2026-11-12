// The three plans a coach owns for each client (D56), as one tappable group: training program,
// nutrition plan and recovery protocol. Each row opens its builder.
import { router } from "expo-router";
import { Check, ChevronRight } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import { Group, GroupRow, PillarDot } from "./parts";
import { clock } from "./plans";
import type { Client } from "./sampleData";

export const plansReady = (c: Client) =>
  !!(c.program && c.nutritionPlan && c.protocol);

export function PlanRows({ c }: { c: Client }) {
  const rows = [
    {
      pillar: "training" as const,
      title: "Training program",
      done: !!c.program,
      sub: c.program
        ? `${c.program.name || "Untitled"} · ${c.program.weeks} weeks · ${c.program.days.length} workouts a week`
        : (c.plan?.training ?? "Not planned yet"),
      path: "/coach/plan/training/[id]" as const,
    },
    {
      pillar: "nutrition" as const,
      title: "Nutrition plan",
      done: !!c.nutritionPlan,
      sub: c.nutritionPlan
        ? `${c.nutritionPlan.kcal.toLocaleString("en-IN")} kcal · ${c.nutritionPlan.protein} g protein · ${c.nutritionPlan.meals.length} meals`
        : (c.plan?.meals ?? "Not planned yet"),
      path: "/coach/plan/nutrition/[id]" as const,
    },
    {
      pillar: "recovery" as const,
      title: "Recovery protocol",
      done: !!c.protocol,
      sub: c.protocol
        ? `${c.protocol.sleepH} h sleep · bed ${clock(c.protocol.bed)} · ${c.protocol.restDays.length} rest days`
        : c.pending
          ? "Not planned yet"
          : `Sleep target ${c.recovery.sleepTargetH} h`,
      path: "/coach/plan/recovery/[id]" as const,
    },
  ];
  return (
    <Group>
      {rows.map((r, i) => (
        <GroupRow
          key={r.title}
          first={i === 0}
          onPress={() =>
            router.push({ pathname: r.path, params: { id: c.id } })
          }
          label={`${r.title}, ${r.done ? "planned" : "not planned"}: ${r.sub}`}
        >
          <PillarDot pillar={r.pillar} />
          <View style={styles.flex}>
            <Text weight="semibold">{r.title}</Text>
            <Text
              variant="label"
              weight="regular"
              tone="muted"
              numberOfLines={2}
              numeric
            >
              {r.sub}
            </Text>
          </View>
          {r.done ? (
            <View style={styles.tick}>
              <Check size={14} strokeWidth={3} color={colors.onBrand} />
            </View>
          ) : (
            <Text variant="label">Plan</Text>
          )}
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
      ))}
    </Group>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  tick: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
});
