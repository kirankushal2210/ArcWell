// Account (AC-01): profile, subscription, my coach (coached), privacy, units, export, help and
// delete, with Sign out at the bottom.
import { router } from "expo-router";
import {
  CircleHelp,
  CreditCard,
  Download,
  Ruler,
  Shield,
  Trash2,
  UserRound,
  Users,
} from "lucide-react-native";
import { Alert } from "react-native";

import { Button } from "@/components/primitives";
import { useAuth } from "@/features/auth/AuthProvider";
import { shortDay } from "@/features/athlete/athleteData";
import { backTo, MenuPage, NavRow } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group } from "@/features/coach/parts";

export default function Account() {
  const me = useMe();
  const { meTier, coachName, settingsOf } = useCoachData();
  const auth = useAuth();
  if (!me) return <NotJoined />;
  const s = settingsOf(me.id);

  return (
    <MenuPage
      title="Account"
      back={backTo("/athlete/menu")}
      footer={
        auth.session ? (
          <Button
            label="Sign out"
            variant="secondary"
            fullWidth
            onPress={() =>
              Alert.alert(
                "Sign out?",
                "Your plan and history stay on this phone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign out",
                    onPress: () =>
                      auth.signOut().finally(() => {
                        if (router.canDismiss()) router.dismissAll();
                        router.replace("/");
                      }),
                  },
                ],
              )
            }
          />
        ) : undefined
      }
    >
      <Group>
        <NavRow
          first
          icon={UserRound}
          label="Profile"
          sub="Name, goal, experience, injuries, diet"
          onPress={() => router.push("/athlete/menu/profile")}
        />
        {meTier === "coached" ? (
          <NavRow
            icon={Users}
            label="My coach"
            value={coachName}
            onPress={() => router.push("/athlete/menu/coach")}
          />
        ) : (
          <>
            <NavRow
              icon={CreditCard}
              label="Subscription"
              value={meTier === "pro" ? "Arcwell Plus" : "Free"}
              onPress={() =>
                router.push(
                  meTier === "pro" ? "/athlete/subscription" : "/athlete/ai",
                )
              }
            />
            <NavRow
              icon={Users}
              label="Join a coach"
              sub={
                me.formerCoach
                  ? `You left ${me.formerCoach.coachName} on ${shortDay(me.formerCoach.at)}`
                  : "Open your coach's invite link, or join here"
              }
              onPress={() =>
                router.push({
                  pathname: "/athlete/switch/[step]",
                  params: { step: "join" },
                })
              }
            />
          </>
        )}
        <NavRow
          icon={Shield}
          label="Privacy and permissions"
          onPress={() => router.push("/athlete/menu/privacy")}
        />
        <NavRow
          icon={Ruler}
          label="Units"
          value={`kg, ${s.length === "cm" ? "cm" : "ft / in"}`}
          onPress={() => router.push("/athlete/menu/units")}
        />
        <NavRow
          icon={Download}
          label="Export my data"
          value={s.export?.status === "preparing" ? "Preparing" : undefined}
          onPress={() => router.push("/athlete/menu/export")}
        />
        <NavRow
          icon={CircleHelp}
          label="Help and support"
          onPress={() => router.push("/athlete/menu/help")}
        />
      </Group>
      <Group>
        <NavRow
          first
          icon={Trash2}
          label="Delete account"
          tone="danger"
          onPress={() => router.push("/athlete/menu/delete")}
        />
      </Group>
    </MenuPage>
  );
}
