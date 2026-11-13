// "Around you" view for Gyms (G-01): you at the centre, gyms as pins by distance and direction, on
// rings at a quarter, half and all of the furthest distance. Drawn with react-native-svg, no map SDK
// (a real map needs API keys). Pins are plain views over the drawing so each has a 48 dp tap area
// and a screen-reader label (react-native-svg shapes don't take part in touch reliably on web).
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

import { Button, Card, PressableScale, Text } from "@/components/primitives";
import {
  colors,
  fontFamilyFor,
  radius,
  space,
  tapMin,
  textSizes,
} from "@/theme";

import { type Gym, openInMaps } from "./gyms";

/** The next round distance at or above the furthest gym: 2, 5, 10, 20 km… */
function scaleKm(maxKm: number) {
  for (const s of [2, 5, 10, 20, 50]) if (maxKm <= s) return s;
  return Math.ceil(maxKm / 10) * 10;
}

const kmText = (km: number) =>
  `${Number.isInteger(km) ? km : km.toFixed(1)} km`;

export function GymsMap({ gyms, allKm }: { gyms: Gym[]; allKm: number[] }) {
  const [size, setSize] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // The scale follows every gym, not just the filtered ones, so pins don't jump as filters change.
  const scale = scaleKm(Math.max(1, ...allKm));
  const c = size / 2;
  const r = Math.max(0, c - tapMin / 2);
  const at = (g: Gym) => {
    const d = (Math.min(g.km, scale) / scale) * r;
    const t = (g.bearing * Math.PI) / 180;
    return { x: c + d * Math.sin(t), y: c - d * Math.cos(t) };
  };
  const sel = gyms.find((g) => g.id === picked) ?? null;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.map}
        onLayout={(e) => setSize(e.nativeEvent.layout.width)}
        accessibilityLabel={`Map of ${gyms.length} gyms around you`}
      >
        {size ? (
          <>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width={size} height={size}>
                {[1, 0.5, 0.25].map((f) => (
                  <Circle
                    key={f}
                    cx={c}
                    cy={c}
                    r={r * f}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth={1}
                  />
                ))}
                {[1, 0.5, 0.25].map((f) => (
                  <SvgText
                    key={`t${f}`}
                    x={c + space[1]}
                    y={c - r * f + textSizes.xs + space[1]}
                    fill={colors.textMuted}
                    fontSize={textSizes.xs}
                    fontFamily={fontFamilyFor("regular")}
                  >
                    {kmText(scale * f)}
                  </SvgText>
                ))}
                <Circle
                  cx={c}
                  cy={c}
                  r={space[3]}
                  fill={colors.surfaceRaised}
                />
                <Circle
                  cx={c}
                  cy={c}
                  r={space[1] + space[1] / 2}
                  fill={colors.text}
                />
              </Svg>
            </View>
            {gyms.map((g) => {
              const p = at(g);
              const on = g.id === picked;
              return (
                <PressableScale
                  key={g.id}
                  onPress={() => setPicked(on ? null : g.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${g.name}, ${kmText(g.km)} away`}
                  style={[
                    styles.pin,
                    { left: p.x - tapMin / 2, top: p.y - tapMin / 2 },
                  ]}
                >
                  <View style={[styles.pinDot, on && styles.pinDotOn]}>
                    <MapPin
                      size={16}
                      strokeWidth={2.4}
                      color={on ? colors.onBrand : colors.text}
                    />
                  </View>
                </PressableScale>
              );
            })}
          </>
        ) : null}
      </View>
      <Text variant="caption" tone="muted" style={styles.center}>
        You are in the middle. Tap a pin to see the gym.
      </Text>
      {sel ? (
        <Card>
          <Text weight="semibold">{sel.name}</Text>
          <Text variant="label" weight="regular" tone="muted">
            {`${sel.area} · ${kmText(sel.km)} · ${sel.hours}`}
          </Text>
          <View style={styles.actions}>
            <View style={styles.flex}>
              <Button
                label="Open in Maps"
                variant="secondary"
                size="sm"
                fullWidth
                onPress={() => openInMaps(sel)}
              />
            </View>
            <View style={styles.flex}>
              <Button
                label="Details"
                variant="ghost"
                size="sm"
                fullWidth
                onPress={() =>
                  router.push({
                    pathname: "/athlete/gyms/[id]",
                    params: { id: sel.id },
                  })
                }
              />
            </View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  map: { width: "100%", aspectRatio: 1 },
  center: { textAlign: "center" },
  pin: {
    position: "absolute",
    width: tapMin,
    height: tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: {
    width: space[8],
    height: space[8],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pinDotOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  actions: { flexDirection: "row", gap: space[2] },
  flex: { flex: 1 },
});
