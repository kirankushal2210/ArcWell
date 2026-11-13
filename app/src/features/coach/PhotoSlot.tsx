// Progress photo slots (F6, D12): pick from the camera or library, show the photo or an empty
// frame. Photos are optional and go to the coach only. Quality 0.6 keeps files small until the
// signed-URL upload with compression arrives (PLAN Phase 1).
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, User } from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";

import { ImageViewer } from "@/components/ImageViewer";

import { PressableScale, Text } from "@/components/primitives";
import { colors, radius, space } from "@/theme";

async function pick(camera: boolean): Promise<string | null> {
  const perm = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      camera ? "Camera is off for Arcwell" : "Photos are off for Arcwell",
      "Photos are optional and everything else keeps working. To add one, turn access on in your phone's settings.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Open phone settings", onPress: () => Linking.openSettings() },
      ],
    );
    return null;
  }
  const opts: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.6,
  };
  const res = camera
    ? await ImagePicker.launchCameraAsync(opts)
    : await ImagePicker.launchImageLibraryAsync(opts);
  return !res.canceled && res.assets[0] ? res.assets[0].uri : null;
}

/** Ask camera or library, then hand back the photo URI. */
export function choosePhoto(onPicked: (uri: string) => void) {
  Alert.alert("Add a photo", undefined, [
    {
      text: "Take photo",
      onPress: () => pick(true).then((u) => u && onPicked(u)),
    },
    {
      text: "Choose from library",
      onPress: () => pick(false).then((u) => u && onPicked(u)),
    },
    { text: "Cancel", style: "cancel" },
  ]);
}

/**
 * A 3:4 frame: the photo, or an outline with a label. Tap to add when `onPress` is given;
 * otherwise a photo opens full screen (X-05). `still` turns taps off, for a parent that handles them.
 */
export function PhotoSlot({
  uri,
  label,
  onPress,
  still,
}: {
  uri?: string;
  label: string;
  onPress?: () => void;
  still?: boolean;
}) {
  const [viewing, setViewing] = useState(false);
  const body = uri ? (
    <Image
      source={{ uri }}
      style={styles.fill}
      contentFit="cover"
      accessibilityLabel={`${label} photo`}
    />
  ) : (
    <View style={styles.empty}>
      {onPress ? (
        <Camera size={24} color={colors.textMuted} />
      ) : (
        <User size={24} color={colors.textMuted} />
      )}
    </View>
  );
  return (
    <View style={styles.slot}>
      {still ? (
        <View style={styles.frame}>{body}</View>
      ) : !onPress && uri ? (
        <PressableScale
          onPress={() => setViewing(true)}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Open ${label} photo`}
          style={styles.frame}
        >
          {body}
        </PressableScale>
      ) : onPress ? (
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={
            uri ? `Change ${label} photo` : `Add ${label} photo`
          }
          style={styles.frame}
        >
          {body}
        </PressableScale>
      ) : (
        <View style={styles.frame}>{body}</View>
      )}
      <Text variant="caption" weight="semibold" style={styles.center}>
        {label}
      </Text>
      {uri && !onPress && !still ? (
        <ImageViewer
          uri={viewing ? uri : null}
          label={label}
          onClose={() => setViewing(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, gap: space[1] },
  frame: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  fill: { width: "100%", height: "100%" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { textAlign: "center" },
});
