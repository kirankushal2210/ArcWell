// System states (S-01 loading, S-02 error, F4-09 and F7-03 offline): the shared pieces.
import { CloudOff } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState, Skeleton } from "@/components/feedback";
import { Text } from "@/components/primitives";
import { colors, radius, rhythm, space } from "@/theme";

import { useOnline } from "./useOnline";

/** S-01: the page's shape while saved data loads, never a spinner. */
export function LoadingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.root, { paddingTop: insets.top + space[4] }]}
      accessibilityLabel="Loading"
    >
      <Skeleton width="45%" height={34} />
      <Skeleton height={120} shape="card" />
      <Skeleton height={88} shape="card" />
      <Skeleton height={88} shape="card" />
    </View>
  );
}

/** S-02: a screen failed. Plain words, nothing lost, and Try again. */
export function ScreenError({ onRetry }: { onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + space[6] }]}>
      <Text variant="title">Something went wrong</Text>
      <ErrorState
        message="This screen couldn't load. Nothing you logged was lost. Try again, and if it keeps happening, contact support from Help."
        onRetry={onRetry}
      />
    </View>
  );
}

/** F4-09, F7-03: offline banner. What you do is saved on the phone and sent when you're back. */
export function OfflineBanner({ what }: { what: string }) {
  const online = useOnline();
  if (online) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <CloudOff size={18} color={colors.warning} />
      <Text variant="label" weight="regular" style={styles.flex}>
        {`You're offline. ${what}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: space[3],
    paddingHorizontal: rhythm.gutter,
    backgroundColor: colors.bg,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    padding: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
  },
  flex: { flex: 1 },
});
