// Coach profile (D65, sitemap §5): what clients see on the invite page and in their app. Name,
// city, up to three specialisations, bio, Instagram, years coaching, self-reported certifications
// (D43) and services. Transformations use client photos only with their consent (Phase 5).
import { router } from "expo-router";
import { Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  Chip,
  IconButton,
  NumberStepper,
  Text,
  TextField,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import {
  type CoachProfile,
  SPECIALISATIONS,
} from "@/features/coach/coachProfile";
import { Eyebrow, Page, PageHeader } from "@/features/coach/parts";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

export default function CoachProfileScreen() {
  const { coach, saveCoach } = useCoachData();
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<CoachProfile>(coach);
  const [service, setService] = useState("");
  const set = (patch: Partial<CoachProfile>) =>
    setP((x) => ({ ...x, ...patch }));
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/coach/menu");
  const toggle = (s: string) =>
    set({
      specialisations: p.specialisations.includes(s)
        ? p.specialisations.filter((x) => x !== s)
        : p.specialisations.length < 3
          ? [...p.specialisations, s]
          : p.specialisations,
    });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader title="Coach profile" onBack={back} />
      <Page>
        <TextField
          label="Name clients see"
          value={p.name}
          onChangeText={(v) => set({ name: v })}
          autoCapitalize="words"
        />
        <TextField
          label="City"
          value={p.city}
          onChangeText={(v) => set({ city: v })}
          autoCapitalize="words"
        />
        <Eyebrow>{`Specialisations · ${p.specialisations.length} of 3`}</Eyebrow>
        <View style={styles.chips}>
          {SPECIALISATIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={p.specialisations.includes(s)}
              onPress={() => toggle(s)}
            />
          ))}
        </View>
        <Eyebrow>About you</Eyebrow>
        <TextInput
          value={p.bio}
          onChangeText={(v) => set({ bio: v })}
          placeholder="A line or two about how you coach"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={280}
          style={styles.bio}
          accessibilityLabel="Short bio"
        />
        <TextField
          label="Instagram"
          value={p.instagram}
          onChangeText={(v) => set({ instagram: v.replace(/^@/, "") })}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.row}>
          <Text style={styles.flex}>Years coaching</Text>
          <NumberStepper
            value={p.years}
            onChange={(v) => set({ years: v })}
            min={0}
            max={50}
            unit="yrs"
            accessibilityLabel="Years coaching"
          />
        </View>
        <TextField
          label="Certifications (self-reported)"
          value={p.certifications}
          onChangeText={(v) => set({ certifications: v })}
        />

        <Eyebrow>Services</Eyebrow>
        <View style={styles.card}>
          {p.services.map((s) => (
            <View key={s} style={styles.service}>
              <Text style={styles.flex}>{s}</Text>
              <IconButton
                icon={X}
                color={colors.textMuted}
                accessibilityLabel={`Remove ${s}`}
                onPress={() =>
                  set({ services: p.services.filter((x) => x !== s) })
                }
              />
            </View>
          ))}
          <View style={styles.service}>
            <TextInput
              value={service}
              onChangeText={setService}
              placeholder="e.g. Online coaching · ₹3,500 a month"
              placeholderTextColor={colors.textMuted}
              style={[styles.flex, styles.serviceInput]}
              accessibilityLabel="New service"
            />
            <IconButton
              icon={Plus}
              accessibilityLabel="Add service"
              disabled={!service.trim()}
              onPress={() => {
                set({ services: [...p.services, service.trim()] });
                setService("");
              }}
            />
          </View>
        </View>
        <Text variant="caption" tone="muted">
          Shown on your invite page and to your own clients only. Certifications
          are your own statement; Arcwell doesn&apos;t check them.
        </Text>
      </Page>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        <Button
          label="Save profile"
          fullWidth
          disabled={!p.name.trim()}
          onPress={() => {
            saveCoach({ ...p, name: p.name.trim() });
            back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space[3] },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[1] },
  bio: {
    minHeight: 88,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
    textAlignVertical: "top",
  },
  card: {
    gap: space[1],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  service: { flexDirection: "row", alignItems: "center", gap: space[2] },
  serviceInput: {
    minHeight: 44,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  footer: { paddingHorizontal: rhythm.gutter, paddingTop: space[2] },
});
