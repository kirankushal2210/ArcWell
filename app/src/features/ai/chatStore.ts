// Phone storage for today's AI chat (D109). One key per account; nothing here ever reaches the server.
// Every call is best-effort: a storage failure only means the chat starts empty.
import AsyncStorage from "@react-native-async-storage/async-storage";

import { type ChatMsg, fromSaved, toSave } from "./chatMemory";

const PREFIX = "arcwell.aichat.";

export async function loadChat(id: string, today: string): Promise<ChatMsg[]> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + id);
    if (!raw) return [];
    const msgs = fromSaved(JSON.parse(raw), today);
    // Yesterday's chat (or a damaged one) is removed, not kept.
    if (!msgs.length) await AsyncStorage.removeItem(PREFIX + id);
    return msgs;
  } catch {
    return [];
  }
}

export function saveChat(id: string, today: string, msgs: ChatMsg[]) {
  const saved = toSave(today, msgs);
  const write = saved.msgs.length
    ? AsyncStorage.setItem(PREFIX + id, JSON.stringify(saved))
    : AsyncStorage.removeItem(PREFIX + id);
  write.catch(() => {});
}

/** Wipe every saved AI chat on this phone: sign-out, account deletion, AI turned off. */
export async function clearAllChats() {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) =>
      k.startsWith(PREFIX),
    );
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {
    // Nothing to clear, or storage unavailable.
  }
}
