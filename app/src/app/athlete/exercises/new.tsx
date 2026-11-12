// New custom exercise from the Exercises page (F4-08). Pickers open the same form in their sheet.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CreateExercise } from "@/features/athlete/CreateExercise";
import { colors, space } from "@/theme";

export default function NewExercise() {
  const insets = useSafeAreaInsets();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/exercises");
  return (
    <View style={[styles.root, { paddingTop: insets.top + space[2] }]}>
      <CreateExercise
        onCancel={back}
        onSaved={(e) =>
          router.replace({
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
