// The exercise library list (F4-08, K-06): search, one equipment filter and one muscle filter, then
// Recent, Your exercises and All exercises A–Z. Used by the Exercises page and by every "Add exercise"
// picker (program builder, routines, workout), so the library behaves the same everywhere.
import { Check, ChevronDown, Info, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  colors,
  controlHeight,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

import {
  EQUIPMENT,
  EQUIPMENT_LABEL,
  type Equipment,
  type Exercise,
  filterExercises,
  findExercise,
  LIBRARY,
  MUSCLE_GROUPS,
  MUSCLE_LABEL,
  type Muscle,
} from "./library";
import { Sheet } from "./Sheet";

/** Round mark for an exercise: the custom photo when there is one, else its initials. */
export function ExerciseAvatar({
  e,
  size = 44,
}: {
  e: Exercise;
  size?: number;
}) {
  const box = { width: size, height: size, borderRadius: radius.full };
  if (e.image)
    return (
      <Image
        source={{ uri: e.image }}
        style={box}
        accessibilityIgnoresInvertColors
      />
    );
  const initials = e.name
    .replace(/\(.*\)/, "")
    .split(/[\s-]+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <View style={[box, styles.avatar]}>
      <Text variant="label" weight="semibold" tone="muted">
        {initials}
      </Text>
    </View>
  );
}

function FilterButton({
  label,
  active,
  onPress,
  onClear,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter: ${label}`}
      style={[styles.filter, active && styles.filterOn]}
    >
      <Text
        variant="label"
        weight="medium"
        tone={active ? "onBrand" : "default"}
        style={styles.flexShrink}
      >
        {label}
      </Text>
      {active ? (
        <PressableScale
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label}`}
          hitSlop={12}
        >
          <X size={16} color={colors.onBrand} />
        </PressableScale>
      ) : (
        <ChevronDown size={16} color={colors.textMuted} />
      )}
    </PressableScale>
  );
}

/** Grid of options with a live result count, like a filter sheet in Photos. */
function FilterSheet<T extends string>({
  visible,
  title,
  groups,
  label,
  value,
  count,
  onApply,
  onClose,
}: {
  visible: boolean;
  title: string;
  groups: { title?: string; options: T[] }[];
  label: (v: T) => string;
  value: T | null;
  /** Results if this option were picked. */
  count: (v: T | null) => number;
  onApply: (v: T | null) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<T | null>(value);
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <ScrollView
        style={styles.sheetScroll}
        contentContainerStyle={styles.sheetBody}
      >
        {groups.map((g) => (
          <View key={g.title ?? "all"} style={styles.filterGroup}>
            {g.title ? (
              <Text variant="label" tone="muted">
                {g.title}
              </Text>
            ) : null}
            <View style={styles.grid}>
              {g.options.map((o) => {
                const on = draft === o;
                return (
                  <PressableScale
                    key={o}
                    onPress={() => setDraft(on ? null : o)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.tile, on && styles.tileOn]}
                  >
                    <Text
                      weight="medium"
                      tone={on ? "onBrand" : "default"}
                      style={styles.flexShrink}
                    >
                      {label(o)}
                    </Text>
                    {on ? (
                      <Check size={16} strokeWidth={3} color={colors.onBrand} />
                    ) : null}
                  </PressableScale>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.sheetFoot}>
        <View style={styles.flex}>
          <Button
            label="Clear"
            variant="secondary"
            fullWidth
            onPress={() => setDraft(null)}
          />
        </View>
        <View style={styles.flex2}>
          <Button
            label={`Show ${count(draft)} exercises`}
            fullWidth
            onPress={() => onApply(draft)}
          />
        </View>
      </View>
    </Sheet>
  );
}

export type ExerciseListProps = {
  /** Tap on a row: open it (library) or add it (picker). */
  onPress: (e: Exercise) => void;
  /** The (i) button on each row; omitted on the Exercises page, where the row itself opens it. */
  onInfo?: (e: Exercise) => void;
  /** Names currently picked (multi-select pickers show a tick). */
  selected?: string[];
  /** Shown first, e.g. swap suggestions for the athlete's kit and injuries. */
  suggested?: { title: string; names: string[] };
  /** Exercises done recently, newest first. */
  recent?: string[];
  /** Extra space under the list, e.g. for a floating Add button. */
  bottomInset?: number;
};

export function ExerciseList({
  onPress,
  onInfo,
  selected = [],
  suggested,
  recent = [],
  bottomInset = 0,
}: ExerciseListProps) {
  const { customExercises } = useCoachData();
  const [q, setQ] = useState("");
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [sheet, setSheet] = useState<"equipment" | "muscle" | null>(null);

  const all = [...customExercises, ...LIBRARY];
  const filtering = q.trim() !== "" || equipment !== null || muscle !== null;
  const lookup = (names: string[]) =>
    names.map((n) => findExercise(n)).filter((e): e is Exercise => !!e);
  const sections = [
    ...(suggested && suggested.names.length && !filtering
      ? [{ title: suggested.title, data: lookup(suggested.names) }]
      : []),
    ...(recent.length && !filtering
      ? [{ title: "Recent", data: lookup(recent.slice(0, 8)) }]
      : []),
    {
      title: "Your exercises",
      data: filterExercises(customExercises, q, equipment, muscle),
    },
    {
      title: filtering ? "Results" : "All exercises",
      data: filterExercises(LIBRARY, q, equipment, muscle),
    },
  ].filter((s) => s.data.length);
  const total = new Set(
    filterExercises(all, q, equipment, muscle).map((e) => e.name),
  ).size;

  return (
    <View style={styles.flex}>
      <View style={styles.top}>
        <View style={styles.search}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search exercises"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCorrect={false}
            clearButtonMode="while-editing"
            accessibilityLabel="Search exercises"
          />
        </View>
        <View style={styles.filters}>
          <FilterButton
            label={equipment ? EQUIPMENT_LABEL[equipment] : "All equipment"}
            active={equipment !== null}
            onPress={() => setSheet("equipment")}
            onClear={() => setEquipment(null)}
          />
          <FilterButton
            label={muscle ? MUSCLE_LABEL[muscle] : "All muscles"}
            active={muscle !== null}
            onPress={() => setSheet("muscle")}
            onClear={() => setMuscle(null)}
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(e, i) => `${e.name}-${i}`}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        stickySectionHeadersEnabled={false}
        initialNumToRender={20}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: space[12] + bottomInset },
        ]}
        renderSectionHeader={({ section }) => (
          <Text variant="label" tone="muted" style={styles.sectionHead}>
            {section.title === "Results"
              ? `${total} ${total === 1 ? "exercise" : "exercises"}`
              : section.title}
          </Text>
        )}
        ListEmptyComponent={
          <Text tone="muted" style={styles.empty}>
            No exercises match. Try fewer words or clear a filter, or create
            your own.
          </Text>
        }
        renderItem={({ item: e }) => {
          const on = selected.includes(e.name);
          return (
            <PressableScale
              onPress={() => onPress(e)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${e.name}, ${MUSCLE_LABEL[e.muscle]}`}
              style={[styles.row, on && styles.rowOn]}
            >
              <View>
                <ExerciseAvatar e={e} />
                {on ? (
                  <View style={styles.tick}>
                    <Check size={12} strokeWidth={3} color={colors.onBrand} />
                  </View>
                ) : null}
              </View>
              <View style={styles.flex}>
                <Text weight="medium" numberOfLines={2}>
                  {e.name}
                </Text>
                <Text variant="label" weight="regular" tone="muted">
                  {MUSCLE_LABEL[e.muscle]}
                  {e.custom ? " · Yours" : ""}
                </Text>
              </View>
              {onInfo ? (
                <IconButton
                  icon={Info}
                  color={colors.textMuted}
                  accessibilityLabel={`About ${e.name}`}
                  onPress={() => onInfo(e)}
                />
              ) : null}
            </PressableScale>
          );
        }}
      />

      <FilterSheet<Equipment>
        key={`eq-${sheet === "equipment"}`}
        visible={sheet === "equipment"}
        title="Equipment"
        groups={[{ options: EQUIPMENT }]}
        label={(v) => EQUIPMENT_LABEL[v]}
        value={equipment}
        count={(v) => filterExercises(all, q, v, muscle).length}
        onApply={(v) => {
          setEquipment(v);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <FilterSheet<Muscle>
        key={`mu-${sheet === "muscle"}`}
        visible={sheet === "muscle"}
        title="Muscle group"
        groups={MUSCLE_GROUPS.map((g) => ({
          title: g.title,
          options: g.muscles,
        }))}
        label={(v) => MUSCLE_LABEL[v]}
        value={muscle}
        count={(v) => filterExercises(all, q, equipment, v).length}
        onApply={(v) => {
          setMuscle(v);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  flex2: { flex: 2 },
  flexShrink: { flexShrink: 1 },
  top: { gap: space[2], paddingHorizontal: rhythm.gutter },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 48,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  filters: { flexDirection: "row", gap: space[2] },
  filter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space[1],
    minHeight: controlHeight,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  list: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
  sectionHead: { paddingTop: space[4], paddingBottom: space[2] },
  empty: { paddingTop: space[6], textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 64,
    paddingVertical: space[2],
    paddingHorizontal: space[2],
    borderRadius: radius.md,
  },
  rowOn: { backgroundColor: colors.surfaceRaised },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  tick: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  filterGroup: { gap: space[2] },
  sheetScroll: { maxHeight: 520 },
  sheetBody: { gap: space[4] },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  tile: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space[1],
    minHeight: 52,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  tileOn: { backgroundColor: colors.brand },
  sheetFoot: { flexDirection: "row", gap: space[2], paddingTop: space[2] },
});
