// Edit profile (AC-07): name, goal, diet, equipment, and injuries or limitations, saved from the
// header. Coached: changes are shared with the coach. AI subscribers: the AI plan adjusts to them.
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

import { TextField } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Pills } from "@/features/coach/parts";
import { colors } from "@/theme";
import { equipmentCode } from "@/features/athlete/programs";

const GOALS = [
  "Lose fat",
  "Build muscle",
  "Get stronger",
  "Body recomposition",
  "General fitness",
];
const DIETS = [
  "vegetarian",
  "eggetarian",
  "non-vegetarian",
  "vegan",
  "Jain",
] as const;
const EQUIPMENT = ["Gym", "Home with equipment", "No equipment"];

export default function EditProfile() {
  const me = useMe();
  const { meTier, coachName, updateProfile } = useCoachData();
  const [name, setName] = useState(me?.name ?? "");
  const [goal, setGoal] = useState(
    GOALS.find((g) => me?.goal.startsWith(g)) ?? "General fitness",
  );
  const [diet, setDiet] = useState<string>(me?.basics?.diet ?? "vegetarian");
  const [equipment, setEquipment] = useState(
    EQUIPMENT[
      ["gym", "home", "none"].indexOf(equipmentCode(me?.profile?.equipment))
    ],
  );
  const [injuries, setInjuries] = useState(
    (me?.profile?.injuries ?? []).join(", ") || me?.basics?.injuries || "",
  );
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/menu/account");
  const save = () => {
    updateProfile(me.id, {
      name: name.trim() || me.name,
      goal: me.goal.startsWith(goal) ? me.goal : goal,
      basics: me.basics
        ? { ...me.basics, diet, injuries: injuries.trim() }
        : undefined,
      profile: {
        ...me.profile,
        equipment: equipmentCode(equipment),
        injuries: injuries
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      },
    });
    back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <MenuPage
        title="Profile"
        back={back}
        actions={[{ icon: Check, label: "Save", onPress: save }]}
      >
        <TextField label="Name" value={name} onChangeText={setName} />
        <Eyebrow>Goal</Eyebrow>
        <Pills
          value={goal}
          onChange={setGoal}
          options={GOALS.map((g) => ({ value: g, label: g }))}
        />
        <Eyebrow>Where you train</Eyebrow>
        <Pills
          value={equipment}
          onChange={setEquipment}
          options={EQUIPMENT.map((g) => ({ value: g, label: g }))}
        />
        <Eyebrow>Diet</Eyebrow>
        <Pills
          value={diet}
          onChange={setDiet}
          options={DIETS.map((d) => ({
            value: d,
            label: d[0].toUpperCase() + d.slice(1),
          }))}
        />
        <TextField
          label="Injuries or limitations"
          placeholder="For example: lower back, left knee"
          value={injuries}
          onChangeText={setInjuries}
        />
        <InfoCard>
          {meTier === "coached"
            ? `Changes are shared with ${coachName}.`
            : meTier === "pro"
              ? "Your AI plan adjusts to these changes."
              : "Your plan suggestions use these answers."}
        </InfoCard>
      </MenuPage>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
