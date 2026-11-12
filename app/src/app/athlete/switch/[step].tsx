// Coaching changes, one route per step:
// - join (J-01): a self-guided athlete joins a coach. Coach guidance replaces the AI plan; nothing is
//   deleted (D7, D7c). AI subscribers are sent to end their subscription first.
// - end-ai (J-02): subscriptions are managed in Google Play; Arcwell only checks the status and never
//   cancels (D7a, D19). Joining waits until Play reports the subscription as cancelled.
// - joined (J-03): what changed.
// - upgraded (U-01): what Arcwell Plus adds, after starting the trial.
// - ended (F8-08, TL-02): Plus ended; free plan, history kept, AI plan read-only (D32, D33).
// - already (F3-03): a coached athlete opened another invite; one coach at a time.
// - left (L-03, and K-29 when the coach closed their account): what changed after coaching ends.
// The bottom bar follows D57 and D68 (four tabs; AI from Today and the + menu), which postdate the
// wireframes' bar wording.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import {
  backTo,
  Bullets,
  ConfirmButtons,
  InfoCard,
  MenuPage,
} from "@/features/athlete/MenuParts";
import { shortDay, subscriptionInfo } from "@/features/athlete/athleteData";
import { useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { KeyValues } from "@/features/coach/parts";
import { space } from "@/theme";

const home = () => {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/athlete");
};

export default function Switch() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const me = useMe();
  const { meTier, coach, coachName, joinCoachFromPro, settingsOf, startPlus } =
    useCoachData();
  const [cancelled, setCancelled] = useState(false);
  const first = coachName.replace(/^Coach\s+/, "");

  if (step === "join")
    return (
      <MenuPage
        title={`Join ${coachName}?`}
        back={backTo("/athlete/menu/account")}
        footer={
          <ConfirmButtons
            label="Continue"
            onConfirm={() => {
              if (meTier === "pro")
                return router.push({
                  pathname: "/athlete/switch/[step]",
                  params: { step: "end-ai" },
                });
              joinCoachFromPro();
              router.replace({
                pathname: "/athlete/switch/[step]",
                params: { step: "joined" },
              });
            }}
            cancel={meTier === "pro" ? "Not now, keep my AI plan" : "Not now"}
            onCancel={backTo("/athlete/menu/account")}
          />
        }
      >
        <View style={styles.hero}>
          <Avatar name={first} size={48} />
          <View style={styles.flex}>
            <Text variant="title">{coach.name}</Text>
            <Text variant="label" weight="regular" tone="muted">
              {[coach.city, coach.specialisations.join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        </View>
        <InfoCard title="What changes">
          <Bullets
            items={[
              `${first}'s training, nutrition and recovery guidance replaces your ${meTier === "pro" ? "AI plan" : "plan"}`,
              ...(meTier === "pro"
                ? ["The AI coach disappears from Today and the + menu"]
                : []),
              "Your workouts, logs and history stay",
            ]}
          />
        </InfoCard>
        {meTier === "pro" ? (
          <InfoCard title="Your Arcwell AI subscription">
            You&apos;ll be asked to end it in the next step so you aren&apos;t
            charged for AI you can&apos;t use.
          </InfoCard>
        ) : null}
      </MenuPage>
    );

  if (step === "upgraded") {
    const sub = me ? subscriptionInfo(settingsOf(me.id).sub) : null;
    return (
      <MenuPage
        title="Welcome to Arcwell Plus"
        back={home}
        footer={<Button label="Got it" fullWidth onPress={home} />}
      >
        <Text tone="muted">Here&apos;s what changed:</Text>
        <InfoCard>
          <Bullets
            items={[
              "Recovery is unlocked: sleep, recovery and strain every morning",
              "Food shows full macros: protein, carbs and fat",
              "Programs and Muscle Analytics are in ☰ → Training",
              "Your AI coach is on Today and in the + menu",
            ]}
          />
        </InfoCard>
        {sub?.status === "trial" ? (
          <InfoCard>
            {`Your free trial ends on ${shortDay(sub.trialEnds)}. We'll remind you two days before, and you can cancel in the Play Store any time before then.`}
          </InfoCard>
        ) : null}
      </MenuPage>
    );
  }

  if (step === "ended")
    return (
      <MenuPage
        title="Arcwell Plus has ended"
        back={home}
        footer={
          <ConfirmButtons
            label="Restart Arcwell Plus"
            onConfirm={() => {
              startPlus("yearly");
              home();
            }}
            cancel="Continue on the free plan"
            onCancel={home}
          />
        }
      >
        <Text tone="muted">
          You&apos;re on the free plan now. What changed:
        </Text>
        <InfoCard>
          <Bullets
            items={[
              "Your workouts, food logs and history all stay",
              "Your plan stays in Training, read-only, and stops adapting",
              "Recovery is locked; your recovery history is kept for when you come back",
              "Food logging shows calories only",
            ]}
          />
        </InfoCard>
      </MenuPage>
    );

  if (step === "already")
    return (
      <MenuPage
        title="You already have a coach"
        back={home}
        footer={
          <ConfirmButtons
            label={`Leave ${coachName} first`}
            onConfirm={() => router.replace("/athlete/menu/leave")}
            cancel={`Stay with ${first}`}
            onCancel={home}
          />
        }
      >
        <InfoCard>
          {`Arcwell works with one coach at a time. To join someone new, leave ${first} first, then open the new invite again.`}
        </InfoCard>
        <InfoCard title="When you leave">
          <Bullets
            items={[
              "You keep all your workouts, logs and history",
              `${first}'s plan stays in Training, read-only`,
              "Your new coach sees your data from the day you join, unless you share earlier history",
            ]}
          />
        </InfoCard>
      </MenuPage>
    );

  if (step === "end-ai")
    return (
      <MenuPage
        title="End your AI subscription"
        sub="Arcwell Plus · managed in Google Play"
        back={backTo("/athlete/menu/account")}
        footer={
          <ConfirmButtons
            label={
              cancelled
                ? "I've cancelled, continue"
                : "Manage subscription in Play Store"
            }
            onConfirm={() => {
              if (!cancelled) return setCancelled(true);
              joinCoachFromPro();
              router.replace({
                pathname: "/athlete/switch/[step]",
                params: { step: "joined" },
              });
            }}
            cancel="Not now"
            onCancel={backTo("/athlete/menu/account")}
          />
        }
      >
        <InfoCard>
          {`Subscriptions and refunds are handled by Google Play. Cancel there, then come back to finish joining ${first}. During the trial, cancelling means no charge at all.`}
        </InfoCard>
        <KeyValues
          rows={[
            [
              "Subscription status",
              cancelled ? "Cancelled" : "Active · checking…",
            ],
          ]}
        />
        <Text variant="caption" tone="muted">
          Sample build: tapping the Play Store button marks it cancelled. The
          real app reads the status from Google Play and waits for it.
        </Text>
      </MenuPage>
    );

  if (step === "joined")
    return (
      <MenuPage
        title={`You're now coached by ${first}`}
        back={home}
        footer={<Button label="Got it" fullWidth onPress={home} />}
      >
        <Text tone="muted">Here&apos;s what changed:</Text>
        <InfoCard>
          <Bullets
            items={[
              `A Progress tab joins your bar: check-ins and chat with ${first}`,
              `Training, Nutrition and Recovery follow ${first}'s guidance once your plan is ready`,
              "Your past workouts are in ☰ → Training → History",
            ]}
          />
        </InfoCard>
      </MenuPage>
    );

  // left (L-03) and closed (K-29)
  const end = me?.formerCoach;
  const who = end?.coachName ?? coachName;
  const whoFirst = who.replace(/^Coach\s+/, "");
  const closed = end?.reason === "closed";
  return (
    <MenuPage
      title={
        closed
          ? "Coaching has ended"
          : end?.reason === "completed"
            ? "Coaching complete"
            : `You've left ${whoFirst}`
      }
      sub={
        closed
          ? `${who} closed their Arcwell account`
          : end?.reason === "completed"
            ? `${who} marked your coaching complete`
            : undefined
      }
      back={home}
      footer={
        closed ? (
          <Button label="Continue" fullWidth onPress={home} />
        ) : (
          <ConfirmButtons
            label="Go to Training"
            onConfirm={() => {
              home();
              router.push("/athlete/training");
            }}
            cancel="See AI coaching"
            onCancel={() => {
              home();
              router.push("/athlete/ai");
            }}
          />
        )
      }
    >
      <InfoCard>
        <Bullets
          items={[
            "You keep all your workouts, logs and history",
            `${whoFirst}'s plan is still in Training, read-only`,
            "You're on the free plan: Recovery is locked and your recovery history is kept",
            "Want AI coaching? You can start a one-week trial",
          ]}
        />
      </InfoCard>
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: space[3] },
  flex: { flex: 1, gap: space[1] / 2 },
});
