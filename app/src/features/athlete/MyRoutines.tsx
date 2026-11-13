// Routines on the Training tab (F4-01, D83): New routine and Explore, the plan's workouts and the
// athlete's own saved workouts. Each card lists its exercises and starts in one tap; own routines
// have a menu to edit, duplicate or delete.
import { router } from "expo-router";
import {
  ClipboardPlus,
  Compass,
  Ellipsis,
  Play,
  Plus,
} from "lucide-react-native";
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

/** One routine: name and menu, its exercises, then the length and a compact Start. */
function RoutineCard({
  day,
  onMenu,
}: {
  day: TrainingDay;
  onMenu?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text weight="semibold" style={styles.flex}>
          {day.name}
        </Text>
        {onMenu ? (
          <IconButton
            icon={Ellipsis}
            accessibilityLabel={`${day.name} options`}
            onPress={onMenu}
          />
        ) : null}
      </View>
      <Text variant="label" weight="regular" tone="muted" numberOfLines={2}>
        {day.exercises.map((e) => e.name).join(", ")}
      </Text>
      <View style={styles.cardFoot}>
        <Text variant="caption" tone="muted" style={styles.flex} numeric>
          {`${day.exercises.length} exercises · ${estimateMinutes(day)} min`}
        </Text>
        <PressableScale
          onPress={() => start(day.id)}
          accessibilityRole="button"
          accessibilityLabel={`Start ${day.name}`}
          style={styles.start}
        >
          <Play size={12} color={colors.onBrand} fill={colors.onBrand} />
          <Text variant="label" weight="semibold" tone="onBrand">
            Start
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

/**
 * Routines on the Training tab (D83–D86): New routine and Explore, the plan's workouts, then the
 * athlete's own routines, each card with a compact Start.
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
      <Text variant="heading" style={styles.title}>
        Routines
      </Text>
      <View style={styles.tiles}>
        <PressableScale
          onPress={() => edit("new")}
          accessibilityRole="button"
          accessibilityLabel="New routine"
          style={styles.tile}
        >
          <ClipboardPlus size={22} color={colors.accent} />
          <Text variant="label" weight="semibold">
            New routine
          </Text>
        </PressableScale>
        {explore ? (
          <PressableScale
            onPress={() => router.push("/athlete/programs")}
            accessibilityRole="button"
            accessibilityLabel="Explore programs"
            style={styles.tile}
          >
            <Compass size={22} color={colors.accent} />
            <Text variant="label" weight="semibold">
              Explore
            </Text>
          </PressableScale>
        ) : null}
      </View>

      {plan ? (
        <>
          <Eyebrow>{`${plan.days.length} days`}</Eyebrow>
          {plan.days.map((d) => (
            <RoutineCard key={d.id} day={d} />
          ))}
        </>
      ) : null}

      <Eyebrow>{`My routines · ${routines.length}`}</Eyebrow>
      {routines.length ? (
        routines.map((r) => (
          <RoutineCard key={r.id} day={r} onMenu={() => setMenu(r)} />
        ))
      ) : (
        <PressableScale
          onPress={() => edit("new")}
          accessibilityRole="button"
          accessibilityLabel="Create a routine"
          style={styles.empty}
        >
          <Plus size={16} color={colors.accent} />
          <Text variant="label" weight="semibold" tone="accent">
            Create a routine
          </Text>
        </PressableScale>
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
  flex: { flex: 1 },
  title: { paddingTop: space[2] },
  tiles: { flexDirection: "row", gap: space[2] },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[1],
    paddingVertical: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingTop: space[1],
  },
  start: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[3],
    paddingVertical: space[1] + space[1] / 2,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    minHeight: space[12],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
});
