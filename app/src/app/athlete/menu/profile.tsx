// Edit profile (AC-07): name, goal, diet, equipment, and injuries or limitations, saved from the
// header. Coached: changes are shared with the coach. AI subscribers: the AI plan adjusts to them.
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Check } from "lucide-react-native";

import { Avatar, Button, TextField } from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Pills } from "@/features/coach/parts";
import { colors, space } from "@/theme";
import { equipmentCode } from "@/features/athlete/programs";
import { choosePhoto } from "@/features/coach/PhotoSlot";

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
  const [photo, setPhoto] = useState(me?.photo);
  const [experience, setExperience] = useState(
    me?.profile?.experience ?? "some",
  );
  const [days, setDays] = useState(String(me?.profile?.daysPerWeek ?? 4));
  const [minutes, setMinutes] = useState(
    String(me?.profile?.sessionMinutes ?? 60),
  );
  const [injuries, setInjuries] = useState(
    (me?.profile?.injuries ?? []).join(", ") || me?.basics?.injuries || "",
  );
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/menu/account");
  const save = () => {
    updateProfile(me.id, {
      name: name.trim() || me.name,
      photo,
      goal: me.goal.startsWith(goal) ? me.goal : goal,
      basics: me.basics
        ? { ...me.basics, diet, injuries: injuries.trim() }
        : undefined,
      profile: {
        ...me.profile,
        equipment: equipmentCode(equipment),
        experience,
        daysPerWeek: Number(days),
        sessionMinutes: Number(minutes),
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
        <View style={styles.photoRow}>
          <Avatar name={name || me.name} uri={photo} size={48} />
          <Button
            label={photo ? "Change photo" : "Add a photo"}
            size="sm"
            variant="secondary"
            onPress={() => choosePhoto(setPhoto)}
          />
        </View>
        <TextField label="Name" value={name} onChangeText={setName} />
        <Eyebrow>Goal</Eyebrow>
        <Pills
          value={goal}
          onChange={setGoal}
          options={GOALS.map((g) => ({ value: g, label: g }))}
        />
        <Eyebrow>Training experience</Eyebrow>
        <Pills
          value={experience}
          onChange={setExperience}
          options={[
            { value: "new", label: "New to lifting" },
            { value: "some", label: "Some experience" },
            { value: "experienced", label: "Experienced" },
          ]}
        />
        <Eyebrow>Days a week</Eyebrow>
        <Pills
          value={days}
          onChange={setDays}
          options={["2", "3", "4", "5", "6"].map((d) => ({
            value: d,
            label: d,
          }))}
        />
        <Eyebrow>Minutes a session</Eyebrow>
        <Pills
          value={minutes}
          onChange={setMinutes}
          options={["30", "45", "60", "75"].map((m) => ({
            value: m,
            label: m,
          }))}
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
              ? "Your AI plan uses these for the next plan you build."
              : "New plans use these answers."}
        </InfoCard>
      </MenuPage>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  photoRow: { flexDirection: "row", alignItems: "center", gap: space[3] },
  root: { flex: 1, backgroundColor: colors.bg },
});
