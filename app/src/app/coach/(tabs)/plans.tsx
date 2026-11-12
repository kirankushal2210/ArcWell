// Plans tab (K-05): the training programs and meal plans a coach reuses across clients, as section
// tabs (D61). Tap a template to edit it (K-06), the person icon to assign it to clients, or New to
// build one. Each client always gets their own copy (D56).
import { router } from "expo-router";
import {
  ChevronRight,
  ListChecks,
  Plus,
  UserPlus,
  Utensils,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Page, PageHeader } from "@/features/coach/parts";
import type { Template } from "@/features/coach/sampleData";
import { colors, radius, rhythm, space } from "@/theme";

type Kind = Template["kind"];

const open = (t: Template | null, kind: Kind) =>
  router.push({
    pathname:
      kind === "training"
        ? "/coach/template/training/[id]"
        : "/coach/template/meals/[id]",
    params: { id: t?.id ?? "new" },
  });

function TemplateList({ kind }: { kind: Kind }) {
  const { templates } = useCoachData();
  const list = templates.filter((t) => t.kind === kind);
  const Icon = kind === "training" ? ListChecks : Utensils;
  if (!list.length)
    return (
      <Page>
        <View style={styles.empty}>
          <Icon size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            {kind === "training" ? "No programs yet" : "No meal plans yet"}
          </Text>
          <Text tone="muted" style={styles.center}>
            Build one once and give every client their own copy.
          </Text>
        </View>
      </Page>
    );
  return (
    <Page>
      <Group>
        {list.map((t, i) => (
          <GroupRow key={t.id} first={i === 0}>
            <PressableScale
              onPress={() => open(t, kind)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${t.name}`}
              style={styles.rowMain}
            >
              <View style={styles.icon}>
                <Icon size={22} color={colors.text} />
              </View>
              <View style={styles.flex}>
                <Text weight="semibold">{t.name}</Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {t.detail} · {t.clients}{" "}
                  {t.clients === 1 ? "client" : "clients"}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </PressableScale>
            <IconButton
              icon={UserPlus}
              accessibilityLabel={`Assign ${t.name} to clients`}
              onPress={() =>
                router.push({
                  pathname: "/coach/template/assign/[id]",
                  params: { id: t.id },
                })
              }
            />
          </GroupRow>
        ))}
      </Group>
      <Text variant="caption" tone="muted">
        Editing a template never changes clients already on it.
      </Text>
    </Page>
  );
}

const TABS: { key: Kind; label: string }[] = [
  { key: "training", label: "Training" },
  { key: "meals", label: "Meal plans" },
];

export default function PlansTab() {
  const [kind, setKind] = useState<Kind>("training");
  return (
    <View style={styles.root}>
      <PageHeader title="Plans" />
      <SectionTabs
        tabs={TABS}
        value={kind}
        onChange={setKind}
        pages={[
          <TemplateList key="t" kind="training" />,
          <TemplateList key="m" kind="meals" />,
        ]}
      />
      <View style={styles.footer}>
        <Button
          label={kind === "training" ? "New training program" : "New meal plan"}
          icon={Plus}
          fullWidth
          onPress={() => open(null, kind)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
  },
  center: { textAlign: "center" },
  empty: { alignItems: "center", gap: space[3], paddingTop: space[8] },
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
