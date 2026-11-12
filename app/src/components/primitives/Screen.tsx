import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, rhythm } from "@/theme";

export type ScreenProps = {
  children: ReactNode;
  /** Scrolls by default; set false for fixed layouts (e.g. a pinned bottom action). */
  scroll?: boolean;
  /** Gap between the screen's top-level groups. Defaults to the between-groups step (24). */
  gap?: number;
  /** Content pinned below the scroll area (primary action in the bottom half). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Screen container: charcoal background, 16 dp gutters, safe areas for
 * edge-to-edge Android, content starting at the left edge (C3, C4, C6).
 */
export function Screen({
  children,
  scroll = true,
  gap = rhythm.betweenGroups,
  footer,
  contentStyle,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + rhythm.betweenGroups,
    paddingBottom: footer
      ? rhythm.betweenGroups
      : insets.bottom + rhythm.sectionBreak,
  };

  return (
    <View style={styles.root} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[
            styles.content,
            padding,
            { gap },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[styles.root, styles.content, padding, { gap }, contentStyle]}
        >
          {children}
        </View>
      )}
      {footer && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + rhythm.cardPad },
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: rhythm.gutter },
  footer: {
    paddingHorizontal: rhythm.gutter,
    paddingTop: rhythm.cardPad,
    backgroundColor: colors.bg,
  },
});
