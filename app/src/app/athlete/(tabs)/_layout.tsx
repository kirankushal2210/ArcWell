// Athlete tabs: Today · Training · Nutrition · Recovery for everyone (D101: Progress is a page from
// the top-right button, not a tab). The round glass button at the bottom right beside the tab bar is
// the AI coach for self-guided athletes with AI on (D97), and the + log menu for coached athletes
// (who never see AI, D44) and anyone who turned AI off.
import { router } from "expo-router";
import { Tabs } from "expo-router/tabs";
import { useEffect } from "react";
import { Dumbbell, House, Moon, Utensils } from "lucide-react-native";

import { View } from "react-native";

import { PLUS_RESERVE, QuickLog } from "@/features/athlete/QuickLog";
import { useMe } from "@/features/athlete/useMe";
import { WorkoutBar } from "@/features/athlete/WorkoutBar";
import { useCoachData } from "@/features/coach/CoachData";
import { LoadingScreen } from "@/features/system/SystemStates";
import { CoachTabBar } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function AthleteTabs() {
  const { meTier, leaveCoach, hydrated } = useCoachData();
  const me = useMe();
  const coached = meTier === "coached";
  const ended = coached ? me?.endedBy : undefined;
  // The coach completed this client (K-30) or closed their account (K-28): coaching ends here too,
  // and the athlete sees what changed once (L-03, K-29). Photos go with a closed coach account.
  useEffect(() => {
    if (!ended) return;
    leaveCoach(ended === "closed", ended);
    router.push({
      pathname: "/athlete/switch/[step]",
      params: { step: "left" },
    });
  }, [ended, leaveCoach]);
  if (!hydrated) return <LoadingScreen />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        tabBar={(props) => (
          <CoachTabBar {...props} reserveRight={PLUS_RESERVE} />
        )}
        screenOptions={{
          headerShown: false,
          // Hidden tabs don't re-render while another tab is in use.
          freezeOnBlur: true,
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color }) => <House size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: "Training",
            tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: "Nutrition",
            tabBarIcon: ({ color }) => <Utensils size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="recovery"
          options={{
            title: "Recovery",
            tabBarIcon: ({ color }) => <Moon size={24} color={color} />,
          }}
        />
      </Tabs>
      <WorkoutBar />
      <QuickLog />
    </View>
  );
}
