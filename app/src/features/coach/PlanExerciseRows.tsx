// The exercises in one workout of a coach's program (K-06, K-07): tap a row to set sets, the target,
// rest and target effort (RPE), move it or remove it. Run and erg intervals and HYROX stations
// (D76, D79) edit their distance or time, repeats, pace and station here too. The athlete's own
// routine editor keeps the simpler ExerciseRows.
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import {
  Button,
  NumberStepper,
  PressableScale,
  Text,
} from "@/components/primitives";
import { typeOf } from "@/features/athlete/library";
import { countsVolume } from "@/features/athlete/training";
import { STATIONS, type StationKey } from "@/features/race/data";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

import { restText } from "./ExerciseRows";
import { Pills } from "./parts";
import {
  defaultRpe,
  INTERVAL_EXERCISES,
  paceUnit,
  type PlannedBlock,
  type PlannedExercise,
  planLine,
  RPE_RANGES,
  type RpeRange,
  rpeText,
  validPace,
  withBlock,
} from "./plans";

const key = (r: RpeRange) => `${r[0]}-${r[1]}`;

/** Target label for a plain exercise: reps, a time or a distance. */
const targetLabel = (name: string) => {
  const t = typeOf(name);
  return t === "duration" ||
    t === "duration_weight" ||
    t === "distance_duration"
    ? { label: "Time", hint: "Time, for example 40 s or 20 min" }
    : t === "weight_distance"
      ? { label: "Distance", hint: "Distance, for example 40 m" }
      : { label: "Reps", hint: "Reps, for example 8 to 10" };
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.flex}>{label}</Text>
      {children}
    </View>
  );
}

/** Target RPE: the rules range by default, or one the coach picks (D69, D83). */
function EffortPicker({
  e,
  experience,
  onChange,
}: {
  e: PlannedExercise;
  experience: string;
  onChange: (rpe: RpeRange | undefined) => void;
}) {
  // Rules ranges are for loaded sets, as in the logger; cardio, holds and blocks have no default.
  const auto =
    !e.block && countsVolume(typeOf(e.name))
      ? defaultRpe(e.name, experience)
      : null;
  const ranges =
    e.rpe && !RPE_RANGES.some((r) => key(r) === key(e.rpe!))
      ? [...RPE_RANGES, e.rpe]
      : RPE_RANGES;
  return (
    <View style={styles.effort}>
      <Text>Effort</Text>
      <Pills
        options={[
          {
            value: "auto",
            label: auto ? `Auto · ${rpeText(auto)}` : "Not set",
          },
          ...ranges.map((r) => ({ value: key(r), label: rpeText(r) })),
        ]}
        value={e.rpe ? key(e.rpe) : "auto"}
        onChange={(v) =>
          onChange(
            v === "auto" ? undefined : (v.split("-").map(Number) as RpeRange),
          )
        }
      />
    </View>
  );
}

function IntervalFields({
  e,
  block: b,
  set,
}: {
  e: PlannedExercise;
  block: Extract<PlannedBlock, { kind: "interval" }>;
  set: (next: PlannedExercise) => void;
}) {
  const unit = paceUnit(e.name);
  const [pace, setPace] = useState(b.pace ?? "");
  const block = (patch: Partial<typeof b>) =>
    set(withBlock(e, { ...b, ...patch }));
  return (
    <>
      <Pills
        options={INTERVAL_EXERCISES.map((n) => ({ value: n, label: n }))}
        value={e.name}
        onChange={(name) => set(withBlock({ ...e, name }, b))}
      />
      <Row label="Repeats">
        <NumberStepper
          value={e.sets}
          min={1}
          max={30}
          onChange={(v) => set({ ...e, sets: v })}
          accessibilityLabel="Repeats"
        />
      </Row>
      <Pills
        options={[
          { value: "distance", label: "Distance" },
          { value: "time", label: "Time" },
        ]}
        value={b.measure}
        onChange={(measure) =>
          block({
            measure,
            amount: measure === "distance" ? 400 : 60,
          })
        }
      />
      {b.measure === "distance" ? (
        <Row label="Each">
          <NumberStepper
            value={b.amount}
            step={100}
            min={100}
            max={10000}
            unit="m"
            onChange={(v) => block({ amount: v })}
            accessibilityLabel="Distance each repeat"
          />
        </Row>
      ) : (
        <Row label="Each">
          <NumberStepper
            value={b.amount}
            step={15}
            min={15}
            max={1800}
            unit="s"
            onChange={(v) => block({ amount: v })}
            accessibilityLabel="Time each repeat"
          />
        </Row>
      )}
      {unit ? (
        <Row label={`Pace ${unit}`}>
          <TextInput
            value={pace}
            onChangeText={(v) => {
              setPace(v);
              if (!v.trim() || validPace(v))
                block({ pace: v.trim() || undefined });
            }}
            placeholder="m:ss"
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            accessibilityLabel={`Target pace ${unit}, minutes and seconds`}
          />
        </Row>
      ) : null}
    </>
  );
}

function StationFields({
  e,
  block: b,
  set,
}: {
  e: PlannedExercise;
  block: Extract<PlannedBlock, { kind: "station" }>;
  set: (next: PlannedExercise) => void;
}) {
  const pick = (station: StationKey) => {
    const s = STATIONS.find((x) => x.key === station)!;
    set(
      withBlock(
        e,
        s.reps
          ? { kind: "station", station, amount: s.reps, unit: "reps" }
          : { kind: "station", station, amount: s.metres ?? 50, unit: "m" },
      ),
    );
  };
  return (
    <>
      <Pills
        options={STATIONS.map((s) => ({ value: s.key, label: s.label }))}
        value={b.station}
        onChange={pick}
      />
      <Row label={b.unit === "m" ? "Distance" : "Reps"}>
        <NumberStepper
          value={b.amount}
          step={b.unit === "m" ? 10 : 5}
          min={b.unit === "m" ? 10 : 5}
          max={b.unit === "m" ? 2000 : 300}
          unit={b.unit === "m" ? "m" : undefined}
          onChange={(v) => set(withBlock(e, { ...b, amount: v }))}
          accessibilityLabel={
            b.unit === "m" ? "Station distance" : "Station reps"
          }
        />
      </Row>
      <Row label="Rounds">
        <NumberStepper
          value={e.sets}
          min={1}
          max={10}
          onChange={(v) => set({ ...e, sets: v })}
          accessibilityLabel="Rounds"
        />
      </Row>
    </>
  );
}

export function PlanExerciseRows({
  exercises,
  onChange,
  experience = "some",
}: {
  exercises: PlannedExercise[];
  onChange: (next: PlannedExercise[]) => void;
  /** The client's training experience, for the default effort; templates use "some". */
  experience?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const replace = (next: PlannedExercise) =>
    onChange(exercises.map((y) => (y.id === next.id ? next : y)));
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= exercises.length) return;
    const list = [...exercises];
    [list[i], list[j]] = [list[j], list[i]];
    onChange(list);
  };

  return (
    <>
      {exercises.map((e, ei) => {
        const editing = open === e.id;
        const b = e.block;
        const line = `${planLine(e)} · ${restText(e.restSec)}`;
        const target = targetLabel(e.name);
        return (
          <View key={e.id} style={[styles.ex, ei > 0 && styles.exLine]}>
            <PressableScale
              onPress={() => setOpen(editing ? null : e.id)}
              accessibilityRole="button"
              accessibilityLabel={`${e.name}, ${line}`}
              style={styles.exRow}
            >
              <View style={styles.flex}>
                {b ? (
                  <Text variant="eyebrow" tone="muted">
                    {b.kind === "station" ? "HYROX station" : "Intervals"}
                  </Text>
                ) : null}
                <Text weight="medium">{e.name}</Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {line}
                </Text>
              </View>
              {editing ? (
                <ChevronUp size={18} color={colors.textMuted} />
              ) : (
                <ChevronDown size={18} color={colors.textMuted} />
              )}
            </PressableScale>
            {editing ? (
              <View style={styles.edit}>
                {b?.kind === "interval" ? (
                  <IntervalFields e={e} block={b} set={replace} />
                ) : b?.kind === "station" ? (
                  <StationFields e={e} block={b} set={replace} />
                ) : (
                  <>
                    <Row label="Sets">
                      <NumberStepper
                        value={e.sets}
                        min={1}
                        max={10}
                        onChange={(v) => replace({ ...e, sets: v })}
                        accessibilityLabel="Sets"
                      />
                    </Row>
                    <Row label={target.label}>
                      <TextInput
                        value={e.reps}
                        onChangeText={(v) => replace({ ...e, reps: v })}
                        style={styles.input}
                        accessibilityLabel={target.hint}
                      />
                    </Row>
                  </>
                )}
                <Row label="Rest">
                  <NumberStepper
                    value={e.restSec}
                    step={15}
                    min={0}
                    max={300}
                    unit="s"
                    onChange={(v) => replace({ ...e, restSec: v })}
                    accessibilityLabel="Rest"
                  />
                </Row>
                <EffortPicker
                  e={e}
                  experience={experience}
                  onChange={(rpe) => replace({ ...e, rpe })}
                />
                <View style={styles.actions}>
                  <Button
                    label="Up"
                    variant="ghost"
                    icon={ArrowUp}
                    disabled={ei === 0}
                    onPress={() => move(ei, -1)}
                  />
                  <Button
                    label="Down"
                    variant="ghost"
                    icon={ArrowDown}
                    disabled={ei === exercises.length - 1}
                    onPress={() => move(ei, 1)}
                  />
                  <Button
                    label="Remove"
                    variant="ghost"
                    icon={Trash2}
                    onPress={() =>
                      onChange(exercises.filter((y) => y.id !== e.id))
                    }
                  />
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  effort: { gap: space[2] },
  ex: { paddingVertical: space[1] },
  exLine: { borderTopWidth: 1, borderTopColor: colors.border },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 52,
  },
  edit: { gap: space[2], paddingBottom: space[2] },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space[1] },
  input: {
    minWidth: 120,
    minHeight: 48,
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("medium"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
