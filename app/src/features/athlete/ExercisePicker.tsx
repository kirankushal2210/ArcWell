// "Add exercise" sheet (F4-06, K-06): the library list with filters, multi-select with one Add
// button, the (i) facts for any row, and New exercise when nothing fits. One component for the
// program builder, routines, the workout and swaps, so adding exercises feels the same everywhere.
import { ArrowLeft, Plus, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { HYROX_EXERCISES } from "@/features/race/data";
import { colors, rhythm, space } from "@/theme";

import { CreateExercise } from "./CreateExercise";
import { ExerciseFacts } from "./ExerciseFacts";
import { ExerciseList } from "./ExerciseList";
import type { Exercise } from "./library";
import type { Session } from "./training";
import { useVisibility } from "./visibility";

/** Distinct exercise names from recent workouts, newest first. */
export const recentNames = (sessions: Session[]) =>
  Array.from(
    new Set(
      sessions.flatMap((s) =>
        s.exercises.filter((e) => !e.skipped).map((e) => e.name),
      ),
    ),
  );

function Body({
  title,
  multi,
  suggested,
  history,
  onPick,
  onClose,
}: Omit<PickerProps, "visible">) {
  const insets = useSafeAreaInsets();
  const { hyrox } = useVisibility();
  // HYROX athletes see running, the stations and the race-plan lifts first (D83).
  const shortlist =
    suggested ??
    (hyrox ? { title: "HYROX", names: HYROX_EXERCISES } : undefined);
  const [picked, setPicked] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "create" | Exercise>("list");

  if (view === "create")
    return (
      <View style={[styles.root, { paddingTop: space[3] }]}>
        <CreateExercise
          onCancel={() => setView("list")}
          onSaved={(e) => {
            if (multi) {
              setPicked((p) => [...p, e.name]);
              setView("list");
            } else onPick([e.name]);
          }}
        />
      </View>
    );

  if (view !== "list")
    return (
      <View style={[styles.root, { paddingTop: space[3] }]}>
        <View style={styles.head}>
          <IconButton
            icon={ArrowLeft}
            accessibilityLabel="Back to exercises"
            onPress={() => setView("list")}
          />
          <Text variant="heading" style={styles.flex} numberOfLines={2}>
            {view.name}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <ExerciseFacts e={view} history={history} />
        </ScrollView>
        <View
          style={[
            styles.foot,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label={
              multi && picked.includes(view.name)
                ? "Added to your list"
                : multi
                  ? "Add to your list"
                  : `Choose ${view.name}`
            }
            variant={
              multi && picked.includes(view.name) ? "secondary" : "primary"
            }
            fullWidth
            onPress={() => {
              if (!multi) return onPick([view.name]);
              if (!picked.includes(view.name))
                setPicked((p) => [...p, view.name]);
              setView("list");
            }}
          />
        </View>
      </View>
    );

  return (
    <View style={[styles.root, { paddingTop: space[3] }]}>
      <View style={styles.head}>
        <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
        <Text variant="heading" style={styles.flex}>
          {title}
        </Text>
        <Button
          label="New"
          icon={Plus}
          variant="ghost"
          onPress={() => setView("create")}
        />
      </View>
      <ExerciseList
        selected={picked}
        suggested={shortlist}
        recent={recentNames(history)}
        bottomInset={multi && picked.length ? 72 : 0}
        onInfo={(e) => setView(e)}
        onPress={(e) => {
          if (!multi) return onPick([e.name]);
          setPicked((p) =>
            p.includes(e.name) ? p.filter((x) => x !== e.name) : [...p, e.name],
          );
        }}
      />
      {multi && picked.length ? (
        <View
          style={[
            styles.foot,
            styles.float,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label={`Add ${picked.length} ${picked.length === 1 ? "exercise" : "exercises"}`}
            fullWidth
            onPress={() => onPick(picked)}
          />
        </View>
      ) : null}
    </View>
  );
}

type PickerProps = {
  visible: boolean;
  title?: string;
  /** Pick several, then add them together (default); off for swaps, where one tap chooses. */
  multi?: boolean;
  suggested?: { title: string; names: string[] };
  /** Workouts that feed Recent and the history in the (i) facts. */
  history: Session[];
  onPick: (names: string[]) => void;
  onClose: () => void;
};

export function ExercisePicker({
  visible,
  title = "Add exercises",
  multi = true,
  ...rest
}: PickerProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={rest.onClose}
    >
      {/* Fresh selection every time the sheet opens. */}
      {visible ? <Body title={title} multi={multi} {...rest} /> : null}
    </Modal>
  );
}

/** Picker for the signed-in athlete: Recent and history come from their own workouts. */
export function useMyHistory() {
  const { meId, sessions } = useCoachData();
  return meId ? sessions(meId) : [];
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, gap: space[2] },
  flex: { flex: 1 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: space[2],
  },
  body: { padding: rhythm.gutter, paddingBottom: space[12] },
  foot: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
  float: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
  },
});
