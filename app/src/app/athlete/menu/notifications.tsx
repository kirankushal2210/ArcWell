// Notifications (N-06, E-02): the list, then what to send me. The four switches are the SPEC's
// athlete types; coach-only types show only for coached athletes.
import { router } from "expo-router";
import { BellOff, ChevronRight } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { backTo, MenuPage, ToggleRow } from "@/features/athlete/MenuParts";
import { useNotifications } from "@/features/athlete/notifications";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Group, GroupRow } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";
import { NotifyBanner } from "@/features/system/NotifyAsk";

export default function Notifications() {
  const me = useMe();
  const { meTier, settingsOf, setAthleteSettings } = useCoachData();
  const { items } = useNotifications();
  if (!me) return <NotJoined />;
  const s = settingsOf(me.id);
  const coached = meTier === "coached";
  const set = (k: keyof typeof s.notify) => (v: boolean) =>
    setAthleteSettings(me.id, { notify: { ...s.notify, [k]: v } });

  const toggles: [keyof typeof s.notify, string, boolean][] = [
    ["messages", "Messages from my coach", coached],
    ["checkIns", "Check-in reminders", coached],
    ["plan", "Plan assigned or updated", coached],
    ["workout", "Daily workout reminder", true],
  ];
  const shown = toggles.filter(([, , show]) => show);

  return (
    <MenuPage title="Notifications" back={backTo("/athlete/menu")}>
      <NotifyBanner />
      {items.length ? (
        <Group>
          {items.map((n, i) => (
            <GroupRow
              key={n.id}
              first={i === 0}
              onPress={() => {
                if (n.isNew)
                  setAthleteSettings(me.id, {
                    notesRead: [...(s.notesRead ?? []), n.id],
                  });
                router.push(n.href);
              }}
              label={n.title}
            >
              {n.isNew ? <View style={styles.new} /> : null}
              <View style={styles.flex}>
                <Text weight={n.isNew ? "semibold" : "medium"}>{n.title}</Text>
                <Text
                  variant="label"
                  weight="regular"
                  tone="muted"
                  numberOfLines={2}
                >
                  {n.sub}
                </Text>
              </View>
              <Text variant="caption" tone="muted" numeric>
                {n.when}
              </Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </GroupRow>
          ))}
        </Group>
      ) : (
        <View style={styles.empty}>
          <BellOff size={32} strokeWidth={1.6} color={colors.text} />
          <Text variant="title" style={styles.center}>
            You&apos;re all caught up
          </Text>
          <Text tone="muted" style={styles.center}>
            Reminders and updates will appear here.
          </Text>
        </View>
      )}

      <Eyebrow>Send me</Eyebrow>
      <Group>
        {shown.map(([k, label], i) => (
          <ToggleRow
            key={k}
            first={i === 0}
            label={label}
            value={s.notify[k]}
            onChange={set(k)}
          />
        ))}
      </Group>
      <Text variant="caption" tone="muted">
        Turning a type off here also stops its phone notifications.
      </Text>
      <Text
        variant="label"
        weight="medium"
        accessibilityRole="link"
        onPress={() => router.push("/athlete/menu/reminders")}
      >
        Set reminder times
      </Text>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  empty: { alignItems: "center", gap: space[2], paddingVertical: space[6] },
  new: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.warning,
  },
});
