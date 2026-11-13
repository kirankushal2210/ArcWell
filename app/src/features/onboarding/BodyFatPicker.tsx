// Body fat level (onboarding, D84): nine drawn torsos from lean to high, with ranges for men and for
// women. A visual estimate, so the answer is the middle of the picked range. Drawn here as simple
// outlines (no photos or third-party art): the waist widens and ab lines fade as the level rises.
import { Check } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import {
  BODY_FAT_BANDS,
  bandLabel,
  bandValue,
} from "@/features/science/bodyFat";
import { colors, radius, space } from "@/theme";

/** One torso; `t` runs from 0 (leanest) to 1 (highest). */
function Torso({ t, female }: { t: number; female: boolean }) {
  const sh = female ? 36 : 42; // shoulder half-width
  const lat = sh - 7 + t * 4; // under the arms
  const waist = (female ? 19 : 22) + t * 19;
  const hip = (female ? 30 : 25) + t * 15;
  const belly = t * t * 14;
  const R = (dx: number) => 50 + dx;
  const L = (dx: number) => 50 - dx;
  // Neck, trapezius, round shoulder, lat, waist, hips; right side down, left side back up.
  const d = [
    `M${R(8)},4 L${R(9)},12`,
    `Q${R(20)},14 ${R(sh - 6)},19`,
    `Q${R(sh + 1)},22 ${R(sh)},32`,
    `Q${R(sh - 1)},36 ${R(lat)},40`,
    `Q${R(waist + belly)},${60 + t * 4} ${R(waist)},76`,
    `Q${R(hip + belly / 2)},86 ${R(hip)},100`,
    `L${L(hip)},100`,
    `Q${L(hip + belly / 2)},86 ${L(waist)},76`,
    `Q${L(waist + belly)},${60 + t * 4} ${L(lat)},40`,
    `Q${L(sh - 1)},36 ${L(sh)},32`,
    `Q${L(sh + 1)},22 ${L(sh - 6)},19`,
    `Q${L(20)},14 ${L(9)},12`,
    `L${L(8)},4 Z`,
  ].join(" ");
  const ink = colors.surface;
  const abs = Math.max(0, 1 - t * 2); // six-pack fades out by the middle levels
  const sag = t * 6;
  return (
    <Svg viewBox="0 0 100 100" width="100%" height="100%">
      <Path d={d} fill={colors.textMuted} />
      {/* Chest: two arcs from the breastbone, lower and softer as fat rises. */}
      <Path
        d={`M50,28 Q${L(sh - 14)},${30 + sag} ${L(sh - 9)},${40 + sag} M50,28 Q${R(sh - 14)},${30 + sag} ${R(sh - 9)},${40 + sag}`}
        stroke={ink}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        opacity={0.35 + 0.65 * (1 - t * 0.6)}
      />
      {abs > 0 ? (
        <Path
          d={[
            "M50,46 L50,86",
            ...[52, 61, 70].map(
              (y) =>
                `M${L(9)},${y} Q${L(4)},${y + 1.5} 50,${y} Q${R(4)},${y + 1.5} ${R(9)},${y}`,
            ),
            `M${L(10)},46 Q${L(12)},64 ${L(8)},84`,
            `M${R(10)},46 Q${R(12)},64 ${R(8)},84`,
          ].join(" ")}
          stroke={ink}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          opacity={abs}
        />
      ) : null}
      {t >= 0.5 ? (
        <>
          {/* Navel and the fold under the belly. */}
          <Path
            d={`M49,${70 + t * 4} Q50,${72 + t * 4} 51,${70 + t * 4}`}
            stroke={ink}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M${L(waist - 2)},${84 + t * 2} Q50,${92 + t * 4} ${R(waist - 2)},${84 + t * 2}`}
            stroke={ink}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
            opacity={t}
          />
        </>
      ) : null}
    </Svg>
  );
}

export function BodyFatPicker({
  sex,
  value,
  onChange,
}: {
  sex: unknown;
  value: unknown;
  onChange: (v: number) => void;
}) {
  const female = sex === "female";
  const bands = BODY_FAT_BANDS[female ? "female" : "male"];
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {bands.map((r, i) => {
        const v = bandValue(r);
        const on = value === v;
        const label = bandLabel(r, i === bands.length - 1);
        return (
          <PressableScale
            key={label}
            onPress={() => onChange(v)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`Body fat ${label}`}
            style={[styles.tile, on && styles.tileOn]}
          >
            <View style={styles.art}>
              <Torso t={i / (bands.length - 1)} female={female} />
            </View>
            <View style={[styles.chip, on && styles.chipOn]}>
              {on ? (
                <Check size={12} strokeWidth={3} color={colors.onBrand} />
              ) : null}
              <Text
                variant="label"
                weight="semibold"
                tone={on ? "onBrand" : "default"}
                numeric
              >
                {label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: space[3],
  },
  tile: {
    width: "31.5%",
    aspectRatio: 0.82,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: space[2],
    overflow: "hidden",
  },
  tileOn: { borderColor: colors.accent },
  art: {
    position: "absolute",
    top: space[1],
    left: space[1],
    right: space[1],
    bottom: space[8] + space[1],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  chipOn: { backgroundColor: colors.brand },
});
