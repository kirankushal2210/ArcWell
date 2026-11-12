// Programs (TR-04, TR-05): Arcwell's multi-week programs, built by the evidence rules (D69) and
// fitted to the athlete's kit and injuries. Pro athletes can switch; free athletes see them locked
// (D13). Coached athletes follow their coach's program, so this points them back to Training.
import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import {
  backTo,
  InfoCard,
  MenuPage,
  NavRow,
} from "@/features/athlete/MenuParts";
import { PRESETS } from "@/features/athlete/programs";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group } from "@/features/coach/parts";
import { colors, space } from "@/theme";

export default function Programs() {
  const me = useMe();
  const { meTier, coachName } = useCoachData();
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/menu");

  if (meTier === "coached")
    return (
      <MenuPage title="Programs" back={back}>
        <InfoCard title={`${coachName} sets your program`}>
          {`You're on ${me.program?.name ?? "the program your coach is building"}. Ask ${coachName.replace(/^Coach\s+/, "")} if you'd like a change.`}
        </InfoCard>
        <Button
          label="Open Training"
          variant="secondary"
          fullWidth
          onPress={() => router.push("/athlete/training")}
        />
      </MenuPage>
    );

  if (meTier === "free")
    return (
      <MenuPage
        title="Programs"
        back={back}
        footer={
          <Button
            label="See Arcwell Plus"
            fullWidth
            onPress={() => router.push("/athlete/ai")}
          />
        }
      >
        <View style={styles.hero}>
          <Lock size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            Programs are part of Arcwell Plus
          </Text>
          <Text tone="muted" style={styles.center}>
            Multi-week programs for building muscle, strength or losing fat,
            fitted to your equipment and built on the research. Your current
            plan stays free.
          </Text>
        </View>
        <Group>
          {PRESETS.map((p, i) => (
            <NavRow
              key={p.key}
              first={i === 0}
              icon={Lock}
              label={p.name}
              sub={p.who}
              onPress={() => router.push("/athlete/ai")}
            />
          ))}
        </Group>
      </MenuPage>
    );

  return (
    <MenuPage title="Programs" back={back}>
      {me.program ? (
        <InfoCard title="Your program">
          {`${me.program.name} · ${7 - (me.protocol?.restDays.length ?? 7 - me.program.days.length)} days a week · ${me.program.weeks} weeks`}
        </InfoCard>
      ) : null}
      <Eyebrow>Arcwell programs</Eyebrow>
      <Group>
        {PRESETS.map((p, i) => (
          <NavRow
            key={p.key}
            first={i === 0}
            label={p.name}
            sub={p.who}
            onPress={() =>
              router.push({
                pathname: "/athlete/programs/[key]",
                params: { key: p.key },
              })
            }
          />
        ))}
      </Group>
      <Text variant="caption" tone="muted">
        Every program is built to the same rules as your plan: 10 to 20 hard
        sets a week for each main muscle, sets ending 0 to 3 reps short of
        failure, and progression you can see.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[3], paddingTop: space[4] },
});
