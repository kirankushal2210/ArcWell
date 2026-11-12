// Exercise library (F4-08): search, filter by equipment and muscle, Recent and Your exercises, then
// every exercise A–Z. Tap one for its facts and the athlete's history; + makes a custom exercise.
// Demo clips come with the licensed library (PLAN.md blocker: demo media licence).
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { recentNames, useMyHistory } from "@/features/athlete/ExercisePicker";
import { ExerciseList } from "@/features/athlete/ExerciseList";
import { PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function Exercises() {
  const history = useMyHistory();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/training");

  return (
    <View style={styles.root}>
      <PageHeader
        title="Exercises"
        onBack={back}
        actions={[
          {
            icon: Plus,
            label: "New exercise",
            onPress: () => router.push("/athlete/exercises/new"),
          },
        ]}
      />
      <ExerciseList
        recent={recentNames(history)}
        onPress={(e) =>
          router.push({
            pathname: "/athlete/exercises/[name]",
            params: { name: e.name },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
