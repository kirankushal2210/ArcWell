// Give a supplement stack to clients (D64): each gets their own copy, replacing their list.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { ClientPicker } from "@/features/coach/ClientPicker";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { alert } from "@/lib/alert";
import { colors, rhythm, space } from "@/theme";

export default function AssignStack() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stacks, clients, assignStack } = useCoachData();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<string[]>([]);
  const s = stacks.find((x) => x.id === id);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/plans");
  if (!s) return <PageHeader title="Stack not found" onBack={back} />;
  const list = clients.filter((c) => c.status !== "completed");

  return (
    <View style={styles.root}>
      <PageHeader title="Give to clients" sub={s.name} onBack={back} />
      <Page>
        <Text tone="muted">
          Each client gets their own copy to adjust. It replaces their current
          supplement list.
        </Text>
        <ClientPicker
          clients={list}
          picked={picked}
          onChange={setPicked}
          current={(c) =>
            c.supplements?.length
              ? `${c.supplements.length} supplements now`
              : "No supplements yet"
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
          label={
            picked.length
              ? `Give to ${picked.length} ${picked.length === 1 ? "client" : "clients"}`
              : "Choose clients"
          }
          fullWidth
          disabled={!picked.length}
          onPress={() => {
            assignStack(s.id, picked);
            const n = picked.length;
            back();
            alert(
              "Stack given",
              `${n} ${n === 1 ? "client has" : "clients have"} their own copy of ${s.name}.`,
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
