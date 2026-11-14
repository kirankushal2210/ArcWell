// Legal pages in the app (D106): Privacy Policy, Terms of Use, Copyright policy and Delete your
// account, drawn from features/legal/docs.ts. They're bundled with the app, so they open offline
// and before sign-up. The same text is published as static HTML for the website (public/legal/).
import { router, useLocalSearchParams } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";

import { Text } from "@/components/primitives";
import { MenuPage } from "@/features/athlete/MenuParts";
import { Eyebrow } from "@/features/coach/parts";
import {
  type Block,
  isLegalSlug,
  LEGAL_DOCS,
  LEGAL_UPDATED,
  parseInline,
} from "@/features/legal/docs";
import { space } from "@/theme";

const open = (href: string) => {
  if (href.startsWith("doc:"))
    router.push({ pathname: "/legal/[doc]", params: { doc: href.slice(4) } });
  else void Linking.openURL(href).catch(() => {});
};

/** One paragraph or list item, with **bold** runs and tappable links. */
function Rich({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <Text tone={muted ? "muted" : "default"}>
      {parseInline(text).map((r, i) =>
        r.href ? (
          <Text
            key={i}
            tone="brand"
            weight="medium"
            accessibilityRole="link"
            onPress={() => open(r.href!)}
          >
            {r.text}
          </Text>
        ) : (
          <Text key={i} weight={r.bold ? "semibold" : undefined}>
            {r.text}
          </Text>
        ),
      )}
    </Text>
  );
}

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") return <Rich text={block} />;
  return (
    <View style={styles.list}>
      {block.list.map((item) => (
        <View key={item} style={styles.item}>
          <Text tone="muted">•</Text>
          <View style={styles.flex}>
            <Rich text={item} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function LegalPage() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const d = isLegalSlug(doc ?? "")
    ? LEGAL_DOCS[doc as keyof typeof LEGAL_DOCS]
    : null;
  if (!d)
    return (
      <MenuPage title="Not found" back={back}>
        <Text tone="muted">This page doesn&apos;t exist.</Text>
      </MenuPage>
    );
  return (
    <MenuPage title={d.title} sub={`Last updated ${LEGAL_UPDATED}`} back={back}>
      <Rich text={d.summary} muted />
      {d.sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Eyebrow>{s.heading}</Eyebrow>
          {s.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </View>
      ))}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[2], marginTop: space[2] },
  list: { gap: space[2] },
  item: { flexDirection: "row", gap: space[2] },
  flex: { flex: 1 },
});
