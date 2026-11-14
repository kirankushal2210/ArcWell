// Coach view of a client's daily habits (D74): what's active, weekly consistency, and assigning a
// habit (it always shows for the client, whatever their switches say). Coaches never see the
// client's if-then plans, which are private. Cardio fitness and race goal shown when the client has
// them (D76, D79).
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { isoDate, isoToday } from "@/features/athlete/athleteData";
import { Sheet, SheetRow } from "@/features/athlete/Sheet";
import { divisionOf } from "@/features/race/data";
import { bestEstimate } from "@/features/science/cardio";
import { HABITS, habitById } from "@/features/science/habits";
import { daysUntil, PHASE_LABEL, phaseFor } from "@/features/science/hybrid";
import { space } from "@/theme";

import { useCoachData } from "./CoachData";
import { Eyebrow, Group, GroupRow } from "./parts";
import type { Client } from "./sampleData";

export function ClientHabits({ c }: { c: Client }) {
  const { settingsOf, setAthleteSettings } = useCoachData();
  const [assign, setAssign] = useState(false);
  const s = settingsOf(c.id);
  const first = c.name.split(" ")[0];
  const active = (s.habits?.active ?? [])
    .map((a) => ({ a, h: habitById(a.id) }))
    .filter((x) => !!x.h);
  const week = (id: string) => {
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (s.habitLog?.[isoDate(d)]?.[id] !== undefined) n++;
    }
    return n;
  };
  const vo2 = bestEstimate(s.cardio?.tests ?? []);
  const race =
    s.race?.goal && (s.race.status ?? "active") === "active"
      ? s.race.goal
      : undefined;

  return (
    <>
      <Eyebrow>Daily habits</Eyebrow>
      {active.length ? (
        <Group>
          {active.map(({ a, h }, i) => (
            <GroupRow key={a.id} first={i === 0}>
              <View style={styles.flex}>
                <Text weight="medium">{h!.name}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {`${week(a.id)} of 7 days${a.origin === "coach" ? " · you assigned it" : ""}`}
                </Text>
              </View>
            </GroupRow>
          ))}
        </Group>
      ) : (
        <Text tone="muted">{`${first} hasn't chosen any daily habits.`}</Text>
      )}
      <Button
        label="Assign a habit"
        variant="secondary"
        size="sm"
        icon={Plus}
        onPress={() => setAssign(true)}
      />

      {vo2 || race ? <Eyebrow>Cardio and race</Eyebrow> : null}
      {vo2 ? (
        <Text>{`VO2 max estimate ${vo2.vo2} ml/kg/min (${vo2.date})`}</Text>
      ) : null}
      {race ? (
        <Text>
          {`Race in ${Math.ceil(daysUntil(race.date, isoToday()) / 7)} weeks · ${divisionOf(race.division).label} · ${PHASE_LABEL[phaseFor(daysUntil(race.date, isoToday()))]} phase · ${race.level === "first" ? "first race" : race.level === "advanced" ? "advanced" : "raced before"} · ${(s.race?.sims ?? []).length} sims logged${race.weak?.length ? ` · works on ${race.weak.join(", ").replace(/_/g, " ")}` : ""}`}
        </Text>
      ) : null}

      <Sheet
        visible={assign}
        onClose={() => setAssign(false)}
        title={`Assign a habit to ${first}`}
        sub="It shows on their Today at its time of day. They can see it came from you."
      >
        {HABITS.filter(
          (h) => !active.some((x) => x.a.id === h.id) && !h.safety,
        ).map((h) => (
          <SheetRow
            key={h.id}
            label={h.name}
            sub={h.summary}
            onPress={() => {
              setAthleteSettings(c.id, {
                habits: {
                  ...(s.habits ?? { active: [] }),
                  firstAt: s.habits?.firstAt ?? isoToday(),
                  active: [
                    ...(s.habits?.active ?? []),
                    { id: h.id, origin: "coach", since: isoToday() },
                  ],
                },
              });
              setAssign(false);
            }}
          />
        ))}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
});
