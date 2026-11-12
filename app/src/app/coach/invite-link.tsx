// Invite link and QR code (D63): moved out of Business's section tabs to make room for Instagram
// (D66). Opened from the QR button on Business.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { InvitePage } from "@/features/coach/BusinessPages";
import { PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function InviteLink() {
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
