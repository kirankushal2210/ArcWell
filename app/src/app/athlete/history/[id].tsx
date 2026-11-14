// One finished workout (F4-13): read-only by default, with Edit to fix a mistyped weight or reps and
// Delete for a workout logged by accident. Notes, skips and swaps show as logged.
import { router, useLocalSearchParams } from "expo-router";
import { PencilLine, Trash2 } from "lucide-react-native";
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
import {
  fieldHead,
  fieldsOf,
  type SetField,
  typeOf,
} from "@/features/athlete/library";
import { type Session, setLabel } from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader, StatTile } from "@/features/coach/parts";
import { alert } from "@/lib/alert";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const EFFORT = ["", "Easy", "Moderate", "Hard", "Very hard", "All out"];

/** What a logged set holds: the exercise type's fields, or time when a plan timed a rep move. */
const fieldsFor = (
  name: string,
  s: Session["exercises"][number]["sets"][number],
) => {
  const f = fieldsOf(typeOf(name));
  return s.seconds !== null && !f.includes("seconds")
    ? (["seconds"] as SetField[])
    : f;
};
const UNIT: Record<SetField, string> = {
  kg: "kg",
  reps: "reps",
  seconds: "seconds",
  km: "km",
};

/** Volume of working sets, recomputed after an edit. */
const volumeOf = (s: Session) =>
  Math.round(
    s.exercises.reduce(
      (n, e) =>
        n +
        (["weight_reps", "weighted_bodyweight"].includes(typeOf(e.name))
          ? 1
          : 0) *
          e.sets.reduce(
            (m, x) => m + (!x.warmup && x.kg && x.reps ? x.kg * x.reps : 0),
            0,
          ),
      0,
    ),
  );

export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const { sessions, updateSession, deleteSession } = useCoachData();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Session | null>(null);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/history");
  if (!me) return <NotJoined />;
  const saved = sessions(me.id).find((x) => x.id === id);
  if (!saved) return <PageHeader title="Workout" onBack={back} />;
  const s = draft ?? saved;
  const editing = draft !== null;

  const setValue = (
    ei: number,
    si: number,
    key: SetField,
    v: string,
    per = 1,
  ) =>
    setDraft((d) => {
      const base = d ?? saved;
      const num = v.trim() === "" ? null : Number(v.replace(",", ".")) / per;
      return {
        ...base,
        exercises: base.exercises.map((e, i) =>
          i === ei
            ? {
                ...e,
                sets: e.sets.map((x, j) =>
                  j === si
                    ? { ...x, [key]: Number.isNaN(num) ? null : num }
                    : x,
                ),
              }
            : e,
        ),
      };
    });

  const remove = () =>
    alert(
      "Delete this workout?",
      "It's removed from your history and this week's count.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSession(me.id, saved.id);
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
      <PageHeader
        title={s.name}
        sub={new Date(s.at).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        onBack={editing ? () => setDraft(null) : back}
        actions={
          editing
            ? []
            : [
                {
                  icon: PencilLine,
                  label: "Edit workout",
                  onPress: () => setDraft(saved),
                },
                { icon: Trash2, label: "Delete workout", onPress: remove },
              ]
        }
      />
      <Page>
        <View style={styles.tiles}>
          <StatTile label="Time" value={`${s.minutes} min`} />
          <StatTile
            label="Volume"
            value={`${volumeOf(s).toLocaleString("en-IN")} kg`}
          />
          <StatTile label="Sets" value={`${s.setsDone}/${s.setsPlanned}`} />
        </View>
        {s.effort ? (
          <Text tone="muted">
            Felt: {EFFORT[s.effort]}
            {s.note ? ` · “${s.note}”` : ""}
          </Text>
        ) : null}
        {s.exercises.map((e, ei) => (
          <View key={`${e.name}-${ei}`} style={styles.card}>
            <Text weight="semibold">{e.name}</Text>
            {e.swappedFrom ? (
              <Text variant="label" weight="regular" tone="muted">
                Swapped for {e.swappedFrom}
              </Text>
            ) : null}
            {e.skipped ? (
              <Text variant="label" tone="muted">
                Skipped
              </Text>
            ) : e.sets.length ? (
              e.sets.map((x, si) => (
                <View key={si} style={styles.row}>
                  <Text
                    tone={x.warmup ? "warning" : "muted"}
                    numeric
                    style={styles.no}
                  >
                    {x.warmup
                      ? "W"
                      : e.sets.slice(0, si + 1).filter((y) => !y.warmup).length}
                  </Text>
                  {editing ? (
                    <>
                      {fieldsFor(e.name, x).map((f) => {
                        // Carries and sleds are edited in metres, like in the workout.
                        const metres =
                          f === "km" && typeOf(e.name) === "weight_distance";
                        const raw = f === "km" ? (x.km ?? null) : x[f];
                        const v =
                          metres && raw !== null ? Math.round(raw * 1000) : raw;
                        return (
                          <TextInput
                            key={f}
                            value={v === null ? "" : String(v)}
                            onChangeText={(t) =>
                              setValue(ei, si, f, t, metres ? 1000 : 1)
                            }
                            keyboardType={
                              f === "kg" || f === "km"
                                ? "decimal-pad"
                                : "number-pad"
                            }
                            placeholder={fieldHead(
                              f,
                              typeOf(e.name),
                            ).toLowerCase()}
                            placeholderTextColor={colors.textMuted}
                            style={styles.input}
                            accessibilityLabel={`${e.name} set ${si + 1} ${UNIT[f]}`}
                          />
                        );
                      })}
                    </>
                  ) : (
                    <Text numeric>{setLabel(x, e.name)}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text variant="label" tone="muted">
                No sets logged
              </Text>
            )}
            {e.note ? (
              <Text variant="label" weight="regular" tone="muted">
                Note: {e.note}
              </Text>
            ) : null}
          </View>
        ))}
        {!editing && s.bests.length ? (
          <Text variant="label" weight="regular" tone="muted">
            New bests:{" "}
            {s.bests
              .map((b) => `${b.name} ${b.text.split(" · ")[0]}`)
              .join(", ")}
          </Text>
        ) : null}
      </Page>
      {editing ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label="Save changes"
            fullWidth
            onPress={() => {
              if (draft)
                updateSession(me.id, { ...draft, volume: volumeOf(draft) });
              setDraft(null);
            }}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tiles: { flexDirection: "row", gap: space[2] },
  card: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[1],
  },
  no: { width: 24 },
  input: {
    width: 72,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    textAlign: "center",
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
