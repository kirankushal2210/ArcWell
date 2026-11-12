// Training (T-01 to T-03, F4-13): the athlete's week at a glance, today's session, the whole program,
// and the way into an empty workout, history and the exercise library. The plan comes from the coach
// (coached) or from the athlete's answers (self-guided, D57).
import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  Dumbbell,
  History,
  Library,
  PencilLine,
  Play,
  Plus,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button, PressableScale, Text } from "@/components/primitives";
import {
  emptyWorkout,
  estimateMinutes,
  programWeek,
  weekStart,
} from "@/features/athlete/training";
import { MyRoutines } from "@/features/athlete/MyRoutines";
import { AthletePage, NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow, PageHeader } from "@/features/coach/parts";
import { todayIndex, WEEKDAYS, weekSchedule } from "@/features/coach/plans";
import { colors, radius, space } from "@/theme";

export default function Training() {
  const me = useMe();
  const { coachName, meTier, active, setActive, sessions, restartProgram } =
    useCoachData();
  if (!me) return <NotJoined />;
  const coached = meTier === "coached";
  if (!me.program)
    return (
      <View style={styles.root}>
        <PageHeader title="Training" />
        <AthletePage>
          {/* W-02: joined through the coach's general link; the coach hasn't assigned a plan yet. */}
          <View style={styles.card}>
            <Text variant="title">{coachName} is building your plan</Text>
            <Text tone="muted">
              You&apos;ll get a notification when it&apos;s ready. Until then,
              log any workout you do and
              {` ${coachName}`} sees it.
            </Text>
            <Button
              label="Start an empty workout"
              icon={Plus}
              fullWidth
              onPress={() => {
                if (!active) setActive(emptyWorkout());
                router.push("/athlete/workout");
              }}
            />
          </View>
          <MyRoutines me={me} />
          <Group>
            <GroupRow
              first
              label="History"
              onPress={() => router.push("/athlete/history")}
            >
              <History size={20} color={colors.text} />
              <Text weight="medium" style={styles.flex}>
                History
              </Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </GroupRow>
            <GroupRow
              label="Exercises"
              onPress={() => router.push("/athlete/exercises")}
            >
              <Library size={20} color={colors.text} />
              <Text weight="medium" style={styles.flex}>
                Exercises
              </Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </GroupRow>
          </Group>
        </AthletePage>
      </View>
    );

  const program = me.program;
  const pw = programWeek(program.weeks, me.programStart);
  const schedule = weekSchedule(program, me.protocol?.restDays ?? []);
  const t = todayIndex();
  const today = schedule[t]?.day ?? null;
  const history = sessions(me.id);
  const monday = weekStart(new Date());
  const thisWeek = history.filter((s) => new Date(s.at) >= monday);
  const doneOn = new Set(
    thisWeek.map((s) => (new Date(s.at).getDay() + 6) % 7),
  );
  const planned = schedule.filter((s) => s.day).length;
  const openPreview = (dayId: string) =>
    router.push({
      pathname: "/athlete/workout/preview/[dayId]",
      params: { dayId },
    });

  return (
    <View style={styles.root}>
      <PageHeader
        title="Training"
        sub={`${program.name} · ${pw.done ? "complete" : `week ${pw.week} of ${pw.weeks}`} · ${coached ? `by ${coachName}` : "from your answers"}`}
      />
      <AthletePage>
        {active ? (
          <PressableScale
            onPress={() => router.push("/athlete/workout")}
            accessibilityRole="button"
            accessibilityLabel={`Resume ${active.name}`}
            style={styles.live}
          >
            <View style={styles.flex}>
              <Text variant="eyebrow" tone="onBrand">
                In progress
              </Text>
              <Text variant="heading" tone="onBrand">
                {active.name}
              </Text>
            </View>
            <Text weight="semibold" tone="onBrand">
              Resume
            </Text>
            <ChevronRight size={20} color={colors.onBrand} />
          </PressableScale>
        ) : null}

        {pw.done ? (
          <View style={styles.card}>
            <Text variant="title">Program complete</Text>
            <Text tone="muted">
              {coached
                ? `You finished all ${pw.weeks} weeks. ${coachName} sets your next program.`
                : meTier === "pro"
                  ? `You finished all ${pw.weeks} weeks. Your AI coach builds the next block from your logs.`
                  : `You finished all ${pw.weeks} weeks. Run it again, or edit it to keep progressing.`}
            </Text>
            {coached ? null : (
              <Button
                label="Start again from week 1"
                variant="secondary"
                fullWidth
                onPress={() => restartProgram(me.id)}
              />
            )}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.between}>
            <Text weight="semibold">This week</Text>
            <Text variant="label" tone="muted" numeric>
              {thisWeek.length} of {planned} workouts
            </Text>
          </View>
          <View style={styles.week}>
            {schedule.map((s, i) => {
              const done = doneOn.has(i);
              return (
                <View
                  key={s.label}
                  style={styles.day}
                  accessibilityLabel={`${WEEKDAYS[i]}: ${done ? "done" : s.day ? s.day.name : "rest"}`}
                >
                  <Text
                    variant="caption"
                    tone={i === t ? "default" : "muted"}
                    weight={i === t ? "semibold" : "regular"}
                  >
                    {s.label[0]}
                  </Text>
                  <View
                    style={[
                      styles.dot,
                      s.day && styles.dotPlanned,
                      i === t && styles.dotToday,
                      done && styles.dotDone,
                    ]}
                  >
                    {done ? (
                      <Check size={14} strokeWidth={3} color={colors.onBrand} />
                    ) : s.day ? null : (
                      <Text variant="caption" tone="muted">
                        –
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Eyebrow>Today</Eyebrow>
        <View style={styles.card}>
          {today ? (
            <>
              <Text variant="title">{today.name}</Text>
              <Text tone="muted" numeric>
                {today.exercises.length} exercises · about{" "}
                {estimateMinutes(today)} min
              </Text>
              <Text
                variant="label"
                weight="regular"
                tone="muted"
                numberOfLines={2}
              >
                {today.exercises.map((e) => e.name).join(" · ")}
              </Text>
              <Button
                label={
                  active?.dayId === today.id
                    ? "Resume workout"
                    : doneOn.has(t)
                      ? "Done today · train again"
                      : "Start workout"
                }
                icon={Play}
                variant={doneOn.has(t) ? "secondary" : "primary"}
                fullWidth
                onPress={() => openPreview(today.id)}
              />
            </>
          ) : (
            <>
              <Text variant="title">Rest day</Text>
              <Text tone="muted">
                {me.protocol?.note ||
                  "Recovery is part of the plan. Pick any workout below if you still want to train."}
              </Text>
            </>
          )}
        </View>

        <View style={styles.between}>
          <Eyebrow>{`Your program · ${program.days.length} workouts`}</Eyebrow>
          {coached ? null : (
            <PressableScale
              onPress={() =>
                router.push({
                  pathname: "/coach/plan/training/[id]",
                  params: { id: me.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Edit your program"
              style={styles.edit}
            >
              <PencilLine size={16} color={colors.text} />
              <Text variant="label">Edit</Text>
            </PressableScale>
          )}
        </View>
        <Group>
          {program.days.map((d, i) => {
            const days = schedule
              .filter((s) => s.day?.id === d.id)
              .map((s) => s.label);
            return (
              <GroupRow
                key={d.id}
                first={i === 0}
                onPress={() => openPreview(d.id)}
                label={`${d.name}, ${d.exercises.length} exercises`}
              >
                <View style={styles.icon}>
                  <Dumbbell size={20} color={colors.text} />
                </View>
                <View style={styles.flex}>
                  <Text weight="semibold">{d.name}</Text>
                  <Text
                    variant="label"
                    weight="regular"
                    tone="muted"
                    numberOfLines={1}
                  >
                    {days.length ? `${days.join(", ")} · ` : ""}
                    {d.exercises.length} exercises · {estimateMinutes(d)} min
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </GroupRow>
            );
          })}
        </Group>

        <MyRoutines me={me} />

        <Group>
          <GroupRow
            first
            label="Start an empty workout"
            onPress={() => {
              if (!active) setActive(emptyWorkout());
              router.push("/athlete/workout");
            }}
          >
            <Plus size={20} color={colors.text} />
            <Text weight="medium" style={styles.flex}>
              Start an empty workout
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
          <GroupRow
            label="History"
            onPress={() => router.push("/athlete/history")}
          >
            <History size={20} color={colors.text} />
            <Text weight="medium" style={styles.flex}>
              History
            </Text>
            <Text variant="label" tone="muted" numeric>
              {history.length}
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
          <GroupRow
            label="Exercises"
            onPress={() => router.push("/athlete/exercises")}
          >
            <Library size={20} color={colors.text} />
            <Text weight="medium" style={styles.flex}>
              Exercises
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </GroupRow>
        </Group>

        {history.length ? (
          <>
            <Eyebrow>Recent</Eyebrow>
            <Group>
              {history.slice(0, 3).map((s, i) => (
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
                    <Text variant="label" weight="regular" tone="muted" numeric>
                      {new Date(s.at).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {s.minutes} min · {s.volume.toLocaleString("en-IN")} kg
                      {s.bests.length
                        ? ` · ${s.bests.length} best${s.bests.length > 1 ? "s" : ""}`
                        : ""}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </GroupRow>
              ))}
            </Group>
          </>
        ) : null}
      </AthletePage>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  live: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  week: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: space[1],
  },
  day: { alignItems: "center", gap: space[2] },
  dot: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  dotPlanned: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  dotToday: { borderWidth: 2, borderColor: colors.brand },
  dotDone: { backgroundColor: colors.brand, borderColor: colors.brand },
  edit: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingVertical: space[1],
    paddingLeft: space[2],
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
});
