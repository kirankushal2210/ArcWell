// Progress (CP-01 to CP-06, D91): training by week (duration, volume, reps), a dashboard into
// statistics, exercises, measures and the calendar, then bodyweight. Everyone gets it; coached
// athletes also have Check-ins and Chat. Check-ins · Progress · Chat as section tabs
// (D61). Check-ins shows the week's check-in (due, sent and waiting, or replied) and every past one
// with the coach's reply, each opening read-only. Progress is bodyweight against the coach's goal
// with a quick weigh-in and the way into Physique. Chat previews the latest messages and opens the
// full conversation, so the tab bar never covers the message box. Each section docks its action.
import { router } from "expo-router";
import {
  CalendarDays,
  Camera,
  ChartColumn,
  ChartLine,
  Dumbbell,
  MessageCircle,
  Ruler,
  Scale,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar, PressableScale, Text } from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import { athleteMenuAction, NavRow } from "@/features/athlete/MenuParts";
import { TrainingChart } from "@/features/athlete/TrainingChart";
import {
  AthleteDock,
  AthletePage,
  NotJoined,
  useMe,
} from "@/features/athlete/useMe";
import { dueText, sentThisWeek } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";
import {
  Eyebrow,
  Group,
  GroupRow,
  PageHeader,
  StatTile,
  WeightChart,
} from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Tab = "checkins" | "progress" | "chat";

/** The four ways into training stats from Progress (D91). */
const DASHBOARD = [
  { label: "Statistics", icon: ChartColumn, href: "/athlete/analytics" },
  { label: "Exercises", icon: Dumbbell, href: "/athlete/exercises" },
  { label: "Measures", icon: Ruler, href: "/athlete/physique/measurements" },
  { label: "Calendar", icon: CalendarDays, href: "/athlete/calendar" },
] as const;
const TABS: { key: Tab; label: string }[] = [
  { key: "checkins", label: "Check-ins" },
  { key: "progress", label: "Progress" },
  { key: "chat", label: "Chat" },
];

export default function Progress() {
  const me = useMe();
  const { coachName, settingsOf, sessions, meTier } = useCoachData();
  const coached = meTier === "coached";
  const [tab, setTab] = useState<Tab>("checkins");
  if (!me) return <NotJoined />;
  const first = coachName.replace(/^Coach\s+/, "");
  const last = me.weights[me.weights.length - 1] ?? 70;
  const start = me.weights[0] ?? last;
  const k = me.checkIns[0];
  const sent = sentThisWeek(me);
  const paused = me.status === "paused";
  const photosOff = !settingsOf(me.id).photos;

  const checkins = (
    <AthletePage key="c" dock>
      <View style={styles.card}>
        <Text variant="title">
          {paused
            ? "Check-ins are paused"
            : !me.checkIns.length
              ? "Send your starting point"
              : sent
                ? k?.reviewed
                  ? `${first} replied`
                  : "Check-in sent"
                : "This week's check-in"}
        </Text>
        <Text tone="muted">
          {paused
            ? `${first} paused check-ins${me.statusUntil ? ` until ${me.statusUntil}` : ""}. Your plan and chat still work.`
            : !me.checkIns.length
              ? "Photos and weight, so you can see how far you come."
              : sent
                ? k?.reviewed
                  ? (k.reply ?? "")
                  : `${first} will look at it and reply here.`
                : `${dueText(me)} · weight, waist, six quick scores and how the week went.`}
        </Text>
        {!paused && !sent && photosOff ? (
          <Text variant="label" weight="regular" tone="muted">
            Photos are off, so this check-in goes without them. Turn them on in
            Privacy any time.
          </Text>
        ) : null}
      </View>
      {me.checkIns.length ? (
        <>
          <Eyebrow>Your check-ins</Eyebrow>
          <Group>
            {me.checkIns.map((c, i) => (
              <NavRow
                key={c.id}
                first={i === 0}
                label={c.week === 0 ? "Starting point" : `Week ${c.week}`}
                sub={
                  c.reviewed && c.reply
                    ? `${first}: ${c.reply}`
                    : "Waiting for a reply"
                }
                value={c.submitted}
                onPress={() =>
                  router.push({
                    pathname: "/athlete/check-in/[id]",
                    params: { id: c.id },
                  })
                }
              />
            ))}
          </Group>
        </>
      ) : null}
    </AthletePage>
  );

  const progress = (
    <AthletePage key="p" dock>
      <TrainingChart sessions={sessions(me.id)} />

      <Text variant="heading">Dashboard</Text>
      <View style={styles.dash}>
        {DASHBOARD.map((d) => (
          <PressableScale
            key={d.label}
            onPress={() => router.push(d.href)}
            accessibilityRole="button"
            accessibilityLabel={d.label}
            style={styles.dashTile}
          >
            <d.icon size={22} color={colors.text} />
            <Text weight="semibold">{d.label}</Text>
          </PressableScale>
        ))}
      </View>

      <Eyebrow>Bodyweight</Eyebrow>
      <View style={styles.tiles}>
        <StatTile
          label="Now"
          value={`${last.toFixed(1)} kg`}
          sub={`started ${start.toFixed(1)}`}
        />
        <StatTile
          label="Goal"
          value={`${me.targetKg.toFixed(1)} kg`}
          sub={`${Math.abs(last - me.targetKg).toFixed(1)} kg to go`}
        />
      </View>
      {me.weights.length > 1 ? (
        <View style={styles.card}>
          <WeightChart values={me.weights} target={me.targetKg} />
        </View>
      ) : null}
      <Group>
        <NavRow
          first
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
    </AthletePage>
  );

  const recent = me.messages.slice(-4);
  const chat = (
    <AthletePage key="m" dock>
      {recent.length ? (
        <Group>
          {recent.map((m, i) => (
            <GroupRow key={i} first={i === 0}>
              {m.from === "coach" ? (
                <Avatar name={first} />
              ) : (
                <Avatar name={me.name} />
              )}
              <View style={styles.flex}>
                <Text variant="label" tone="muted">
                  {m.from === "coach" ? coachName : "You"} · {m.time}
                </Text>
                <Text numberOfLines={3}>
                  {m.text || (m.image ? "Photo" : "")}
                </Text>
              </View>
            </GroupRow>
          ))}
        </Group>
      ) : (
        <View style={styles.empty}>
          <MessageCircle size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            Ask {first} anything
          </Text>
          <Text tone="muted" style={styles.center}>
            Swaps, soreness, eating out: {first} replies here.
          </Text>
        </View>
      )}
    </AthletePage>
  );

  return (
    <View style={styles.root}>
      <PageHeader
        title="Progress"
        sub={coached ? `With ${coachName}` : undefined}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/athlete")
        }
        actions={[athleteMenuAction]}
      />
      {coached ? (
        <SectionTabs
          tabs={TABS}
          value={tab}
          onChange={setTab}
          pages={[checkins, progress, chat]}
        />
      ) : (
        progress
      )}
      {!coached || tab === "progress" ? (
        <AthleteDock
          label="Log weight"
          icon={Scale}
          onPress={() => router.push("/athlete/physique/bodyweight")}
        />
      ) : tab === "checkins" ? (
        paused || (sent && k?.reviewed === false) ? null : (
          <AthleteDock
            label={
              sent
                ? "See your check-in"
                : !me.checkIns.length
                  ? "Send your starting point"
                  : "Check in"
            }
            icon={Camera}
            onPress={() => router.push("/athlete/weekly-check-in")}
          />
        )
      ) : (
        <AthleteDock
          label={`Message ${first}`}
          icon={MessageCircle}
          onPress={() => router.push("/athlete/chat")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  tiles: { flexDirection: "row", gap: space[2] },
  dash: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: space[2],
  },
  dashTile: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: space[12] + space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  empty: { alignItems: "center", gap: space[2], paddingVertical: space[6] },
});
