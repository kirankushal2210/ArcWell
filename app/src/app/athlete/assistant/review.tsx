// Weekly review (D70): the last 7 days of training, food and recovery against your plan, then a few
// suggestions, each with its reason and sources. Suggestions open the tool to act on them; nothing
// changes by itself. Sample build: worked out by the evidence rules, not a model.
import { type Href, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { todayKey, useNutrition } from "@/features/athlete/FoodParts";
import { shiftDate, sumMacros } from "@/features/athlete/foods";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { todayDate } from "@/features/athlete/recovery";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, KeyValues } from "@/features/coach/parts";
import { SLEEP_NEED_H, volumeIssues } from "@/features/science/rules";
import { WhyThis } from "@/features/science/WhyThis";
import { colors, radius, space } from "@/theme";

type Suggestion = {
  title: string;
  text: string;
  sources: string[];
  action: string;
  href: Href;
};

export default function WeeklyReview() {
  const me = useMe();
  const n = useNutrition();
  const r = useRecovery();
  const { meTier, sessions } = useCoachData();
  const [now] = useState(() => Date.now());
  if (!me || !n.me || meTier !== "pro") return <NotJoined />;
  const back = backTo("/athlete/ai");

  const weekAgo = now - 7 * 864e5;
  const done = sessions(me.id).filter(
    (s) => new Date(s.at).getTime() >= weekAgo,
  );
  const planned = me.protocol
    ? 7 - me.protocol.restDays.length
    : (me.program?.days.length ?? 0);
  const today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(today, -i));
  const logged = days.filter((d) => n.logs.some((l) => l.date === d));
  const avg = logged.length
    ? sumMacros(
        n.logs.filter((l) => logged.includes(l.date)).map((l) => l.macros),
      )
    : null;
  const avgKcal = avg ? avg.kcal / logged.length : 0;
  const avgProtein = avg ? avg.p / logged.length : 0;
  const recDays = Array.from({ length: 7 }, (_, i) =>
    r.day(shiftDate(todayDate(), -i)),
  );
  const avgSleepH = recDays.reduce((s, d) => s + d.sleep.minutes, 0) / 7 / 60;
  const high = volumeIssues(
    done.map((s) => ({
      name: s.name,
      exercises: s.exercises.map((e) => ({
        name: e.name,
        sets: e.sets.filter((x) => !x.warmup).length,
      })),
    })),
  ).filter((i) => i.kind === "high");

  const tips: Suggestion[] = [];
  if (
    me.nutritionPlan &&
    logged.length &&
    avgProtein < me.nutritionPlan.protein - 15
  )
    tips.push({
      title: "Close the protein gap",
      text: `You averaged ${Math.round(avgProtein)} g against ${me.nutritionPlan.protein} g. One more protein serving a day, like curd, paneer, eggs or dal, gets you most of the way.`,
      sources: ["morton2018", "jager2017"],
      action: "Protein ideas",
      href: "/athlete/assistant/nutrition",
    });
  if (avgSleepH < SLEEP_NEED_H[0])
    tips.push({
      title: "Protect your sleep",
      text: `You averaged ${avgSleepH.toFixed(1)} hours. Adults do best on 7 to 9; going to bed 30 minutes earlier is the easiest first step.`,
      sources: ["hirshkowitz2015", "watson2015"],
      action: "Open Recovery",
      href: "/athlete/recovery",
    });
  if (planned && done.length < planned)
    tips.push({
      title: "Make sessions easier to start",
      text: `You did ${done.length} of ${planned} workouts. On busy days, a 30-minute version that keeps the big lifts still moves you forward.`,
      sources: ["schoenfeld2017volume"],
      action: "Tailor today",
      href: "/athlete/assistant/tailor",
    });
  for (const h of high.slice(0, 1))
    tips.push({
      title: `Check your ${h.label.toLowerCase()} volume`,
      text: h.text,
      sources: ["pelland2026", "schoenfeld2017volume"],
      action: "See Muscle Analytics",
      href: "/athlete/analytics",
    });

  return (
    <MenuPage title="Weekly review" sub="Last 7 days · sample" back={back}>
      <Eyebrow>Training</Eyebrow>
      <KeyValues
        rows={[
          ["Workouts", `${done.length} of ${planned}`],
          ["Sets logged", String(done.reduce((s, x) => s + x.setsDone, 0))],
        ]}
      />
      <Eyebrow>Food</Eyebrow>
      <KeyValues
        rows={[
          ["Days logged", `${logged.length} of 7`],
          [
            "Average energy",
            logged.length
              ? `${Math.round(avgKcal).toLocaleString("en-IN")} kcal${me.nutritionPlan ? ` of ${me.nutritionPlan.kcal.toLocaleString("en-IN")}` : ""}`
              : "—",
          ],
          ...(n.macros
            ? ([
                [
                  "Average protein",
                  logged.length
                    ? `${Math.round(avgProtein)} g${me.nutritionPlan ? ` of ${me.nutritionPlan.protein} g` : ""}`
                    : "—",
                ],
              ] as [string, string][])
            : []),
        ]}
      />
      <Eyebrow>Recovery</Eyebrow>
      <KeyValues rows={[["Average sleep", `${avgSleepH.toFixed(1)} h`]]} />

      <Eyebrow>Suggestions</Eyebrow>
      {tips.length ? (
        tips.map((t) => (
          <View key={t.title} style={styles.card}>
            <View style={styles.head}>
              <Text weight="semibold" style={styles.flex}>
                {t.title}
              </Text>
              <WhyThis title={t.title} points={[t.text]} sources={t.sources} />
            </View>
            <Text tone="muted">{t.text}</Text>
            <Button
              label={t.action}
              size="sm"
              variant="secondary"
              onPress={() => router.push(t.href)}
            />
          </View>
        ))
      ) : (
        <InfoCard title="A solid week">
          Training, food and sleep are on track. Keep going.
        </InfoCard>
      )}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  flex: { flex: 1 },
});
