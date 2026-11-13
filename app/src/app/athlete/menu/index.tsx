// Side menu (N-04 free, N-05 Pro and coached; D9, D10): the same menu for every athlete. Account
// and notifications, the training extras, and Physique, which is free for everyone (D5). There is
// never an AI item here (D2); Recovery lives in its tab. No Set Videos (D14).
import { router } from "expo-router";
import {
  AlarmClock,
  Bell,
  BookOpen,
  CalendarRange,
  ChartColumn,
  Camera,
  ChartLine,
  Dumbbell,
  History,
  ListChecks,
  MapPin,
  Ruler,
  Scale,
  UserRound,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Avatar, Text } from "@/components/primitives";
import { backTo, MenuPage, NavRow } from "@/features/athlete/MenuParts";
import { useNotifications } from "@/features/athlete/notifications";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export default function AthleteMenu() {
  const me = useMe();
  const { meTier, coachName } = useCoachData();
  const notes = useNotifications();
  if (!me) return <NotJoined />;
  const free = meTier === "free";
  const tier =
    meTier === "coached"
      ? `Pro · ${coachName}`
      : meTier === "pro"
        ? "Pro · AI plan"
        : "Free";

  return (
    <MenuPage title="Menu" back={backTo("/athlete")}>
      <View style={styles.card}>
        <Avatar name={me.name} uri={me.photo} size={48} />
        <View style={styles.flex}>
          <Text variant="title">{me.name}</Text>
          <Text variant="label" weight="regular" tone="muted">
            {tier}
          </Text>
        </View>
      </View>
      <Group>
        <NavRow
          first
          icon={UserRound}
          label="Account"
          sub="Profile, privacy, units, your data"
          onPress={() => router.push("/athlete/menu/account")}
        />
        <NavRow
          icon={AlarmClock}
          label="Reminders"
          sub="Workout, weigh-in, meals, wind-down"
          onPress={() => router.push("/athlete/menu/reminders")}
        />
        <NavRow
          icon={Bell}
          label="Notifications"
          value={notes.unread ? `${notes.unread} new` : undefined}
          onPress={() => router.push("/athlete/menu/notifications")}
        />
      </Group>

      <Eyebrow>Training</Eyebrow>
      <Group>
        <NavRow
          first
          icon={Dumbbell}
          label="Exercises"
          onPress={() => router.push("/athlete/exercises")}
        />
        <NavRow
          icon={ListChecks}
          label="Workouts"
          sub="Your plan and your own routines"
          onPress={() => router.push("/athlete/training")}
        />
        <NavRow
          icon={CalendarRange}
          label="Programs"
          value={free ? "Plus" : undefined}
          onPress={() => router.push("/athlete/programs")}
        />
        <NavRow
          icon={ChartColumn}
          label="Muscle Analytics"
          value={free ? "Plus" : undefined}
          onPress={() => router.push("/athlete/analytics")}
        />
        <NavRow
          icon={History}
          label="History"
          onPress={() => router.push("/athlete/history")}
        />
      </Group>

      <Group>
        <NavRow
          first
          icon={MapPin}
          label="Gyms"
          sub="Find a gym near you"
          onPress={() => router.push("/athlete/gyms")}
        />
      </Group>

      <Eyebrow>Physique</Eyebrow>
      <Group>
        <NavRow
          first
          icon={Scale}
          label="Bodyweight"
          onPress={() => router.push("/athlete/physique/bodyweight")}
        />
        <NavRow
          icon={Ruler}
          label="Measurements"
          onPress={() => router.push("/athlete/physique/measurements")}
        />
        <NavRow
          icon={Camera}
          label="Photos"
          onPress={() => router.push("/athlete/physique/photos")}
        />
        <NavRow
          icon={ChartLine}
          label="Charts"
          onPress={() => router.push("/athlete/physique/charts")}
        />
      </Group>

      <Group>
        <NavRow
          first
          icon={BookOpen}
          label="The science behind Arcwell"
          sub="The research every target and plan follows"
          onPress={() => router.push("/science")}
        />
      </Group>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
