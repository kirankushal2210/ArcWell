// Whether the phone is online (F4-09, F7-03). On web this follows the browser; on phones it reports
// online until network status arrives with the backend sync, so nothing ever blocks on it.
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export function useOnline() {
  const [online, setOnline] = useState(
    Platform.OS === "web" && typeof navigator !== "undefined"
      ? navigator.onLine
      : true,
  );
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
