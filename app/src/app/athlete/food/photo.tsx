// Scan a meal (F5-09 to F5-11; D70, D94): a full-screen camera with a shutter and the gallery, then
// "Analysing…" over the photo, then the result: the plate's calories and macros and each food found,
// which the athlete ticks and adjusts. Nothing is logged until they tap Log. Plus only; coached
// athletes never see AI (D44). With accounts on, the photo goes to the scan-meal edge function (D96);
// sample builds show the sample plate, labelled as such.
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  Camera,
  Check,
  Images,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  IconButton,
  NumberStepper,
  PressableScale,
  Text,
} from "@/components/primitives";
import {
  type ScanFailure,
  type ScanItem,
  scanMeal,
} from "@/features/ai/scanMeal";
import { todayKey, useNutrition } from "@/features/athlete/FoodParts";
import {
  findFood,
  type FoodLog,
  type MealSlot,
  slotLabel,
  sumMacros,
} from "@/features/athlete/foods";
import { macroColor, type MacroKey } from "@/features/athlete/NutritionParts";
import { NotJoined } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { uid } from "@/features/coach/plans";
import { colors, radius, rhythm, space } from "@/theme";

type Step = "camera" | "analysing" | "result";

const FAILURE: Record<ScanFailure, string> = {
  not_food: "That doesn't look like food. Try again with the plate in frame.",
  daily_limit: "You've used today's scans. Search or quick add instead.",
  not_entitled: "Meal scans come with Arcwell Plus.",
  too_large: "Photo too large. Try again a little further away.",
  error: "Couldn't read that one. Try again in good light.",
};

/** Long side of the photo sent to the scan: plenty to read a plate, a fraction of the upload. */
const SCAN_SIDE = 1024;

/** The photo shrunk to SCAN_SIDE on its long side and saved as JPEG, with its base64. */
async function shrinkPhoto(uri: string, width?: number, height?: number) {
  const wide = (width ?? 0) >= (height ?? 0);
  const long = Math.max(width ?? 0, height ?? 0);
  const ctx = ImageManipulator.manipulate(uri);
  if (!long || long > SCAN_SIDE)
    ctx.resize(wide ? { width: SCAN_SIDE } : { height: SCAN_SIDE });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return { uri: out.uri, base64: out.base64, mime: "image/jpeg" };
}

export default function ScanMeal() {
  const p = useLocalSearchParams<{ meal?: MealSlot; date?: string }>();
  const n = useNutrition();
  const insets = useSafeAreaInsets();
  const { addFoodLogs, myFoods } = useCoachData();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [step, setStep] = useState<Step>("camera");
  const [shot, setShot] = useState<{
    uri: string;
    base64?: string;
    mime?: string;
  } | null>(null);
  const [items, setItems] = useState<
    (ScanItem & { keep: boolean; qty: number })[]
  >([]);
  const [sample, setSample] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);
  const meal: MealSlot = p.meal ?? "lunch";
  const date = p.date || todayKey();
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/athlete/nutrition");

  // Analyse: the server scans the photo (or the sample plate in sample builds).
  useEffect(() => {
    if (step !== "analysing") return;
    let live = true;
    scanMeal(shot, p.meal ?? "lunch")
      .then((out) => {
        if (!live) return;
        if (out.status === "ok") {
          setItems(out.items.map((x) => ({ ...x, keep: true, qty: 1 })));
          setSample(out.sample);
          setStep("result");
        } else {
          setFailure(FAILURE[out.status]);
          setStep("camera");
        }
      })
      .catch(() => {
        if (!live) return;
        setFailure(FAILURE.error);
        setStep("camera");
      });
    return () => {
      live = false;
    };
  }, [step, shot, p.meal]);

  if (!n.me) return <NotJoined />;
  // Photo logging is AI: Plus only; coached athletes never see it, even from a link (D44).
  if (n.tier !== "pro") return <Redirect href="/athlete" />;
  const me = n.me;

  // The full photo never leaves the phone: it's shrunk and compressed before the scan.
  const prepare = async (uri: string, width?: number, height?: number) => {
    const small = await shrinkPhoto(uri, width, height).catch(() => null);
    if (small?.base64) {
      setFailure(null);
      setShot(small);
    } else setFailure(FAILURE.error);
  };
  const capture = async () => {
    const pic = await camera.current
      ?.takePictureAsync({ quality: 0.8 })
      .catch(() => undefined);
    if (pic?.uri) await prepare(pic.uri, pic.width, pic.height);
  };
  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    }).catch(() => null);
    const a = r?.assets?.[0];
    if (a?.uri) await prepare(a.uri, a.width, a.height);
  };
  const again = () => {
    setShot(null);
    setItems([]);
    setFailure(null);
    setStep("camera");
  };

  const top = { paddingTop: insets.top + space[2] };
  const bottom = { paddingBottom: Math.max(insets.bottom, space[4]) };
  const closeButton = (
    <IconButton
      icon={X}
      variant="glass"
      accessibilityLabel="Close"
      onPress={close}
    />
  );

  // ---------- Camera ----------
  if (step === "camera") {
    const granted = !!permission?.granted;
    return (
      <View style={styles.dark}>
        <View style={styles.flex1}>
          {shot ? (
            <Image
              source={{ uri: shot.uri }}
              style={styles.flex1}
              contentFit="cover"
            />
          ) : granted ? (
            <CameraView ref={camera} style={styles.flex1} facing="back" />
          ) : (
            <View style={styles.ask}>
              <View style={styles.askIcon}>
                <Camera size={30} color={colors.text} />
              </View>
              <Text variant="title" style={styles.center}>
                Camera access
              </Text>
              <Text tone="muted" style={styles.center}>
                To read your meal from a photo.
              </Text>
              <Button
                label={
                  permission && !permission.canAskAgain
                    ? "Open settings"
                    : "Allow camera"
                }
                onPress={() =>
                  permission && !permission.canAskAgain
                    ? Linking.openSettings()
                    : requestPermission()
                }
              />
              <Button
                label="Choose from gallery"
                variant="ghost"
                onPress={pick}
              />
              {/* Sample build: try the flow without a camera (no AI yet anyway). */}
              <Button
                label="Try a sample plate"
                variant="ghost"
                onPress={() => setStep("analysing")}
              />
            </View>
          )}
        </View>
        <View style={[styles.topBar, top]}>{closeButton}</View>
        <View style={[styles.controls, bottom]}>
          {failure ? (
            <Text tone="warning" style={styles.center}>
              {failure}
            </Text>
          ) : null}
          {shot ? (
            <View style={styles.row}>
              <IconButton
                icon={RotateCcw}
                variant="glass"
                accessibilityLabel="Retake"
                onPress={() => setShot(null)}
              />
              <View style={styles.flex1}>
                <Button
                  label="Analyse the food"
                  icon={Sparkles}
                  fullWidth
                  onPress={() => setStep("analysing")}
                />
              </View>
            </View>
          ) : granted ? (
            <>
              <Text tone="muted" style={styles.center}>
                Fit the whole plate in the frame
              </Text>
              <View style={styles.shutterRow}>
                <View style={styles.side}>
                  <IconButton
                    icon={Images}
                    variant="glass"
                    accessibilityLabel="Choose from gallery"
                    onPress={pick}
                  />
                </View>
                <PressableScale
                  onPress={capture}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  style={styles.shutter}
                >
                  <View style={styles.shutterDot} />
                </PressableScale>
                <View style={styles.side} />
              </View>
            </>
          ) : null}
        </View>
      </View>
    );
  }

  // ---------- Analysing ----------
  if (step === "analysing")
    return (
      <View style={[styles.dark, top, bottom]}>
        <View style={styles.topBarStatic}>{closeButton}</View>
        {shot ? (
          <Image
            source={{ uri: shot.uri }}
            style={styles.photo}
            contentFit="cover"
          />
        ) : null}
        <View style={styles.middle}>
          <ActivityIndicator color={colors.accent} />
          <Text variant="heading">Analysing your meal…</Text>
          <Text tone="muted">This takes a few seconds.</Text>
        </View>
      </View>
    );

  // ---------- Result ----------
  const kept = items.filter((x) => x.keep);
  // Each kept food becomes a log at the scanned portion times the stepper (D96).
  const logs: FoodLog[] = kept.map((x) => {
    const k = x.qty;
    const r = (v: number) => Math.round(v * 10) / 10;
    return {
      id: uid("f"),
      date,
      meal,
      ...(x.foodId ? { foodId: x.foodId } : {}),
      name: x.name,
      qty: x.unit === "g" ? Math.round(x.grams * k) : k,
      unit: x.unit,
      grams: Math.round(x.grams * k),
      source: x.foodId
        ? (findFood(x.foodId, myFoods)?.source ?? "quick")
        : "quick",
      macros: {
        kcal: Math.round(x.macros.kcal * k),
        p: r(x.macros.p * k),
        c: r(x.macros.c * k),
        f: r(x.macros.f * k),
      },
      ...(shot ? { photoUri: shot.uri } : {}),
    };
  });
  const total = sumMacros(logs.map((l) => l.macros));
  const macroTiles: [MacroKey, string, number][] = [
    ["protein", "Protein", total.p],
    ["carbs", "Carbs", total.c],
    ["fat", "Fat", total.f],
  ];

  return (
    <View style={[styles.dark, top]}>
      <View style={styles.topBarStatic}>
        {closeButton}
        <Text variant="label" tone="muted" style={styles.flex1}>
          {sample ? `${slotLabel(meal)} · sample result` : slotLabel(meal)}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {shot ? (
          <Image
            source={{ uri: shot.uri }}
            style={styles.photo}
            contentFit="cover"
          />
        ) : null}
        <Text variant="title" style={styles.center}>
          Your plate
        </Text>
        <Text style={styles.kcal} numeric>
          {Math.round(total.kcal).toLocaleString("en-IN")}
          <Text variant="heading" tone="muted">
            {" kcal"}
          </Text>
        </Text>
        {n.macros ? (
          <View style={[styles.row, styles.pad]}>
            {macroTiles.map(([k, label, g]) => (
              <View key={k} style={styles.macroTile}>
                <View
                  style={[styles.macroDot, { backgroundColor: macroColor(k) }]}
                />
                <Text weight="bold" numeric>
                  {`${Math.round(g)}g`}
                </Text>
                <Text variant="caption" tone="muted">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.list}>
          {items.map((x, i) => {
            return (
              <View key={x.key} style={[styles.food, i > 0 && styles.line]}>
                <PressableScale
                  onPress={() =>
                    setItems((xs) =>
                      xs.map((y, k) => (k === i ? { ...y, keep: !y.keep } : y)),
                    )
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: x.keep }}
                  accessibilityLabel={x.name}
                  style={[styles.box, x.keep && styles.boxOn]}
                >
                  {x.keep ? (
                    <Check size={14} strokeWidth={3} color={colors.onBrand} />
                  ) : null}
                </PressableScale>
                <View style={styles.flex1}>
                  <Text weight="medium" tone={x.keep ? "default" : "muted"}>
                    {x.name}
                  </Text>
                  <Text
                    variant="caption"
                    tone={x.confidence === "check" ? "warning" : "muted"}
                  >
                    {`${x.confidence === "check" ? "Check this one" : "Looks right"} · ${Math.round(x.grams * x.qty)} g · ${Math.round(x.macros.kcal * x.qty)} kcal`}
                  </Text>
                </View>
                <NumberStepper
                  value={x.qty}
                  onChange={(v) =>
                    setItems((xs) =>
                      xs.map((y, k) => (k === i ? { ...y, qty: v } : y)),
                    )
                  }
                  step={0.5}
                  decimals={1}
                  min={0.5}
                  max={6}
                  accessibilityLabel={`${x.name} portions`}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={[styles.footer, bottom]}>
        <View style={styles.flex1}>
          <Button
            label="Scan another"
            variant="secondary"
            fullWidth
            onPress={again}
          />
        </View>
        <View style={styles.flex1}>
          <Button
            label={`Log ${kept.length} ${kept.length === 1 ? "food" : "foods"}`}
            fullWidth
            disabled={!kept.length}
            onPress={() => {
              addFoodLogs(me.id, logs);
              router.replace({ pathname: "/athlete/nutrition" });
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  center: { textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  pad: { paddingHorizontal: rhythm.gutter },
  topBar: {
    position: "absolute",
    top: 0,
    left: rhythm.gutter,
    right: rhythm.gutter,
  },
  topBarStatic: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingBottom: space[2],
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: rhythm.gutter,
    right: rhythm.gutter,
    gap: space[4],
  },
  shutterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  side: { width: space[12], alignItems: "center" },
  shutter: {
    width: space[12] + space[8],
    height: space[12] + space[8],
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: colors.glassEdge,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterDot: {
    width: space[12] + space[4],
    height: space[12] + space[4],
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  ask: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[3],
    paddingHorizontal: space[8],
  },
  askIcon: {
    width: space[12] + space[6],
    height: space[12] + space[6],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    height: 240,
    marginHorizontal: rhythm.gutter,
    borderRadius: radius.lg,
  },
  middle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
  },
  body: {
    gap: space[3],
    paddingBottom: space[6],
  },
  kcal: {
    textAlign: "center",
    fontSize: 44,
    lineHeight: 52,
    fontWeight: "700",
  },
  macroTile: {
    flex: 1,
    alignItems: "center",
    gap: space[1],
    paddingVertical: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  macroDot: { width: 8, height: 8, borderRadius: radius.full },
  list: {
    marginHorizontal: rhythm.gutter,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  food: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
  },
  line: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  footer: {
    flexDirection: "row",
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
    paddingTop: space[2],
  },
});
