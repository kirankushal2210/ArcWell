// One lead (D63). "new" is the add form. Otherwise: contact buttons, the stage, the next follow-up
// or booked call, the timeline of calls, messages and notes, and the outcome: Joined (opens Add
// client prefilled, so their details carry over) or Not joined with a reason.
import { router, useLocalSearchParams } from "expo-router";
import {
  MessageCircle,
  NotebookPen,
  Phone,
  PhoneCall,
  Trash2,
  UserPlus,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text, TextField } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  dayOffset,
  dayInline,
  dayText,
  isOpen,
  type LeadEventKind,
  type LeadSource,
  LOST_REASONS,
  SOURCE_LABEL,
  STAGE_LABEL,
  STAGES,
  timeText,
} from "@/features/coach/crm";
import { StageTag } from "@/features/coach/CrmParts";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

const SOURCES = Object.keys(SOURCE_LABEL) as LeadSource[];
const FOLLOW_UPS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "Next week", days: 7 },
];
const EVENT_ICON: Record<LeadEventKind, typeof Phone> = {
  created: UserPlus,
  call: PhoneCall,
  message: MessageCircle,
  note: NotebookPen,
  stage: UserPlus,
  follow_up: NotebookPen,
};
/** Indian mobile numbers for WhatsApp: digits only, with the 91 prefix. */
const waNumber = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
};

function NewLead() {
  const { addLead } = useCoachData();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("instagram");
  const [goal, setGoal] = useState("");
  const [note, setNote] = useState("");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/business");
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title="Add a lead" onBack={back} />
      <Page>
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Rohit Kumar"
          autoCapitalize="words"
        />
        <TextField
          label="Phone (optional)"
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. 98765 43210"
          keyboardType="phone-pad"
        />
        <Eyebrow>Where they came from</Eyebrow>
        <Pills
          value={source}
          onChange={setSource}
          options={SOURCES.map((s) => ({ value: s, label: SOURCE_LABEL[s] }))}
        />
        <TextField
          label="What they want (optional)"
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. Lose fat before a wedding"
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Asked about pricing in a DM"
        />
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save lead"
          fullWidth
          disabled={!name.trim()}
          onPress={() => {
            const id = addLead({
              name: name.trim(),
              phone: phone.trim() || undefined,
              source,
              goal: goal.trim() || undefined,
              followUp: dayOffset(1),
              note,
            });
            router.replace({ pathname: "/coach/lead/[id]", params: { id } });
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function LeadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads, updateLead, logLead, deleteLead } = useCoachData();
  const insets = useSafeAreaInsets();
  const [entry, setEntry] = useState("");
  const [picking, setPicking] = useState<"lost" | null>(null);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/business");
  if (id === "new") return <NewLead />;
  const l = leads.find((x) => x.id === id);
  if (!l) return <PageHeader title="Lead not found" onBack={back} />;
  const open = isOpen(l.stage);
  const log = (kind: LeadEventKind) => {
    const fallback = kind === "call" ? "Call" : "Note";
    logLead(l.id, kind, entry.trim() || fallback);
    setEntry("");
  };
  const remove = () =>
    Alert.alert(`Delete ${l.name}?`, "Their timeline goes too.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteLead(l.id);
          back();
        },
      },
    ]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={l.name}
        sub={`${SOURCE_LABEL[l.source]}${l.goal ? ` · ${l.goal}` : ""}`}
        onBack={back}
        actions={[{ icon: Trash2, label: "Delete lead", onPress: remove }]}
      />
      <Page>
        <View style={styles.headRow}>
          <StageTag stage={l.stage} />
          {l.stage === "lost" && l.lostReason ? (
            <Text variant="label" weight="regular" tone="muted">
              {l.lostReason}
            </Text>
          ) : null}
        </View>

        {l.phone ? (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                label="Call"
                icon={Phone}
                variant="secondary"
                fullWidth
                onPress={() => {
                  Linking.openURL(`tel:${l.phone}`).catch(() => {});
                  logLead(l.id, "call", "Called");
                }}
              />
            </View>
            <View style={styles.flex}>
              <Button
                label="WhatsApp"
                icon={MessageCircle}
                variant="secondary"
                fullWidth
                onPress={() => {
                  Linking.openURL(
                    `https://wa.me/${waNumber(l.phone ?? "")}`,
                  ).catch(() => {});
                  logLead(l.id, "message", "Messaged on WhatsApp");
                }}
              />
            </View>
          </View>
        ) : null}

        {open ? (
          <>
            <Eyebrow>Stage</Eyebrow>
            <Pills
              value={l.stage}
              onChange={(s) =>
                updateLead(l.id, { stage: s }, `Moved to ${STAGE_LABEL[s]}`)
              }
              options={STAGES.filter((s) => isOpen(s.key)).map((s) => ({
                value: s.key,
                label: s.label,
              }))}
            />
            <Eyebrow>
              {l.followUp ? `Follow up · ${dayText(l.followUp)}` : "Follow up"}
            </Eyebrow>
            <Pills
              value={
                FOLLOW_UPS.find((f) => dayOffset(f.days) === l.followUp)
                  ?.label ?? ""
              }
              onChange={(v) => {
                const f = FOLLOW_UPS.find((x) => x.label === v);
                if (f)
                  updateLead(
                    l.id,
                    { followUp: dayOffset(f.days) },
                    `Follow-up set for ${dayInline(dayOffset(f.days))}`,
                  );
              }}
              options={FOLLOW_UPS.map((f) => ({
                value: f.label,
                label: f.label,
              }))}
            />
            {l.stage === "call_booked" && l.callAt ? (
              <Text variant="label" weight="regular" tone="muted" numeric>
                Call booked for {dayInline(l.callAt.slice(0, 10))},{" "}
                {timeText(l.callAt)}
              </Text>
            ) : null}
          </>
        ) : null}

        <Eyebrow>Timeline</Eyebrow>
        <View style={styles.card}>
          <TextInput
            value={entry}
            onChangeText={setEntry}
            placeholder="What happened? e.g. Sent the 3-month package"
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.entry}
            accessibilityLabel="Timeline entry"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                label="Log call"
                icon={PhoneCall}
                variant="ghost"
                fullWidth
                onPress={() => log("call")}
              />
            </View>
            <View style={styles.flex}>
              <Button
                label="Add note"
                icon={NotebookPen}
                variant="ghost"
                fullWidth
                onPress={() => log("note")}
              />
            </View>
          </View>
          {[...l.events].reverse().map((e) => {
            const Icon = EVENT_ICON[e.kind];
            return (
              <View key={e.id} style={styles.event}>
                <Icon size={18} color={colors.textMuted} />
                <View style={styles.flex}>
                  <Text>{e.text}</Text>
                  <Text variant="caption" tone="muted" numeric>
                    {dayText(e.at.slice(0, 10))}, {timeText(e.at)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {picking === "lost" ? (
          <>
            <Eyebrow>Why didn&apos;t they join?</Eyebrow>
            <Pills
              value=""
              onChange={(r) => {
                updateLead(
                  l.id,
                  { stage: "lost", lostReason: r, followUp: undefined },
                  `Not joined · ${r}`,
                );
                setPicking(null);
              }}
              options={LOST_REASONS.map((r) => ({ value: r, label: r }))}
            />
          </>
        ) : null}
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {open ? (
          <>
            <Button
              label="They joined · add as client"
              icon={UserPlus}
              fullWidth
              onPress={() =>
                router.push({
                  pathname: "/coach/add-client",
                  params: { leadId: l.id },
                })
              }
            />
            <Button
              label="They didn't join"
              variant="ghost"
              fullWidth
              onPress={() => setPicking(picking ? null : "lost")}
            />
          </>
        ) : l.stage === "joined" && l.clientId ? (
          <Button
            label="Open client"
            fullWidth
            onPress={() =>
              router.push({
                pathname: "/coach/client/[id]",
                params: { id: l.clientId ?? "" },
              })
            }
          />
        ) : (
          <Button
            label="Reopen lead"
            variant="secondary"
            fullWidth
            onPress={() =>
              updateLead(
                l.id,
                {
                  stage: "contacted",
                  lostReason: undefined,
                  followUp: dayOffset(1),
                },
                "Reopened",
              )
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  row: { flexDirection: "row", gap: space[2] },
  headRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  entry: {
    minHeight: 48,
    padding: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
    textAlignVertical: "top",
  },
  event: { flexDirection: "row", gap: space[3], alignItems: "flex-start" },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});
