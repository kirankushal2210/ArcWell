// Bodyweight (PH-01): the 7-day average (less noisy than one reading), a chart over 1 or 3 months
// or everything, and the weigh-ins with Edit. Log weight sits at the bottom.
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, NumberStepper, Text } from "@/components/primitives";
import {
  dayText,
  weekAverage,
  weighInsOf,
  within,
} from "@/features/athlete/athleteData";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Pills, WeightChart } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Range = "30" | "90" | "0";

export default function Bodyweight() {
  const me = useMe();
  const { logWeight, editWeighIn } = useCoachData();
  const [range, setRange] = useState<Range>("90");
  const [editing, setEditing] = useState<{ id?: string; kg: number } | null>(
    null,
  );
  if (!me) return <NotJoined />;
  const all = weighInsOf(me);
  const shown = within(all, Number(range));
  const avg = weekAverage(all);
  const last = all[all.length - 1]?.kg ?? me.basics?.weightKg ?? 70;

  return (
    <MenuPage
      title="Bodyweight"
      back={backTo("/athlete/menu")}
      footer={
        <Button
          label="Log weight"
          fullWidth
          onPress={() => setEditing({ kg: last })}
        />
      }
    >
      {all.length ? (
        <>
          <View style={styles.card}>
            <Text numeric>
              <Text variant="display" numeric>
                {avg?.toFixed(1)}
              </Text>
              <Text tone="muted"> kg · 7-day average</Text>
            </Text>
            <Pills
              value={range}
              onChange={setRange}
              options={[
                { value: "30", label: "1 month" },
                { value: "90", label: "3 months" },
                { value: "0", label: "All" },
              ]}
            />
            {shown.length > 1 ? (
              <WeightChart
                values={shown.map((w) => w.kg)}
                target={me.targetKg}
                height={140}
              />
            ) : (
              <Text variant="label" weight="regular" tone="muted">
                Your chart appears after 2 weigh-ins in this range.
              </Text>
            )}
            <Text variant="caption" tone="muted">
              Dashed line is your goal, {me.targetKg.toFixed(1)} kg.
            </Text>
          </View>
          <Group>
            {[...all].reverse().map((w, i) => (
              <GroupRow
                key={w.id}
                first={i === 0}
                onPress={
                  w.editable
                    ? () => setEditing({ id: w.id, kg: w.kg })
                    : undefined
                }
                label={`${w.kg.toFixed(1)} kg, ${dayText(w.date)}. Edit`}
              >
                <Text weight="semibold" numeric style={styles.flex}>
                  {w.kg.toFixed(1)} kg
                </Text>
                <Text variant="label" weight="regular" tone="muted">
                  {dayText(w.date)}
                </Text>
                {w.editable ? (
                  <Text variant="label" weight="medium">
                    Edit
                  </Text>
                ) : null}
              </GroupRow>
            ))}
          </Group>
        </>
      ) : (
        <InfoCard title="Log your first weigh-in">
          Weigh in the same way each morning, after the bathroom and before
          food. The 7-day average smooths out the daily swings.
        </InfoCard>
      )}

      <Sheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit weigh-in" : "Log weight"}
      >
        {editing ? (
          <View style={styles.sheet}>
            <NumberStepper
              value={editing.kg}
              onChange={(kg) => setEditing({ ...editing, kg })}
              step={0.1}
              decimals={1}
              min={30}
              max={250}
              unit="kg"
              accessibilityLabel="Bodyweight"
            />
            <Button
              label="Save"
              fullWidth
              onPress={() => {
                if (editing.id) editWeighIn(me.id, editing.id, editing.kg);
                else logWeight(me.id, editing.kg);
                setEditing(null);
              }}
            />
          </View>
        ) : null}
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  sheet: { gap: space[3], alignItems: "center", paddingTop: space[2] },
});
