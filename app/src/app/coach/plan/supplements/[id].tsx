// A client's supplements (D64): optional, for any client. Start from one of your stacks or add items
// one by one. The client sees this list in their Nutrition.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  SupplementEditor,
  supplementsReady,
} from "@/features/coach/SupplementEditor";
import { cloneItems, type Supplement } from "@/features/coach/supplements";
import { colors, rhythm, space } from "@/theme";
import { useBillingGate } from "@/features/coach/limits";
import { NotFound } from "@/features/system/SystemStates";

function ClientSupplementsEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, stacks, setSupplements } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Supplement[]>(() => c?.supplements ?? []);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <NotFound title="Supplements" what="client" onBack={back} />;
  const first = c.name.split(" ")[0];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title={`Supplements · ${first}`} onBack={back} />
      <Page>
        {stacks.length ? (
          <>
            <Eyebrow>Start from a stack</Eyebrow>
            <Pills
              value=""
              onChange={(v) => {
                const s = stacks.find((x) => x.id === v);
                if (s) setItems(cloneItems(s.items));
              }}
              options={stacks.map((s) => ({ value: s.id, label: s.name }))}
            />
          </>
        ) : null}
        <Eyebrow>{`${first}'s list · ${items.length}`}</Eyebrow>
        <SupplementEditor items={items} onChange={setItems} />
        <Text variant="caption" tone="muted">
          Supplements are optional. Suggest food first, and send {first} to a
          doctor before anything for a medical condition.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={items.length ? "Save supplements" : "Save (no supplements)"}
          fullWidth
          disabled={!supplementsReady(items)}
          onPress={() => {
            setSupplements(
              c.id,
              items.map((s) => ({ ...s, name: s.name.trim() })),
            );
            back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function ClientSupplements() {
  const gate = useBillingGate();
  return gate ?? <ClientSupplementsEditor />;
}
