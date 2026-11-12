// Plans tab (K-05): training and meal plan templates the coach reuses across clients.
// The plan builder (K-06) is designed separately and arrives with the exercise library (Phase 2).
import { ChevronRight, ListChecks, Plus, Utensils } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Group,
  GroupRow,
  Page,
  PageHeader,
  Pills,
} from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

type Kind = "training" | "meals";

const builderNote = () =>
  Alert.alert(
    "Plan builder",
    "Building and editing templates comes with the exercise library. For now these are sample templates.",
  );

export default function PlansTab() {
  const { templates } = useCoachData();
  const [kind, setKind] = useState<Kind>("training");
  const list = templates.filter((t) => t.kind === kind);
  const Icon = kind === "training" ? ListChecks : Utensils;

  return (
    <View style={styles.root}>
      <PageHeader title="Plans" />
      <Page>
        <Pills<Kind>
          value={kind}
          onChange={setKind}
          options={[
            {
              value: "training",
              label: `Training · ${templates.filter((t) => t.kind === "training").length}`,
            },
            {
              value: "meals",
              label: `Meals · ${templates.filter((t) => t.kind === "meals").length}`,
            },
          ]}
        />
        <Group>
          {list.map((t, i) => (
            <GroupRow
              key={t.id}
              first={i === 0}
              onPress={builderNote}
              label={t.name}
            >
              <View style={styles.icon}>
                <Icon size={22} color={colors.text} />
              </View>
              <View style={styles.flex}>
                <Text weight="semibold">{t.name}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {t.detail} · {t.clients}{" "}
                  {t.clients === 1 ? "client" : "clients"}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </GroupRow>
          ))}
        </Group>
      </Page>
      <View style={styles.footer}>
        <Button
          label="New template"
          icon={Plus}
          fullWidth
          onPress={builderNote}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    paddingBottom: space[4],
  },
});
