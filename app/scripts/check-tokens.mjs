#!/usr/bin/env node
/**
 * Token gate (EXECUTION-PROMPT.md §3.2 and §3.3). Run with `npm run tokens:check`.
 *
 * 1. Parity: app/src/theme must match docs/design/theme-tokens.css value for value
 *    (palette, semantic colour roles, text sizes, leading, tracking, spacing, radius, motion).
 * 2. Lint: outside src/theme, no hex or rgb() colours, no raw numbers for spacing or
 *    radius, and no imports of expo-glass-effect or expo-symbols.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(appDir, "..", "docs", "design", "theme-tokens.css");
const themeDir = join(appDir, "src", "theme");
const errors = [];
const fail = (msg) => errors.push(msg);

// ---------- 1. Parity ----------
const css = readFileSync(cssPath, "utf8");
const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("@media (prefers-reduced-motion"));
const cssVars = new Map(
  [...rootBlock.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
);
const read = (f) => readFileSync(join(themeDir, f), "utf8");
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const rem = (v) => (v === "0" ? 0 : v.endsWith("rem") ? parseFloat(v) * 16 : parseFloat(v));
const tsEntries = (src, objName) => {
  const m = new RegExp(`export const ${objName}\\b[^=]*=\\s*\\{`).exec(src);
  if (!m) return new Map();
  const start = m.index + m[0].length;
  const body = src.slice(start, src.indexOf("}", start));
  return new Map(
    [...body.matchAll(/^\s*"?([\w]+)"?\s*:\s*([^,\n]+),/gm)].map((m) => [m[1], m[2].trim()]),
  );
};
const expectEq = (label, cssVal, tsVal) => {
  if (tsVal === undefined) return fail(`parity: ${label} is in theme-tokens.css but missing in app/src/theme`);
  if (String(cssVal) !== String(tsVal)) fail(`parity: ${label} is ${cssVal} in CSS but ${tsVal} in app/src/theme`);
};

// Palette
const colorsTs = read("colors.ts");
const palette = tsEntries(colorsTs, "palette");
for (const [name, value] of cssVars) {
  if (!/^(charcoal|grey|blue|cyan|amber|violet|green|red|ink|mist|honey|sage|slate|rose|coral)-\d+$/.test(name)) continue;
  expectEq(`--${name}`, value.toUpperCase(), palette.get(camel(name))?.replace(/"/g, "").toUpperCase());
}
for (const key of palette.keys()) {
  const cssName = key.replace(/(\d+)$/, "-$1");
  if (!cssVars.has(cssName)) fail(`parity: palette.${key} has no --${cssName} in theme-tokens.css`);
}

// Semantic roles
const roles = tsEntries(colorsTs, "colors");
for (const [name, value] of cssVars) {
  if (!name.startsWith("color-")) continue;
  const key = camel(name.slice("color-".length));
  // Translucent roles (scrim, glass) are written as rgb()/rgba() strings: compare the numbers.
  if (/^rgba?\(/.test(value)) {
    const ts = colorsTs.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1];
    const norm = (v) => (v ?? "").replace(/[^\d.]/g, " ").trim().split(/\s+/).join(",");
    expectEq(`--${name}`, norm(value), norm(ts));
    continue;
  }
  const ts = roles.get(key);
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  expectEq(`--${name}`, ref ? `palette.${camel(ref[1])}` : value, ts);
}
for (const key of roles.keys()) {
  const cssName = "color-" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  if (!cssVars.has(cssName)) fail(`parity: colors.${key} has no --${cssName} in theme-tokens.css`);
}

// Typography
const typoTs = read("typography.ts");
const sizes = ["xs", "sm", "base", "lg", "xl", "2xl"];
for (const [obj, prefix, conv] of [
  ["textSizes", "text", rem],
  ["leading", "leading", rem],
  ["trackingEm", "tracking", (v) => parseFloat(v)],
]) {
  const entries = tsEntries(typoTs, obj);
  for (const s of sizes) {
    const cssVal = cssVars.get(`${prefix}-${s}`);
    if (cssVal === undefined) fail(`parity: --${prefix}-${s} missing from theme-tokens.css`);
    else expectEq(`--${prefix}-${s}`, conv(cssVal), entries.has(s) ? parseFloat(entries.get(s)) : undefined);
  }
}
expectEq("--tracking-caps", parseFloat(cssVars.get("tracking-caps")), parseFloat(typoTs.match(/trackingCapsEm = ([\d.-]+)/)?.[1]));
const weights = tsEntries(typoTs, "fontWeights");
for (const w of ["regular", "medium", "semibold", "bold"]) {
  expectEq(`--weight-${w}`, cssVars.get(`weight-${w}`), weights.get(w)?.replace(/"/g, ""));
}

// Spacing, tap targets
const spacingTs = read("spacing.ts");
const space = tsEntries(spacingTs, "space");
for (const [name, value] of cssVars) {
  const m = name.match(/^space-(\d+)$/);
  if (m) expectEq(`--${name}`, rem(value), space.has(m[1]) ? parseFloat(space.get(m[1])) : undefined);
}
for (const key of space.keys()) if (!cssVars.has(`space-${key}`)) fail(`parity: space[${key}] has no --space-${key}`);
expectEq("--tap-min", rem(cssVars.get("tap-min")), parseFloat(spacingTs.match(/tapMin = (\d+)/)?.[1]));
expectEq("--control-height", rem(cssVars.get("control-height")), parseFloat(spacingTs.match(/controlHeight = (\d+)/)?.[1]));
expectEq("--control-height-sm", rem(cssVars.get("control-height-sm")), parseFloat(spacingTs.match(/controlHeightSm = (\d+)/)?.[1]));

// Radius and borders
const radiusTs = read("radius.ts");
const radius = tsEntries(radiusTs, "radius");
for (const r of ["sm", "md", "lg", "xl", "full"]) {
  expectEq(`--radius-${r}`, rem(cssVars.get(`radius-${r}`)), radius.has(r) ? parseFloat(radius.get(r)) : undefined);
}
expectEq("--border-width", rem(cssVars.get("border-width")), parseFloat(radiusTs.match(/borderWidth = (\d+)/)?.[1]));
expectEq("--focus-ring-width", rem(cssVars.get("focus-ring-width")), parseFloat(radiusTs.match(/focusRingWidth = (\d+)/)?.[1]));

// Motion
const motionTs = read("motion.ts");
const durations = tsEntries(motionTs, "durations");
for (const d of ["micro", "std", "sheet", "big"]) {
  expectEq(`--duration-${d}`, parseFloat(cssVars.get(`duration-${d}`)), durations.has(d) ? parseFloat(durations.get(d)) : undefined);
}
const curve = cssVars.get("ease-standard")?.match(/cubic-bezier\(([^)]+)\)/)?.[1].split(",").map(Number).join(",");
expectEq("--ease-standard", curve, motionTs.match(/easeStandardCurve = \[([^\]]+)\]/)?.[1].split(",").map(Number).join(","));
expectEq("--press-scale", parseFloat(cssVars.get("press-scale")), parseFloat(motionTs.match(/pressScale = ([\d.]+)/)?.[1]));

// ---------- 2. Lint outside src/theme ----------
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(f) ? [p] : [];
  });
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const spacingKeys =
  "(?:padding|margin)(?:Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?|gap|rowGap|columnGap|borderRadius|border(?:Top|Bottom)(?:Left|Right)Radius";
const rules = [
  [/#[0-9a-fA-F]{3,8}\b/g, "hex colour (use a colors.* token)"],
  [/\brgba?\(/g, "rgb() colour (use a colors.* token)"],
  [new RegExp(`\\b(${spacingKeys})\\s*:\\s*-?\\d*\\.?\\d+\\b`, "g"), "raw number for spacing or radius (use space/rhythm/radius)"],
  [/from\s+["']expo-glass-effect["']|require\(["']expo-glass-effect["']\)/g, "expo-glass-effect is banned (C2: no glass)"],
  [/from\s+["']expo-symbols["']|require\(["']expo-symbols["']\)/g, "expo-symbols is banned (C9: Lucide only)"],
];
for (const file of walk(join(appDir, "src"))) {
  if (file.startsWith(themeDir)) continue;
  const lines = stripComments(readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, i) => {
    for (const [re, why] of rules) {
      for (const m of line.matchAll(re)) {
        if (/:\s*0$/.test(m[0])) continue; // 0 is always allowed
        fail(`lint: ${relative(appDir, file)}:${i + 1}  ${m[0].trim()}  → ${why}`);
      }
    }
  });
}

if (errors.length) {
  console.error(`tokens:check failed with ${errors.length} problem(s):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("tokens:check passed: app/src/theme matches theme-tokens.css, and no raw colours, spacing or banned imports outside src/theme.");
