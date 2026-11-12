/**
 * Motion tokens. Mirrors docs/design/theme-tokens.css §6 (DESIGN.md §5).
 * With reduced motion on, every duration is 0 and presses don't scale:
 * use `durationFor` / `pressScaleFor` with Reanimated's useReducedMotion().
 */
import { Easing } from "react-native-reanimated";

export const durations = {
  /** Press feedback, tick fill, toggles. */
  micro: 120,
  /** Number rolls, cards, tabs. */
  std: 200,
  /** Bottom sheets. */
  sheet: 280,
  /** ONLY the workout summary (F4-12). */
  big: 600,
} as const;

export type DurationName = keyof typeof durations;

/** cubic-bezier(0.2, 0, 0, 1) */
export const easeStandardCurve = [0.2, 0, 0, 1] as const;
export const easeStandard = Easing.bezier(...easeStandardCurve);

export const pressScale = 0.98;

export const durationFor = (name: DurationName, reducedMotion: boolean) =>
  reducedMotion ? 0 : durations[name];

export const pressScaleFor = (reducedMotion: boolean) =>
  reducedMotion ? 1 : pressScale;

/**
 * Skeleton pulse: opacity 0.55 → 1 → 0.55 over 1.4 s (spec-sheet.html "States").
 * Not yet in theme-tokens.css; still and full opacity with reduced motion.
 */
export const skeletonPulse = { period: 1400, minOpacity: 0.55 } as const;
