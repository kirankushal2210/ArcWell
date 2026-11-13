// The current minute of the day, re-read every minute and when the app comes back to the
// foreground, so time-windowed cards (D77) appear and leave on their own.
import { useEffect, useState } from "react";
import { AppState } from "react-native";

const minuteNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export function useNow() {
  const [now, setNow] = useState(minuteNow);
  useEffect(() => {
    const t = setInterval(() => setNow(minuteNow()), 60_000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setNow(minuteNow());
    });
    return () => {
      clearInterval(t);
      sub.remove();
    };
  }, []);
  return now;
}
