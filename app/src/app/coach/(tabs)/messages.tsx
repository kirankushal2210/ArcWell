// Messages tab (F7): one conversation per client. Unread first, then the newest; search by name and
// filter to unread. Clients you haven't written to yet sit under "Start a conversation".
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar, Text, TextField } from "@/components/primitives";
import { menuAction } from "@/features/coach/coachProfile";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
  Pills,
} from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Filter = "all" | "unread";

export default function MessagesTab() {
  const { clients } = useCoachData();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const live = clients.filter(
    (c) => !c.pending && c.status !== "completed" && c.id !== "me",
  );
  const match = (name: string) =>
    !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase());
  const threads = live
    .filter((c) => c.messages.length > 0 && match(c.name))
    .filter((c) => filter === "all" || c.unread > 0)
    .sort((a, b) =>
      b.unread !== a.unread
        ? b.unread - a.unread
        : (b.messages[b.messages.length - 1]?.at ?? "").localeCompare(
            a.messages[a.messages.length - 1]?.at ?? "",
          ),
    );
  const quiet = live.filter((c) => c.messages.length === 0 && match(c.name));
  const unread = live.filter((c) => c.unread > 0).length;
  const open = (id: string) =>
    router.push({ pathname: "/coach/chat/[id]", params: { id } });

  return (
    <View style={styles.root}>
      <PageHeader title="Messages" actions={[menuAction]} />
      <Page>
        <TextField
          value={q}
          onChangeText={setQ}
          placeholder="Search clients"
          leadingIcon={Search}
          autoCorrect={false}
          accessibilityLabel="Search clients"
        />
        <Pills<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: `Unread · ${unread}` },
          ]}
        />
        {threads.length ? (
          <Group>
            {threads.map((c, i) => {
              const last = c.messages[c.messages.length - 1];
              return (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() => open(c.id)}
                  label={`${c.name}${c.unread ? `, ${c.unread} unread` : ""}: ${last.text || "Photo"}`}
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
                      {last.text || "Photo"}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text variant="caption" tone="muted">
                      {last.time}
                    </Text>
                    {c.unread ? (
                      <View style={styles.badge}>
                        <Text
                          variant="caption"
                          weight="semibold"
                          tone="onBrand"
                          numeric
                        >
                          {c.unread}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </GroupRow>
              );
            })}
          </Group>
        ) : (
          <Text tone="muted">
            {filter === "unread" ? "All caught up." : "No conversations yet."}
          </Text>
        )}
        {filter === "all" && quiet.length ? (
          <>
            <Eyebrow>Start a conversation</Eyebrow>
            <Group>
              {quiet.map((c, i) => (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() => open(c.id)}
                  label={`Message ${c.name}`}
                >
                  <Avatar name={c.name} />
                  <Text weight="medium" style={styles.flex}>
                    {c.name}
                  </Text>
                </GroupRow>
              ))}
            </Group>
          </>
        ) : null}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  right: { alignItems: "flex-end", gap: space[1] },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: space[1],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
});
