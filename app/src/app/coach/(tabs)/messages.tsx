// Messages tab: one conversation per client, newest first, unread marked.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Avatar, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function MessagesTab() {
  const { clients } = useCoachData();
  const threads = clients
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => b.unread - a.unread);

  return (
    <View style={styles.root}>
      <PageHeader title="Messages" />
      <Page>
        {threads.length ? (
          <Group>
            {threads.map((c, i) => {
              const last = c.messages[c.messages.length - 1];
              return (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() =>
                    router.push({
                      pathname: "/coach/chat/[id]",
                      params: { id: c.id },
                    })
                  }
                  label={`${c.name}${c.unread ? ", unread" : ""}: ${last.text}`}
                >
                  <Avatar name={c.name} />
                  <View style={styles.flex}>
                    <Text weight={c.unread ? "bold" : "semibold"}>
                      {c.name}
                    </Text>
                    <Text
                      variant="label"
                      weight="regular"
                      tone={c.unread ? "default" : "muted"}
                      numberOfLines={1}
                    >
                      {last.from === "coach" ? "You: " : ""}
                      {last.text}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text variant="caption" tone="muted">
                      {last.time}
                    </Text>
                    {c.unread ? <View style={styles.unread} /> : null}
                  </View>
                </GroupRow>
              );
            })}
          </Group>
        ) : (
          <Text tone="muted">No conversations yet.</Text>
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  right: { alignItems: "flex-end", gap: space[1] },
  unread: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
  },
});
