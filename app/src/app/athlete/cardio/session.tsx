// Live interval timer (D79): full screen, the phase in big type with a haptic at each change, the
// heart-rate target (or an effort cue without a watch), times computed from the start so a locked
// phone loses nothing. Saved as an endurance session that counts toward strain.
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, Text } from "@/components/primitives";
import { useCardio } from "@/features/cardio/useCardio";
import {
  EASY_ZONE,
  easyMinutes,
  hrMaxFor,
  intervalFor,
  INTERVAL_ZONE,
  type Machine,
  MACHINE_LABEL,
  zoneBpm,
} from "@/features/science/cardio";
import { colors, radius, rhythm, space } from "@/theme";

type Phase = { label: string; sec: number; hard: boolean };
const nowMs = () => Date.now();
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function CardioSession() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { kind = "intervals", machine = "bike" } = useLocalSearchParams<{
    kind: string;
    machine: string;
  }>();
  const cf = useCardio();
  const iv = intervalFor(cf.level, cf.week);
  const phases: Phase[] = useMemo(() => {
    if (kind !== "intervals")
      return [
        {
          label: "Easy, able to talk",
          sec: easyMinutes[cf.level] * 60,
          hard: false,
        },
      ];
    const out: Phase[] = [{ label: "Warm up", sec: 300, hard: false }];
    for (let s = 0; s < (iv.sets ?? 1); s++)
      for (let r = 0; r < iv.rounds; r++) {
        out.push({
          label: `Hard · round ${r + 1} of ${iv.rounds}`,
          sec: iv.workSec,
          hard: true,
        });
        out.push({ label: "Easy", sec: iv.restSec, hard: false });
      }
    out.push({ label: "Cool down", sec: 300, hard: false });
    return out;
  }, [kind, cf.level, iv.rounds, iv.sets, iv.workSec, iv.restSec]);
  const total = phases.reduce((n, p) => n + p.sec, 0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const lastPhase = useRef(-1);

  useEffect(() => {
    if (startedAt === null) return;
    const t = setInterval(
      () =>
        setElapsed(Math.min(total, Math.round((nowMs() - startedAt) / 1000))),
      500,
    );
    return () => clearInterval(t);
  }, [startedAt, total]);

  let acc = 0;
  let idx = phases.length - 1;
  for (let i = 0; i < phases.length; i++) {
    if (elapsed < acc + phases[i].sec) {
      idx = i;
      break;
    }
    acc += phases[i].sec;
  }
  const phase = phases[idx];
  const left = Math.max(0, acc + phase.sec - elapsed);
  const finished = startedAt !== null && elapsed >= total;

  useEffect(() => {
    if (startedAt !== null && idx !== lastPhase.current) {
      lastPhase.current = idx;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [idx, startedAt]);

  const hrMax = hrMaxFor(cf.age);
  const [lo, hi] = zoneBpm(hrMax, phase.hard ? INTERVAL_ZONE : EASY_ZONE);
  const m = machine as Machine;
  const finish = () => {
    cf.logSession({
      kind: kind === "intervals" ? "intervals" : "easy",
      machine: m,
      minutes: Math.max(1, Math.round(elapsed / 60)),
    });
    router.replace("/athlete/cardio");
  };

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
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
        <View style={styles.flex}>
          <Text weight="semibold" style={styles.center}>
            {`${kind === "intervals" ? "Intervals" : "Easy cardio"} · ${MACHINE_LABEL[m] ?? "Bike"}`}
          </Text>
          <Text variant="caption" tone="muted" style={styles.center}>
            {kind === "intervals" ? iv.label : `${easyMinutes[cf.level]} min`}
          </Text>
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.strip}>
        {phases.map((p, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              { flex: p.sec },
              p.hard && styles.segHard,
              startedAt !== null && i < idx && styles.segDone,
              startedAt !== null && i === idx && styles.segNow,
            ]}
          />
        ))}
      </View>
      <View style={styles.card}>
        <Text weight="semibold" numeric>
          {`Target ${lo}–${hi} bpm`}
        </Text>
        <Text variant="caption" tone="muted">
          {phase.hard
            ? `85–95% of your estimated max (${hrMax}). Without a watch: effort 8–9 out of 10, only a few words at a time. Heart rate lags in the first minute.`
            : "Easy: you can hold a conversation."}
        </Text>
      </View>
      <View
        style={[styles.phase, phase.hard ? styles.phaseHard : styles.phaseEasy]}
      >
        <Text
          weight="bold"
          style={[styles.phaseLabel, phase.hard && styles.onColor]}
        >
          {startedAt === null ? "Ready" : finished ? "Done" : phase.label}
        </Text>
        <Text style={[styles.big, phase.hard && styles.onColor]} numeric>
          {startedAt === null ? fmt(total) : finished ? fmt(total) : fmt(left)}
        </Text>
        <Text
          variant="label"
          style={phase.hard ? styles.onColor : undefined}
          tone={phase.hard ? undefined : "muted"}
        >
          {startedAt === null
            ? "total"
            : finished
              ? "Nice work"
              : "left in this part"}
        </Text>
      </View>
      {startedAt === null ? (
        <Button label="Start" fullWidth onPress={() => setStartedAt(nowMs())} />
      ) : (
        <Button
          label={finished ? "Save session" : "Finish early and save"}
          fullWidth
          variant={finished ? "primary" : "secondary"}
          onPress={finish}
        />
      )}
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
  flex: { flex: 1 },
  spacer: { width: 48 },
  center: { textAlign: "center" },
  strip: { flexDirection: "row", gap: space[1] / 2, height: space[2] },
  seg: { borderRadius: radius.sm, backgroundColor: colors.surfaceRaised },
  segHard: { backgroundColor: colors.border },
  segDone: { backgroundColor: colors.training },
  segNow: { backgroundColor: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[1],
  },
  phase: {
    flex: 1,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: space[1],
  },
  phaseHard: { backgroundColor: colors.training },
  phaseEasy: { backgroundColor: colors.surface },
  phaseLabel: { textTransform: "uppercase", letterSpacing: 1 },
  onColor: { color: colors.onPillar },
  big: { fontSize: 64, lineHeight: 72, fontWeight: "800" },
});
