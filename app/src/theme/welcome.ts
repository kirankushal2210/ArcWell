/**
 * Welcome screen art spec: colours and positions measured from the founder's welcome design
 * (926 × 2000 px, scaled by 402 / 926 to the 402 pt design width). This one screen is built to
 * match that image exactly, so its values live here instead of the shared tokens.
 * Positions are in points at a 402 pt-wide screen; WelcomeScreen scales them to the device width.
 */
export const welcomeColors = {
  background: "#FAF8F4",
  ink: "#13141D",
  logo: "#16171F",
  headline: "#0C0F17",
  body: "#73716B",
  signInMuted: "#6E6C68",
  signInStrong: "#000000",
  button: "#151515",
  buttonTop: "#232322",
  buttonBottom: "#070707",
  onButton: "#FFFFFF",
} as const;

/**
 * Page background: the design shades from near-white at the top left to warm grey at the
 * bottom right. Direction and stops are fitted to the design's margins (within 0.7 levels).
 */
export const welcomeBackground = {
  x2: 0.5549,
  y2: 1.205,
  stops: [
    { offset: 0, color: "#FEFDF9" },
    { offset: 0.125, color: "#FDFCF8" },
    { offset: 0.25, color: "#FAFAF5" },
    { offset: 0.375, color: "#F8F7F3" },
    { offset: 0.5, color: "#F6F4F0" },
    { offset: 0.625, color: "#F4F2ED" },
    { offset: 0.75, color: "#F3F1EB" },
    { offset: 1, color: "#F4F1EC" },
  ],
} as const;

/** Design width in points; everything below is measured against it. */
export const welcomeBaseWidth = 402;

export const welcomeLayout = {
  logo: { left: 106.8, top: 95.9, width: 49, height: 51.7 },
  wordmark: { left: 154.1, top: 104.1, fontSize: 28.8, letterSpacing: 0 },
  hero: { left: 52.1, top: 151.9, width: 349.9, height: 507.9 },
  headline: { top: 623.2, fontSize: 29.4, lineHeight: 35.3, letterSpacing: 0 },
  body: { top: 700.7, fontSize: 14.4, lineHeight: 18, letterSpacing: 0 },
  button: {
    left: 29.5,
    top: 755.3,
    width: 342.5,
    height: 44.3,
    radius: 22.15,
    fontSize: 15.4,
    arrow: { width: 19.2, height: 13.4, right: 22.2, stroke: 1.9 },
    shadow: { opacity: 0.35, radius: 10, offsetY: 8 },
  },
  signIn: { top: 813.5, fontSize: 13.1 },
} as const;
