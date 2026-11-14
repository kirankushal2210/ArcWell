// Transformations (F9-01, E-08): every request with its status always visible. Only approved photos
// can be exported or shown on the profile; withdrawn ones stay listed, greyed, so the coach knows to
// take old posts down. Requests start from a client's profile (Progress) or the Request button.
import { router } from "expo-router";
import { ChevronRight, Images } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import { usesText } from "@/features/athlete/athleteData";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Pills } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Filter = "all" | "approved" | "waiting" | "closed";
const STATUS = {
  approved: "Approved",
  waiting: "Waiting",
  declined: "Declined",
  withdrawn: "Withdrawn",
} as const;

export default function Transformations() {
  const { clients } = useCoachData();
  const [filter, setFilter] = useState<Filter>("all");
  const all = clients.flatMap((c) =>
    (c.transformations ?? []).map((t) => ({ c, t })),
  );
  const count = (f: Filter) =>
    all.filter(({ t }) =>
      f === "all"
        ? true
        : f === "closed"
          ? t.status === "declined" || t.status === "withdrawn"
          : t.status === f,
    ).length;
  const shown = all.filter(({ t }) =>
    filter === "all"
      ? true
      : filter === "closed"
        ? t.status === "declined" || t.status === "withdrawn"
        : t.status === filter,
  );
  const request = () => router.push("/coach/transformations/request/pick");

  return (
    <MenuPage
      title="Transformations"
      back={backTo("/coach/menu")}
      footer={<Button label="Request photos" fullWidth onPress={request} />}
    >
      {all.length ? (
        <>
          <Pills
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `All · ${count("all")}` },
              { value: "approved", label: `Approved · ${count("approved")}` },
              { value: "waiting", label: `Waiting · ${count("waiting")}` },
              {
                value: "closed",
                label: `Declined or withdrawn · ${count("closed")}`,
              },
            ]}
          />
          <Group>
            {shown.map(({ c, t }, i) => {
              const open = t.status === "approved";
              const row = (
                <>
                  <Avatar name={c.name} />
                  <View style={styles.flex}>
                    <View style={styles.head}>
                      <Text
                        weight="semibold"
                        tone={
                          open || t.status === "waiting" ? "default" : "muted"
                        }
                      >
                        {c.name}
                      </Text>
                      <View
                        style={[
                          styles.chip,
                          t.status === "approved" && styles.chipOn,
                        ]}
                      >
                        <Text
                          variant="caption"
                          weight="semibold"
                          tone={t.status === "approved" ? "onPillar" : "muted"}
                        >
                          {STATUS[t.status]}
                        </Text>
                      </View>
                    </View>
                    <Text variant="label" weight="regular" tone="muted">
                      {t.status === "approved"
                        ? `${t.caption || `${t.before.label} to ${t.after.label}`} · ${t.blurFace ? "face blurred" : "face shown"} · ${usesText(t.uses)}`
                        : t.status === "waiting"
                          ? `Requested ${t.requestedAt}`
                          : t.status === "withdrawn"
                            ? `Withdrawn ${t.withdrawnAt ?? ""}. Take down any posts.`
                            : "Declined"}
                    </Text>
                  </View>
                  {open ? (
                    <ChevronRight size={18} color={colors.textMuted} />
                  ) : null}
                </>
              );
              return (
                <GroupRow
                  key={t.id}
                  first={i === 0}
                  label={`${c.name}, ${STATUS[t.status]}`}
                  onPress={
                    open
                      ? () =>
                          router.push({
                            pathname: "/coach/transformations/[id]",
                            params: { id: `${c.id}~${t.id}` },
                          })
                      : undefined
                  }
                >
                  {row}
                </GroupRow>
              );
            })}
          </Group>
        </>
      ) : (
        <View style={styles.empty}>
          <Images size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            No transformation photos yet
          </Text>
          <Text tone="muted" style={styles.center}>
            Ask a client if you can use their progress photos. They choose
            what&apos;s shared, can blur their face, and can withdraw at any
            time.
          </Text>
        </View>
      )}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  head: { flexDirection: "row", alignItems: "center", gap: space[2] },
  chip: {
    paddingHorizontal: space[2],
    paddingVertical: space[1] / 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  chipOn: { backgroundColor: colors.success },
  center: { textAlign: "center" },
  empty: { alignItems: "center", gap: space[2], paddingVertical: space[6] },
});
