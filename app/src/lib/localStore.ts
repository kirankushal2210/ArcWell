// What the app keeps on the phone, encrypted (S-05, D113): the same calls as AsyncStorage, but every
// value is sealed with XChaCha20-Poly1305 (cipher.ts) before it's written.
//
// - The key is 32 random bytes made once per install and kept in the phone's secure storage
//   (Android Keystore, iOS Keychain, this device only) through expo-secure-store. It never leaves
//   the phone and is never in a backup.
// - A value saved by an older build (not sealed) is read as it is and re-saved sealed at once.
// - A value that can't be opened (the key was lost with a reset of the phone's secure storage, or
//   the text was changed) is removed and read as missing: it's a cache, and the server copy or a
//   fresh start replaces it.
// - The web preview has no secure storage, so its key sits in the browser's storage: that keeps the
//   same code path working but protects nothing. The phone app is what's protected.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomBytes } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  fromBase64,
  KEY_BYTES,
  NONCE_BYTES,
  open,
  seal,
  toBase64,
} from "./cipher";

const KEY_NAME = "arcwell.cachekey.v1";

let keyPromise: Promise<Uint8Array> | null = null;

async function readKey(): Promise<string | null> {
  if (Platform.OS === "web")
    return globalThis.localStorage?.getItem(KEY_NAME) ?? null;
  return SecureStore.getItemAsync(KEY_NAME);
}

async function writeKey(value: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(KEY_NAME, value);
    return;
  }
  await SecureStore.setItemAsync(KEY_NAME, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

/** This install's key, made on first use. */
function cacheKey(): Promise<Uint8Array> {
  keyPromise ??= (async () => {
    const saved = await readKey();
    if (saved) {
      const k = fromBase64(saved);
      if (k.length === KEY_BYTES) return k;
    }
    const k = getRandomBytes(KEY_BYTES);
    await writeKey(toBase64(k));
    return k;
  })().catch((e: unknown) => {
    keyPromise = null; // try again next time
    throw e;
  });
  return keyPromise;
}

export const localStore = {
  async getItem(name: string): Promise<string | null> {
    const stored = await AsyncStorage.getItem(name);
    if (stored === null) return null;
    const key = await cacheKey();
    try {
      const { text, legacy } = open(key, stored);
      if (legacy)
        await AsyncStorage.setItem(
          name,
          seal(key, getRandomBytes(NONCE_BYTES), text),
        );
      return text;
    } catch {
      await AsyncStorage.removeItem(name);
      return null;
    }
  },

  async setItem(name: string, value: string): Promise<void> {
    const key = await cacheKey();
    await AsyncStorage.setItem(
      name,
      seal(key, getRandomBytes(NONCE_BYTES), value),
    );
  },

  removeItem: (name: string) => AsyncStorage.removeItem(name),
  getAllKeys: () => AsyncStorage.getAllKeys(),
  multiRemove: (names: readonly string[]) => AsyncStorage.multiRemove(names),
};
