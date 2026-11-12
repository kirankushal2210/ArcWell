// Exercise detail for coaches (K-23): what it trains, the equipment and what a set logs.
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ExerciseFacts } from "@/features/athlete/ExerciseFacts";
import {
  type Exercise,
  findExercise,
  typeOf,
} from "@/features/athlete/library";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function CoachExerciseDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { customExercises } = useCoachData();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/exercises");
  const e: Exercise = customExercises.find((x) => x.name === name) ??
    findExercise(name) ?? {
      name,
      muscle: "other",
      equipment: "other",
      type: typeOf(name),
    };
  return (
    <View style={styles.root}>
      <PageHeader title={e.name} onBack={back} />
      <Page>
        <ExerciseFacts e={e} history={[]} showHistory={false} />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
