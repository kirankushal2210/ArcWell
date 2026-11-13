// Sim results (D76): total, runs vs stations vs Roxzone, every part against the previous sim, and how
// much the run pace fades. Swapped stations are marked and never compared.
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { divisionOf } from "@/features/race/data";
import { SimBar } from "@/features/race/RacePage";
import { fmtTime, runPaces, stepsFor } from "@/features/race/sim";
import { useRace } from "@/features/race/useRace";
import { colors, radius, space } from "@/theme";

export default function SimResult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rc = useRace();
  if (!rc.me) return <NotJoined />;
  const sim = rc.sims.find((s) => s.id === id);
  if (!sim) return <NotJoined />;
  const prev = rc.sims.find(
    (s) => s.kind === sim.kind && s.date <= sim.date && s.id !== sim.id,
  );
  const steps = stepsFor(
    sim.kind,
    sim.splits.some((x) => x.kind === "roxzone"),
  );
  const paces = runPaces(sim);
  const maxPace = Math.max(...paces, 1);
  const minPace = Math.min(...paces, maxPace);
  const fade = paces.length > 1 ? paces[paces.length - 1] - paces[0] : 0;
  return (
    <MenuPage
      title={`${sim.kind === "half" ? "Half sim" : sim.kind === "race" ? "Race" : "Full sim"} · ${sim.date}`}
      sub={divisionOf(sim.division).label}
      back={backTo("/athlete/race")}
    >
      <Text style={styles.big} numeric>
        {fmtTime(sim.totalSec)}
      </Text>
      {prev ? (
        <Text
          variant="label"
          style={{
            color:
              sim.totalSec <= prev.totalSec ? colors.success : colors.warning,
          }}
        >
          {`${fmtTime(Math.abs(sim.totalSec - prev.totalSec))} ${sim.totalSec <= prev.totalSec ? "faster" : "slower"} than ${prev.date}`}
        </Text>
      ) : null}
      <SimBar sim={sim} />
      <Group>
        {sim.splits.map((x, k) => {
          const p = prev?.splits.find((y) => y.i === x.i && y.kind === x.kind);
          const d =
            p && !x.substitute && !p.substitute ? x.seconds - p.seconds : null;
          return (
            <GroupRow key={k} first={k === 0}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      x.kind === "run"
                        ? colors.training
                        : x.kind === "station"
                          ? colors.recovery
                          : colors.textMuted,
                  },
                ]}
              />
              <Text
                style={styles.flex}
              >{`${steps[x.i]?.label.split(" · ")[0] ?? ""}${x.substitute ? ` (${x.substitute})*` : ""}`}</Text>
              <Text weight="semibold" numeric>
                {fmtTime(x.seconds)}
              </Text>
              <Text
                variant="caption"
                numeric
                style={[
                  styles.delta,
                  {
                    color:
                      d === null
                        ? colors.textMuted
                        : d <= 0
                          ? colors.success
                          : colors.warning,
                  },
                ]}
              >
                {d === null
                  ? x.substitute
                    ? "n/a"
                    : ""
                  : `${d <= 0 ? "−" : "+"}${fmtTime(Math.abs(d))}`}
              </Text>
            </GroupRow>
          );
        })}
      </Group>
      {paces.length > 1 ? (
        <>
          <Eyebrow>Run pace fade</Eyebrow>
          <View style={styles.bars}>
            {paces.map((p, k) => (
              <View key={k} style={styles.barCol}>
                <Text variant="caption" tone="muted" numeric>
                  {fmtTime(p)}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height:
                        14 +
                        ((p - minPace) / Math.max(1, maxPace - minPace)) * 40,
                    },
                  ]}
                />
                <Text variant="caption" tone="muted">{`Run ${k + 1}`}</Text>
              </View>
            ))}
          </View>
          <Text variant="caption" tone="muted">
            {`Time per km: taller is slower. ${fade > 0 ? `You slowed ${fmtTime(fade)} from the first run to the last.` : "You held your pace."}`}
          </Text>
        </>
      ) : null}
      {sim.splits.some((x) => x.substitute) ? (
        <Text variant="caption" tone="muted">
          * Done on other equipment, so it isn&apos;t compared with real
          stations.
        </Text>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  big: { fontSize: 34, lineHeight: 40, fontWeight: "800" },
  dot: { width: space[2], height: space[2], borderRadius: radius.full },
  delta: { minWidth: 48, textAlign: "right" },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: space[2] },
  barCol: { flex: 1, alignItems: "center", gap: space[1] },
  bar: {
    width: "100%",
    borderRadius: radius.sm,
    backgroundColor: colors.training,
  },
});
