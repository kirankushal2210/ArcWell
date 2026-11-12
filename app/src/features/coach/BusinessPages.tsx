// Business section pages (D63): Overview (funnel, sources, why people didn't join, clients and
// retention, money recorded by hand, what's due), Leads (the pipeline), Clients (accounts:
// package, fee, renewal, payment) and Invite (link, QR, spots).
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { ChevronRight, Copy, Phone, Plus, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { Avatar, Button, StatusChip, Text } from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  accountOf,
  BILLING_LABEL,
  crmStats,
  dayInline,
  dayText,
  inr,
  isOpen,
  type LeadStage,
  type Period,
  renewsOn,
  SOURCE_LABEL,
  STAGES,
  tenureText,
  timeText,
  ymd,
} from "@/features/coach/crm";
import {
  FunnelRow,
  PaidTag,
  StageTag,
  StatGrid,
} from "@/features/coach/CrmParts";
import { Eyebrow, Group, GroupRow, Page, Pills } from "@/features/coach/parts";
import { sampleCoach } from "@/features/coach/sampleData";
import { colors, radius, space } from "@/theme";

const openLead = (id: string) =>
  router.push({ pathname: "/coach/lead/[id]", params: { id } });
const openAccount = (id: string) =>
  router.push({ pathname: "/coach/account/[id]", params: { id } });

// ---------- Overview ----------

export function OverviewPage() {
  const { leads, clients } = useCoachData();
  const [period, setPeriod] = useState<Period>("30");
  const s = crmStats(leads, clients, period);
  const max = Math.max(s.leads, 1);
  return (
    <Page>
      <Pills
        value={period}
        onChange={setPeriod}
        options={[
          { value: "30", label: "30 days" },
          { value: "90", label: "90 days" },
          { value: "all", label: "All time" },
        ]}
      />

      <View style={styles.card}>
        <View style={styles.between}>
          <Text weight="semibold">From enquiry to client</Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {s.conversion === null ? "—" : `${s.conversion}% joined`}
          </Text>
        </View>
        <FunnelRow label="Leads" value={s.leads} max={max} />
        <FunnelRow label="Calls" value={s.calls} max={max} />
        <FunnelRow label="Joined" value={s.joined} max={max} />
        <FunnelRow label="Not joined" value={s.lost} max={max} />
        <Text variant="caption" tone="muted">
          {s.open} still open. Joined out of everyone who decided.
        </Text>
      </View>

      {s.followUps.length || s.calls_booked.length || s.renewals.length ? (
        <>
          <Eyebrow>Coming up</Eyebrow>
          <Group>
            {s.calls_booked.map((l, i) => (
              <GroupRow
                key={`c${l.id}`}
                first={i === 0}
                onPress={() => openLead(l.id)}
                label={`Call with ${l.name}`}
              >
                <Phone size={18} color={colors.text} />
                <Text style={styles.flex}>Call with {l.name}</Text>
                <Text variant="label" weight="regular" tone="muted" numeric>
                  {l.callAt
                    ? `${dayText(l.callAt.slice(0, 10))}, ${timeText(l.callAt)}`
                    : ""}
                </Text>
              </GroupRow>
            ))}
            {s.followUps.map((l, i) => (
              <GroupRow
                key={`f${l.id}`}
                first={!s.calls_booked.length && i === 0}
                onPress={() => openLead(l.id)}
                label={`Follow up with ${l.name}`}
              >
                <Avatar name={l.name} />
                <Text style={styles.flex}>Follow up with {l.name}</Text>
                <Text
                  variant="label"
                  weight="regular"
                  tone={
                    l.followUp && l.followUp < todayKey() ? "danger" : "muted"
                  }
                >
                  {l.followUp ? dayText(l.followUp) : ""}
                </Text>
              </GroupRow>
            ))}
            {s.renewals.map(({ c, on }, i) => (
              <GroupRow
                key={`r${c.id}`}
                first={!s.calls_booked.length && !s.followUps.length && i === 0}
                onPress={() => openAccount(c.id)}
                label={`${c.name} renews`}
              >
                <Avatar name={c.name} />
                <Text style={styles.flex}>{c.name} renews</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {on ? dayText(on) : ""}
                </Text>
              </GroupRow>
            ))}
          </Group>
        </>
      ) : null}

      <Eyebrow>Clients</Eyebrow>
      <StatGrid
        items={[
          {
            label: "Coaching now",
            value: String(s.clients.active + s.clients.leaving),
            sub: `${s.clients.paused} paused · ${s.clients.leaving} leaving`,
          },
          {
            label: "Still with you",
            value:
              s.clients.retention === null ? "—" : `${s.clients.retention}%`,
            sub: `${s.clients.completed} finished of ${s.clients.total}`,
          },
          {
            label: "Average time with you",
            value: `${s.clients.avgWeeks} wk`,
          },
          {
            label: "Monthly income",
            value: inr(s.money.monthly),
            sub: `${s.money.due} due · ${s.money.overdue} overdue`,
          },
        ]}
      />
      <Text variant="caption" tone="muted">
        Income is what you&apos;ve recorded for each client; payments happen
        outside Arcwell.
      </Text>

      {s.bySource.length ? (
        <>
          <Eyebrow>Where leads come from</Eyebrow>
          <View style={styles.card}>
            {s.bySource.map((x) => (
              <FunnelRow
                key={x.source}
                label={SOURCE_LABEL[x.source]}
                value={x.leads}
                max={s.bySource[0]?.leads ?? 1}
              />
            ))}
            <Text variant="caption" tone="muted">
              {s.bySource
                .filter((x) => x.joined)
                .map((x) => `${SOURCE_LABEL[x.source]}: ${x.joined} joined`)
                .join(" · ") || "No one has joined from these yet."}
            </Text>
          </View>
        </>
      ) : null}

      {s.reasons.length ? (
        <>
          <Eyebrow>Why people didn&apos;t join</Eyebrow>
          <View style={styles.card}>
            {s.reasons.map((r) => (
              <FunnelRow
                key={r.reason}
                label={r.reason}
                value={r.count}
                max={Math.max(...s.reasons.map((x) => x.count))}
              />
            ))}
          </View>
        </>
      ) : null}
    </Page>
  );
}

const todayKey = () => ymd(new Date());

// ---------- Leads ----------

type LeadFilter = "open" | LeadStage;

export function LeadsPage() {
  const { leads } = useCoachData();
  const [filter, setFilter] = useState<LeadFilter>("open");
  const list = leads
    .filter((l) => (filter === "open" ? isOpen(l.stage) : l.stage === filter))
    .sort((a, b) => {
      // Overdue follow-ups first, then newest.
      const fa = a.followUp ?? "9999";
      const fb = b.followUp ?? "9999";
      return fa === fb
        ? b.createdAt.localeCompare(a.createdAt)
        : fa.localeCompare(fb);
    });
  const count = (f: LeadFilter) =>
    leads.filter((l) => (f === "open" ? isOpen(l.stage) : l.stage === f))
      .length;
  return (
    <Page>
      <Pills<LeadFilter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: "open", label: `Open · ${count("open")}` },
          ...STAGES.map((s) => ({
            value: s.key,
            label: `${s.label} · ${count(s.key)}`,
          })),
        ]}
      />
      {list.length ? (
        <Group>
          {list.map((l, i) => (
            <GroupRow
              key={l.id}
              first={i === 0}
              onPress={() => openLead(l.id)}
              label={`${l.name}, ${l.stage}`}
            >
              <Avatar name={l.name} />
              <View style={styles.flex}>
                <Text weight="semibold">{l.name}</Text>
                <Text
                  variant="label"
                  weight="regular"
                  tone="muted"
                  numberOfLines={1}
                >
                  {SOURCE_LABEL[l.source]}
                  {l.goal ? ` · ${l.goal}` : ""}
                </Text>
                {isOpen(l.stage) && l.followUp ? (
                  <Text
                    variant="caption"
                    tone={l.followUp < todayKey() ? "danger" : "muted"}
                  >
                    Follow up {dayInline(l.followUp)}
                  </Text>
                ) : l.stage === "lost" && l.lostReason ? (
                  <Text variant="caption" tone="muted">
                    {l.lostReason}
                  </Text>
                ) : null}
              </View>
              <StageTag stage={l.stage} />
            </GroupRow>
          ))}
        </Group>
      ) : (
        <Text tone="muted" style={styles.center}>
          No leads here.
        </Text>
      )}
      <Button
        label="Add a lead"
        icon={Plus}
        variant="secondary"
        fullWidth
        onPress={() => openLead("new")}
      />
    </Page>
  );
}

// ---------- Clients (accounts) ----------

type ClientFilter = "coaching" | "due" | "paused" | "completed";

export function ClientsPage() {
  const { clients } = useCoachData();
  const [filter, setFilter] = useState<ClientFilter>("coaching");
  const linked = clients.filter((c) => c.id !== "me");
  const rows = linked
    .map((c) => ({ c, a: accountOf(c) }))
    .filter(({ c, a }) =>
      filter === "coaching"
        ? c.status === "active" || c.status === "leaving"
        : filter === "due"
          ? a.paid !== "paid" && c.status !== "completed"
          : c.status === filter,
    );
  const n = (f: ClientFilter) =>
    linked.filter((c) => {
      const a = accountOf(c);
      return f === "coaching"
        ? c.status === "active" || c.status === "leaving"
        : f === "due"
          ? a.paid !== "paid" && c.status !== "completed"
          : c.status === f;
    }).length;
  return (
    <Page>
      <Pills<ClientFilter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: "coaching", label: `Coaching · ${n("coaching")}` },
          { value: "due", label: `Payment due · ${n("due")}` },
          { value: "paused", label: `Paused · ${n("paused")}` },
          { value: "completed", label: `Finished · ${n("completed")}` },
        ]}
      />
      {rows.length ? (
        <Group>
          {rows.map(({ c, a }, i) => {
            const on = renewsOn(a);
            return (
              <GroupRow
                key={c.id}
                first={i === 0}
                onPress={() => openAccount(c.id)}
                label={`${c.name} account`}
              >
                <Avatar name={c.name} />
                <View style={styles.flex}>
                  <Text weight="semibold">{c.name}</Text>
                  <Text
                    variant="label"
                    weight="regular"
                    tone="muted"
                    numberOfLines={1}
                    numeric
                  >
                    {a.package} · {inr(a.feeInr)}{" "}
                    {BILLING_LABEL[a.billing].toLowerCase()}
                  </Text>
                  <Text variant="caption" tone="muted" numeric>
                    {c.pending ? "Not joined yet" : tenureText(c.weeksWithYou)}
                    {on ? ` · renews ${dayInline(on)}` : ""}
                  </Text>
                </View>
                <View style={styles.tags}>
                  <StatusChip status={c.status} />
                  <PaidTag paid={a.paid} />
                </View>
              </GroupRow>
            );
          })}
        </Group>
      ) : (
        <Text tone="muted" style={styles.center}>
          No clients here.
        </Text>
      )}
    </Page>
  );
}

// ---------- Invite ----------

export function InvitePage() {
  const { clients } = useCoachData();
  const [copied, setCopied] = useState(false);
  const used = clients.filter(
    (c) => c.id !== "me" && c.status !== "completed",
  ).length;
  const { link, clientLimit } = sampleCoach;
  const url = `https://${link}`;
  const message = `Join my coaching on Arcwell: your plans, check-ins and chat in one app. ${url}`;
  return (
    <Page>
      <View style={[styles.card, styles.centerCard]}>
        <View
          style={styles.qr}
          accessibilityLabel="QR code for your invite link"
        >
          <QRCode
            value={url}
            size={168}
            color={colors.text}
            backgroundColor={colors.surface}
          />
        </View>
        <Text weight="medium" numberOfLines={1}>
          {link}
        </Text>
        <Text variant="caption" tone="muted" style={styles.center}>
          People who scan this or open the link answer the onboarding and land
          in your Clients as “Needs a plan”.
        </Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button
              label={copied ? "Copied" : "Copy"}
              icon={Copy}
              variant="secondary"
              fullWidth
              onPress={async () => {
                await Clipboard.setStringAsync(url);
                setCopied(true);
              }}
            />
          </View>
          <View style={styles.flex}>
            <Button
              label="Share"
              icon={Share2}
              fullWidth
              onPress={() => Share.share({ message })}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.between}>
          <Text weight="semibold">Client spots</Text>
          <Text variant="label" weight="regular" tone="muted" numeric>
            {used} of {clientLimit}
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.min(100, Math.round((used / clientLimit) * 100))}%`,
              },
            ]}
          />
        </View>
      </View>

      <Group>
        <GroupRow
          first
          onPress={() => router.push("/coach/add-client")}
          label="Add a client after a call"
        >
          <View style={styles.flex}>
            <Text weight="medium">Personal invite for one client</Text>
            <Text variant="label" weight="regular" tone="muted">
              Build their plans first, then send a link and code
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
        <GroupRow
          onPress={() => router.push("/join/coach")}
          label="Preview your link as a new client"
        >
          <View style={styles.flex}>
            <Text weight="medium">Preview your link</Text>
            <Text variant="label" weight="regular" tone="muted">
              See what a new client sees
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </GroupRow>
      </Group>
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  row: { flexDirection: "row", gap: space[2], alignSelf: "stretch" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tags: { alignItems: "flex-end", gap: space[1] },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  centerCard: { alignItems: "center" },
  qr: {
    padding: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: radius.full, backgroundColor: colors.brand },
});
