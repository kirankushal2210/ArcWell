// One onboarding question screen: athlete AO-01 to AO-17 and coach CO-02 to CO-11. Layout follows the hi-fi mockups:
// top bar, centred header, the question's fields, and a Next button pinned at the bottom.
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import {
  Camera,
  Check,
  Copy,
  FileSpreadsheet,
  FileUp,
  MessageCircle,
  MessageSquare,
  Plus,
  QrCode,
  Share2,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale, Text } from "@/components/primitives";
import { importSummary } from "@/features/coach/importSheet";
import { choosePhoto } from "@/features/coach/PhotoSlot";
import { type PickedSheet, pickSheet } from "@/features/coach/readSheet";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";
import { PolicyLinks } from "@/features/legal/LegalLinks";

import { BodyFatPicker } from "./BodyFatPicker";
import { useOnboarding } from "./OnboardingContext";
import {
  DayPicker,
  FieldLabel,
  NextButton,
  OptionList,
  ProgressBar,
  QuestionHeader,
  SafetyNote,
  ScaleEnds,
  Segmented,
  TimeCard,
  Tokens,
  Wheel,
} from "./parts";
import { athleteFlow, type Field, type Flow, questionShown } from "./questions";

export type QuestionScreenProps = {
  flow?: Flow;
  index: number;
  onNext: () => void;
  onBack: () => void;
};

/** Fill of each section's progress segment while on question `index`. */
function progress(
  { sections, questions: all }: Flow,
  index: number,
  answers: Record<string, unknown>,
) {
  const q = all[index];
  const questions = all.filter((x) => questionShown(x, answers));
  const current = sections.findIndex((s) => s.id === q.section);
  return sections.map((s, k) => {
    if (k < current) return 1;
    if (k > current) return 0;
    const inSection = questions.filter((x) => x.section === s.id);
    return (inSection.indexOf(q) + 1) / inSection.length;
  });
}

export function QuestionScreen({
  flow = athleteFlow,
  index,
  onNext,
  onBack,
}: QuestionScreenProps) {
  const { sections, questions } = flow;
  const q = questions[index];
  const insets = useSafeAreaInsets();
  const { answers, setAnswer } = useOnboarding();
  const section = sections.find((s) => s.id === q.section);
  const inSection = questions.filter(
    (x) => x.section === q.section && questionShown(x, answers),
  );
  const eyebrow = section
    ? `${section.name} · ${inSection.indexOf(q) + 1} of ${inSection.length}`
    : undefined;

  const filled = (v: unknown) =>
    typeof v === "string"
      ? v.trim().length > 0
      : Array.isArray(v)
        ? v.length > 0
        : v !== undefined && v !== false;
  const ready = q.fields.every((f) => {
    if (f.kind === "single" || f.kind === "chips" || f.kind === "text")
      return !f.required || filled(answers[f.key]);
    if (f.kind === "agree") return answers[f.key] === true;
    return true;
  });

  const next = () => {
    // Defaults the athlete accepted without touching a control are answers too.
    for (const f of q.fields) {
      if (f.kind === "wheel" && answers[f.key] === undefined)
        setAnswer(f.key, f.initial);
      if (f.kind === "scale" && answers[f.key] === undefined)
        setAnswer(f.key, f.initial);
      if (f.kind === "timePair")
        f.keys.forEach(
          (k, i) => answers[k] === undefined && setAnswer(k, f.initial[i]),
        );
    }
    onNext();
  };

  const hasWheel = q.fields.some(
    (f) => f.kind === "wheel" || f.kind === "timePair",
  );
  const content = (
    <>
      <QuestionHeader
        glyph={q.glyph}
        logo={q.logoHeader}
        section={eyebrow}
        dot={section?.dot}
        title={q.title}
        sub={q.sub}
      />
      {q.fields.map((f, k) => (
        <FieldView key={k} field={f} />
      ))}
    </>
  );

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, space[4]),
        },
      ]}
      testID={`onboarding-${q.id}`}
    >
      <View style={styles.top}>
        <ProgressBar
          segments={q.hideProgress ? [] : progress(flow, index, answers)}
          onBack={onBack}
          onSkip={q.skippable ? onNext : undefined}
        />
      </View>
      {/* Wheels are scrolling lists themselves, and React Native can't nest them in a ScrollView. */}
      {hasWheel ? (
        <View style={[styles.scroll, styles.body]}>{content}</View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      )}
      <NextButton label={q.next ?? "Next"} disabled={!ready} onPress={next} />
      {q.caption ? (
        <Text variant="caption" tone="muted" style={styles.caption}>
          {q.caption}
        </Text>
      ) : null}
    </View>
  );
}

function FieldView({ field: f }: { field: Field }) {
  const { answers, setAnswer } = useOnboarding();

  switch (f.kind) {
    case "single":
      return (
        <OptionList
          options={f.options}
          isSelected={(v) => answers[f.key] === v}
          onPress={(v) => setAnswer(f.key, v)}
        />
      );

    case "wheel":
      return <WheelField field={f} />;

    case "bodyFat":
      return (
        <BodyFatPicker
          sex={answers[f.sexKey]}
          value={answers[f.key]}
          onChange={(v) => setAnswer(f.key, v)}
        />
      );

    case "timePair":
      return (
        <View style={styles.pair}>
          {f.keys.map((key, i) => (
            <TimeCard key={key} label={f.labels[i]}>
              <Wheel
                small
                rows={3}
                values={i === 0 ? bedTimes : wakeTimes}
                value={(answers[key] as number | undefined) ?? f.initial[i]}
                onChange={(v) => setAnswer(key, v)}
              />
            </TimeCard>
          ))}
        </View>
      );

    case "scale":
      return (
        <View style={styles.field}>
          {f.label ? <FieldLabel>{f.label}</FieldLabel> : null}
          <Segmented
            stretch
            tall
            options={f.options}
            value={(answers[f.key] as string | undefined) ?? f.initial}
            onChange={(v) => setAnswer(f.key, v)}
          />
          {f.ends ? <ScaleEnds ends={f.ends} /> : null}
        </View>
      );

    case "chips": {
      if (f.showIf && answers[f.showIf.key] !== f.showIf.equals) return null;
      const on = (answers[f.key] as string[] | undefined) ?? f.initial ?? [];
      const toggle = (o: string) => {
        if (f.exclusive === "*")
          return setAnswer(f.key, on.includes(o) ? [] : [o]);
        if (on.includes(o))
          return setAnswer(
            f.key,
            on.filter((x) => x !== o),
          );
        if (o === f.exclusive) return setAnswer(f.key, [o]);
        if (f.max && on.length >= f.max) return; // "Pick up to 3": a fourth tap doesn't silently drop one.
        setAnswer(f.key, [...on.filter((x) => x !== f.exclusive), o]);
      };
      return (
        <View style={styles.field}>
          {f.label ? <FieldLabel>{f.label}</FieldLabel> : null}
          <Tokens
            options={f.options}
            isOn={(o) => on.includes(o)}
            onPress={toggle}
          />
          {f.max ? (
            <Text variant="caption" tone="muted">
              {on.length >= f.max
                ? `${on.length} of ${f.max} picked. Tap one to swap it.`
                : `${on.length} of ${f.max} picked`}
            </Text>
          ) : null}
        </View>
      );
    }

    case "days": {
      const on = (answers[f.key] as number[] | undefined) ?? [];
      const perWeek = Number(answers.daysPerWeek ?? 4);
      return (
        <View style={styles.field}>
          <Text variant="label">
            {f.label}{" "}
            <Text variant="label" weight="regular" tone="muted">
              (optional)
            </Text>
          </Text>
          <DayPicker
            selected={on}
            onToggle={(d) =>
              setAnswer(
                f.key,
                on.includes(d) ? on.filter((x) => x !== d) : [...on, d],
              )
            }
          />
          {on.length > 0 ? (
            <Text variant="caption" tone="muted">
              {on.length > perWeek
                ? `${on.length} days picked; you said ${perWeek} a week. That's fine, we'll remind you on these.`
                : `${on.length} of ${perWeek} picked.`}
            </Text>
          ) : null}
        </View>
      );
    }

    case "text":
      return (
        <NoteInput
          label={f.label}
          placeholder={f.placeholder}
          value={(answers[f.key] as string | undefined) ?? ""}
          onChange={(v) => setAnswer(f.key, v)}
          // The injury note is the only text field without a kind of its own, and it's a note.
          multiline={f.multiline ?? f.key === "injuryNote"}
          maxLength={f.maxLength}
          keyboard={f.keyboard}
        />
      );

    case "features":
      return (
        <View style={styles.features}>
          {f.items.map(({ icon: Icon, title, sub }) => (
            <View key={title} style={styles.feature}>
              <Icon size={28} strokeWidth={1.6} color={colors.text} />
              <View style={styles.featureText}>
                <Text weight="semibold">{title}</Text>
                <Text variant="label" weight="regular" tone="muted">
                  {sub}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );

    case "agree": {
      const on = answers[f.key] === true;
      const box = (
        <PressableScale
          onPress={() => setAnswer(f.key, !on)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: on }}
          style={styles.agree}
        >
          <Text weight="medium" style={styles.flex}>
            {f.label}
          </Text>
          <View style={[styles.tick, on && styles.tickOn]}>
            {on ? (
              <Check size={16} strokeWidth={3} color={colors.onBrand} />
            ) : null}
          </View>
        </PressableScale>
      );
      return f.links ? (
        <View style={styles.agreeWrap}>
          {box}
          <PolicyLinks />
        </View>
      ) : (
        box
      );
    }

    case "photo": {
      const uri = answers[f.key] as string | undefined;
      return (
        <PressableScale
          onPress={() => choosePhoto((u) => setAnswer(f.key, u))}
          accessibilityRole="button"
          accessibilityLabel={
            uri ? "Change profile photo" : "Add a profile photo"
          }
          style={styles.photoRow}
        >
          <View style={styles.photo}>
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.photoImage}
                contentFit="cover"
                accessible={false}
              />
            ) : (
              <Camera size={28} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.flex}>
            <Text weight="semibold">
              {uri ? "Change photo" : "Add a photo"}
            </Text>
            <Text variant="label" weight="regular" tone="muted">
              Optional. A clear face photo builds trust on WhatsApp previews.
            </Text>
          </View>
        </PressableScale>
      );
    }

    case "services":
      return <ServicesField storeKey={f.key} />;

    case "sheet":
      if (answers[f.showIf.key] !== f.showIf.equals) return null;
      return <SheetField storeKey={f.key} />;

    case "invite":
      return (
        <InviteField name={(answers[f.nameKey] as string | undefined) ?? ""} />
      );

    case "note":
      return <SafetyNote text={f.text} />;

    case "label":
      return <FieldLabel>{f.text}</FieldLabel>;

    case "mealPreview": {
      const n = String(answers[f.from] ?? "3");
      const slots = MEAL_SLOTS[n] ?? MEAL_SLOTS["3"];
      return (
        <View style={styles.mealCard}>
          <View style={styles.mealHead}>
            <View style={styles.mealDot} />
            <Text variant="eyebrow" tone="muted">
              Your food log
            </Text>
          </View>
          {slots.map(([meal, time], k) => (
            <View
              key={meal}
              style={[styles.mealRow, k > 0 && styles.mealRowLine]}
            >
              <Text tone="muted">{meal}</Text>
              <Text weight="medium" numeric>
                {time}
              </Text>
            </View>
          ))}
        </View>
      );
    }
  }
}

function WheelField({
  field: f,
}: {
  field: Extract<Field, { kind: "wheel" }>;
}) {
  const { answers, setAnswer } = useOnboarding();
  const [alt, setAlt] = useState(false);
  const value = (answers[f.key] as number | undefined) ?? f.initial;
  const values = alt && f.alt ? f.alt.values : f.values;

  let delta: string | null = null;
  if (f.deltaFrom) {
    const from = answers[f.deltaFrom] as number | undefined;
    if (from !== undefined) {
      const diff = +(value - from).toFixed(1);
      delta =
        diff === 0
          ? "Same as now"
          : diff < 0
            ? `${Math.abs(diff).toFixed(1)} kg to go · about 0.4 kg a week`
            : `${diff.toFixed(1)} kg to gain · about 0.25 kg a week`;
    }
  }

  return (
    <View style={styles.wheelField}>
      {f.alt ? (
        <Segmented
          options={[f.unit, f.alt.label]}
          value={alt ? f.alt.label : f.unit}
          onChange={(o) => setAlt(o !== f.unit)}
        />
      ) : f.laterUnit ? (
        <Segmented
          options={[f.unit, f.laterUnit]}
          value={f.unit}
          disabled={[f.laterUnit]}
          onChange={() => {}}
        />
      ) : null}
      {delta ? (
        <View style={styles.delta}>
          {delta.includes("gain") ? (
            <TrendingUp size={16} color={colors.textMuted} />
          ) : (
            <TrendingDown size={16} color={colors.textMuted} />
          )}
          <Text variant="label" weight="regular" tone="muted" numeric>
            {delta}
          </Text>
        </View>
      ) : null}
      <View style={styles.wheelBox}>
        <Wheel
          values={values}
          value={value}
          onChange={(v) => setAnswer(f.key, v)}
          unit={alt ? undefined : f.unit}
          rows={f.rows ?? 5}
        />
      </View>
    </View>
  );
}

function NoteInput({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  maxLength,
  keyboard = "default",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
  keyboard?: "default" | "number-pad";
}) {
  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboard}
        style={[styles.input, multiline && styles.textarea]}
        accessibilityLabel={label}
      />
      {multiline && maxLength ? (
        <Text variant="caption" tone="muted" numeric>
          {value.length} / {maxLength}
        </Text>
      ) : null}
    </View>
  );
}

// ---------- Coach services (CO-09): display only, coaches bill clients themselves ----------

type Service = { name: string; price: string; includes: string };

function ServicesField({ storeKey }: { storeKey: string }) {
  const { answers, setAnswer } = useOnboarding();
  const list = (answers[storeKey] as Service[] | undefined) ?? [
    { name: "", price: "", includes: "" },
  ];
  const update = (k: number, patch: Partial<Service>) =>
    setAnswer(
      storeKey,
      list.map((s, i) => (i === k ? { ...s, ...patch } : s)),
    );
  return (
    <View style={styles.field}>
      {list.map((svc, k) => (
        <View key={k} style={styles.service}>
          <View style={styles.serviceHead}>
            <TextInput
              value={svc.name}
              onChangeText={(v) => update(k, { name: v })}
              placeholder="e.g. 12-week fat loss"
              placeholderTextColor={colors.textMuted}
              style={[styles.serviceText, styles.flex]}
              accessibilityLabel={`Service ${k + 1} name`}
            />
            {list.length > 1 ? (
              <PressableScale
                onPress={() =>
                  setAnswer(
                    storeKey,
                    list.filter((_, i) => i !== k),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Remove service"
                style={styles.remove}
              >
                <Trash2 size={18} color={colors.textMuted} />
              </PressableScale>
            ) : null}
          </View>
          <TextInput
            value={svc.price}
            onChangeText={(v) => update(k, { price: v })}
            placeholder="Price, e.g. ₹4,500 / month (optional)"
            placeholderTextColor={colors.textMuted}
            style={styles.serviceSub}
            accessibilityLabel={`Service ${k + 1} price`}
          />
          <TextInput
            value={svc.includes}
            onChangeText={(v) => update(k, { includes: v })}
            placeholder="What's included, e.g. training + meal plan · weekly check-ins"
            placeholderTextColor={colors.textMuted}
            style={styles.serviceSub}
            multiline
            accessibilityLabel={`Service ${k + 1} details`}
          />
        </View>
      ))}
      <PressableScale
        onPress={() =>
          setAnswer(storeKey, [...list, { name: "", price: "", includes: "" }])
        }
        accessibilityRole="button"
        style={styles.addService}
      >
        <Plus size={20} color={colors.text} />
        <Text weight="semibold">Add a service</Text>
      </PressableScale>
    </View>
  );
}

// ---------- Coach spreadsheet (CO-10, D55): the workouts coaches already keep in Excel or Sheets ----------

const fileSize = (bytes?: number) =>
  bytes === undefined
    ? ""
    : bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function SheetField({ storeKey }: { storeKey: string }) {
  const { answers, setAnswer } = useOnboarding();
  const file = answers[storeKey] as PickedSheet | undefined;
  const [busy, setBusy] = useState(false);
  // Read on the phone into a draft template; nothing leaves the device. The coach checks the
  // draft before saving it (app/coach/template/import.tsx).
  const pick = async () => {
    setBusy(true);
    const picked = await pickSheet();
    setBusy(false);
    if (picked) setAnswer(storeKey, picked);
  };
  const unmatched = file?.draft?.unmatched.length ?? 0;
  const status = file?.error
    ? file.error
    : file?.draft
      ? [
          importSummary(file.draft),
          unmatched ? `${unmatched} to check` : "Ready to copy",
        ].join(" · ")
      : fileSize(file?.size);

  return (
    <View style={styles.field}>
      {file ? (
        <View style={styles.sheetFile}>
          <FileSpreadsheet size={28} strokeWidth={1.6} color={colors.text} />
          <View style={styles.flex}>
            <Text weight="semibold" numberOfLines={1}>
              {file.name}
            </Text>
            <Text
              variant="label"
              weight="regular"
              tone={file.error ? "danger" : "muted"}
            >
              {status}
            </Text>
          </View>
          <PressableScale
            onPress={pick}
            accessibilityRole="button"
            accessibilityLabel="Choose a different file"
            style={styles.sheetAction}
          >
            <Text variant="label">Replace</Text>
          </PressableScale>
          <PressableScale
            onPress={() => setAnswer(storeKey, undefined)}
            accessibilityRole="button"
            accessibilityLabel="Remove file"
            style={styles.remove}
          >
            <X size={18} color={colors.textMuted} />
          </PressableScale>
        </View>
      ) : (
        <PressableScale
          onPress={pick}
          accessibilityRole="button"
          accessibilityLabel="Choose your spreadsheet"
          style={styles.sheetPick}
        >
          <FileUp size={28} strokeWidth={1.6} color={colors.text} />
          <Text weight="semibold">
            {busy ? "Reading…" : "Choose your spreadsheet"}
          </Text>
          <Text variant="label" weight="regular" tone="muted">
            Excel (.xlsx) or CSV
          </Text>
        </PressableScale>
      )}
      <Text variant="caption" tone="muted">
        One row per exercise: day, exercise, sets and reps. You check the draft
        template before any client sees it. Google Sheets: download it as .xlsx
        or .csv first. File on your laptop? Skip and import it later from Plans.
      </Text>
    </View>
  );
}

// ---------- Coach invite (CO-11): one personal link, shared where coaches already talk ----------

function InviteField({ name }: { name: string }) {
  const { answers, setAnswer } = useOnboarding();
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const [qr, setQr] = useState(false);
  // Placeholder link until the invite-link domain is chosen (PLAN.md); the server issues the real one.
  const slug =
    name
      .toLowerCase()
      .replace(/^coach\s+/, "")
      .replace(/[^a-z0-9]+/g, "") || "yourname";
  const link = `arcwell.app/j/${slug}`;
  const url = `https://${link}`;
  const message =
    (answers.inviteMessage as string | undefined) ??
    `Hi! I'm moving our coaching to Arcwell: your plans, check-ins and chat in one app. Join here: ${link}`;
  const sms =
    Platform.OS === "ios"
      ? `sms:&body=${encodeURIComponent(message)}`
      : `sms:?body=${encodeURIComponent(message)}`;
  const more = () => Share.share({ message });
  const share = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      a11y: "Share on WhatsApp",
      run: () =>
        Linking.openURL(
          `whatsapp://send?text=${encodeURIComponent(message)}`,
        ).catch(more),
    },
    {
      // Instagram can't take a ready message: copy it, open the app to paste it in a DM or the bio.
      icon: Camera,
      label: "Instagram",
      a11y: "Share on Instagram",
      run: async () => {
        await Clipboard.setStringAsync(message).catch(() => undefined);
        setCopied("message");
        await Linking.openURL("instagram://app").catch(more);
      },
    },
    {
      icon: MessageSquare,
      label: "SMS",
      a11y: "Share by SMS",
      run: () => Linking.openURL(sms).catch(more),
    },
    {
      icon: Copy,
      label: copied === "link" ? "Copied" : "Copy link",
      a11y: "Copy link",
      run: async () => {
        await Clipboard.setStringAsync(url).catch(() => undefined);
        setCopied("link");
      },
    },
    {
      icon: QrCode,
      label: "QR code",
      a11y: qr ? "Hide QR code" : "Show QR code",
      run: () => setQr((v) => !v),
    },
    { icon: Share2, label: "More", a11y: "More ways to share", run: more },
  ];
  return (
    <View style={styles.inviteBlock}>
      <View style={styles.linkRow}>
        <Text weight="medium" style={styles.flex} numberOfLines={1}>
          {link}
        </Text>
      </View>
      <View style={styles.shareRow}>
        {share.map(({ icon: Icon, label, a11y, run }) => (
          <PressableScale
            key={a11y}
            onPress={run}
            accessibilityRole="button"
            accessibilityLabel={a11y}
            style={styles.shareItem}
          >
            <View
              style={[
                styles.shareIcon,
                Icon === QrCode && qr && styles.shareOn,
              ]}
            >
              <Icon size={20} color={colors.text} />
            </View>
            <Text variant="caption" tone="muted">
              {label}
            </Text>
          </PressableScale>
        ))}
      </View>
      {copied === "message" ? (
        <Text variant="caption" tone="muted" accessibilityLiveRegion="polite">
          Message copied. Paste it in a DM or your bio.
        </Text>
      ) : null}
      {qr ? (
        <View style={styles.qrBox}>
          <View
            style={styles.qr}
            accessibilityLabel="QR code for your invite link"
          >
            <QRCode
              value={url}
              size={168}
              color={colors.text}
              backgroundColor={colors.surface}
            />
          </View>
          <Text variant="caption" tone="muted">
            Clients scan this at the gym to join you.
          </Text>
        </View>
      ) : null}
      <NoteInput
        label="Message (edit if you like)"
        placeholder=""
        value={message}
        onChange={(v) => setAnswer("inviteMessage", v)}
        multiline
      />
    </View>
  );
}

// Meal slots the food log starts with (AO-17); the athlete can rename or move them later.
const MEAL_SLOTS: Record<string, [string, string][]> = {
  "2": [
    ["Lunch", "1:30 pm"],
    ["Dinner", "8:30 pm"],
  ],
  "3": [
    ["Breakfast", "8:00 am"],
    ["Lunch", "1:30 pm"],
    ["Dinner", "8:30 pm"],
  ],
  "4": [
    ["Breakfast", "8:00 am"],
    ["Lunch", "1:30 pm"],
    ["Evening snack", "5:30 pm"],
    ["Dinner", "9:00 pm"],
  ],
  "5+": [
    ["Breakfast", "8:00 am"],
    ["Morning snack", "11:00 am"],
    ["Lunch", "1:30 pm"],
    ["Evening snack", "5:30 pm"],
    ["Dinner", "9:00 pm"],
  ],
};

// Bed and wake times in 30-minute steps (shown on AO-13).
const clock = (minutes: number) => {
  const h24 = Math.floor(minutes / 60) % 24;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(minutes % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
};
const steps = (from: number, to: number) =>
  Array.from({ length: (to - from) / 30 + 1 }, (_, k) => ({
    label: clock(from + k * 30),
    value: from + k * 30,
  }));
const bedTimes = steps(20 * 60, 26 * 60);
const wakeTimes = steps(4 * 60, 10 * 60);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: space[1] },
  scroll: { flex: 1 },
  body: {
    gap: space[4],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
    paddingBottom: space[4],
  },
  field: { gap: space[2] },
  wheelField: { alignItems: "center", gap: space[3], paddingTop: space[2] },
  wheelBox: { alignSelf: "stretch" },
  delta: { flexDirection: "row", alignItems: "center", gap: space[1] },
  pair: { flexDirection: "row", gap: space[3] },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[1],
  },
  mealHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingBottom: space[1],
  },
  mealDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.nutrition,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: space[3],
  },
  mealRowLine: { borderTopWidth: 1, borderTopColor: colors.border },
  input: {
    minHeight: 48,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  textarea: { minHeight: 52, fontSize: textSizes.sm, textAlignVertical: "top" },
  caption: { textAlign: "center", paddingTop: space[2] },
  flex: { flex: 1 },
  features: { gap: space[4], paddingTop: space[1] },
  feature: { flexDirection: "row", alignItems: "flex-start", gap: space[4] },
  featureText: { flex: 1, gap: space[1] / 2 },
  agreeWrap: { gap: space[2] },
  agree: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 52,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  tick: {
    width: 24,
    height: 24,
    borderRadius: radius.sm - space[1] / 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  tickOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  photoRow: { flexDirection: "row", alignItems: "center", gap: space[4] },
  photo: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: { width: "100%", height: "100%" },
  service: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  serviceHead: { flexDirection: "row", alignItems: "center", gap: space[2] },
  serviceText: {
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.base,
    color: colors.text,
    paddingVertical: space[1],
  },
  serviceSub: {
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.sm,
    color: colors.text,
    paddingVertical: space[1],
  },
  remove: { padding: space[2] },
  addService: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  sheetPick: {
    alignItems: "center",
    gap: space[1],
    paddingVertical: space[6],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  sheetFile: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 64,
    paddingLeft: space[4],
    paddingRight: space[1],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  sheetAction: { paddingHorizontal: space[2], paddingVertical: space[2] },
  inviteBlock: { gap: space[4] },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  shareRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: space[3],
  },
  shareItem: { alignItems: "center", gap: space[1], minWidth: 56 },
  shareOn: { borderWidth: 1, borderColor: colors.borderStrong },
  qrBox: { alignItems: "center", gap: space[2] },
  qr: {
    padding: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
