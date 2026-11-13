// Training calendar (D91), from Progress: a month at a time, workout days in red, with the month's
// count. Tap a day with a workout to open it.
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { IconButton, PressableScale, Text } from "@/components/primitives";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { workoutDays } from "@/features/athlete/stats";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { colors, radius, space } from "@/theme";

const MONTHS =
  "January February March April May June July August September October November December".split(
    " ",
  );
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Calendar() {
  const me = useMe();
  const { sessions } = useCoachData();
  const today = new Date();
  const [month, setMonth] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/progress");
  const list = sessions(me.id);
  const days = workoutDays(list, month.y, month.m);
  const first = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
  const count = new Date(month.y, month.m + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first }, () => 0),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
  const shift = (by: number) => {
    const d = new Date(month.y, month.m + by, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const open = (day: number) => {
    const s = list.find((x) => {
      const d = new Date(x.at);
      return (
        d.getFullYear() === month.y &&
        d.getMonth() === month.m &&
        d.getDate() === day
      );
    });
    if (s)
      router.push({ pathname: "/athlete/history/[id]", params: { id: s.id } });
  };
  const isToday = (d: number) =>
    month.y === today.getFullYear() &&
    month.m === today.getMonth() &&
    d === today.getDate();

  return (
    <MenuPage title="Calendar" back={back}>
      <View style={styles.card}>
        <View style={styles.head}>
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Previous month"
            onPress={() => shift(-1)}
          />
          <View style={styles.title}>
            <Text weight="semibold">{`${MONTHS[month.m]} ${month.y}`}</Text>
            <Text variant="caption" tone="muted">
              {`${days.size} workout${days.size === 1 ? "" : "s"}`}
            </Text>
          </View>
          <IconButton
            icon={ChevronRight}
            accessibilityLabel="Next month"
            onPress={() => shift(1)}
          />
        </View>
        <View style={styles.grid}>
          {DAYS.map((d, i) => (
            <View key={`h${i}`} style={styles.cell}>
              <Text variant="caption" tone="muted">
                {d}
              </Text>
            </View>
          ))}
          {cells.map((d, i) =>
            d ? (
              <PressableScale
                key={i}
                onPress={() => open(d)}
                disabled={!days.has(d)}
                accessibilityRole="button"
                accessibilityLabel={`${d} ${MONTHS[month.m]}${days.has(d) ? ", workout" : ""}`}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.day,
                    days.has(d) && styles.dayOn,
                    isToday(d) && styles.today,
                  ]}
                >
                  <Text
                    variant="label"
                    weight={days.has(d) ? "semibold" : "regular"}
                    tone={days.has(d) ? "onBrand" : "default"}
                    numeric
                  >
                    {String(d)}
                  </Text>
                </View>
              </PressableScale>
            ) : (
              <View key={i} style={styles.cell} />
            ),
          )}
        </View>
      </View>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: space[2],
  },
  head: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  day: {
    width: space[8] + space[1],
    height: space[8] + space[1],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dayOn: { backgroundColor: colors.brand },
  today: { borderWidth: 1.5, borderColor: colors.accent },
});
