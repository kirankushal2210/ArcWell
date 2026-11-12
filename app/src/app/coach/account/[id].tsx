// A client's account (D63): package, fee and billing cycle, when they started, when they renew,
// whether they've paid, and where they came from. Recorded by the coach; payments happen
// outside the app (D56). "Mark paid" sets this cycle to paid.
import { router, useLocalSearchParams } from "expo-router";
import { CircleCheck, UserRound } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  NumberStepper,
  StatusChip,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  accountOf,
  type Billing,
  BILLING_LABEL,
  type ClientAccount,
  dayOffset,
  dayInline,
  dayText,
  inr,
  type LeadSource,
  monthlyValue,
  PAID_LABEL,
  type PaymentStatus,
  renewsOn,
  SOURCE_LABEL,
  STAGE_LABEL,
  tenureText,
} from "@/features/coach/crm";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const STARTS = [
  { label: "Today", days: 0 },
  { label: "A week ago", days: -7 },
  { label: "A month ago", days: -30 },
  { label: "3 months ago", days: -91 },
];

export default function Account() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, saveAccount, leads } = useCoachData();
  const c = client(id);
  const insets = useSafeAreaInsets();
  const [a, setA] = useState<ClientAccount | null>(() =>
    c ? accountOf(c) : null,
  );
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/business");
  if (!c || !a) return <PageHeader title="Client not found" onBack={back} />;
  const set = (patch: Partial<ClientAccount>) =>
    setA((x) => (x ? { ...x, ...patch } : x));
  const on = renewsOn(a);
  const lead = leads.find((l) => l.clientId === c.id || l.id === a.leadId);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={c.name}
        sub="Account"
        onBack={back}
        actions={[
          {
            icon: UserRound,
            label: "Open client profile",
            onPress: () =>
              router.push({
                pathname: "/coach/client/[id]",
                params: { id: c.id },
              }),
          },
        ]}
      />
      <Page>
        <View style={styles.card}>
          <View style={styles.between}>
            <StatusChip status={c.status} />
            <Text variant="label" weight="regular" tone="muted" numeric>
              {c.pending ? "Not joined yet" : tenureText(c.weeksWithYou)}
            </Text>
          </View>
          <Text variant="title" numeric>
            {inr(a.feeInr)}{" "}
            <Text tone="muted">{BILLING_LABEL[a.billing].toLowerCase()}</Text>
          </Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {on ? `Renews ${dayInline(on)}` : "No renewal"} · about{" "}
            {inr(monthlyValue(a))} a month
          </Text>
        </View>

        <Eyebrow>Package</Eyebrow>
        <TextInput
          value={a.package}
          onChangeText={(v) => set({ package: v })}
          placeholder="e.g. Fat loss · 3 months"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Package name"
        />
        <View style={styles.row}>
          <Text style={styles.flex}>Fee</Text>
          <NumberStepper
            value={a.feeInr}
            onChange={(v) => set({ feeInr: v })}
            step={500}
            min={0}
            max={200000}
            unit="₹"
            accessibilityLabel="Fee in rupees"
          />
        </View>
        <Pills<Billing>
          value={a.billing}
          onChange={(v) => set({ billing: v })}
          options={(Object.keys(BILLING_LABEL) as Billing[]).map((b) => ({
            value: b,
            label: BILLING_LABEL[b],
          }))}
        />

        <Eyebrow>{`Started · ${dayText(a.startedAt)}`}</Eyebrow>
        <Pills
          value={
            STARTS.find((s) => dayOffset(s.days) === a.startedAt)?.label ?? ""
          }
          onChange={(v) => {
            const s = STARTS.find((x) => x.label === v);
            if (s) set({ startedAt: dayOffset(s.days) });
          }}
          options={STARTS.map((s) => ({ value: s.label, label: s.label }))}
        />

        <Eyebrow>This cycle</Eyebrow>
        <Pills<PaymentStatus>
          value={a.paid}
          onChange={(v) => set({ paid: v })}
          options={(Object.keys(PAID_LABEL) as PaymentStatus[]).map((p) => ({
            value: p,
            label: PAID_LABEL[p],
          }))}
        />

        <Eyebrow>Came from</Eyebrow>
        <Pills<LeadSource>
          value={a.source ?? c.source ?? "other"}
          onChange={(v) => set({ source: v })}
          options={(Object.keys(SOURCE_LABEL) as LeadSource[]).map((s) => ({
            value: s,
            label: SOURCE_LABEL[s],
          }))}
        />
        {lead ? (
          <Button
            label={`Lead history · ${STAGE_LABEL[lead.stage]}, ${lead.events.length} entries`}
            variant="ghost"
            fullWidth
            onPress={() =>
              router.push({
                pathname: "/coach/lead/[id]",
                params: { id: lead.id },
              })
            }
          />
        ) : null}
        <Text variant="caption" tone="muted">
          Payments happen outside Arcwell. This is your own record.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {a.paid !== "paid" ? (
          <Button
            label="Mark this cycle paid"
            icon={CircleCheck}
            variant="secondary"
            fullWidth
            onPress={() => set({ paid: "paid" })}
          />
        ) : null}
        <Button
          label="Save"
          fullWidth
          disabled={!a.package.trim()}
          onPress={() => {
            saveAccount(c.id, { ...a, package: a.package.trim() });
            back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});
