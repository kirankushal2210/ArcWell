// Supplement stack (D64): a reusable list in Plans. "new" starts empty. Clients who got a copy
// keep theirs when the stack changes.
import { router, useLocalSearchParams } from "expo-router";
import { Trash2, UserPlus } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import {
  SupplementEditor,
  supplementsReady,
} from "@/features/coach/SupplementEditor";
import type { Supplement } from "@/features/coach/supplements";
import { alert } from "@/lib/alert";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";
import { useBillingGate } from "@/features/coach/limits";

function StackScreenEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stacks, saveStack, deleteStack } = useCoachData();
  const insets = useSafeAreaInsets();
  const s = stacks.find((x) => x.id === id);
  const [name, setName] = useState(s?.name ?? "");
  const [items, setItems] = useState<Supplement[]>(() => s?.items ?? []);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/plans");
  if (id !== "new" && !s)
    return <PageHeader title="Stack not found" onBack={back} />;
  const ready = !!name.trim() && items.length > 0 && supplementsReady(items);
  const save = () =>
    saveStack({
      id: s?.id,
      name: name.trim(),
      items: items.map((x) => ({ ...x, name: x.name.trim() })),
    });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={s ? "Supplement stack" : "New supplement stack"}
        onBack={back}
        actions={
          s
            ? [
                {
                  icon: Trash2,
                  label: "Delete stack",
                  onPress: () =>
                    alert(`Delete ${s.name}?`, "Clients keep their own copy.", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          deleteStack(s.id);
                          back();
                        },
                      },
                    ]),
                },
              ]
            : []
        }
      />
      <Page>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Stack name, e.g. Basics"
          placeholderTextColor={colors.textMuted}
          style={styles.name}
          accessibilityLabel="Stack name"
        />
        <Eyebrow>{`Supplements · ${items.length}`}</Eyebrow>
        <SupplementEditor items={items} onChange={setItems} />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save stack"
          fullWidth
          disabled={!ready}
          onPress={() => {
            save();
            back();
          }}
        />
        <Button
          label="Save and give to clients"
          icon={UserPlus}
          variant="secondary"
          fullWidth
          disabled={!ready}
          onPress={() =>
            router.replace({
              pathname: "/coach/stack/assign/[id]",
              params: { id: save() },
            })
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  name: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
  },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function StackScreen() {
  const gate = useBillingGate();
  return gate ?? <StackScreenEditor />;
}
