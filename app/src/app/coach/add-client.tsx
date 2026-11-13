// Add a client after a call (D56): the details the coach gathered, so they can build the client's
// plans before inviting them. The client confirms these when they join and skips onboarding.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  NumberStepper,
  Text,
  TextField,
} from "@/components/primitives";
import { type NewClient, useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import { Segmented } from "@/features/onboarding/parts";
import { colors, rhythm, space } from "@/theme";
import { InviteBlocked, useCoachLimits } from "@/features/coach/limits";

const GOALS = [
  "Lose fat",
  "Build muscle",
  "Get stronger",
  "Recomposition",
  "General fitness",
];
const DIETS = ["Vegetarian", "Non-veg", "Eggetarian", "Vegan", "Jain"];
const SEX: Record<string, NewClient["sex"]> = {
  Female: "female",
  Male: "male",
  "Prefer not to say": "unsaid",
};

function AddClientScreen() {
  const { addClient, leads } = useCoachData();
  const { leadId } = useLocalSearchParams<{ leadId?: string }>();
  // Joined from a lead (D63): their details carry over.
  const lead = leadId ? leads.find((l) => l.id === leadId) : undefined;
  const insets = useSafeAreaInsets();
  const [f, setF] = useState<NewClient>({
    name: lead?.name ?? "",
    phone: lead?.phone ?? "",
    goal: "Lose fat",
    sex: "female",
    age: 28,
    heightCm: 165,
    weightKg: 70,
    targetKg: 64,
    diet: "Vegetarian",
    injuries: "",
    notes: lead?.goal ? `Wants: ${lead.goal}` : "",
  });
  const set = <K extends keyof NewClient>(k: K, v: NewClient[K]) =>
    setF((x) => ({ ...x, [k]: v }));
  const hasTarget = f.goal === "Lose fat" || f.goal === "Build muscle";
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title="Add a client" onBack={back} />
      <Page>
        <Text tone="muted">
          Fill this in after your call. You&apos;ll build their training,
          nutrition and recovery next, then send one invite. They won&apos;t
          answer the onboarding questions.
        </Text>

        <TextField
          label="Name"
          value={f.name}
          onChangeText={(v) => set("name", v)}
          placeholder="e.g. Rohit Kumar"
          autoCapitalize="words"
        />
        <TextField
          label="Phone (for WhatsApp)"
          value={f.phone}
          onChangeText={(v) => set("phone", v)}
          placeholder="e.g. 98765 43210"
          keyboardType="phone-pad"
        />

        <Eyebrow>Goal</Eyebrow>
        <Pills
          value={f.goal}
          onChange={(v) => set("goal", v)}
          options={GOALS.map((g) => ({ value: g, label: g }))}
        />

        <Eyebrow>Body</Eyebrow>
        <Segmented
          stretch
          options={Object.keys(SEX)}
          value={Object.keys(SEX).find((k) => SEX[k] === f.sex) ?? "Female"}
          onChange={(v) => set("sex", SEX[v])}
        />
        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <NumberStepper
            value={f.age}
            onChange={(v) => set("age", v)}
            min={14}
            max={80}
            unit="yrs"
            accessibilityLabel="Age"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Height</Text>
          <NumberStepper
            value={f.heightCm}
            onChange={(v) => set("heightCm", v)}
            min={130}
            max={210}
            unit="cm"
            accessibilityLabel="Height"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Weight</Text>
          <NumberStepper
            value={f.weightKg}
            onChange={(v) => set("weightKg", v)}
            step={0.5}
            decimals={1}
            min={35}
            max={200}
            unit="kg"
            accessibilityLabel="Weight"
          />
        </View>
        {hasTarget ? (
          <View style={styles.row}>
            <Text style={styles.label}>Goal weight</Text>
            <NumberStepper
              value={f.targetKg}
              onChange={(v) => set("targetKg", v)}
              step={0.5}
              decimals={1}
              min={35}
              max={200}
              unit="kg"
              accessibilityLabel="Goal weight"
            />
          </View>
        ) : null}

        <Eyebrow>Diet</Eyebrow>
        <Pills
          value={f.diet}
          onChange={(v) => set("diet", v)}
          options={DIETS.map((d) => ({ value: d, label: d }))}
        />

        <TextField
          label="Injuries or limits"
          value={f.injuries}
          onChangeText={(v) => set("injuries", v)}
          placeholder="e.g. Lower back, avoid heavy deadlifts"
        />
        <TextField
          label="Notes from the call (only you see these)"
          value={f.notes}
          onChangeText={(v) => set("notes", v)}
          placeholder="Schedule, preferences, anything to remember"
          multiline
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Continue to plans"
          fullWidth
          disabled={f.name.trim().length < 2}
          onPress={() => {
            const id = addClient(
              { ...f, targetKg: hasTarget ? f.targetKg : f.weightKg },
              lead?.id,
            );
            router.replace({ pathname: "/coach/client/[id]", params: { id } });
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space[3],
  },
  label: { flex: 1 },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});

/** At the client limit (K-25) or with billing lapsed (K-27), new clients can't be added. */
export default function AddClient() {
  const { blocked } = useCoachLimits();
  return blocked ? <InviteBlocked title="Add a client" /> : <AddClientScreen />;
}
