// One conversation between a coach and a client (F7), used on both sides. Day separators, photo
// messages, "Seen" under your last message once the other side has opened the chat, and quick
// replies for the things people say most. Photos and PDFs attach from the paperclip; tapping a PDF
// opens a preview sheet (PdfSheet) that hands it to the phone's viewer (X-06). Day headers use the
// phone's own day, not UTC.
import { Image } from "expo-image";
import { FileText, Paperclip, Send, X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ImageViewer } from "@/components/ImageViewer";
import { IconButton, PressableScale, Text } from "@/components/primitives";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

import { dayText, ymd } from "./crm";
import { type PdfInfo, PdfSheet } from "./PdfSheet";
import { choosePhoto } from "./PhotoSlot";
import type { Message } from "./sampleData";
import { OfflineBanner } from "@/features/system/SystemStates";
import * as DocumentPicker from "expo-document-picker";
import { Sheet, SheetRow } from "@/features/athlete/Sheet";

export function ChatThread({
  messages,
  me,
  otherName,
  seen,
  quick,
  onSend,
}: {
  messages: Message[];
  me: Message["from"];
  otherName: string;
  /** The other side has read everything you sent. */
  seen: boolean;
  quick: string[];
  onSend: (
    text: string,
    image?: string,
    file?: { name: string; uri: string },
  ) => void;
}) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollViewInstance>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [file, setFile] = useState<{ name: string; uri: string } | undefined>();
  const [attach, setAttach] = useState(false);
  const pickPdf = async () => {
    setAttach(false);
    const r = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    }).catch(() => null);
    const a = r && !r.canceled ? r.assets[0] : null;
    if (a) setFile({ name: a.name, uri: a.uri });
  };
  const [viewing, setViewing] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PdfInfo | null>(null);
  const lastMine = messages.map((m) => m.from).lastIndexOf(me);
  const submit = (t = text) => {
    const s = t.trim();
    if (!s && !image && !file) return;
    onSend(s, image, file);
    setText("");
    setImage(undefined);
    setFile(undefined);
  };

  return (
    <>
      <ScrollView
        ref={scroll}
        style={styles.flex}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() =>
          scroll.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        <OfflineBanner what="Messages send when you're back online." />
        {messages.length === 0 ? (
          <Text tone="muted" style={styles.empty}>
            Say hello to {otherName}.
          </Text>
        ) : null}
        {messages.map((m, i) => {
          const mine = m.from === me;
          const day = localDay(m.at);
          const prevDay = localDay(messages[i - 1]?.at);
          return (
            <View key={i} style={styles.item}>
              {day && day !== prevDay ? (
                <Text variant="caption" tone="muted" style={styles.day}>
                  {dayText(day)}
                </Text>
              ) : null}
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                {m.image ? (
                  <PressableScale
                    onPress={() => setViewing(m.image ?? null)}
                    accessibilityRole="imagebutton"
                    accessibilityLabel="Open photo"
                  >
                    <Image
                      source={{ uri: m.image }}
                      style={styles.photo}
                      contentFit="cover"
                    />
                  </PressableScale>
                ) : null}
                {m.file ? (
                  <PressableScale
                    onPress={() => {
                      if (!m.file) return;
                      const d = localDay(m.at);
                      setPdf({
                        ...m.file,
                        from: mine ? "You" : otherName,
                        when: d ? `${dayText(d)}, ${m.time}` : m.time,
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${m.file.name}`}
                    style={styles.fileChip}
                  >
                    <FileText
                      size={18}
                      color={mine ? colors.onBrand : colors.text}
                    />
                    <Text
                      variant="label"
                      weight="medium"
                      tone={mine ? "onBrand" : "default"}
                      numberOfLines={1}
                      style={styles.flex}
                    >
                      {m.file.name}
                    </Text>
                  </PressableScale>
                ) : null}
                {m.text ? (
                  <Text tone={mine ? "onBrand" : "default"}>{m.text}</Text>
                ) : null}
                <Text
                  variant="caption"
                  tone={mine ? "onBrand" : "muted"}
                  style={styles.time}
                >
                  {m.time}
                </Text>
              </View>
              {i === lastMine && seen ? (
                <Text variant="caption" tone="muted" style={styles.seen}>
                  Seen
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Never grow: on web a horizontal list otherwise takes the chat's spare height.
        style={styles.quickBar}
        contentContainerStyle={styles.quick}
        keyboardShouldPersistTaps="handled"
      >
        {quick.map((q) => (
          <PressableScale
            key={q}
            onPress={() => submit(q)}
            accessibilityRole="button"
            accessibilityLabel={`Send: ${q}`}
            style={styles.chip}
          >
            <Text variant="label">{q}</Text>
          </PressableScale>
        ))}
      </ScrollView>
      {file ? (
        <View style={styles.preview}>
          <FileText size={20} color={colors.text} />
          <Text
            variant="label"
            weight="regular"
            tone="muted"
            style={styles.flex}
            numberOfLines={1}
          >
            {file.name}
          </Text>
          <IconButton
            icon={X}
            accessibilityLabel="Remove file"
            onPress={() => setFile(undefined)}
          />
        </View>
      ) : null}
      {image ? (
        <View style={styles.preview}>
          <Image
            source={{ uri: image }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel="Photo to send"
          />
          <Text
            variant="label"
            weight="regular"
            tone="muted"
            style={styles.flex}
          >
            Photo ready to send
          </Text>
          <IconButton
            icon={X}
            accessibilityLabel="Remove photo"
            onPress={() => setImage(undefined)}
          />
        </View>
      ) : null}
      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, space[2]) },
        ]}
      >
        <IconButton
          icon={Paperclip}
          accessibilityLabel="Attach a photo or PDF"
          onPress={() => setAttach(true)}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          accessibilityLabel={`Message ${otherName}`}
        />
        <IconButton
          icon={Send}
          variant="filled"
          accessibilityLabel="Send"
          disabled={!text.trim() && !image && !file}
          onPress={() => submit()}
        />
      </View>
      <ImageViewer uri={viewing} onClose={() => setViewing(null)} />
      <PdfSheet pdf={pdf} onClose={() => setPdf(null)} />
      <Sheet visible={attach} onClose={() => setAttach(false)} title="Attach">
        <SheetRow
          label="Photo"
          sub="Take one or choose from your library"
          onPress={() => {
            setAttach(false);
            choosePhoto(setImage);
          }}
        />
        <SheetRow
          label="PDF"
          sub="A diet chart, blood report or programme"
          onPress={pickPdf}
        />
      </Sheet>
    </>
  );
}

/** The phone's own day (YYYY-MM-DD) for an ISO time; slicing the ISO string would give the UTC day. */
const localDay = (at?: string) => (at ? ymd(new Date(at)) : undefined);

const styles = StyleSheet.create({
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 40,
    maxWidth: 240,
  },
  flex: { flex: 1 },
  thread: { padding: rhythm.gutter, gap: space[2] },
  empty: { textAlign: "center", paddingTop: space[8] },
  item: { gap: space[1] },
  day: { textAlign: "center", paddingVertical: space[2] },
  bubble: {
    maxWidth: "80%",
    gap: space[1],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.lg,
  },
  mine: { alignSelf: "flex-end", backgroundColor: colors.brand },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.surface },
  time: { alignSelf: "flex-end" },
  seen: { alignSelf: "flex-end" },
  photo: { width: 200, height: 260, borderRadius: radius.md },
  quickBar: { flexGrow: 0, flexShrink: 0 },
  quick: {
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingVertical: space[2],
  },
  chip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingHorizontal: rhythm.gutter,
  },
  thumb: { width: 48, height: 64, borderRadius: radius.sm },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[2],
    paddingHorizontal: space[2],
    paddingTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
});
