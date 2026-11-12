// Private notes about a client (sitemap §5): only the coach sees these.
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { Notes } from "@/features/coach/ClientSections";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function ClientNotes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useCoachData();
  const c = client(id);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title="Private notes" sub={c?.name} onBack={back} />
      {c ? (
        <Page>
          <Notes c={c} />
        </Page>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
