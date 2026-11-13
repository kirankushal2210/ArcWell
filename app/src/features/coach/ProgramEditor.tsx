// The program editor shared by a client's training builder and the Plans tab's training templates
// (K-06, D56): name, length, then workout days with exercises (sets, reps, rest) and an optional
// note per day. The screen around it decides what it edits and how it's saved.
import { Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import {
  Button,
  IconButton,
  NumberStepper,
  Text,
} from "@/components/primitives";
import { ExercisePicker } from "@/features/athlete/ExercisePicker";
import { typeOf } from "@/features/athlete/library";
import { defaultTarget, type Session } from "@/features/athlete/training";
import { ExerciseRows } from "@/features/coach/ExerciseRows";
import { Eyebrow } from "@/features/coach/parts";
import {
  type TrainingDay,
  type TrainingProgram,
  uid,
} from "@/features/coach/plans";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";
import { restFor } from "@/features/science/rules";
import { VolumePanel } from "@/features/science/VolumePanel";

/** Every workout day has at least one exercise, and there is at least one day. */
export const programReady = (p: TrainingProgram) =>
  p.days.length > 0 && p.days.every((d) => d.exercises.length > 0);

export function ProgramEditor({
  value: p,
  onChange,
  namePlaceholder = "Program name, e.g. Fat loss phase 1",
  notePlaceholder = "Note for the client (optional)",
  history = [],
}: {
  value: TrainingProgram;
  onChange: (fn: (p: TrainingProgram) => TrainingProgram) => void;
  namePlaceholder?: string;
  notePlaceholder?: string;
  /** Recent sessions, so the exercise picker can show recent exercises first. */
  history?: Session[];
}) {
  const [picker, setPicker] = useState<string | null>(null);
  const setDay = (dayId: string, patch: (d: TrainingDay) => TrainingDay) =>
    onChange((x) => ({
      ...x,
      days: x.days.map((d) => (d.id === dayId ? patch(d) : d)),
    }));

  return (
    <>
      <TextInput
        value={p.name}
        onChangeText={(v) => onChange((x) => ({ ...x, name: v }))}
        placeholder={namePlaceholder}
        placeholderTextColor={colors.textMuted}
        style={styles.name}
        accessibilityLabel="Program name"
      />
      <View style={styles.row}>
        <Text style={styles.flex}>Length</Text>
        <NumberStepper
          value={p.weeks}
          onChange={(v) => onChange((x) => ({ ...x, weeks: v }))}
          min={1}
          max={24}
          unit="weeks"
          accessibilityLabel="Program length"
        />
      </View>

      <Eyebrow>{`Workouts · ${p.days.length} a week`}</Eyebrow>
      {p.days.map((d, di) => (
        <View key={d.id} style={styles.day}>
          <View style={styles.dayHead}>
            <TextInput
              value={d.name}
              onChangeText={(v) => setDay(d.id, (x) => ({ ...x, name: v }))}
              style={styles.dayName}
              accessibilityLabel={`Workout ${di + 1} name`}
            />
            <IconButton
              icon={Trash2}
              accessibilityLabel={`Remove ${d.name}`}
              color={colors.textMuted}
              onPress={() =>
                onChange((x) => ({
                  ...x,
                  days: x.days.filter((y) => y.id !== d.id),
                }))
              }
            />
          </View>
          <TextInput
            value={d.note ?? ""}
            onChangeText={(v) => setDay(d.id, (x) => ({ ...x, note: v }))}
            placeholder={notePlaceholder}
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.dayNote}
            accessibilityLabel={`${d.name} note`}
          />
          <ExerciseRows
            exercises={d.exercises}
            onChange={(list) =>
              setDay(d.id, (x) => ({ ...x, exercises: list }))
            }
          />
          <Button
            label="Add exercise"
            icon={Plus}
            variant="ghost"
            onPress={() => setPicker(d.id)}
          />
        </View>
      ))}
      <Button
        label="Add a workout day"
        icon={Plus}
        variant="secondary"
        fullWidth
        onPress={() =>
          onChange((x) => ({
            ...x,
            days: [
              ...x.days,
              { id: uid("d"), name: `Day ${x.days.length + 1}`, exercises: [] },
            ],
          }))
        }
      />

      <ExercisePicker
        visible={picker !== null}
        title={
          picker
            ? `Add to ${p.days.find((d) => d.id === picker)?.name ?? "workout"}`
            : undefined
        }
        history={history}
        onClose={() => setPicker(null)}
        onPick={(names) => {
          if (picker)
            setDay(picker, (x) => ({
              ...x,
              exercises: [
                ...x.exercises,
                ...names.map((name) => ({
                  id: uid("e"),
                  name,
                  sets: 3,
                  reps: defaultTarget(name),
                  restSec:
                    typeOf(name) === "distance_duration" ? 0 : restFor(name),
                })),
              ],
            }));
          setPicker(null);
        }}
      />
      {/* Live evidence check (D69): junk volume, missing muscles, crowded sessions. */}
      <VolumePanel days={p.days} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  name: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
  },
  day: {
    gap: space[1],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  dayHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
  dayName: {
    flex: 1,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
    paddingVertical: space[2],
  },
  dayNote: {
    minHeight: 40,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
  },
});
