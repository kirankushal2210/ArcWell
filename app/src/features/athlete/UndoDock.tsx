// "Removed · Undo" (X-04): after a food is removed from the log, this sits in the dock's place for a
// few seconds. Undo puts it back exactly as it was.
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { tabBarTop } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

import { useMe } from "./useMe";

export function UndoDock() {
  const me = useMe();
  const { removedFood, undoRemoveFood, clearRemovedFood } = useCoachData();
  const insets = useSafeAreaInsets();
  const show = !!me && removedFood?.clientId === me.id;
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(clearRemovedFood, 8000);
    return () => clearTimeout(t);
  }, [show, clearRemovedFood]);
  if (!show || !removedFood) return null;
  return (
    <View
      style={[styles.dock, { bottom: tabBarTop(insets.bottom) + space[2] }]}
      accessibilityRole="alert"
    >
      <Text style={styles.flex} numberOfLines={2}>
        Removed {removedFood.log.name}
      </Text>
      <Button
        label="Undo"
        size="sm"
        variant="secondary"
        onPress={undoRemoveFood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: rhythm.gutter,
    right: rhythm.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingLeft: space[3],
    paddingRight: space[1],
    paddingVertical: space[1],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassEdge,
    backgroundColor: colors.glassSolid,
  },
  flex: { flex: 1 },
});
