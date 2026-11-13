// Check-ins tab (F6-07): this week's check-ins to review, overdue ones with a reminder, and reviewed ones.
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import { menuAction } from "@/features/coach/coachProfile";
import { useCoachData } from "@/features/coach/CoachData";
import {
  ActionDock,
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
  Pills,
} from "@/features/coach/parts";
import { colors, space } from "@/theme";

type Filter = "review" | "overdue" | "reviewed";

/** Monday of this week, e.g. "9 Nov". */
const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function CheckInsTab() {
  const { clients, remind, reminded } = useCoachData();
  const [filter, setFilter] = useState<Filter>("review");

  const all = clients.flatMap((c) => c.checkIns.map((k) => ({ c, k })));
  const toReview = all.filter(({ k }) => !k.reviewed);
  const reviewed = all.filter(({ k }) => k.reviewed);
  const overdue = clients.filter((c) =>
    c.attention?.startsWith("Check-in overdue"),
  );
  const open = (id: string) =>
    router.push({ pathname: "/coach/check-in/[id]", params: { id } });

  const list = filter === "review" ? toReview : reviewed;

  return (
    <View style={styles.root}>
      <PageHeader
        title="Check-ins"
        sub={`Week of ${weekStart()}`}
        actions={[menuAction]}
      />
      <Page clearDock>
        <Pills<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "review", label: `To review · ${toReview.length}` },
            { value: "overdue", label: `Overdue · ${overdue.length}` },
            { value: "reviewed", label: `Reviewed · ${reviewed.length}` },
          ]}
        />

        {filter === "overdue" ? (
          overdue.length ? (
            <Group>
              {overdue.map((c, i) => {
                const sent = reminded.includes(c.id);
                return (
                  <GroupRow key={c.id} first={i === 0}>
                    <Avatar name={c.name} />
                    <View style={styles.flex}>
                      <Text weight="semibold">{c.name}</Text>
                      <Text variant="label" weight="regular" tone="muted">
                        Due {c.checkInDay}
                      </Text>
                    </View>
                    <Button
                      label={sent ? "Reminded" : "Send reminder"}
                      variant="secondary"
                      disabled={sent}
                      onPress={() => remind(c.id)}
                    />
                  </GroupRow>
                );
              })}
            </Group>
          ) : (
            <Text tone="muted" style={styles.empty}>
              Nobody is late this week.
            </Text>
          )
        ) : list.length ? (
          <Group>
            {list.map(({ c, k }, i) => {
              const weight = k.rows.find((r) => r.label.startsWith("Weight"));
              const workouts = k.rows.find((r) => r.label === "Workouts");
              return (
                <GroupRow
                  key={k.id}
                  first={i === 0}
                  onPress={() => open(k.id)}
                  label={`${c.name}, week ${k.week} check-in`}
                >
                  <Avatar name={c.name} />
                  <View style={styles.flex}>
                    <Text weight="semibold">
                      {c.name} · Week {k.week}
                    </Text>
                    <Text
                      variant="label"
                      weight="regular"
                      tone="muted"
                      numberOfLines={2}
                      numeric
                    >
                      {[
                        weight
                          ? weight.delta === "—"
                            ? "weight steady"
                            : `${weight.delta} kg`
                          : null,
                        workouts ? `${workouts.now} workouts` : null,
                        k.note ? `“${k.note}”` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                  <Text variant="label" weight="regular" tone="muted">
                    {k.submitted}
                  </Text>
                  <ChevronRight size={18} color={colors.textMuted} />
                </GroupRow>
              );
            })}
          </Group>
        ) : (
          <Text tone="muted" style={styles.empty}>
            {filter === "review"
              ? "All caught up. Every check-in has a reply."
              : "Nothing reviewed yet."}
          </Text>
        )}

        {filter === "review" && overdue.length ? (
          <>
            <Eyebrow>Overdue</Eyebrow>
            <Text tone="muted">
              {overdue.map((c) => c.name).join(", ")}{" "}
              {overdue.length > 1 ? "haven't" : "hasn't"} checked in yet. Send a
              reminder from Overdue.
            </Text>
          </>
        ) : null}
      </Page>
      {toReview.length ? (
        <ActionDock
          label={`Start review · ${toReview.length} to go`}
          onPress={() => open(toReview[0].k.id)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  empty: { paddingVertical: space[6], textAlign: "center" },
});
