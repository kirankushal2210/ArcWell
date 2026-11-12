// Coaching status (D39, K-29, K-30): active, paused, leaving or completed, with what each one
// does. Completing ends your access at once; the client keeps their history and your plan
// read-only and becomes a free athlete (SPEC: relationships). A client who never joined can be
// removed instead.
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import {
  Button,
  type ClientStatus,
  PressableScale,
  Text,
  TextField,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

const OPTIONS: { value: ClientStatus; label: string; what: string }[] = [
  {
    value: "active",
    label: "Active",
    what: "Coaching as normal: plans, check-ins, reminders and chat.",
  },
  {
    value: "paused",
    label: "Paused",
    what: "For holidays or illness. Plans stay in their app; check-in reminders stop and adherence isn't counted. They still use a client spot.",
  },
  {
    value: "leaving",
    label: "Leaving",
    what: "They've told you they're stopping. Coaching carries on until you complete them, so you can finish the cycle well.",
  },
  {
    value: "completed",
    label: "Completed",
    what: "Coaching has ended. Your access stops at once and frees their spot. They keep all their history and your plan, read-only, and become a free athlete.",
  },
];

export default function ClientStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, setStatus, setStatusDetails, removeClient } = useCoachData();
  const c = client(id);
  const [until, setUntil] = useState(c?.statusUntil ?? "");
  const [note, setNote] = useState(c?.statusNote ?? "");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  if (!c) return <PageHeader title="Client not found" onBack={back} />;
  const first = c.name.split(" ")[0];

  const pick = (s: ClientStatus) => {
    if (s === c.status) return;
    if (s !== "completed") {
      setStatus(c.id, s);
      return;
    }
    Alert.alert(
      `Complete coaching with ${first}?`,
      `You won't see ${first}'s new workouts, food, recovery or check-ins. ${first} keeps everything and your plan stays in their app, read-only. You can't undo this; they'd need a new invite to come back.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          style: "destructive",
          onPress: () => {
            setStatus(c.id, "completed");
            back();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <PageHeader title="Coaching status" sub={c.name} onBack={back} />
      <Page>
        {c.pending ? (
          <>
            <Text tone="muted">
              {first} hasn&apos;t joined yet, so there&apos;s no coaching to
              change. If they&apos;re not going ahead, remove them; their invite
              stops working.
            </Text>
            <Button
              label={`Remove ${first}`}
              variant="secondary"
              fullWidth
              onPress={() =>
                Alert.alert(
                  `Remove ${first}?`,
                  "Their plans and invite are deleted.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () => {
                        removeClient(c.id);
                        if (router.canDismiss()) router.dismissAll();
                        router.replace("/coach");
                      },
                    },
                  ],
                )
              }
            />
          </>
        ) : (
          OPTIONS.map((o) => {
            const on = c.status === o.value;
            const locked = c.status === "completed" && !on;
            return (
              <PressableScale
                key={o.value}
                onPress={() => !locked && pick(o.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, disabled: locked }}
                accessibilityLabel={`${o.label}. ${o.what}`}
                style={[styles.option, on && styles.optionOn]}
              >
                <View style={styles.flex}>
                  <Text
                    weight="semibold"
                    tone={locked ? "disabled" : "default"}
                  >
                    {o.label}
                  </Text>
                  <Text
                    variant="label"
                    weight="regular"
                    tone={locked ? "disabled" : "muted"}
                  >
                    {o.what}
                  </Text>
                </View>
                {on ? (
                  <Check size={20} strokeWidth={2.75} color={colors.text} />
                ) : null}
              </PressableScale>
            );
          })
        )}
        {!c.pending && (c.status === "paused" || c.status === "leaving") ? (
          <>
            <TextField
              label={
                c.status === "paused"
                  ? "Paused until (optional)"
                  : "Coaching ends on"
              }
              placeholder="For example: 30 Nov"
              value={until}
              onChangeText={setUntil}
            />
            <TextField
              label={`Note to ${first} (optional)`}
              placeholder={
                c.status === "paused"
                  ? "For example: Check-ins paused while you travel."
                  : "For example: Let's finish this cycle strong."
              }
              value={note}
              onChangeText={setNote}
            />
            <Button
              label="Save"
              variant="secondary"
              fullWidth
              onPress={() => {
                setStatusDetails(c.id, until, note);
                back();
              }}
            />
            <Text variant="caption" tone="muted">
              {first} sees this on Today.
            </Text>
          </>
        ) : null}
        {c.status === "completed" ? (
          <Text variant="caption" tone="muted">
            To coach {first} again, send them a new invite with Add a client.
          </Text>
        ) : null}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.text },
});
