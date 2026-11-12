// My routines on the Training tab (F4-01): the athlete's own saved workouts beside their program.
// Each card lists its exercises, starts in one tap, and has a menu to edit, duplicate or delete.
import { router } from "expo-router";
import { Ellipsis, Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button, IconButton, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow } from "@/features/coach/parts";
import { type TrainingDay, uid } from "@/features/coach/plans";
import type { Client } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

import { Sheet, SheetRow } from "./Sheet";
import { estimateMinutes } from "./training";

const edit = (id: string) =>
  router.push({ pathname: "/athlete/routine/[id]", params: { id } });

export function MyRoutines({ me }: { me: Client }) {
  const { saveRoutine, deleteRoutine } = useCoachData();
  const [menu, setMenu] = useState<TrainingDay | null>(null);
  const routines = me.routines ?? [];

  return (
    <>
      <View style={styles.between}>
        <Eyebrow>{`My routines · ${routines.length}`}</Eyebrow>
        <Button
          label="New"
          icon={Plus}
          variant="ghost"
          onPress={() => edit("new")}
        />
      </View>
      {routines.length ? (
        routines.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.flex}>
                <Text weight="semibold">{r.name}</Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {r.exercises.length} exercises · {estimateMinutes(r)} min
                </Text>
              </View>
              <IconButton
                icon={Ellipsis}
                accessibilityLabel={`${r.name} options`}
                onPress={() => setMenu(r)}
              />
            </View>
            <Text tone="muted" numberOfLines={2}>
              {r.exercises.map((e) => e.name).join(", ")}
            </Text>
            <Button
              label="Start routine"
              fullWidth
              onPress={() =>
                router.push({
                  pathname: "/athlete/workout/preview/[dayId]",
                  params: { dayId: r.id },
                })
              }
            />
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text tone="muted" style={styles.center}>
            Save a workout you repeat, like an extra arm day or a hotel-gym
            circuit, and start it in one tap.
          </Text>
          <Button
            label="New routine"
            icon={Plus}
            variant="secondary"
            onPress={() => edit("new")}
          />
        </View>
      )}

      <Sheet visible={!!menu} onClose={() => setMenu(null)} title={menu?.name}>
        {menu ? (
          <>
            <SheetRow
              label="Edit routine"
              onPress={() => {
                setMenu(null);
                edit(menu.id);
              }}
            />
            <SheetRow
              label="Duplicate"
              onPress={() => {
                saveRoutine(me.id, {
                  ...menu,
                  id: uid("r"),
                  name: `${menu.name} copy`,
                  exercises: menu.exercises.map((e) => ({
                    ...e,
                    id: uid("e"),
                  })),
                });
                setMenu(null);
              }}
            />
            <SheetRow
              label="Delete"
              tone="danger"
              onPress={() => {
                const r = menu;
                setMenu(null);
                Alert.alert(
                  `Delete ${r.name}?`,
                  "Workouts you logged from it stay in your history.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteRoutine(me.id, r.id),
                    },
                  ],
                );
              }}
            />
          </>
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  empty: {
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
});
