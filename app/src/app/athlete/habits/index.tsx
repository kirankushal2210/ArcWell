// Daily habits library (D74, D77): active habits on top with weekly consistency (never streaks), the
// rest by area with an evidence badge. Up to three to start, five after two weeks. Adding a habit
// turns its area on (D78). Cold exposure asks a short safety check first.
import { router } from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { Sheet } from "@/features/athlete/Sheet";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { EvidenceBadge } from "@/features/protocols/EvidenceBadge";
import { HABIT_ICON } from "@/features/protocols/TodayHabits";
import { useHabits } from "@/features/protocols/useHabits";
import {
  type Area,
  AREA_LABEL,
  HABITS,
  MAX_HABITS,
} from "@/features/science/habits";
import { colors, radius, space } from "@/theme";

const AREAS: Area[] = ["sleep_light", "movement", "calm", "nutrition", "focus"];
const COLD_QUESTIONS = [
  "A heart condition or high blood pressure?",
  "Pregnant right now?",
  "Hands or skin react badly to cold (Raynaud’s, cold hives)?",
];

export default function HabitsLibrary() {
  const hb = useHabits();
  const [safety, setSafety] = useState(false);
  const [answers, setAnswers] = useState<(boolean | undefined)[]>([]);
  if (!hb.me) return <NotJoined />;
  const open = (id: string) =>
    router.push({ pathname: "/athlete/habits/[id]", params: { id } });
  const add = (id: string) => {
    const h = HABITS.find((x) => x.id === id)!;
    if (h.safety && !hb.safetyPassed(h.safety)) {
      setAnswers([]);
      setSafety(true);
      return;
    }
    hb.add(id);
  };
  const activeIds = new Set(hb.active.map(({ h }) => h.id));

  return (
    <MenuPage title="Daily habits" back={backTo("/athlete/menu")}>
      <View style={styles.cap}>
        <View style={styles.row}>
          <Text weight="semibold" style={styles.flex}>
            {`${hb.selfCount} of ${hb.cap} active`}
          </Text>
          {hb.cap < MAX_HABITS ? (
            <Text variant="caption" tone="muted">
              {`${MAX_HABITS - hb.cap} more after 14 days`}
            </Text>
          ) : null}
        </View>
        <View style={styles.bar}>
          <View
            style={[
              styles.fill,
              { width: `${(hb.selfCount / hb.cap) * 100}%` },
            ]}
          />
        </View>
        <Text variant="caption" tone="muted">
          Starting small works better: fewer habits stick.
        </Text>
      </View>

      {hb.active.length ? (
        <>
          <Eyebrow>Active</Eyebrow>
          <Group>
            {hb.active.map(({ h, a }, i) => {
              const Icon = HABIT_ICON[h.id];
              return (
                <GroupRow
                  key={h.id}
                  first={i === 0}
                  onPress={() => open(h.id)}
                  label={h.name}
                >
                  <View style={styles.chip}>
                    {Icon ? <Icon size={15} color={colors.text} /> : null}
                  </View>
                  <View style={styles.flex}>
                    <Text weight="medium">{h.name}</Text>
                    <Text variant="label" weight="regular" tone="muted">
                      {`${hb.weekDone(h.id)} of 7 days this week${a.origin === "coach" ? " · from your coach" : ""}`}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </GroupRow>
              );
            })}
          </Group>
        </>
      ) : (
        <InfoCard>
          Pick up to three to start. Each one shows on Today only at its time of
          day, then gets out of the way.
        </InfoCard>
      )}

      {AREAS.map((area) => {
        const list = HABITS.filter(
          (h) => h.area === area && !activeIds.has(h.id),
        );
        if (!list.length) return null;
        return (
          <View key={area} style={styles.section}>
            <Eyebrow>{AREA_LABEL[area]}</Eyebrow>
            <Group>
              {list.map((h, i) => {
                const Icon = HABIT_ICON[h.id];
                return (
                  <GroupRow key={h.id} first={i === 0}>
                    <PressableScale
                      onPress={() => open(h.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${h.name}, details`}
                      style={styles.rowMain}
                    >
                      <View style={styles.chip}>
                        {Icon ? <Icon size={15} color={colors.text} /> : null}
                      </View>
                      <View style={styles.flex}>
                        <Text weight="medium">{h.name}</Text>
                        <View style={styles.badges}>
                          <EvidenceBadge level={h.evidence} />
                          {h.safety ? (
                            <Text variant="caption" tone="muted">
                              Safety check first
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </PressableScale>
                    <IconButton
                      icon={Plus}
                      accessibilityLabel={`Add ${h.name}`}
                      disabled={!hb.canAdd}
                      onPress={() => add(h.id)}
                    />
                  </GroupRow>
                );
              })}
            </Group>
          </View>
        );
      })}
      {!hb.canAdd ? (
        <Text variant="caption" tone="muted">
          {`You’re at ${hb.cap}. Remove one to add another.`}
        </Text>
      ) : null}

      <Sheet
        visible={safety}
        onClose={() => setSafety(false)}
        title="Before you add cold showers"
        sub="Asked once. If any answer is yes, leave this one out and check with a doctor."
      >
        <View style={styles.qs}>
          {COLD_QUESTIONS.map((q, i) => (
            <View key={q} style={styles.qRow}>
              <Text variant="label" style={styles.flex}>
                {q}
              </Text>
              {(["Yes", "No"] as const).map((label) => {
                const on = answers[i] === (label === "Yes");
                return (
                  <PressableScale
                    key={label}
                    onPress={() =>
                      setAnswers((xs) =>
                        Object.assign([...xs], { [i]: label === "Yes" }),
                      )
                    }
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${q} ${label}`}
                    style={[styles.yn, on && styles.ynOn]}
                  >
                    <Text
                      variant="caption"
                      weight="semibold"
                      style={on ? styles.ynText : undefined}
                    >
                      {label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          ))}
          <Text variant="caption" tone="muted">
            It will only be suggested at least 6 hours away from your strength
            sessions: cold straight after lifting reduces muscle gain.
          </Text>
          {answers.some((a) => a === true) ? (
            <InfoCard>
              Cold exposure isn&apos;t a good fit right now. Please check with a
              doctor first.
            </InfoCard>
          ) : null}
          <Button
            label="Add cold showers"
            fullWidth
            disabled={
              COLD_QUESTIONS.some((_, i) => answers[i] === undefined) ||
              answers.some((a) => a === true)
            }
            onPress={() => {
              hb.add("cold", "cold");
              setSafety(false);
            }}
          />
        </View>
      </Sheet>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  section: { gap: space[2] },
  cap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[1] + space[1] / 2,
  },
  bar: {
    height: space[1] + space[1] / 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.brand },
  chip: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    flexWrap: "wrap",
  },
  qs: { gap: space[2], paddingTop: space[1] },
  qRow: { flexDirection: "row", alignItems: "center", gap: space[1] },
  yn: {
    minWidth: 44,
    height: 28,
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  ynOn: { backgroundColor: colors.brand },
  ynText: { color: colors.onBrand },
});
