// Measurements (PH-02): the same body parts as the weekly check-in, so a coached client's check-in
// entries show here too. Each row shows the latest value and the change since the start.
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, NumberStepper, Text } from "@/components/primitives";
import {
  MEASURES,
  type MeasureKey,
  measureSeries,
} from "@/features/athlete/athleteData";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow } from "@/features/coach/parts";
import { space } from "@/theme";

const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}`;

export default function Measurements() {
  const me = useMe();
  const { addMeasurements } = useCoachData();
  const [draft, setDraft] = useState<Partial<
    Record<MeasureKey, number>
  > | null>(null);
  if (!me) return <NotJoined />;
  const rows = MEASURES.map((m) => ({ ...m, ...measureSeries(me, m.key) }));

  return (
    <MenuPage
      title="Measurements"
      back={backTo("/athlete/menu")}
      footer={
        <Button
          label="Add measurements"
          fullWidth
          onPress={() =>
            setDraft(
              Object.fromEntries(
                rows.map((r) => [r.key, r.now ?? 80]),
              ) as Record<MeasureKey, number>,
            )
          }
        />
      }
    >
      <Group>
        {rows.map((r, i) => (
          <GroupRow key={r.key} first={i === 0}>
            <View style={styles.flex}>
              <Text weight="medium">{r.label}</Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {r.now === undefined || r.start === undefined
                  ? "No entries yet"
                  : r.now === r.start
                    ? "No change"
                    : `${signed(r.now - r.start)} cm since start`}
              </Text>
            </View>
            <Text weight="semibold" numeric>
              {r.now === undefined ? "—" : `${r.now.toFixed(1)} cm`}
            </Text>
          </GroupRow>
        ))}
      </Group>
      <Text variant="caption" tone="muted">
        Measure in the morning, tape snug but not tight, same spot each time.
      </Text>

      <Sheet
        visible={!!draft}
        onClose={() => setDraft(null)}
        title="Today's measurements"
        sub="Leave any you didn't measure as they are."
      >
        {draft ? (
          <View style={styles.sheet}>
            {MEASURES.map((m) => (
              <View key={m.key} style={styles.row}>
                <Text style={styles.flex}>{m.label}</Text>
                <NumberStepper
                  value={draft[m.key] ?? 80}
                  onChange={(v) => setDraft({ ...draft, [m.key]: v })}
                  step={0.5}
                  decimals={1}
                  min={10}
                  max={250}
                  unit="cm"
                  accessibilityLabel={m.label}
                />
              </View>
            ))}
            <Button
              label="Save"
              fullWidth
              onPress={() => {
                const changed = Object.fromEntries(
                  rows
                    .filter((r) => draft[r.key] !== r.now)
                    .map((r) => [r.key, draft[r.key]]),
                );
                if (Object.keys(changed).length)
                  addMeasurements(me.id, changed);
                setDraft(null);
              }}
            />
          </View>
        ) : null}
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  sheet: { gap: space[2], paddingTop: space[1] },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
});
