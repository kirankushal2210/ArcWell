// Photo food logging (F5-09 to F5-11; D70): take or choose a photo of the plate, the AI finds the
// foods and portions, and nothing is logged until the athlete checks and confirms each one.
// Sample build: there's no AI yet, so the "found" foods are a fixed sample thali, labelled as such.
import { router, useLocalSearchParams } from "expo-router";
import { Camera, Check, ScanSearch } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Button,
  NumberStepper,
  PressableScale,
  Text,
} from "@/components/primitives";
import { PHOTO_SAMPLE } from "@/features/ai/nutritionAssist";
import { todayKey, useNutrition } from "@/features/athlete/FoodParts";
import {
  findFood,
  logFromItem,
  type MealSlot,
  searchFoods,
  slotLabel,
  sumMacros,
} from "@/features/athlete/foods";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow } from "@/features/coach/parts";
import { choosePhoto } from "@/features/coach/PhotoSlot";
import { uid } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";

type Step = "take" | "analysing" | "confirm";

export default function PhotoLog() {
  const p = useLocalSearchParams<{ meal?: MealSlot; date?: string }>();
  const n = useNutrition();
  const { addFoodLogs, myFoods } = useCoachData();
  const [step, setStep] = useState<Step>("take");
  const [items, setItems] = useState(() =>
    PHOTO_SAMPLE.map((x) => ({
      ...x,
      food: searchFoods(x.name, [])[0],
      keep: true,
    })).filter((x) => !!x.food),
  );
  const meal: MealSlot = p.meal ?? "lunch";
  const date = p.date || todayKey();
  const back = backTo("/athlete/food/add");

  useEffect(() => {
    if (step !== "analysing") return;
    const t = setTimeout(() => setStep("confirm"), 1400);
    return () => clearTimeout(t);
  }, [step]);

  if (!n.me) return null;
  const me = n.me;

  if (step === "take")
    return (
      <MenuPage
        title="Log with a photo"
        back={back}
        footer={
          <View style={styles.buttons}>
            <Button
              label="Take or choose a photo"
              icon={Camera}
              fullWidth
              onPress={() => choosePhoto(() => setStep("analysing"))}
            />
            <Button
              label="Use a sample photo"
              variant="ghost"
              fullWidth
              onPress={() => setStep("analysing")}
            />
          </View>
        }
      >
        <View style={styles.hero}>
          <ScanSearch size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            Snap your plate
          </Text>
          <Text tone="muted" style={styles.center}>
            The whole plate from above, in good light. You&apos;ll check every
            food and portion before anything is logged.
          </Text>
        </View>
        <InfoCard>
          Sample build: the AI isn&apos;t connected yet, so any photo shows the
          same sample thali.
        </InfoCard>
      </MenuPage>
    );

  if (step === "analysing")
    return (
      <MenuPage title="Log with a photo" back={back}>
        <View style={styles.hero}>
          <ScanSearch size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            Finding the foods…
          </Text>
          <Text tone="muted" style={styles.center}>
            Looking for dishes and portions on your plate.
          </Text>
        </View>
      </MenuPage>
    );

  const kept = items.filter((x) => x.keep);
  const logs = kept
    .map((x) =>
      logFromItem(
        { foodId: x.food.id, qty: x.qty, unit: x.food.units[0]?.key ?? "g" },
        date,
        meal,
        uid("f"),
        myFoods,
      ),
    )
    .filter((l): l is NonNullable<typeof l> => !!l);
  const total = sumMacros(logs.map((l) => l.macros));

  return (
    <MenuPage
      title="Check what we found"
      sub={`${slotLabel(meal)} · sample result`}
      back={() => setStep("take")}
      footer={
        <Button
          label={`Log ${kept.length} ${kept.length === 1 ? "food" : "foods"} · ${Math.round(total.kcal)} kcal`}
          fullWidth
          disabled={!kept.length}
          onPress={() => {
            addFoodLogs(me.id, logs);
            router.replace({ pathname: "/athlete/nutrition" });
          }}
        />
      }
    >
      <Text tone="muted">
        Untick anything that isn&apos;t there and fix the portions. Items marked
        Check are the ones we&apos;re least sure about.
      </Text>
      <Group>
        {items.map((x, i) => {
          const f = findFood(x.food.id) ?? x.food;
          const unit = f.units[0]?.label ?? "g";
          return (
            <GroupRow key={x.name} first={i === 0}>
              <PressableScale
                onPress={() =>
                  setItems((xs) =>
                    xs.map((y, k) => (k === i ? { ...y, keep: !y.keep } : y)),
                  )
                }
                accessibilityRole="checkbox"
                accessibilityState={{ checked: x.keep }}
                accessibilityLabel={f.name}
                style={[styles.box, x.keep && styles.boxOn]}
              >
                {x.keep ? (
                  <Check size={16} strokeWidth={3} color={colors.onAccent} />
                ) : null}
              </PressableScale>
              <View style={styles.flex}>
                <Text weight="medium" tone={x.keep ? "default" : "muted"}>
                  {f.name}
                </Text>
                <Text
                  variant="label"
                  weight="regular"
                  tone={x.confidence === "check" ? "warning" : "muted"}
                >
                  {x.confidence === "check" ? "Check this one" : "Looks right"}{" "}
                  · {unit}
                </Text>
              </View>
              <NumberStepper
                value={x.qty}
                onChange={(v) =>
                  setItems((xs) =>
                    xs.map((y, k) => (k === i ? { ...y, qty: v } : y)),
                  )
                }
                step={0.5}
                decimals={1}
                min={0.5}
                max={6}
                accessibilityLabel={`${f.name} portions`}
              />
            </GroupRow>
          );
        })}
      </Group>
      <Text variant="caption" tone="muted" numeric>
        {n.macros
          ? `${Math.round(total.kcal)} kcal · ${Math.round(total.p)} g protein · ${Math.round(total.c)} g carbs · ${Math.round(total.f)} g fat`
          : `${Math.round(total.kcal)} kcal`}
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  hero: { alignItems: "center", gap: space[3], paddingTop: space[6] },
  buttons: { gap: space[1] },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
