// Water (FE-5): a glass at a time. The day's goal is total water from drinks and food (efsa2010water):
// about 2.0 L for women and 2.5 L for men; food usually covers a share of it.
import { GlassWater, Minus, Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { IconButton, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { WATER_L } from "@/features/science/rules";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

import { isoToday } from "./athleteData";
import { useMe } from "./useMe";

export const GLASS_ML = 250;

export function useWater() {
  const me = useMe();
  const { addWater } = useCoachData();
  const sex = me?.basics?.sex;
  const goalMl =
    (sex === "male"
      ? WATER_L.male
      : sex === "female"
        ? WATER_L.female
        : (WATER_L.male + WATER_L.female) / 2) * 1000;
  const today = me?.water?.[isoToday()] ?? 0;
  return {
    today,
    goalMl,
    add: (ml: number) => me && addWater(me.id, ml),
  };
}

export const ml = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 2 : 1)} L` : `${n} ml`;

export function WaterCard() {
  const w = useWater();
  const share = Math.min(1, w.today / w.goalMl);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <GlassWater size={20} color={colors.recovery} />
        <View style={styles.flex}>
          <Text weight="semibold" numeric>
            Water · {ml(w.today)}
          </Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            Goal {ml(w.goalMl)}
          </Text>
        </View>
        <IconButton
          icon={Minus}
          accessibilityLabel={`Take off ${GLASS_ML} ml`}
          disabled={w.today <= 0}
          onPress={() => w.add(-GLASS_ML)}
        />
        <IconButton
          icon={Plus}
          variant="filled"
          accessibilityLabel={`Add a glass, ${GLASS_ML} ml`}
          onPress={() => w.add(GLASS_ML)}
        />
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${share * 100}%` }]} />
      </View>
      <WhyThis
        title="How much water"
        points={[
          "About 2 litres a day for women and 2.5 for men, in total. That counts water in food too, so drinks are most of it, not all of it.",
          "Hot days and long sessions raise it; thirst and pale urine are good everyday guides.",
        ]}
        sources={["efsa2010water"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1, gap: space[1] / 2 },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.recovery,
  },
});
