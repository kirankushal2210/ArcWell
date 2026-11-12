// Clients tab (K-01, CO-13, CO-14): setup checklist until it's done, new clients waiting for a plan,
// then every client sorted by who needs the coach first.
import { router } from "expo-router";
import { Check, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Avatar,
  Button,
  PressableScale,
  StatusChip,
  Text,
} from "@/components/primitives";
import { needsAttention, useCoachData } from "@/features/coach/CoachData";
import { plansReady } from "@/features/coach/PlanRows";
import {
  Eyebrow,
  Group,
  GroupRow,
  Page,
  PageHeader,
  Pills,
} from "@/features/coach/parts";
import { sampleCoach } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

type Filter = "attention" | "active" | "paused" | "leaving" | "all";

export default function ClientsTab() {
  const { clients } = useCoachData();
  const [filter, setFilter] = useState<Filter>("attention");
  const [setupHidden, setSetupHidden] = useState(false);

  const fresh = clients.filter((c) => c.isNew);
  const pending = clients.filter((c) => c.pending);
  const linked = clients.filter((c) => !c.isNew && !c.pending);
  const count = {
    attention: linked.filter(needsAttention).length,
    active: linked.filter((c) => c.status === "active").length,
    paused: linked.filter((c) => c.status === "paused").length,
    leaving: linked.filter((c) => c.status === "leaving").length,
    all: linked.length,
  };
  const shown = linked
    .filter((c) =>
      filter === "attention"
        ? needsAttention(c)
        : filter === "all"
          ? true
          : c.status === filter,
    )
    .sort((a, b) => (a.adherence ?? 101) - (b.adherence ?? 101));

  const setup = sampleCoach.setup;
  const done = setup.filter((s) => s.done).length;
  const open = (id: string) =>
    router.push({ pathname: "/coach/client/[id]", params: { id } });

  return (
    <View style={styles.root}>
      <PageHeader
        title="Clients"
        actions={[
          {
            icon: UserPlus,
            label: "Add a client",
            onPress: () => router.push("/coach/add-client"),
          },
        ]}
      />
      <Page>
        {!setupHidden && done < setup.length ? (
          <View style={styles.setup}>
            <View style={styles.between}>
              <Text weight="semibold">Finish setting up</Text>
              <PressableScale
                onPress={() => setSetupHidden(true)}
                accessibilityRole="button"
                style={styles.hide}
              >
                <Text variant="label" tone="muted" numeric>
                  {done} of {setup.length} · Hide
                </Text>
              </PressableScale>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.round((done / setup.length) * 100)}%` },
                ]}
              />
            </View>
            {setup
              .filter((s) => !s.done)
              .map((s) => (
                <View key={s.label} style={styles.step}>
                  <View style={styles.ring} />
                  <Text weight="medium" style={styles.flex}>
                    {s.label}
                  </Text>
                  <PressableScale
                    onPress={() =>
                      router.push(
                        s.action === "Invite"
                          ? "/coach/business"
                          : "/coach/plans",
                      )
                    }
                    accessibilityRole="button"
                    style={styles.hide}
                  >
                    <Text variant="label">{s.action}</Text>
                  </PressableScale>
                </View>
              ))}
            <View style={styles.step}>
              <View style={[styles.ring, styles.ringOn]}>
                <Check size={14} strokeWidth={3} color={colors.onBrand} />
              </View>
              <Text tone="muted">{done} steps done</Text>
            </View>
          </View>
        ) : null}

        <Button
          label="Add a client and build their plan"
          icon={UserPlus}
          variant="secondary"
          fullWidth
          onPress={() => router.push("/coach/add-client")}
        />

        {pending.length > 0 ? (
          <>
            <Eyebrow>{`Added by you · ${pending.length}`}</Eyebrow>
            <Group>
              {pending.map((c, i) => (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() => open(c.id)}
                  label={`${c.name}, ${c.line}`}
                >
                  <Avatar name={c.name} />
                  <View style={styles.flex}>
                    <Text weight="semibold" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text variant="label" weight="regular" tone="muted">
                      {c.invite
                        ? "Invite sent · waiting to join"
                        : plansReady(c)
                          ? "Plans ready · send the invite"
                          : "Build their plans"}
                    </Text>
                  </View>
                  <Text variant="label">{c.invite ? "Invite" : "Plan"}</Text>
                </GroupRow>
              ))}
            </Group>
          </>
        ) : null}

        {fresh.length > 0 ? (
          <>
            <Eyebrow>{`Needs a plan · ${fresh.length}`}</Eyebrow>
            <Group>
              {fresh.map((c, i) => (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() => open(c.id)}
                  label={`${c.name}, ${c.goal}, needs a plan`}
                >
                  <Avatar name={c.name} />
                  <View style={styles.flex}>
                    <Text weight="semibold" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text variant="label" weight="regular" tone="muted">
                      {c.goal.split(" · ")[0]} · joined {c.joined}
                    </Text>
                  </View>
                  <Text variant="label">Assign</Text>
                </GroupRow>
              ))}
            </Group>
          </>
        ) : null}

        <Pills<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            {
              value: "attention",
              label: `Needs attention · ${count.attention}`,
            },
            { value: "active", label: `Active · ${count.active}` },
            { value: "paused", label: `Paused · ${count.paused}` },
            { value: "leaving", label: `Leaving · ${count.leaving}` },
            { value: "all", label: `All · ${count.all}` },
          ]}
        />

        {shown.length === 0 ? (
          <Text tone="muted" style={styles.empty}>
            {filter === "attention"
              ? "Nobody needs you right now. Every check-in is reviewed."
              : "No clients here."}
          </Text>
        ) : (
          <Group>
            {shown.map((c, i) => (
              <GroupRow
                key={c.id}
                first={i === 0}
                onPress={() => open(c.id)}
                label={`${c.name}, ${c.attention ?? c.line}`}
              >
                <Avatar name={c.name} />
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.shrink}
                    >
                      {c.name}
                    </Text>
                    {c.unread > 0 ? <View style={styles.unread} /> : null}
                  </View>
                  <Text
                    variant="label"
                    weight="regular"
                    tone="muted"
                    numberOfLines={2}
                  >
                    {filter === "attention"
                      ? (c.attention ?? "Unread message")
                      : c.line}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text weight="semibold" numeric>
                    {c.adherence === null ? "—" : `${c.adherence}%`}
                  </Text>
                  <StatusChip status={c.status} />
                </View>
              </GroupRow>
            ))}
          </Group>
        )}
        <Text variant="caption" tone="muted">
          Percentages are this week&apos;s adherence: planned workouts, meals
          and check-ins done.
        </Text>
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  shrink: { flexShrink: 1 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  setup: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  hide: { paddingVertical: space[1], paddingLeft: space[2] },
  track: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: 4, backgroundColor: colors.brand },
  step: { flexDirection: "row", alignItems: "center", gap: space[3] },
  ring: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  nameRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  unread: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
  },
  right: { alignItems: "flex-end", gap: space[1] },
  empty: { paddingVertical: space[6], textAlign: "center" },
});
