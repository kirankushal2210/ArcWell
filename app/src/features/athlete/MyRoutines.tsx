// Routines on the Training tab (F4-01, D83): New routine and Explore, the plan's workouts and the
// athlete's own saved workouts. Each card lists its exercises and starts in one tap; own routines
// have a menu to edit, duplicate or delete.
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Ellipsis,
  Plus,
  ListChecks,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { type TrainingDay, uid } from "@/features/coach/plans";
import type { Client } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

import { Sheet, SheetRow } from "./Sheet";

const edit = (id: string) =>
  router.push({ pathname: "/athlete/routine/[id]", params: { id } });

/** One routine: name, its exercises on one line, and a Start button. */
export function RoutineCard({
  day,
  onMenu,
}: {
  day: TrainingDay;
  onMenu?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text variant="heading" style={styles.flex}>
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
      <Text tone="muted" numberOfLines={2}>
        {day.exercises.map((e) => e.name).join(", ")}
      </Text>
      <Button
        label="Start routine"
        fullWidth
        onPress={() =>
          router.push({
            pathname: "/athlete/workout/preview/[dayId]",
            params: { dayId: day.id },
          })
        }
      />
    </View>
  );
}

/** A section title that folds its cards away, like a folder. */
function Fold({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <PressableScale
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={title}
      style={styles.fold}
    >
      <Icon size={18} color={colors.textMuted} />
      <Text tone="muted" weight="medium">
        {title}
      </Text>
    </PressableScale>
  );
}

/**
 * Routines on the Training tab (D83, D89): two ways in, New routine and the plan (Arcwell's plan
 * from the athlete's answers, or the coach's), then the athlete's own routines. Each card starts
 * in one tap.
 */
export function MyRoutines({
  me,
  coached = false,
}: {
  me: Client;
  /** Coached athletes see their coach's plan and can't pick another program. */
  coached?: boolean;
}) {
  const { saveRoutine, deleteRoutine } = useCoachData();
  const [menu, setMenu] = useState<TrainingDay | null>(null);
  const [mineOpen, setMineOpen] = useState(true);
  const routines = me.routines ?? [];
  const plan = me.program;
  // The plan tile: the coach's plan once there is one; otherwise Arcwell's plan, or pick one.
  const planTile =
    coached && !plan
      ? null
      : {
          label: coached ? "Coach plan" : "Arcwell plan",
          go: () =>
            plan
              ? router.push("/athlete/plan")
              : router.push("/athlete/programs"),
        };

  return (
    <>
      <Text variant="title">Routines</Text>
      <View style={styles.actions}>
        <PressableScale
          onPress={() => edit("new")}
          accessibilityRole="button"
          accessibilityLabel="New routine"
          style={styles.action}
        >
          <ClipboardList size={20} color={colors.text} />
          <Text weight="semibold">New routine</Text>
        </PressableScale>
        {planTile ? (
          <PressableScale
            onPress={planTile.go}
            accessibilityRole="button"
            accessibilityLabel={planTile.label}
            style={styles.action}
          >
            <ListChecks size={20} color={colors.text} />
            <Text weight="semibold">{planTile.label}</Text>
          </PressableScale>
        ) : null}
      </View>

      <Fold
        title={`My routines (${routines.length})`}
        open={mineOpen}
        onToggle={() => setMineOpen(!mineOpen)}
      />
      {mineOpen ? (
        routines.length ? (
          routines.map((r) => (
            <RoutineCard key={r.id} day={r} onMenu={() => setMenu(r)} />
          ))
        ) : (
          <PressableScale
            onPress={() => edit("new")}
            accessibilityRole="button"
            accessibilityLabel="Add a new routine"
            style={styles.empty}
          >
            <Plus size={18} color={colors.accent} />
            <Text weight="semibold" tone="accent">
              Add a new routine
            </Text>
          </PressableScale>
        )
      ) : null}

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
  actions: { flexDirection: "row", gap: space[3] },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: space[12],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  fold: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: space[12],
  },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    minHeight: space[12] + space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
});
