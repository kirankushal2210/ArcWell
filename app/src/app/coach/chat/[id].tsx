// Chat with one client (text only in this shell; image and PDF attachments come in Phase 4).
import { router, useLocalSearchParams } from "expo-router";
import { Send, UserRound } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { PageHeader } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, send, markRead } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const scroll = useRef<ScrollViewInstance>(null);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/messages");

  useEffect(() => {
    if (c?.unread) markRead(c.id);
  }, [c?.id, c?.unread, markRead]);

  if (!c) return <PageHeader title="Chat" onBack={back} />;

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    send(c.id, t);
    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={c.name}
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
      <ScrollView
        ref={scroll}
        style={styles.flex}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() =>
          scroll.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        {c.messages.length === 0 ? (
          <Text tone="muted" style={styles.empty}>
            Say hello to {c.name.split(" ")[0]}.
          </Text>
        ) : null}
        {c.messages.map((m, i) => {
          const mine = m.from === "coach";
          return (
            <View
              key={i}
              style={[styles.bubble, mine ? styles.mine : styles.theirs]}
            >
              <Text tone={mine ? "onBrand" : "default"}>{m.text}</Text>
              <Text
                variant="caption"
                tone={mine ? "onBrand" : "muted"}
                style={styles.time}
              >
                {m.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, space[2]) },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          accessibilityLabel={`Message ${c.name}`}
        />
        <IconButton
          icon={Send}
          variant="filled"
          accessibilityLabel="Send"
          disabled={!text.trim()}
          onPress={submit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  thread: { padding: rhythm.gutter, gap: space[2] },
  empty: { textAlign: "center", paddingVertical: space[6] },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.lg,
    gap: space[1] / 2,
  },
  mine: { alignSelf: "flex-end", backgroundColor: colors.brand },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.surface },
  time: { opacity: 0.7, alignSelf: "flex-end" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[2],
    paddingHorizontal: space[3],
    paddingTop: space[2],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
