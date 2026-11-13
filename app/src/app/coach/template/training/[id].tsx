// Training template builder (K-05, K-06): the program a coach reuses across clients. "new" starts
// blank. Changing a template never changes clients already on it (each has their own copy, D56);
// assigning it again gives them the new version.
import { router, useLocalSearchParams } from "expo-router";
import { Copy, Trash2, UserPlus } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { emptyProgram, type TrainingProgram } from "@/features/coach/plans";
import { ProgramEditor, programReady } from "@/features/coach/ProgramEditor";
import { colors, rhythm, space } from "@/theme";
import { useBillingGate } from "@/features/coach/limits";

function TrainingTemplateEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { templates, saveTemplate, deleteTemplate, duplicateTemplate } =
    useCoachData();
  const insets = useSafeAreaInsets();
  const t = templates.find((x) => x.id === id && x.kind === "training");
  const [p, setP] = useState<TrainingProgram>(
    () => t?.program ?? emptyProgram(),
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/plans");
  if (id !== "new" && !t)
    return <PageHeader title="Template not found" onBack={back} />;

  const name = p.name.trim() || `${p.days.length}-day program`;
  const save = () =>
    saveTemplate({
      id: t?.id,
      kind: "training",
      name,
      program: { ...p, name },
    });
  const remove = () =>
    Alert.alert(
      `Delete ${t?.name}?`,
      "Clients already on it keep their own copy.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (t) deleteTemplate(t.id);
            back();
          },
        },
      ],
    );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={t ? "Training template" : "New training template"}
        sub={
          t
            ? `${t.clients} ${t.clients === 1 ? "client has" : "clients have"} a copy`
            : undefined
        }
        onBack={back}
        actions={
          t
            ? [
                {
                  icon: Copy,
                  label: "Duplicate template",
                  onPress: () =>
                    router.replace({
                      pathname: "/coach/template/training/[id]",
                      params: { id: duplicateTemplate(t.id) },
                    }),
                },
                { icon: Trash2, label: "Delete template", onPress: remove },
              ]
            : []
        }
      />
      <Page>
        <ProgramEditor
          value={p}
          onChange={setP}
          namePlaceholder="Template name, e.g. Fat loss · 4 days"
        />
        <Text variant="caption" tone="muted">
          Editing a template doesn&apos;t change clients already on it. Assign
          it again to give them this version.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save template"
          fullWidth
          disabled={!programReady(p)}
          onPress={() => {
            save();
            back();
          }}
        />
        <Button
          label="Save and assign to clients"
          icon={UserPlus}
          variant="secondary"
          fullWidth
          disabled={!programReady(p)}
          onPress={() =>
            router.replace({
              pathname: "/coach/template/assign/[id]",
              params: { id: save() },
            })
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function TrainingTemplate() {
  const gate = useBillingGate();
  return gate ?? <TrainingTemplateEditor />;
}
