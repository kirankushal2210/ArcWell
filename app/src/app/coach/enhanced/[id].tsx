// One client's Enhanced record (D64), for competitive bodybuilders who opted in themselves. The
// coach records what the client reports taking (never suggested by the app), the phase, vitals,
// bloodwork and side effects; markers outside usual ranges are flagged. Nothing is tracked
// before the client's consent, and the doctor note is always on screen.
import { router, useLocalSearchParams } from "expo-router";
import { Plus, ShieldAlert, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button, IconButton, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { dayOffset, dayText, onDay, ymd } from "@/features/coach/crm";
import { LevelTag } from "@/features/coach/CrmParts";
import {
  DOCTOR_NOTE,
  enhId,
  flags,
  latest,
  MARKER_KINDS,
  type MarkerKind,
  MARKERS,
  type Phase,
  PHASE_LABEL,
} from "@/features/coach/enhanced";
import { Eyebrow, Page, PageHeader, Pills } from "@/features/coach/parts";
import { alert } from "@/lib/alert";
import { colors, fontFamilyFor, radius, space, textSizes } from "@/theme";

export default function EnhancedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, requestEnhanced, editEnhanced, setCompetitive } =
    useCoachData();
  const c = client(id);
  const [item, setItem] = useState({ compound: "", amount: "", frequency: "" });
  const [kind, setKind] = useState<MarkerKind>("systolic");
  const [value, setValue] = useState("");
  const [effect, setEffect] = useState("");
  const [severity, setSeverity] = useState<"1" | "2" | "3">("1");
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/plans");
  if (!c) return <PageHeader title="Enhanced" onBack={back} />;
  const first = c.name.split(" ")[0];
  const e = c.enhanced;
  const consented = !!e?.consentAt;
  const today = ymd(new Date());

  const note = (
    <View style={styles.note}>
      <ShieldAlert size={20} color={colors.text} />
      <Text variant="label" weight="regular" style={styles.flex}>
        {DOCTOR_NOTE}
      </Text>
    </View>
  );

  if (!consented)
    return (
      <View style={styles.root}>
        <PageHeader title={`Enhanced · ${first}`} onBack={back} />
        <Page>
          {note}
          <Text tone="muted">
            {e?.declinedAt
              ? `${first} said no ${onDay(ymd(new Date(e.declinedAt)))}. Nothing is tracked. You can ask again if they change their mind.`
              : e?.requestedAt
                ? `Waiting for ${first} to say yes in their app. Nothing is tracked until they do.`
                : `${first} decides. When you ask, ${first} sees exactly what's recorded and who sees it (only you and them), and says yes or no in their app.`}
          </Text>
          {!e?.requestedAt || e.declinedAt ? (
            <Button
              label={e?.declinedAt ? "Ask again" : `Ask ${first} to opt in`}
              fullWidth
              onPress={() => requestEnhanced(c.id)}
            />
          ) : null}
          <Button
            label="Not a competitive client"
            variant="ghost"
            fullWidth
            onPress={() => {
              setCompetitive(c.id, false);
              back();
            }}
          />
        </Page>
      </View>
    );

  const rows = latest(e);
  const bad = flags(e);
  const r = MARKERS[kind];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader
        title={`Enhanced · ${first}`}
        sub={`${first} opted in ${onDay(e.consentAt ? ymd(new Date(e.consentAt)) : today)}`}
        onBack={back}
      />
      <Page>
        {note}

        {bad.length ? (
          <View style={styles.card}>
            <Text weight="semibold">Needs attention</Text>
            {bad.map((x) => (
              <View key={x.kind} style={styles.between}>
                <Text style={styles.flex}>
                  {MARKERS[x.kind].label}: {x.now.value} {MARKERS[x.kind].unit}
                </Text>
                <LevelTag level={x.level} />
              </View>
            ))}
            <Text variant="caption" tone="muted">
              Ask {first} to share these with their doctor.
            </Text>
          </View>
        ) : null}

        <Eyebrow>
          {`Phase${e.phaseSince ? ` · since ${dayText(e.phaseSince)}` : ""}`}
        </Eyebrow>
        <Pills<Phase>
          value={e.phase}
          onChange={(p) =>
            editEnhanced(c.id, (x) => ({ ...x, phase: p, phaseSince: today }))
          }
          options={(Object.keys(PHASE_LABEL) as Phase[]).map((p) => ({
            value: p,
            label: PHASE_LABEL[p],
          }))}
        />

        <Eyebrow>{`What ${first} reports taking`}</Eyebrow>
        <View style={styles.card}>
          {e.items.length ? (
            e.items.map((it) => (
              <View key={it.id} style={styles.item}>
                <View style={styles.flex}>
                  <Text weight="medium">{it.compound}</Text>
                  <Text variant="label" weight="regular" tone="muted">
                    {[it.amount, it.frequency, `since ${dayText(it.startedAt)}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                  {it.note ? (
                    <Text variant="caption" tone="muted">
                      {it.note}
                    </Text>
                  ) : null}
                </View>
                <IconButton
                  icon={Trash2}
                  color={colors.textMuted}
                  accessibilityLabel={`Remove ${it.compound}`}
                  onPress={() =>
                    editEnhanced(c.id, (x) => ({
                      ...x,
                      items: x.items.filter((y) => y.id !== it.id),
                    }))
                  }
                />
              </View>
            ))
          ) : (
            <Text tone="muted">Nothing recorded.</Text>
          )}
          {(["compound", "amount", "frequency"] as const).map((k) => (
            <TextInput
              key={k}
              value={item[k]}
              onChangeText={(v) => setItem((x) => ({ ...x, [k]: v }))}
              placeholder={
                k === "compound"
                  ? "What, as they report it"
                  : k === "amount"
                    ? "Amount, as they report it"
                    : "How often, as they report it"
              }
              placeholderTextColor={colors.textMuted}
              style={styles.field}
              accessibilityLabel={k}
            />
          ))}
          <Button
            label="Record"
            icon={Plus}
            variant="secondary"
            disabled={!item.compound.trim()}
            onPress={() => {
              editEnhanced(c.id, (x) => ({
                ...x,
                items: [
                  ...x.items,
                  {
                    id: enhId("ci"),
                    compound: item.compound.trim(),
                    amount: item.amount.trim(),
                    frequency: item.frequency.trim(),
                    startedAt: today,
                  },
                ],
              }));
              setItem({ compound: "", amount: "", frequency: "" });
            }}
          />
          <Text variant="caption" tone="muted">
            A record of what {first} tells you. Arcwell never suggests what or
            how much.
          </Text>
        </View>

        <Eyebrow>Health markers</Eyebrow>
        <View style={styles.card}>
          {rows.length ? (
            rows.map((x) => (
              <View key={x.kind} style={styles.item}>
                <View style={styles.flex}>
                  <Text weight="medium">{MARKERS[x.kind].label}</Text>
                  <Text variant="label" weight="regular" tone="muted" numeric>
                    {x.now.value} {MARKERS[x.kind].unit} · {dayText(x.now.date)}
                    {x.prev ? ` · was ${x.prev.value}` : ""}
                  </Text>
                </View>
                {MARKERS[x.kind].dir === "none" ? null : (
                  <LevelTag level={x.level} />
                )}
              </View>
            ))
          ) : (
            <Text tone="muted">No readings yet.</Text>
          )}
        </View>
        <Eyebrow>Add a reading</Eyebrow>
        <Pills<MarkerKind>
          value={kind}
          onChange={setKind}
          options={MARKER_KINDS.map((k) => ({
            value: k,
            label: MARKERS[k].label,
          }))}
        />
        <View style={styles.addRow}>
          <TextInput
            value={value}
            onChangeText={(v) => setValue(v.replace(/[^\d.]/g, ""))}
            placeholder={`Value in ${r.unit}`}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={[styles.field, styles.flex]}
            accessibilityLabel={`${r.label} in ${r.unit}`}
          />
          <Button
            label="Add"
            icon={Plus}
            variant="secondary"
            disabled={!Number(value)}
            onPress={() => {
              editEnhanced(c.id, (x) => ({
                ...x,
                markers: [
                  ...x.markers,
                  { id: enhId("m"), date: today, kind, value: Number(value) },
                ],
              }));
              setValue("");
            }}
          />
        </View>
        {r.dir !== "none" && r.watch !== undefined ? (
          <Text variant="caption" tone="muted" numeric>
            Flagged {r.dir === "high" ? "above" : "below"} {r.watch} {r.unit},
            doctor {r.dir === "high" ? "at" : "under"} {r.alert}. Use the
            lab&apos;s own ranges when they differ.
          </Text>
        ) : null}

        <Eyebrow>Side effects</Eyebrow>
        <View style={styles.card}>
          {e.sideEffects.length ? (
            [...e.sideEffects].reverse().map((s) => (
              <View key={s.id} style={styles.item}>
                <View style={styles.flex}>
                  <Text>{s.text}</Text>
                  <Text variant="caption" tone="muted">
                    {["Mild", "Moderate", "Severe"][s.severity - 1]} ·{" "}
                    {dayText(s.date)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text tone="muted">None reported.</Text>
          )}
          <TextInput
            value={effect}
            onChangeText={setEffect}
            placeholder="What they noticed, e.g. headaches, acne, mood"
            placeholderTextColor={colors.textMuted}
            style={styles.field}
            accessibilityLabel="Side effect"
          />
          <Pills<"1" | "2" | "3">
            value={severity}
            onChange={setSeverity}
            options={[
              { value: "1", label: "Mild" },
              { value: "2", label: "Moderate" },
              { value: "3", label: "Severe" },
            ]}
          />
          <Button
            label="Record side effect"
            icon={Plus}
            variant="secondary"
            disabled={!effect.trim()}
            onPress={() => {
              const sev = Number(severity) as 1 | 2 | 3;
              editEnhanced(c.id, (x) => ({
                ...x,
                sideEffects: [
                  ...x.sideEffects,
                  {
                    id: enhId("se"),
                    date: today,
                    text: effect.trim(),
                    severity: sev,
                  },
                ],
              }));
              setEffect("");
              if (sev === 3)
                alert(
                  "Severe side effect",
                  `Ask ${first} to see a doctor today. For chest pain, trouble breathing or fainting, call 112.`,
                );
            }}
          />
        </View>
        <Text variant="caption" tone="muted">
          Only you and {first} see this. {first} can stop sharing at any time.
          Next bloodwork: ask for it around {dayText(dayOffset(42))}.
        </Text>
      </Page>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  between: { flexDirection: "row", alignItems: "center", gap: space[2] },
  note: {
    flexDirection: "row",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  item: { flexDirection: "row", alignItems: "center", gap: space[2] },
  addRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  field: {
    minHeight: 44,
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
  },
});
