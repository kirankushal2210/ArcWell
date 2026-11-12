// Building blocks for the coach app in Liquid Glass with the Stone palette (D67): large titles with
// round glass toolbar buttons, dense charcoal grouped lists, slim pills, and one action dock per
// screen just above the floating glass tab bar.
import type { BottomTabBarProps } from "expo-router/tabs";
import { ArrowLeft, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Polyline, Rect } from "react-native-svg";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { GlassSurface } from "@/components/GlassSurface";
import { colors, controlHeightSm, radius, rhythm, space } from "@/theme";

// ---------- Page header: large title with up to two icon actions ----------

export function PageHeader({
  title,
  sub,
  actions = [],
  onBack,
}: {
  title: string;
  sub?: string;
  actions?: { icon: LucideIcon; label: string; onPress: () => void }[];
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + space[2] }]}>
      <View style={styles.headerRow}>
        {onBack ? (
          <IconButton
            icon={ArrowLeft}
            variant="glass"
            accessibilityLabel="Back"
            onPress={onBack}
          />
        ) : null}
        <Text
          variant={onBack ? "heading" : "display"}
          accessibilityRole="header"
          numberOfLines={1}
          style={[styles.flex, !onBack && styles.titlePad]}
        >
          {title}
        </Text>
        {actions.map((a) => (
          <IconButton
            key={a.label}
            icon={a.icon}
            variant="glass"
            accessibilityLabel={a.label}
            onPress={a.onPress}
          />
        ))}
      </View>
      {sub ? (
        <Text tone="muted" style={styles.titlePad}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// ---------- Scrolling page body ----------

export function Page({
  children,
  clearDock = false,
}: {
  children: ReactNode;
  /** Extra room at the end for an ActionDock above the tab bar. */
  clearDock?: boolean;
}) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.page,
        clearDock && styles.pageDock,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

// ---------- White grouped list ----------

export function Group({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export function GroupRow({
  children,
  onPress,
  first,
  label,
}: {
  children: ReactNode;
  onPress?: () => void;
  first?: boolean;
  label?: string;
}) {
  const style = [styles.groupRow, !first && styles.groupLine];
  return onPress ? (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
    >
      {children}
    </PressableScale>
  ) : (
    <View style={style}>{children}</View>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return (
    <Text variant="eyebrow" tone="muted" style={styles.eyebrow}>
      {children}
    </Text>
  );
}

/** Label on the left, value on the right (CO-15 answers, check-in rows). */
export function KeyValues({ rows }: { rows: [string, string][] }) {
  return (
    <Group>
      {rows.map(([k, v], i) => (
        <GroupRow key={k} first={i === 0}>
          <Text tone="muted">{k}</Text>
          <Text weight="medium" numeric style={styles.kvValue}>
            {v}
          </Text>
        </GroupRow>
      ))}
    </Group>
  );
}

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={styles.tile}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="title" numeric>
        {value}
      </Text>
      {sub ? (
        <Text variant="caption" tone="muted" numeric>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** Horizontally scrolling segment pills (client profile sections, filters). */
export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pills}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            hitSlop={{ top: space[2], bottom: space[2] }}
            style={[styles.pill, on && styles.pillOn]}
          >
            <Text
              variant="label"
              weight="semibold"
              tone={on ? "onBrand" : "default"}
              style={on ? { color: colors.onAccent } : undefined}
              numeric
            >
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

// ---------- Charts (react-native-svg ignores pointerEvents, so each sits in a non-touch View) ----------

export function WeightChart({
  values,
  target,
  height = 120,
}: {
  values: number[];
  target?: number;
  height?: number;
}) {
  const W = 320;
  const all = target === undefined ? values : [...values, target];
  const min = Math.min(...all) - 0.5;
  const max = Math.max(...all) + 0.5;
  const x = (i: number) =>
    values.length < 2 ? W / 2 : (i / (values.length - 1)) * (W - 16) + 8;
  const y = (v: number) =>
    height - 8 - ((v - min) / (max - min)) * (height - 16);
  const last = values.length - 1;
  return (
    <View pointerEvents="none">
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}>
        {target !== undefined ? (
          <Line
            x1={0}
            x2={W}
            y1={y(target)}
            y2={y(target)}
            stroke={colors.borderStrong}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ) : null}
        <Polyline
          points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          fill="none"
          stroke={colors.brand}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={x(last)} cy={y(values[last])} r={4.5} fill={colors.brand} />
      </Svg>
    </View>
  );
}

export function Bars({
  values,
  target,
  labels,
  height = 96,
}: {
  values: number[];
  target?: number;
  labels: string[];
  height?: number;
}) {
  const W = 320;
  const max = Math.max(...values, target ?? 0) * 1.1 || 1;
  const slot = W / values.length;
  const bw = slot * 0.5;
  const y = (v: number) => height - (v / max) * height;
  return (
    <View style={styles.bars}>
      <View pointerEvents="none">
        <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}>
          {values.map((v, i) => (
            <Rect
              key={i}
              x={i * slot + (slot - bw) / 2}
              y={y(v)}
              width={bw}
              height={height - y(v)}
              rx={4}
              fill={
                target !== undefined && v < target * 0.9
                  ? colors.borderStrong
                  : colors.brand
              }
            />
          ))}
          {target !== undefined ? (
            <Line
              x1={0}
              x2={W}
              y1={y(target)}
              y2={y(target)}
              stroke={colors.textMuted}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ) : null}
        </Svg>
      </View>
      <View style={styles.barLabels}>
        {labels.map((l, i) => (
          // Day initials repeat (T, S), so the position is the key.
          <Text key={i} variant="caption" tone="muted" style={styles.barLabel}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function PillarDot({
  pillar,
}: {
  pillar: "training" | "nutrition" | "recovery";
}) {
  return <View style={[styles.dot, { backgroundColor: colors[pillar] }]} />;
}

// ---------- Bottom tab bar (mockups: icon in a pill when active, label below) ----------

export function CoachTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  reserveRight = 0,
}: BottomTabBarProps & {
  /** Room kept free at the right end for the athlete + button (D67). */
  reserveRight?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <GlassSurface
      style={[
        styles.tabBar,
        {
          bottom: tabBarBottom(insets.bottom),
          right: rhythm.gutter + reserveRight,
        },
      ]}
    >
      <View style={styles.tabRow} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          // Tabs hidden with href: null (e.g. Progress for self-guided athletes, D57) aren't drawn.
          if ((options as { href?: unknown }).href === null) return null;
          const on = state.index === index;
          const label =
            typeof options.title === "string" ? options.title : route.name;
          const badge = options.tabBarBadge;
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={badge ? `${label}, ${badge} new` : label}
              onPress={() => {
                const e = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!on && !e.defaultPrevented) navigateToTab(route.key);
              }}
              style={styles.tab}
            >
              <View style={[styles.tabIcon, on && styles.tabIconOn]}>
                {options.tabBarIcon?.({
                  focused: on,
                  color: on ? colors.text : colors.textMuted,
                  size: 22,
                })}
                {badge ? <View style={styles.badge} /> : null}
              </View>
              <Text
                variant="caption"
                weight={on ? "semibold" : "medium"}
                tone={on ? "default" : "muted"}
                numberOfLines={1}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </GlassSurface>
  );
}

/** Floating glass tab bar (D67): its height, and where it sits above the bottom inset. */
export const TAB_BAR_HEIGHT = 60;
export const tabBarBottom = (insetBottom: number) =>
  Math.max(insetBottom, space[3]);
/** Distance from the screen bottom to the tab bar's top edge: anything fixed sits above this. */
export const tabBarTop = (insetBottom: number) =>
  tabBarBottom(insetBottom) + TAB_BAR_HEIGHT;

// ---------- Action dock: the screen's one main action, above the tab bar (D67) ----------

/**
 * The single main action of a tab screen, always in the same spot just above the floating
 * tab bar, so the thumb finds it without looking. Pair with `<Page clearDock>`.
 */
export function ActionDock(props: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  pillar?: "training" | "nutrition" | "recovery";
  disabled?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.dock, { bottom: tabBarTop(insets.bottom) + space[2] }]}
    >
      <Button
        label={props.label}
        onPress={props.onPress}
        icon={props.icon}
        pillar={props.pillar}
        disabled={props.disabled}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.bg,
    paddingHorizontal: space[1],
    paddingBottom: space[1],
    gap: space[1] / 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: space[1] },
  titlePad: { paddingHorizontal: space[3] },
  page: {
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    // Room for the floating glass tab bar (D67).
    paddingBottom: space[12] * 2 + space[4],
    gap: space[3],
  },
  pageDock: { paddingBottom: space[12] * 3 + space[6] },
  dock: { position: "absolute", left: rhythm.gutter, right: rhythm.gutter },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 44,
    paddingVertical: space[2],
  },
  groupLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  eyebrow: { paddingTop: space[1] },
  kvValue: { flex: 1, textAlign: "right" },
  tile: {
    flex: 1,
    gap: space[1] / 2,
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  pills: { gap: space[2], paddingRight: space[4] },
  pill: {
    minHeight: controlHeightSm,
    justifyContent: "center",
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  pillOn: { backgroundColor: colors.accent },
  bars: { gap: space[1] },
  barLabels: { flexDirection: "row" },
  barLabel: { flex: 1, textAlign: "center" },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  tabBar: {
    position: "absolute",
    left: rhythm.gutter,
    right: rhythm.gutter,
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.xl,
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space[1],
  },
  // Tabs share the spare width on top of their own label width, so long labels never truncate.
  tab: {
    flexGrow: 1,
    flexBasis: "auto",
    alignItems: "center",
    gap: space[1] / 2,
  },
  tabIcon: {
    width: 44,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconOn: { backgroundColor: colors.surfaceRaised },
  badge: {
    position: "absolute",
    top: 2,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
  },
});
