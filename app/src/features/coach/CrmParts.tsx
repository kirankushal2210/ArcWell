// Small CRM pieces (D63): a dot-and-word tag (colour is never the only signal, C11), funnel bars
// and a two-column stat grid.
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

import type { LeadStage, PaymentStatus } from "./crm";
import { type Level, LEVEL_LABEL } from "./enhanced";
import { PAID_LABEL, STAGE_LABEL } from "./crm";

type Tone = "muted" | "success" | "warning" | "danger" | "default";
const DOT: Record<Tone, string> = {
  muted: colors.textMuted,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  default: colors.text,
};

export function Tag({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  return (
    <View style={styles.tag} accessibilityLabel={label}>
      <View style={[styles.dot, { backgroundColor: DOT[tone] }]} />
      <Text
        variant="caption"
        weight="semibold"
        tone={tone === "default" ? "default" : tone}
      >
        {label}
      </Text>
    </View>
  );
}

const STAGE_TONE: Record<LeadStage, Tone> = {
  new: "default",
  contacted: "muted",
  call_booked: "warning",
  call_done: "warning",
  joined: "success",
  lost: "danger",
};
export const StageTag = ({ stage }: { stage: LeadStage }) => (
  <Tag label={STAGE_LABEL[stage]} tone={STAGE_TONE[stage]} />
);

const PAID_TONE: Record<PaymentStatus, Tone> = {
  paid: "success",
  due: "warning",
  overdue: "danger",
};
export const PaidTag = ({ paid }: { paid: PaymentStatus }) => (
  <Tag label={PAID_LABEL[paid]} tone={PAID_TONE[paid]} />
);

/** One funnel step: label, a bar sized against the first step, and the count. */
export function FunnelRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const share = max > 0 ? Math.max(0.04, value / max) : 0;
  return (
    <View style={styles.funnel}>
      <Text variant="label" weight="regular" style={styles.funnelLabel}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${share * 100}%` }]} />
      </View>
      <Text weight="semibold" numeric style={styles.funnelValue}>
        {value}
      </Text>
    </View>
  );
}

/** Two-up grid of numbers with a caption under each. */
export function StatGrid({
  items,
}: {
  items: { label: string; value: string; sub?: string }[];
}) {
  return (
    <View style={styles.grid}>
      {items.map((it) => (
        <View key={it.label} style={styles.cell}>
          <Text variant="caption" tone="muted">
            {it.label}
          </Text>
          <Text variant="title" numeric>
            {it.value}
          </Text>
          {it.sub ? (
            <Text variant="caption" tone="muted" numeric>
              {it.sub}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    minHeight: 24,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  funnel: { flexDirection: "row", alignItems: "center", gap: space[3] },
  funnelLabel: { width: 96 },
  funnelValue: { width: 32, textAlign: "right" },
  track: {
    flex: 1,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  fill: {
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  cell: {
    flexGrow: 1,
    flexBasis: "45%",
    gap: space[1] / 2,
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});

const LEVEL_TONE: Record<Level, Tone> = {
  ok: "success",
  watch: "warning",
  alert: "danger",
};
/** Enhanced marker level (D64): in range, keep an eye on, talk to a doctor. */
export const LevelTag = ({ level }: { level: Level }) => (
  <Tag label={LEVEL_LABEL[level]} tone={LEVEL_TONE[level]} />
);
