// A coach's own exercise (K-23): the same form athletes use; it then shows in the program builder.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CreateExercise } from "@/features/athlete/CreateExercise";
import { colors, space } from "@/theme";

export default function CoachNewExercise() {
  const insets = useSafeAreaInsets();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/exercises");
  return (
    <View style={[styles.root, { paddingTop: insets.top + space[2] }]}>
      <CreateExercise
        onCancel={back}
        onSaved={(e) =>
          router.replace({
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
