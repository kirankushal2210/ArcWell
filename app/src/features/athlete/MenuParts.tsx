// Shared pieces for the athlete side menu (D9) and its pages: the ☰ toolbar action, a page frame
// with a back button and an optional docked action, navigation and switch rows, and info cards.
import { router, type Href } from "expo-router";
import {
  ChevronRight,
  Menu,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { GroupRow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, rhythm, space } from "@/theme";

/** ☰ on every athlete tab (D9). */
/** Progress, top right beside the menu on every athlete tab (D101). */
export const progressAction = {
  icon: TrendingUp,
  label: "Progress",
  onPress: () => router.push("/athlete/progress"),
};

export const athleteMenuAction = {
  icon: Menu,
  label: "Menu",
  onPress: () => router.push("/athlete/menu"),
};

/** Back to `fallback` when there's no history (a deep link or a reload on web). */
export const backTo = (fallback: Href) => () =>
  router.canGoBack() ? router.back() : router.replace(fallback);

/**
 * A menu page: title with Back, scrolling content and an optional action pinned at the bottom
 * (screens without a tab bar keep their main action at the bottom edge, D67).
 */
export function MenuPage({
  title,
  sub,
  back,
  actions,
  children,
  footer,
}: {
  title: string;
  sub?: string;
  back: () => void;
  actions?: Parameters<typeof PageHeader>[0]["actions"];
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <PageHeader title={title} sub={sub} onBack={back} actions={actions} />
      <Page>{children}</Page>
      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[3]) },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/** A row that opens another page: optional icon, label, sub-line and value. */
export function NavRow({
  icon: Icon,
  label,
  sub,
  value,
  first,
  onPress,
  tone,
}: {
  icon?: LucideIcon;
  label: string;
  sub?: string;
  value?: string;
  first?: boolean;
  onPress: () => void;
  tone?: "danger";
}) {
  return (
    <GroupRow first={first} onPress={onPress} label={label}>
      {Icon ? (
        <Icon size={20} color={tone ? colors.danger : colors.text} />
      ) : null}
      <View style={styles.flex}>
        <Text weight="medium" tone={tone}>
          {label}
        </Text>
        {sub ? (
          <Text variant="label" weight="regular" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="label" weight="regular" tone="muted" numeric>
          {value}
        </Text>
      ) : null}
      <ChevronRight size={18} color={colors.textMuted} />
    </GroupRow>
  );
}

/** A labelled on/off switch row. */
export function ToggleRow({
  label,
  sub,
  value,
  onChange,
  first,
  disabled,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  first?: boolean;
  disabled?: boolean;
}) {
  return (
    <GroupRow first={first}>
      <View style={styles.flex}>
        <Text weight="medium">{label}</Text>
        {sub ? (
          <Text variant="label" weight="regular" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: colors.success, false: colors.surfaceRaised }}
        thumbColor={colors.text}
        // Web only: keeps the thumb in the palette instead of the browser default.
        {...{ activeThumbColor: colors.text }}
        accessibilityLabel={label}
      />
    </GroupRow>
  );
}

/** A quiet card of explanation. */
export function InfoCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title ? <Text weight="semibold">{title}</Text> : null}
      {typeof children === "string" ? (
        <Text tone="muted">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

/** A short list of plain statements, one per line (what changes, what's included). */
export function Bullets({ items }: { items: string[] }) {
  return (
    <View style={styles.bullets}>
      {items.map((t) => (
        <View key={t} style={styles.bullet}>
          <View style={styles.dot} />
          <Text style={styles.flex}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

/** Primary plus a quiet second choice, for confirm screens. */
export function ConfirmButtons({
  label,
  onConfirm,
  cancel,
  onCancel,
  destructive,
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  cancel: string;
  onCancel: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={styles.buttons}>
      <Button
        label={label}
        variant={destructive ? "destructive" : "primary"}
        fullWidth
        disabled={disabled}
        onPress={onConfirm}
      />
      <Button label={cancel} variant="ghost" fullWidth onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
  card: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  bullets: { gap: space[2] },
  bullet: { flexDirection: "row", gap: space[3], alignItems: "flex-start" },
  dot: {
    width: 6,
    height: 6,
    marginTop: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.textMuted,
  },
  buttons: { gap: space[1] },
});
