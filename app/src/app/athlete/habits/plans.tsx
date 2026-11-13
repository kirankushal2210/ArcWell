// If-then plans (implementation intentions; gollwitzer2006): name what you want, what might get in
// the way, and exactly what you'll do when it does. Private: coaches never see these.
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, IconButton, Text, TextField } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { useVisibility } from "@/features/athlete/visibility";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { WhyThis } from "@/features/science/WhyThis";
import { space } from "@/theme";

export default function IfThenPlans() {
  const v = useVisibility();
  const { setAthleteSettings } = useCoachData();
  const [goal, setGoal] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [plan, setPlan] = useState("");
  if (!v.me || !v.settings) return <NotJoined />;
  const me = v.me;
  const plans = v.settings.ifThen ?? [];
  const save = (next: typeof plans) =>
    setAthleteSettings(me.id, { ifThen: next });

  return (
    <MenuPage
      title="If-then plans"
      sub="Private to you."
      back={backTo("/athlete/habits")}
    >
      <InfoCard>
        Planning exactly what you&apos;ll do when something gets in the way made
        people more likely to follow through in many studies.
      </InfoCard>
      {plans.length ? (
        <Group>
          {plans.map((p, i) => (
            <GroupRow key={p.id} first={i === 0}>
              <View style={styles.flex}>
                <Text weight="medium">{p.goal}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {`If ${p.obstacle}, then ${p.plan}`}
                </Text>
              </View>
              <IconButton
                icon={Trash2}
                accessibilityLabel={`Delete the plan for ${p.goal}`}
                onPress={() => save(plans.filter((x) => x.id !== p.id))}
              />
            </GroupRow>
          ))}
        </Group>
      ) : null}
      <Eyebrow>New plan</Eyebrow>
      <TextField
        label="What do you want?"
        value={goal}
        onChangeText={setGoal}
        placeholder="Train 4 days a week"
      />
      <TextField
        label="What might get in the way?"
        value={obstacle}
        onChangeText={setObstacle}
        placeholder="a late day at work"
      />
      <TextField
        label="If that happens, I will…"
        value={plan}
        onChangeText={setPlan}
        placeholder="do the 30-minute version at home"
      />
      <Button
        label="Save plan"
        size="sm"
        disabled={!goal.trim() || !obstacle.trim() || !plan.trim()}
        onPress={() => {
          save([
            ...plans,
            {
              id: `p${Date.now().toString(36)}`,
              goal: goal.trim(),
              obstacle: obstacle.trim(),
              plan: plan.trim(),
            },
          ]);
          setGoal("");
          setObstacle("");
          setPlan("");
        }}
      />
      <WhyThis
        title="If-then plans"
        points={[
          "An if-then plan links a likely obstacle to a set response, so the decision is already made when it happens.",
          "Across many studies, these plans helped people follow through on goals more than good intentions alone.",
        ]}
        sources={["gollwitzer2006"]}
      />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
});
