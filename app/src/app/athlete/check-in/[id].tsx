// A past check-in, read-only (CP-06): what you sent (weekly numbers, photos, scores, your words)
// and your coach's reply. Photos open full screen.
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Avatar, Text } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { POSES, SCORES } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { PhotoSlot } from "@/features/coach/PhotoSlot";
import { colors, radius, space } from "@/theme";

export default function PastCheckIn() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const { coachName } = useCoachData();
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/progress");
  const k = me.checkIns.find((x) => x.id === id);
  if (!k)
    return (
      <MenuPage title="Check-in" back={back}>
        <InfoCard>This check-in isn&apos;t available.</InfoCard>
      </MenuPage>
    );
  const first = coachName.replace(/^Coach\s+/, "");
  const photos = POSES.filter((p) => k.photos?.[p.key]);
  const scored = SCORES.filter((s) => k.scores?.[s.key]);

  return (
    <MenuPage
      title={k.week === 0 ? "Starting point" : `Week ${k.week}`}
      sub={`Sent ${k.submitted}`}
      back={back}
    >
      {k.reviewed && k.reply ? (
        <View style={styles.reply}>
          <Avatar name={first} />
          <View style={styles.flex}>
            <Text variant="label" tone="muted">
              {coachName}
            </Text>
            <Text>{k.reply}</Text>
          </View>
        </View>
      ) : (
        <InfoCard>{`${first} hasn't replied yet.`}</InfoCard>
      )}

      {k.rows.length ? (
        <Group>
          <GroupRow first>
            <Text variant="label" tone="muted" style={styles.flex}>
              {" "}
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              Last
            </Text>
            <Text variant="label" tone="muted" style={styles.col}>
              Now
            </Text>
          </GroupRow>
          {k.rows.map((r) => (
            <GroupRow key={r.label}>
              <Text style={styles.flex}>{r.label}</Text>
              <Text tone="muted" numeric style={styles.col}>
                {r.last}
              </Text>
              <Text weight="semibold" numeric style={styles.col}>
                {r.now}
              </Text>
            </GroupRow>
          ))}
        </Group>
      ) : null}

      {photos.length ? (
        <>
          <Eyebrow>Photos</Eyebrow>
          <View style={styles.photos}>
            {POSES.map((p) => (
              <PhotoSlot key={p.key} uri={k.photos?.[p.key]} label={p.label} />
            ))}
          </View>
        </>
      ) : null}

      {scored.length ? (
        <>
          <Eyebrow>Your week, out of 5</Eyebrow>
          <Group>
            {scored.map((s, i) => (
              <GroupRow key={s.key} first={i === 0}>
                <Text style={styles.flex}>{s.label}</Text>
                <Text weight="semibold" numeric>
                  {k.scores?.[s.key]}
                </Text>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}

      {k.wins || k.struggles || k.question || k.note ? (
        <>
          <Eyebrow>In your words</Eyebrow>
          <View style={styles.card}>
            {k.wins ? (
              <View style={styles.said}>
                <Text variant="label" tone="muted">
                  {k.week === 0 ? "Wants to change" : "Wins"}
                </Text>
                <Text>{k.wins}</Text>
              </View>
            ) : null}
            {k.struggles || k.note ? (
              <View style={styles.said}>
                <Text variant="label" tone="muted">
                  Hard this week
                </Text>
                <Text>{k.struggles ?? k.note}</Text>
              </View>
            ) : null}
            {k.question ? (
              <View style={styles.said}>
                <Text variant="label" tone="muted">
                  Your question
                </Text>
                <Text>{k.question}</Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  col: { width: 72, textAlign: "right" },
  photos: { flexDirection: "row", gap: space[2] },
  said: { gap: space[1] / 2 },
  card: {
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  reply: {
    flexDirection: "row",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
