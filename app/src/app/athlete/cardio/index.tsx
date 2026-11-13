// Cardio fitness detail (D79): the estimate over time, where it stands, this week's sessions, recent
// sessions and the sources. Retest every 6–8 weeks.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { CardioCard } from "@/features/cardio/CardioCard";
import { useCardio } from "@/features/cardio/useCardio";
import { WEEKDAYS } from "@/features/coach/plans";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import {
  hrMaxFor,
  INTERVAL_ZONE,
  MACHINE_LABEL,
  TEST_LABEL,
  zoneBpm,
} from "@/features/science/cardio";
import { WhyThis } from "@/features/science/WhyThis";
import { space } from "@/theme";

export default function CardioFitness() {
  const cf = useCardio();
  if (!cf.me) return <NotJoined />;
  if (!cf.on)
    return (
      <MenuPage title="Cardio fitness" back={backTo("/athlete/training")}>
        <InfoCard>
          Cardio fitness is off. Turn it on in What Arcwell shows if you want
          VO2 max sessions in your plan.
        </InfoCard>
        <Button
          label="What Arcwell shows"
          size="sm"
          onPress={() => router.push("/athlete/menu/shows")}
        />
      </MenuPage>
    );
  const hrMax = hrMaxFor(cf.age);
  const [lo, hi] = zoneBpm(hrMax, INTERVAL_ZONE);
  return (
    <MenuPage title="Cardio fitness" back={backTo("/athlete/training")}>
      <CardioCard />
      <Eyebrow>This week</Eyebrow>
      <Group>
        {cf.slots.map((s, i) => (
          <GroupRow
            key={`${s.day}-${s.kind}`}
            first={i === 0}
            label={`${WEEKDAYS[s.day]} ${s.kind}`}
            onPress={() =>
              router.push({
                pathname: "/athlete/cardio/session",
                params: { kind: s.kind, machine: s.machine },
              })
            }
          >
            <View style={styles.flex}>
              <Text weight="medium">
                {`${WEEKDAYS[s.day]} · ${s.kind === "intervals" ? "Intervals" : "Easy"} · ${MACHINE_LABEL[s.machine]}`}
              </Text>
              <Text variant="label" weight="regular" tone="muted">
                {s.interval
                  ? `${s.interval.label} · ${s.minutes} min`
                  : `${s.minutes} min, able to talk`}
              </Text>
            </View>
          </GroupRow>
        ))}
      </Group>
      <Text variant="caption" tone="muted">
        {`Hard intervals at ${lo}–${hi} bpm (85–95% of an estimated max of ${hrMax}), or effort 8–9 out of 10 without a watch. Never on a leg day or the day before one.`}
      </Text>

      {cf.trend.length ? (
        <>
          <Eyebrow>Estimates</Eyebrow>
          <Group>
            {[...cf.trend].reverse().map((t, i) => (
              <GroupRow key={t.id} first={i === 0}>
                <View style={styles.flex}>
                  <Text weight="medium" numeric>
                    {`${t.vo2} ml/kg/min`}
                  </Text>
                  <Text variant="label" weight="regular" tone="muted">
                    {`${TEST_LABEL[t.kind]} · ${t.date}${t.detail ? ` · ${t.detail}` : ""}`}
                  </Text>
                </View>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}

      <Button
        label={cf.best ? "Retest" : "Check my cardio fitness"}
        variant={cf.best ? "secondary" : "primary"}
        size="sm"
        onPress={() => router.push("/athlete/cardio/test")}
      />
      <WhyThis
        title="Cardio fitness"
        points={[
          "Cardio fitness (VO2 max) is one of the strongest predictors of long-term health: each step up in fitness came with lower risk of death in large studies.",
          "Short hard intervals, like 4 × 4 minutes near your maximum heart rate, raised VO2 max more than steady running in trials. One or two sessions a week on top of easy cardio is enough for most people.",
          "Hard cardio close to leg training can hold back leg strength, more with running than cycling, so intervals stay away from leg days.",
          "Estimates vary: a watch can be off by about 10 for one person, and tests are rougher than a lab. Compare your own numbers over time.",
        ]}
        sources={[
          "kodama2009",
          "lang2024",
          "helgerud2007",
          "milanovic2015",
          "wen2019",
          "wilson2012",
          "molinagarcia2022",
          "kaminsky2015",
        ]}
      />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
});
