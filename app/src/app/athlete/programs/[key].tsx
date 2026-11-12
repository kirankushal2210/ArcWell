// One Arcwell program (TR-04): its workouts, weekly sets per muscle against the evidence range, and
// Start. Starting replaces the current program from today; workout history stays.
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { buildProgram, PRESETS } from "@/features/athlete/programs";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { DELOAD, timesPerWeek } from "@/features/science/rules";
import { VolumePanel } from "@/features/science/VolumePanel";
import { space } from "@/theme";

export default function ProgramDetail() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const me = useMe();
  const { meTier, startProgram } = useCoachData();
  const [confirm, setConfirm] = useState(false);
  const preset = PRESETS.find((p) => p.key === key);
  const built = useMemo(
    () => (preset && me ? buildProgram(preset, me) : null),
    [preset, me],
  );
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/programs");
  if (!preset || !built || meTier !== "pro")
    return (
      <MenuPage title="Program" back={back}>
        <InfoCard>This program isn&apos;t available.</InfoCard>
      </MenuPage>
    );
  const { program, restDays } = built;

  return (
    <MenuPage
      title={program.name}
      sub={`${7 - restDays.length} days a week · ${program.weeks} weeks`}
      back={back}
      footer={
        <Button
          label="Start this program"
          fullWidth
          onPress={() => setConfirm(true)}
        />
      }
    >
      <Text tone="muted">{preset.who}</Text>
      <Eyebrow>Workouts</Eyebrow>
      <Group>
        {program.days.map((d, i) => (
          <GroupRow key={d.id} first={i === 0}>
            <View style={styles.flex}>
              <Text weight="semibold">{d.name}</Text>
              <Text variant="label" weight="regular" tone="muted">
                {d.exercises
                  .map((e) => `${e.name} ${e.sets}×${e.reps}`)
                  .join(" · ")}
              </Text>
            </View>
          </GroupRow>
        ))}
      </Group>
      <VolumePanel
        days={program.days}
        timesPerWeek={timesPerWeek(program.days.length, restDays)}
        compact
      />
      <InfoCard title="Lighter weeks">
        {`${DELOAD.text} ${DELOAD.evidence}`}
      </InfoCard>

      <Sheet
        visible={confirm}
        onClose={() => setConfirm(false)}
        title={`Start ${program.name}?`}
        sub="It replaces your current program from today, starting at week 1. Your workout history stays."
      >
        <View style={styles.buttons}>
          <Button
            label="Start program"
            fullWidth
            onPress={() => {
              startProgram(me.id, program, restDays);
              setConfirm(false);
              if (router.canDismiss()) router.dismissAll();
              router.replace("/athlete/training");
            }}
          />
          <Button
            label="Not now"
            variant="ghost"
            fullWidth
            onPress={() => setConfirm(false)}
          />
        </View>
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  buttons: { gap: space[1], paddingTop: space[2] },
});
