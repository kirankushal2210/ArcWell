// Spreadsheet import (D55, CO-10): pick an Excel or CSV file, check the draft program it makes,
// fix or drop the rows whose exercise we couldn't match, then save it as a training template.
// Opened from Plans, or from coach onboarding with the draft already read.
import { router } from "expo-router";
import { FileSpreadsheet, FileUp, Search, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { ExercisePicker } from "@/features/athlete/ExercisePicker";
import { useCoachData } from "@/features/coach/CoachData";
import {
  dropUnmatched,
  fixUnmatched,
  importSummary,
  type SheetImport,
} from "@/features/coach/importSheet";
import { useBillingGate } from "@/features/coach/limits";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { ProgramEditor, programReady } from "@/features/coach/ProgramEditor";
import {
  pendingImport,
  pickSheet,
  setPendingImport,
} from "@/features/coach/readSheet";
import { colors, radius, rhythm, space } from "@/theme";

function ImportScreen() {
  const { saveTemplate } = useCoachData();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<SheetImport | null>(() => pendingImport());
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);

  const back = () => {
    setPendingImport(null);
    if (router.canGoBack()) router.back();
    else router.replace("/coach/plans");
  };
  const pick = async () => {
    setBusy(true);
    const res = await pickSheet();
    setBusy(false);
    if (!res) return;
    setFile(res.name);
    setError(res.error ?? null);
    if (res.draft) setDraft(res.draft);
  };

  // Rows the coach has since removed in the editor no longer need checking.
  const present = new Set(
    draft?.program.days.flatMap((d) => d.exercises.map((e) => e.id)) ?? [],
  );
  const unmatched =
    draft?.unmatched.filter((u) => present.has(u.exerciseId)) ?? [];
  const fixRow = unmatched.find((u) => u.exerciseId === fixing);
  const ready =
    !!draft && unmatched.length === 0 && programReady(draft.program);

  const save = () => {
    if (!draft) return;
    const name = draft.program.name.trim() || "Imported program";
    saveTemplate({
      kind: "training",
      name,
      program: { ...draft.program, name },
    });
    setPendingImport(null);
    router.replace("/coach/plans");
  };

  if (!draft)
    return (
      <View style={styles.root}>
        <PageHeader title="Import from spreadsheet" onBack={back} />
        <Page>
          <PressableScale
            onPress={pick}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Choose your spreadsheet"
            style={styles.pick}
          >
            <FileUp size={28} strokeWidth={1.6} color={colors.text} />
            <Text weight="semibold">
              {busy ? "Reading…" : "Choose your spreadsheet"}
            </Text>
            <Text variant="label" weight="regular" tone="muted">
              Excel (.xlsx) or CSV
            </Text>
          </PressableScale>
          {error ? (
            <Text tone="danger" accessibilityLiveRegion="polite">
              {file ? `${file}: ` : ""}
              {error}
            </Text>
          ) : null}
          <Text variant="label" weight="regular" tone="muted">
            One row per exercise: day, exercise, sets, reps. Rest and RPE
            columns are read too.
          </Text>
          <Text variant="label" weight="regular" tone="muted">
            Google Sheets: File → Download → .xlsx or .csv, then pick that file.
          </Text>
        </Page>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title="Check your import"
        sub={importSummary(draft)}
        onBack={back}
        actions={[
          {
            icon: FileSpreadsheet,
            label: "Choose a different file",
            onPress: pick,
          },
        ]}
      />
      <Page>
        {error ? <Text tone="danger">{error}</Text> : null}
        {unmatched.length ? (
          <>
            <Eyebrow>{`Check ${unmatched.length} ${unmatched.length === 1 ? "row" : "rows"}`}</Eyebrow>
            <Text variant="label" weight="regular" tone="muted">
              We couldn&apos;t match these to an exercise. Pick the right one or
              drop the row.
            </Text>
            <Group>
              {unmatched.map((u, i) => (
                <GroupRow key={u.exerciseId} first={i === 0}>
                  <View style={styles.flex}>
                    <Text weight="semibold" numberOfLines={1}>
                      {u.raw}
                    </Text>
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      Row {u.row} ·{" "}
                      {draft.program.days.find((d) => d.id === u.dayId)?.name ??
                        "Workout"}
                    </Text>
                  </View>
                  <IconButton
                    icon={Search}
                    accessibilityLabel={`Pick an exercise for ${u.raw}`}
                    onPress={() => setFixing(u.exerciseId)}
                  />
                  <IconButton
                    icon={Trash2}
                    color={colors.textMuted}
                    accessibilityLabel={`Drop ${u.raw}`}
                    onPress={() =>
                      setDraft((d) => (d ? dropUnmatched(d, u.exerciseId) : d))
                    }
                  />
                </GroupRow>
              ))}
            </Group>
          </>
        ) : null}
        <ProgramEditor
          value={draft.program}
          onChange={(fn) =>
            setDraft((d) => (d ? { ...d, program: fn(d.program) } : d))
          }
          namePlaceholder="Template name, e.g. Fat loss · 4 days"
        />
        <Text variant="caption" tone="muted">
          Nothing reaches a client until you assign the template.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={
            unmatched.length
              ? `Fix or drop ${unmatched.length} ${unmatched.length === 1 ? "row" : "rows"} first`
              : "Save as template"
          }
          fullWidth
          disabled={!ready}
          onPress={save}
        />
      </View>
      <ExercisePicker
        visible={!!fixRow}
        multi={false}
        history={[]}
        title={fixRow ? `Instead of “${fixRow.raw}”` : undefined}
        onClose={() => setFixing(null)}
        onPick={(names) => {
          const name = names[0];
          if (fixRow && name)
            setDraft((d) => (d ? fixUnmatched(d, fixRow.exerciseId, name) : d));
          setFixing(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  pick: {
    alignItems: "center",
    gap: space[1],
    paddingVertical: space[6],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});

/** Locked while the coach's billing is lapsed (K-27). */
export default function ImportTemplate() {
  const gate = useBillingGate();
  return gate ?? <ImportScreen />;
}
