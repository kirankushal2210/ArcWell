/**
 * Illustration colours for the body fat figures (onboarding, D84, D87). Only these drawings use
 * them, so they live here instead of the shared tokens. Skin runs from a lit centre to shaded
 * edges so the figures read as rounded bodies.
 */
export const figureColors = {
  skinLight: "#D9B08C",
  skin: "#C99F7B",
  skinShade: "#A57E5E",
  skinDeep: "#8C6A4F",
  line: "#7E5E45",
  nipple: "#9A6E55",
  shorts: "#1F2533",
  shortsShade: "#151A25",
  top: "#2E2E34",
  topShade: "#1E1E22",
  leggings: "#26262C",
  leggingsShade: "#18181C",
} as const;
