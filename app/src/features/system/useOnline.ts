// Whether the phone is online (F4-09, F7-03). On web this follows the browser's online and offline
// events; on phones it follows expo-network. Until the first reading arrives it says online, so
// nothing ever blocks on it, and it only ever drives a banner.
import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const web = Platform.OS === "web";

/** Offline only when the phone says so outright; unknown counts as online. */
const isOnline = (s: Network.NetworkState) =>
  s.isConnected !== false && s.isInternetReachable !== false;

export function useOnline() {
  const [online, setOnline] = useState(
    web && typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  useEffect(() => {
    if (web) {
      if (typeof window === "undefined") return;
      const on = () => setOnline(true);
      const off = () => setOnline(false);
      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      return () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    }
    let live = true;
    Network.getNetworkStateAsync()
      .then((s) => {
        if (live) setOnline(isOnline(s));
      })
      .catch(() => {});
    const sub = Network.addNetworkStateListener((s) => setOnline(isOnline(s)));
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  return online;
}
