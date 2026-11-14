// Body fat level (onboarding, D84, D87): eight illustrated figures per sex, from lean to high,
// following the usual visual reference levels (men 8–40%, women 12–45%). Drawn here as original
// illustrations, not photos: shoulders, arms, waist and belly change with the level, muscle lines
// fade, and the belly and love handles grow. Tiles fade in one after another; the picked one pops.
import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Ellipse, G, Path } from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import { BODY_FAT_LEVELS, levelLabel } from "@/features/science/bodyFat";
import { colors, radius, space } from "@/theme";
import { figureColors as fc } from "@/theme/figures";

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** One figure, chin to mid-thigh; `t` runs from 0 (leanest) to 1 (highest). */
export function Figure({ t, female }: { t: number; female: boolean }) {
  const C = 50;
  const sh = (female ? 27 : 33) + t * 3; // shoulder half-width
  const neck = (female ? 5 : 6.5) + t * 2;
  const pit = sh - (female ? 7 : 8); // torso half-width under the arms
  const waist = (female ? 13 : 19) + t * (female ? 16 : 17);
  const hip = (female ? 25 : 21) + t * (female ? 13 : 14);
  const belly = 16 * t * t; // sideways spill at the waist
  const drop = 6 * t; // chest and belly sit lower
  const armW = (female ? 7 : 9) + t * 5;
  const R = (dx: number) => C + dx;
  const L = (dx: number) => C - dx;
  const top = 84; // shorts line

  const torso = [
    `M${L(neck)},0 L${R(neck)},0`,
    `L${R(neck)},7 Q${R(sh - 8)},9 ${R(sh - 2)},16`,
    `L${R(pit)},30`,
    `Q${R(waist + belly)},${56 + drop} ${R(waist)},${70 + drop / 2}`,
    `Q${R(hip + belly / 3)},${78 + drop / 2} ${R(hip)},${top + 2}`,
    `L${L(hip)},${top + 2}`,
    `Q${L(hip + belly / 3)},${78 + drop / 2} ${L(waist)},${70 + drop / 2}`,
    `Q${L(waist + belly)},${56 + drop} ${L(pit)},30`,
    `L${L(sh - 2)},16 Q${L(sh - 8)},9 ${L(neck)},7 Z`,
  ].join(" ");

  // Arms hang at the sides; they thicken with the level.
  const arm = (s: 1 | -1) => {
    const x = (dx: number) => C + s * dx;
    // Outside of the arm: pushed out as the waist widens, so the arms stay clear of the body.
    const o = Math.max(sh + 3, waist + belly * 0.7 + armW - 3);
    return [
      `M${x(sh - 6)},14`,
      `Q${x(o + 1)},14 ${x(o)},28`,
      `Q${x(o + 1)},48 ${x(o - 1)},58`,
      `L${x(o - 2)},82`,
      `Q${x(o - armW / 2)},90 ${x(o - armW + 1)},82`,
      `L${x(o - armW)},58`,
      `Q${x(o - armW - 1)},40 ${x(pit + 1)},30 Z`,
    ].join(" ");
  };

  const shorts = [
    `M${L(hip + 1)},${top} L${R(hip + 1)},${top}`,
    `L${R(hip + 3)},116 L${R(2)},116 L${C},104 L${L(2)},116 L${L(hip + 3)},116 Z`,
  ].join(" ");
  const side = (s: 1 | -1) => {
    const x = (dx: number) => C + s * dx;
    return `M${x(pit)},30 Q${x(waist + belly)},${56 + drop} ${x(waist)},${70 + drop / 2} L${x(waist - 4)},${70 + drop / 2} Q${x(waist + belly - 5)},${56 + drop} ${x(pit - 4)},32 Z`;
  };

  const abs = clamp(1 - t * (female ? 3 : 2.6));
  const obliques = clamp(1 - t * 1.8);
  const chestLine = clamp(1 - t * 0.5);

  return (
    <Svg viewBox="-12 0 124 120" width="100%" height="100%">
      <Path d={torso} fill={fc.skin} />
      {/* Sides in shade give the torso some depth. */}
      <Path d={side(1)} fill={fc.skinShade} opacity={0.55} />
      <Path d={side(-1)} fill={fc.skinShade} opacity={0.55} />
      {female ? (
        // Sports top: straps and a shaped band with a dip in the middle.
        <G>
          <Path
            d={`M${L(neck + 2)},6 L${L(pit - 5)},26 M${R(neck + 2)},6 L${R(pit - 5)},26`}
            stroke={fc.top}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Path
            d={`M${L(pit - 1)},26 Q${L(pit * 0.5)},${21 + drop / 2} ${C},${27 + drop / 2} Q${R(pit * 0.5)},${21 + drop / 2} ${R(pit - 1)},26 L${R(pit - 2)},${38 + drop} Q${C},${40 + drop} ${L(pit - 2)},${38 + drop} Z`}
            fill={fc.top}
          />
        </G>
      ) : null}
      <G stroke={fc.line} strokeLinecap="round" fill="none" strokeWidth={1.3}>
        {female ? null : (
          <>
            {/* Chest: firm and square when lean, lower and rounder as fat rises. */}
            <Path
              d={`M${C},22 Q${L(sh - 14)},${34 + drop} ${L(pit - 1)},${36 + drop}`}
              opacity={chestLine}
            />
            <Path
              d={`M${C},22 Q${R(sh - 14)},${34 + drop} ${R(pit - 1)},${36 + drop}`}
              opacity={chestLine}
            />
          </>
        )}
        {abs > 0 ? (
          <G opacity={abs}>
            <Path d={`M${C},${female ? 46 : 40} L${C},74`} />
            {[48, 56, 64].map((y) => (
              <Path key={y} d={`M${L(8)},${y} Q${C},${y + 2} ${R(8)},${y}`} />
            ))}
          </G>
        ) : null}
        {obliques > 0 ? (
          <G opacity={obliques * 0.8}>
            <Path d={`M${L(11)},42 Q${L(13)},60 ${L(9)},78`} />
            <Path d={`M${R(11)},42 Q${R(13)},60 ${R(9)},78`} />
          </G>
        ) : null}
        {t > 0.45 ? (
          // Belly fold over the waistband.
          <Path
            d={`M${L(waist - 3)},${78 + drop / 2} Q${C},${84 + drop} ${R(waist - 3)},${78 + drop / 2}`}
            opacity={clamp((t - 0.45) * 2.5)}
            strokeWidth={1.6}
          />
        ) : null}
      </G>
      <Ellipse
        cx={C}
        cy={70 + drop}
        rx={1.2}
        ry={t > 0.5 ? 1.8 : 1.2}
        fill={fc.line}
      />
      <Path d={shorts} fill={fc.shorts} />
      <Path d={arm(-1)} fill={fc.skinShade} />
      <Path d={arm(1)} fill={fc.skinShade} />
      <Path
        d={`M${L(hip + 1)},${top} L${R(hip + 1)},${top} L${R(hip + 1)},${top + 4} L${L(hip + 1)},${top + 4} Z`}
        fill={fc.shortsShade}
      />
    </Svg>
  );
}

function Tile({
  index,
  label,
  on,
  t,
  female,
  onPress,
}: {
  index: number;
  label: string;
  on: boolean;
  t: number;
  female: boolean;
  onPress: () => void;
}) {
  const pop = useSharedValue(1);
  useEffect(() => {
    if (on) {
      pop.set(1.06);
      pop.set(withSpring(1, { dampingRatio: 0.55, duration: 380 }));
    }
  }, [on, pop]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pop.get() }],
  }));
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 45)
        .duration(260)
        .reduceMotion(ReduceMotion.System)}
      style={[styles.slot, style]}
    >
      <PressableScale
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        accessibilityLabel={`Body fat ${label}`}
        style={[styles.tile, on && styles.tileOn]}
      >
        <View style={styles.art}>
          <Figure t={t} female={female} />
        </View>
        <View style={[styles.chip, on && styles.chipOn]}>
          {on ? (
            <Check size={11} strokeWidth={3} color={colors.onBrand} />
          ) : null}
          <Text
            variant="caption"
            weight="semibold"
            tone={on ? "onBrand" : "default"}
            numeric
          >
            {label}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
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
  const levels = BODY_FAT_LEVELS[female ? "female" : "male"];
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {levels.map((v, i) => (
        <Tile
          key={`${female}-${v}`}
          index={i}
          label={levelLabel(v, i === levels.length - 1)}
          on={value === v}
          t={i / (levels.length - 1)}
          female={female}
          onPress={() => onChange(v)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: space[2],
  },
  slot: { width: "23.5%" },
  tile: {
    aspectRatio: 0.62,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: space[1] + space[1] / 2,
    overflow: "hidden",
  },
  tileOn: { borderColor: colors.accent },
  art: {
    position: "absolute",
    top: space[1],
    left: 0,
    right: 0,
    bottom: space[6] + space[1],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[1] / 2,
    paddingHorizontal: space[2],
    paddingVertical: space[1] / 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  chipOn: { backgroundColor: colors.brand },
});
