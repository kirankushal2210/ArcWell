// Today's date (YYYY-MM-DD, the phone's local day), kept current: re-read every minute and when the
// app comes back to the foreground. Tabs stay mounted (freezeOnBlur), so a date read once on first
// open would still say yesterday the next morning and file breakfast under the wrong day.
import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { dateKey } from "./foods";

const todayNow = () => dateKey(new Date());

export function useToday() {
  const [today, setToday] = useState(todayNow);
  useEffect(() => {
    const t = setInterval(() => setToday(todayNow()), 60_000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setToday(todayNow());
    });
    return () => {
      clearInterval(t);
      sub.remove();
    };
  }, []);
  return today;
}

/**
 * A picked day that follows today across midnight while it is on today; a day picked in the past
 * stays put. Call during render (React's "adjust state when a prop changes" pattern).
 */
export function useDayPicker() {
  const today = useToday();
  const [date, setDate] = useState(today);
  const [seen, setSeen] = useState(today);
  if (seen !== today) {
    setSeen(today);
    if (date === seen) setDate(today);
  }
  return { today, date, setDate };
}
