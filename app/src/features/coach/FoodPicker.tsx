// Food picker for the coach's meal plan builder (K-07, F5-12): search the same food data the athlete
// logs from, so a planned meal logs in one tap with "Ate this".
import { Search, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { IconButton, Text } from "@/components/primitives";
import { FoodRow, kcalText } from "@/features/athlete/FoodParts";
import {
  type Food,
  FOODS,
  macrosFor,
  portionText,
  searchFoods,
} from "@/features/athlete/foods";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const sub = (f: Food) => {
  const u = f.units[0];
  return `${u ? `${portionText(1, u.label)} (${u.grams} g)` : "100 g"} · ${kcalText(macrosFor(f, u ? u.grams : 100).kcal)}`;
};

export function FoodPicker({
  visible,
  title,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  onPick: (f: Food) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = q.trim()
    ? searchFoods(q, [])
    : FOODS.filter((f) => f.kind === "dish").slice(0, 40);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.head}>
          <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
          <Text variant="heading" style={styles.flex} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.search}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder='Search foods, e.g. "paneer"'
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCorrect={false}
            clearButtonMode="while-editing"
            accessibilityLabel="Search foods"
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        >
          {q.trim() ? null : (
            <Text variant="label" tone="muted">
              Common dishes
            </Text>
          )}
          {list.map((f) => (
            <FoodRow
              key={f.id}
              name={f.name}
              source={f.source}
              sub={sub(f)}
              onPress={() => {
                onPick(f);
                setQ("");
              }}
            />
          ))}
          {q.trim() && !list.length ? (
            <Text tone="muted">{`Nothing for "${q.trim()}".`}</Text>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: space[3],
    gap: space[2],
  },
  flex: { flex: 1 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: space[2],
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 48,
    marginHorizontal: rhythm.gutter,
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
  list: { paddingHorizontal: rhythm.gutter, paddingBottom: space[12] },
});
