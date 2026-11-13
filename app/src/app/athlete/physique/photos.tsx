// Progress photos (PH-03): front, side or back, newest first, with the first and latest side by
// side, or any two dates the athlete picks to compare. Photos from weekly check-ins show here too. Private: only the athlete, and their coach if
// they have one. Optional photo consent never blocks anything else (D12).
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { dayText } from "@/features/athlete/athleteData";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { type PhotoPose, POSES } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Pills } from "@/features/coach/parts";
import { choosePhoto, PhotoSlot } from "@/features/coach/PhotoSlot";
import { colors, radius, space } from "@/theme";

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
  const [comparing, setComparing] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
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
  // The pair shown on top: any two the athlete picked (older first), else first and latest.
  const chosen = shots.filter((x) => picked.includes(x.key));
  const pair =
    chosen.length === 2
      ? [chosen[1], chosen[0]]
      : [shots[shots.length - 1], shots[0]];
  const pick = (key: string) =>
    setPicked((xs) =>
      xs.includes(key) ? xs.filter((x) => x !== key) : [...xs, key].slice(-2),
    );
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
          <View style={styles.head}>
            <Eyebrow>
              {pair.length === 2 && picked.length === 2
                ? "Your comparison"
                : "First and latest"}
            </Eyebrow>
            <Text
              variant="label"
              weight="medium"
              accessibilityRole="button"
              onPress={() => {
                setComparing((c) => !c);
                setPicked([]);
              }}
            >
              {comparing ? "Done" : "Compare any two"}
            </Text>
          </View>
          <View style={styles.row}>
            <PhotoSlot uri={pair[0].uri} label={pair[0].label} />
            <PhotoSlot uri={pair[1].uri} label={pair[1].label} />
          </View>
          <Eyebrow>{comparing ? "Tap two photos to compare" : "All"}</Eyebrow>
        </>
      ) : null}
      {pairs.length ? (
        pairs.map((p) => (
          <View key={p[0].key} style={styles.row}>
            {p.map((s) =>
              comparing ? (
                <PressableScale
                  key={s.key}
                  onPress={() => pick(s.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: picked.includes(s.key) }}
                  accessibilityLabel={`Compare ${s.label}`}
                  style={[
                    styles.pickable,
                    picked.includes(s.key) && styles.picked,
                  ]}
                >
                  <PhotoSlot uri={s.uri} label={s.label} still />
                </PressableScale>
              ) : (
                <PhotoSlot key={s.key} uri={s.uri} label={s.label} />
              ),
            )}
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
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickable: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  picked: { borderColor: colors.text },
});
