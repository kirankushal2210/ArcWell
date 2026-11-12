// Athlete tabs. Self-guided (D57): Today · Training · Nutrition · Recovery. Coached (sitemap): the
// same four plus Progress. The glass + button sits at the bottom right beside the tab bar (D67); the
// AI coach is reached from it and from Today, and coached athletes never see AI (D44).
import { Tabs } from "expo-router/tabs";
import {
  Dumbbell,
  House,
  Moon,
  TrendingUp,
  Utensils,
} from "lucide-react-native";

import { View } from "react-native";

import { PLUS_RESERVE, QuickLog } from "@/features/athlete/QuickLog";
import { WorkoutBar } from "@/features/athlete/WorkoutBar";
import { useCoachData } from "@/features/coach/CoachData";
import { CoachTabBar } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function AthleteTabs() {
  const { meTier } = useCoachData();
  const coached = meTier === "coached";
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        tabBar={(props) => (
          <CoachTabBar {...props} reserveRight={PLUS_RESERVE} />
        )}
        screenOptions={{
          headerShown: false,
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
        <Tabs.Screen
          name="progress"
          options={{
            href: coached ? undefined : null,
            title: "Progress",
            tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
          }}
        />
      </Tabs>
      <WorkoutBar />
      <QuickLog />
    </View>
  );
}
