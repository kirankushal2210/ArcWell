// Chat with your coach (F7), for coached athletes: text and photos, quick lines for the usual
// questions, and "Seen" once your coach has opened it.
import { router } from "expo-router";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { useMe } from "@/features/athlete/useMe";
import { ChatThread } from "@/features/coach/ChatThread";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function AthleteChat() {
  const me = useMe();
  const { meTier, coachName, sendFromClient, markReadByClient } =
    useCoachData();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete");

  useEffect(() => {
    if (me?.coachUnread) markReadByClient(me.id);
  }, [me?.id, me?.coachUnread, markReadByClient]);

  if (!me || meTier !== "coached")
    return (
      <View style={styles.root}>
        <PageHeader title="Messages" onBack={back} />
        <Page>
          <Text tone="muted">Chat opens once you join a coach.</Text>
        </Page>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title={coachName} sub="Your coach" onBack={back} />
      <ChatThread
        messages={me.messages}
        me="client"
        otherName={coachName.replace(/^Coach\s+/, "")}
        seen={!me.unread}
        quick={[
          "Can I swap an exercise?",
          "I'll miss today's session.",
          "Feeling sore, should I rest?",
          "Eating out tonight, any tips?",
        ]}
        onSend={(text, image, file) => sendFromClient(me.id, text, image, file)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
