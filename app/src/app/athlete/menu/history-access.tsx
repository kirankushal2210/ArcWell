// Coach access to earlier history (AC-10, D37): one switch, off by default. Turning it on asks
// once; turning it off removes access straight away. Check-ins, messages and notes aren't affected.
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/primitives";
import {
  backTo,
  InfoCard,
  MenuPage,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group } from "@/features/coach/parts";
import { space } from "@/theme";

export default function HistoryAccess() {
  const me = useMe();
  const { coachName, setHistoryAccess } = useCoachData();
  const [asking, setAsking] = useState(false);
  if (!me) return <NotJoined />;
  const first = coachName.replace(/^Coach\s+/, "");
  const on = !!me.historyFrom;

  return (
    <MenuPage title="History access" back={backTo("/athlete/menu/coach")}>
      <Group>
        <ToggleRow
          first
          label="Share my history from before I joined"
          sub={`${coachName} can see workouts, food logs, recovery and progress from before ${me.joined}.`}
          value={on}
          onChange={(v) =>
            v ? setAsking(true) : setHistoryAccess(me.id, false)
          }
        />
      </Group>
      <InfoCard>
        {on
          ? `${first} can see everything you've logged, including before ${me.joined}. Turn this off any time; access ends straight away.`
          : `Right now ${first} sees your data from ${me.joined}, when you joined. You can turn this on or off any time. Turning it off removes access straight away.`}
      </InfoCard>
      <InfoCard>
        Check-ins, messages and private notes aren&apos;t affected.
      </InfoCard>

      <Sheet
        visible={asking}
        onClose={() => setAsking(false)}
        title={`Share your earlier history with ${first}?`}
        sub={`${first} will see workouts, food logs, recovery and progress from before you joined, and gets a notification. You can turn it off any time.`}
      >
        <View style={styles.buttons}>
          <Button
            label="Share my history"
            fullWidth
            onPress={() => {
              setHistoryAccess(me.id, true);
              setAsking(false);
            }}
          />
          <Button
            label="Not now"
            variant="ghost"
            fullWidth
            onPress={() => setAsking(false)}
          />
        </View>
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: space[1], paddingTop: space[2] },
});
