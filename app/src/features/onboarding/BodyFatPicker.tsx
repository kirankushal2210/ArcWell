// Body fat level (onboarding, D84, D87): eight illustrated figures per sex, from lean to high,
// following the usual visual reference levels (men 8–40%, women 12–45%). Original illustrations,
// not photos: shaded for volume, with chest, abs and obliques that fade as the level rises, and a
// waist, love handles and belly that grow and settle over the waistband. Men wear shorts; women a
// sports top and leggings. Tiles fade in one after another; the picked one pops.
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
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { PressableScale, Text } from "@/components/primitives";
import { BODY_FAT_LEVELS, levelLabel } from "@/features/science/bodyFat";
import { colors, radius, space } from "@/theme";
import { figureColors as fc } from "@/theme/figures";

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** The outline sizes for one level: half-widths from the centre line, in a 100 × 150 box. */
export function figureShape(t: number, female: boolean) {
  const f = female;
  return {
    neck: (f ? 5.5 : 7) + t * 2,
    sh: (f ? 24.5 : 30) + t * (f ? 4 : 5), // outside of the shoulders
    pit: (f ? 19 : 23.5) + t * (f ? 4 : 5), // under the arms
    lat: (f ? 16.5 : 21.5) + t * (f ? 8 : 9), // ribs
    waist: (f ? 12.5 : 17) + t * (f ? 16 : 19), // narrowest point
    handle: (f ? 15 : 18.5) + t * (f ? 19 : 22), // love handles above the waistband
    hip: (f ? 23.5 : 19.5) + t * (f ? 13 : 14),
    belly: t * t * (f ? 12 : 18), // how far the belly hangs over the waistband
    armW: (f ? 6.5 : 8.5) + t * (f ? 5 : 6),
    sag: t * (f ? 5 : 9), // chest sits lower and fuller
  };
}

/** One figure, neck to mid-thigh; `t` runs from 0 (leanest) to 1 (highest). */
export function Figure({ t, female }: { t: number; female: boolean }) {
  const s = figureShape(t, female);
  const C = 50;
  const R = (dx: number) => C + dx;
  const L = (dx: number) => C - dx;
  const id = `${female ? "f" : "m"}${Math.round(t * 100)}`;
  const band = female ? 90 : 93; // waistband
  const drop = 4 * t; // the waist and belly settle lower
  const hem = 126; // shorts hem (leggings run off the bottom)

  // Torso, clockwise from the left of the neck: traps, shoulders, ribs, waist, love handles.
  const torso = [
    `M${L(s.neck)},0 L${R(s.neck)},0`,
    `L${R(s.neck)},5 Q${R(s.neck + 7)},8 ${R(s.sh - 6)},11`,
    `Q${R(s.sh)},13 ${R(s.sh)},21`,
    `L${R(s.pit)},31`,
    `Q${R(s.lat + 1)},46 ${R(s.waist)},${66 + drop}`,
    `Q${R(s.handle + 1.5)},${80 + drop} ${R(s.hip)},${band + 2}`,
    `L${L(s.hip)},${band + 2}`,
    `Q${L(s.handle + 1.5)},${80 + drop} ${L(s.waist)},${66 + drop}`,
    `Q${L(s.lat + 1)},46 ${L(s.pit)},31`,
    `L${L(s.sh)},21 Q${L(s.sh)},13 ${L(s.sh - 6)},11`,
    `Q${L(s.neck + 7)},8 ${L(s.neck)},5 Z`,
  ].join(" ");

  // Arms hang at the sides: a round shoulder, biceps, a narrower elbow, forearm, wrist and hand.
  // Lean arms clear the waist; at higher levels they rest against the sides.
  const arm = (k: 1 | -1) => {
    const x = (dx: number) => C + k * dx;
    const w = s.armW;
    const innerE = Math.max(s.pit - 1, s.waist + 3 - t * 7); // inside edge at the elbow
    const outerS = s.sh + 1.8; // outside of the shoulder cap
    const outerE = innerE + w * 0.92;
    return [
      `M${x(s.sh - 7)},11`,
      `Q${x(outerS + 1)},11 ${x(outerS)},24`, // deltoid
      `Q${x(outerS + w * 0.12)},36 ${x(outerE + 0.5)},${54 + drop / 2}`, // biceps
      `L${x(outerE)},60`, // elbow
      `Q${x(outerE + w * 0.12)},70 ${x(outerE - w * 0.1)},86`, // forearm
      `Q${x(outerE - w * 0.15)},${female ? 96 : 97} ${x(innerE + w * 0.45)},${female ? 97 : 98}`, // hand
      `Q${x(innerE + w * 0.05)},${female ? 96 : 97} ${x(innerE + w * 0.12)},86`,
      `Q${x(innerE - w * 0.05)},70 ${x(innerE)},60`,
      `L${x(innerE + 0.5)},${54 + drop / 2}`,
      `Q${x(s.pit - 0.5)},40 ${x(s.pit - 0.5)},30 Z`,
    ].join(" ");
  };

  // Shorts (men) or leggings (women).
  const bottoms = female
    ? [
        `M${L(s.hip + 0.5)},${band} L${R(s.hip + 0.5)},${band}`,
        `Q${R(s.hip + 2.5)},${band + 20} ${R(s.hip - 4 + t * 2)},150`,
        `L${R(2)},150 L${C},${band + 36}`,
        `L${L(2)},150 L${L(s.hip - 4 + t * 2)},150`,
        `Q${L(s.hip + 2.5)},${band + 20} ${L(s.hip + 0.5)},${band} Z`,
      ].join(" ")
    : [
        `M${L(s.hip + 1)},${band} L${R(s.hip + 1)},${band}`,
        `L${R(s.hip + 3.5)},${hem} L${R(1.5)},${hem} L${C},${band + 18}`,
        `L${L(1.5)},${hem} L${L(s.hip + 3.5)},${hem} Z`,
      ].join(" ");
  const thighs = female
    ? []
    : [-1, 1].map((k) => {
        const x = (dx: number) => C + k * dx;
        const o = s.hip + 2;
        return `M${x(o)},${hem - 1} Q${x(o + 0.5)},138 ${x(o - 1.5)},150 L${x(3)},150 Q${x(2.5)},138 ${x(2.5)},${hem - 1} Z`;
      });

  const abs = clamp(1 - t * (female ? 3.4 : 2.9));
  const lines = clamp(1 - t * 1.6); // centre line and obliques last a little longer
  const chest = clamp(1 - t * 0.5);

  // Men's chest, one side: square and lifted when lean, rounder and lower as the level rises.
  const pec = (k: 1 | -1) => {
    const x = (dx: number) => C + k * dx;
    const low = 37 + s.sag;
    const out = s.pit - 1;
    return [
      `M${x(0.8)},17`,
      `Q${x(out * 0.6)},15 ${x(out)},22`,
      `Q${x(out + 1)},${29 + s.sag * 0.6} ${x(out - 2 - t * 2)},${low - 2}`,
      `Q${x(out * 0.55)},${low + 2 + t * 3} ${x(0.8)},${low - 3 + t}`,
      "Z",
    ].join(" ");
  };
  const pecLow = (k: 1 | -1) => {
    const x = (dx: number) => C + k * dx;
    const low = 37 + s.sag;
    const out = s.pit - 1;
    return `M${x(out - 2 - t * 2)},${low - 2} Q${x(out * 0.55)},${low + 2 + t * 3} ${x(0.8)},${low - 3 + t}`;
  };
  // Shaded blocks of a six-pack (men 3 rows, women 2), with the lit centre of each block.
  const blocks = (female ? [47, 56] : [42, 51, 60]).flatMap((y) =>
    [-1, 1].map((k) => {
      const x = (dx: number) => C + k * dx;
      return `M${x(1.2)},${y} Q${x(4.5)},${y - 0.6} ${x(8)},${y + 0.4} L${x(7.5)},${y + 7.2} Q${x(4.5)},${y + 8} ${x(1.2)},${y + 7.4} Z`;
    }),
  );

  return (
    <Svg viewBox="-8 0 116 150" width="100%" height="100%">
      <Defs>
        <LinearGradient id={`skin${id}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={fc.skinDeep} />
          <Stop offset="0.2" stopColor={fc.skin} />
          <Stop offset="0.5" stopColor={fc.skinLight} />
          <Stop offset="0.8" stopColor={fc.skin} />
          <Stop offset="1" stopColor={fc.skinDeep} />
        </LinearGradient>
        <LinearGradient id={`arm${id}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={fc.skinDeep} />
          <Stop offset="0.45" stopColor={fc.skin} />
          <Stop offset="1" stopColor={fc.skinShade} />
        </LinearGradient>
        <LinearGradient id={`pec${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={fc.skinLight} stopOpacity={0.55} />
          <Stop offset="0.7" stopColor={fc.skin} stopOpacity={0} />
          <Stop offset="1" stopColor={fc.skinDeep} stopOpacity={0.55} />
        </LinearGradient>
        <RadialGradient id={`belly${id}`} cx="0.5" cy="0.4" r="0.5">
          <Stop offset="0" stopColor={fc.skinLight} stopOpacity={0.95} />
          <Stop offset="1" stopColor={fc.skinLight} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Path d={torso} fill={`url(#skin${id})`} />

      {/* Belly: a soft round sheen that grows and settles lower with the level. */}
      {t > 0.2 ? (
        <Ellipse
          cx={C}
          cy={74 + drop * 1.5}
          rx={s.waist * 0.9}
          ry={13 + 9 * t}
          fill={`url(#belly${id})`}
          opacity={clamp((t - 0.2) * 1.5)}
        />
      ) : null}

      {female ? (
        // Sports top: straps, a scooped neckline and a band under the bust.
        <G>
          <Path
            d={`M${L(s.neck + 1.5)},5 L${L(s.pit - 6)},24 M${R(s.neck + 1.5)},5 L${R(s.pit - 6)},24`}
            stroke={fc.top}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Path
            d={`M${L(s.pit + 0.5)},26 Q${L(s.pit * 0.45)},${19 + s.sag} ${C},${25 + s.sag} Q${R(s.pit * 0.45)},${19 + s.sag} ${R(s.pit + 0.5)},26 L${R(s.pit + t * 2)},${42 + s.sag} Q${C},${45 + s.sag} ${L(s.pit + t * 2)},${42 + s.sag} Z`}
            fill={fc.top}
          />
          <Path
            d={`M${L(s.pit + t * 2)},${39 + s.sag} Q${C},${42 + s.sag} ${R(s.pit + t * 2)},${39 + s.sag} L${R(s.pit + t * 2)},${42 + s.sag} Q${C},${45 + s.sag} ${L(s.pit + t * 2)},${42 + s.sag} Z`}
            fill={fc.topShade}
          />
          {/* The shape of the top: a soft line under each side and down the middle. */}
          <Path
            d={`M${L(s.pit - 2)},${36 + s.sag} Q${L(s.pit * 0.45)},${40 + s.sag} ${C},${36 + s.sag} Q${R(s.pit * 0.45)},${40 + s.sag} ${R(s.pit - 2)},${36 + s.sag}`}
            stroke={fc.topShade}
            strokeWidth={1.2}
            fill="none"
          />
        </G>
      ) : (
        <G>
          {[-1, 1].map((k) => (
            <G key={k}>
              <Path d={pec(k as 1 | -1)} fill={`url(#pec${id})`} />
              {/* Only the underside is drawn: the shadow under the chest. */}
              <Path
                d={pecLow(k as 1 | -1)}
                stroke={fc.skinDeep}
                strokeWidth={1.4 + t}
                strokeLinecap="round"
                fill="none"
                opacity={0.35 + chest * 0.3}
              />
              <Ellipse
                cx={C + k * (11 + t * 4)}
                cy={33 + s.sag * 0.9}
                rx={1.3 + t * 0.4}
                ry={1.15 + t * 0.4}
                fill={fc.nipple}
              />
            </G>
          ))}
        </G>
      )}

      {/* Six-pack: lit blocks with shaded seams, clear when lean, gone by the middle levels. */}
      {abs > 0 ? (
        <G opacity={abs}>
          {blocks.map((d) => (
            <Path key={d} d={d} fill={fc.skinLight} opacity={0.5} />
          ))}
          {/* Seams between the blocks: the centre line and the rows. */}
          <G stroke={fc.line} strokeLinecap="round" fill="none" opacity={0.7}>
            <Path
              d={`M${C},${female ? 46 : 40} L${C},${female ? 64 : 68}`}
              strokeWidth={1.3}
            />
            {(female ? [55.5] : [50, 59, 67.5]).map((y) => (
              <Path
                key={y}
                d={`M${L(7.5)},${y} Q${L(3.5)},${y + 1} ${C},${y} Q${R(3.5)},${y + 1} ${R(7.5)},${y}`}
                strokeWidth={1}
              />
            ))}
          </G>
        </G>
      ) : null}
      <G stroke={fc.line} strokeLinecap="round" fill="none">
        {lines > 0 ? (
          <G opacity={lines * (female ? 0.35 : 0.7)} strokeWidth={1.1}>
            {/* Obliques sweeping down into the waistband (shorter and softer on women). */}
            <Path
              d={`M${L(s.waist - 3)},${female ? 60 : 48} Q${L(s.waist - 2.5)},${female ? 74 : 68} ${L(7)},${band}`}
            />
            <Path
              d={`M${R(s.waist - 3)},${female ? 60 : 48} Q${R(s.waist - 2.5)},${female ? 74 : 68} ${R(7)},${band}`}
            />
          </G>
        ) : null}
      </G>

      {/* Navel: a dot when lean, deeper and longer as the belly grows. */}
      <Ellipse
        cx={C}
        cy={73 + drop * 1.6}
        rx={1.1 + t * 0.5}
        ry={1.2 + t * 1.3}
        fill={fc.line}
      />

      <Path d={bottoms} fill={female ? fc.leggings : fc.shorts} />
      {thighs.map((d) => (
        <Path key={d} d={d} fill={`url(#arm${id})`} />
      ))}
      <Path
        d={`M${L(s.hip + 1)},${band} L${R(s.hip + 1)},${band} L${R(s.hip + 1.2)},${band + 4} L${L(s.hip + 1.2)},${band + 4} Z`}
        fill={female ? fc.leggingsShade : fc.shortsShade}
      />
      {/* The belly hanging over the waistband, with the shadow it casts. */}
      {s.belly > 1.5 ? (
        <G>
          <Path
            d={`M${L(s.hip - 1)},${band + 2} Q${C},${band + s.belly + 3} ${R(s.hip - 1)},${band + 2} Z`}
            fill={female ? fc.leggingsShade : fc.shortsShade}
          />
          <Path
            d={`M${L(s.handle - 1)},${band - 4} Q${L(s.hip - 3)},${band + s.belly * 0.7} ${C},${band + s.belly} Q${R(s.hip - 3)},${band + s.belly * 0.7} ${R(s.handle - 1)},${band - 4} Z`}
            fill={`url(#skin${id})`}
          />
          <Path
            d={`M${L(s.hip - 4)},${band + s.belly * 0.55} Q${C},${band + s.belly + 1} ${R(s.hip - 4)},${band + s.belly * 0.55}`}
            stroke={fc.skinDeep}
            strokeWidth={1.4}
            fill="none"
            opacity={0.7}
          />
        </G>
      ) : null}

      <Path d={arm(-1)} fill={`url(#arm${id})`} />
      <Path d={arm(1)} fill={`url(#arm${id})`} />
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
