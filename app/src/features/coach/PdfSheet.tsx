// PDF preview sheet for chat attachments (X-06): file name, size, who sent it and when, then Open
// and Share. Drawing the PDF inside the app on Android needs a native PDF module that Expo Go
// doesn't include, and health documents never go to an online viewer (files stay in private
// storage behind short-lived signed links, D72). So Open hands the file to the phone's own viewer:
// expo-file-system's preview (Quick Look on iPhone, an ACTION_VIEW intent on Android), or the
// browser for a link and on the web. Share uses the phone's share sheet (expo-sharing) for a
// file on the phone; the web has no Share.
import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform, StyleSheet, View } from "react-native";

import { Button, Text } from "@/components/primitives";
import { Sheet } from "@/features/athlete/Sheet";
import { space } from "@/theme";

import { KeyValues } from "./parts";

export type PdfInfo = {
  name: string;
  uri: string;
  /** "You" or the other person's name. */
  from: string;
  /** "Today, 9:40 am" and the like. */
  when?: string;
};

const local = (uri: string) => Platform.OS !== "web" && uri.startsWith("file:");

/** Size of a file on this phone, or undefined when it can't be read (links, the web). */
function sizeText(uri: string) {
  if (!local(uri)) return undefined;
  try {
    const b = new File(uri).info().size;
    if (!b) return undefined;
    return b < 1024 * 1024
      ? `${Math.max(1, Math.round(b / 1024))} KB`
      : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return undefined;
  }
}

async function openPdf(p: PdfInfo) {
  if (local(p.uri)) {
    try {
      await new File(p.uri).preview({
        mimeType: "application/pdf",
        title: p.name,
      });
      return;
    } catch {
      // No viewer for it, or an older native module: fall through to the browser.
    }
  }
  await WebBrowser.openBrowserAsync(p.uri).catch(() =>
    Linking.openURL(p.uri).catch(() => {}),
  );
}

async function sharePdf(p: PdfInfo) {
  if (!(await Sharing.isAvailableAsync().catch(() => false))) return;
  await Sharing.shareAsync(p.uri, {
    mimeType: "application/pdf",
    dialogTitle: p.name,
    UTI: "com.adobe.pdf",
  }).catch(() => {});
}

export function PdfSheet({
  pdf,
  onClose,
}: {
  pdf: PdfInfo | null;
  onClose: () => void;
}) {
  const size = pdf ? sizeText(pdf.uri) : undefined;
  const canShare = !!pdf && local(pdf.uri);
  return (
    <Sheet visible={!!pdf} onClose={onClose} title={pdf?.name ?? "PDF"}>
      {pdf ? (
        <>
          <KeyValues
            rows={[
              ["Sent by", pdf.from],
              ...(pdf.when ? ([["Sent", pdf.when]] as [string, string][]) : []),
              ...(size ? ([["Size", size]] as [string, string][]) : []),
            ]}
          />
          <View style={styles.actions}>
            <Button label="Open" fullWidth onPress={() => void openPdf(pdf)} />
            {canShare ? (
              <Button
                label="Share"
                variant="secondary"
                fullWidth
                onPress={() => void sharePdf(pdf)}
              />
            ) : null}
          </View>
          <Text variant="caption" tone="muted">
            {Platform.OS === "web"
              ? "Opens in a new tab."
              : "Opens in your phone's PDF viewer."}
          </Text>
        </>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space[2] },
});
