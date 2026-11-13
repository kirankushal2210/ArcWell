// Training program builder (K-06, D56): start from a template or from scratch, then edit days and
// exercises (sets, reps, rest). This is the client's own copy; templates are never changed.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  cloneProgram,
  emptyProgram,
  programFromTemplate,
  type TrainingProgram,
} from "@/features/coach/plans";
import { ProgramEditor, programReady } from "@/features/coach/ProgramEditor";
import { colors, rhythm, space } from "@/theme";
import { useBillingGate } from "@/features/coach/limits";

function TrainingBuilderEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, templates, saveProgram, sessions } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const training = templates.filter((t) => t.kind === "training");
  const fromTemplate = (name: string): TrainingProgram => {
    const t = training.find((x) => x.name === name);
    return t?.program
      ? { ...cloneProgram(t.program), name: t.name }
      : programFromTemplate(name);
  };
  const [p, setP] = useState<TrainingProgram>(
    () =>
      c?.program ??
      (c?.plan?.training ? fromTemplate(c.plan.training) : emptyProgram()),
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <PageHeader title="Training" onBack={back} />;
  const first = c.name.split(" ")[0];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={c.id === "me" ? "Your program" : `Training · ${first}`}
        onBack={back}
      />
      <Page>
        <Eyebrow>Start from</Eyebrow>
        <Pills
          value={p.days.length ? "" : "scratch"}
          onChange={(v) =>
            setP(v === "scratch" ? emptyProgram() : fromTemplate(v))
          }
          options={[
            ...training.map((t) => ({ value: t.name, label: t.name })),
            { value: "scratch", label: "Blank" },
          ]}
        />
        <Text variant="caption" tone="muted">
          Picking a template replaces the days below with a fresh copy you can
          change freely.
        </Text>
        <ProgramEditor
          value={p}
          onChange={setP}
          notePlaceholder={
            c.id === "me"
              ? "Note to self (optional)"
              : `Note for ${first} (optional)`
          }
          history={sessions(c.id)}
          experience={c.profile?.experience}
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save training program"
          fullWidth
          disabled={!programReady(p)}
          onPress={() => {
            saveProgram(c.id, {
              ...p,
              name: p.name.trim() || `${p.days.length}-day program`,
            });
            back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function TrainingBuilder() {
  const gate = useBillingGate();
  return gate ?? <TrainingBuilderEditor />;
}
