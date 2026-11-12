// Progress photos (PH-03): front, side or back, newest first, with the first and latest side by
// side. Photos from weekly check-ins show here too. Private: only the athlete, and their coach if
// they have one. Optional photo consent never blocks anything else (D12).
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { dayText } from "@/features/athlete/athleteData";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { type PhotoPose, POSES } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Pills } from "@/features/coach/parts";
import { choosePhoto, PhotoSlot } from "@/features/coach/PhotoSlot";
import { colors, space } from "@/theme";

type Shot = { key: string; uri: string; label: string; sort: string };

export default function Photos() {
  const me = useMe();
  const {
    meTier,
    coachName,
    settingsOf,
    setAthleteSettings,
    addProgressPhoto,
  } = useCoachData();
  const [pose, setPose] = useState<PhotoPose>("front");
  if (!me) return <NotJoined />;
  const allowed = settingsOf(me.id).photos;
  const shots: Shot[] = [
    ...me.checkIns
      .filter((k) => k.photos?.[pose])
      .map((k) => ({
        key: k.id,
        uri: k.photos?.[pose] as string,
        label: k.week === 0 ? "Start" : `Week ${k.week}`,
        sort: k.at ?? String(k.week).padStart(4, "0"),
      })),
    ...(me.progressPhotos ?? [])
      .filter((p) => p.pose === pose)
      .map((p) => ({
        key: p.id,
        uri: p.uri,
        label: dayText(p.date),
        sort: p.date,
      })),
  ].sort((a, b) => b.sort.localeCompare(a.sort));
  const pairs: Shot[][] = [];
  for (let i = 0; i < shots.length; i += 2) pairs.push(shots.slice(i, i + 2));
  const add = () => choosePhoto((uri) => addProgressPhoto(me.id, pose, uri));

  if (!allowed)
    return (
      <MenuPage title="Photos" back={backTo("/athlete/menu")}>
        <View style={styles.hero}>
          <Camera size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            See your progress, not just numbers
          </Text>
          <Text tone="muted" style={styles.center}>
            Front, side and back photos, kept private to you
            {meTier === "coached" ? ` and ${coachName}` : ""}. Optional:
            everything else works without them.
          </Text>
          <Button
            label="Allow progress photos"
            fullWidth
            onPress={() => setAthleteSettings(me.id, { photos: true })}
          />
        </View>
      </MenuPage>
    );

  return (
    <MenuPage
      title="Photos"
      back={backTo("/athlete/menu")}
      footer={<Button label="Add photo" fullWidth onPress={add} />}
    >
      <Pills
        value={pose}
        onChange={setPose}
        options={POSES.map((p) => ({ value: p.key, label: p.label }))}
      />
      {shots.length > 1 ? (
        <>
          <Eyebrow>First and latest</Eyebrow>
          <View style={styles.row}>
            <PhotoSlot
              uri={shots[shots.length - 1].uri}
              label={shots[shots.length - 1].label}
            />
            <PhotoSlot uri={shots[0].uri} label={shots[0].label} />
          </View>
          <Eyebrow>All</Eyebrow>
        </>
      ) : null}
      {pairs.length ? (
        pairs.map((p) => (
          <View key={p[0].key} style={styles.row}>
            {p.map((s) => (
              <PhotoSlot key={s.key} uri={s.uri} label={s.label} />
            ))}
            {p.length === 1 ? <View style={styles.flex} /> : null}
          </View>
        ))
      ) : (
        <InfoCard title="No photos yet">
          Take one in the same spot and light each time, and the changes are
          easy to see.
        </InfoCard>
      )}
      <InfoCard>
        {meTier === "coached"
          ? `Private. Only you and ${coachName} can see these.`
          : "Private. Only you can see these."}
      </InfoCard>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[3], paddingTop: space[6] },
  row: { flexDirection: "row", gap: space[2] },
});
