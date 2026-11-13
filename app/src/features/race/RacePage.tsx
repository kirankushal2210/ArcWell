// The Race section (D76, D83): Training's 4th section tab, only while a race goal is active. Kept to
// a countdown and buttons: each HYROX workout in the plan, a half or full race sim, and the last sim.
// Details (splits, station bests, predicted time) live on the sim pages.
import { router } from "expo-router";
import { ChevronRight, Flag, Play } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { PHASE_LABEL } from "@/features/science/hybrid";
import { colors, radius, space } from "@/theme";

import { divisionOf } from "./data";
import { breakdown, fmtTime } from "./sim";
import { useRace } from "./useRace";

export function SimBar({ sim }: { sim: Parameters<typeof breakdown>[0] }) {
  const b = breakdown(sim);
  const total = Math.max(1, b.run + b.station + b.roxzone);
  return (
    <View style={styles.gapS}>
      <View style={styles.bar}>
        <View
          style={[
            styles.seg,
            { flex: b.run / total, backgroundColor: colors.training },
          ]}
        />
        <View
          style={[
            styles.seg,
            { flex: b.station / total, backgroundColor: colors.recovery },
          ]}
        />
        {b.roxzone ? (
          <View
            style={[
              styles.seg,
              { flex: b.roxzone / total, backgroundColor: colors.textMuted },
            ]}
          />
        ) : null}
      </View>
      <Text variant="caption" tone="muted" numeric>
        {`Runs ${fmtTime(b.run)} · Stations ${fmtTime(b.station)}${b.roxzone ? ` · Roxzone ${fmtTime(b.roxzone)}` : ""}`}
      </Text>
    </View>
  );
}

export function RacePage() {
  const rc = useRace();
  if (!rc.goal || rc.days === null || !rc.phase || !rc.me) return null;
  const div = divisionOf(rc.goal.division);
  const days = rc.me.program?.days ?? [];
  const open = (dayId: string) =>
    router.push({
      pathname: "/athlete/workout/preview/[dayId]",
      params: { dayId },
    });
  const sim = (kind: "half" | "full") =>
    router.push({ pathname: "/athlete/race/sim/new", params: { kind } });
  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.row}>
          <Flag size={16} color={colors.training} />
          <Text variant="label" tone="muted" style={styles.flex}>
            {`${PHASE_LABEL[rc.phase]} · ${div.label}`}
          </Text>
          <Text
            variant="label"
            tone="muted"
            onPress={() => router.push("/athlete/race/setup")}
          >
            Edit
          </Text>
        </View>
        <Text style={styles.big}>
          {rc.days > 13
            ? `${Math.ceil(rc.days / 7)} weeks to race day`
            : rc.days > 0
              ? `${rc.days} days to race day`
              : "Race day"}
        </Text>
      </View>

      <Eyebrow>Start a HYROX workout</Eyebrow>
      <Group>
        {days.map((d, i) => (
          <GroupRow
            key={d.id}
            first={i === 0}
            onPress={() => open(d.id)}
            label={`Start ${d.name}`}
          >
            <View style={styles.icon}>
              <Play size={16} color={colors.onBrand} />
            </View>
            <Text weight="semibold" style={styles.flex}>
              {d.name}
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
        ))}
        {(["half", "full"] as const).map((k, i) => (
          <GroupRow
            key={k}
            first={!days.length && i === 0}
            onPress={() => sim(k)}
            label={`Start a ${k} race sim`}
          >
            <View style={styles.icon}>
              <Flag size={16} color={colors.onBrand} />
            </View>
            <Text weight="semibold" style={styles.flex}>
              {k === "half" ? "Half race sim" : "Full race sim"}
            </Text>
            {rc.due === k ? (
              <Text variant="caption" tone="accent">
                Due
              </Text>
            ) : null}
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
        ))}
      </Group>

      {rc.lastSim ? (
        <Group>
          <GroupRow
            first
            onPress={() =>
              router.push({
                pathname: "/athlete/race/sim/[id]",
                params: { id: rc.lastSim!.id },
              })
            }
            label={`Last sim ${fmtTime(rc.lastSim.totalSec)}. Open`}
          >
            <Text style={styles.flex}>Last sim</Text>
            <Text weight="semibold" numeric>
              {fmtTime(rc.lastSim.totalSec)}
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
        </Group>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: space[3] },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  icon: {
    width: space[8],
    height: space[8],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[1],
  },
  big: { fontSize: 22, lineHeight: 28, fontWeight: "800" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[2],
  },
  gapS: { gap: space[1] },
  bar: {
    flexDirection: "row",
    height: space[2] + space[1] / 2,
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  seg: { height: "100%" },
});
