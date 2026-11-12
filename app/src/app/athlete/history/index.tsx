// Workout history page (F4-13). The same list is Training's History section tab (D61); this page
// stays for links from elsewhere (Today, the workout summary).
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { HistoryWeeks } from "@/features/athlete/HistoryWeeks";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function HistoryPage() {
  const me = useMe();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/training");
  if (!me) return <NotJoined />;
  return (
    <View style={styles.root}>
      <PageHeader title="History" onBack={back} />
      <Page>
        <HistoryWeeks me={me} />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
