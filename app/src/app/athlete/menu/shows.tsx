// What Arcwell shows (D78): one switch per module. Off means it's gone from Today, the plan and
// reminders; history is kept. Cardio fitness also picks the machines and days it may use (D79).
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Chip, Text } from "@/components/primitives";
import {
  backTo,
  InfoCard,
  MenuPage,
  ToggleRow,
} from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import { WEEKDAYS } from "@/features/coach/plans";
import { Eyebrow, Group, GroupRow, Pills } from "@/features/coach/parts";
import { type Machine, MACHINE_LABEL } from "@/features/science/cardio";
import { MODULES } from "@/features/science/habits";
import { space } from "@/theme";

const MACHINES = Object.keys(MACHINE_LABEL) as Machine[];

export default function WhatArcwellShows() {
  const v = useVisibility();
  const { setAthleteSettings } = useCoachData();
  if (!v.me || !v.settings) return <NotJoined />;
  const me = v.me;
  const s = v.settings;
  const cardio = s.cardio ?? {
    machines: ["bike", "rower"] as Machine[],
    days: [],
    tests: [],
    startedAt: new Date().toISOString().slice(0, 10),
  };
  const setCardio = (patch: Partial<typeof cardio>) =>
    setAthleteSettings(me.id, { cardio: { ...cardio, ...patch } });
  const toggleList = <T,>(list: T[], x: T) =>
    list.includes(x) ? list.filter((y) => y !== x) : [...list, x];

  return (
    <MenuPage
      title="What Arcwell shows"
      sub="Off means it's gone from Today, your plan and reminders. Your history is kept."
      back={backTo("/athlete/menu")}
    >
      <Group>
        <GroupRow first>
          <View style={styles.flex}>
            <Text weight="medium">{me.goal}</Text>
            <Text variant="label" weight="regular" tone="muted">
              Your main goal · always on
            </Text>
          </View>
        </GroupRow>
      </Group>
      {v.coached ? (
        <InfoCard>
          Training your coach assigns always shows. These switches change habits
          and reminders.
        </InfoCard>
      ) : null}

      <Eyebrow>Add-ons</Eyebrow>
      <Group>
        {MODULES.map((m, i) => {
          const forced =
            v.race && (m.key === "running" || m.key === "cardio_fitness");
          return (
            <ToggleRow
              key={m.key}
              first={i === 0}
              label={m.label}
              sub={forced ? `${m.sub}. On while you train for a race.` : m.sub}
              value={v.has(m.key)}
              disabled={forced}
              onChange={(on) => {
                v.toggle(m.key, on);
                if (on && m.key === "cardio_fitness" && !s.cardio)
                  setCardio({});
              }}
            />
          );
        })}
      </Group>

      {v.has("cardio_fitness") ? (
        <>
          <Eyebrow>Cardio machines you&apos;re happy to use</Eyebrow>
          <View style={styles.wrap}>
            {MACHINES.filter((m) => m !== "run" || v.has("running")).map(
              (m) => (
                <Chip
                  key={m}
                  label={MACHINE_LABEL[m]}
                  selected={cardio.machines.includes(m)}
                  onPress={() =>
                    setCardio({ machines: toggleList(cardio.machines, m) })
                  }
                />
              ),
            )}
          </View>
          <Eyebrow>Days cardio can use</Eyebrow>
          <View style={styles.wrap}>
            {WEEKDAYS.map((d, i) => (
              <Chip
                key={d}
                label={d}
                selected={cardio.days.length === 0 || cardio.days.includes(i)}
                onPress={() =>
                  setCardio({
                    days: toggleList(
                      cardio.days.length === 0
                        ? [0, 1, 2, 3, 4, 5, 6]
                        : cardio.days,
                      i,
                    ),
                  })
                }
              />
            ))}
          </View>
          <Text variant="caption" tone="muted">
            Interval sessions never land on a leg day or the day before one.
          </Text>
        </>
      ) : null}

      <Eyebrow>Habit reminders a day</Eyebrow>
      <Pills
        value={String(s.nudges ?? 2)}
        onChange={(n) => setAthleteSettings(me.id, { nudges: Number(n) })}
        options={["0", "1", "2"].map((n) => ({ value: n, label: n }))}
      />
      <Text variant="caption" tone="muted">
        Never between bedtime and waking.
      </Text>
      <Text
        variant="label"
        tone="muted"
        onPress={() => router.push("/athlete/habits")}
        style={styles.link}
      >
        Choose daily habits
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  link: { textDecorationLine: "underline" },
});
