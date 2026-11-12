// Coach tabs, final for v1 (D23): Clients · Check-ins · Plans · Messages · Business.
import { Tabs } from "expo-router/tabs";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  ListChecks,
  MessageCircle,
  Users,
} from "lucide-react-native";

import { useCoachData } from "@/features/coach/CoachData";
import { CoachTabBar } from "@/features/coach/parts";
import { colors } from "@/theme";

export default function CoachTabs() {
  const { clients } = useCoachData();
  const toReview = clients
    .flatMap((c) => c.checkIns)
    .filter((k) => !k.reviewed).length;
  const unread = clients.reduce((n, c) => n + c.unread, 0);
  return (
    <Tabs
      tabBar={(props) => <CoachTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Clients",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="check-ins"
        options={{
          title: "Check-ins",
          tabBarBadge: toReview || undefined,
          tabBarIcon: ({ color }) => <ClipboardCheck size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color }) => <ListChecks size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarBadge: unread || undefined,
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "Business",
          tabBarIcon: ({ color }) => (
            <BriefcaseBusiness size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
