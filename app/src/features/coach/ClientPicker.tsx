// Pick several clients (assigning templates and stacks): a tick per row and a line of what each
// client has now.
import { Check } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Avatar, Text } from "@/components/primitives";
import { Group, GroupRow } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

import type { Client } from "./sampleData";

export function ClientPicker({
  clients,
  picked,
  onChange,
  current,
}: {
  clients: Client[];
  picked: string[];
  onChange: (ids: string[]) => void;
  current: (c: Client) => string;
}) {
  if (!clients.length)
    return (
      <Text tone="muted">
        No clients yet. Add one from Clients, or share your invite link.
      </Text>
    );
  return (
    <Group>
      {clients.map((c, i) => {
        const on = picked.includes(c.id);
        return (
          <GroupRow
            key={c.id}
            first={i === 0}
            onPress={() =>
              onChange(
                on ? picked.filter((x) => x !== c.id) : [...picked, c.id],
              )
            }
            label={`${c.name}${on ? ", selected" : ""}`}
          >
            <Avatar name={c.name} />
            <View style={styles.flex}>
              <Text weight="semibold">{c.name}</Text>
              <Text
                variant="label"
                weight="regular"
                tone="muted"
                numberOfLines={1}
              >
                {c.pending ? "Not joined yet · " : ""}
                {current(c)}
              </Text>
            </View>
            <View style={[styles.tick, on && styles.tickOn]}>
              {on ? (
                <Check size={16} strokeWidth={3} color={colors.onBrand} />
              ) : null}
            </View>
          </GroupRow>
        );
      })}
    </Group>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.sm - space[1] / 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.brand, borderColor: colors.brand },
});
