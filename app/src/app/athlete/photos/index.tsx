// Shared progress photos (F9-06): requests waiting for a decision, what's shared and where, and
// what's been withdrawn. Withdrawing is as easy as approving (DPDP); the coach is told and asked to
// remove anything already posted elsewhere. Leaving a coach doesn't withdraw automatically (D38).
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import {
  isoToday,
  shortDay,
  type Transformation,
  usesText,
} from "@/features/athlete/athleteData";
import {
  backTo,
  InfoCard,
  MenuPage,
  NavRow,
} from "@/features/athlete/MenuParts";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { space } from "@/theme";

const what = (t: Transformation) =>
  `Before / after · ${t.before.label} to ${t.after.label}`;

export default function SharedPhotos() {
  const me = useMe();
  const { updateTransformation } = useCoachData();
  const [withdrawing, setWithdrawing] = useState<Transformation | null>(null);
  if (!me) return <NotJoined />;
  const all = me.transformations ?? [];
  const waiting = all.filter((t) => t.status === "waiting");
  const approved = all.filter((t) => t.status === "approved");
  const past = all.filter(
    (t) => t.status === "withdrawn" || t.status === "declined",
  );
  const coachFirst = (withdrawing?.coachName ?? "").replace(/^Coach\s+/, "");

  return (
    <MenuPage
      title="Shared progress photos"
      back={backTo("/athlete/menu/privacy")}
    >
      <Text tone="muted">
        Photos you&apos;ve approved for your coach to share. You decide, and you
        can withdraw any time.
      </Text>

      {waiting.length ? (
        <>
          <Eyebrow>Waiting for you</Eyebrow>
          <Group>
            {waiting.map((t, i) => (
              <NavRow
                key={t.id}
                first={i === 0}
                label={`${t.coachName} asked to share your progress`}
                sub={`${what(t)} · requested ${t.requestedAt}`}
                onPress={() =>
                  router.push({
                    pathname: "/athlete/photos/review/[id]",
                    params: { id: t.id },
                  })
                }
              />
            ))}
          </Group>
        </>
      ) : null}

      <Eyebrow>Shared</Eyebrow>
      {approved.length ? (
        <Group>
          {approved.map((t, i) => (
            <GroupRow key={t.id} first={i === 0}>
              <View style={styles.flex}>
                <Text weight="medium">{what(t)}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {t.coachName} · {usesText(t.uses)} · approved{" "}
                  {t.decidedAt ? shortDay(t.decidedAt) : ""}
                </Text>
              </View>
              <Button
                label="Withdraw"
                size="sm"
                variant="secondary"
                onPress={() => setWithdrawing(t)}
              />
            </GroupRow>
          ))}
        </Group>
      ) : (
        <InfoCard>Nothing shared. Your photos stay private.</InfoCard>
      )}

      {past.length ? (
        <>
          <Eyebrow>Withdrawn or declined</Eyebrow>
          <Group>
            {past.map((t, i) => (
              <GroupRow key={t.id} first={i === 0}>
                <View style={styles.flex}>
                  <Text weight="medium" tone="muted">
                    {what(t)}
                  </Text>
                  <Text variant="label" weight="regular" tone="muted">
                    {t.status === "withdrawn"
                      ? `Withdrawn ${t.withdrawnAt ? shortDay(t.withdrawnAt) : ""}`
                      : "Declined"}
                  </Text>
                </View>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}

      <Sheet
        visible={!!withdrawing}
        onClose={() => setWithdrawing(null)}
        title="Withdraw approval?"
        sub={`We'll remove it from ${coachFirst}'s Arcwell profile straight away and tell them you've withdrawn it.`}
      >
        <InfoCard>
          {`If ${coachFirst} already posted it on Instagram or elsewhere, Arcwell can't delete those posts. We'll ask them to remove them.`}
        </InfoCard>
        <View style={styles.buttons}>
          <Button
            label="Withdraw"
            variant="destructive"
            fullWidth
            onPress={() => {
              if (withdrawing)
                updateTransformation(me.id, withdrawing.id, {
                  status: "withdrawn",
                  withdrawnAt: isoToday(),
                  onProfile: false,
                });
              setWithdrawing(null);
            }}
          />
          <Button
            label="Keep sharing"
            variant="ghost"
            fullWidth
            onPress={() => setWithdrawing(null)}
          />
        </View>
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  buttons: { gap: space[1], paddingTop: space[2] },
});
