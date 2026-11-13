// Delete coach account (K-28, D42): every client is unlinked at once and moves to the free plan with
// their history and the coach's plans read-only, and is told so (K-29). Templates, notes, leads and
// transformations are deleted. Typed confirmation. Sample build: the coach side starts over.
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { Text, TextField } from "@/components/primitives";
import {
  backTo,
  Bullets,
  ConfirmButtons,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import { colors } from "@/theme";

export default function DeleteCoachAccount() {
  const { clients, closeCoachAccount } = useCoachData();
  const [typed, setTyped] = useState("");
  const back = backTo("/coach/menu/settings");
  const joined = clients.filter(
    (c) => !c.pending && c.status !== "completed",
  ).length;
  const ok = typed.trim().toUpperCase() === "DELETE";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <MenuPage
        title="Delete coach account"
        back={back}
        footer={
          <ConfirmButtons
            label="Delete my coach account"
            destructive
            disabled={!ok}
            onConfirm={() => {
              closeCoachAccount();
              if (router.canDismiss()) router.dismissAll();
              router.replace("/");
            }}
            cancel="Keep my account"
            onCancel={back}
          />
        }
      >
        <Text variant="title">Delete your coach account?</Text>
        <InfoCard>
          <Bullets
            items={[
              `All ${joined} ${joined === 1 ? "client moves" : "clients move"} to the free plan and ${joined === 1 ? "is" : "are"} told by notification`,
              "They keep their history and your plans, read-only",
              "Your templates, notes, leads and transformations are deleted",
              "This can't be undone",
            ]}
          />
        </InfoCard>
        <InfoCard>
          Paying through Razorpay? Cancel your subscription link too; deleting
          the account doesn&apos;t stop it.
        </InfoCard>
        <TextField
          label="Type DELETE to confirm"
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text variant="caption" tone="muted">
          Sample build: your clients and their app on this phone follow along.
        </Text>
      </MenuPage>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
