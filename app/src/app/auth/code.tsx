// Code step: the 6-digit code from the email, checked as soon as all six digits are in. A new code
// can be sent after 30 seconds. On success a sign-up returns to the screen that started it and
// carries on; a sign-in goes to the account's app (coach or athlete).
import { router, useLocalSearchParams } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text, TextField } from "@/components/primitives";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCoachData } from "@/features/coach/CoachData";
import { ProgressBar, QuestionHeader } from "@/features/onboarding/parts";
import { colors, rhythm, space } from "@/theme";

const WAIT = 30;
const LOCAL = /127\.0\.0\.1|localhost|10\.0\.2\.2/.test(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
);

export default function CodeStep() {
  const { email = "" } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const { meId } = useCoachData();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(WAIT);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const verify = async (c: string) => {
    setBusy(true);
    const r = await auth.verifyCode(email, c);
    setBusy(false);
    if (r.error) {
      setCode("");
      return setError(r.error);
    }
    const pending = auth.pending;
    if (pending) {
      auth.begin(null);
      // Back to the sign-up screen (past this one and the email step), then its next step.
      router.dismiss(2);
      pending.then();
      return;
    }
    if (router.canDismiss()) router.dismissAll();
    if (r.profile?.role === "coach") router.replace("/coach");
    else if (r.profile?.role === "athlete")
      // Plans live on the phone until sync arrives; on a new phone, build one again.
      router.replace(
        meId
          ? "/athlete"
          : { pathname: "/onboarding/[step]", params: { step: "0" } },
      );
    else router.replace("/role");
  };

  const resend = async () => {
    setError(null);
    const r = await auth.sendCode(email);
    if (r.error) return setError(r.error);
    setWait(WAIT);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View
        style={[
          styles.flex,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, space[4]),
          },
        ]}
      >
        <View style={styles.top}>
          <ProgressBar segments={[]} onBack={() => router.back()} />
        </View>
        <View style={styles.body}>
          <QuestionHeader
            glyph={KeyRound}
            title="Enter the code"
            sub={`Sent to ${email}. It can take a minute to arrive.`}
          />
          <TextField
            label="6-digit code"
            value={code}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, "").slice(0, 6);
              setCode(digits);
              setError(null);
              if (digits.length === 6 && !busy) verify(digits);
            }}
            error={error ?? undefined}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={6}
            editable={!busy}
            autoFocus
            testID="auth-code"
          />
          {LOCAL ? (
            <Text variant="caption" tone="muted">
              Local build: codes arrive in the test inbox at 127.0.0.1:54324.
            </Text>
          ) : null}
        </View>
        <View style={styles.footer}>
          <Button
            label="Continue"
            fullWidth
            disabled={code.length !== 6}
            loading={busy}
            loadingLabel="Checking code"
            onPress={() => verify(code)}
          />
          <Button
            label={
              wait > 0 ? `Send a new code in ${wait} s` : "Send a new code"
            }
            variant="ghost"
            fullWidth
            disabled={wait > 0 || busy}
            onPress={resend}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  top: { paddingHorizontal: space[1] },
  body: {
    flex: 1,
    gap: space[4],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
  footer: { gap: space[2], paddingHorizontal: rhythm.gutter },
});
