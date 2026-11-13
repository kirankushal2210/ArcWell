// Asks before throwing away the running workout (D102), from the logger or the minimised bar.
// React Native's Alert does nothing on web, so the web build uses the browser's confirm.
import { Alert, Platform } from "react-native";

const TITLE = "Discard this workout?";
const BODY = "Nothing from this session will be saved.";

export function confirmDiscard(onDiscard: () => void) {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`${TITLE}\n${BODY}`)) onDiscard();
    return;
  }
  Alert.alert(TITLE, BODY, [
    { text: "Keep going", style: "cancel" },
    { text: "Discard", style: "destructive", onPress: onDiscard },
  ]);
}
