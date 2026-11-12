// Plans tab (K-05, D64): training programs, meal plans and supplement stacks a coach reuses, plus
// Enhanced for competitive clients, as section tabs (D61). Tap a template to edit it (K-06), the
// person icon to give it to clients, or New to build one. Each client gets their own copy (D56).
import { router } from "expo-router";
import {
  ListChecks,
  Plus,
  UserPlus,
  Utensils,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import { menuAction } from "@/features/coach/coachProfile";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Group,
  GroupRow,
  Page,
  PageHeader,
  ActionDock,
} from "@/features/coach/parts";
import { EnhancedPage, SupplementsPage } from "@/features/coach/PlansExtras";
import type { Template } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

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
      <Page clearDock>
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
    <Page clearDock>
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
                <Icon size={20} color={colors.text} />
              </View>
              <View style={styles.flex}>
                <Text weight="semibold">{t.name}</Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {t.detail} · {t.clients}{" "}
                  {t.clients === 1 ? "client" : "clients"}
                </Text>
              </View>
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

type Tab = Kind | "supplements" | "enhanced";
const TABS: { key: Tab; label: string }[] = [
  { key: "training", label: "Training" },
  { key: "meals", label: "Meals" },
  { key: "supplements", label: "Supplements" },
  { key: "enhanced", label: "Enhanced" },
];

export default function PlansTab() {
  const [kind, setKind] = useState<Tab>("training");
  return (
    <View style={styles.root}>
      <PageHeader title="Plans" actions={[menuAction]} />
      <SectionTabs
        tabs={TABS}
        value={kind}
        onChange={setKind}
        pages={[
          <TemplateList key="t" kind="training" />,
          <TemplateList key="m" kind="meals" />,
          <SupplementsPage key="s" />,
          <EnhancedPage key="e" />,
        ]}
      />
      {kind === "enhanced" ? null : (
        <ActionDock
          label={
            kind === "training"
              ? "New training program"
              : kind === "meals"
                ? "New meal plan"
                : "New supplement stack"
          }
          icon={Plus}
          onPress={() =>
            kind === "supplements"
              ? router.push({
                  pathname: "/coach/stack/[id]",
                  params: { id: "new" },
                })
              : open(null, kind)
          }
        />
      )}
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
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
});
