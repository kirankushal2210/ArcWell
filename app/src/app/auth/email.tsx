// Email step of sign-in and sign-up (PLAN Phase 1): one field, then a 6-digit code by email. No
// password. Sign-up screens (save your plan, personal invite, coach setup) arrive here with a
// pending role and consent; Sign In on the welcome screen arrives with none.
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text, TextField } from "@/components/primitives";
import { useAuth } from "@/features/auth/AuthProvider";
import { ProgressBar, QuestionHeader } from "@/features/onboarding/parts";
import { colors, rhythm, space } from "@/theme";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EmailStep() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signUp = !!auth.pending;

  const send = async () => {
    if (!EMAIL.test(email.trim()))
      return setError("Enter a full email address, like name@example.com.");
    setBusy(true);
    const r = await auth.sendCode(email);
    setBusy(false);
    if (r.error) return setError(r.error);
    router.push({ pathname: "/auth/code", params: { email: email.trim() } });
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
          <ProgressBar
            segments={[]}
            onBack={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          />
        </View>
        <View style={styles.body}>
          <QuestionHeader
            glyph={Mail}
            title={signUp ? "Your email" : "Sign in"}
            sub="We'll email you a 6-digit code. No password to remember."
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            onSubmitEditing={send}
            error={error ?? undefined}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            autoFocus
            testID="auth-email"
          />
        </View>
        <View style={styles.footer}>
          <Button
            label="Send code"
            fullWidth
            disabled={!email.trim()}
            loading={busy}
            loadingLabel="Sending code"
            onPress={send}
          />
          {signUp ? null : (
            <Text variant="caption" tone="muted" style={styles.center}>
              New to Arcwell? Go back and tap Get Started.
            </Text>
          )}
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
    gap: space[6],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
  center: { textAlign: "center" },
  footer: { gap: space[2], paddingHorizontal: rhythm.gutter },
});
