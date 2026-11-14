// Logging streak (D94): days in a row with at least one food logged, ending today, or yesterday
// while today is still empty, so the streak doesn't drop before the first meal of the day.
import { shiftDate } from "./foods";

export function logStreak(dates: Iterable<string>, today: string): number {
  const logged = new Set(dates);
  let day = logged.has(today) ? today : shiftDate(today, -1);
  let n = 0;
  while (logged.has(day)) {
    n += 1;
    day = shiftDate(day, -1);
  }
  return n;
}

/** One line for the streak sheet. */
export const streakLine = (n: number) =>
  n === 0
    ? "Log one meal today to start a streak."
    : n < 3
      ? "A good start. Log today to keep it going."
      : n < 7
        ? "Consistency is what moves the numbers."
        : "A full week or more. This is a habit now.";
