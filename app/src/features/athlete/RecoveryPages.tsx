// The four Recovery section pages (D60, D61): Overview · Sleep · Recovery · Strain. Each page
// scrolls on its own inside the section tabs; anything deeper opens a detail page with Back.
import { router } from "expo-router";
import {
  Activity,
  ChevronRight,
  HeartPulse,
  Moon,
  Plus,
  Timer,
  Watch,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import {
  useSetActive,
  useWorkoutSummary,
} from "@/features/athlete/ActiveWorkout";
import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { Bars, Eyebrow } from "@/features/coach/parts";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

import {
  clockOf,
  type Day,
  DEVICE_LABEL,
  daysBack,
  healthMetrics,
  hm,
  outlookFor,
  plannerFor,
  suggestFor,
  ZONE_LABEL,
} from "./recovery";
import {
  RingButton,
  Ring,
  sourceText,
  StatRow,
  useRecovery,
  ZoneDot,
} from "./RecoveryParts";
import { emptyWorkout } from "./training";
import { AthletePage } from "./useMe";

export type RecoveryTab = "overview" | "sleep" | "recovery" | "strain";
type R = ReturnType<typeof useRecovery>;

const go = (pathname: string, params?: Record<string, string>) =>
  router.push(params ? ({ pathname, params } as never) : (pathname as never));

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function LinkRow({
  icon: Icon,
  title,
  sub,
  onPress,
}: {
  icon: typeof Moon;
  title: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={sub ? `${title}, ${sub}` : title}
      style={styles.linkRow}
    >
      <Icon size={20} color={colors.text} />
      <View style={styles.flex}>
        <Text weight="semibold">{title}</Text>
        {sub ? (
          <Text variant="label" weight="regular" tone="muted" numeric>
            {sub}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </PressableScale>
  );
}

function Suggestions({ r, day }: { r: R; day: Day }) {
  const strength = day.strain.items.some((i) => i.kind === "workout");
  const list = suggestFor(day, strength);
  const done = r.store.done;
  return (
    <>
      <View style={styles.between}>
        <Eyebrow>Suggested for today</Eyebrow>
        <PressableScale
          onPress={() => go("/athlete/recovery/protocols")}
          accessibilityRole="link"
        >
          <Text variant="label">All protocols</Text>
        </PressableScale>
      </View>
      <Card>
        {list.map((p, i) => (
          <PressableScale
            key={p.id}
            onPress={() => go("/athlete/recovery/protocol/[id]", { id: p.id })}
            accessibilityRole="button"
            style={[styles.linkRow, i > 0 && styles.line]}
          >
            <View style={styles.flex}>
              <Text weight="semibold">
                {p.title}
                {done.includes(`${day.date}:${p.id}`) ? "  ✓" : ""}
              </Text>
              <Text variant="label" weight="regular" tone="muted">
                {p.summary}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </PressableScale>
        ))}
      </Card>
    </>
  );
}

// ---------- Overview ----------

export function Overview({
  r,
  day,
  isToday,
  open,
}: {
  r: R;
  day: Day;
  isToday: boolean;
  open: (t: RecoveryTab) => void;
}) {
  const active = useWorkoutSummary();
  const setActive = useSetActive();
  const health = healthMetrics(r.inputs, day.date);
  const inRange = health?.filter((m) => m.inRange).length ?? 0;
  const bedtime = plannerFor(day, r.baseline, "peak").bed;
  const outlook = outlookFor(day, isToday ? r.planned : null, bedtime);
  const brand = r.store.device?.brand;

  return (
    <AthletePage dock>
      {r.pendingDevice ? (
        <LinkRow
          icon={Watch}
          title={`Finish connecting your ${DEVICE_LABEL[r.pendingDevice]}`}
          onPress={() => go("/athlete/recovery/connect")}
        />
      ) : null}
      {isToday && !day.log ? (
        <View style={styles.checkIn}>
          <Text weight="semibold" style={styles.flex}>
            How did you wake up?
          </Text>
          <Button
            label="Check in"
            size="sm"
            variant="secondary"
            onPress={() => go("/athlete/recovery/check-in")}
          />
        </View>
      ) : null}

      <View style={styles.rings}>
        <RingButton
          label="Sleep"
          share={day.sleep.performance / 100}
          value={String(day.sleep.performance)}
          unit="%"
          onPress={() => open("sleep")}
        />
        <RingButton
          label="Recovery"
          share={day.recovery.score / 100}
          value={String(day.recovery.score)}
          unit="%"
          onPress={() => open("recovery")}
        />
        <RingButton
          label="Strain"
          share={day.strain.score / 21}
          value={day.strain.score.toFixed(1)}
          onPress={() => open("strain")}
        />
      </View>
      <View style={styles.zoneRow}>
        <ZoneDot zone={day.recovery.zone} />
        <Text weight="semibold">{ZONE_LABEL[day.recovery.zone]}</Text>
      </View>
      <Text variant="label" weight="regular" tone="muted" style={styles.center}>
        {sourceText(day.source, brand)}
      </Text>

      <View style={styles.tiles}>
        <PressableScale
          onPress={() =>
            go(
              health ? "/athlete/recovery/health" : "/athlete/recovery/connect",
            )
          }
          accessibilityRole="button"
          style={styles.tile}
        >
          <View style={styles.tileHead}>
            <HeartPulse size={18} color={colors.text} />
            <Text variant="caption" tone="muted" style={styles.flex}>
              HEALTH MONITOR
            </Text>
          </View>
          {health ? (
            <>
              <Text weight="semibold">
                {inRange === health.length ? "Within range" : "Worth a look"}
              </Text>
              <Text variant="label" weight="regular" tone="muted" numeric>
                {inRange} of {health.length} in your range
              </Text>
            </>
          ) : (
            <>
              <Text weight="semibold">Connected device</Text>
              <Text variant="label" weight="regular" tone="muted">
                {brand ? DEVICE_LABEL[brand] : "None yet"}
              </Text>
            </>
          )}
        </PressableScale>
        <PressableScale
          onPress={() => go("/athlete/recovery/stress", { date: day.date })}
          accessibilityRole="button"
          style={styles.tile}
        >
          <View style={styles.tileHead}>
            <Activity size={18} color={colors.text} />
            <Text variant="caption" tone="muted" style={styles.flex}>
              STRESS
            </Text>
          </View>
          <Text weight="semibold" numeric>
            {day.stress.value.toFixed(1)} · {day.stress.label}
          </Text>
          <Text variant="label" weight="regular" tone="muted">
            {day.source === "device" ? "Average today" : "From how you feel"}
          </Text>
        </PressableScale>
      </View>

      <View style={styles.between}>
        <Text variant="title">My day</Text>
        <IconButton
          icon={Plus}
          variant="filled"
          accessibilityLabel="Add an activity"
          onPress={() => go("/athlete/recovery/activity", { date: day.date })}
        />
      </View>
      <LinkRow
        icon={Moon}
        title="Your daily outlook"
        sub={outlook.title}
        onPress={() => go("/athlete/recovery/outlook", { date: day.date })}
      />
      <Card>
        <Text variant="caption" tone="muted">
          {isToday ? "TODAY'S ACTIVITIES" : "ACTIVITIES"}
        </Text>
        <View style={styles.activity}>
          <View style={styles.badge}>
            <Moon size={16} color={colors.onBrand} />
            <Text weight="semibold" tone="onBrand" numeric>
              {hm(day.sleep.minutes)}
            </Text>
          </View>
          <Text weight="semibold" style={styles.flex}>
            Sleep
          </Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {clockOf(day.sleep.bed)} – {clockOf(day.sleep.wake)}
          </Text>
        </View>
        {day.strain.items.map((a, i) => (
          <View key={`${a.name}-${i}`} style={styles.activity}>
            <View style={styles.badge}>
              <Activity size={16} color={colors.onBrand} />
              <Text weight="semibold" tone="onBrand" numeric>
                {a.strain.toFixed(1)}
              </Text>
            </View>
            <Text weight="semibold" style={styles.flex}>
              {a.name}
            </Text>
            <Text variant="label" weight="regular" tone="muted" numeric>
              {clockOf(a.start)} · {a.minutes} min
            </Text>
          </View>
        ))}
        <View style={styles.buttons}>
          <View style={styles.flex}>
            <Button
              label="Add activity"
              icon={Plus}
              variant="secondary"
              fullWidth
              onPress={() =>
                go("/athlete/recovery/activity", { date: day.date })
              }
            />
          </View>
          {isToday ? (
            <View style={styles.flex}>
              <Button
                label={active ? "Resume" : "Start workout"}
                icon={Timer}
                variant="secondary"
                fullWidth
                onPress={() => {
                  if (!active) setActive(emptyWorkout());
                  router.push("/athlete/workout");
                }}
              />
            </View>
          ) : null}
        </View>
      </Card>

      <Suggestions r={r} day={day} />

      {r.coached && r.me?.protocol?.note ? (
        <Card>
          <Text variant="label" tone="muted">
            From {r.coachName}
          </Text>
          <Text>{r.me.protocol.note}</Text>
        </Card>
      ) : null}
    </AthletePage>
  );
}

// ---------- Sleep ----------

export function SleepPage({ r, day }: { r: R; day: Day }) {
  const s = day.sleep;
  const month = daysBack(r.inputs, day.date, 31).slice(0, 30);
  const week = daysBack(r.inputs, day.date, 7);
  const avg = (f: (d: Day) => number) =>
    month.reduce((n, d) => n + f(d), 0) / month.length;
  const plan = plannerFor(day, r.baseline, "peak");
  const insight =
    s.performance >= 85
      ? {
          title: "Optimal sleep",
          text: "Great sleep performance and consistency. Keep the same routine tonight.",
        }
      : s.performance >= 70
        ? {
            title: "Sufficient sleep",
            text: "Enough to train, but an earlier night would top you up.",
          }
        : {
            title: "Short on sleep",
            text: "Sleep is the cheapest recovery there is. Aim for an earlier night and keep today lighter.",
          };
  const st = day.device?.stages;

  return (
    <AthletePage dock>
      <View style={styles.hero}>
        <Text variant="caption" tone="muted">
          SLEEP PERFORMANCE
        </Text>
        <Text style={styles.big} numeric>
          {s.performance}%
        </Text>
        <View style={styles.pair}>
          <View style={styles.pairCell}>
            <Text variant="title" numeric>
              {hm(s.minutes)}
            </Text>
            <Text variant="label" tone="muted">
              Hours of sleep
            </Text>
          </View>
          <View style={styles.pairCell}>
            <Text variant="title" numeric>
              {hm(s.neededMin)}
            </Text>
            <Text variant="label" tone="muted">
              Sleep needed
            </Text>
          </View>
        </View>
        <Text
          variant="label"
          weight="regular"
          tone="muted"
          style={styles.center}
        >
          {sourceText(day.source, r.store.device?.brand)}
        </Text>
      </View>

      <Card>
        <Text weight="semibold">{insight.title}</Text>
        <Text tone="muted">{insight.text}</Text>
      </Card>

      <LinkRow
        icon={Moon}
        title={`Tonight: in bed by ${clockOf(plan.bed)}`}
        sub={`${hm(plan.sleepMin)} of sleep to wake at ${clockOf(plan.wake)} · sleep planner`}
        onPress={() => go("/athlete/recovery/planner", { date: day.date })}
      />

      {st ? (
        <>
          <Eyebrow>Sleep stages</Eyebrow>
          <Card>
            <View style={styles.stageBar}>
              {(
                [
                  ["awake", st.awake],
                  ["light", st.light],
                  ["deep", st.deep],
                  ["rem", st.rem],
                ] as const
              ).map(([k, v]) => (
                <View
                  key={k}
                  style={[
                    styles.stage,
                    {
                      flex: v,
                      backgroundColor:
                        k === "deep"
                          ? colors.recovery
                          : k === "rem"
                            ? colors.textMuted
                            : k === "light"
                              ? colors.borderStrong
                              : colors.surfaceRaised,
                    },
                  ]}
                />
              ))}
            </View>
            {(
              [
                ["Awake", st.awake],
                ["Light", st.light],
                ["Deep (slow wave)", st.deep],
                ["REM", st.rem],
              ] as const
            ).map(([label, v], i) => (
              <StatRow
                key={label}
                first={i === 0}
                label={label}
                value={hm(v)}
                note={`${Math.round((v / (day.device?.inBedMin ?? 1)) * 100)}% of time in bed`}
              />
            ))}
          </Card>
        </>
      ) : null}

      <View style={styles.between}>
        <Eyebrow>Sleep statistics</Eyebrow>
        <Text variant="caption" tone="muted">
          VS. LAST 30 DAYS
        </Text>
      </View>
      <Card>
        <StatRow
          first
          label="Hours of sleep"
          value={hm(s.minutes)}
          note={`average ${hm(avg((d) => d.sleep.minutes))}`}
        />
        <StatRow
          label="Sleep performance"
          value={`${s.performance}%`}
          note={`average ${Math.round(avg((d) => d.sleep.performance))}%`}
        />
        <StatRow
          label="Consistency"
          value={`${s.consistency}%`}
          note={`average ${Math.round(avg((d) => d.sleep.consistency))}% · bed and wake times`}
        />
        <StatRow
          label={day.device ? "Sleep efficiency" : "How well you slept"}
          value={`${s.quality}%`}
          note={`average ${Math.round(avg((d) => d.sleep.quality))}%`}
        />
        <StatRow
          label="Sleep debt"
          value={hm(s.debtMin)}
          note="Short of your need over the last 3 nights"
        />
      </Card>

      <Card>
        <Text weight="semibold">Last 7 nights</Text>
        <Bars
          values={week.map((d) => d.sleep.minutes / 60)}
          target={r.baseline.sleepTargetH}
          labels={week.map((d) => d.date.slice(8))}
        />
        <Text variant="caption" tone="muted">
          Dashed line is your {r.baseline.sleepTargetH} h target
          {r.coached ? `, set by ${r.coachName}` : ""}.
        </Text>
      </Card>

      {!day.log && day.source !== "device" ? (
        <Button
          label="Log last night"
          variant="secondary"
          fullWidth
          onPress={() => go("/athlete/recovery/check-in")}
        />
      ) : null}
    </AthletePage>
  );
}

// ---------- Recovery ----------

export function RecoveryPage({ r, day }: { r: R; day: Day }) {
  const rec = day.recovery;
  const week = daysBack(r.inputs, day.date, 7);
  const text =
    rec.zone === "green"
      ? "Your body is ready for a hard session. Push today if it's planned."
      : rec.zone === "yellow"
        ? "You're maintaining. Train as planned, and save maximal efforts for a greener day."
        : "Your body is asking for rest. Keep today light, eat well and get to bed early.";

  // Habits insight: recovery the morning after a habit vs without it (needs a few of each).
  const days14 = daysBack(r.inputs, day.date, 14);
  const habits = [
    ["alcohol", "alcohol"],
    ["caffeine", "late caffeine"],
    ["screens", "screens in bed"],
  ] as const;
  const insights = habits
    .map(([key, label]): { label: string; diff: number } | null => {
      const withIt = days14.filter((d) => d.log?.habits.includes(key));
      const without = days14.filter(
        (d) => d.log && !d.log.habits.includes(key),
      );
      if (withIt.length < 2 || without.length < 2) return null;
      const a =
        withIt.reduce((n, d) => n + d.recovery.score, 0) / withIt.length;
      const b =
        without.reduce((n, d) => n + d.recovery.score, 0) / without.length;
      return { label, diff: Math.round(a - b) };
    })
    .filter((x): x is { label: string; diff: number } => !!x && x.diff !== 0);

  return (
    <AthletePage dock>
      <View style={styles.hero}>
        <Ring
          share={rec.score / 100}
          value={String(rec.score)}
          unit="%"
          size={168}
          stroke={12}
        />
        <View style={styles.zoneRow}>
          <ZoneDot zone={rec.zone} />
          <Text variant="title">{ZONE_LABEL[rec.zone]}</Text>
        </View>
        <Text variant="label" weight="regular" tone="muted">
          {sourceText(day.source, r.store.device?.brand)}
        </Text>
      </View>
      <Card>
        <Text>{text}</Text>
      </Card>

      <Eyebrow>What made up today&apos;s score</Eyebrow>
      <Card>
        {rec.contributors.map((c, i) => (
          <StatRow
            key={c.label}
            first={i === 0}
            label={c.label}
            value={c.value}
            note={c.note}
            good={c.good}
          />
        ))}
      </Card>
      {day.source === "answers" ? (
        <Button
          label="Check in for a real score"
          fullWidth
          onPress={() => go("/athlete/recovery/check-in")}
        />
      ) : null}

      <Card>
        <Text weight="semibold">Last 7 days</Text>
        <Bars
          values={week.map((d) => d.recovery.score)}
          labels={week.map((d) => d.date.slice(8))}
        />
      </Card>

      {insights.length ? (
        <Card>
          <Text weight="semibold">What your habits do</Text>
          {insights.map((x) => (
            <Text key={x.label} tone="muted" numeric>
              After {x.label}, your recovery is {Math.abs(x.diff)} points{" "}
              {x.diff < 0 ? "lower" : "higher"} on average.
            </Text>
          ))}
        </Card>
      ) : null}

      <Suggestions r={r} day={day} />
    </AthletePage>
  );
}

// ---------- Strain ----------

export function StrainPage({
  r,
  day,
  isToday,
}: {
  r: R;
  day: Day;
  isToday: boolean;
}) {
  const s = day.strain;
  const week = daysBack(r.inputs, day.date, 7);
  const [lo, hi] = s.target;
  const status =
    s.score < lo
      ? `Room for ${(lo - s.score).toFixed(1)} more today`
      : s.score > hi
        ? "Above today's target: go easy for the rest of the day"
        : "In today's target range";
  const active = useWorkoutSummary();
  const setActive = useSetActive();

  return (
    <AthletePage dock>
      <View style={styles.hero}>
        <Ring
          share={s.score / 21}
          value={s.score.toFixed(1)}
          size={168}
          stroke={12}
        />
        <Text variant="title">Strain</Text>
        <Text tone="muted" numeric>
          Target today {lo}–{hi} · {status}
        </Text>
      </View>

      <Eyebrow>Activities</Eyebrow>
      <Card>
        {s.items.length ? (
          s.items.map((a, i) => (
            <StatRow
              key={`${a.name}-${i}`}
              first={i === 0}
              label={a.name}
              value={a.strain.toFixed(1)}
              note={`${clockOf(a.start)} · ${a.minutes} min · ${a.kind === "workout" ? "workout" : "activity"}`}
            />
          ))
        ) : (
          <Text tone="muted">Nothing logged yet.</Text>
        )}
        {s.steps !== undefined ? (
          <StatRow
            label="Steps"
            value={s.steps.toLocaleString("en-IN")}
            note="From your device"
          />
        ) : null}
        <View style={styles.buttons}>
          <View style={styles.flex}>
            <Button
              label="Add activity"
              icon={Plus}
              variant="secondary"
              fullWidth
              onPress={() =>
                go("/athlete/recovery/activity", { date: day.date })
              }
            />
          </View>
          {isToday ? (
            <View style={styles.flex}>
              <Button
                label={active ? "Resume" : "Start workout"}
                icon={Timer}
                variant="secondary"
                fullWidth
                onPress={() => {
                  if (!active) setActive(emptyWorkout());
                  router.push("/athlete/workout");
                }}
              />
            </View>
          ) : null}
        </View>
      </Card>

      <Card>
        <Text weight="semibold">Last 7 days</Text>
        <Bars
          values={week.map((d) => d.strain.score)}
          labels={week.map((d) => d.date.slice(8))}
        />
      </Card>
      <Text variant="caption" tone="muted">
        Strain runs from 0 to 21: how hard each session felt × how long it
        lasted{day.device ? ", plus your steps" : ""}. The target follows
        today&apos;s recovery and your rest days.
      </Text>
    </AthletePage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  checkIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 56,
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    borderRadius: 0,
  },
  rings: { flexDirection: "row", gap: space[2], paddingTop: space[2] },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    flexWrap: "wrap",
  },
  tiles: { flexDirection: "row", gap: space[2] },
  tile: {
    flex: 1,
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tileHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
  activity: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 52,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    minWidth: 88,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  buttons: { flexDirection: "row", gap: space[2], paddingTop: space[1] },
  hero: { alignItems: "center", gap: space[2], paddingVertical: space[2] },
  big: {
    fontFamily: fontFamilyFor("bold"),
    fontSize: textSizes["2xl"] * 2.25,
    lineHeight: textSizes["2xl"] * 2.5,
    color: colors.text,
  },
  pair: { flexDirection: "row", gap: space[3], alignSelf: "stretch" },
  pairCell: {
    flex: 1,
    alignItems: "center",
    gap: space[1],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  stageBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  stage: { height: 12 },
});
