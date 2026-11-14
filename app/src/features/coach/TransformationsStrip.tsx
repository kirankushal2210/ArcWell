// Approved before and afters on the coach's profile (F9-05, D43): the invite page, the coach's own
// profile and the athlete's My coach. Face blur and name choices come from the athlete; a withdrawn
// photo drops out at once because the list is read live from the store.
import { ScrollView, StyleSheet, View } from "react-native";

import { TransformPreview } from "@/features/athlete/TransformPreview";
import { space } from "@/theme";

import { useCoachData } from "./CoachData";
import { Eyebrow } from "./parts";
import { profileTransformations } from "./profileTransformations";

/** One card is about two thirds of a phone width, so the next one peeks in. */
const CARD_WIDTH = 260;

export function TransformationsStrip({
  title = "Client results",
}: {
  title?: string;
}) {
  const { clients, settings } = useCoachData();
  const items = profileTransformations(clients, settings);
  if (!items.length) return null;
  return (
    <View style={styles.root}>
      <Eyebrow>{title}</Eyebrow>
      {items.length === 1 ? (
        <TransformPreview t={items[0].t} name={items[0].name} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {items.map(({ key, t, name }) => (
            <View key={key} style={styles.card}>
              <TransformPreview t={t} name={name} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space[2] },
  row: { gap: space[2] },
  card: { width: CARD_WIDTH },
});
