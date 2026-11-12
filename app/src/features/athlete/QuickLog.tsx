// The + button and quick log sheet (D67): a round glass button at the bottom right, next to the
// tab bar, in the same place on every athlete tab. It opens a sheet of the things people log most:
// colour tiles for workout, food and recovery (you pick by colour before you read), then weight in
// one tap. The AI coach lives here and in Today's toolbar for self-guided athletes; coached athletes
// get their weekly check-in instead and never see AI (D44).
import type { Href } from "expo-router";
import { router } from "expo-router";
import {
  Camera,
  Dumbbell,
  Moon,
  Plus,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/GlassSurface";
import {
  Button,
  NumberStepper,
  PressableScale,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { TAB_BAR_HEIGHT, tabBarBottom } from "@/features/coach/parts";
import { todayIndex, weekSchedule } from "@/features/coach/plans";
import { colors, radius, rhythm, space } from "@/theme";

import { slotNow } from "./FoodParts";
import { Sheet, SheetRow } from "./Sheet";
import { emptyWorkout } from "./training";
import { useMe } from "./useMe";
import { GLASS_ML, ml, useWater } from "./Water";

/** Width the tab bar leaves free for the + button: the button plus the gap before it. */
export const PLUS_RESERVE = TAB_BAR_HEIGHT + space[2];

/** Today's planned workout, whether a workout is already logged today, and whether one is running. */
export function useTodayWorkout() {
  const me = useMe();
  const { active, sessions } = useCoachData();
  const schedule = me?.program
    ? weekSchedule(me.program, me.protocol?.restDays ?? [])
    : [];
  const day = schedule[todayIndex()]?.day ?? null;
  const today = new Date().toDateString();
  const done =
    !!me &&
    sessions(me.id).some((x) => new Date(x.at).toDateString() === today);
  const resuming = !!active && (!day || active.dayId === day.id);
  return { day, done, resuming };
}

type Tile = {
  label: string;
  icon: LucideIcon;
  fill: string;
  onPress: () => void;
};

export function QuickLog() {
  const me = useMe();
  const { meTier, active, setActive, logWeight, settingsOf } = useCoachData();
  const insets = useSafeAreaInsets();
  const today = useTodayWorkout();
  const water = useWater();
  const [open, setOpen] = useState(false);
  const last = me?.weights[me.weights.length - 1] ?? 70;
  const [kg, setKg] = useState(last);
  const [saved, setSaved] = useState(false);
  if (!me) return null;

  const go = (href: Href) => {
    setOpen(false);
    router.push(href);
  };
  const coached = meTier === "coached";
  const tiles: Tile[] = [
    {
      label: today.resuming
        ? "Resume workout"
        : today.day && !today.done
          ? "Start workout"
          : "Empty workout",
      icon: Dumbbell,
      fill: colors.training,
      onPress: () => {
        if (active || (today.day && !today.done)) {
          go(
            active
              ? "/athlete/workout"
              : {
                  pathname: "/athlete/workout/preview/[dayId]",
                  params: { dayId: today.day?.id ?? "" },
                },
          );
          return;
        }
        setActive(emptyWorkout());
        go("/athlete/workout");
      },
    },
    {
      label: "Log food",
      icon: Utensils,
      fill: colors.nutrition,
      onPress: () =>
        go({ pathname: "/athlete/food/add", params: { meal: slotNow() } }),
    },
  ];
  if (meTier !== "free")
    tiles.push({
      label: "Morning check-in",
      icon: Moon,
      fill: colors.recovery,
      onPress: () => go("/athlete/recovery/check-in"),
    });
  const aiOff = !coached && !settingsOf(me.id).ai;
  if (!aiOff)
    tiles.push(
      coached
        ? {
            label: "Weekly check-in",
            icon: Camera,
            fill: colors.surfaceRaised,
            onPress: () => go("/athlete/weekly-check-in"),
          }
        : {
            label: meTier === "free" ? "AI coach · try free" : "Ask AI coach",
            icon: Sparkles,
            fill: colors.surfaceRaised,
            onPress: () => go("/athlete/ai"),
          },
    );

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { bottom: tabBarBottom(insets.bottom) }]}
      >
        <PressableScale
          onPress={() => {
            setKg(last);
            setSaved(false);
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Log something"
        >
          <GlassSurface style={styles.plus}>
            {/* A View so the icon paints above the blur layers on web. */}
            <View>
              <Plus size={26} strokeWidth={2.2} color={colors.text} />
            </View>
          </GlassSurface>
        </PressableScale>
      </View>

      <Sheet visible={open} onClose={() => setOpen(false)} title="Log">
        <View style={styles.grid}>
          {tiles.map((t) => {
            const onFill = t.fill !== colors.surfaceRaised;
            const Icon = t.icon;
            return (
              <PressableScale
                key={t.label}
                onPress={t.onPress}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                style={[styles.tile, { backgroundColor: t.fill }]}
              >
                <Icon
                  size={22}
                  color={onFill ? colors.onPillar : colors.text}
                />
                <Text weight="semibold" tone={onFill ? "onBrand" : "default"}>
                  {t.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.weight}>
          <View style={styles.flex}>
            <Text weight="medium">Weight</Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {saved ? "Saved for today" : `Last ${last.toFixed(1)} kg`}
            </Text>
          </View>
          <NumberStepper
            value={kg}
            onChange={(v) => {
              setKg(v);
              setSaved(false);
            }}
            step={0.1}
            decimals={1}
            min={30}
            max={250}
            unit="kg"
            accessibilityLabel="Bodyweight"
          />
          <Button
            label={saved ? "Saved" : "Save"}
            size="sm"
            variant={saved ? "secondary" : "primary"}
            disabled={saved}
            onPress={() => {
              logWeight(me.id, kg);
              setSaved(true);
            }}
          />
        </View>
        <View style={styles.weight}>
          <View style={styles.flex}>
            <Text weight="medium">Water</Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {`${ml(water.today)} today`}
            </Text>
          </View>
          <Button
            label={`+${GLASS_ML} ml`}
            size="sm"
            variant="secondary"
            onPress={() => water.add(GLASS_ML)}
          />
        </View>
        <SheetRow
          label="Quick add calories"
          sub="When you know the number but not the food"
          onPress={() =>
            go({ pathname: "/athlete/food/quick", params: { meal: slotNow() } })
          }
        />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: rhythm.gutter },
  plus: {
    width: TAB_BAR_HEIGHT,
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1, gap: space[1] / 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space[2],
    paddingTop: space[1],
  },
  tile: {
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 76,
    justifyContent: "space-between",
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
  },
  weight: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingTop: space[2],
  },
});
