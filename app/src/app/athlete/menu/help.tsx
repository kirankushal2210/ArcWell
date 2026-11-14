// Help and support (AC-09): search, topics, then Contact support. Sample build: topics open short
// answers inline; support runs through the Supabase dashboard in v1 (no admin app).
import { useState } from "react";
import { Linking } from "react-native";

import { Button, Text, TextField } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { LegalRows } from "@/features/legal/LegalLinks";

const TOPICS: [string, string][] = [
  [
    "Logging workouts",
    "Start from Today or Training. Each set is pre-filled from your plan or last time, so a matching set is one tap on the tick. Your workout saves on the phone as you go.",
  ],
  [
    "Logging food and portions",
    "Tap the round red button above the tab bar on Today or Nutrition: a scan with Plus, or + to search. Search in English or Hindi and pick a portion in katori, roti or grams. Recent foods are one tap away.",
  ],
  [
    "Subscriptions and the trial",
    "Arcwell Plus is billed by Google Play. Cancel or get a refund in the Play Store; cancelling during the 7-day trial means no charge.",
  ],
  [
    "Working with your coach",
    "Your coach sees your data from the day you joined, unless you share earlier history. Leave any time from Account → My coach; you keep everything.",
  ],
  [
    "Privacy and your data",
    "Export a copy of everything from Account → Export my data. Progress photos are optional and private to you and your coach.",
  ],
];

export default function Help() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const shown = TOPICS.filter(([t, a]) =>
    `${t} ${a}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <MenuPage
      title="Help"
      back={backTo("/athlete/menu/account")}
      footer={
        <Button
          label="Contact support"
          variant="secondary"
          fullWidth
          onPress={() => Linking.openURL("mailto:support@arcwell.app")}
        />
      }
    >
      <TextField
        placeholder="Search help"
        value={q}
        onChangeText={setQ}
        accessibilityLabel="Search help"
      />
      {shown.length ? (
        <Group>
          {shown.map(([t, a], i) => (
            <GroupRow
              key={t}
              first={i === 0}
              onPress={() => setOpen(open === t ? null : t)}
              label={t}
            >
              <Text weight="medium" style={{ flex: 1 }}>
                {open === t ? `${t}\n` : t}
                {open === t ? (
                  <Text tone="muted" weight="regular">
                    {a}
                  </Text>
                ) : null}
              </Text>
            </GroupRow>
          ))}
        </Group>
      ) : (
        <InfoCard>
          Nothing matches. Contact support and we&apos;ll answer directly.
        </InfoCard>
      )}
      <Eyebrow>Policies</Eyebrow>
      <LegalRows />
    </MenuPage>
  );
}
