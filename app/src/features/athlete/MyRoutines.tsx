// Routines on the Training tab (F4-01, D83): New routine and Explore, the plan's workouts and the
// athlete's own saved workouts. Each card lists its exercises and starts in one tap; own routines
// have a menu to edit, duplicate or delete.
import { router } from "expo-router";
import { Compass, Ellipsis, Play, Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow } from "@/features/coach/parts";
import { type TrainingDay, uid } from "@/features/coach/plans";
import type { Client } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

import { Sheet, SheetRow } from "./Sheet";
import { estimateMinutes } from "./training";

const edit = (id: string) =>
  router.push({ pathname: "/athlete/routine/[id]", params: { id } });

const start = (dayId: string) =>
  router.push({
    pathname: "/athlete/workout/preview/[dayId]",
    params: { dayId },
  });

/** One routine as a list row: tap it to start; own routines also have a menu beside it. */
function RoutineRow({
  day,
  first,
  onMenu,
}: {
  day: TrainingDay;
  first: boolean;
  onMenu?: () => void;
}) {
  return (
    <View style={[styles.row, !first && styles.rowLine]}>
      <PressableScale
        onPress={() => start(day.id)}
        accessibilityRole="button"
        accessibilityLabel={`Start ${day.name}`}
        style={styles.rowMain}
      >
        <View style={styles.play}>
          <Play size={14} color={colors.onBrand} fill={colors.onBrand} />
        </View>
        <View style={styles.flex}>
          <Text weight="semibold">{day.name}</Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {`${day.exercises.length} exercises · ${estimateMinutes(day)} min`}
          </Text>
        </View>
      </PressableScale>
      {onMenu ? (
        <IconButton
          icon={Ellipsis}
          accessibilityLabel={`${day.name} options`}
          onPress={onMenu}
        />
      ) : null}
    </View>
  );
}

/**
 * Routines on the Training tab (D83, D84): a title with New and Explore beside it, then the plan's
 * workouts and the athlete's own routines as tap-to-start lists.
 */
export function MyRoutines({
  me,
  explore = true,
}: {
  me: Client;
  /** Show Explore (programs); off for coached athletes, whose coach sets the program. */
  explore?: boolean;
}) {
  const { saveRoutine, deleteRoutine } = useCoachData();
  const [menu, setMenu] = useState<TrainingDay | null>(null);
  const routines = me.routines ?? [];
  const plan = me.program;

  return (
    <>
      <View style={styles.titleRow}>
        <Text variant="heading" style={styles.flex}>
          Routines
        </Text>
        {explore ? (
          <IconButton
            icon={Compass}
            variant="glass"
            accessibilityLabel="Explore programs"
            onPress={() => router.push("/athlete/programs")}
          />
        ) : null}
        <IconButton
          icon={Plus}
          variant="glass"
          accessibilityLabel="New routine"
          onPress={() => edit("new")}
        />
      </View>

      {plan ? (
        <>
          <Eyebrow>{plan.name}</Eyebrow>
          <View style={styles.group}>
            {plan.days.map((d, i) => (
              <RoutineRow key={d.id} day={d} first={i === 0} />
            ))}
          </View>
        </>
      ) : null}

      <Eyebrow>Your routines</Eyebrow>
      <View style={styles.group}>
        {routines.length ? (
          routines.map((r, i) => (
            <RoutineRow
              key={r.id}
              day={r}
              first={i === 0}
              onMenu={() => setMenu(r)}
            />
          ))
        ) : (
          <PressableScale
            onPress={() => edit("new")}
            accessibilityRole="button"
            accessibilityLabel="Create a routine"
            style={styles.row}
          >
            <View style={[styles.play, styles.addIcon]}>
              <Plus size={16} color={colors.text} />
            </View>
            <Text weight="semibold" style={styles.flex}>
              Create a routine
            </Text>
          </PressableScale>
        )}
      </View>

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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingTop: space[2],
  },
  group: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: space[12] + space[4],
    paddingHorizontal: space[3],
  },
  rowLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[3],
  },
  play: {
    width: space[8],
    height: space[8],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: { backgroundColor: colors.surfaceRaised },
});
