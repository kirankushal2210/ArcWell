// Joining a coach with real accounts (B1, D56, D107): the code is checked on the server, the coach's
// profile shows before sign-up (D43), the athlete gives their own consent (DPDP) and makes their
// account, then the invite is redeemed. A personal invite hands over the plans the coach built.
import { router } from "expo-router";
import { Check, KeyRound } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/components/brand";
import { Avatar, Button, PressableScale, Text } from "@/components/primitives";
import { invitePage, redeemInvite } from "@/features/accounts/repo";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import { Page, PageHeader } from "@/features/coach/parts";
import { PolicyLinks } from "@/features/legal/LegalLinks";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

type Coach = {
  name?: string;
  city?: string;
  specialisations?: string[];
  bio?: string;
};

export function CloudJoin({ code: initial }: { code?: string }) {
  const auth = useAuth();
  const { syncNow } = useCoachData();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState((initial ?? "").toUpperCase());
  const [coach, setCoach] = useState<Coach | null>(null);
  const [open, setOpen] = useState(true);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const clean = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  const check = async () => {
    setBusy(true);
    setError(null);
    const r = await invitePage(clean);
    setBusy(false);
    if (r.error || !r.data) return setError(r.error);
    setCoach(r.data.profile as Coach);
    setOpen(r.data.open);
  };

  const finish = async () => {
    setBusy(true);
    const r = await redeemInvite(clean);
    if (r.error) {
      setBusy(false);
      setError(r.error);
      return;
    }
    await syncNow();
    setBusy(false);
    if (router.canDismiss()) router.dismissAll();
    router.replace("/athlete");
  };

  const start = () => {
    setError(null);
    if (auth.session && auth.profile) return void finish();
    // The client gives their own consent (D56); the account is made by email code.
    auth.begin({ role: "athlete", consent: true, then: () => void finish() });
    router.push("/auth/email");
  };

  if (!coach)
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <PageHeader title="Join your coach" onBack={back} />
        <Page>
          <View style={styles.glyph}>
            <KeyRound size={40} strokeWidth={1.6} color={colors.text} />
          </View>
          <Text tone={error ? "danger" : "muted"} style={styles.center}>
            {error ?? "Enter the code from your coach's message, e.g. ANJ4821."}
          </Text>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="ANJ4821"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.code}
            accessibilityLabel="Invite code"
          />
        </Page>
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label={busy ? "Checking…" : "Continue"}
            fullWidth
            disabled={clean.length < 6 || busy}
            onPress={() => void check()}
          />
        </View>
      </KeyboardAvoidingView>
    );

  const name = coach.name ?? "Your coach";
  const first = name.replace(/^Coach\s+/, "");
  return (
    <View style={styles.root}>
      <PageHeader title="" onBack={() => setCoach(null)} />
      <Page>
        <View style={styles.glyph}>
          <Logo size={48} />
        </View>
        <Text variant="display" style={styles.center}>
          {open ? `${first} invited you` : `${first} isn't taking new clients`}
        </Text>
        <Text tone="muted" style={styles.center}>
          {open
            ? "Your training, food and recovery plans come from your coach, with weekly check-ins and chat in the app."
            : "Their client list is full right now. Ask them when a spot opens up."}
        </Text>
        <View style={styles.coach}>
          <Avatar name={first} />
          <View style={styles.flex}>
            <Text weight="semibold">{name}</Text>
            {coach.city || coach.specialisations?.length ? (
              <Text variant="label" weight="regular" tone="muted">
                {[coach.city, ...(coach.specialisations ?? [])]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            ) : null}
          </View>
        </View>
        {coach.bio ? <Text tone="muted">{coach.bio}</Text> : null}
        {open ? (
          <>
            <PressableScale
              onPress={() => setAgree((a) => !a)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agree }}
              style={styles.agree}
            >
              <Text weight="medium" style={styles.flex}>
                I agree to the Terms of Use and Privacy Policy, and let {first}{" "}
                see my training, food, sleep and progress while they coach me.
                I&apos;m 18 or older.
              </Text>
              <View style={[styles.tick, agree && styles.tickOn]}>
                {agree ? (
                  <Check size={16} strokeWidth={3} color={colors.onBrand} />
                ) : null}
              </View>
            </PressableScale>
            <PolicyLinks />
          </>
        ) : null}
        {error ? <Text tone="danger">{error}</Text> : null}
      </Page>
      {open ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <Button
            label={busy ? "Joining…" : "Start my plan"}
            fullWidth
            disabled={!agree || busy}
            onPress={start}
          />
          <Text variant="caption" tone="muted" style={styles.center}>
            {auth.session
              ? "You're signed in, so this joins straight away."
              : "Next, we'll email you a code to make your account."}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  center: { textAlign: "center" },
  glyph: { alignItems: "center", paddingTop: space[2] },
  coach: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  code: {
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.xl,
    letterSpacing: 2,
    textAlign: "center",
    color: colors.text,
  },
  agree: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tick: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  footer: {
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    gap: space[2],
  },
});
