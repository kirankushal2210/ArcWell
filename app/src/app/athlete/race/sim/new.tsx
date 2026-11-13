// Start a race sim (D76): half sim, full sim or a real race; division; optional Roxzone timing; and
// swaps for missing kit, marked so they're never compared with real stations.
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Chip, Text } from "@/components/primitives";
import {
  backTo,
  InfoCard,
  MenuPage,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Group, Pills } from "@/features/coach/parts";
import {
  type DivisionKey,
  DIVISIONS,
  loadText,
  type StationKey,
  STATIONS,
} from "@/features/race/data";
import type { SimKind } from "@/features/race/sim";
import { useRace } from "@/features/race/useRace";
import { space } from "@/theme";

const SWAP: Partial<Record<StationKey, { kit: string; swap: string }>> = {
  skierg: { kit: "SkiErg", swap: "Rower 1,000 m" },
  sled_push: { kit: "Sled", swap: "Treadmill push, motor off" },
  sled_pull: { kit: "Sled", swap: "Heavy rope or band pull" },
  row: { kit: "Rower", swap: "Bike 2 km" },
  sandbag_lunges: { kit: "Sandbag", swap: "Dumbbell walking lunges" },
  wall_balls: { kit: "Wall-ball target", swap: "Dumbbell thrusters" },
};

export default function NewSim() {
  const rc = useRace();
  // The Race page's buttons open this with the sim already chosen.
  const { kind: asked } = useLocalSearchParams<{ kind?: string }>();
  const [kind, setKind] = useState<SimKind>(
    asked === "full" || asked === "race" ? asked : "half",
  );
  const [division, setDivision] = useState<DivisionKey>(
    rc.goal?.division ?? "open_women",
  );
  const [rox, setRox] = useState(false);
  const kit = rc.goal?.kit ?? [];
  const [subs, setSubs] = useState<Partial<Record<StationKey, string>>>(() => {
    const out: Partial<Record<StationKey, string>> = {};
    for (const [k, v] of Object.entries(SWAP))
      if (v && !kit.includes(v.kit)) out[k as StationKey] = v.swap;
    return out;
  });
  if (!rc.me) return <NotJoined />;
  if (rc.live) return <Redirect href="/athlete/race/sim/live" />;
  const div = DIVISIONS.find((d) => d.key === division)!;
  const stations = kind === "half" ? STATIONS.slice(0, 4) : STATIONS;

  return (
    <MenuPage title="Race sim" back={backTo("/athlete/training")}>
      <Pills
        value={kind}
        onChange={setKind}
        options={[
          { value: "half", label: "Half sim" },
          { value: "full", label: "Full sim" },
          { value: "race", label: "Real race" },
        ]}
      />
      <Text variant="caption" tone="muted">
        {kind === "half"
          ? "4 runs and the first 4 stations at race effort. Every 3 to 4 weeks while building."
          : kind === "full"
            ? "The whole race: once, 3 to 5 weeks before race day. Not in the final 10 days."
            : "Log a real race as you go, or right after."}
      </Text>
      <Eyebrow>Division</Eyebrow>
      <Pills
        value={division}
        onChange={setDivision}
        options={DIVISIONS.map((d) => ({ value: d.key, label: d.label }))}
      />
      <Group>
        <ToggleRow
          first
          label="Time the Roxzone"
          sub="Two taps per station: in and out. Off: transitions count in the next part."
          value={rox}
          onChange={setRox}
        />
      </Group>
      <Eyebrow>Stations</Eyebrow>
      {stations.map((s) => {
        const sw = SWAP[s.key];
        return (
          <View key={s.key} style={styles.station}>
            <Text weight="medium">{`${s.label}${div.loads[s.key] ? ` · ${loadText(div.loads[s.key])}` : ""}`}</Text>
            {sw ? (
              <View style={styles.wrap}>
                <Chip
                  label="Real station"
                  selected={!subs[s.key]}
                  onPress={() => setSubs((x) => ({ ...x, [s.key]: undefined }))}
                />
                <Chip
                  label={sw.swap}
                  selected={!!subs[s.key]}
                  onPress={() => setSubs((x) => ({ ...x, [s.key]: sw.swap }))}
                />
              </View>
            ) : null}
          </View>
        );
      })}
      <InfoCard>
        The screen stays on. One big button splits each part; undo is top right.
      </InfoCard>
      <Button
        label="Start"
        fullWidth
        onPress={() => {
          rc.start(kind, division, rox, subs);
          router.replace("/athlete/race/sim/live");
        }}
      />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  station: { gap: space[1] },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
});
