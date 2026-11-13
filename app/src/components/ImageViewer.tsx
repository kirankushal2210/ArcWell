// Full-screen image viewer (X-05): any photo in chat, check-ins or Physique opens here. Pinch to zoom
// (up to 4×), drag when zoomed, double-tap to zoom in or back out; the close button or Back closes it.
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { Modal, StyleSheet, View } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, Text } from "@/components/primitives";
import { colors, rhythm, space } from "@/theme";

const MAX = 4;

export function ImageViewer({
  uri,
  label,
  onClose,
}: {
  uri: string | null;
  label?: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const reset = () => {
    "worklet";
    scale.value = withTiming(1);
    x.value = withTiming(0);
    y.value = withTiming(0);
    startScale.value = 1;
    startX.value = 0;
    startY.value = 0;
  };

  const pinch = usePinchGesture({
    onUpdate: (e) => {
      "worklet";
      scale.value = Math.min(MAX, Math.max(1, startScale.value * e.scale));
    },
    onDeactivate: () => {
      "worklet";
      if (scale.value <= 1.02) reset();
      else startScale.value = scale.value;
    },
  });
  const pan = usePanGesture({
    onUpdate: (e) => {
      "worklet";
      if (scale.value <= 1) return;
      x.value = startX.value + e.translationX;
      y.value = startY.value + e.translationY;
    },
    onDeactivate: () => {
      "worklet";
      startX.value = x.value;
      startY.value = y.value;
    },
  });
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: () => {
      "worklet";
      if (scale.value > 1) reset();
      else {
        scale.value = withTiming(2);
        startScale.value = 2;
      }
    },
  });
  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);
  const zoomed = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  const close = () => {
    for (const v of [x, y, startX, startY]) v.set(0);
    scale.set(1);
    startScale.set(1);
    onClose();
  };

  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      {/* Modals render outside the app root, so gestures need their own root here. */}
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.stage, zoomed]}>
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.image}
                contentFit="contain"
                accessibilityLabel={label ? `${label} photo` : "Photo"}
              />
            ) : null}
          </Animated.View>
        </GestureDetector>
        <View
          style={[styles.top, { paddingTop: insets.top + space[2] }]}
          pointerEvents="box-none"
        >
          {label ? (
            <Text weight="semibold" style={styles.flex}>
              {label}
            </Text>
          ) : (
            <View style={styles.flex} />
          )}
          <IconButton
            icon={X}
            variant="glass"
            accessibilityLabel="Close photo"
            onPress={close}
          />
        </View>
        <Text
          variant="caption"
          tone="muted"
          style={[styles.hint, { bottom: insets.bottom + space[4] }]}
        >
          Pinch or double-tap to zoom
        </Text>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  stage: { flex: 1, justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: rhythm.gutter,
  },
  flex: { flex: 1 },
  hint: { position: "absolute", left: 0, right: 0, textAlign: "center" },
});
