// Leave coach (L-02; D7b, D7c, D21, D32, D38): the coach's access ends at once, the athlete keeps
// everything and moves to Free, the plan stays read-only and Recovery hides (history kept). If they
// approved transformation photos, they choose to withdraw them (pre-selected) or keep them shared.
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import {
  backTo,
  Bullets,
  ConfirmButtons,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { colors, space } from "@/theme";

export default function LeaveCoach() {
  const me = useMe();
  const { coachName, leaveCoach } = useCoachData();
  const [withdraw, setWithdraw] = useState(true);
  if (!me) return <NotJoined />;
  const first = coachName.replace(/^Coach\s+/, "");
  const back = backTo("/athlete/menu/coach");
  const approved = (me.transformations ?? []).some(
    (t) => t.status === "approved",
  );
  const choice = (value: boolean, label: string, sub: string, top: boolean) => (
    <GroupRow first={top}>
      <PressableScale
        onPress={() => setWithdraw(value)}
        accessibilityRole="radio"
        accessibilityState={{ checked: withdraw === value }}
        accessibilityLabel={label}
        style={styles.choice}
      >
        <View style={styles.flex}>
          <Text weight="medium">{label}</Text>
          <Text variant="label" weight="regular" tone="muted">
            {sub}
          </Text>
        </View>
        {withdraw === value ? <Check size={20} color={colors.text} /> : null}
      </PressableScale>
    </GroupRow>
  );

  return (
    <MenuPage
      title={`Leave ${coachName}?`}
      back={back}
      footer={
        <ConfirmButtons
          label="Leave coach"
          destructive
          onConfirm={() => {
            leaveCoach(approved && withdraw);
            if (router.canDismiss()) router.dismissAll();
            router.replace({
              pathname: "/athlete/switch/[step]",
              params: { step: "left" },
            });
          }}
          cancel={`Stay with ${first}`}
          onCancel={back}
        />
      }
    >
      <InfoCard>
        <Bullets
          items={[
            `${first} will no longer see your data or message you here`,
            "You keep all your workouts, logs and history",
            `${first}'s plan stays in Training, read-only: you can follow it but not edit it`,
            "You move to the free plan, so Recovery is locked. Your recovery history is kept",
          ]}
        />
      </InfoCard>
      {approved ? (
        <>
          <Eyebrow>{`Transformation photos you shared with ${first}`}</Eyebrow>
          <Group>
            {choice(
              true,
              "Withdraw them",
              `Removed from ${first}'s profile and exports`,
              true,
            )}
            {choice(
              false,
              "Keep them shared",
              "You can withdraw any time later",
              false,
            )}
          </Group>
        </>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  choice: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
  },
});
