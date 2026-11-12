// Exercise detail (F4-08): demo, muscles, equipment, what a set logs, and the athlete's own history
// (best and last). The licensed demo clip and cues come with the exercise library (PLAN.md blocker).
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ExerciseFacts } from "@/features/athlete/ExerciseFacts";
import { useMyHistory } from "@/features/athlete/ExercisePicker";
import {
  type Exercise,
  findExercise,
  typeOf,
} from "@/features/athlete/library";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function ExerciseDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const history = useMyHistory();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/exercises");
  // Older logs can hold names the library doesn't know; show them as "other".
  const e: Exercise = findExercise(name) ?? {
    name,
    muscle: "other",
    equipment: "other",
    type: typeOf(name),
  };

  return (
    <View style={styles.root}>
      <PageHeader title={e.name} onBack={back} />
      <Page>
        <ExerciseFacts e={e} history={history} />
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
