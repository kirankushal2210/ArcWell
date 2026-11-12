// Welcome screen: the first screen people see. Built to match the founder's welcome design;
// the phone in the hero is the demo image from that design (assets/welcome/hero-phone.png).
import { Image } from "expo-image";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { PressableScale } from "@/components/primitives";
import { fontFamilyFor } from "@/theme";
import {
  welcomeBackground,
  welcomeBaseWidth,
  welcomeColors as c,
  welcomeLayout as L,
} from "@/theme/welcome";

const mark = require("../../../assets/brand/arcwell-mark.png");
const hero = require("../../../assets/welcome/hero-phone.png");

export type WelcomeScreenProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const s = width / welcomeBaseWidth;

  return (
    <View style={styles.root} testID="welcome">
      {/* react-native-svg ignores pointerEvents, so a View keeps the gradients from taking touches. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient
              id="welcome-bg"
              x1="0"
              y1="0"
              x2={welcomeBackground.x2}
              y2={welcomeBackground.y2}
            >
              {welcomeBackground.stops.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#welcome-bg)" />
        </Svg>
      </View>
      <Image
        source={mark}
        tintColor={c.logo}
        contentFit="fill"
        accessibilityIgnoresInvertColors
        style={{
          position: "absolute",
          left: L.logo.left * s,
          top: L.logo.top * s,
          width: L.logo.width * s,
          height: L.logo.height * s,
        }}
      />
      <Text
        accessibilityRole="header"
        style={[
          styles.wordmark,
          {
            left: L.wordmark.left * s,
            top: L.wordmark.top * s,
            fontSize: L.wordmark.fontSize * s,
          },
        ]}
      >
        ARCWELL
      </Text>

      <Image
        source={hero}
        contentFit="contain"
        accessibilityLabel="Arcwell on a phone: training, nutrition and recovery"
        style={{
          position: "absolute",
          left: L.hero.left * s,
          top: L.hero.top * s,
          width: L.hero.width * s,
          height: L.hero.height * s,
        }}
      />

      <Text
        style={[
          styles.headline,
          {
            top: L.headline.top * s,
            fontSize: L.headline.fontSize * s,
            lineHeight: L.headline.lineHeight * s,
          },
        ]}
      >
        {"Health tracking\nmade easy"}
      </Text>
      <Text
        style={[
          styles.body,
          {
            top: L.body.top * s,
            fontSize: L.body.fontSize * s,
            lineHeight: L.body.lineHeight * s,
          },
        ]}
      >
        {
          "Log workouts, scan meals, and track\nrecovery to reach your goals with AI."
        }
      </Text>

      <PressableScale
        onPress={onGetStarted}
        accessibilityRole="button"
        accessibilityLabel="Get Started"
        testID="welcome-get-started"
        style={[
          styles.button,
          {
            left: L.button.left * s,
            top: L.button.top * s,
            width: L.button.width * s,
            height: L.button.height * s,
            borderRadius: L.button.radius * s,
          },
        ]}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="welcome-button" x1="0" y1="0" x2="0" y2="1">
                <Stop offset={0} stopColor={c.buttonTop} />
                <Stop offset={1} stopColor={c.buttonBottom} />
              </LinearGradient>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              rx={L.button.radius * s}
              fill="url(#welcome-button)"
            />
          </Svg>
        </View>
        <Text style={[styles.buttonLabel, { fontSize: L.button.fontSize * s }]}>
          Get Started
        </Text>
        <View
          style={[styles.arrow, { right: L.button.arrow.right * s }]}
          pointerEvents="none"
        >
          <Arrow
            width={L.button.arrow.width * s}
            height={L.button.arrow.height * s}
          />
        </View>
      </PressableScale>

      <View style={[styles.signInRow, { top: L.signIn.top * s }]}>
        <Text style={[styles.signInMuted, { fontSize: L.signIn.fontSize * s }]}>
          Already have an account?{" "}
        </Text>
        <Text
          onPress={onSignIn}
          accessibilityRole="link"
          testID="welcome-sign-in"
          suppressHighlighting
          style={[styles.signInStrong, { fontSize: L.signIn.fontSize * s }]}
        >
          Sign In
        </Text>
      </View>
    </View>
  );
}

/** The design's arrow is wider than it is tall, so it's drawn here rather than taken from Lucide. */
function Arrow({ width, height }: { width: number; height: number }) {
  const w = L.button.arrow.width;
  const h = L.button.arrow.height;
  const sw = L.button.arrow.stroke;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${w} ${h}`} fill="none">
      <Path
        d={`M${sw / 2} ${h / 2}H${w - sw / 2}M${w - h / 2} ${sw / 2}L${w - sw / 2} ${h / 2}L${w - h / 2} ${h - sw / 2}`}
        stroke={c.onButton}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  wordmark: {
    position: "absolute",
    fontFamily: fontFamilyFor("bold"),
    color: c.ink,
    letterSpacing: L.wordmark.letterSpacing,
  },
  headline: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: fontFamilyFor("bold"),
    color: c.headline,
    letterSpacing: L.headline.letterSpacing,
  },
  body: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: fontFamilyFor("regular"),
    color: c.body,
    letterSpacing: L.body.letterSpacing,
  },
  button: {
    position: "absolute",
    backgroundColor: c.button,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: c.button,
    shadowOpacity: L.button.shadow.opacity,
    shadowRadius: L.button.shadow.radius,
    shadowOffset: { width: 0, height: L.button.shadow.offsetY },
    elevation: 6,
  },
  buttonLabel: { fontFamily: fontFamilyFor("semibold"), color: c.onButton },
  arrow: { position: "absolute", top: 0, bottom: 0, justifyContent: "center" },
  signInRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  signInMuted: { fontFamily: fontFamilyFor("regular"), color: c.signInMuted },
  signInStrong: { fontFamily: fontFamilyFor("bold"), color: c.signInStrong },
});
