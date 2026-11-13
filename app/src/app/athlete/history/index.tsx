// Progressive overload page (D85, D90): the same view as Training's Overload tab, opened from the
// menu, Today and the workout summary. Lifts from the last 2 weeks against the session before,
// with past workouts underneath.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { OverloadPage } from "@/features/athlete/OverloadPage";
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
      <PageHeader title="Progressive overload" onBack={back} />
      <Page>
        <OverloadPage me={me} />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
