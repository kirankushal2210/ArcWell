// Coach menu (D65): opened from the hamburger on every coach tab. Profile, plan and billing,
// settings and privacy, help, then sign out.
import { router } from "expo-router";
import {
  ChevronRight,
  CircleHelp,
  CreditCard,
  Images,
  LogOut,
  type LucideIcon,
  Settings,
  UserRound,
} from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";

import { Avatar, Button, Text } from "@/components/primitives";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import { Group, GroupRow, Page, PageHeader } from "@/features/coach/parts";
import { colors, radius, space } from "@/theme";

type Href =
  | "/coach/transformations"
  | "/coach/menu/profile"
  | "/coach/menu/billing"
  | "/coach/menu/settings"
  | "/coach/menu/help";
const ITEMS: { icon: LucideIcon; label: string; sub: string; href: Href }[] = [
  {
    icon: UserRound,
    label: "Coach profile",
    sub: "What clients see on your invite page",
    href: "/coach/menu/profile",
  },
  {
    icon: Images,
    label: "Transformations",
    sub: "Before-and-after photos clients approved",
    href: "/coach/transformations",
  },
  {
    icon: CreditCard,
    label: "Plan and billing",
    sub: "Client spots and your Arcwell plan",
    href: "/coach/menu/billing",
  },
  {
    icon: Settings,
    label: "Settings and privacy",
    sub: "Notifications, data and your account",
    href: "/coach/menu/settings",
  },
  {
    icon: CircleHelp,
    label: "Help and support",
    sub: "Questions, contact and terms",
    href: "/coach/menu/help",
  },
];

export default function CoachMenu() {
  const { coach } = useCoachData();
  const auth = useAuth();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach");

  return (
    <View style={styles.root}>
      <PageHeader title="Menu" onBack={back} />
      <Page>
        <View style={styles.card}>
          <Avatar name={coach.name} size={48} />
          <View style={styles.flex}>
            <Text variant="title">{coach.name}</Text>
            <Text variant="label" weight="regular" tone="muted">
              {[coach.city, coach.specialisations.join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        </View>
        <Group>
          {ITEMS.map((it, i) => (
            <GroupRow
              key={it.href}
              first={i === 0}
              onPress={() => router.push(it.href)}
              label={it.label}
            >
              <it.icon size={22} color={colors.text} />
              <View style={styles.flex}>
                <Text weight="medium">{it.label}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {it.sub}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </GroupRow>
          ))}
        </Group>
        {auth.session ? (
          <Button
            label="Sign out"
            icon={LogOut}
            variant="ghost"
            fullWidth
            onPress={() =>
              Alert.alert(
                "Sign out?",
                "Your clients and plans stay on this phone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign out",
                    onPress: () => {
                      auth.signOut().finally(() => {
                        if (router.canDismiss()) router.dismissAll();
                        router.replace("/");
                      });
                    },
                  },
                ],
              )
            }
          />
        ) : (
          <Text variant="caption" tone="muted" style={styles.center}>
            Sample build: accounts are off, so there&apos;s nothing to sign out
            of.
          </Text>
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
