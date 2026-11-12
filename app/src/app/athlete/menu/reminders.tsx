// Reminders (FE-5): workout time, a morning weigh-in, meal times from the plan, and a wind-down
// before bed. Times step in 15 minutes. Sample build: saved on the phone; the reminders themselves
// are scheduled with Expo Notifications once accounts and notifications are wired.
import { Minus, Plus } from "lucide-react-native";
import { StyleSheet } from "react-native";

import { IconButton, Text } from "@/components/primitives";
import {
  defaultReminders,
  type Reminders,
} from "@/features/athlete/athleteData";
import {
  backTo,
  InfoCard,
  MenuPage,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow } from "@/features/coach/parts";
import { clock } from "@/features/coach/plans";
import { space } from "@/theme";

const STEP = 15;

export default function RemindersScreen() {
  const me = useMe();
  const { settingsOf, setAthleteSettings } = useCoachData();
  if (!me) return <NotJoined />;
  const r: Reminders = {
    ...defaultReminders(),
    ...settingsOf(me.id).reminders,
  };
  const save = (next: Reminders) =>
    setAthleteSettings(me.id, { reminders: next });
  const timeRow = (key: "workout" | "weighIn", label: string) =>
    r[key].on ? (
      <GroupRow>
        <Text tone="muted" style={styles.flex}>
          {label} at
        </Text>
        <IconButton
          icon={Minus}
          accessibilityLabel={`${label} 15 minutes earlier`}
          onPress={() =>
            save({
              ...r,
              [key]: { ...r[key], at: (r[key].at - STEP + 1440) % 1440 },
            })
          }
        />
        <Text weight="semibold" numeric style={styles.time}>
          {clock(r[key].at)}
        </Text>
        <IconButton
          icon={Plus}
          accessibilityLabel={`${label} 15 minutes later`}
          onPress={() =>
            save({ ...r, [key]: { ...r[key], at: (r[key].at + STEP) % 1440 } })
          }
        />
      </GroupRow>
    ) : null;

  return (
    <MenuPage title="Reminders" back={backTo("/athlete/menu")}>
      <Group>
        <ToggleRow
          first
          label="Workout"
          sub="On training days, before your session"
          value={r.workout.on}
          onChange={(v) => save({ ...r, workout: { ...r.workout, on: v } })}
        />
        {timeRow("workout", "Workout")}
        <ToggleRow
          label="Morning weigh-in"
          sub="Same time each day makes the trend reliable"
          value={r.weighIn.on}
          onChange={(v) => save({ ...r, weighIn: { ...r.weighIn, on: v } })}
        />
        {timeRow("weighIn", "Weigh-in")}
        <ToggleRow
          label="Meals"
          sub="At the times in your meal plan"
          value={r.meals}
          onChange={(v) => save({ ...r, meals: v })}
        />
        <ToggleRow
          label="Wind down"
          sub={
            me.protocol
              ? `30 minutes before your ${clock(me.protocol.bed)} bedtime`
              : "30 minutes before bed"
          }
          value={r.windDown}
          onChange={(v) => save({ ...r, windDown: v })}
        />
      </Group>
      <InfoCard>
        Reminders arrive as phone notifications. You can change these any time,
        and turn notification types off in Notifications.
      </InfoCard>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  time: { minWidth: 72, textAlign: "center" },
});
