// Recovery protocols (D60), grouped by what they help: sleep, stress, active recovery, training,
// food, heat and cold. The day's suggestions pick from these.
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { plusOnly } from "@/features/athlete/PlusOnly";
import { Text } from "@/components/primitives";
import { PROTOCOLS, type Protocol } from "@/features/athlete/recovery";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { colors, space } from "@/theme";

const ORDER: Protocol["category"][] = [
  "Sleep",
  "Stress",
  "Active recovery",
  "Training",
  "Food",
  "Heat and cold",
];

export default plusOnly(Protocols);

function Protocols() {
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/recovery");
  return (
    <View style={styles.root}>
      <PageHeader title="Recovery protocols" onBack={back} />
      <Page>
        <Text tone="muted">
          Sleep comes first: it has the strongest evidence of anything here. The
          rest help on the days your numbers ask for it.
        </Text>
        {ORDER.map((cat) => (
          <View key={cat} style={styles.group}>
            <Eyebrow>{cat}</Eyebrow>
            <Group>
              {PROTOCOLS.filter((p) => p.category === cat).map((p, i) => (
                <GroupRow
                  key={p.id}
                  first={i === 0}
                  label={p.title}
                  onPress={() =>
                    router.push({
                      pathname: "/athlete/recovery/protocol/[id]",
                      params: { id: p.id },
                    })
                  }
                >
                  <View style={styles.flex}>
                    <Text weight="medium">{p.title}</Text>
                    <Text variant="label" weight="regular" tone="muted">
                      {p.minutes ? `${p.minutes} min · ` : ""}
                      {p.summary}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </GroupRow>
              ))}
            </Group>
          </View>
        ))}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  group: { gap: space[2] },
});
