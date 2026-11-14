// Gym detail (G-02): area, hours, day pass and equipment, with directions in the phone's maps app.
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Button, Chip, Text } from "@/components/primitives";
import { openInMaps, SAMPLE_GYMS } from "@/features/athlete/gyms";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { Eyebrow, KeyValues } from "@/features/coach/parts";
import { space } from "@/theme";

export default function GymDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const g = SAMPLE_GYMS.find((x) => x.id === id);
  const back = backTo("/athlete/gyms");
  if (!g)
    return (
      <MenuPage title="Gym" back={back}>
        <InfoCard>This gym isn&apos;t listed any more.</InfoCard>
      </MenuPage>
    );
  return (
    <MenuPage
      title={g.name}
      sub={`${g.area}, ${g.city}`}
      back={back}
      footer={
        <Button
          label="Directions"
          variant="secondary"
          fullWidth
          onPress={() => openInMaps(g)}
        />
      }
    >
      <KeyValues
        rows={[
          ["Distance", `${g.km.toFixed(1)} km`],
          ["Hours", g.hours],
          ["Day pass", g.dayPass ?? "Ask at the desk"],
          ...(g.women
            ? ([["Women-only hours", "Yes"]] as [string, string][])
            : []),
        ]}
      />
      <Eyebrow>Equipment</Eyebrow>
      <View style={styles.chips}>
        {g.equipment.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </View>
      <Text variant="caption" tone="muted">
        Sample listing. Check hours and prices with the gym.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
});
