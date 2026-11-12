// Routine editor (F4-01): the athlete's own saved workout, outside their program, for sessions they
// repeat (an extra arm day, a hotel-gym circuit). Coached athletes keep their coach's program as is
// and can still plan these; the coach sees what was logged, as with any workout.
import { router, useLocalSearchParams } from "expo-router";
import { Dumbbell, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { ExercisePicker } from "@/features/athlete/ExercisePicker";
import { typeOf } from "@/features/athlete/library";
import { defaultTarget } from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { ExerciseRows } from "@/features/coach/ExerciseRows";
import { Page, PageHeader } from "@/features/coach/parts";
import { type TrainingDay, uid } from "@/features/coach/plans";
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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={saved ? "Edit routine" : "New routine"}
        onBack={back}
        actions={
          saved
            ? [
                {
                  icon: Trash2,
                  label: "Delete routine",
                  onPress: () =>
                    Alert.alert(
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
                    ),
                },
              ]
            : []
        }
      />
      <Page>
        <View style={styles.gap}>
          <TextInput
            value={r.name}
            onChangeText={(v) => setR((x) => ({ ...x, name: v }))}
            placeholder="Routine name, e.g. Arms and abs"
            placeholderTextColor={colors.textMuted}
            style={[styles.name, tried && !r.name.trim() && styles.nameError]}
            autoFocus={!saved}
            accessibilityLabel="Routine name"
          />
          {tried && !r.name.trim() ? (
            <Text variant="label" weight="regular" tone="danger">
              Give your routine a name.
            </Text>
          ) : null}
        </View>
        <TextInput
          value={r.note ?? ""}
          onChangeText={(v) => setR((x) => ({ ...x, note: v }))}
          placeholder="Note to self (optional)"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.note}
          accessibilityLabel="Routine note"
        />

        {r.exercises.length ? (
          <View style={styles.card}>
            <ExerciseRows
              exercises={r.exercises}
              onChange={(list) => setR((x) => ({ ...x, exercises: list }))}
            />
          </View>
        ) : (
          <View style={[styles.empty, tried && styles.emptyError]}>
            <Dumbbell size={28} color={colors.textMuted} />
            <Text tone="muted" style={styles.center}>
              Add the exercises you want in this routine. You can change sets,
              reps and rest after.
            </Text>
          </View>
        )}
        <Button
          label="Add exercises"
          icon={Plus}
          variant="secondary"
          fullWidth
          onPress={() => setPicking(true)}
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button label="Save routine" fullWidth onPress={save} />
      </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  gap: { gap: space[1] },
  center: { textAlign: "center" },
  name: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameError: { borderColor: colors.danger },
  note: {
    minHeight: 48,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  card: {
    paddingHorizontal: space[4],
    paddingVertical: space[1],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  empty: {
    alignItems: "center",
    gap: space[3],
    padding: space[6],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
  emptyError: { borderColor: colors.danger },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
