// One alert for phone and web. React Native's Alert.alert does nothing on web, so a confirm or a
// choice there never reached the user. Same call shape as Alert.alert:
// - no buttons, or one: the browser's alert, then that button's action;
// - one action beside Cancel: the browser's confirm (OK runs the action);
// - more actions: one confirm per action, in order, until one is accepted.
import { Alert, type AlertButton, Platform } from "react-native";

export function alert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const actions = (buttons ?? []).filter((b) => b.style !== "cancel");
  const cancel = (buttons ?? []).find((b) => b.style === "cancel");
  if (actions.length === 0 || (actions.length === 1 && !cancel)) {
    globalThis.alert?.(text);
    actions[0]?.onPress?.();
    return;
  }
  if (actions.length === 1) {
    if (globalThis.confirm?.(text)) actions[0].onPress?.();
    else cancel?.onPress?.();
    return;
  }
  for (const b of actions) {
    if (globalThis.confirm?.(`${text}\n\n${b.text}?`)) {
      b.onPress?.();
      return;
    }
  }
  cancel?.onPress?.();
}
