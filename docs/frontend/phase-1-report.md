# Frontend Phase 1 — Theme foundation: report

Date: 2026-11-11 · Status: built; draft, not approved or user-tested · Checked on **web only** (D48)

## Built

| Area | Files | Notes |
|---|---|---|
| Packages | `app/package.json`, `package-lock.json` | Removed `expo-glass-effect`, `expo-symbols`. Added `react-native-svg 15.16.0`, `lucide-react-native 1.62.0` (exact pin), `@expo-google-fonts/inter 0.4.2` (exact pin), `expo-haptics ~58.0.8`, `expo-navigation-bar ~58.0.4` |
| Theme | `app/src/theme/{colors,typography,spacing,radius,motion,index}.ts` | Mirrors `theme-tokens.css`: palette, semantic roles, the six type roles (letter-spacing converted from em to dp per size), the 4-point scale, rhythm aliases, 48 dp targets, radius, border widths, and motion durations and easing, with reduced-motion helpers. No shadow or elevation tokens exist. |
| System UI | `app/app.json`, `app/src/app/_layout.tsx` | `userInterfaceStyle: "dark"`; root, splash and adaptive-icon backgrounds `#111316`; `expo-system-ui` plugin; `expo-navigation-bar` plugin with `enforceContrast: false` and `style: "light"`; `<StatusBar style="light">` and `<NavigationBar style="light">`; splash held until Inter loads; gesture-handler and safe-area roots |
| Start screen | `app/src/app/index.tsx` | The centred light placeholder is replaced by a left-aligned dark one with a plain-text "Arcwell" (wordmark undecided) and a dev-only link. Phase 5 replaces it. |
| Dev check | `app/src/app/dev/_layout.tsx`, `dev/tokens.tsx` | Swatches, type scale, spacing and radius, rendered from the theme. The `dev/` group redirects to `/` outside `__DEV__`. |
| Gates | `app/scripts/check-tokens.mjs`, `eslint.config.js`, `npm run tokens:check` (now part of `npm run lint`) | Parity with the CSS, value for value. Outside `src/theme` it fails on hex or `rgb()`, raw spacing or radius numbers, and the two banned imports, which ESLint also blocks. |

Screen IDs covered: none (foundation phase).

## Gate results

- `npm run lint`: **pass** (expo lint, then tokens:check).
- `npm run typecheck`: **pass**.
- `tokens:check`, negative test: changed `blue500` to `#007AFF` and added a probe file with `#fff`, `rgba(`, `padding: 10` and an `expo-symbols` import. It reported all 5 problems and let `gap: 0` through. Then reverted; passes again.
- `npm run db:test`: **not run**. Docker is off, and no tables changed.
- `npx expo-doctor`: **1 check failed**, because 9 SDK packages are a patch behind (expo-constants, expo-font, expo-linking, expo-router, expo-splash-screen, expo-status-bar, expo-web-browser and two more). This was already the case before Phase 1 and isn't caused by these changes; see question 2.
- `npm audit`: 10 moderate advisories in the dependency tree. Not investigated in this phase.

## Visual check (web, 360 × 800, Browser pane, existing dev server on :8081)

- `/`: dark `#111316`, left-aligned, Inter.
- `/dev/tokens`: no horizontal overflow (scrollWidth 360). All four Inter weights load. Type renders as 32/40, 22/28, 18/24, 16/24, 14/20 and 12/16, with letter-spacing −0.7, −0.4, −0.25, −0.18, −0.08 and 0 px. Six swatches plus the supporting chips, the spacing bars and the four radii all render.
- **Not checked:** Android rendering, the light navigation-bar icons on a device (docs say the style has no effect on gesture navigation or the Android 15 emulator), 130% system font size (web can't simulate it), and the splash screen (only a release build shows it properly).

## Decisions relied on

D24, D46, D47, D48. No D25–D45 defaults.

## Not done, by design

- No components: Phase 2 builds them, and DESIGN.md §6 and §7 have nothing to update yet.
- The splash image and adaptive icon are still the Expo template images on a charcoal background, until the wordmark is chosen.
- Nothing committed.

## Questions for the founder

1. Start Phase 2 (primitives and feedback components)?
2. Should I update the 9 SDK patch versions (`npx expo install --check`) as a separate small step?
