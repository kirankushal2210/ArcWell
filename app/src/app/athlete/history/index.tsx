// Workout history (F4-13): grouped by week with "X of Y" against the plan, a calm consistency signal
// instead of streaks. Tap a workout for its read-only log.
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { type Session, weekStart } from "@/features/athlete/training";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
} from "@/features/coach/parts";
import { colors, space } from "@/theme";

export default function HistoryList() {
  const me = useMe();
  const { sessions } = useCoachData();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/training");
  if (!me) return <NotJoined />;
  const all = sessions(me.id);
  const perWeek = 7 - (me.protocol?.restDays.length ?? 3);
  const thisMonday = weekStart(new Date()).getTime();

  const weeks = new Map<number, Session[]>();
  for (const s of all) {
    const k = weekStart(new Date(s.at)).getTime();
    weeks.set(k, [...(weeks.get(k) ?? []), s]);
  }

  return (
    <View style={styles.root}>
      <PageHeader title="History" onBack={back} />
      <Page>
        {all.length === 0 ? (
          <Text tone="muted">
            Finished workouts show here, with time, volume and your best sets.
          </Text>
        ) : (
          [...weeks.entries()].map(([k, list]) => (
            <View key={k} style={styles.week}>
              <Eyebrow>
                {`${k === thisMonday ? "This week" : `Week of ${new Date(k).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`} · ${list.length} of ${perWeek}`}
              </Eyebrow>
              <Group>
                {list.map((s, i) => (
                  <GroupRow
                    key={s.id}
                    first={i === 0}
                    label={s.name}
                    onPress={() =>
                      router.push({
                        pathname: "/athlete/history/[id]",
                        params: { id: s.id },
                      })
                    }
                  >
                    <View style={styles.flex}>
                      <Text weight="semibold">{s.name}</Text>
                      <Text
                        variant="label"
                        weight="regular"
                        tone="muted"
                        numeric
                      >
                        {new Date(s.at).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {s.minutes} min · {s.volume.toLocaleString("en-IN")}{" "}
                        kg
                        {s.bests.length
                          ? ` · ${s.bests.length} best${s.bests.length > 1 ? "s" : ""}`
                          : ""}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </GroupRow>
                ))}
              </Group>
            </View>
          ))
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  week: { gap: space[2] },
});
