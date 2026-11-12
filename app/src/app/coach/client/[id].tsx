// Client profile (sitemap §5, K-02, K-03, K-14 to K-18, CO-15) as section tabs (D61):
// Overview · Training · Nutrition · Recovery. Check-ins, progress, notes, account and status are
// detail pages from Overview. A client added after a call shows the set-up-plans step; one who
// joined with the link shows their answers and the assign-plan step.
import { router, useLocalSearchParams } from "expo-router";
import { Ellipsis, MessageCircle } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar, StatusChip, Text } from "@/components/primitives";
import { SectionTabs } from "@/components/SectionTabs";
import { useCoachData } from "@/features/coach/CoachData";
import {
  type ClientTab,
  NewClient,
  Nutrition,
  Overview,
  Recovery,
  SetUpPlans,
  Training,
} from "@/features/coach/ClientSections";
import { tenureText } from "@/features/coach/crm";
import { Page, PageHeader } from "@/features/coach/parts";
import { colors, rhythm, space } from "@/theme";

const TABS: { key: ClientTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "training", label: "Training" },
  { key: "nutrition", label: "Nutrition" },
  { key: "recovery", label: "Recovery" },
];

export default function ClientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useCoachData();
  const c = client(id);
  const [tab, setTab] = useState<ClientTab>("overview");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");

  if (!c) {
    return (
      <View style={styles.root}>
        <PageHeader title="Client" onBack={back} />
        <Text tone="muted" style={styles.pad}>
          This client isn&apos;t in your list any more.
        </Text>
      </View>
    );
  }

  const hero = (
    <View style={styles.hero}>
      <Avatar name={c.name} size={48} />
      <View style={styles.flex}>
        <Text weight="semibold">{c.goal}</Text>
        <Text variant="label" weight="regular" tone="muted">
          {c.pending
            ? c.invite
              ? "Invite sent · waiting for them to join"
              : "Added by you · not invited yet"
            : c.isNew
              ? `Joined ${c.joined} with your link`
              : `${tenureText(c.weeksWithYou)} · check-in ${c.checkInDay}`}
        </Text>
      </View>
      {c.pending ? null : <StatusChip status={c.status} />}
    </View>
  );

  return (
    <View style={styles.root}>
      <PageHeader
        title={c.name}
        onBack={back}
        actions={
          c.pending
            ? []
            : [
                {
                  icon: MessageCircle,
                  label: "Message",
                  onPress: () =>
                    router.push({
                      pathname: "/coach/chat/[id]",
                      params: { id: c.id },
                    }),
                },
                {
                  icon: Ellipsis,
                  label: "Change status",
                  onPress: () =>
                    router.push({
                      pathname: "/coach/client/status/[id]",
                      params: { id: c.id },
                    }),
                },
              ]
        }
      />
      {c.pending || c.isNew ? (
        <Page>
          {hero}
          {c.pending ? <SetUpPlans c={c} /> : <NewClient c={c} />}
        </Page>
      ) : (
        <>
          <View style={styles.heroWrap}>{hero}</View>
          <SectionTabs
            tabs={TABS}
            value={tab}
            onChange={setTab}
            pages={[
              <Page key="o">
                <Overview c={c} go={setTab} />
              </Page>,
              <Page key="t">
                <Training c={c} />
              </Page>,
              <Page key="n">
                <Nutrition c={c} />
              </Page>,
              <Page key="r">
                <Recovery c={c} />
              </Page>,
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: space[4] },
  flex: { flex: 1, gap: space[1] / 2 },
  heroWrap: { paddingHorizontal: rhythm.gutter, paddingBottom: space[2] },
  hero: { flexDirection: "row", alignItems: "center", gap: space[3] },
});
