// One habit (D74): how to do it, when it shows, today's log (tick, minutes, count, steps or a timer
// that logs itself), the week as dots, and "Why this?" with its sources. Add or remove it here.
import { router, useLocalSearchParams } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, IconButton, Text } from "@/components/primitives";
import { isoDate } from "@/features/athlete/athleteData";
import {
  backTo,
  Bullets,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow } from "@/features/coach/parts";
import { EvidenceBadge } from "@/features/protocols/EvidenceBadge";
import { useHabits } from "@/features/protocols/useHabits";
import {
  caffeineCutoff,
  clock,
  DAYLIGHT_MIN,
  habitById,
  type Sky,
  windowOf,
} from "@/features/science/habits";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

const nowMs = () => Date.now();

const fmt = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export default function HabitPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hb = useHabits();
  const h = habitById(String(id));
  const [left, setLeft] = useState<number | null>(null);
  const [sky, setSky] = useState<Sky>("clear");
  const started = useRef<number>(0);
  const total = useRef<number>(0);

  const running = left !== null;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      // Computed from the start time, so a background tab or locked phone doesn't drift.
      const remain = Math.max(
        0,
        total.current - Math.round((nowMs() - started.current) / 1000),
      );
      if (remain === 0) {
        clearInterval(t);
        if (h) hb.setLog(h.id, Math.round(total.current / 60));
        setLeft(null);
      } else setLeft(remain);
    }, 500);
    return () => clearInterval(t);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hb.me) return <NotJoined />;
  if (!h) return <NotJoined />;
  const active = hb.isActive(h.id);
  const w = windowOf(h, hb.rhythm);
  const val = hb.log[h.id];
  const num = typeof val === "number" ? val : 0;
  const target = h.id === "morning-daylight" ? DAYLIGHT_MIN[sky] : h.target;
  const step = h.tracker === "amount" ? 1000 : h.tracker === "minutes" ? 5 : 1;

  const start = (min: number) => {
    total.current = min * 60;
    started.current = nowMs();
    setLeft(min * 60);
  };

  return (
    <MenuPage title={h.name} back={backTo("/athlete/habits")}>
      <View style={styles.row}>
        <EvidenceBadge level={h.evidence} />
        <Text variant="caption" tone="muted" style={styles.flex}>
          {w
            ? h.id === "caffeine-cutoff"
              ? `Last coffee by ${clock(caffeineCutoff(hb.rhythm))}`
              : `Shows ${clock(w[0])}–${clock(w[1])}`
            : "Any time"}
        </Text>
      </View>
      <Text tone="muted">{h.summary}</Text>
      <InfoCard>
        <Bullets items={h.steps} />
      </InfoCard>

      {h.id === "morning-daylight" ? (
        <>
          <Eyebrow>Sky right now</Eyebrow>
          <View style={styles.row}>
            {(Object.keys(DAYLIGHT_MIN) as Sky[]).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={sky === k ? "primary" : "secondary"}
                label={`${k === "clear" ? "Clear" : k === "cloud" ? "Some cloud" : "Overcast"} · ${DAYLIGHT_MIN[k]}`}
                onPress={() => setSky(k)}
              />
            ))}
          </View>
        </>
      ) : null}

      {active ? (
        <>
          <Eyebrow>Today</Eyebrow>
          {left !== null ? (
            <View style={styles.timer}>
              <Text style={styles.big} numeric>
                {fmt(left)}
              </Text>
              <Button
                label="Stop"
                variant="secondary"
                size="sm"
                onPress={() => setLeft(null)}
              />
            </View>
          ) : h.id === "long-exhale" ? (
            <Button
              label="Start guided breathing"
              size="sm"
              onPress={() =>
                router.push({
                  pathname: "/athlete/recovery/breathe",
                  params: { pattern: "sigh" },
                })
              }
            />
          ) : h.tracker === "timer" || h.id === "morning-daylight" ? (
            <View style={styles.row}>
              {(h.id === "focus-block" ? [25, 45, 60, 90] : [target ?? 5]).map(
                (m) => (
                  <Button
                    key={m}
                    label={`Start ${m}-minute timer`}
                    size="sm"
                    onPress={() => start(m)}
                  />
                ),
              )}
              <Button
                label={val !== undefined ? "Done ✓" : "I've done it"}
                variant="secondary"
                size="sm"
                onPress={() =>
                  hb.setLog(
                    h.id,
                    val !== undefined ? undefined : (target ?? true),
                  )
                }
              />
            </View>
          ) : h.tracker === "clock" ? (
            <View style={styles.row}>
              <Text weight="semibold" style={styles.flex}>
                {typeof val === "number"
                  ? `Last caffeine at ${clock(val)}`
                  : "No caffeine logged today"}
              </Text>
              <Button
                label="Had some now"
                size="sm"
                onPress={() => hb.setLog(h.id, hb.now)}
              />
            </View>
          ) : h.tracker === "check" ? (
            <Button
              label={val !== undefined ? "Done today ✓" : "Mark done"}
              variant={val !== undefined ? "secondary" : "primary"}
              size="sm"
              onPress={() =>
                hb.setLog(h.id, val !== undefined ? undefined : true)
              }
            />
          ) : (
            <View style={styles.row}>
              <IconButton
                icon={Minus}
                accessibilityLabel={`Less ${h.unit ?? ""}`}
                disabled={num <= 0}
                onPress={() =>
                  hb.setLog(h.id, Math.max(0, num - step) || undefined)
                }
              />
              <Text weight="semibold" numeric style={styles.count}>
                {`${num.toLocaleString("en-IN")}${target ? ` of ${target.toLocaleString("en-IN")}` : ""} ${h.unit ?? ""}`}
              </Text>
              <IconButton
                icon={Plus}
                accessibilityLabel={`More ${h.unit ?? ""}`}
                onPress={() => hb.setLog(h.id, num + step)}
              />
            </View>
          )}

          <Eyebrow>This week</Eyebrow>
          <View style={styles.dots}>
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const k = isoDate(d);
              const on = hb.v.settings?.habitLog?.[k]?.[h.id] !== undefined;
              return (
                <View key={k} style={styles.dotCol}>
                  <View style={[styles.dot, on && styles.dotOn]} />
                  <Text variant="caption" tone="muted">
                    {d.toLocaleDateString("en-IN", { weekday: "narrow" })}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <WhyThis
        title={h.name}
        points={[h.summary, ...h.steps.slice(0, 1)]}
        sources={h.sources}
      />

      {active ? (
        <Button
          label="Remove this habit"
          variant="ghost"
          size="sm"
          onPress={() => {
            hb.remove(h.id);
            router.back();
          }}
        />
      ) : (
        <Button
          label={hb.canAdd ? "Add this habit" : `You're at ${hb.cap}`}
          size="sm"
          disabled={!hb.canAdd || (!!h.safety && !hb.safetyPassed(h.safety))}
          onPress={() => hb.add(h.id)}
        />
      )}
      {!active && h.safety && !hb.safetyPassed(h.safety) ? (
        <Text variant="caption" tone="muted">
          Add it from the habits list to answer its quick safety check first.
        </Text>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    flexWrap: "wrap",
  },
  timer: {
    alignItems: "center",
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  big: { fontSize: 44, lineHeight: 52, fontWeight: "800" },
  count: { minWidth: 120, textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "space-between" },
  dotCol: { alignItems: "center", gap: space[1] },
  dot: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  dotOn: { backgroundColor: colors.success },
});
