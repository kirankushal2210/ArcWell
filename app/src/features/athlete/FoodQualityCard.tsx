// Food quality on the Day page (D96): fibre, fermented foods, whole foods, caffeine and protein at
// each main meal, as numbers with one word each. The reasons sit behind Why?.
import { Check, Coffee, Leaf, Sprout, Wheat } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

import {
  clockText,
  FERMENTED_TARGET,
  FIBRE_TARGET_G,
  type FoodQuality,
} from "./foodQuality";
import { slotLabel } from "./foods";
import { Ring } from "./NutritionParts";

function Tile({
  icon: Icon,
  value,
  label,
  share,
  alert,
}: {
  icon: typeof Leaf;
  value: string;
  label: string;
  share?: number;
  alert?: boolean;
}) {
  const color = alert ? colors.warning : colors.accent;
  return (
    <View style={styles.tile}>
      {share !== undefined ? (
        <Ring size={36} stroke={3.5} progress={share} color={color}>
          <Icon size={14} color={color} />
        </Ring>
      ) : (
        <View style={styles.iconWrap}>
          <Icon size={16} color={color} />
        </View>
      )}
      <View style={styles.flex}>
        <Text weight="bold" numeric>
          {value}
        </Text>
        <Text variant="caption" tone={alert ? "warning" : "muted"}>
          {label}
        </Text>
      </View>
    </View>
  );
}

export function FoodQualityCard({ q }: { q: FoodQuality }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text weight="semibold" style={styles.flex}>
          Food quality
        </Text>
        <WhyThis
          label="Why?"
          title="Food quality"
          points={[
            "Fibre: at least 25 g a day; 25–29 g was linked with better health.",
            "Fermented foods like curd, chaas, idli and kombucha: eating more of them raised gut microbe diversity and lowered inflammation markers.",
            "Whole foods: on an ultra-processed diet people ate about 500 kcal a day more.",
            "Protein: about 0.4 g per kg at each main meal.",
            "Caffeine: a coffee at least 8.8 hours before bed avoids losing sleep.",
          ]}
          sources={[
            "reynolds2019",
            "wastyk2021",
            "hall2019",
            "schoenfeld2018meal",
            "gardiner2023",
          ]}
        />
      </View>
      <View style={styles.grid}>
        <Tile
          icon={Wheat}
          value={`${Math.round(q.fibre)}/${FIBRE_TARGET_G} g`}
          label="Fibre"
          share={q.fibre / FIBRE_TARGET_G}
        />
        <Tile
          icon={Sprout}
          value={`${q.fermented}/${FERMENTED_TARGET}`}
          label="Fermented"
          share={q.fermented / FERMENTED_TARGET}
        />
        <Tile
          icon={Leaf}
          value={q.whole === null ? "—" : `${Math.round(q.whole * 100)}%`}
          label="Whole foods"
          share={q.whole ?? 0}
        />
        <Tile
          icon={Coffee}
          value={`${q.caffeineMg} mg`}
          label={
            q.lateCaffeine
              ? `After ${clockText(q.cutoffAt)}`
              : `Caffeine by ${clockText(q.cutoffAt)}`
          }
          alert={q.lateCaffeine}
        />
      </View>
      {q.proteinByMeal.length ? (
        <View style={styles.meals}>
          {q.proteinByMeal.map((m) => {
            const ok = m.grams >= m.target;
            return (
              <View key={m.meal} style={[styles.meal, ok && styles.mealOk]}>
                {ok ? (
                  <Check size={12} strokeWidth={3} color={colors.onBrand} />
                ) : null}
                <Text
                  variant="caption"
                  weight="semibold"
                  tone={ok ? "onBrand" : "default"}
                  numeric
                >
                  {`${slotLabel(m.meal)} ${m.grams}/${m.target} g`}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: space[3] },
  tile: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  meals: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  meal: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  mealOk: { backgroundColor: colors.brand },
});
