// Export an approved photo (F9-05): the branded before and after with the athlete's blur and
// caption, square or story, and whether it shows on the coach's Arcwell profile. Only for the uses
// the athlete approved. Sample build: saving the image arrives with photo storage (S3).
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { Button, Text } from "@/components/primitives";
import { usesText } from "@/features/athlete/athleteData";
import {
  backTo,
  InfoCard,
  MenuPage,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { TransformPreview } from "@/features/athlete/TransformPreview";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, Pills } from "@/features/coach/parts";

export default function ExportTransformation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, updateTransformation } = useCoachData();
  const [clientId, tid] = (id ?? "").split("~");
  const c = clients.find((x) => x.id === clientId);
  const t = c?.transformations?.find((x) => x.id === tid);
  const [format, setFormat] = useState<"square" | "story">("square");
  const [tried, setTried] = useState(false);
  const back = backTo("/coach/transformations");

  if (!c || !t || t.status !== "approved")
    return (
      <MenuPage title="Transformation" back={back}>
        <InfoCard>
          This photo isn&apos;t approved for sharing any more. If you posted it,
          please take it down.
        </InfoCard>
      </MenuPage>
    );
  const first = c.name.split(" ")[0];

  return (
    <MenuPage
      title={`${c.name} · Approved`}
      back={back}
      footer={
        <Button
          label="Save image to share"
          fullWidth
          onPress={() => setTried(true)}
        />
      }
    >
      <TransformPreview t={t} name={first} />
      <Eyebrow>Format</Eyebrow>
      <Pills
        value={format}
        onChange={setFormat}
        options={[
          { value: "square", label: "Square (post)" },
          { value: "story", label: "Story 9:16" },
        ]}
      />
      {t.uses.includes("profile") ? (
        <Group>
          <ToggleRow
            first
            label="Show on my Arcwell profile"
            value={t.onProfile}
            onChange={(v) => updateTransformation(c.id, t.id, { onProfile: v })}
          />
        </Group>
      ) : null}
      <Text variant="caption" tone="muted">
        Approved by {first} for: {usesText(t.uses)}.
      </Text>
      {tried ? (
        <InfoCard>
          Sample build: saving the branded image arrives with photo storage.
        </InfoCard>
      ) : null}
    </MenuPage>
  );
}
