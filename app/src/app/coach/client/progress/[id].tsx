// A client's progress (sitemap §5): bodyweight, measurements and photos, from the join date unless
// the client shared earlier history.
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Progress } from "@/features/coach/ClientSections";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function ClientProgress() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useCoachData();
  const c = client(id);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  return (
    <View style={styles.root}>
      <PageHeader title="Progress" sub={c?.name} onBack={back} />
      {c ? (
        <Page>
          <Progress c={c} />
        </Page>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
