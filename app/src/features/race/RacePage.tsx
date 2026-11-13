// The Race section (D76): Training's 4th section tab, only while a race goal is active. Countdown and
// phase, this week's key sessions, the last sim split into runs, stations and Roxzone, station bests
// and a predicted range.
import { router } from "expo-router";
import { Flag } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { InfoCard } from "@/features/athlete/MenuParts";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { WhyThis } from "@/features/science/WhyThis";
import { PHASE_LABEL, PHASE_TEXT } from "@/features/science/hybrid";
import { colors, radius, space } from "@/theme";

import {
  divisionOf,
  loadText,
  type StationKey,
  stationOf,
  STATIONS,
} from "./data";

const WEAK_LABEL: Record<string, string> = {
  running: "running speed",
  fade: "holding pace on later runs",
  roxzone: "Roxzone transitions",
};
import { breakdown, fmtTime, predict, stationBests } from "./sim";
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
  const pred = predict(rc.sims);
  const bests = stationBests(rc.sims);
  const div = divisionOf(rc.goal.division);
  const weekDays = (rc.me.program?.days ?? []).slice(0, 4);
  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.row}>
          <Flag size={16} color={colors.training} />
          <Text variant="label" weight="semibold" style={styles.flex}>
            {`${PHASE_LABEL[rc.phase]} phase · ${div.label}${rc.goal.level === "first" ? " · first race" : rc.goal.level === "advanced" ? " · advanced" : ""}`}
          </Text>
          <Text
            variant="caption"
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
        <Text variant="caption" tone="muted">
          {[
            rc.goal.date,
            pred
              ? `predicted ${fmtTime(pred[0])}–${fmtTime(pred[1])}`
              : "log a sim to see a predicted time",
          ].join(" · ")}
        </Text>
        {rc.goal.prevSec || rc.goal.targetSec ? (
          <Text variant="label" weight="semibold" numeric>
            {[
              rc.goal.prevSec ? `Best ${fmtTime(rc.goal.prevSec)}` : null,
              rc.goal.targetSec ? `target ${fmtTime(rc.goal.targetSec)}` : null,
            ]
              .filter(Boolean)
              .join(" → ")}
          </Text>
        ) : null}
        {rc.goal.weak?.length ? (
          <Text variant="caption" tone="muted">
            {`Your plan works on: ${rc.goal.weak.map((w) => WEAK_LABEL[w] ?? stationOf(w as StationKey).label).join(", ")}`}
          </Text>
        ) : rc.goal.level === "first" ? (
          <Text variant="caption" tone="muted">
            First race: station technique early, running built up gradually.
          </Text>
        ) : null}
        <Text variant="caption" tone="muted">
          {PHASE_TEXT[rc.phase]}
        </Text>
      </View>

      {rc.due ? (
        <InfoCard
          title={
            rc.due === "full" ? "Time for a full sim" : "A half sim is due"
          }
        >
          {rc.due === "full"
            ? "One full run-through 3 to 5 weeks out shows where you stand. None in the final 10 days."
            : "Every 3 to 4 weeks: 4 runs and the first 4 stations at race effort."}
        </InfoCard>
      ) : null}

      {weekDays.length ? (
        <>
          <Eyebrow>This week</Eyebrow>
          <Group>
            {weekDays.map((d, i) => (
              <GroupRow key={d.id} first={i === 0}>
                <View style={styles.flex}>
                  <Text weight="medium">{d.name}</Text>
                  <Text variant="label" weight="regular" tone="muted">
                    {d.note ??
                      d.exercises
                        .map((e) => e.name)
                        .slice(0, 3)
                        .join(", ")}
                  </Text>
                </View>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}

      {rc.lastSim ? (
        <PressableScale
          onPress={() =>
            router.push({
              pathname: "/athlete/race/sim/[id]",
              params: { id: rc.lastSim!.id },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Last sim ${fmtTime(rc.lastSim.totalSec)}. Open`}
          style={styles.card}
        >
          <Text variant="label" weight="semibold">
            {`Last ${rc.lastSim.kind === "half" ? "half sim" : rc.lastSim.kind === "race" ? "race" : "full sim"} · ${fmtTime(rc.lastSim.totalSec)}`}
          </Text>
          <SimBar sim={rc.lastSim} />
        </PressableScale>
      ) : null}

      {Object.keys(bests).length ? (
        <>
          <Eyebrow>Station bests</Eyebrow>
          <Group>
            {STATIONS.filter((s) => bests[s.key] !== undefined).map((s, i) => (
              <GroupRow key={s.key} first={i === 0}>
                <Text
                  style={styles.flex}
                >{`${s.label}${div.loads[s.key] ? ` · ${loadText(div.loads[s.key])}` : ""}`}</Text>
                <Text weight="semibold" numeric>
                  {fmtTime(bests[s.key]!)}
                </Text>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}

      <WhyThis
        title="Your race plan"
        points={[
          "The plan counts back from race day: base, build, race-specific, then a taper that cuts volume by about half but keeps intensity.",
          "Most endurance time is easy, with a small share very hard. Strength stays in, with no sets to failure on leg work before key runs.",
          "Running made up about half of race time in an analysis of almost 40,000 race results, so runs, and runs straight after stations, are central.",
        ]}
        sources={[
          "bosquet2007",
          "stoggl2014",
          "schumann2022",
          "brandt2025hyrox",
          "rappelt2026hyrox",
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: space[3] },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
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
