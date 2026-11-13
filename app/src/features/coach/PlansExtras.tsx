// Plans tab extras (D64): Supplements (reusable stacks and who has a list) and Enhanced
// (competitive clients, their consent and any markers needing attention).
import { router } from "expo-router";
import { ChevronRight, Pill, ShieldAlert, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Avatar,
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { Tag } from "@/features/coach/CrmParts";
import { DOCTOR_NOTE, flags, PHASE_LABEL } from "@/features/coach/enhanced";
import { Eyebrow, Group, GroupRow, Page } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

export function SupplementsPage() {
  const { stacks, clients } = useCoachData();
  const withList = clients.filter(
    (c) => c.status !== "completed" && c.supplements?.length,
  );
  return (
    <Page clearDock>
      <Text tone="muted">
        Optional for any client. Build a stack once and give each client their
        own copy.
      </Text>
      {stacks.length ? (
        <Group>
          {stacks.map((s, i) => (
            <GroupRow key={s.id} first={i === 0}>
              <PressableScale
                onPress={() =>
                  router.push({
                    pathname: "/coach/stack/[id]",
                    params: { id: s.id },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Edit ${s.name}`}
                style={styles.rowMain}
              >
                <View style={styles.icon}>
                  <Pill size={22} color={colors.text} />
                </View>
                <View style={styles.flex}>
                  <Text weight="semibold">{s.name}</Text>
                  <Text
                    variant="label"
                    weight="regular"
                    tone="muted"
                    numberOfLines={1}
                  >
                    {s.items.map((x) => x.name).join(", ")}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </PressableScale>
              <IconButton
                icon={UserPlus}
                accessibilityLabel={`Give ${s.name} to clients`}
                onPress={() =>
                  router.push({
                    pathname: "/coach/stack/assign/[id]",
                    params: { id: s.id },
                  })
                }
              />
            </GroupRow>
          ))}
        </Group>
      ) : (
        <Text tone="muted" style={styles.center}>
          No stacks yet.
        </Text>
      )}
      <Eyebrow>{`Clients with supplements · ${withList.length}`}</Eyebrow>
      {withList.length ? (
        <Group>
          {withList.map((c, i) => (
            <GroupRow
              key={c.id}
              first={i === 0}
              onPress={() =>
                router.push({
                  pathname: "/coach/plan/supplements/[id]",
                  params: { id: c.id },
                })
              }
              label={`${c.name} supplements`}
            >
              <Avatar name={c.name} />
              <View style={styles.flex}>
                <Text weight="semibold">{c.name}</Text>
                <Text
                  variant="label"
                  weight="regular"
                  tone="muted"
                  numberOfLines={1}
                >
                  {c.supplements?.map((x) => x.name).join(", ")}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </GroupRow>
          ))}
        </Group>
      ) : (
        <Text tone="muted">
          None yet. Open a client and add supplements under Plans.
        </Text>
      )}
    </Page>
  );
}

export function EnhancedPage() {
  const { clients, setCompetitive } = useCoachData();
  const [adding, setAdding] = useState(false);
  const live = clients.filter((c) => c.status !== "completed" && !c.pending);
  const comp = live.filter((c) => c.competitive);
  const others = live.filter((c) => !c.competitive && c.id !== "me");
  const open = (id: string) =>
    router.push({ pathname: "/coach/enhanced/[id]", params: { id } });
  return (
    <Page clearDock>
      <View style={styles.note}>
        <ShieldAlert size={20} color={colors.text} />
        <Text variant="label" weight="regular" style={styles.flex}>
          For competitive bodybuilders who opt in themselves. {DOCTOR_NOTE}
        </Text>
      </View>
      {comp.length ? (
        <Group>
          {comp.map((c, i) => {
            const e = c.enhanced;
            const f = e?.consentAt ? flags(e) : [];
            const alert = f.some((x) => x.level === "alert");
            return (
              <GroupRow
                key={c.id}
                first={i === 0}
                onPress={() => open(c.id)}
                label={`${c.name} enhanced`}
              >
                <Avatar name={c.name} />
                <View style={styles.flex}>
                  <Text weight="semibold">{c.name}</Text>
                  <Text variant="label" weight="regular" tone="muted">
                    {e?.consentAt
                      ? `${PHASE_LABEL[e.phase]} · ${e.markers.length} readings`
                      : e?.declinedAt
                        ? "Said no"
                        : e?.requestedAt
                          ? "Waiting for them to opt in"
                          : "Not asked yet"}
                  </Text>
                </View>
                {e?.consentAt ? (
                  f.length ? (
                    <Tag
                      label={`${f.length} to check`}
                      tone={alert ? "danger" : "warning"}
                    />
                  ) : (
                    <Tag label="In range" tone="success" />
                  )
                ) : null}
                <ChevronRight size={18} color={colors.textMuted} />
              </GroupRow>
            );
          })}
        </Group>
      ) : (
        <Text tone="muted" style={styles.center}>
          No competitive clients yet.
        </Text>
      )}
      {adding ? (
        <>
          <Eyebrow>Mark as competitive</Eyebrow>
          {others.length ? (
            <Group>
              {others.map((c, i) => (
                <GroupRow
                  key={c.id}
                  first={i === 0}
                  onPress={() => {
                    setCompetitive(c.id, true);
                    setAdding(false);
                    open(c.id);
                  }}
                  label={`Mark ${c.name} as competitive`}
                >
                  <Avatar name={c.name} />
                  <Text weight="medium" style={styles.flex}>
                    {c.name}
                  </Text>
                  <ChevronRight size={18} color={colors.textMuted} />
                </GroupRow>
              ))}
            </Group>
          ) : (
            <Text tone="muted">Every client is already marked.</Text>
          )}
        </>
      ) : (
        <Button
          label="Mark a client as competitive"
          variant="secondary"
          fullWidth
          onPress={() => setAdding(true)}
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    flexDirection: "row",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
});
