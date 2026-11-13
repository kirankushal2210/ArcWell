// Check cardio fitness (D79): the watch's estimate, a 12-minute run (Cooper), a 1-mile walk
// (Rockport) or four questions (non-exercise estimate). The run and walk start with PAR-Q+; any yes
// means talk to a doctor before hard tests or intervals.
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Button,
  PressableScale,
  Text,
  TextField,
} from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { useCardio } from "@/features/cardio/useCardio";
import { Eyebrow, Pills } from "@/features/coach/parts";
import {
  ACTIVITY_SCALE,
  cooperVo2,
  nonExerciseVo2,
  PARQ,
  rockportVo2,
  type TestKind,
} from "@/features/science/cardio";
import { colors, radius, space } from "@/theme";

const OPTIONS: { kind: TestKind; label: string; sub: string }[] = [
  {
    kind: "watch",
    label: "Use my watch's estimate",
    sub: "Type the VO2 max your watch shows",
  },
  {
    kind: "cooper",
    label: "12-minute run",
    sub: "Go as far as you can in 12 minutes",
  },
  {
    kind: "rockport",
    label: "1-mile walk",
    sub: "A brisk walk, gentler; good for starting out",
  },
  {
    kind: "questions",
    label: "Answer 4 questions",
    sub: "A rough estimate, no exercise needed",
  },
];

export default function CardioTest() {
  const cf = useCardio();
  const [kind, setKind] = useState<TestKind>("watch");
  const [step, setStep] = useState<"pick" | "parq" | "enter">("pick");
  const [parq, setParq] = useState<boolean[]>([]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [activity, setActivity] = useState("4");
  if (!cf.me) return <NotJoined />;
  const me = cf.me;
  const weight =
    me.basics?.weightKg ?? me.weights?.[me.weights.length - 1] ?? 70;
  const height = me.basics?.heightCm ?? 172;
  const sex = cf.sex ?? "female";
  const back = backTo("/athlete/cardio");

  const result = (() => {
    const x = Number(a);
    const y = Number(b);
    if (kind === "watch") return x >= 10 && x <= 90 ? x : null;
    if (kind === "cooper") return x >= 500 && x <= 5000 ? cooperVo2(x) : null;
    if (kind === "rockport")
      return x >= 8 && x <= 30 && y >= 60 && y <= 220
        ? rockportVo2({
            weightKg: weight,
            age: cf.age,
            sex,
            minutes: x,
            endHr: y,
          })
        : null;
    return nonExerciseVo2({
      age: cf.age,
      sex,
      weightKg: weight,
      heightCm: height,
      activity: Number(activity),
    });
  })();

  if (step === "parq") {
    const blocked = parq.some(Boolean);
    return (
      <MenuPage
        title="Quick health check"
        sub="Answer honestly. Any yes: check with a doctor before hard tests or intervals."
        back={() => setStep("pick")}
      >
        {PARQ.map((q, i) => (
          <View key={q} style={styles.q}>
            <Text variant="label" style={styles.flex}>
              {q}
            </Text>
            <Pills
              value={parq[i] === undefined ? "" : parq[i] ? "yes" : "no"}
              onChange={(v) =>
                setParq((xs) => Object.assign([...xs], { [i]: v === "yes" }))
              }
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </View>
        ))}
        {blocked ? (
          <InfoCard>
            Please check with a doctor before the run or walk test, or hard
            intervals. You can still use the four-question estimate.
          </InfoCard>
        ) : null}
        <Button
          label="Continue"
          fullWidth
          disabled={PARQ.some((_, i) => parq[i] === undefined) || blocked}
          onPress={() => {
            cf.setParq(true);
            setStep("enter");
          }}
        />
      </MenuPage>
    );
  }

  if (step === "enter")
    return (
      <MenuPage
        title={OPTIONS.find((o) => o.kind === kind)!.label}
        back={() => setStep("pick")}
      >
        {kind === "watch" ? (
          <TextField
            label="VO2 max from your watch"
            keyboardType="number-pad"
            value={a}
            onChangeText={setA}
            placeholder="For example 42"
          />
        ) : kind === "cooper" ? (
          <>
            <InfoCard>
              Warm up for 10 minutes. On a track or flat route, cover as much
              distance as you can in 12 minutes. Stop if you feel chest pain or
              dizziness.
            </InfoCard>
            <TextField
              label="Distance in metres"
              keyboardType="number-pad"
              value={a}
              onChangeText={setA}
              placeholder="For example 2400"
            />
          </>
        ) : kind === "rockport" ? (
          <>
            <InfoCard>
              Walk 1 mile (1.6 km) as fast as you can without running, then read
              your heart rate straight away.
            </InfoCard>
            <TextField
              label="Time in minutes"
              keyboardType="number-pad"
              value={a}
              onChangeText={setA}
              placeholder="For example 15"
            />
            <TextField
              label="Heart rate at the end (bpm)"
              keyboardType="number-pad"
              value={b}
              onChangeText={setB}
              placeholder="For example 130"
            />
          </>
        ) : (
          <>
            <Eyebrow>Over the past month, how active were you?</Eyebrow>
            {ACTIVITY_SCALE.map((o) => (
              <PressableScale
                key={o.value}
                onPress={() => setActivity(String(o.value))}
                accessibilityRole="radio"
                accessibilityState={{ selected: activity === String(o.value) }}
                accessibilityLabel={o.label}
                style={[
                  styles.opt,
                  activity === String(o.value) && styles.optOn,
                ]}
              >
                <Text variant="label" weight="medium">
                  {o.label}
                </Text>
              </PressableScale>
            ))}
            <Text variant="caption" tone="muted">
              Uses your age, sex, height and weight from your profile.
            </Text>
          </>
        )}
        {result !== null ? (
          <InfoCard title={`About ${result} ml/kg/min`}>
            {kind === "questions"
              ? "A rough estimate. A test or a watch will be closer."
              : "Saved as your current estimate. Compare your own numbers over time."}
          </InfoCard>
        ) : null}
        <Button
          label="Save"
          fullWidth
          disabled={result === null}
          onPress={() => {
            if (result === null) return;
            cf.addTest({
              kind,
              vo2: result,
              detail:
                kind === "cooper"
                  ? `${a} m`
                  : kind === "rockport"
                    ? `${a} min, ${b} bpm`
                    : undefined,
            });
            router.replace("/athlete/cardio");
          }}
        />
      </MenuPage>
    );

  return (
    <MenuPage
      title="Check your cardio fitness"
      sub="Pick one. We turn it into a VO2 max estimate and compare it with people your age."
      back={back}
    >
      {OPTIONS.map((o) => (
        <PressableScale
          key={o.kind}
          onPress={() => setKind(o.kind)}
          accessibilityRole="radio"
          accessibilityState={{ selected: kind === o.kind }}
          accessibilityLabel={`${o.label}. ${o.sub}`}
          style={[styles.opt, kind === o.kind && styles.optOn]}
        >
          <Text weight="semibold">{o.label}</Text>
          <Text variant="caption" tone="muted">
            {o.sub}
          </Text>
        </PressableScale>
      ))}
      <Text variant="caption" tone="muted">
        The run and walk start with a short health check (PAR-Q+).
      </Text>
      <Button
        label="Continue"
        fullWidth
        onPress={() =>
          setStep(
            (kind === "cooper" || kind === "rockport") && !cf.c.parq?.clear
              ? "parq"
              : "enter",
          )
        }
      />
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  q: { gap: space[1] },
  opt: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space[3],
    gap: space[1] / 2,
  },
  optOn: { borderWidth: 1.5, borderColor: colors.text },
});
