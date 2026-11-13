// Review a transformation request (F9-03) and edit what's shown (F9-04). The athlete owns the
// photos: face blur is on and first name off by default; they can change the crop and caption,
// then Approve or Decline, given equal weight. The coach only ever sees "Declined".
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text, TextField } from "@/components/primitives";
import {
  isoToday,
  type Transformation,
  usesText,
} from "@/features/athlete/athleteData";
import {
  backTo,
  InfoCard,
  MenuPage,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { TransformPreview } from "@/features/athlete/TransformPreview";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, Pills } from "@/features/coach/parts";
import { space } from "@/theme";

export default function ReviewRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const { updateTransformation } = useCoachData();
  const found = me?.transformations?.find((t) => t.id === id);
  const [draft, setDraft] = useState<Transformation | undefined>(found);
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/photos");
  if (!found || !draft)
    return (
      <MenuPage title="Request" back={back}>
        <InfoCard>This request is no longer available.</InfoCard>
      </MenuPage>
    );
  const first = found.coachName.replace(/^Coach\s+/, "");
  const decided = found.status !== "waiting";
  const set = (p: Partial<Transformation>) => setDraft({ ...draft, ...p });
  const decide = (status: "approved" | "declined") => {
    updateTransformation(me.id, found.id, {
      ...draft,
      status,
      decidedAt: isoToday(),
      onProfile: status === "approved" && draft.uses.includes("profile"),
    });
    router.replace("/athlete/photos");
  };

  return (
    <MenuPage
      title="Share your progress?"
      sub={`${found.coachName} asked ${found.requestedAt}`}
      back={back}
      footer={
        decided ? undefined : (
          <View style={styles.buttons}>
            <View style={styles.flex}>
              <Button
                label="Decline"
                variant="secondary"
                fullWidth
                onPress={() => decide("declined")}
              />
            </View>
            <View style={styles.flex}>
              <Button
                label="Approve"
                fullWidth
                onPress={() => decide("approved")}
              />
            </View>
          </View>
        )
      }
    >
      {found.message ? <Text tone="muted">“{found.message}”</Text> : null}
      <TransformPreview t={draft} name={me.name.split(" ")[0]} />
      <Text variant="label" weight="regular" tone="muted">
        Used on: {usesText(draft.uses)}
      </Text>

      {decided ? (
        <InfoCard>
          {found.status === "approved"
            ? "You approved this. Withdraw it any time from Privacy → Shared progress photos."
            : found.status === "declined"
              ? `You declined. ${first} sees only "Declined".`
              : "You withdrew this."}
        </InfoCard>
      ) : (
        <>
          <Group>
            <ToggleRow
              first
              label="Blur my face"
              value={draft.blurFace}
              onChange={(v) => set({ blurFace: v })}
            />
            <ToggleRow
              label="Show my first name"
              value={draft.showName}
              onChange={(v) => set({ showName: v })}
            />
          </Group>
          <Eyebrow>Crop</Eyebrow>
          <Pills
            value={draft.crop}
            onChange={(v) => set({ crop: v })}
            options={[
              { value: "full", label: "Full body" },
              { value: "waist", label: "Waist up" },
            ]}
          />
          <TextField
            label="Caption"
            value={draft.caption}
            onChangeText={(v) => set({ caption: v })}
          />
          <InfoCard>
            The blur is burned into any image your coach saves, so it can&apos;t
            be undone on their side. You can withdraw approval any time.
          </InfoCard>
        </>
      )}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  buttons: { flexDirection: "row", gap: space[2] },
});
