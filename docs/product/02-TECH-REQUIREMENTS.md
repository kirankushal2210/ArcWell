# 02 · Technical Requirements Document (TRD)

**Updated:** 14 November 2026 (to D108). **Rule:** this is the fixed stack. Agents and contributors must not add, swap or "upgrade to" another framework, database, host, state library, styling system or provider without a decision recorded in DECISIONS.md first. If something here seems wrong, raise it; don't route around it.

## 1. Stack at a glance

| Layer | Choice (version) | Notes |
|---|---|---|
| Mobile app | **Expo SDK 58** (`expo ~58.0.23`), **React Native 0.88**, **React 19.3**, **TypeScript ~6.0** (strict) | Android first; iOS later from the same code |
| Navigation | **Expo Router ~58** (typed routes), files in `app/src/app/` | No React Navigation set-up by hand |
| Rendering and perf | React Compiler (on), Reanimated 4.7, react-native-svg 15 | No manual `useMemo` everywhere; keep render pure |
| Styling | Own design system: tokens in `app/src/theme/`, primitives in `app/src/components/` | **No** Tailwind/NativeWind, styled-components or UI kits. `npm run tokens:check` bans raw colours and spacing |
| Icons | lucide-react-native | No other icon set |
| App state | One store: `CoachDataProvider` (`features/coach/CoachData.tsx`) and `ActiveWorkout` for the live workout | **No** Redux, Zustand, MobX or React Query |
| Device storage | AsyncStorage (store cache, per account), expo-sqlite localStorage (auth session) | Encrypted offline copy later |
| Backend | **Supabase**: Postgres 17 with row-level security, Auth, Storage, Realtime, Edge Functions (Deno 2) | Region **Mumbai (ap-south-1)** for production (D72) |
| Data access | `@supabase/supabase-js ^2.119` only; sync layer in `app/src/features/sync/` | No other ORM, GraphQL or REST client |
| Server logic | SQL functions (security definer, `search_path = ''`) and Edge Functions in `supabase/functions/` | No separate Node or Express server |
| Scheduled jobs | **pg_cron** calls the `cron` Edge Function through **pg_net** (D111) | Reminders every 15 minutes, retention purge daily; secrets in Vault |
| AI | Provider-neutral layer `supabase/functions/_shared/ai/`: Groq first, Claude or OpenAI later by config; rules-engine fallback (D108) | Never called from the app |
| Billing | RevenueCat with Google Play Billing (athletes); Razorpay subscription links (coaches), both by webhook | See doc 06 |
| Push | Expo Notifications (FCM underneath) through the `notify` Edge Function | Needs a development build |
| Wearables | Android Health Connect | Development build |
| Builds and updates | **EAS Build** (App Bundle), **EAS Update** | Package `com.arcwell.app`, scheme `arcwell` |
| Web build | Expo web, output `server` (used for previews, legal pages and the investor demo) | Not a product surface |
| Tests | Jest 30 with jest-expo (unit); **pgTAP** (database access rules); curl checks for Edge Functions | |
| Lint and format | ESLint 9 (expo config), Prettier defaults, `tokens:check`, `legal:check` | |
| CI | GitHub Actions: app lint and typecheck, database tests and db lint, Edge Functions `deno check` | |
| Monitoring | Sentry (free tier). Planned, not yet wired | |
| Node | 20+ (developed on 24) | |

## 2. Repository layout

```
app/                    Expo app
  src/app/              routes (every file is a screen; _layout.tsx = navigator)
  src/components/       design-system primitives (Text, Button, …)
  src/features/<area>/  logic, hooks and screen parts per area (athlete, coach, sync, ai, legal…)
  src/theme/            tokens (must match docs/design/theme-tokens.css)
  src/lib/              supabase client, alert, storage shims
  public/legal/         generated static legal pages (npm run legal:build)
supabase/
  migrations/           schema; one file per change, never edited once applied
  tests/                pgTAP tests (access rules for every table)
  functions/            Edge Functions; _shared/ holds code they share (pure TS where possible)
  demo/fixtures.json    payload shapes for the demo seed
scripts/demo-seed.mjs   investor demo data (local only)
docs/                   product docs (docs/product/), decisions, design, roadmap
```

## 3. How data moves (D107)

1. **Sample mode** (no `EXPO_PUBLIC_SUPABASE_URL`): the app runs entirely on built-in sample data, saved on the phone.
2. **Signed in:** `useCloudSync` loads everything the account may read into the store:
   - row-level security filters every query;
   - changes are pushed as row diffs about 1.2 s after they settle;
   - the app pulls again every 20 s, when it comes back to the foreground, and live on new messages (Realtime);
   - offline changes are kept until they're saved.
3. **Files:** uploaded to the private `athlete-files` bucket as `<athlete id>/<area>/<file>`; shown through 1-hour signed URLs.
4. **Server-only actions:** SQL functions (redeem invite, end link, share history, tier, AI entitlement and caps) and Edge Functions (AI coach, meal scan, webhooks, deletion, push, scheduled jobs).

## 4. Environments

| Environment | Backend | Cost | Status |
|---|---|---|---|
| Local | `npm run db:start` (Supabase CLI 3.1, Docker). Storage pinned to v1.89.0 | Free | In use |
| Demo | Local, plus `npm run demo:seed` and `EXPO_PUBLIC_DEMO_BILLING=1` | Free | In use ([DEMO.md](../DEMO.md)) |
| Staging | Supabase free project (Mumbai) | Free | Not created |
| Production | Supabase Pro (Mumbai), EAS production builds, Play Store | Paid | After funding |

**Configuration:**
- **App:** `app/.env` holds only public values: the Supabase URL, the publishable key and the demo flag.
- **Function secrets:** `supabase/functions/.env` locally, `supabase secrets set` when hosted. These are the Groq key and model, the RevenueCat webhook auth, the Razorpay webhook secret and `DEMO_BILLING`.
- **Never in git:** both `.env` files.

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Logging a set or a food responds instantly; no screen blocks on the network. Pushes are debounced and run in the background |
| Offline | The workout in progress survives app kill (AsyncStorage). Changes made offline are never pulled over (D107) |
| Reliability | No lost workout or chat data (launch gate). Message ids are deterministic, so a retry never duplicates |
| Security | RLS on every table, with pgTAP proofs; least-privilege column grants; security-definer functions with an empty search_path (doc 07) |
| Privacy | Health data stays in India (Mumbai); only week-level numbers reach AI; nothing personal in logs |
| Accessibility | 48 dp tap targets; system font scaling always on; screen-reader labels on icon buttons; contrast per the tokens |
| Localisation | English at launch; layouts allow about 40% longer text (Hindi later); kg and cm; ₹; IST dates via local-day helpers (never `toISOString().slice(0,10)`) |
| Device support | Android 8+ phones; dark theme only (D67, D83) |
| Quality gates | `npm run lint && npm run typecheck && npm run db:test` and the jest suite pass before any merge; CI enforces them |

## 6. Versions and upgrades

- **Expo packages:** add them with `npx expo install` only; never with `npm install` (app/AGENTS.md).
- **Expo SDK upgrades:** one at a time, on their own PR, after reading the SDK's changelog.
- **Supabase CLI and Docker images:** upgrade deliberately. The storage image is pinned because v1.90.1 fails locally.
- **Migrations:** new ones only. A pushed migration is never edited; fix forward.

## 7. Known technical limits (v1)

- Health Connect, live heart rate and push delivery need an EAS development build; Expo Go can't run them.
- The web build uses server rendering, so modules must not touch `localStorage` or `window` at import time.
- Exercise demo media isn't licensed yet (no video in v1).
- Without a Groq key, the AI coach answers from the rules engine (D108).
