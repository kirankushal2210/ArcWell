// Sources (D69): every paper Arcwell's training, nutrition, recovery and habit rules rest on, grouped by
// topic, with what we take from each and a link to it. Open to athletes and coaches.
import { router } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import { Linking, StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { SOURCES, type Topic, TOPIC_LABEL } from "@/features/science/sources";
import { colors, space } from "@/theme";

const TOPICS: Topic[] = ["training", "nutrition", "recovery", "habits"];

export default function Science() {
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const all = Object.values(SOURCES);
  return (
    <MenuPage title="The science" back={back}>
      <InfoCard>
        Arcwell&apos;s targets and plans follow published research, not gym
        lore. Here is every paper we rely on and what we take from it. Where the
        evidence is thinner, we say so.
      </InfoCard>
      {TOPICS.map((t) => {
        const list = all
          .filter((s) => s.topic === t)
          .sort((a, b) => b.year - a.year);
        if (!list.length) return null;
        return (
          <View key={t} style={styles.section}>
            <Eyebrow>{TOPIC_LABEL[t]}</Eyebrow>
            <Group>
              {list.map((s, i) => (
                <GroupRow key={s.id} first={i === 0}>
                  <View style={styles.flex}>
                    <Text weight="medium">{s.finding}</Text>
                    <Text variant="label" weight="regular" tone="muted">
                      {s.authors} ({s.year}). {s.title}. {s.journal} {s.ref}
                    </Text>
                    {s.note ? (
                      <Text variant="caption" tone="warning">
                        {s.note}
                      </Text>
                    ) : null}
                  </View>
                  {s.pmid || s.doi ? (
                    <PressableScale
                      onPress={() =>
                        Linking.openURL(
                          s.pmid
                            ? `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`
                            : `https://doi.org/${s.doi}`,
                        )
                      }
                      accessibilityRole="link"
                      accessibilityLabel={`Open ${s.title}`}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <ExternalLink size={18} color={colors.textMuted} />
                    </PressableScale>
                  ) : null}
                </GroupRow>
              ))}
            </Group>
          </View>
        );
      })}
      <Text variant="caption" tone="muted">
        A sports scientist and a dietitian review these rules before launch.
        They are general guidance, not medical advice.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  section: { gap: space[2] },
});
