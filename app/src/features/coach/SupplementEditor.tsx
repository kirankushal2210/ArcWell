// Supplement list editor (D64), shared by a client's list and the Plans tab's stacks: name, amount,
// when, and an optional note per item.
import { Plus, Trash2 } from "lucide-react-native";
import { StyleSheet, TextInput, View } from "react-native";

import { Button, IconButton } from "@/components/primitives";
import { Pills } from "@/features/coach/parts";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

import { type Supplement, supId, TIMINGS } from "./supplements";

export function SupplementEditor({
  items,
  onChange,
}: {
  items: Supplement[];
  onChange: (items: Supplement[]) => void;
}) {
  const set = (id: string, patch: Partial<Supplement>) =>
    onChange(items.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  return (
    <>
      {items.map((s) => (
        <View key={s.id} style={styles.card}>
          <View style={styles.head}>
            <TextInput
              value={s.name}
              onChangeText={(v) => set(s.id, { name: v })}
              placeholder="Supplement, e.g. Creatine monohydrate"
              placeholderTextColor={colors.textMuted}
              style={styles.name}
              accessibilityLabel="Supplement name"
            />
            <IconButton
              icon={Trash2}
              color={colors.textMuted}
              accessibilityLabel={`Remove ${s.name || "supplement"}`}
              onPress={() => onChange(items.filter((x) => x.id !== s.id))}
            />
          </View>
          <TextInput
            value={s.amount}
            onChangeText={(v) => set(s.id, { amount: v })}
            placeholder="Amount, e.g. 5 g or 1 scoop"
            placeholderTextColor={colors.textMuted}
            style={styles.field}
            accessibilityLabel={`${s.name} amount`}
          />
          <Pills
            value={TIMINGS.includes(s.timing) ? s.timing : ""}
            onChange={(v) => set(s.id, { timing: v })}
            options={TIMINGS.map((t) => ({ value: t, label: t }))}
          />
          <TextInput
            value={s.note ?? ""}
            onChangeText={(v) => set(s.id, { note: v })}
            placeholder="Note (optional)"
            placeholderTextColor={colors.textMuted}
            style={styles.field}
            accessibilityLabel={`${s.name} note`}
          />
        </View>
      ))}
      <Button
        label="Add a supplement"
        icon={Plus}
        variant="secondary"
        fullWidth
        onPress={() =>
          onChange([
            ...items,
            { id: supId(), name: "", amount: "", timing: "Morning" },
          ])
        }
      />
    </>
  );
}

export const supplementsReady = (items: Supplement[]) =>
  items.every((s) => s.name.trim());

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  name: {
    flex: 1,
    minHeight: 44,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  field: {
    minHeight: 44,
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
  },
});
