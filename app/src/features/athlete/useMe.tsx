// The athlete on this device: a coached client who claimed an invite, or a self-guided athlete whose
// plan came from onboarding (D57). With accounts it becomes the signed-in user.
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Page } from "@/features/coach/parts";
import { colors, rhythm, space } from "@/theme";

export function useMe() {
  const { meId, meTier, self, client } = useCoachData();
  if (meTier !== "coached") return self ?? undefined;
  return meId ? client(meId) : undefined;
}

/** Page for athlete tabs: leaves room for the floating AI button when it shows (D57). */
export function AthletePage({ children }: { children: ReactNode }) {
  const { meTier } = useCoachData();
  return <Page clearFloating={meTier !== "coached"}>{children}</Page>;
}

export function NotJoined() {
  return (
    <View style={styles.wrap}>
      <KeyRound size={40} strokeWidth={1.6} color={colors.text} />
      <Text variant="title" style={styles.center}>
        Join your coach first
      </Text>
      <Text tone="muted" style={styles.center}>
        Open the invite link your coach sent, or enter the code from their
        message.
      </Text>
      <Button label="Enter invite code" onPress={() => router.push("/join")} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[3],
    padding: rhythm.gutter,
    backgroundColor: colors.bg,
  },
  center: { textAlign: "center" },
});
