// Client profile sections (sitemap §5, K-02, K-03, K-14 to K-18, CO-15): shared by the client
// profile's section tabs (D61) and its detail pages (progress, check-ins, notes).
import { router } from "expo-router";
import { Check, ChevronRight, Dumbbell, Send } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { Button, StatusChip, Text } from "@/components/primitives";
import {
  daysBack,
  DEVICE_LABEL,
  protocolById,
  ZONE_LABEL,
} from "@/features/athlete/recovery";
import {
  Ring,
  useClientRecovery,
  ZoneDot,
} from "@/features/athlete/RecoveryParts";
import {
  dateKey,
  type FoodLog,
  shiftDate,
  slotLabel,
} from "@/features/athlete/foods";
import { useCoachData } from "@/features/coach/CoachData";
import {
  accountOf,
  dayInline,
  dayText,
  inr,
  renewsOn,
} from "@/features/coach/crm";
import { PaidTag } from "@/features/coach/CrmParts";
import {
  Bars,
  Eyebrow,
  Group,
  GroupRow,
  KeyValues,
  PillarDot,
  StatTile,
  WeightChart,
} from "@/features/coach/parts";
import { PhotoSlot } from "@/features/coach/PhotoSlot";
import { PlanRows, plansReady } from "@/features/coach/PlanRows";
import type { Client } from "@/features/coach/sampleData";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

export type ClientTab = "overview" | "training" | "nutrition" | "recovery";

const kg = (n: number) => `${n.toFixed(1)} kg`;
const signed = (n: number, unit = "") =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}${unit}`;
const avg = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

// ---------- Added after a call: build the three plans, then invite (D56) ----------

export function SetUpPlans({ c }: { c: Client }) {
  const first = c.name.split(" ")[0];
  const ready = plansReady(c);
  const open = () =>
    router.push({ pathname: "/coach/invite/[id]", params: { id: c.id } });
  return (
    <>
      <Text tone="muted">
        Build {first}&apos;s training, nutrition and recovery, then send one
        invite. When {first} joins, everything is already in their app and they
        skip the onboarding questions.
      </Text>
      <Eyebrow>Plans</Eyebrow>
      <PlanRows c={c} />
      <Button
        label={c.invite ? "View invite" : "Create invite"}
        icon={Send}
        fullWidth
        disabled={!ready}
        onPress={open}
      />
      {!ready ? (
        <Text variant="caption" tone="muted">
          All three need a plan before you can invite {first}.
        </Text>
      ) : null}
      <Eyebrow>From your call</Eyebrow>
      <KeyValues rows={c.answers} />
      {c.notes ? (
        <View style={styles.card}>
          <Text variant="label" tone="muted">
            Your notes
          </Text>
          <Text>{c.notes}</Text>
        </View>
      ) : null}
    </>
  );
}

// ---------- New client: answers and the first plan (CO-15) ----------

export function NewClient({ c }: { c: Client }) {
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

// ---------- Nutrition from the client's own food logs (F5) ----------

const todayStr = () => dateKey(new Date());

/** The last 7 days from the client's logs, or the sample week when they haven't logged yet. */
export function useNutritionWeek(c: Client) {
  const { foodLogs } = useCoachData();
  const logs = foodLogs(c.id);
  const target = c.nutritionPlan?.kcal ?? c.nutrition.targetKcal;
  const protein = c.nutritionPlan?.protein ?? c.nutrition.proteinG;
  if (!logs.length) return { days: c.nutrition.days, target, protein, logs };
  const today = todayStr();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = shiftDate(today, i - 6);
    const ls = logs.filter((l) => l.date === d);
    const [y, m, dd] = d.split("-").map(Number);
    return {
      day: new Date(y, m - 1, dd).toLocaleDateString("en-IN", {
        weekday: "short",
      }),
      kcal: Math.round(ls.reduce((n, l) => n + l.macros.kcal, 0)),
      protein: Math.round(ls.reduce((n, l) => n + l.macros.p, 0)),
      date: d,
    };
  }).filter((d) => d.kcal > 0);
  return { days, target, protein, logs };
}

// ---------- Overview ----------

export function Overview({ c, go }: { c: Client; go: (s: ClientTab) => void }) {
  const change = c.weights[c.weights.length - 1] - c.weights[0];
  const week = useNutritionWeek(c);
  const kcal = avg(week.days.map((d) => d.kcal));
  const rec = useClientRecovery(c);
  const today = rec.day(dateKey(new Date()));
  const lastCheckIn = c.checkIns[0];
  const toReview = c.checkIns.filter((k) => !k.reviewed).length;
  const a = accountOf(c);
  const on = renewsOn(a);
  const first = c.name.split(" ")[0];
  const open = (
    pathname:
      | "/coach/client/progress/[id]"
      | "/coach/client/check-ins/[id]"
      | "/coach/client/notes/[id]"
      | "/coach/client/status/[id]"
      | "/coach/account/[id]",
  ) => router.push({ pathname, params: { id: c.id } });
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
            {kcal ? `${fmt(kcal)} / ${fmt(week.target)}` : "—"}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow onPress={() => go("recovery")} label="Recovery today">
          <PillarDot pillar="recovery" />
          <Text style={styles.flex}>Recovery today</Text>
          <Text weight="semibold" numeric>
            {today.recovery.score}% · {ZONE_LABEL[today.recovery.zone]}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
      </Group>

      <Eyebrow>Plans · tap to edit</Eyebrow>
      <PlanRows c={c} />
      <Text variant="caption" tone="muted">
        Changes show in {first}&apos;s app straight away.
      </Text>

      <Eyebrow>More</Eyebrow>
      <Group>
        <GroupRow
          first
          onPress={() => open("/coach/client/check-ins/[id]")}
          label="Check-ins"
        >
          <View style={styles.flex}>
            <Text weight="medium">Check-ins</Text>
            <Text variant="label" weight="regular" tone="muted">
              {lastCheckIn
                ? `Week ${lastCheckIn.week} · ${toReview ? `${toReview} to review` : "all replied"} · due ${c.checkInDay}`
                : `None yet · due ${c.checkInDay}`}
            </Text>
          </View>
          {toReview ? <Text variant="label">Review</Text> : null}
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow
          onPress={() => open("/coach/client/progress/[id]")}
          label="Progress"
        >
          <View style={styles.flex}>
            <Text weight="medium">Progress</Text>
            <Text variant="label" weight="regular" tone="muted">
              Bodyweight, measurements and {c.photoWeeks.length} photo{" "}
              {c.photoWeeks.length === 1 ? "set" : "sets"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow
          onPress={() => open("/coach/client/notes/[id]")}
          label="Notes"
        >
          <View style={styles.flex}>
            <Text weight="medium">Private notes</Text>
            <Text
              variant="label"
              weight="regular"
              tone="muted"
              numberOfLines={1}
            >
              {c.notes || "Only you see these"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow onPress={() => open("/coach/account/[id]")} label="Account">
          <View style={styles.flex}>
            <Text weight="medium">Account</Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {a.package} · {inr(a.feeInr)}
              {on ? ` · renews ${dayInline(on)}` : ""}
            </Text>
          </View>
          <PaidTag paid={a.paid} />
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
      </Group>

      <Eyebrow>Coaching</Eyebrow>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <StatusChip status={c.status} />
          <Text
            variant="label"
            weight="regular"
            tone="muted"
            style={styles.flex}
          >
            {STATUS_TEXT[c.status]}
          </Text>
        </View>
        <Text variant="label" weight="regular" tone="muted">
          {c.historyFrom
            ? `${first} shared their history from ${dayText(c.historyFrom)}.`
            : `You see ${first}'s data from the day they joined (${c.joined}). They can share earlier history from their app.`}
        </Text>
        <Button
          label="Change status"
          variant="secondary"
          fullWidth
          onPress={() => open("/coach/client/status/[id]")}
        />
      </View>
    </>
  );
}

const STATUS_TEXT: Record<Client["status"], string> = {
  active: "Coaching as normal",
  paused: "Plans stay; no check-in reminders",
  leaving: "Still coaching until you complete them",
  completed: "Finished. You can't see new data",
};

// ---------- Training ----------

export function Training({ c }: { c: Client }) {
  const { sessions } = useCoachData();
  const { weekDone, weekPlanned, logs } = c.training;
  // F4-06, F4-07: what changed on the day, so the coach knows why a session differs from the plan.
  const changes = sessions(c.id)
    .map((s) => ({
      s,
      lines: s.exercises.flatMap((e) => [
        ...(e.swappedFrom ? [`Swapped ${e.swappedFrom} for ${e.name}`] : []),
        ...(e.skipped ? [`Skipped ${e.name}`] : []),
        ...(e.note ? [`${e.name}: “${e.note}”`] : []),
      ]),
    }))
    .filter((x) => x.lines.length || x.s.note);
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
          value={`${Math.round(avg(logs.filter((l) => !l.missed && l.minutes > 0).map((l) => l.minutes)))} min`}
        />
      </View>
      <Eyebrow>{c.plan?.training ?? "Workouts"}</Eyebrow>
      <Group>
        {logs.map((l, i) => (
          <GroupRow key={`${l.date}-${i}`} first={i === 0}>
            <View style={styles.flex}>
              <Text weight="medium">{l.name}</Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {l.date}
                {l.missed
                  ? ""
                  : ` · ${l.sets} sets${l.minutes ? ` · ${l.minutes} min` : ""}`}
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
      {changes.length ? (
        <>
          <Eyebrow>Changes and notes from workouts</Eyebrow>
          <Group>
            {changes.map(({ s, lines }, k) => (
              <GroupRow key={s.id} first={k === 0}>
                <View style={styles.flex}>
                  <Text weight="medium">
                    {s.name} ·{" "}
                    {new Date(s.at).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                  {lines.map((line) => (
                    <Text
                      key={line}
                      variant="label"
                      weight="regular"
                      tone="muted"
                    >
                      {line}
                    </Text>
                  ))}
                  {s.note ? (
                    <Text variant="label" weight="regular" tone="muted">
                      Session note: “{s.note}”
                    </Text>
                  ) : null}
                </View>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}
    </>
  );
}

// ---------- Nutrition ----------

export function Nutrition({ c }: { c: Client }) {
  const {
    days,
    target: targetKcal,
    protein: proteinG,
    logs,
  } = useNutritionWeek(c);
  if (!days.length) return <Text tone="muted">No food logged this week.</Text>;
  const since = shiftDate(todayStr(), -6);
  const week = logs.filter((l) => l.date >= since);
  const planMeals = c.nutritionPlan?.meals.filter((m) => m.items?.length) ?? [];
  const followed = new Set(
    week.filter((l) => l.fromPlan).map((l) => `${l.date}:${l.fromPlan}`),
  ).size;
  const swaps = new Map<string, FoodLog[]>();
  for (const l of week.filter((x) => x.swappedFor)) {
    const k = `${l.date}:${l.swappedFor}`;
    swaps.set(k, [...(swaps.get(k) ?? []), l]);
  }
  const loggedDays = new Set(week.map((l) => l.date)).size;
  const own = Array.from(
    new Set(week.filter((l) => l.source === "mine").map((l) => l.name)),
  );
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
      {week.length && planMeals.length ? (
        <View style={styles.card}>
          <Text weight="semibold" numeric>
            Meal plan: {followed} of {planMeals.length * loggedDays} planned
            meals eaten as planned
          </Text>
          {swaps.size ? (
            Array.from(swaps.entries()).map(([k, ls]) => {
              const [d, mealId] = k.split(":");
              const meal = planMeals.find((m) => m.id === mealId);
              return (
                <Text key={k} variant="label" weight="regular" tone="muted">
                  {new Date(d).toLocaleDateString("en-IN", {
                    weekday: "short",
                  })}{" "}
                  {meal?.name ?? slotLabel(ls[0].meal)}: ate{" "}
                  {ls.map((l) => l.name).join(", ")} instead
                </Text>
              );
            })
          ) : (
            <Text variant="label" weight="regular" tone="muted">
              No swaps this week.
            </Text>
          )}
          {own.length ? (
            <Text variant="label" weight="regular" tone="muted">
              Their own foods: {own.join(", ")}
            </Text>
          ) : null}
        </View>
      ) : null}
      {c.plan ? <KeyValues rows={[["Meal plan", c.plan.meals]]} /> : null}
    </>
  );
}

// ---------- Recovery (D60): the same scores the client sees ----------

export function Recovery({ c }: { c: Client }) {
  const rec = useClientRecovery(c);
  const today = rec.day(dateKey(new Date()));
  const week = daysBack(rec.inputs, dateKey(new Date()), 7);
  const r = c.recovery;
  const done = rec.store.done.filter((d) =>
    week.some((w) => d.startsWith(w.date)),
  );
  const first = c.name.split(" ")[0];
  const source =
    today.source === "device" && rec.store.device
      ? `From ${first}'s ${DEVICE_LABEL[rec.store.device.brand]}`
      : today.source === "check-in"
        ? `From ${first}'s morning check-in`
        : `Estimated from ${first}'s onboarding answers`;
  return (
    <>
      <View style={styles.rings}>
        {[
          {
            label: "Recovery",
            share: today.recovery.score / 100,
            value: `${today.recovery.score}`,
            unit: "%",
          },
          {
            label: "Sleep",
            share: today.sleep.performance / 100,
            value: `${today.sleep.performance}`,
            unit: "%",
          },
          {
            label: "Strain",
            share: today.strain.score / 21,
            value: today.strain.score.toFixed(1),
          },
          {
            label: "Stress",
            share: today.stress.value / 3,
            value: today.stress.value.toFixed(1),
          },
        ].map((g) => (
          <View key={g.label} style={styles.ring}>
            <Ring
              share={g.share}
              value={g.value}
              unit={g.unit}
              size={64}
              stroke={6}
            />
            <Text variant="caption" tone="muted">
              {g.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.zoneRow}>
        <ZoneDot zone={today.recovery.zone} />
        <Text weight="semibold">{ZONE_LABEL[today.recovery.zone]}</Text>
        <Text variant="label" weight="regular" tone="muted">
          · {source}
        </Text>
      </View>

      <View style={styles.card}>
        <Text weight="semibold">Recovery, last 7 days</Text>
        <Bars
          values={week.map((d) => d.recovery.score)}
          labels={week.map((d) => d.date.slice(8))}
        />
      </View>
      <View style={styles.card}>
        <Text weight="semibold">Sleep by night</Text>
        <Bars
          values={week.map((d) => Math.round((d.sleep.minutes / 60) * 10) / 10)}
          target={r.sleepTargetH}
          labels={week.map((d) => d.date.slice(8))}
        />
        <Text variant="caption" tone="muted" numeric>
          Target {r.sleepTargetH} h ·{" "}
          {week.filter((d) => d.sleep.minutes / 60 >= r.sleepTargetH).length} of
          7 nights on target
        </Text>
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
      <Eyebrow>Protocols this week</Eyebrow>
      <Text tone={done.length ? "default" : "muted"}>
        {done.length
          ? Array.from(
              new Set(
                done.map((d) => protocolById(d.split(":")[1])?.title ?? ""),
              ),
            )
              .filter(Boolean)
              .join(", ")
          : `${first} hasn't marked any recovery protocols done this week.`}
      </Text>
    </>
  );
}

// ---------- Progress ----------

export function Progress({ c }: { c: Client }) {
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
          {c.photoWeeks.slice(-4).map((w) => (
            <PhotoSlot
              key={w}
              uri={c.checkIns.find((k) => k.week === w)?.photos?.front}
              label={w === 0 ? "Start" : `Week ${w}`}
            />
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

export function CheckIns({ c }: { c: Client }) {
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

export function Notes({ c }: { c: Client }) {
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
  statusRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  rings: { flexDirection: "row", justifyContent: "space-between" },
  ring: { alignItems: "center", gap: space[1] },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
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
