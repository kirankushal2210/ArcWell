// Business (D63): the coach's CRM as section tabs (D61): Overview · Leads · Clients · Invite.
// Leads and client accounts open detail pages; the + adds a lead.
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { SectionTabs } from "@/components/SectionTabs";
import { menuAction } from "@/features/coach/coachProfile";
import {
  ClientsPage,
  InvitePage,
  LeadsPage,
  OverviewPage,
} from "@/features/coach/BusinessPages";
import { PageHeader } from "@/features/coach/parts";
import { colors } from "@/theme";

type Tab = "overview" | "leads" | "clients" | "invite";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "leads", label: "Leads" },
  { key: "clients", label: "Clients" },
  { key: "invite", label: "Invite" },
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
            icon: Plus,
            label: "Add a lead",
            onPress: () =>
              router.push({
                pathname: "/coach/lead/[id]",
                params: { id: "new" },
              }),
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
          <ClientsPage key="c" />,
          <InvitePage key="i" />,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
