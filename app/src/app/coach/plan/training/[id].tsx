// Training program builder (K-06, D56): start from a template or from scratch, then edit days and
// exercises (sets, reps, rest). This is the client's own copy; templates are never changed.
import { router, useLocalSearchParams } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  NumberStepper,
  Text,
} from "@/components/primitives";
import { ExercisePicker } from "@/features/athlete/ExercisePicker";
import { typeOf } from "@/features/athlete/library";
import { defaultTarget } from "@/features/athlete/training";
import { useCoachData } from "@/features/coach/CoachData";
import { ExerciseRows } from "@/features/coach/ExerciseRows";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  emptyProgram,
  programFromTemplate,
  type TrainingDay,
  type TrainingProgram,
  uid,
} from "@/features/coach/plans";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function TrainingBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, templates, saveProgram, sessions } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<TrainingProgram>(
    () =>
      c?.program ??
      (c?.plan?.training
        ? programFromTemplate(c.plan.training)
        : emptyProgram()),
  );
  const [picker, setPicker] = useState<string | null>(null);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <PageHeader title="Training" onBack={back} />;

  const setDay = (dayId: string, patch: (d: TrainingDay) => TrainingDay) =>
    setP((x) => ({
      ...x,
      days: x.days.map((d) => (d.id === dayId ? patch(d) : d)),
    }));
  const training = templates.filter((t) => t.kind === "training");

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={
          c.id === "me" ? "Your program" : `Training · ${c.name.split(" ")[0]}`
        }
        onBack={back}
      />
      <Page>
        <Eyebrow>Start from</Eyebrow>
        <Pills
          value={p.days.length ? "" : "scratch"}
          onChange={(v) =>
            setP(v === "scratch" ? emptyProgram() : programFromTemplate(v))
          }
          options={[
            ...training.map((t) => ({ value: t.name, label: t.name })),
            { value: "scratch", label: "Blank" },
          ]}
        />
        <Text variant="caption" tone="muted">
          Picking a template replaces the days below with a fresh copy you can
          change freely.
        </Text>

        <TextInput
          value={p.name}
          onChangeText={(v) => setP((x) => ({ ...x, name: v }))}
          placeholder="Program name, e.g. Fat loss phase 1"
          placeholderTextColor={colors.textMuted}
          style={styles.name}
          accessibilityLabel="Program name"
        />
        <View style={styles.row}>
          <Text style={styles.flex}>Length</Text>
          <NumberStepper
            value={p.weeks}
            onChange={(v) => setP((x) => ({ ...x, weeks: v }))}
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
                  setP((x) => ({
                    ...x,
                    days: x.days.filter((y) => y.id !== d.id),
                  }))
                }
              />
            </View>
            <TextInput
              value={d.note ?? ""}
              onChangeText={(v) => setDay(d.id, (x) => ({ ...x, note: v }))}
              placeholder={
                c.id === "me"
                  ? "Note to self (optional)"
                  : `Note for ${c.name.split(" ")[0]} (optional)`
              }
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
            setP((x) => ({
              ...x,
              days: [
                ...x.days,
                {
                  id: uid("d"),
                  name: `Day ${x.days.length + 1}`,
                  exercises: [],
                },
              ],
            }))
          }
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save training program"
          fullWidth
          disabled={
            p.days.length === 0 || p.days.some((d) => d.exercises.length === 0)
          }
          onPress={() => {
            saveProgram(c.id, {
              ...p,
              name: p.name.trim() || `${p.days.length}-day program`,
            });
            back();
          }}
        />
      </View>

      <ExercisePicker
        visible={picker !== null}
        title={
          picker
            ? `Add to ${p.days.find((d) => d.id === picker)?.name ?? "workout"}`
            : undefined
        }
        history={sessions(c.id)}
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
                  restSec: typeOf(name) === "distance_duration" ? 0 : 90,
                })),
              ],
            }));
          setPicker(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
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
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
