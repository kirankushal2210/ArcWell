// Delete account (AC-04): permanent, typed confirmation. Deleting doesn't cancel Google Play
// billing (D19, D36); a coached athlete's coach loses access. Sample build: clears this phone.
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { Text, TextField } from "@/components/primitives";
import {
  backTo,
  ConfirmButtons,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { colors } from "@/theme";
import { useAccountActions } from "@/features/accounts/useAccountActions";

export default function DeleteAccount() {
  const me = useMe();
  const { meTier, coachName, resetSample } = useCoachData();
  const account = useAccountActions();
  const [typed, setTyped] = useState("");
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/menu/account");
  const ok = typed.trim().toUpperCase() === "DELETE";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <MenuPage
        title="Delete account"
        back={back}
        footer={
          <ConfirmButtons
            label="Delete my account"
            destructive
            disabled={!ok}
            onConfirm={async () => {
              // With accounts, the server deletes everything; signing out returns to the sample.
              if (account.live) {
                if (!(await account.deleteNow())) return;
              } else resetSample();
              if (router.canDismiss()) router.dismissAll();
              router.replace("/");
            }}
            cancel="Keep my account"
            onCancel={back}
          />
        }
      >
        <Text variant="title">Delete your Arcwell account?</Text>
        <Text tone="muted">
          This permanently deletes your profile, logs, photos, check-ins and
          messages. It can&apos;t be undone.
        </Text>
        {meTier === "pro" ? (
          <InfoCard title="Paying for AI?">
            Deleting your account doesn&apos;t cancel Google Play billing.
            Cancel your subscription in the Play Store first.
          </InfoCard>
        ) : null}
        {meTier === "coached" ? (
          <InfoCard title="Coached?">
            {`${coachName} will lose access to your data.`}
          </InfoCard>
        ) : null}
        <InfoCard title="Want a copy first?">
          <Text
            weight="medium"
            onPress={() => router.push("/athlete/menu/export")}
            accessibilityRole="link"
          >
            Export my data
          </Text>
        </InfoCard>
        <TextField
          label="Type DELETE to confirm"
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text variant="caption" tone="muted">
          Sample build: this clears everything on this phone.
        </Text>
      </MenuPage>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
