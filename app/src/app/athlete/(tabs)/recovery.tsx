// Recovery (D60): Overview · Sleep · Recovery · Strain as section tabs (D61), with a date switcher
// and the connected device. Scores come from a device, else the morning check-in, else the
// onboarding answers, and each page says which. Part of Arcwell Plus for self-guided athletes (D5a,
// D57); full for coached athletes.
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Sun,
  Watch,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import { dateLabel, shiftDate } from "@/features/athlete/foods";
import { DEVICE_LABEL } from "@/features/athlete/recovery";
import { useDayPicker } from "@/features/athlete/useToday";
import {
  Overview,
  RecoveryPage,
  type RecoveryTab,
  SleepPage,
  StrainPage,
} from "@/features/athlete/RecoveryPages";
import {
  athleteMenuAction,
  progressAction,
} from "@/features/athlete/MenuParts";
import { useRecovery } from "@/features/athlete/RecoveryParts";
import { AthleteDock, AthletePage, NotJoined } from "@/features/athlete/useMe";
import { PageHeader } from "@/features/coach/parts";
import { clock } from "@/features/coach/plans";
import { colors, radius, rhythm, space } from "@/theme";

const TABS: { key: RecoveryTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "sleep", label: "Sleep" },
  { key: "recovery", label: "Recovery" },
  { key: "strain", label: "Strain" },
];

export default function Recovery() {
  const r = useRecovery();
  const p = useLocalSearchParams<{ tab?: RecoveryTab }>();
  const { today, date, setDate } = useDayPicker();
  const [tab, setTab] = useState<RecoveryTab>(p.tab ?? "overview");
  // Opened from Today's rings with a section in mind: switch to it.
  const [asked, setAsked] = useState(p.tab);
  if (p.tab !== asked) {
    setAsked(p.tab);
    if (p.tab) setTab(p.tab);
  }
  if (!r.me) return <NotJoined />;

  if (r.tier === "free")
    return (
      <View style={styles.root}>
        <PageHeader
          title="Recovery"
          actions={[progressAction, athleteMenuAction]}
        />
        <AthletePage>
          <View style={styles.locked}>
            <Lock size={32} strokeWidth={1.6} color={colors.text} />
            <Text variant="title" style={styles.center}>
              Recovery is part of Arcwell Plus
            </Text>
            <Text tone="muted" style={styles.center}>
              Sleep, recovery and strain every morning, from your watch or a
              20-second check-in, with what to do about them.
            </Text>
            {r.me.protocol ? (
              <Text weight="medium" style={styles.center} numeric>
                Your target: {r.me.protocol.sleepH} h, in bed by{" "}
                {clock(r.me.protocol.bed)}
              </Text>
            ) : null}
            <Button
              label="Start 7-day free trial"
              fullWidth
              onPress={() => router.push("/athlete/ai")}
            />
          </View>
        </AthletePage>
      </View>
    );

  const day = r.day(date);
  const isToday = date === today;
  const device = r.store.device;

  return (
    <View style={styles.root}>
      <PageHeader
        title="Recovery"
        actions={[progressAction, athleteMenuAction]}
      />
      <View style={styles.dates}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel="Previous day"
          onPress={() => setDate((d) => shiftDate(d, -1))}
        />
        <Text weight="semibold" style={styles.dateText}>
          {dateLabel(date, today)}
        </Text>
        <IconButton
          icon={ChevronRight}
          accessibilityLabel="Next day"
          disabled={isToday}
          onPress={() => setDate((d) => shiftDate(d, 1))}
        />
        <PressableScale
          onPress={() => router.push("/athlete/recovery/connect")}
          accessibilityRole="button"
          accessibilityLabel={
            device
              ? `${DEVICE_LABEL[device.brand]} connected. Manage`
              : "Connect a device"
          }
          style={styles.device}
        >
          <Watch size={16} color={colors.text} />
          <Text variant="label" numberOfLines={1}>
            {device ? "Synced" : "Connect"}
          </Text>
        </PressableScale>
      </View>
      <SectionTabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        pages={[
          <Overview key="o" r={r} day={day} isToday={isToday} open={setTab} />,
          <SleepPage key="s" r={r} day={day} />,
          <RecoveryPage key="r" r={r} day={day} />,
          <StrainPage key="t" r={r} day={day} isToday={isToday} />,
        ]}
      />
      {isToday && !day.log ? (
        <AthleteDock
          label="Morning check-in"
          icon={Sun}
          pillar="recovery"
          onPress={() => router.push("/athlete/recovery/check-in")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { textAlign: "center" },
  locked: { alignItems: "center", gap: space[3], paddingTop: space[8] },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rhythm.gutter,
  },
  dateText: { flex: 1, textAlign: "center" },
  device: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    minHeight: 36,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
