// A client's check-ins (sitemap §5 Check-ins): every week's check-in and your reply, and the day
// of the week it's due (the coach picks it per client).
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { CheckIns } from "@/features/coach/ClientSections";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import { colors } from "@/theme";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClientCheckIns() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, setCheckInDay } = useCoachData();
  const c = client(id);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");
  return (
    <View style={styles.root}>
      <PageHeader title="Check-ins" sub={c?.name} onBack={back} />
      {c ? (
        <Page>
          <Eyebrow>Due every</Eyebrow>
          <Pills
            value={c.checkInDay}
            onChange={(d) => setCheckInDay(c.id, d)}
            options={DAYS.map((d) => ({ value: d, label: d.slice(0, 3) }))}
          />
          <Text variant="caption" tone="muted">
            {c.name.split(" ")[0]} gets a reminder that morning with photos,
            weight and the weekly questions.
          </Text>
          <Eyebrow>History</Eyebrow>
          <CheckIns c={c} />
        </Page>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
