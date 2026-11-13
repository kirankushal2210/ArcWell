// The athlete on this device: a coached client who claimed an invite, or a self-guided athlete whose
// plan came from onboarding (D57). With accounts it becomes the signed-in user.
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { ActionDock, Page } from "@/features/coach/parts";
import { colors, rhythm, space } from "@/theme";

export function useMe() {
  const { meId, meTier, self, client } = useCoachData();
  if (meTier !== "coached") return self ?? undefined;
  return meId ? client(meId) : undefined;
}

/** Page for athlete tabs; `dock` leaves room at the end for an action dock (D67). */
export function AthletePage({
  children,
  dock = false,
}: {
  children: ReactNode;
  dock?: boolean;
}) {
  return <Page clearDock={dock}>{children}</Page>;
}

/**
 * An athlete tab's one main action above the tab bar (D67). While a workout runs, the workout bar
 * takes this spot, so the dock steps aside.
 */
export function AthleteDock(props: ComponentProps<typeof ActionDock>) {
  const { active } = useCoachData();
  if (active) return null;
  return <ActionDock {...props} />;
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
