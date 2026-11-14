// System states (S-01 loading, S-02 error, F4-09 and F7-03 offline): the shared pieces.
import { router } from "expo-router";
import { CloudOff } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState, Skeleton } from "@/components/feedback";
import { Text } from "@/components/primitives";
import { PageHeader } from "@/features/coach/parts";
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

/**
 * A page opened for something that isn't there (deleted, or an old link): say so plainly, with
 * Back, instead of a blank page or the wrong message.
 */
export function NotFound({
  title,
  what,
  onBack,
}: {
  title: string;
  /** "workout", "habit"… */
  what: string;
  onBack?: () => void;
}) {
  const back =
    onBack ??
    (() => (router.canGoBack() ? router.back() : router.replace("/")));
  return (
    <View style={styles.page}>
      <PageHeader title={title} onBack={back} />
      <View style={styles.notFound}>
        <Text tone="muted">
          {`This ${what} isn't here any more. It may have been deleted, or the link is old.`}
        </Text>
      </View>
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
  page: { flex: 1, backgroundColor: colors.bg },
  notFound: { paddingHorizontal: rhythm.gutter, paddingTop: space[4] },
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
