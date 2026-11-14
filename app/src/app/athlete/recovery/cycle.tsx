// Cycle (D98): for women who want it. Log the day a period starts; Arcwell shows the cycle day, the
// average length and when the next one is likely. No training rules: cycle phase changed
// performance only trivially on average, so plans don't change by phase (mcnulty2020).
import { Redirect } from "expo-router";
import { X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { plusOnly } from "@/features/athlete/PlusOnly";
import { Button, IconButton, Text } from "@/components/primitives";
import { dateLabel, shiftDate } from "@/features/athlete/foods";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { Ring } from "@/features/athlete/NutritionParts";
import { cycleInfo } from "@/features/athlete/recoveryInsights";
import { todayDate } from "@/features/athlete/recovery";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { WhyThis } from "@/features/science/WhyThis";
import { space } from "@/theme";

export default plusOnly(Cycle);

function Cycle() {
  const me = useMe();
  const { settingsOf, setAthleteSettings } = useCoachData();
  if (!me) return <NotJoined />;
  if (me.basics?.sex !== "female") return <Redirect href="/athlete/recovery" />;
  const today = todayDate();
  const periods = [...(settingsOf(me.id).periods ?? [])].sort().reverse();
  const info = cycleInfo(periods, today);
  const save = (next: string[]) =>
    setAthleteSettings(me.id, {
      periods: [...new Set(next)].sort().reverse(),
    });
  const back = backTo("/athlete/recovery");

  return (
    <MenuPage title="Cycle" back={back}>
      <View style={styles.hero}>
        <Ring
          size={120}
          stroke={10}
          progress={info ? info.day / info.length : 0}
        >
          <Text style={styles.day} numeric>
            {info ? String(info.day) : "—"}
          </Text>
          <Text variant="caption" tone="muted">
            {info ? "cycle day" : "no data"}
          </Text>
        </Ring>
        {info ? (
          <Text tone="muted" numeric>
            {`Next period in about ${info.daysToNext} days · ${info.length}-day cycle`}
          </Text>
        ) : null}
        <WhyThis
          label="Why?"
          title="Your cycle and training"
          points={[
            "Across studies, cycle phase changed performance only by a trivial amount on average, and women differed a lot, so Arcwell doesn't change your plan by phase.",
            "Notice your own pattern: on days you feel flat, a lighter session is fine.",
          ]}
          sources={["mcnulty2020"]}
        />
      </View>

      <Eyebrow>Period started</Eyebrow>
      <View style={styles.buttons}>
        {[0, 1, 2].map((d) => (
          <View key={d} style={styles.flex}>
            <Button
              label={d === 0 ? "Today" : d === 1 ? "Yesterday" : "2 days ago"}
              variant={d === 0 ? "primary" : "secondary"}
              size="sm"
              fullWidth
              onPress={() => save([...periods, shiftDate(today, -d)])}
            />
          </View>
        ))}
      </View>

      {periods.length ? (
        <>
          <Eyebrow>History</Eyebrow>
          <Group>
            {periods.map((p, i) => (
              <GroupRow key={p} first={i === 0}>
                <Text style={styles.flex}>{dateLabel(p, today)}</Text>
                <IconButton
                  icon={X}
                  accessibilityLabel={`Remove ${p}`}
                  onPress={() => save(periods.filter((x) => x !== p))}
                />
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { alignItems: "center", gap: space[3], paddingTop: space[2] },
  day: { fontSize: 32, lineHeight: 38, fontWeight: "700" },
  buttons: { flexDirection: "row", gap: space[2] },
});
