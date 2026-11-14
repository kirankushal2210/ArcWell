// Ways into the legal pages (D106): a line of links under a consent tick box, and menu rows.
import { router } from "expo-router";
import { Copyright, FileText, Shield } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PressableScale, Text } from "@/components/primitives";
import { NavRow } from "@/features/athlete/MenuParts";
import { Group } from "@/features/coach/parts";
import { space } from "@/theme";

import { LEGAL_DOCS, type LegalSlug } from "./docs";

export const openLegal = (doc: LegalSlug) =>
  router.push({ pathname: "/legal/[doc]", params: { doc } });

function Link({ doc, label }: { doc: LegalSlug; label: string }) {
  return (
    <PressableScale
      onPress={() => openLegal(doc)}
      accessibilityRole="link"
      accessibilityLabel={`Read the ${LEGAL_DOCS[doc].title}`}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
    >
      <Text variant="label" tone="brand">
        {label}
      </Text>
    </PressableScale>
  );
}

/** "Read the Terms of Use · Privacy Policy", for under a consent tick box. */
export function PolicyLinks() {
  return (
    <View style={styles.links}>
      <Text variant="label" weight="regular" tone="muted">
        Read the
      </Text>
      <Link doc="terms" label="Terms of Use" />
      <Text variant="label" weight="regular" tone="muted">
        ·
      </Text>
      <Link doc="privacy" label="Privacy Policy" />
    </View>
  );
}

/** Privacy Policy, Terms of Use and Copyright policy as menu rows. */
export function LegalRows() {
  return (
    <Group>
      <NavRow
        icon={Shield}
        label="Privacy Policy"
        first
        onPress={() => openLegal("privacy")}
      />
      <NavRow
        icon={FileText}
        label="Terms of Use"
        onPress={() => openLegal("terms")}
      />
      <NavRow
        icon={Copyright}
        label="Copyright policy"
        sub="Report content that copies your work"
        onPress={() => openLegal("copyright")}
      />
    </Group>
  );
}

const styles = StyleSheet.create({
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space[1],
  },
});
