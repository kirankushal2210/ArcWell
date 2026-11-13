// Coach exercise library (K-23): browse the whole library by equipment and muscle, open any
// exercise, and add the coach's own exercises, which then appear in the program builder.
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ExerciseList } from "@/features/athlete/ExerciseList";
import { PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function CoachExercises() {
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/menu");
  return (
    <View style={styles.root}>
      <PageHeader
        title="Exercise library"
        onBack={back}
        actions={[
          {
            icon: Plus,
            label: "New exercise",
            onPress: () => router.push("/coach/exercises/new"),
          },
        ]}
      />
      <ExerciseList
        onPress={(e) =>
          router.push({
            pathname: "/coach/exercises/[name]",
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
