// Business (D63, D66): the coach's CRM as section tabs (D61): Overview · Leads · Instagram ·
// Clients. Most clients start on Instagram, so it has its own tab. The QR button opens the invite
// link page; + adds a lead.
import { router } from "expo-router";
import { Plus, QrCode } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { SectionTabs } from "@/components/SectionTabs";
import { menuAction } from "@/features/coach/coachProfile";
import {
  ClientsPage,
  InstagramPage,
  LeadsPage,
  OverviewPage,
} from "@/features/coach/BusinessPages";
import { ActionDock, PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

type Tab = "overview" | "leads" | "instagram" | "clients";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "leads", label: "Leads" },
  { key: "instagram", label: "Instagram" },
  { key: "clients", label: "Clients" },
];

export default function BusinessTab() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <View style={styles.root}>
      <PageHeader
        title="Business"
        actions={[
          menuAction,
          {
            icon: QrCode,
            label: "Invite link and QR code",
            onPress: () => router.push("/coach/invite-link"),
          },
        ]}
      />
      <SectionTabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        pages={[
          <OverviewPage key="o" />,
          <LeadsPage key="l" />,
          <InstagramPage key="g" />,
          <ClientsPage key="c" />,
        ]}
      />
      {tab === "clients" ? null : (
        <ActionDock
          label={tab === "instagram" ? "Add an Instagram lead" : "Add a lead"}
          icon={Plus}
          onPress={() =>
            router.push({
              pathname: "/coach/lead/[id]",
              params:
                tab === "instagram"
                  ? { id: "new", source: "instagram" }
                  : { id: "new" },
            })
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
