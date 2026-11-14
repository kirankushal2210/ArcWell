// Routine editor (F4-01): the athlete's own saved workout, outside their program, for sessions they
// repeat (an extra arm day, a hotel-gym circuit). Coached athletes keep their coach's program as is
// and can still plan these; the coach sees what was logged, as with any workout. Each exercise has
// sets, target, rest and a target effort (RPE, defaulting to the rules range for their experience),
// and runs, erg intervals and HYROX stations go in as blocks, as in the coach's builder (D104).
import { router, useLocalSearchParams } from "expo-router";
import { Dumbbell, Plus, Timer, Trash2, Trophy } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { ExercisePicker } from "@/features/athlete/ExercisePicker";
import { Sheet, SheetRow } from "@/features/athlete/Sheet";
import { typeOf } from "@/features/athlete/library";
import { defaultTarget } from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Page } from "@/features/coach/parts";
import { PlanExerciseRows } from "@/features/coach/PlanExerciseRows";
import {
  INTERVAL_EXERCISES,
  newInterval,
  newStation,
  type PlannedExercise,
  type TrainingDay,
  uid,
} from "@/features/coach/plans";
import { STATIONS } from "@/features/race/data";
import { alert } from "@/lib/alert";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function RoutineEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const { saveRoutine, deleteRoutine, sessions } = useCoachData();
  const insets = useSafeAreaInsets();
  const saved = me?.routines?.find((r) => r.id === id);
  const [r, setR] = useState<TrainingDay>(
    () => saved ?? { id: uid("r"), name: "", exercises: [] },
  );
  const [picking, setPicking] = useState(false);
  /** Choosing a machine for intervals, or a HYROX station. */
  const [block, setBlock] = useState<"interval" | "station" | null>(null);
  const addBlock = (e: PlannedExercise) => {
    setR((x) => ({ ...x, exercises: [...x.exercises, e] }));
    setBlock(null);
  };
  const [tried, setTried] = useState(false);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/training");
  if (!me) return <NotJoined />;

  const save = () => {
    setTried(true);
    if (!r.name.trim() || !r.exercises.length) return;
    saveRoutine(me.id, { ...r, name: r.name.trim() });
    back();
  };

  const ready = !!r.name.trim() && r.exercises.length > 0;
  const remove = () =>
    saved &&
    alert(
      `Delete ${saved.name}?`,
      "Workouts you logged from it stay in your history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRoutine(me.id, saved.id);
            back();
          },
        },
      ],
    );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Cancel · title · Save, so saving is always one tap away. */}
      <View style={[styles.bar, { paddingTop: insets.top + space[2] }]}>
        <Button label="Cancel" variant="ghost" size="sm" onPress={back} />
        <Text weight="semibold" style={styles.barTitle}>
          {saved ? "Edit template" : "Create template"}
        </Text>
        <Button
          label="Save"
          size="sm"
          variant={ready ? "primary" : "secondary"}
          onPress={save}
        />
      </View>
      <Page>
        <View style={styles.gap}>
          <TextInput
            value={r.name}
            onChangeText={(v) => setR((x) => ({ ...x, name: v }))}
            placeholder="Template name"
            placeholderTextColor={colors.textMuted}
            style={[styles.name, tried && !r.name.trim() && styles.nameError]}
            autoFocus={!saved}
            accessibilityLabel="Template name"
          />
          {tried && !r.name.trim() ? (
            <Text variant="label" weight="regular" tone="danger">
              Give your template a name.
            </Text>
          ) : null}
        </View>

        {r.exercises.length ? (
          <>
            <View style={styles.card}>
              <PlanExerciseRows
                exercises={r.exercises}
                experience={me.profile?.experience}
                onChange={(list) => setR((x) => ({ ...x, exercises: list }))}
              />
            </View>
            <Button
              label="Add exercise"
              icon={Plus}
              variant="secondary"
              fullWidth
              onPress={() => setPicking(true)}
            />
            <View style={styles.adds}>
              <Button
                label="Intervals"
                icon={Timer}
                variant="ghost"
                onPress={() => setBlock("interval")}
              />
              <Button
                label="HYROX station"
                icon={Trophy}
                variant="ghost"
                onPress={() => setBlock("station")}
              />
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Dumbbell size={32} color={colors.textMuted} />
            <Text tone={tried ? "danger" : "muted"} style={styles.center}>
              Add an exercise to get started.
            </Text>
            <Button
              label="Add exercise"
              icon={Plus}
              fullWidth
              onPress={() => setPicking(true)}
            />
            <View style={styles.adds}>
              <Button
                label="Intervals"
                icon={Timer}
                variant="ghost"
                onPress={() => setBlock("interval")}
              />
              <Button
                label="HYROX station"
                icon={Trophy}
                variant="ghost"
                onPress={() => setBlock("station")}
              />
            </View>
          </View>
        )}

        {saved ? (
          <Button
            label="Delete template"
            icon={Trash2}
            variant="destructive"
            fullWidth
            onPress={remove}
          />
        ) : null}
      </Page>

      <ExercisePicker
        visible={picking}
        history={sessions(me.id)}
        onClose={() => setPicking(false)}
        onPick={(names) => {
          setR((x) => ({
            ...x,
            exercises: [
              ...x.exercises,
              ...names.map((name) => {
                const cardio = typeOf(name) === "distance_duration";
                return {
                  id: uid("e"),
                  name,
                  sets: cardio ? 1 : 3,
                  reps: defaultTarget(name),
                  restSec: cardio ? 0 : 90,
                };
              }),
            ],
          }));
          setPicking(false);
        }}
      />
      <Sheet
        visible={block !== null}
        onClose={() => setBlock(null)}
        title={block === "station" ? "Add a HYROX station" : "Add intervals"}
        sub={
          block === "station"
            ? "At race distance; change it after."
            : "Distance or time repeats with rest. Set pace or effort after."
        }
      >
        {block === "station"
          ? STATIONS.map((s) => (
              <SheetRow
                key={s.key}
                label={s.label}
                sub={s.metres ? `${s.metres} m` : `${s.reps} reps`}
                onPress={() => addBlock(newStation(s.key))}
              />
            ))
          : block
            ? INTERVAL_EXERCISES.map((name) => (
                <SheetRow
                  key={name}
                  label={name}
                  onPress={() => addBlock(newInterval(name))}
                />
              ))
            : null}
      </Sheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingBottom: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  barTitle: { flex: 1, textAlign: "center" },
  gap: { gap: space[1] },
  center: { textAlign: "center" },
  name: {
    minHeight: space[12],
    paddingVertical: space[2],
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.xl,
    color: colors.text,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  nameError: { borderBottomColor: colors.danger },
  card: {
    paddingHorizontal: space[4],
    paddingVertical: space[1],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  adds: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  empty: {
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[12],
  },
});
