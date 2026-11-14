// Chat with one client (F7): text and photos, quick replies, and "Seen" once the client has
// opened it. The person icon opens their profile.
import { router, useLocalSearchParams } from "expo-router";
import { UserRound } from "lucide-react-native";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { ChatThread } from "@/features/coach/ChatThread";
import { dueText } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import { PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";
import { NotFound } from "@/features/system/SystemStates";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, send, markRead } = useCoachData();
  const c = client(id);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/messages");

  useEffect(() => {
    if (c?.unread) markRead(c.id);
  }, [c?.id, c?.unread, markRead]);

  if (!c) return <NotFound title="Chat" what="client" onBack={back} />;
  const first = c.name.split(" ")[0];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={c.name}
        sub={`Check-in: ${dueText(c)}`}
        onBack={back}
        actions={[
          {
            icon: UserRound,
            label: "Open client profile",
            onPress: () =>
              router.push({
                pathname: "/coach/client/[id]",
                params: { id: c.id },
              }),
          },
        ]}
      />
      <ChatThread
        messages={c.messages}
        me="coach"
        otherName={first}
        seen={!c.coachUnread}
        quick={[
          `How's the week going, ${first}?`,
          "Check-in's due. Photos in the same spot please.",
          "Nice work today!",
          "Let's talk on a call this week.",
        ]}
        onSend={(text, image, file) => send(c.id, text, image, file)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
