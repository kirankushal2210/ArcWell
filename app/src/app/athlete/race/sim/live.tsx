// Race mode (D76): full screen, no tab bar. The whole lower half is one Split button (gloves and
// sweat); undo top right; total time and the current part with its gap to the last sim. Times come
// from saved timestamps, so a locked phone or a killed app loses nothing.
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { Undo2, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import {
  elapsedSec,
  fmtTime,
  type Live,
  stepsFor,
  stepTimes,
} from "@/features/race/sim";
import { useRace } from "@/features/race/useRace";
import { alert } from "@/lib/alert";
import { colors, radius, rhythm, space } from "@/theme";

const nowMs = () => Date.now();

export default function RaceMode() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const rc = useRace();
  const [now, setNow] = useState(nowMs);
  useEffect(() => {
    const t = setInterval(() => setNow(nowMs()), 250);
    return () => clearInterval(t);
  }, []);
  const live = rc.live as Live | undefined;
  if (!live) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + space[4] }]}>
        <Text style={styles.center}>No sim running.</Text>
      </View>
    );
  }
  const steps = stepsFor(live.kind, live.roxzone);
  const i = live.marks.length;
  const done = i >= steps.length;
  const step = steps[Math.min(i, steps.length - 1)];
  const next = steps[i + 1];
  const partStart = i ? live.marks[i - 1] : live.startedAt;
  const partSec = Math.max(0, Math.round((now - partStart) / 1000));
  // Same part in the last sim, for the gap.
  const prev = rc.lastSim?.splits.find(
    (x) => x.i === i && x.kind === step.kind,
  );
  const gap = prev && !done ? partSec - prev.seconds : null;
  const sub = step.station ? live.substitutes[step.station] : undefined;

  const doSplit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    rc.split();
  };
  const close = () =>
    alert(
      "Leave the sim?",
      "It keeps running in the background until you finish or discard it.",
      [
        { text: "Keep going", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            rc.discard();
            router.replace("/athlete/training");
          },
        },
        { text: "Leave", onPress: () => router.back() },
      ],
    );

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + space[2],
          paddingBottom: insets.bottom + space[3],
        },
      ]}
    >
      <View style={styles.top}>
        <IconButton
          icon={X}
          variant="glass"
          accessibilityLabel="Leave or discard the sim"
          onPress={close}
        />
        <Text weight="semibold" style={[styles.flex, styles.center]}>
          {live.kind === "half"
            ? "Half sim"
            : live.kind === "race"
              ? "Race"
              : "Full sim"}
        </Text>
        <IconButton
          icon={Undo2}
          variant="glass"
          accessibilityLabel="Undo last split"
          disabled={!i}
          onPress={rc.undo}
        />
      </View>
      <View style={styles.totalBox}>
        <Text variant="caption" tone="muted">
          Total
        </Text>
        <Text style={styles.total} numeric>
          {fmtTime(
            done
              ? stepTimes(live).reduce((a, b) => a + b, 0)
              : elapsedSec(live, now),
          )}
        </Text>
      </View>
      <View style={styles.strip}>
        {steps.map((s, k) => (
          <View
            key={k}
            style={[
              styles.seg,
              k < i && {
                backgroundColor:
                  s.kind === "run" ? colors.training : colors.recovery,
              },
              k === i && styles.segNow,
            ]}
          />
        ))}
      </View>
      {!done ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text weight="bold" style={styles.flex}>
              {sub ? `${step.label} (${sub})` : step.label}
            </Text>
            {gap !== null ? (
              <Text
                variant="label"
                weight="bold"
                style={{ color: gap <= 0 ? colors.success : colors.warning }}
              >
                {`${Math.abs(gap)} s ${gap <= 0 ? "ahead" : "behind"}`}
              </Text>
            ) : null}
          </View>
          <Text style={styles.part} numeric>
            {fmtTime(partSec)}
          </Text>
          {next ? (
            <Text variant="caption" tone="muted">{`Next: ${next.label}`}</Text>
          ) : (
            <Text variant="caption" tone="muted">
              Last part
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text weight="bold">Finished</Text>
        </View>
      )}
      <PressableScale
        onPress={() => {
          if (done) {
            const id = rc.finish();
            if (id)
              router.replace({
                pathname: "/athlete/race/sim/[id]",
                params: { id },
              });
          } else doSplit();
        }}
        accessibilityRole="button"
        accessibilityLabel={
          done
            ? "Save sim"
            : `Split: end ${step.label}${next ? `, start ${next.label}` : ""}`
        }
        style={styles.split}
      >
        <Text style={styles.splitText}>{done ? "Save" : "Split"}</Text>
        <Text variant="label" style={styles.onColor}>
          {done
            ? "See your results"
            : next
              ? `End ${step.kind === "run" ? "run" : "part"} · start ${next.label.split(" · ")[0].toLowerCase()}`
              : "Finish"}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: rhythm.gutter,
    gap: space[3],
  },
  top: { flexDirection: "row", alignItems: "center", gap: space[2] },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1 },
  center: { textAlign: "center" },
  totalBox: { alignItems: "center" },
  total: { fontSize: 52, lineHeight: 60, fontWeight: "800" },
  strip: { flexDirection: "row", gap: space[1] / 2 },
  seg: {
    flex: 1,
    height: space[2],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  segNow: { borderWidth: 2, borderColor: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[1],
  },
  part: { fontSize: 34, lineHeight: 40, fontWeight: "800" },
  split: {
    flex: 1,
    minHeight: 200,
    borderRadius: radius.xl,
    backgroundColor: colors.training,
    alignItems: "center",
    justifyContent: "center",
    gap: space[1],
  },
  splitText: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.onPillar,
  },
  onColor: { color: colors.onPillar },
});
