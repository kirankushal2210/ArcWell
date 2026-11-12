// Client profile (sitemap §5, K-02, K-03, K-14 to K-18, CO-15): everything the coach needs to track one
// client — overview, training, nutrition, recovery, progress, check-ins and private notes. A new client
// shows their onboarding answers and the assign-plan step instead.
import { router, useLocalSearchParams } from "expo-router";
import {
  Camera,
  Check,
  ChevronRight,
  Dumbbell,
  Ellipsis,
  MessageCircle,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";

import { Avatar, Button, StatusChip, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Bars,
  Eyebrow,
  Group,
  GroupRow,
  KeyValues,
  Page,
  PageHeader,
  PillarDot,
  Pills,
  StatTile,
  WeightChart,
} from "@/features/coach/parts";
import type { Client } from "@/features/coach/sampleData";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

type Section =
  | "overview"
  | "training"
  | "nutrition"
  | "recovery"
  | "progress"
  | "checkins"
  | "notes";

const SECTIONS: { value: Section; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "training", label: "Training" },
  { value: "nutrition", label: "Nutrition" },
  { value: "recovery", label: "Recovery" },
  { value: "progress", label: "Progress" },
  { value: "checkins", label: "Check-ins" },
  { value: "notes", label: "Notes" },
];

const kg = (n: number) => `${n.toFixed(1)} kg`;
const signed = (n: number, unit = "") =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}${unit}`;
const avg = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export default function ClientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, setStatus } = useCoachData();
  const c = client(id);
  const [section, setSection] = useState<Section>("overview");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");

  if (!c) {
    return (
      <View style={styles.root}>
        <PageHeader title="Client" onBack={back} />
        <Text tone="muted" style={styles.pad}>
          This client isn&apos;t in your list any more.
        </Text>
      </View>
    );
  }

  const changeStatus = () =>
    Alert.alert(c.name, "Change coaching status", [
      { text: "Active", onPress: () => setStatus(c.id, "active") },
      { text: "Pause coaching", onPress: () => setStatus(c.id, "paused") },
      { text: "Mark as leaving", onPress: () => setStatus(c.id, "leaving") },
      {
        text: "Complete coaching",
        style: "destructive",
        onPress: () => setStatus(c.id, "completed"),
      },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View style={styles.root}>
      <PageHeader
        title={c.name}
        onBack={back}
        actions={[
          {
            icon: MessageCircle,
            label: "Message",
            onPress: () =>
              router.push({
                pathname: "/coach/chat/[id]",
                params: { id: c.id },
              }),
          },
          { icon: Ellipsis, label: "Change status", onPress: changeStatus },
        ]}
      />
      <Page>
        <View style={styles.hero}>
          <Avatar name={c.name} size={48} />
          <View style={styles.flex}>
            <Text weight="semibold">{c.goal}</Text>
            <Text variant="label" weight="regular" tone="muted">
              {c.isNew
                ? `Joined ${c.joined} with your link`
                : `${c.weeksWithYou} weeks with you · check-in ${c.checkInDay}`}
            </Text>
          </View>
          <StatusChip status={c.status} />
        </View>

        {c.isNew ? (
          <NewClient c={c} />
        ) : (
          <>
            <Pills<Section>
              options={SECTIONS}
              value={section}
              onChange={setSection}
            />
            {section === "overview" && <Overview c={c} go={setSection} />}
            {section === "training" && <Training c={c} />}
            {section === "nutrition" && <Nutrition c={c} />}
            {section === "recovery" && <Recovery c={c} />}
            {section === "progress" && <Progress c={c} />}
            {section === "checkins" && <CheckIns c={c} />}
            {section === "notes" && <Notes c={c} />}
          </>
        )}
      </Page>
    </View>
  );
}

// ---------- New client: answers and the first plan (CO-15) ----------

function NewClient({ c }: { c: Client }) {
  const { templates, assignPlan } = useCoachData();
  const training = templates.filter((t) => t.kind === "training");
  const meals = templates.filter((t) => t.kind === "meals");
  // Start from the template that fits the client's answers; the coach can pick another.
  const answer = (k: string) => c.answers.find(([q]) => q === k)?.[1] ?? "";
  const goal = answer("Goal");
  const fits = goal.startsWith("Lose fat")
    ? "Fat loss"
    : goal.startsWith("Build muscle")
      ? "Muscle gain"
      : goal.startsWith("Get stronger")
        ? "Strength"
        : "Beginner";
  const veg = answer("Diet").startsWith("Vegetarian");
  const [t, setT] = useState(
    (training.find((x) => x.name.startsWith(fits)) ?? training[0])?.name ?? "",
  );
  const [m, setM] = useState(
    (
      meals.find((x) => x.name.startsWith(veg ? "Vegetarian" : "Non-veg")) ??
      meals[0]
    )?.name ?? "",
  );
  const pick = (
    list: typeof templates,
    value: string,
    set: (v: string) => void,
  ) => (
    <Group>
      {list.map((x, i) => (
        <GroupRow
          key={x.id}
          first={i === 0}
          onPress={() => set(x.name)}
          label={`${x.name}${value === x.name ? ", selected" : ""}`}
        >
          <View style={styles.flex}>
            <Text weight="medium">{x.name}</Text>
            <Text variant="label" weight="regular" tone="muted">
              {x.detail}
            </Text>
          </View>
          {value === x.name ? (
            <Check size={20} strokeWidth={2.75} color={colors.text} />
          ) : null}
        </GroupRow>
      ))}
    </Group>
  );
  return (
    <>
      <Text tone="muted">
        {c.name.split(" ")[0]} answered onboarding before joining. Pick a plan
        to start them on; you can adjust it for them after.
      </Text>
      <KeyValues rows={c.answers} />
      <Eyebrow>Training plan</Eyebrow>
      {pick(training, t, setT)}
      <Eyebrow>Meal plan and targets</Eyebrow>
      {pick(meals, m, setM)}
      <Button
        label="Assign plan"
        icon={Dumbbell}
        fullWidth
        onPress={() => assignPlan(c.id, t, m)}
      />
    </>
  );
}

// ---------- Overview ----------

function Overview({ c, go }: { c: Client; go: (s: Section) => void }) {
  const change = c.weights[c.weights.length - 1] - c.weights[0];
  const kcal = avg(c.nutrition.days.map((d) => d.kcal));
  const sleep = avg(c.recovery.nights.map((n) => n.hours));
  const lastCheckIn = c.checkIns[0];
  return (
    <>
      <View style={styles.tiles}>
        <StatTile
          label="Adherence"
          value={c.adherence === null ? "—" : `${c.adherence}%`}
          sub="this week"
        />
        <StatTile
          label="Weight"
          value={signed(change, " kg")}
          sub={`since ${c.joined}`}
        />
        <StatTile
          label="Goal"
          value={kg(c.targetKg)}
          sub={`${Math.abs(c.weights[c.weights.length - 1] - c.targetKg).toFixed(1)} kg to go`}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.between}>
          <Text weight="semibold">Weight trend</Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {kg(c.weights[c.weights.length - 1])} now · dashed line is the goal
          </Text>
        </View>
        {c.weights.length > 1 ? (
          <WeightChart values={c.weights} target={c.targetKg} />
        ) : (
          <Text tone="muted">
            First weigh-in only. The trend appears after their next one.
          </Text>
        )}
      </View>

      <Eyebrow>This week</Eyebrow>
      <Group>
        <GroupRow
          first
          onPress={() => go("training")}
          label="Training this week"
        >
          <PillarDot pillar="training" />
          <Text style={styles.flex}>Workouts</Text>
          <Text weight="semibold" numeric>
            {c.training.weekPlanned
              ? `${c.training.weekDone} of ${c.training.weekPlanned}`
              : "—"}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow onPress={() => go("nutrition")} label="Nutrition this week">
          <PillarDot pillar="nutrition" />
          <Text style={styles.flex}>Average calories</Text>
          <Text weight="semibold" numeric>
            {kcal ? `${fmt(kcal)} / ${fmt(c.nutrition.targetKcal)}` : "—"}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow onPress={() => go("recovery")} label="Recovery this week">
          <PillarDot pillar="recovery" />
          <Text style={styles.flex}>Average sleep</Text>
          <Text weight="semibold" numeric>
            {sleep
              ? `${sleep.toFixed(1)} h / ${c.recovery.sleepTargetH} h`
              : "—"}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow onPress={() => go("checkins")} label="Last check-in">
          <View style={styles.dotSpace} />
          <Text style={styles.flex}>Last check-in</Text>
          <Text weight="semibold" numeric>
            {lastCheckIn
              ? `Week ${lastCheckIn.week} · ${lastCheckIn.reviewed ? "replied" : "to review"}`
              : "None yet"}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
      </Group>

      {c.plan ? (
        <>
          <Eyebrow>Plan</Eyebrow>
          <KeyValues
            rows={[
              ["Training", c.plan.training],
              ["Meals", c.plan.meals],
              ["Sleep target", `${c.recovery.sleepTargetH} h`],
            ]}
          />
        </>
      ) : null}
    </>
  );
}

// ---------- Training ----------

function Training({ c }: { c: Client }) {
  const { weekDone, weekPlanned, logs } = c.training;
  if (!logs.length)
    return (
      <Text tone="muted">
        No workouts logged while {c.status === "paused" ? "paused" : "new"}.
      </Text>
    );
  const volume = logs.reduce((n, l) => n + l.sets, 0);
  return (
    <>
      <View style={styles.tiles}>
        <StatTile
          label="This week"
          value={`${weekDone}/${weekPlanned}`}
          sub="workouts"
        />
        <StatTile label="Sets" value={String(volume)} sub="this week" />
        <StatTile
          label="Avg session"
          value={`${Math.round(avg(logs.filter((l) => !l.missed).map((l) => l.minutes)))} min`}
        />
      </View>
      <Eyebrow>{c.plan?.training ?? "Workouts"}</Eyebrow>
      <Group>
        {logs.map((l, i) => (
          <GroupRow key={l.date} first={i === 0}>
            <View style={styles.flex}>
              <Text weight="medium">{l.name}</Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {l.date}
                {l.missed ? "" : ` · ${l.sets} sets · ${l.minutes} min`}
              </Text>
            </View>
            <Text
              variant="label"
              tone={l.missed ? "danger" : "default"}
              numeric
            >
              {l.topSet}
            </Text>
          </GroupRow>
        ))}
      </Group>
    </>
  );
}

// ---------- Nutrition ----------

function Nutrition({ c }: { c: Client }) {
  const { days, targetKcal, proteinG } = c.nutrition;
  if (!days.length) return <Text tone="muted">No food logged this week.</Text>;
  const onTarget = days.filter(
    (d) => Math.abs(d.kcal - targetKcal) <= targetKcal * 0.1,
  ).length;
  return (
    <>
      <View style={styles.tiles}>
        <StatTile
          label="Avg kcal"
          value={fmt(avg(days.map((d) => d.kcal)))}
          sub={`target ${fmt(targetKcal)}`}
        />
        <StatTile
          label="Avg protein"
          value={`${fmt(avg(days.map((d) => d.protein)))} g`}
          sub={`target ${proteinG} g`}
        />
        <StatTile label="On target" value={`${onTarget}/7`} sub="days ±10%" />
      </View>
      <View style={styles.card}>
        <Text weight="semibold">Calories by day</Text>
        <Bars
          values={days.map((d) => d.kcal)}
          target={targetKcal}
          labels={days.map((d) => d.day[0])}
        />
        <Text variant="caption" tone="muted">
          Dashed line is the target. Grey bars are more than 10% under it.
        </Text>
      </View>
      {c.plan ? <KeyValues rows={[["Meal plan", c.plan.meals]]} /> : null}
    </>
  );
}

// ---------- Recovery ----------

function Recovery({ c }: { c: Client }) {
  const r = c.recovery;
  if (!r.nights.length)
    return <Text tone="muted">No sleep logged this week.</Text>;
  return (
    <>
      <View style={styles.tiles}>
        <StatTile
          label="Avg sleep"
          value={`${avg(r.nights.map((n) => n.hours)).toFixed(1)} h`}
          sub={`target ${r.sleepTargetH} h`}
        />
        <StatTile
          label="Nights on target"
          value={`${r.nights.filter((n) => n.hours >= r.sleepTargetH).length}/7`}
        />
      </View>
      <View style={styles.card}>
        <Text weight="semibold">Sleep by night</Text>
        <Bars
          values={r.nights.map((n) => n.hours)}
          target={r.sleepTargetH}
          labels={r.nights.map((n) => n.day[0])}
        />
      </View>
      <Eyebrow>Last check-in, out of 5</Eyebrow>
      <KeyValues
        rows={[
          ["Sleep quality", String(r.quality)],
          ["Stress", String(r.stress)],
          ["Energy", String(r.energy)],
          ["Soreness", String(r.soreness)],
        ]}
      />
    </>
  );
}

// ---------- Progress ----------

function Progress({ c }: { c: Client }) {
  return (
    <>
      <View style={styles.card}>
        <Text weight="semibold">Bodyweight</Text>
        <WeightChart values={c.weights} target={c.targetKg} height={140} />
      </View>
      <Eyebrow>Measurements</Eyebrow>
      <Group>
        <GroupRow first>
          <Text variant="label" tone="muted" style={styles.flex}>
            Since {c.joined}
          </Text>
          <Text variant="label" tone="muted" style={styles.col}>
            Start
          </Text>
          <Text variant="label" tone="muted" style={styles.col}>
            Now
          </Text>
          <Text variant="label" tone="muted" style={styles.col}>
            Change
          </Text>
        </GroupRow>
        {c.measurements.map((m) => (
          <GroupRow key={m.label}>
            <Text style={styles.flex}>{m.label}</Text>
            <Text tone="muted" numeric style={styles.col}>
              {m.start.toFixed(1)}
            </Text>
            <Text weight="semibold" numeric style={styles.col}>
              {m.now.toFixed(1)}
            </Text>
            <Text weight="semibold" numeric style={styles.col}>
              {signed(m.now - m.start)}
            </Text>
          </GroupRow>
        ))}
      </Group>
      <Eyebrow>Progress photos</Eyebrow>
      {c.photoWeeks.length ? (
        <View style={styles.photos}>
          {c.photoWeeks.map((w) => (
            <View
              key={w}
              style={styles.photo}
              accessibilityLabel={`Photo, week ${w}`}
            >
              <Camera size={24} color={colors.textMuted} />
              <Text variant="caption" weight="semibold">
                {w === 0 ? "Start" : `Week ${w}`}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text tone="muted">No photos shared yet.</Text>
      )}
      <Text variant="caption" tone="muted">
        You see data from the day {c.name.split(" ")[0]} joined you, unless they
        share their earlier history. Photos stay private to you and them.
      </Text>
    </>
  );
}

// ---------- Check-ins ----------

function CheckIns({ c }: { c: Client }) {
  if (!c.checkIns.length)
    return (
      <Text tone="muted">
        No check-ins yet. Next one is due {c.checkInDay}.
      </Text>
    );
  return (
    <Group>
      {c.checkIns.map((k, i) => (
        <GroupRow
          key={k.id}
          first={i === 0}
          onPress={() =>
            router.push({
              pathname: "/coach/check-in/[id]",
              params: { id: k.id },
            })
          }
          label={`Week ${k.week} check-in`}
        >
          <View style={styles.flex}>
            <Text weight="medium">Week {k.week}</Text>
            <Text
              variant="label"
              weight="regular"
              tone="muted"
              numberOfLines={2}
            >
              {k.reviewed
                ? `You replied: ${k.reply}`
                : `Submitted ${k.submitted} · waiting for you`}
            </Text>
          </View>
          {!k.reviewed ? <Text variant="label">Review</Text> : null}
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
      ))}
    </Group>
  );
}

// ---------- Notes (private to the coach) ----------

function Notes({ c }: { c: Client }) {
  const { setNotes } = useCoachData();
  return (
    <>
      <TextInput
        value={c.notes}
        onChangeText={(v) => setNotes(c.id, v)}
        placeholder="Injuries, preferences, anything to remember"
        placeholderTextColor={colors.textMuted}
        multiline
        style={styles.notes}
        accessibilityLabel="Private notes"
      />
      <Text variant="caption" tone="muted">
        Only you see these notes. {c.name.split(" ")[0]} never does.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: space[4] },
  flex: { flex: 1, gap: space[1] / 2 },
  hero: { flexDirection: "row", alignItems: "center", gap: space[3] },
  tiles: { flexDirection: "row", gap: space[2] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  between: { gap: space[1] },
  dotSpace: { width: 8 },
  col: { width: 56, textAlign: "right" },
  photos: { flexDirection: "row", gap: space[2] },
  photo: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    gap: space[1],
  },
  notes: {
    minHeight: 160,
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
    textAlignVertical: "top",
  },
});
