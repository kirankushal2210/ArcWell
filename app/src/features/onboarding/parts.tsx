// Building blocks for the onboarding questions, matching the hi-fi mockups (D53):
// centred glyph header, grouped list with checkmarks, wheel picker, segmented controls,
// tokens, day picker, and a full-width Next button that never moves.
import * as Haptics from "expo-haptics";
import { ArrowLeft, Check, Info, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Logo } from "@/components/brand";
import { IconButton, PressableScale, Text } from "@/components/primitives";
import {
  colors,
  type ColorRole,
  focusRingWidth,
  radius,
  rhythm,
  space,
  tapMin,
} from "@/theme";

import type { Option, WheelValue } from "./questions";

const tick = () => {
  Haptics.selectionAsync().catch(() => {});
};

// ---------- Top bar: back · section progress · Skip ----------

export function ProgressBar({
  segments,
  onBack,
  onSkip,
}: {
  /** Fill of each section segment, 0 to 1. */
  segments: number[];
  onBack: () => void;
  onSkip?: () => void;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.barSide}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Back"
          onPress={onBack}
        />
      </View>
      <View style={styles.segments} accessibilityRole="progressbar">
        {segments.map((fill, k) => (
          <View key={k} style={styles.segment}>
            <View
              style={[
                styles.segmentFill,
                { width: `${Math.round(fill * 100)}%` },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={[styles.barSide, styles.barRight]}>
        {onSkip ? (
          <PressableScale
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip"
            style={styles.skip}
          >
            <Text weight="medium">Skip</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

// ---------- Centred question header ----------

export function QuestionHeader({
  glyph: Glyph,
  logo = false,
  section,
  dot,
  title,
  sub,
}: {
  glyph: LucideIcon;
  logo?: boolean;
  section?: string;
  dot?: ColorRole;
  title: string;
  sub?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.glyph}>
        {logo ? (
          <Logo size={48} />
        ) : (
          <Glyph size={44} strokeWidth={1.6} color={colors.text} />
        )}
      </View>
      {section ? (
        <View style={styles.eyebrowRow}>
          {dot ? (
            <View style={[styles.dot, { backgroundColor: colors[dot] }]} />
          ) : null}
          <Text variant="eyebrow" tone="muted">
            {section}
          </Text>
        </View>
      ) : null}
      <Text
        variant="display"
        accessibilityRole="header"
        textBreakStrategy="balanced"
        lineBreakStrategyIOS="push-out"
        style={[styles.center, styles.title]}
      >
        {title}
      </Text>
      {sub ? (
        <Text
          tone="muted"
          textBreakStrategy="balanced"
          lineBreakStrategyIOS="push-out"
          style={[styles.center, styles.sub]}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// ---------- Grouped list with checkmarks ----------

export function OptionList({
  options,
  isSelected,
  onPress,
  multi = false,
}: {
  options: Option[];
  isSelected: (value: string) => boolean;
  onPress: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <View
      style={styles.list}
      accessibilityRole={multi ? undefined : "radiogroup"}
    >
      {options.map((o, k) => {
        const on = isSelected(o.value);
        const Icon = o.icon;
        return (
          <PressableScale
            key={o.value}
            disabled={o.disabled}
            onPress={() => {
              tick();
              onPress(o.value);
            }}
            accessibilityRole={multi ? "checkbox" : "radio"}
            accessibilityState={
              multi
                ? { checked: on, disabled: o.disabled }
                : { selected: on, disabled: o.disabled }
            }
            accessibilityLabel={o.sub ? `${o.label}, ${o.sub}` : o.label}
            style={[styles.row, o.disabled && styles.rowDisabled]}
          >
            {k > 0 ? (
              <View style={[styles.separator, Icon && styles.separatorIcon]} />
            ) : null}
            {Icon ? (
              <Icon size={22} strokeWidth={1.75} color={colors.text} />
            ) : null}
            <View style={styles.rowText}>
              <Text weight="medium">{o.label}</Text>
              {o.sub ? (
                <Text variant="label" weight="regular" tone="muted">
                  {o.sub}
                </Text>
              ) : null}
            </View>
            <View style={[styles.check, !on && styles.hidden]}>
              <Check size={20} strokeWidth={2.75} color={colors.text} />
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

// ---------- Wheel picker ----------

const ITEM = 44;

function WheelItem({
  index,
  label,
  y,
  item,
  small,
}: {
  index: number;
  label: string;
  y: SharedValue<number>;
  item: number;
  small: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const d = y.get() / item - index;
    const ad = Math.min(Math.abs(d), 3);
    return {
      opacity: interpolate(ad, [0, 1, 2, 3], [1, 0.55, 0.25, 0.12]),
      transform: [
        { perspective: 600 },
        { rotateX: `${-d * 20}deg` },
        { scale: 1 - ad * 0.08 },
      ],
    };
  });
  return (
    <Animated.View style={[{ height: item }, styles.wheelItem, style]}>
      <Text variant={small ? "heading" : "title"} numeric>
        {label}
      </Text>
    </Animated.View>
  );
}

export function Wheel({
  values,
  value,
  onChange,
  unit,
  rows = 5,
  small = false,
}: {
  values: WheelValue[];
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  rows?: number;
  small?: boolean;
}) {
  const item = small ? 36 : ITEM;
  const half = Math.floor(rows / 2);
  const nearest = values.reduce(
    (best, w, k) =>
      Math.abs(w.value - value) < Math.abs(values[best].value - value)
        ? k
        : best,
    0,
  );
  const y = useSharedValue(nearest * item);
  const list = useRef<FlatList<WheelValue>>(null);
  const last = useRef(nearest);

  useEffect(() => {
    // Start on the current value (also when the unit changes the list).
    y.set(nearest * item);
    const id = setTimeout(
      () =>
        list.current?.scrollToOffset({
          offset: nearest * item,
          animated: false,
        }),
      0,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const k = Math.max(
      0,
      Math.min(values.length - 1, Math.round(offset / item)),
    );
    // Native snapping doesn't always fire on a virtualised list, so land on the value ourselves.
    if (Math.abs(offset - k * item) > 0.5)
      list.current?.scrollToOffset({ offset: k * item, animated: true });
    if (k !== last.current) {
      last.current = k;
      tick();
      onChange(values[k].value);
    }
  };
  // A drag released without momentum ends here; with momentum, onMomentumScrollEnd settles instead.
  const settleDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.05) settle(e);
  };

  const spacer = <View style={{ height: item * half }} />;
  return (
    <View
      style={{ height: item * rows }}
      accessibilityRole="adjustable"
      accessibilityValue={{
        text: `${values[nearest]?.label ?? ""} ${unit ?? ""}`,
      }}
    >
      <View style={[styles.band, { top: item * half, height: item }]} />
      <Animated.FlatList
        ref={list}
        data={values}
        keyExtractor={(w) => w.label}
        renderItem={({ item: w, index }) => (
          <WheelItem
            index={index}
            label={w.label}
            y={y}
            item={item}
            small={small}
          />
        )}
        getItemLayout={(_, index) => ({
          length: item,
          offset: item * half + item * index,
          index,
        })}
        ListHeaderComponent={spacer}
        ListFooterComponent={spacer}
        contentOffset={{ x: 0, y: nearest * item }}
        initialNumToRender={Math.min(values.length, nearest + rows + 2)}
        windowSize={7}
        snapToInterval={item}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settleDrag}
      />
      {unit ? (
        <View
          pointerEvents="none"
          style={[styles.unitWrap, { top: item * half, height: item }]}
        >
          <Text weight="medium" tone="muted" style={styles.unit}>
            {unit}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------- Segmented controls ----------

export function Segmented({
  options,
  value,
  onChange,
  disabled = [],
  stretch = false,
  tall = false,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: string[];
  stretch?: boolean;
  tall?: boolean;
}) {
  return (
    <View
      style={[styles.segTrack, stretch ? styles.segStretch : styles.segCompact]}
      accessibilityRole="radiogroup"
    >
      {options.map((o) => {
        const on = o === value;
        const off = disabled.includes(o);
        return (
          <PressableScale
            key={o}
            disabled={off}
            onPress={() => {
              tick();
              onChange(o);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, disabled: off }}
            style={[
              styles.segItem,
              tall && styles.segTall,
              stretch && styles.segItemStretch,
              on && styles.segOn,
            ]}
          >
            <Text
              variant={tall ? "body" : "label"}
              weight={on || tall ? "semibold" : "medium"}
              tone={off ? "disabled" : "default"}
              numeric
              numberOfLines={1}
            >
              {o}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function ScaleEnds({ ends }: { ends: [string, string] }) {
  return (
    <View style={styles.ends}>
      <Text variant="caption" tone="muted">
        {ends[0]}
      </Text>
      <Text variant="caption" tone="muted">
        {ends[1]}
      </Text>
    </View>
  );
}

// ---------- Tokens (multi-select chips) ----------

export function Tokens({
  options,
  isOn,
  onPress,
}: {
  options: string[];
  isOn: (o: string) => boolean;
  onPress: (o: string) => void;
}) {
  return (
    <View style={styles.tokens}>
      {options.map((o) => {
        const on = isOn(o);
        return (
          <PressableScale
            key={o}
            onPress={() => {
              tick();
              onPress(o);
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            style={[styles.token, on && styles.tokenOn]}
          >
            {on ? (
              <Check size={16} strokeWidth={2.5} color={colors.onAccent} />
            ) : null}
            <Text variant="label" tone={on ? "onBrand" : "default"}>
              {o}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

// ---------- Day picker ----------

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function DayPicker({
  selected,
  onToggle,
}: {
  selected: number[];
  onToggle: (day: number) => void;
}) {
  return (
    <View style={styles.days}>
      {DAYS.map((d, k) => {
        const on = selected.includes(k);
        return (
          <PressableScale
            key={k}
            onPress={() => {
              tick();
              onToggle(k);
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ][k]
            }
            style={[styles.day, on && styles.dayOn]}
          >
            <Text variant="label" tone={on ? "onBrand" : "default"}>
              {d}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

// ---------- Small pieces ----------

export function FieldLabel({ children }: { children: string }) {
  return <Text variant="label">{children}</Text>;
}

export function SafetyNote({ text }: { text: string }) {
  return (
    <View style={styles.note}>
      <Info size={16} color={colors.text} />
      <Text variant="caption" tone="muted" style={styles.noteText}>
        {text}
      </Text>
    </View>
  );
}

export function TimeCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.timeCard}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      {children}
    </View>
  );
}

export function NextButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      testID="onboarding-next"
      style={[styles.next, disabled && styles.nextDisabled]}
    >
      <Text weight="semibold" tone="onBrand">
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", minHeight: tapMin },
  barSide: { width: tapMin + space[4], justifyContent: "center" },
  barRight: { alignItems: "flex-end" },
  segments: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: space[1],
  },
  segment: {
    width: 22,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
  },
  segmentFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  skip: {
    minHeight: tapMin,
    justifyContent: "center",
    paddingHorizontal: space[1],
  },

  header: {
    alignItems: "center",
    gap: space[2],
    paddingTop: space[2],
    paddingHorizontal: space[2],
  },
  glyph: { marginBottom: space[1] },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  center: { textAlign: "center" },
  title: { maxWidth: 320 },
  sub: { maxWidth: 300 },

  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 52,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
  },
  separator: {
    position: "absolute",
    top: 0,
    right: 0,
    left: space[4],
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.border,
  },
  separatorIcon: { left: space[4] + 22 + space[3] },
  rowText: { flex: 1, gap: space[1] / 2 },
  check: { width: 22, alignItems: "center" },
  hidden: { opacity: 0 },
  rowDisabled: { opacity: 0.45 },

  band: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  wheelItem: { alignItems: "center", justifyContent: "center" },
  unitWrap: { position: "absolute", left: "50%", justifyContent: "center" },
  unit: { transform: [{ translateX: 48 }] },

  segTrack: {
    flexDirection: "row",
    padding: focusRingWidth,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  segCompact: { alignSelf: "center" },
  segStretch: { alignSelf: "stretch" },
  segItem: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[3],
    borderRadius: radius.sm - focusRingWidth,
    borderWidth: 1,
    borderColor: "transparent",
  },
  segTall: { minHeight: tapMin - space[1] },
  segItemStretch: { flex: 1, paddingHorizontal: 0 },
  segOn: { backgroundColor: colors.surface, borderColor: colors.border },
  ends: { flexDirection: "row", justifyContent: "space-between" },

  tokens: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  token: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    height: 36,
    paddingHorizontal: space[4],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  tokenOn: { backgroundColor: colors.accent },

  days: { flexDirection: "row", justifyContent: "space-between" },
  day: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },

  note: {
    flexDirection: "row",
    gap: space[2],
    padding: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  noteText: { flex: 1 },
  timeCard: {
    flex: 1,
    gap: space[1],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  next: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: rhythm.gutter,
  },
  nextDisabled: { opacity: 0.35 },
});
