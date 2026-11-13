// Training's Endurance tab (D99): today's cardio session to start, the cardio fitness estimate and
// this week's easy and interval sessions, each one tap to start. Built on the cardio module (D79);
// with the module off, one button turns it on.
import { router } from "expo-router";
import { ChevronRight, Play } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import { useVisibility } from "@/features/athlete/visibility";
import { WEEKDAYS } from "@/features/coach/plans";
import { Eyebrow } from "@/features/coach/parts";
import { MACHINE_LABEL } from "@/features/science/cardio";
import { colors, radius, space } from "@/theme";

import { CardioCard } from "./CardioCard";
import { useCardio } from "./useCardio";

const start = (kind: string, machine: string) =>
  router.push({
    pathname: "/athlete/cardio/session",
    params: { kind, machine },
  });

export function EndurancePage() {
  const cf = useCardio();
  const vis = useVisibility();
  if (!cf.me) return null;
  if (!cf.on)
    return (
      <View style={styles.card}>
        <Text weight="semibold">Endurance is off</Text>
        <Button
          label="Turn on endurance"
          size="sm"
          onPress={() => vis.toggle("cardio_fitness", true)}
        />
      </View>
    );
  const today = cf.today && !cf.doneToday ? cf.today : null;
  return (
    <>
      {today ? (
        <Button
          label={`Start ${today.kind === "intervals" ? "intervals" : "easy cardio"} · ${today.minutes} min`}
          icon={Play}
          fullWidth
          onPress={() => start(today.kind, today.machine)}
        />
      ) : null}

      <CardioCard />

      {cf.slots.length ? (
        <>
          <Eyebrow>This week</Eyebrow>
          <View style={styles.group}>
            {cf.slots.map((s, i) => (
              <PressableScale
                key={`${s.day}-${s.kind}`}
                onPress={() => start(s.kind, s.machine)}
                accessibilityRole="button"
                accessibilityLabel={`Start ${WEEKDAYS[s.day]} ${s.kind}`}
                style={[styles.row, i > 0 && styles.line]}
              >
                <View style={styles.play}>
                  <Play
                    size={14}
                    color={colors.onBrand}
                    fill={colors.onBrand}
                  />
                </View>
                <View style={styles.flex}>
                  <Text weight="semibold">
                    {`${WEEKDAYS[s.day]} · ${s.kind === "intervals" ? "Intervals" : "Easy"}`}
                  </Text>
                  <Text variant="label" weight="regular" tone="muted" numeric>
                    {`${MACHINE_LABEL[s.machine]} · ${s.minutes} min`}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </PressableScale>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.buttons}>
        {cf.best ? (
          <View style={styles.flex}>
            <Button
              label="Retest"
              variant="secondary"
              size="sm"
              fullWidth
              onPress={() => router.push("/athlete/cardio/test")}
            />
          </View>
        ) : null}
        <View style={styles.flex}>
          <Button
            label="Details"
            variant="secondary"
            size="sm"
            fullWidth
            onPress={() => router.push("/athlete/cardio")}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  group: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
  },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  play: {
    width: space[8],
    height: space[8],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: { flexDirection: "row", gap: space[2] },
});
