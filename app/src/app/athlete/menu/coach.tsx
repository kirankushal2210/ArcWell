// My coach (L-01): who coaches you and since when, their profile (D43), earlier-history access
// (AC-10), and leaving.
import { router } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, StatusChip, Text } from "@/components/primitives";
import { backTo, MenuPage, NavRow } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { CoachPhoto, FoldedBio } from "@/features/coach/CoachProfileView";
import { Group } from "@/features/coach/parts";
import { TransformationsStrip } from "@/features/coach/TransformationsStrip";
import { colors, radius, space } from "@/theme";

export default function MyCoach() {
  const me = useMe();
  const { coach, coachName } = useCoachData();
  if (!me) return <NotJoined />;
  const first = coachName.replace(/^Coach\s+/, "");

  return (
    <MenuPage
      title="My coach"
      back={backTo("/athlete/menu/account")}
      footer={
        <Button
          label={`Leave ${coachName}`}
          variant="secondary"
          fullWidth
          onPress={() => router.push("/athlete/menu/leave")}
        />
      }
    >
      <View style={styles.card}>
        <CoachPhoto name={coach.name} uri={coach.photo} size={48} />
        <View style={styles.flex}>
          <Text variant="title">{coach.name}</Text>
          <Text variant="label" weight="regular" tone="muted">
            Coaching you since {me.joined}
          </Text>
        </View>
        <StatusChip status={me.status} />
      </View>
      <FoldedBio bio={coach.bio} />
      <Group>
        <NavRow
          first
          icon={MessageCircle}
          label={`Message ${first}`}
          onPress={() => router.push("/athlete/chat")}
        />
        <NavRow
          label="Access to my earlier history"
          value={me.historyFrom ? "On" : "Off"}
          onPress={() => router.push("/athlete/menu/history-access")}
        />
      </Group>
      <TransformationsStrip />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
