// Message several clients (FE-5): one message sent to each chosen client as their own private
// chat message (no group chats; replies come back one to one). Pick by group or one by one.
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import {
  Avatar,
  Button,
  PressableScale,
  Text,
  TextField,
} from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow, Pills } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Pick = "all" | "attention" | "paused" | "custom";

export default function Broadcast() {
  const { clients, send } = useCoachData();
  const linked = clients.filter((c) => !c.pending && c.status !== "completed");
  const [pick, setPick] = useState<Pick>("all");
  const [chosen, setChosen] = useState<string[]>(linked.map((c) => c.id));
  const [text, setText] = useState("");
  const [sent, setSent] = useState<number | null>(null);
  const back = backTo("/coach/messages");

  const choose = (p: Pick) => {
    setPick(p);
    if (p === "custom") return;
    setChosen(
      linked
        .filter((c) =>
          p === "all"
            ? true
            : p === "paused"
              ? c.status === "paused"
              : !!c.attention,
        )
        .map((c) => c.id),
    );
  };
  const toggle = (id: string) => {
    setPick("custom");
    setChosen((xs) =>
      xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id],
    );
  };

  if (sent !== null)
    return (
      <MenuPage
        title="Message sent"
        back={back}
        footer={
          <Button
            label="Back to Messages"
            fullWidth
            onPress={() => router.replace("/coach/messages")}
          />
        }
      >
        <InfoCard>
          {`Sent to ${sent} ${sent === 1 ? "client" : "clients"}. Each one got it in their own chat, and replies come back to you one by one.`}
        </InfoCard>
      </MenuPage>
    );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <MenuPage
        title="Message several clients"
        back={back}
        footer={
          <Button
            label={`Send to ${chosen.length} ${chosen.length === 1 ? "client" : "clients"}`}
            fullWidth
            disabled={!text.trim() || chosen.length === 0}
            onPress={() => {
              for (const id of chosen) send(id, text.trim());
              setSent(chosen.length);
            }}
          />
        }
      >
        <TextField
          label="Message"
          placeholder="For example: Check-ins are due Sunday. Photos in the same light as last week."
          value={text}
          onChangeText={setText}
          multiline
        />
        <Eyebrow>Send to</Eyebrow>
        <Pills
          value={pick}
          onChange={choose}
          options={[
            { value: "all", label: `Everyone · ${linked.length}` },
            {
              value: "attention",
              label: `Needs attention · ${linked.filter((c) => c.attention).length}`,
            },
            {
              value: "paused",
              label: `Paused · ${linked.filter((c) => c.status === "paused").length}`,
            },
            { value: "custom", label: "Choose" },
          ]}
        />
        <Group>
          {linked.map((c, i) => {
            const on = chosen.includes(c.id);
            return (
              <GroupRow key={c.id} first={i === 0}>
                <PressableScale
                  onPress={() => toggle(c.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={c.name}
                  style={styles.row}
                >
                  <Avatar name={c.name} />
                  <Text weight="medium" style={styles.flex}>
                    {c.name}
                  </Text>
                  <View style={[styles.box, on && styles.boxOn]}>
                    {on ? (
                      <Check
                        size={16}
                        strokeWidth={3}
                        color={colors.onAccent}
                      />
                    ) : null}
                  </View>
                </PressableScale>
              </GroupRow>
            );
          })}
        </Group>
      </MenuPage>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flex: 1, flexDirection: "row", alignItems: "center", gap: space[3] },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
