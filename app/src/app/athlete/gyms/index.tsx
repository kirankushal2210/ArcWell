// Gyms (G-01; D25, D29): free for everyone, read-only. Search by name or area and filter by the
// equipment you need, then see them as a list or as an "around you" map (no map SDK: pins by
// distance and direction, and Open in Maps hands off to the phone's maps app). Sample build:
// made-up gyms until the licensed directory arrives; distances and directions are fixed for the
// sample, and sorting by your location comes with it (location stays optional).
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Chip, Text, TextField } from "@/components/primitives";
import { GYM_TAGS, SAMPLE_GYMS } from "@/features/athlete/gyms";
import { GymsMap } from "@/features/athlete/GymsMap";
import {
  backTo,
  InfoCard,
  MenuPage,
  NavRow,
} from "@/features/athlete/MenuParts";
import { Group, Pills } from "@/features/coach/parts";
import { space } from "@/theme";

export default function Gyms() {
  const [q, setQ] = useState("");
  const [need, setNeed] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "map">("list");
  const query = q.trim().toLowerCase();
  const list = SAMPLE_GYMS.filter(
    (g) =>
      (!query ||
        g.name.toLowerCase().includes(query) ||
        g.area.toLowerCase().includes(query)) &&
      need.every((t) => g.equipment.includes(t)),
  ).sort((a, b) => a.km - b.km);

  return (
    <MenuPage title="Gyms" back={backTo("/athlete/menu")}>
      <TextField
        placeholder="Search by name or area"
        value={q}
        onChangeText={setQ}
        accessibilityLabel="Search gyms"
      />
      <View style={styles.chips}>
        {GYM_TAGS.map((t) => (
          <Chip
            key={t}
            label={t}
            selected={need.includes(t)}
            onPress={() =>
              setNeed((xs) =>
                xs.includes(t) ? xs.filter((x) => x !== t) : [...xs, t],
              )
            }
          />
        ))}
      </View>
      <Pills
        value={view}
        onChange={setView}
        options={[
          { value: "list", label: "List" },
          { value: "map", label: "Map" },
        ]}
      />
      {!list.length ? (
        <InfoCard>No gyms match. Try fewer filters or another area.</InfoCard>
      ) : view === "map" ? (
        <GymsMap gyms={list} allKm={SAMPLE_GYMS.map((g) => g.km)} />
      ) : (
        <Group>
          {list.map((g, i) => (
            <NavRow
              key={g.id}
              first={i === 0}
              label={g.name}
              sub={`${g.area} · ${g.equipment.join(", ")}`}
              value={`${g.km.toFixed(1)} km`}
              onPress={() =>
                router.push({
                  pathname: "/athlete/gyms/[id]",
                  params: { id: g.id },
                })
              }
            />
          ))}
        </Group>
      )}
      <Text variant="caption" tone="muted">
        Sample gyms for this build. The real directory, with distances from
        where you are, comes with the gym data.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
});
