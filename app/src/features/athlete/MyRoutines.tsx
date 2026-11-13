// Templates on the Training tab (F4-01, D89, D92): saved workouts the athlete starts in one tap.
// New template and the plan tile on top, then My templates, each card with a menu to edit,
// duplicate or delete. (Stored as "routines" in the data.)
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Ellipsis,
  ListChecks,
  Play,
  Plus,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { type TrainingDay, uid } from "@/features/coach/plans";
import type { Client } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

import { Sheet, SheetRow } from "./Sheet";
import { estimateMinutes } from "./training";

const edit = (id: string) =>
  router.push({ pathname: "/athlete/routine/[id]", params: { id } });

/** One template (D92): a lettered badge, name and length, its exercises, and a compact Start. */
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
        <View style={styles.badge}>
          <Text weight="bold" tone="onBrand">
            {day.name.trim().charAt(0).toUpperCase() || "T"}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text weight="semibold">{day.name}</Text>
          <Text variant="caption" tone="muted" numeric>
            {`${day.exercises.length} exercises · ${estimateMinutes(day)} min`}
          </Text>
        </View>
        {onMenu ? (
          <IconButton
            icon={Ellipsis}
            accessibilityLabel={`${day.name} options`}
            onPress={onMenu}
          />
        ) : null}
      </View>
      <Text variant="label" weight="regular" tone="muted" numberOfLines={2}>
        {day.exercises.map((e) => e.name).join(" · ")}
      </Text>
      <View style={styles.foot}>
        <PressableScale
          onPress={() =>
            router.push({
              pathname: "/athlete/workout/preview/[dayId]",
              params: { dayId: day.id },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Start ${day.name}`}
          style={styles.start}
        >
          <Play size={13} color={colors.onBrand} fill={colors.onBrand} />
          <Text variant="label" weight="semibold" tone="onBrand">
            Start
          </Text>
        </PressableScale>
      </View>
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
      <Text variant="title">Templates</Text>
      <View style={styles.actions}>
        <PressableScale
          onPress={() => edit("new")}
          accessibilityRole="button"
          accessibilityLabel="New template"
          style={styles.action}
        >
          <View style={styles.tileIcon}>
            <ClipboardList size={18} color={colors.onBrand} />
          </View>
          <Text weight="semibold">New template</Text>
        </PressableScale>
        {planTile ? (
          <PressableScale
            onPress={planTile.go}
            accessibilityRole="button"
            accessibilityLabel={planTile.label}
            style={styles.action}
          >
            <View style={styles.tileIcon}>
              <ListChecks size={18} color={colors.onBrand} />
            </View>
            <Text weight="semibold">{planTile.label}</Text>
          </PressableScale>
        ) : null}
      </View>

      <Fold
        title={`My templates (${routines.length})`}
        open={mineOpen}
        onToggle={() => setMineOpen(!mineOpen)}
      />
      {mineOpen ? (
        <>
          {routines.map((r) => (
            <RoutineCard key={r.id} day={r} onMenu={() => setMenu(r)} />
          ))}
          <PressableScale
            onPress={() => edit("new")}
            accessibilityRole="button"
            accessibilityLabel="Add a new template"
            style={styles.add}
          >
            <View style={styles.addIcon}>
              <Plus size={16} strokeWidth={2.6} color={colors.onBrand} />
            </View>
            <Text weight="semibold">Add a new template</Text>
          </PressableScale>
        </>
      ) : null}

      <Sheet visible={!!menu} onClose={() => setMenu(null)} title={menu?.name}>
        {menu ? (
          <>
            <SheetRow
              label="Edit template"
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
  actions: { flexDirection: "row", gap: space[2] },
  action: {
    flex: 1,
    alignItems: "flex-start",
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tileIcon: {
    width: space[8],
    height: space[8],
    borderRadius: radius.sm,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  fold: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: space[12],
  },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[3] },
  badge: {
    width: space[8] + space[2],
    height: space[8] + space[2],
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  foot: { flexDirection: "row", justifyContent: "flex-end" },
  start: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  add: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: space[12] + space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  addIcon: {
    width: space[8],
    height: space[8],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
});
