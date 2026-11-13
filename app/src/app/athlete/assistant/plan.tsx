// Build a new plan (D70): goal, days, session length and equipment, then a plan built to the evidence
// rules (D69) with its weekly volume, ready to review and accept. Nothing changes until "Use this
// plan". If the answers leave too few exercises, it says so instead of guessing (X-02).
// Sample build: the same rules engine as onboarding stands in for the AI.
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { equipmentCode } from "@/features/athlete/programs";
import { selfPlan } from "@/features/athlete/selfPlan";
import {
  backTo,
  Bullets,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow, Pills } from "@/features/coach/parts";
import { rirFor, timesPerWeek } from "@/features/science/rules";
import { VolumePanel } from "@/features/science/VolumePanel";
import { space } from "@/theme";

type Goal = "build_muscle" | "get_stronger" | "lose_fat" | "general_fitness";

export default function BuildPlan() {
  const me = useMe();
  const { meTier, startProgram } = useCoachData();
  const [goal, setGoal] = useState<Goal>("build_muscle");
  const [days, setDays] = useState(String(me?.profile?.daysPerWeek ?? 4));
  const [minutes, setMinutes] = useState(
    String(me?.profile?.sessionMinutes ?? 60),
  );
  const [kit, setKit] = useState(equipmentCode(me?.profile?.equipment));
  const [built, setBuilt] = useState<ReturnType<typeof selfPlan> | null>(null);
  if (!me) return <NotJoined />;
  // AI is Plus-only and coached athletes never see it (D44): a direct link goes back to Today.
  if (meTier !== "pro") return <Redirect href="/athlete" />;
  const back = backTo("/athlete/ai");

  const build = () =>
    setBuilt(
      selfPlan({
        goal,
        daysPerWeek: Number(days),
        sessionLength: minutes,
        equipment: kit,
        homeKit: me.profile?.homeKit,
        injuries: me.profile?.injuries,
        weightKg: me.basics?.weightKg,
        heightCm: me.basics?.heightCm,
        experience: me.profile?.experience ?? "some",
      }),
    );

  if (built) {
    const program = built.program;
    const thin = program.days.some((d) => d.exercises.length < 3);
    if (thin)
      return (
        <MenuPage title="Couldn't build a plan" back={() => setBuilt(null)}>
          <InfoCard>
            With that equipment and your injuries there aren&apos;t enough
            exercises for a full plan. Try adding equipment (even bands or
            dumbbells help) or fewer days, or ask a coach to build one with you.
          </InfoCard>
          <Button
            label="Change my answers"
            variant="secondary"
            fullWidth
            onPress={() => setBuilt(null)}
          />
        </MenuPage>
      );
    const rest = built.protocol.restDays;
    return (
      <MenuPage
        title="Your new plan"
        sub={`${7 - rest.length} days a week · ${program.weeks} weeks · sample`}
        back={() => setBuilt(null)}
        footer={
          <Button
            label="Use this plan"
            fullWidth
            onPress={() => {
              startProgram(me.id, program, rest);
              if (router.canDismiss()) router.dismissAll();
              router.replace("/athlete/training");
            }}
          />
        }
      >
        <Eyebrow>Why it looks like this</Eyebrow>
        <InfoCard>
          <Bullets
            items={[
              "Each main muscle gets close to 10–20 hard sets a week, where most growth happens; extra sets past that mostly cost recovery.",
              `Sets end with ${rirFor("some", true)} reps left on big lifts and ${rirFor("some", false)} on smaller ones, so you train hard without grinding to failure every time.`,
              "Big lifts rest 2–3 minutes, smaller ones 1–2.",
              "Add reps within the range each week, then add weight.",
            ]}
          />
        </InfoCard>
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
          timesPerWeek={timesPerWeek(program.days.length, rest)}
          compact
        />
        <Text variant="caption" tone="muted">
          It replaces your current plan from today. Your history stays.
        </Text>
      </MenuPage>
    );
  }

  return (
    <MenuPage
      title="Build a new plan"
      sub="Sample"
      back={back}
      footer={<Button label="Build my plan" fullWidth onPress={build} />}
    >
      <Eyebrow>Goal</Eyebrow>
      <Pills
        value={goal}
        onChange={setGoal}
        options={[
          { value: "build_muscle", label: "Build muscle" },
          { value: "get_stronger", label: "Get stronger" },
          { value: "lose_fat", label: "Lose fat" },
          { value: "general_fitness", label: "General fitness" },
        ]}
      />
      <Eyebrow>Days a week</Eyebrow>
      <Pills
        value={days}
        onChange={setDays}
        options={["2", "3", "4", "5", "6"].map((d) => ({ value: d, label: d }))}
      />
      <Eyebrow>Minutes a session</Eyebrow>
      <Pills
        value={minutes}
        onChange={setMinutes}
        options={["30", "45", "60", "75"].map((m) => ({ value: m, label: m }))}
      />
      <Eyebrow>Equipment</Eyebrow>
      <Pills
        value={kit}
        onChange={setKit}
        options={[
          { value: "gym", label: "Gym" },
          { value: "home", label: "Home kit" },
          { value: "none", label: "No equipment" },
        ]}
      />
      <Text variant="caption" tone="muted">
        Injuries and home equipment come from your profile.
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
});
