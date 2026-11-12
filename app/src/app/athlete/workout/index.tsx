// Active workout (F4-02 to F4-07, F4-11, TR-08; Hevy-style set table). Each set row is pre-filled from
// the plan or the last session, so a matching set is one tap on ✓. Values open the gym keypad. Ticking
// starts the rest timer, which also alerts with the screen off. Timed sets count down with ▶.
// Everything is saved on the phone as it changes (F4-09). The minimise arrow keeps it running (F4-10).
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Check,
  ChevronDown,
  Ellipsis,
  Play,
  Plus,
  Sparkles,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { Keypad, type KeypadField } from "@/features/athlete/Keypad";
import {
  cancelRestAlert,
  scheduleRestAlert,
} from "@/features/athlete/restAlert";
import { ExercisePicker } from "@/features/athlete/ExercisePicker";
import {
  type ExerciseType,
  fieldHead,
  findExercise,
  LIBRARY,
  type SetField,
  typeOf,
} from "@/features/athlete/library";
import { Sheet, SheetRow } from "@/features/athlete/Sheet";
import {
  type ActiveWorkout,
  clockTime,
  defaultTarget,
  exerciseFrom,
  exType,
  groupOf,
  type LoggedExercise,
  type LoggedSet,
  now,
  previousSets,
  setFields,
  setLabel,
  suggestion,
  toSession,
} from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Pills } from "@/features/coach/parts";
import { uid } from "@/features/coach/plans";
import { alternativesFor } from "@/features/onboarding/workouts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const REST_STEPS = [0, 30, 60, 90, 120, 180];

type KeypadTarget = { exId: string; setId: string; field: KeypadField };

/** Keypad field for a set field: runs and rides take minutes, carries and sleds take metres. */
const padFieldOf = (f: SetField, t: ExerciseType): KeypadField =>
  f === "seconds" && t === "distance_duration"
    ? "minutes"
    : f === "km" && t === "weight_distance"
      ? "m"
      : f;
const padFields = (e: LoggedExercise) =>
  setFields(e).map((f) => padFieldOf(f, exType(e)));
/** Read and write the set value behind a keypad field. */
const readPad = (s: LoggedSet, f: KeypadField): number | null =>
  f === "minutes"
    ? s.seconds === null
      ? null
      : Math.round((s.seconds / 60) * 100) / 100
    : f === "km"
      ? (s.km ?? null)
      : f === "m"
        ? s.km == null
          ? null
          : Math.round(s.km * 1000)
        : s[f];
const writePad = (f: KeypadField, v: number | null): Partial<LoggedSet> =>
  f === "minutes"
    ? { seconds: v === null ? null : Math.round(v * 60) }
    : f === "m"
      ? { km: v === null ? null : v / 1000 }
      : { [f]: v };

export default function Workout() {
  const me = useMe();
  const {
    active,
    setActive,
    sessions,
    finishWorkout,
    meTier,
    coachName,
    saveProgram,
  } = useCoachData();
  const insets = useSafeAreaInsets();
  const [clock, setClock] = useState(now);
  const [menu, setMenu] = useState<string | null>(null);
  const [swap, setSwap] = useState<string | null>(null);
  const [swapScope, setSwapScope] = useState<"today" | "plan">("today");
  const [adding, setAdding] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [noting, setNoting] = useState<string | null>(null);
  const [pad, setPad] = useState<KeypadTarget | null>(null);

  // One clock for the elapsed time, the rest countdown and timed sets.
  useEffect(() => {
    const t = setInterval(() => setClock(now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Rest over while the app is open: one vibration, then the timer clears (F4-04).
  const restEnds = active?.rest?.endsAt;
  useEffect(() => {
    if (restEnds && clock >= restEnds) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      cancelRestAlert();
      setActive((w) => (w ? { ...w, rest: null } : w));
    }
  }, [clock, restEnds, setActive]);

  // A timed set reached zero: vibrate, tick it and start the rest (TR-08).
  const timerEnds = active?.timer?.endsAt;
  const timerSet = active?.timer?.setId;
  useEffect(() => {
    if (!timerEnds || !timerSet || clock < timerEnds) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setActive((w) => {
      if (!w) return w;
      const ex = w.exercises.find((e) => e.sets.some((s) => s.id === timerSet));
      const exercises = w.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => (s.id === timerSet ? { ...s, done: true } : s)),
      }));
      const rest =
        ex && ex.restSec > 0
          ? {
              endsAt: now() + ex.restSec * 1000,
              total: ex.restSec,
              next: ex.name,
            }
          : null;
      if (rest && ex) scheduleRestAlert(ex.restSec, ex.name);
      return { ...w, exercises, timer: null, rest };
    });
  }, [clock, timerEnds, timerSet, setActive]);

  if (!me) return <NotJoined />;
  if (!active)
    return (
      <View style={[styles.root, styles.centerBox, { paddingTop: insets.top }]}>
        <Text tone="muted">No workout in progress.</Text>
        <Button
          label="Back to Training"
          variant="secondary"
          onPress={() => router.replace("/athlete/training")}
        />
      </View>
    );

  const history = sessions(me.id);
  const coached = meTier === "coached";
  const edit = (fn: (w: ActiveWorkout) => ActiveWorkout) =>
    setActive((w) => (w ? fn(w) : w));
  const editEx = (exId: string, fn: (e: LoggedExercise) => LoggedExercise) =>
    edit((w) => ({
      ...w,
      exercises: w.exercises.map((e) => (e.id === exId ? fn(e) : e)),
    }));
  const editSet = (exId: string, setId: string, patch: Partial<LoggedSet>) =>
    editEx(exId, (x) => ({
      ...x,
      sets: x.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
    }));

  const total = active.exercises.reduce(
    (n, e) => n + (e.skipped ? 0 : e.sets.length),
    0,
  );
  const ticked = active.exercises.reduce(
    (n, e) => n + (e.skipped ? 0 : e.sets.filter((s) => s.done).length),
    0,
  );
  const exDone = active.exercises.filter(
    (e) => e.skipped || e.sets.every((s) => s.done),
  ).length;
  const missing = active.exercises
    .filter((e) => !e.skipped)
    .map((e) => ({ name: e.name, n: e.sets.filter((s) => !s.done).length }))
    .filter((x) => x.n > 0);

  // The dock's set (D67): the first set not yet ticked, so logging is one thumb tap at the bottom.
  const nextEx = active.exercises.find(
    (e) => !e.skipped && e.sets.some((s) => !s.done),
  );
  const nextSet = nextEx?.sets.find((s) => !s.done);
  const nextLabel =
    nextEx && nextSet
      ? nextSet.warmup
        ? `Log warm-up · ${nextEx.name}`
        : `Log set ${nextEx.sets.filter((x) => !x.warmup).indexOf(nextSet) + 1} · ${nextEx.name}`
      : null;

  const startRest = (e: LoggedExercise, afterSetId: string) => {
    if (e.restSec <= 0) return;
    const idx = e.sets.findIndex((s) => s.id === afterSetId);
    const nextSet = e.sets.slice(idx + 1).find((s) => !s.done);
    const nextEx = active.exercises.find(
      (x) => x.id !== e.id && !x.skipped && x.sets.some((s) => !s.done),
    );
    const next = nextSet
      ? `${e.name}, set ${e.sets.indexOf(nextSet) + 1} · ${setLabel(nextSet, e.name)}`
      : nextEx
        ? nextEx.name
        : "Last set done";
    edit((w) => ({
      ...w,
      rest: { endsAt: now() + e.restSec * 1000, total: e.restSec, next },
    }));
    scheduleRestAlert(e.restSec, next);
  };

  const tick = (e: LoggedExercise, s: LoggedSet) => {
    Haptics.selectionAsync().catch(() => {});
    editSet(e.id, s.id, { done: !s.done });
    if (!s.done) startRest(e, s.id);
  };

  const finish = (markAll: boolean) => {
    cancelRestAlert();
    const s = toSession(active, history, markAll);
    finishWorkout(me.id, s);
    setActive(null);
    setFinishing(false);
    router.replace({
      pathname: "/athlete/workout/summary/[id]",
      params: { id: s.id },
    });
  };

  const move = (exId: string, by: -1 | 1) =>
    edit((w) => {
      const i = w.exercises.findIndex((e) => e.id === exId);
      const j = i + by;
      if (i < 0 || j < 0 || j >= w.exercises.length) return w;
      const list = [...w.exercises];
      [list[i], list[j]] = [list[j], list[i]];
      return { ...w, exercises: list };
    });

  const menuEx = active.exercises.find((e) => e.id === menu);
  const menuIndex = menuEx ? active.exercises.indexOf(menuEx) : -1;
  const swapEx = active.exercises.find((e) => e.id === swap);
  // F4-07: same movement, the athlete's equipment, nothing that loads an injury; else same muscles.
  const smart =
    swapEx && me.profile ? alternativesFor(swapEx.name, me.profile) : null;
  const alternatives = swapEx
    ? smart && smart.length
      ? smart.map((name) => ({ name, group: groupOf(name) }))
      : LIBRARY.filter(
          (x) => groupOf(x.name) === swapEx.group && x.name !== swapEx.name,
        )
          .slice(0, 12)
          .map((x) => ({ name: x.name, group: swapEx.group }))
    : [];
  const rest = active.rest;
  const restLeft = rest ? Math.max(0, rest.endsAt - clock) : 0;

  const padEx = pad
    ? active.exercises.find((e) => e.id === pad.exId)
    : undefined;
  const padSet = padEx?.sets.find((s) => s.id === pad?.setId);
  const padValue = padSet && pad ? readPad(padSet, pad.field) : null;
  const padNext = (): KeypadTarget | null => {
    if (!pad || !padEx || !padSet) return null;
    const order = padFields(padEx);
    const at = order.indexOf(pad.field);
    if (at >= 0 && at < order.length - 1)
      return { ...pad, field: order[at + 1] };
    const i = padEx.sets.indexOf(padSet);
    const nextSet = padEx.sets[i + 1];
    if (!nextSet) return null;
    return { exId: padEx.id, setId: nextSet.id, field: order[0] };
  };

  const swapTo = (name: string) => {
    if (!swapEx) return;
    const fresh = exerciseFrom(
      name,
      swapEx.sets.length,
      typeOf(name) === exType(swapEx)
        ? (swapEx.target.split(" × ")[1] ?? "10")
        : defaultTarget(name),
      swapEx.restSec,
      history,
    );
    edit((w) => ({
      ...w,
      exercises: w.exercises.map((x) =>
        x.id === swapEx.id
          ? { ...fresh, id: x.id, swappedFrom: x.swappedFrom ?? x.name }
          : x,
      ),
    }));
    if (!coached && swapScope === "plan" && me.program && active.dayId)
      saveProgram(me.id, {
        ...me.program,
        days: me.program.days.map((d) =>
          d.id === active.dayId
            ? {
                ...d,
                exercises: d.exercises.map((x) =>
                  x.name === swapEx.name ? { ...x, name } : x,
                ),
              }
            : d,
        ),
      });
    setSwap(null);
    setBrowsing(false);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + space[1] }]}>
        <IconButton
          icon={ChevronDown}
          accessibilityLabel="Minimise workout"
          onPress={() => router.back()}
        />
        <View style={styles.flex}>
          <Text weight="semibold" numberOfLines={1}>
            {active.name}
          </Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {clockTime(clock - active.startedAt)} · {exDone} of{" "}
            {active.exercises.length} exercises
          </Text>
        </View>
        <Button
          label="Finish"
          size="sm"
          variant="secondary"
          onPress={() => (missing.length ? setFinishing(true) : finish(false))}
          disabled={ticked === 0}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          variant="label"
          weight="regular"
          tone="muted"
          numeric
          style={styles.saved}
        >
          {ticked} of {total} sets · saved on this phone as you go
        </Text>

        {active.exercises.map((e) => {
          const prev = previousSets(history, e.name);
          const hint = suggestion(history, e);
          if (e.skipped)
            return (
              <View key={e.id} style={[styles.card, styles.dim]}>
                <View style={styles.cardHead}>
                  <Text weight="semibold" style={styles.flex}>
                    {e.name}
                  </Text>
                  <Button
                    label="Undo skip"
                    variant="ghost"
                    onPress={() =>
                      editEx(e.id, (x) => ({ ...x, skipped: false }))
                    }
                  />
                </View>
                <Text variant="label" tone="muted">
                  Skipped{coached ? `, ${coachName} will see this` : ""}
                </Text>
              </View>
            );
          return (
            <View key={e.id} style={styles.card}>
              <View style={styles.cardHead}>
                <PressableScale
                  onPress={() =>
                    router.push({
                      pathname: "/athlete/exercises/[name]",
                      params: { name: e.name },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${e.name}, how to do it`}
                  style={styles.flex}
                >
                  <Text variant="heading">{e.name}</Text>
                  <Text variant="label" weight="regular" tone="muted">
                    {e.swappedFrom ? `Swapped for ${e.swappedFrom} · ` : ""}
                    {e.group} · target {e.target} · rest{" "}
                    {e.restSec ? clockTime(e.restSec * 1000) : "none"}
                  </Text>
                </PressableScale>
                <IconButton
                  icon={Ellipsis}
                  accessibilityLabel={`${e.name} options`}
                  onPress={() => setMenu(e.id)}
                />
              </View>

              {hint && !e.sets.some((s) => s.done) ? (
                <View style={styles.hint}>
                  <Sparkles size={16} color={colors.text} />
                  <Text variant="label" weight="regular" style={styles.flex}>
                    {hint.text}
                  </Text>
                  {hint.kg !== null &&
                  e.sets.some((s) => !s.warmup && s.kg !== hint.kg) ? (
                    <PressableScale
                      onPress={() =>
                        editEx(e.id, (x) => ({
                          ...x,
                          sets: x.sets.map((s) =>
                            s.done || s.warmup ? s : { ...s, kg: hint.kg },
                          ),
                        }))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Use ${hint.kg} kg for every set`}
                      style={styles.use}
                    >
                      <Text variant="label">Use</Text>
                    </PressableScale>
                  ) : null}
                </View>
              ) : null}

              {e.note ? (
                <Text
                  variant="label"
                  weight="regular"
                  tone="muted"
                  style={styles.note}
                >
                  {e.note}
                </Text>
              ) : null}
              {noting === e.id ? (
                <TextInput
                  autoFocus
                  defaultValue={e.note}
                  onEndEditing={(ev) => {
                    const v = ev.nativeEvent.text.trim();
                    editEx(e.id, (x) => ({ ...x, note: v }));
                    setNoting(null);
                  }}
                  placeholder={
                    coached ? `Note for ${coachName}` : "Note for this exercise"
                  }
                  placeholderTextColor={colors.textMuted}
                  style={styles.noteInput}
                  accessibilityLabel={`${e.name} note`}
                />
              ) : null}

              <View style={styles.tableHead}>
                <Text variant="caption" tone="muted" style={styles.colSet}>
                  SET
                </Text>
                <Text variant="caption" tone="muted" style={styles.colPrev}>
                  PREVIOUS
                </Text>
                {setFields(e).map((f) => (
                  <Text
                    key={f}
                    variant="caption"
                    tone="muted"
                    style={
                      setFields(e).length === 1 ? styles.colWide : styles.colIn
                    }
                  >
                    {fieldHead(f, exType(e))}
                  </Text>
                ))}
                <View style={styles.colTick} />
              </View>

              {e.sets.map((s, k) => {
                const workNo = e.sets
                  .slice(0, k + 1)
                  .filter((x) => !x.warmup).length;
                const p = s.warmup ? undefined : prev[workNo - 1];
                const running = active.timer?.setId === s.id;
                const cell = (
                  field: KeypadField,
                  text: string,
                  placeholder: string,
                  style: object,
                ) => (
                  <PressableScale
                    key={field}
                    onPress={() => setPad({ exId: e.id, setId: s.id, field })}
                    accessibilityRole="button"
                    accessibilityLabel={`${e.name} set ${workNo} ${field}, ${text || "empty"}`}
                    style={[styles.cell, style]}
                  >
                    <Text
                      weight="semibold"
                      tone={text ? "default" : "muted"}
                      numeric
                    >
                      {text || placeholder}
                    </Text>
                  </PressableScale>
                );
                return (
                  <View
                    key={s.id}
                    style={[styles.setRow, s.done && styles.setDone]}
                  >
                    <PressableScale
                      onPress={() => editSet(e.id, s.id, { warmup: !s.warmup })}
                      accessibilityRole="button"
                      accessibilityLabel={
                        s.warmup
                          ? "Warm-up set, tap to make it a working set"
                          : `Set ${workNo}, tap to mark as warm-up`
                      }
                      style={styles.colSet}
                    >
                      <Text
                        weight="semibold"
                        tone={s.warmup ? "warning" : "default"}
                        numeric
                      >
                        {s.warmup ? "W" : workNo}
                      </Text>
                    </PressableScale>
                    <Text
                      variant="label"
                      weight="regular"
                      tone="muted"
                      numeric
                      style={styles.colPrev}
                      numberOfLines={1}
                    >
                      {p ? setLabel(p, e.name) : "—"}
                    </Text>
                    {setFields(e).map((f) => {
                      const type = exType(e);
                      const single = setFields(e).length === 1;
                      if (f === "seconds" && type === "duration")
                        return (
                          <View
                            key={f}
                            style={[styles.colWide, styles.timedRow]}
                          >
                            {running ? (
                              <View
                                style={[
                                  styles.cell,
                                  styles.flex,
                                  styles.cellLive,
                                ]}
                              >
                                <Text weight="semibold" tone="onBrand" numeric>
                                  {clockTime(
                                    Math.max(
                                      0,
                                      (active.timer?.endsAt ?? 0) - clock,
                                    ),
                                  )}
                                </Text>
                              </View>
                            ) : (
                              cell(
                                "seconds",
                                s.seconds === null
                                  ? ""
                                  : clockTime(s.seconds * 1000),
                                "time",
                                styles.flex,
                              )
                            )}
                            {s.done ? null : (
                              <IconButton
                                icon={running ? X : Play}
                                variant="filled"
                                accessibilityLabel={
                                  running
                                    ? "Stop timer"
                                    : `Start ${s.seconds ?? 30} second timer`
                                }
                                onPress={() =>
                                  edit((w) => ({
                                    ...w,
                                    timer: running
                                      ? null
                                      : {
                                          setId: s.id,
                                          endsAt:
                                            now() + (s.seconds ?? 30) * 1000,
                                        },
                                  }))
                                }
                              />
                            )}
                          </View>
                        );
                      const v =
                        f === "km" ? (s.km ?? null) : (s[f] as number | null);
                      const text =
                        v === null
                          ? ""
                          : f === "seconds"
                            ? clockTime(v * 1000)
                            : f === "km" && type === "weight_distance"
                              ? `${Math.round(v * 1000)}`
                              : String(v);
                      const placeholder =
                        f === "kg"
                          ? type === "weight_reps" || type === "weight_distance"
                            ? "kg"
                            : "0"
                          : f === "seconds"
                            ? "time"
                            : f === "km" && type === "weight_distance"
                              ? "m"
                              : f;
                      return cell(
                        padFieldOf(f, type),
                        text,
                        placeholder,
                        single ? styles.colWide : styles.colIn,
                      );
                    })}
                    <PressableScale
                      onPress={() => tick(e, s)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: s.done }}
                      accessibilityLabel={`${e.name} set ${workNo} done`}
                      style={[
                        styles.colTick,
                        styles.tick,
                        s.done && styles.tickOn,
                      ]}
                    >
                      <Check
                        size={20}
                        strokeWidth={3}
                        color={s.done ? colors.onPillar : colors.textMuted}
                      />
                    </PressableScale>
                  </View>
                );
              })}
              <Button
                label="Add set"
                icon={Plus}
                variant="ghost"
                onPress={() =>
                  editEx(e.id, (x) => {
                    const last = x.sets[x.sets.length - 1];
                    return {
                      ...x,
                      sets: [
                        ...x.sets,
                        {
                          id: uid("s"),
                          warmup: false,
                          kg: last?.kg ?? null,
                          reps: last?.reps ?? null,
                          seconds: last?.seconds ?? null,
                          km: last?.km ?? null,
                          done: false,
                        },
                      ],
                    };
                  })
                }
              />
            </View>
          );
        })}

        <Button
          label="Add exercise"
          icon={Plus}
          variant="secondary"
          fullWidth
          onPress={() => setAdding(true)}
        />
        <Button
          label="Discard workout"
          variant="ghost"
          fullWidth
          onPress={() =>
            Alert.alert(
              "Discard this workout?",
              "Nothing from this session will be saved.",
              [
                { text: "Keep going", style: "cancel" },
                {
                  text: "Discard",
                  style: "destructive",
                  onPress: () => {
                    cancelRestAlert();
                    setActive(null);
                    router.replace("/athlete/training");
                  },
                },
              ],
            )
          }
        />
      </ScrollView>

      {rest ? null : (
        <View
          style={[
            styles.dock,
            { paddingBottom: Math.max(insets.bottom, space[3]) },
          ]}
        >
          {nextEx && nextSet && nextLabel ? (
            <Button
              label={nextLabel}
              icon={Check}
              pillar="training"
              fullWidth
              onPress={() => tick(nextEx, nextSet)}
            />
          ) : (
            <Button
              label="Finish workout"
              pillar="training"
              fullWidth
              disabled={ticked === 0}
              onPress={() => finish(false)}
            />
          )}
        </View>
      )}

      {rest ? (
        <View
          style={[
            styles.rest,
            { paddingBottom: Math.max(insets.bottom, space[3]) },
          ]}
        >
          <View style={styles.restHead}>
            <View style={styles.flex}>
              <Text variant="eyebrow" tone="muted">
                Rest
              </Text>
              <Text
                variant="label"
                weight="regular"
                tone="muted"
                numberOfLines={1}
              >
                Next: {rest.next}
              </Text>
            </View>
            <Text variant="display" numeric>
              {clockTime(restLeft)}
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.round((restLeft / (rest.total * 1000)) * 100)}%`,
                },
              ]}
            />
          </View>
          <View style={styles.restRow}>
            {(
              [
                ["−15 s", -15],
                ["+15 s", 15],
              ] as const
            ).map(([label, d]) => (
              <View key={label} style={styles.flex}>
                <Button
                  label={label}
                  variant="secondary"
                  fullWidth
                  onPress={() => {
                    const endsAt = rest.endsAt + d * 1000;
                    edit((w) =>
                      w.rest
                        ? {
                            ...w,
                            rest: {
                              ...w.rest,
                              endsAt,
                              total: w.rest.total + (d > 0 ? d : 0),
                            },
                          }
                        : w,
                    );
                    scheduleRestAlert((endsAt - now()) / 1000, rest.next);
                  }}
                />
              </View>
            ))}
            <View style={styles.flex}>
              <Button
                label="Skip"
                fullWidth
                onPress={() => {
                  cancelRestAlert();
                  edit((w) => ({ ...w, rest: null }));
                }}
              />
            </View>
          </View>
        </View>
      ) : null}

      {/* Exercise options (F4-06) */}
      <Sheet
        visible={!!menuEx}
        onClose={() => setMenu(null)}
        title={menuEx?.name}
      >
        {menuEx ? (
          <>
            <SheetRow
              label="How to do it"
              sub="Muscles and your history"
              onPress={() => {
                setMenu(null);
                router.push({
                  pathname: "/athlete/exercises/[name]",
                  params: { name: menuEx.name },
                });
              }}
            />
            <SheetRow
              label="Swap exercise"
              sub="Same movement, your equipment, e.g. when the machine is busy"
              onPress={() => {
                setMenu(null);
                setSwapScope("today");
                setSwap(menuEx.id);
              }}
            />
            <SheetRow
              label={menuEx.note ? "Edit note" : "Add a note"}
              sub={coached ? `${coachName} sees notes in your log` : undefined}
              onPress={() => {
                setMenu(null);
                setNoting(menuEx.id);
              }}
            />
            <SheetRow
              label="Change rest time"
              sub={`Now ${menuEx.restSec ? clockTime(menuEx.restSec * 1000) : "none"} · tap to cycle`}
              onPress={() =>
                editEx(menuEx.id, (x) => ({
                  ...x,
                  restSec:
                    REST_STEPS[
                      (REST_STEPS.indexOf(x.restSec) + 1) % REST_STEPS.length
                    ] ?? 90,
                }))
              }
            />
            {menuIndex > 0 ? (
              <SheetRow label="Move up" onPress={() => move(menuEx.id, -1)} />
            ) : null}
            {menuIndex < active.exercises.length - 1 ? (
              <SheetRow label="Move down" onPress={() => move(menuEx.id, 1)} />
            ) : null}
            <SheetRow
              label="Skip this exercise"
              sub={coached ? `${coachName} sees skips in your log` : undefined}
              onPress={() => {
                editEx(menuEx.id, (x) => ({ ...x, skipped: true }));
                setMenu(null);
              }}
            />
            <SheetRow
              label="Remove from today"
              tone="danger"
              onPress={() => {
                edit((w) => ({
                  ...w,
                  exercises: w.exercises.filter((x) => x.id !== menuEx.id),
                }));
                setMenu(null);
              }}
            />
          </>
        ) : null}
      </Sheet>

      {/* Swap (F4-07): coached athletes swap for today only and the coach sees it (D45) */}
      <Sheet
        visible={!!swapEx && !browsing}
        onClose={() => setSwap(null)}
        title={swapEx ? `Swap ${swapEx.name}` : undefined}
        sub={
          smart && smart.length
            ? "Same movement, fits your equipment and injuries"
            : swapEx
              ? `Other ${swapEx.group.toLowerCase()} exercises`
              : undefined
        }
      >
        {swapEx ? (
          <>
            {coached ? (
              <Text variant="caption" tone="muted">
                For today only. {coachName} sees the swap in your log.
              </Text>
            ) : (
              <Pills<"today" | "plan">
                value={swapScope}
                onChange={setSwapScope}
                options={[
                  { value: "today", label: "Today only" },
                  { value: "plan", label: "Rest of plan" },
                ]}
              />
            )}
            <ScrollView style={styles.sheetList}>
              {alternatives.length === 0 ? (
                <Text tone="muted">
                  No alternatives that fit your equipment and injuries.
                </Text>
              ) : null}
              {alternatives.map((alt) => {
                const last = previousSets(history, alt.name)[0];
                return (
                  <SheetRow
                    key={alt.name}
                    label={alt.name}
                    sub={
                      last
                        ? `Last: ${setLabel(last, alt.name)}`
                        : "Not done yet"
                    }
                    onPress={() => swapTo(alt.name)}
                  />
                );
              })}
            </ScrollView>
            <Button
              label="Browse all exercises"
              variant="secondary"
              fullWidth
              onPress={() => setBrowsing(true)}
            />
          </>
        ) : null}
      </Sheet>
      <ExercisePicker
        visible={!!swapEx && browsing}
        multi={false}
        title={swapEx ? `Swap ${swapEx.name}` : undefined}
        suggested={
          alternatives.length
            ? {
                title: "Suggested for you",
                names: alternatives.map((a) => a.name),
              }
            : undefined
        }
        history={history}
        onClose={() => setBrowsing(false)}
        onPick={([name]) => swapTo(name)}
      />

      {/* Finish with sets still open (F4-11) */}
      <Sheet
        visible={finishing}
        onClose={() => setFinishing(false)}
        title="Finish workout?"
        sub={`${missing.reduce((n, m) => n + m.n, 0)} sets aren't ticked: ${missing.map((m) => `${m.name} (${m.n})`).join(", ")}.`}
      >
        <Button
          label="Mark them done and finish"
          fullWidth
          onPress={() => finish(true)}
        />
        <Button
          label="Finish without them"
          variant="secondary"
          fullWidth
          onPress={() => finish(false)}
        />
        <Button
          label="Keep going"
          variant="ghost"
          fullWidth
          onPress={() => setFinishing(false)}
        />
      </Sheet>

      {/* Gym keypad (F4-05) */}
      {pad && padEx && padSet ? (
        <Keypad
          key={`${pad.setId}-${pad.field}`}
          barbell={findExercise(padEx.name)?.equipment === "barbell"}
          visible
          title={`${padEx.name} · ${padSet.warmup ? "warm-up" : `set ${padEx.sets.filter((x) => !x.warmup).indexOf(padSet) + 1}`}`}
          field={pad.field}
          value={padValue}
          onClose={() => setPad(null)}
          onDone={(v) => {
            editSet(padEx.id, padSet.id, writePad(pad.field, v));
            setPad(null);
          }}
          onNext={(v) => {
            editSet(padEx.id, padSet.id, writePad(pad.field, v));
            setPad(padNext());
          }}
        />
      ) : null}

      {/* Add exercise */}
      <ExercisePicker
        visible={adding}
        history={history}
        onClose={() => setAdding(false)}
        onPick={(names) => {
          edit((w) => ({
            ...w,
            exercises: [
              ...w.exercises,
              ...names.map((name) => {
                const cardio = typeOf(name) === "distance_duration";
                return exerciseFrom(
                  name,
                  cardio ? 1 : 3,
                  defaultTarget(name),
                  cardio ? 0 : 90,
                  history,
                );
              }),
            ],
          }));
          setAdding(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  centerBox: { alignItems: "center", justifyContent: "center", gap: space[3] },
  flex: { flex: 1, gap: space[1] / 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: space[2],
    paddingBottom: space[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  body: { padding: rhythm.gutter, gap: space[3], paddingBottom: space[12] },
  dock: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
  saved: { paddingHorizontal: space[1] },
  card: {
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  dim: { opacity: 0.6 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    padding: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  use: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  note: { paddingHorizontal: space[1] },
  noteInput: {
    minHeight: 44,
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingTop: space[2],
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 52,
    paddingHorizontal: space[1],
    borderRadius: radius.md,
  },
  setDone: { backgroundColor: colors.bg },
  colSet: { width: 32, alignItems: "center" },
  colPrev: { flex: 1 },
  colIn: { width: 64 },
  colWide: { width: 136 },
  colTick: { width: 44 },
  timedRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  cell: {
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  cellLive: { backgroundColor: colors.brand },
  tick: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.training, borderColor: colors.training },
  rest: {
    gap: space[3],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[3],
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  restHead: { flexDirection: "row", alignItems: "center", gap: space[3] },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: 6, backgroundColor: colors.training },
  restRow: { flexDirection: "row", gap: space[2] },
  sheetList: { maxHeight: 360 },
});
