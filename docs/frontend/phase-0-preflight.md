# Frontend Phase 0 — Preflight

Date: 2026-11-11 · Status: done; founder answered all questions (recorded as D48) · Master directive: [EXECUTION-PROMPT.md](EXECUTION-PROMPT.md)

No app code was written in this phase.

## 1. What is in `app/` today

| Item | Current state | What Phase 1 needs |
|---|---|---|
| Expo / RN / React | `expo ~58.0.23`, `react-native 0.88.1`, `react 19.3.0`, TypeScript 6 | Unchanged |
| Routes | `src/app/_layout.tsx` (bare `<Stack/>`), `src/app/index.tsx` (centred light placeholder: hardcoded sizes, `gap: 8`, `opacity`) | Replace both in Phase 1 |
| `app.json` | `userInterfaceStyle: "automatic"`; splash background `#208AEF`; adaptive-icon background `#E6F4FE` | `"dark"`; splash and icon backgrounds `#111316` (C3) |
| Already installed | `expo-font`, `expo-system-ui`, `expo-status-bar`, `react-native-reanimated 4.7.1`, `react-native-worklets`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-web`, `@expo/ui` | Keep |
| Template extras that break the rules | `expo-glass-effect` (C2 glass), `expo-symbols` (C9, iOS SF Symbols) | Remove (Q2) |
| Not installed | `react-native-svg`, `lucide-react-native`, `@expo-google-fonts/inter`, `expo-haptics`, `expo-navigation-bar` | Add (§3) |

## 2. What the Expo v58 docs say (read 2026-11-11)

- **Fonts:** there are two ways to load Inter.
  - Embed at build time with the `expo-font` config plugin. Declare `fontDefinitions` with `weight` and `style` for each face, then style text with `fontFamily: 'Inter'` and `fontWeight: '700'`. There is no splash hold, but it needs a development build and has no web support.
  - Load at runtime with `useFonts` (SDK 58 array form) while holding the splash. It works in Expo Go and on web. With `@expo-google-fonts/inter`, each weight is its own family name on Android (`Inter_700Bold`).
  - **Plan:** use `useFonts` with `@expo-google-fonts/inter` now, because there's no Android toolchain to make a dev build (§5). Hide the weight-to-family mapping inside `theme/typography.ts` so screens never see it. Switch to the config plugin once dev builds exist.
- **Tabs:** `Tabs` ships inside `expo-router` (SDK 56+).
  - Per-tier tabs: compute `href: null` from `useEntitlements()`.
  - Styling: `tabBarStyle` and `tabBarButton`; or the headless `expo-router/ui` Custom tabs if the JS tab bar can't meet C5/C6.
- **Drawer:** also bundled in `expo-router` from SDK 56. It needs Reanimated, worklets and gesture handler, which are already installed. The side menu (N-04/N-05) uses it.
- **System bars:** Android is edge-to-edge, so content must use safe areas. `expo-navigation-bar` sets the bar's *style* only; the docs describe no colour option. **This changes C3** (Q5): the navigation bar can't be painted `#111316`. Instead it stays transparent over our `#111316` root background, with light icons. The root background is set with `expo-system-ui`. Use `<StatusBar style="light" />`.
- **Haptics:** `expo-haptics ~58.0.7` (SDK-pinned).
- **SVG:** `react-native-svg 15.16.0` (SDK-pinned).

## 3. Dependency plan (nothing installed yet)

| Action | Package | Version | Why | Needs dev build? |
|---|---|---|---|---|
| Add | `react-native-svg` | `npx expo install` → 15.16.0 | Lucide renders through it | No (in Expo Go) |
| Add | `lucide-react-native` | pin **1.62.0** (released 2026-10-27) | Icons (C9). Peer range covers React 19 and svg 15. Daily releases, so pin a version at least 2 weeks old, not "latest" (1.72.0 came out today) | No |
| Add | `@expo-google-fonts/inter` | 0.4.2 (2025-09-11) | Inter 400/500/600/700 via `useFonts` | No |
| Add | `expo-haptics` | `npx expo install` → ~58.0.7 | Set-logged tick, F4-12 (C10) | No |
| Add | `expo-navigation-bar` | `npx expo install` → ~58.0.4 | Light navigation-bar icons | No |
| Remove | `expo-glass-effect` | — | Glass is banned (C2) | — |
| Remove | `expo-symbols` | — | iOS SF Symbols; Lucide only (C9) | — |
| Keep, don't use yet | `@expo/ui` | — | Native UI kit; not needed for v1 primitives. Revisit only if a primitive can't meet the rules | — |

Install with `npx expo install` from `app/`, then run `npx expo-doctor`.

## 4. Changes the master prompt needs (not applied until approved)

1. **C3:** the Android navigation bar can't take a colour under edge-to-edge. Change it to "transparent navigation bar with light icons over the `#111316` root background (expo-system-ui)".
2. **§3.4 visual check:** there's no Android emulator on this Mac. Until one is installed, the only check available is web (`npx expo start --web` in the Browser pane). Web is not Android: font rendering, ripples and system bars differ. Each report must say "checked on web only".
3. **§3.1 `db:test`:** Docker isn't running, so the local Supabase stack can't start. UI phases add no tables. Reports will say "db:test not run (no tables changed, Docker off)" and won't claim a pass.
4. **Phase 1 fonts:** use runtime `useFonts`, not the config plugin, until dev builds are possible (§2).

## 5. Environment found

- Android SDK, `adb` and `emulator`: **not installed** (`~/Library/Android/sdk` is missing and `ANDROID_HOME` is unset).
- Docker: **not running**.
- `node_modules`: present in `app/`.

## 6. Founder answers (2026-11-11)

- Q1: D48 recorded as worded.
- Q2 and Q3: yes. Remove both packages, and add all five, with Lucide pinned at 1.62.0. Applied at the start of Phase 1.
- Q4: web only for now.
- Q5: C3 change accepted; applied to EXECUTION-PROMPT.md, along with §4 items 2–4.

### Questions as asked

- **Q1 · D48:** "Skip hi-fi mockups; build the frontend directly from the wireframes, styled with the D47 tokens." Is that the right wording to record?
- **Q2:** Remove `expo-glass-effect` and `expo-symbols`?
- **Q3:** Add the five packages in §3, with Lucide pinned at 1.62.0?
- **Q4:** Android: install Android Studio and an emulator, check on web only for now, or use a physical phone with Expo Go?
- **Q5:** Accept the C3 change (§4.1)?
