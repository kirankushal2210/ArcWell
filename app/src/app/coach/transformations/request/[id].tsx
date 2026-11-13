// Request photos (F9-02). With id "pick", first choose the client (only clients with check-in
// photos). Then pick before and after from their check-ins, suggest a caption, add a message and
// where you'd like to use it. Request only: nothing is visible to anyone until the athlete approves.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { Avatar, Button, Chip, Text, TextField } from "@/components/primitives";
import { type TransformUse, USES } from "@/features/athlete/athleteData";
import { InfoCard, MenuPage, NavRow } from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, Pills } from "@/features/coach/parts";
import { colors, space } from "@/theme";

const newId = () => `t${Date.now().toString(36)}`;
const today = () =>
  new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function RequestPhotos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, coachName, requestTransformation } = useCoachData();
  const c = clients.find((x) => x.id === id);
  const weeks = c
    ? [
        ...new Set([
          ...c.photoWeeks,
          ...c.checkIns.filter((k) => k.photos?.front).map((k) => k.week),
        ]),
      ].sort((a, b) => a - b)
    : [];
  const label = (w: number) => (w === 0 ? "Start" : `Week ${w}`);
  const [before, setBefore] = useState(String(weeks[0] ?? 0));
  const [after, setAfter] = useState(String(weeks[weeks.length - 1] ?? 0));
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState(
    "Your progress has been amazing. Would you be happy for me to share this?",
  );
  const [uses, setUses] = useState<TransformUse[]>(["profile"]);
  const close = () =>
    router.canGoBack()
      ? router.back()
      : router.replace("/coach/transformations");

  if (id === "pick" || !c) {
    const eligible = clients.filter(
      (x) => !x.pending && x.status !== "completed" && x.photoWeeks.length > 1,
    );
    return (
      <MenuPage title="Request photos" sub="Choose a client" back={close}>
        {eligible.length ? (
          <Group>
            {eligible.map((x, i) => (
              <NavRow
                key={x.id}
                first={i === 0}
                label={x.name}
                sub={`${x.photoWeeks.length} check-ins with photos`}
                onPress={() =>
                  router.replace({
                    pathname: "/coach/transformations/request/[id]",
                    params: { id: x.id },
                  })
                }
              />
            ))}
          </Group>
        ) : (
          <InfoCard>
            No client has two check-ins with photos yet. Requests need a before
            and an after.
          </InfoCard>
        )}
      </MenuPage>
    );
  }

  const first = c.name.split(" ")[0];
  const photoOf = (w: number) =>
    c.checkIns.find((k) => k.week === w)?.photos?.front;
  const send = () => {
    const b = Number(before);
    const a = Number(after);
    requestTransformation(c.id, {
      id: newId(),
      coachName,
      requestedAt: today(),
      before: { uri: photoOf(b), label: label(b) },
      after: { uri: photoOf(a), label: label(a) },
      caption: caption.trim(),
      message: message.trim(),
      uses,
      status: "waiting",
      blurFace: true,
      showName: false,
      crop: "full",
      onProfile: false,
    });
    router.replace("/coach/transformations");
  };
  const opts = weeks.map((w) => ({ value: String(w), label: label(w) }));

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <MenuPage
        title={`Request photos from ${first}`}
        back={close}
        footer={
          <Button
            label="Send request"
            fullWidth
            disabled={uses.length === 0 || before === after}
            onPress={send}
          />
        }
      >
        <View style={styles.who}>
          <Avatar name={c.name} />
          <Text tone="muted" style={styles.flex}>
            {first} decides. They can blur their face, change the caption or say
            no.
          </Text>
        </View>
        <Eyebrow>Before</Eyebrow>
        <Pills value={before} onChange={setBefore} options={opts} />
        <Eyebrow>After</Eyebrow>
        <Pills value={after} onChange={setAfter} options={opts} />
        <TextField
          label="Suggested caption"
          placeholder="For example: −7 kg in 12 weeks"
          value={caption}
          onChangeText={setCaption}
        />
        <TextField
          label={`Message to ${first}`}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Eyebrow>I&apos;d like to use it on</Eyebrow>
        <View style={styles.chips}>
          {USES.map((u) => (
            <Chip
              key={u.key}
              label={u.label}
              selected={uses.includes(u.key)}
              onPress={() =>
                setUses((s) =>
                  s.includes(u.key)
                    ? s.filter((x) => x !== u.key)
                    : [...s, u.key],
                )
              }
            />
          ))}
        </View>
      </MenuPage>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  who: { flexDirection: "row", alignItems: "center", gap: space[3] },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
});
