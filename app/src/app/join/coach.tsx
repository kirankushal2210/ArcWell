// The coach's general link (arcwell.app/c/<coach>): for leads and walk-ins (D56). Unlike a personal
// invite there's no plan yet, so the athlete answers the standard onboarding and the coach builds
// their plan afterwards (CO-14, AO-21b). The page is the coach's profile (F3-02, D43): photo, city,
// specialisations, bio, services, certifications and approved transformations.
import { Redirect, router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/primitives";
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { useCoachData } from "@/features/coach/CoachData";
import {
  CoachPhoto,
  CoachProfileView,
} from "@/features/coach/CoachProfileView";
import { useCoachLimits } from "@/features/coach/limits";
import { Page, PageHeader } from "@/features/coach/parts";
import { TransformationsStrip } from "@/features/coach/TransformationsStrip";
import { colors, rhythm, space } from "@/theme";

function JoinCoachScreen() {
  const { coach, coachName, setJoiningCoach } = useCoachData();
  const insets = useSafeAreaInsets();
  const first = coachName.replace(/^Coach\s+/, "");
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={styles.root}>
      <PageHeader title="" onBack={back} />
      <Page>
        <CoachProfileView coach={coach} />
        <TransformationsStrip />
        <Text variant="label" weight="regular" tone="muted">
          Answer a few questions so {first} knows where you&apos;re starting.
          Then {first} builds your training, food and sleep plan, with weekly
          check-ins and chat in the app.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label={`Train with ${first}`}
          fullWidth
          onPress={() => {
            setJoiningCoach(true);
            router.push({
              pathname: "/onboarding/[step]",
              params: { step: "0" },
            });
          }}
        />
        <Text variant="caption" tone="muted" style={styles.center}>
          Free for you. {first}&apos;s coaching is paid to {first} directly.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: "center", gap: space[3], paddingBottom: space[4] },
  center: { textAlign: "center" },
  footer: {
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});

/**
 * Before the invite: an athlete who already has a coach sees how switching works (F3-03, one coach
 * at a time), and a coach at their client limit isn't taking new clients (K-26, D40).
 */
export default function JoinCoach() {
  const { meTier, coach, coachName } = useCoachData();
  const { full } = useCoachLimits();
  if (meTier === "coached")
    return (
      <Redirect
        href={{
          pathname: "/athlete/switch/[step]",
          params: { step: "already" },
        }}
      />
    );
  if (full)
    return (
      <MenuPage title="" back={backTo("/")}>
        <View style={styles.hero}>
          <CoachPhoto name={coachName} uri={coach.photo} />
          <Text variant="display" style={styles.center}>
            {coachName} isn&apos;t taking new clients right now
          </Text>
          <Text tone="muted" style={styles.center}>
            Their coaching is full. You can still use Arcwell on your own: track
            workouts, food and progress for free.
          </Text>
          <Button
            label="Use Arcwell on my own"
            fullWidth
            onPress={() =>
              router.replace({
                pathname: "/onboarding/[step]",
                params: { step: "0" },
              })
            }
          />
        </View>
      </MenuPage>
    );
  return <JoinCoachScreen />;
}
