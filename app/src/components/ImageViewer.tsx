// Full-screen image viewer (X-05): any photo in chat, check-ins or Physique opens here. Tap anywhere
// or the close button to go back. Pinch-to-zoom arrives with the gesture pass.
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, Text } from "@/components/primitives";
import { colors, rhythm, space } from "@/theme";

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
  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.root}
        onPress={onClose}
        accessibilityLabel="Close photo"
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={label ? `${label} photo` : "Photo"}
          />
        ) : null}
      </Pressable>
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
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: "center" },
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
});
