// Invite link and QR code (D63): moved out of Business's section tabs to make room for Instagram
// (D66). Opened from the QR button on Business.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { InvitePage } from "@/features/coach/BusinessPages";
import { PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";
import { InviteBlocked, useCoachLimits } from "@/features/coach/limits";

function InviteLinkScreen() {
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/business");
  return (
    <View style={styles.root}>
      <PageHeader title="Invite link" onBack={back} />
      <InvitePage />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});

/** At the client limit (K-25) or with billing lapsed (K-27), new clients can't be added. */
export default function InviteLink() {
  const { blocked } = useCoachLimits();
  return blocked ? <InviteBlocked title="Invite link" /> : <InviteLinkScreen />;
}
