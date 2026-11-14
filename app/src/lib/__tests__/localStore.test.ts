// The encrypted phone store (S-05, D113), with the phone's storage replaced by in-memory fakes: values
// are sealed at rest, older plain values are migrated, unreadable ones are dropped, one key per
// install, and nothing is written when the secure key can't be had.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomBytes } from "@noble/ciphers/webcrypto";

import { SEALED, toBase64 } from "@/lib/cipher";

// Hoisted above the imports by Jest.
jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);
jest.mock("expo-crypto", () => ({
  getRandomBytes: (n: number) =>
    jest
      .requireActual<typeof import("@noble/ciphers/webcrypto")>(
        "@noble/ciphers/webcrypto",
      )
      .randomBytes(n),
}));
jest.mock("expo-secure-store", () => {
  const mockKeys = new Map<string, string>();
  const mockFail = { on: false };
  return {
    mockKeys,
    mockFail,
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
    getItemAsync: jest.fn(async (k: string) => mockKeys.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      if (mockFail.on) throw new Error("keystore");
      mockKeys.set(k, v);
    }),
  };
});

type Secure = {
  mockKeys: Map<string, string>;
  mockFail: { on: boolean };
  setItemAsync: jest.Mock;
};
const secure = jest.requireMock<Secure>("expo-secure-store");

type Store = (typeof import("@/lib/localStore"))["localStore"];

/** A fresh copy of the module, so the remembered key starts empty. */
function fresh(): Store {
  let store: Store | undefined;
  jest.isolateModules(() => {
    // isolateModules needs a synchronous require; this Jest setup has no dynamic import().
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    store = require("@/lib/localStore").localStore;
  });
  return store!;
}

let localStore: Store;
beforeEach(async () => {
  await AsyncStorage.clear();
  secure.mockKeys.clear();
  secure.mockFail.on = false;
  secure.setItemAsync.mockClear();
  localStore = fresh();
});

const VALUE = JSON.stringify({ history: [{ name: "Upper A", kg: 60 }] });

describe("localStore", () => {
  it("stores values sealed and reads them back", async () => {
    await localStore.setItem("arcwell.cloud.x", VALUE);
    const raw = (await AsyncStorage.getItem("arcwell.cloud.x"))!;
    expect(raw.startsWith(SEALED)).toBe(true);
    expect(raw).not.toContain("Upper A");
    expect(await localStore.getItem("arcwell.cloud.x")).toBe(VALUE);
  });

  it("makes one key per install and keeps it in secure storage", async () => {
    await localStore.setItem("a", "1");
    await localStore.setItem("b", "2");
    expect(secure.setItemAsync).toHaveBeenCalledTimes(1);
    expect([...secure.mockKeys.keys()]).toEqual(["arcwell.cachekey.v1"]);
  });

  it("reads a value saved before encryption and re-saves it sealed", async () => {
    await AsyncStorage.setItem("arcwell.sample.v1", VALUE);
    expect(await localStore.getItem("arcwell.sample.v1")).toBe(VALUE);
    const raw = (await AsyncStorage.getItem("arcwell.sample.v1"))!;
    expect(raw.startsWith(SEALED)).toBe(true);
  });

  it("drops a value it can't open (key lost) and reads it as missing", async () => {
    await localStore.setItem("c", VALUE);
    secure.mockKeys.set("arcwell.cachekey.v1", toBase64(randomBytes(32)));
    localStore = fresh();
    expect(await localStore.getItem("c")).toBeNull();
    expect(await AsyncStorage.getItem("c")).toBeNull();
  });

  it("writes nothing when the secure key can't be stored, and tries again later", async () => {
    secure.mockFail.on = true;
    await expect(localStore.setItem("d", VALUE)).rejects.toThrow();
    expect(await AsyncStorage.getItem("d")).toBeNull();
    secure.mockFail.on = false;
    await localStore.setItem("d", VALUE);
    expect(await localStore.getItem("d")).toBe(VALUE);
  });

  it("missing values read as null; removal and listing pass through", async () => {
    expect(await localStore.getItem("none")).toBeNull();
    await localStore.setItem("arcwell.aichat.u1", "x");
    expect(await localStore.getAllKeys()).toContain("arcwell.aichat.u1");
    await localStore.multiRemove(["arcwell.aichat.u1"]);
    expect(await localStore.getItem("arcwell.aichat.u1")).toBeNull();
  });
});
