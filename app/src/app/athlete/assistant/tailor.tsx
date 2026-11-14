// Tailor today's workout (D70): say what's different today, see exactly what would change and why,
// then apply it to today only. Sample build: the changes come from fixed rules, not a model.
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Chip, Text, TextField } from "@/components/primitives";
import {
  tailorFromText,
  useCoachContext,
  useServerCoach,
} from "@/features/ai/coachClient";
import { TAILOR_OPTIONS, tailor, type TailorKind } from "@/features/ai/tailor";
import { isoToday } from "@/features/athlete/athleteData";
import { useTodayWorkout } from "@/features/athlete/QuickLog";
import {
  backTo,
  Bullets,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow } from "@/features/coach/parts";
import { WhyThis } from "@/features/science/WhyThis";
import { space } from "@/theme";

export default function TailorToday() {
  const me = useMe();
  const { meTier, setAthleteSettings } = useCoachData();
  const today = useTodayWorkout();
  const [kind, setKind] = useState<TailorKind | null>(null);
  // With accounts, the athlete can say it in their own words; the coach picks from the same fixed
  // options (B8) and the rules below make the change.
  const server = useServerCoach();
  const [now] = useState(() => Date.now());
  const context = useCoachContext(now);
  const [words, setWords] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  if (!me) return <NotJoined />;
  // AI is Plus-only and coached athletes never see it (D44): a direct link goes back to Today.
  if (meTier !== "pro") return <Redirect href="/athlete" />;
  const back = backTo("/athlete/ai");
  const day = today.day;

  if (!day)
    return (
      <MenuPage title="Tailor today" back={back}>
        <InfoCard title="It's a rest day">
          Nothing to tailor today. If you want to train anyway, start an empty
          workout or one of your routines from Training.
        </InfoCard>
      </MenuPage>
    );

  const t = kind ? tailor(day, kind) : null;
  const label = TAILOR_OPTIONS.find((o) => o.kind === kind)?.label ?? "";

  return (
    <MenuPage
      title="Tailor today"
      sub={server ? day.name : `${day.name} · sample`}
      back={back}
      footer={
        t ? (
          <Button
            label="Apply to today"
            fullWidth
            disabled={!t.changes.length}
            onPress={() => {
              setAthleteSettings(me.id, {
                dayPlan: {
                  date: isoToday(),
                  dayId: day.id,
                  exercises: t.exercises,
                  reason: label.replace(/^I /, "you ").toLowerCase(),
                },
              });
              router.replace({
                pathname: "/athlete/workout/preview/[dayId]",
                params: { dayId: day.id },
              });
            }}
          />
        ) : undefined
      }
    >
      <Text tone="muted">What&apos;s different today?</Text>
      {server ? (
        <View style={styles.ask}>
          <TextField
            label="Tell your AI coach"
            value={words}
            onChangeText={setWords}
            placeholder="e.g. knee feels sore and I have 30 minutes"
          />
          <Button
            label={busy ? "Thinking…" : "Suggest a change"}
            size="sm"
            variant="secondary"
            disabled={busy || words.trim().length < 3}
            onPress={() => {
              setBusy(true);
              setNote(null);
              void tailorFromText(words, context).then(({ data, error }) => {
                setBusy(false);
                const first = data?.kinds.find((k) =>
                  TAILOR_OPTIONS.some((o) => o.kind === k),
                ) as TailorKind | undefined;
                if (first) setKind(first);
                setNote(
                  first
                    ? null
                    : error
                      ? "Can't reach the coach right now. Pick an option below."
                      : "Nothing to change for that. Pick an option below if one fits.",
                );
              });
            }}
          />
          {note ? (
            <Text variant="label" weight="regular" tone="muted">
              {note}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.chips}>
        {TAILOR_OPTIONS.map((o) => (
          <Chip
            key={o.kind}
            label={o.label}
            selected={kind === o.kind}
            onPress={() => setKind(o.kind)}
          />
        ))}
      </View>
      {t ? (
        <>
          <Eyebrow>What would change</Eyebrow>
          <InfoCard>
            {t.changes.length ? (
              <Bullets items={t.changes} />
            ) : (
              <Text tone="muted">
                Nothing needs to change: today&apos;s workout already fits.
              </Text>
            )}
          </InfoCard>
          <View style={styles.why}>
            <Text style={styles.flex}>{t.why}</Text>
            {t.sources.length ? (
              <WhyThis
                title="Why this change"
                points={[t.why]}
                sources={t.sources}
              />
            ) : null}
          </View>
          <Text variant="caption" tone="muted">
            Applies to today only. Tomorrow goes back to your plan.
          </Text>
        </>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  ask: { gap: space[2] },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  why: { flexDirection: "row", gap: space[2], alignItems: "flex-start" },
  flex: { flex: 1 },
});
