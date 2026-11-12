// Section tabs (D61): the second navigation level, under a main tab's title. At most four, swipeable
// left and right, with an underline on the active one. One component for the whole app; anything
// deeper opens a detail page with Back, never a third tab bar.
import { type ReactNode, useEffect, useRef } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { colors, rhythm, space } from "@/theme";

import { PressableScale } from "./primitives/PressableScale";
import { Text } from "./primitives/Text";

export type SectionTab<T extends string> = { key: T; label: string };

export function SectionTabs<T extends string>({
  tabs,
  value,
  onChange,
  pages,
}: {
  tabs: SectionTab<T>[];
  value: T;
  onChange: (key: T) => void;
  /** One page per tab, in the same order. Each page scrolls on its own. */
  pages: ReactNode[];
}) {
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollViewInstance>(null);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.key === value),
  );

  // Keep the pager on the selected tab when it changes from outside (a tapped ring, a tab).
  useEffect(() => {
    pager.current?.scrollTo({ x: index * width, animated: true });
  }, [index, width]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    const t = tabs[i];
    if (t && t.key !== value) onChange(t.key);
  };

  return (
    <View style={styles.root}>
      <View style={styles.bar} accessibilityRole="tablist">
        {tabs.map((t) => {
          const on = t.key === value;
          return (
            <PressableScale
              key={t.key}
              onPress={() => onChange(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={styles.tab}
            >
              <Text
                variant="label"
                weight={on ? "semibold" : "medium"}
                tone={on ? "default" : "muted"}
                numberOfLines={1}
              >
                {t.label}
              </Text>
              <View style={[styles.line, on && styles.lineOn]} />
            </PressableScale>
          );
        })}
      </View>
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={settle}
        contentOffset={{ x: index * width, y: 0 }}
        style={styles.flex}
      >
        {pages.map((p, i) => (
          <View key={tabs[i]?.key ?? i} style={{ width }}>
            {p}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  bar: {
    flexDirection: "row",
    paddingHorizontal: rhythm.gutter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: space[2],
    paddingTop: space[2],
    minHeight: 44,
  },
  line: { alignSelf: "stretch", height: 2, backgroundColor: "transparent" },
  lineOn: { backgroundColor: colors.text },
});
