// Privacy and permissions (AC-02, AI-03): health data (required), progress photos (optional, D12),
// AI features for AI tiers (D8, D20), coach history access (coached, D37) and shared photos (F9-06).
// Coached athletes never see the AI switch (D44).
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/primitives";
import {
  backTo,
  InfoCard,
  MenuPage,
  NavRow,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group } from "@/features/coach/parts";
import { space } from "@/theme";
import { openPlaySubscriptions } from "@/features/system/store";

export default function Privacy() {
  const me = useMe();
  const { meTier, settingsOf, setAthleteSettings } = useCoachData();
  const [confirmAi, setConfirmAi] = useState(false);
  if (!me) return <NotJoined />;
  const s = settingsOf(me.id);
  const coached = meTier === "coached";
  const shared = (me.transformations ?? []).filter(
    (t) => t.status === "approved",
  ).length;

  return (
    <MenuPage title="Privacy" back={backTo("/athlete/menu/account")}>
      <Group>
        <ToggleRow
          first
          label="Health and fitness data"
          sub="Required to use Arcwell. To stop, delete your account."
          value
          disabled
          onChange={() => {}}
        />
        <ToggleRow
          label="Progress photos"
          sub="Optional. Check-ins can be sent without photos."
          value={s.photos}
          onChange={(v) => setAthleteSettings(me.id, { photos: v })}
        />
        {meTier === "pro" ? (
          <ToggleRow
            label="AI features"
            sub="Turning this off stops AI plans and photo logging. Your logs stay."
            value={s.ai}
            onChange={(v) =>
              v ? setAthleteSettings(me.id, { ai: true }) : setConfirmAi(true)
            }
          />
        ) : null}
      </Group>

      <Eyebrow>Sharing</Eyebrow>
      <Group>
        {coached ? (
          <NavRow
            first
            label="Coach's access to my history"
            value={me.historyFrom ? "On" : "Off"}
            onPress={() => router.push("/athlete/menu/history-access")}
          />
        ) : null}
        <NavRow
          first={!coached}
          label="Shared progress photos"
          value={shared ? `${shared} shared` : "None"}
          onPress={() => router.push("/athlete/photos")}
        />
      </Group>

      {meTier === "pro" ? (
        <InfoCard>
          Turning AI off doesn&apos;t cancel your trial or subscription. Manage
          your subscription in the Play Store.
        </InfoCard>
      ) : null}

      <Sheet
        visible={confirmAi}
        onClose={() => setConfirmAi(false)}
        title="Turn off AI features?"
        sub="AI plans, meal plans and photo logging stop. Your workouts and logs stay. Your subscription keeps running until you cancel it in the Play Store."
      >
        <View style={styles.buttons}>
          <Button
            label="Turn off AI"
            fullWidth
            onPress={() => {
              setAthleteSettings(me.id, { ai: false });
              setConfirmAi(false);
            }}
          />
          <Button
            label="Manage subscription in Play Store"
            variant="secondary"
            fullWidth
            onPress={() => {
              setConfirmAi(false);
              openPlaySubscriptions();
            }}
          />
          <Button
            label="Keep AI on"
            variant="ghost"
            fullWidth
            onPress={() => setConfirmAi(false)}
          />
        </View>
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: space[1], paddingTop: space[2] },
});
