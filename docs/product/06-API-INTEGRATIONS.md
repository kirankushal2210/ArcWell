# 06 · API Integrations and Specifications

**Updated:** 14 November 2026 (to D111). Every outside service Arcwell talks to, how it's called, what's sent and what comes back. **Rule:** the app talks only to Supabase. Every other service is called by an Edge Function or calls us through a webhook. No third-party key ever ships in the app.

## 1. Integration map

| Service | Purpose | Called by | Auth | Cost now | Status |
|---|---|---|---|---|---|
| **Supabase Auth** | Email-code sign-in, sessions | App (`supabase-js`) | Publishable key, then user JWT | Free (local) | Live locally |
| **Supabase REST (PostgREST)** | All table reads and writes, SQL functions (RPC) | App sync layer | User JWT + RLS | Free | Live locally |
| **Supabase Realtime** | New messages, live | App | User JWT + RLS | Free | Live locally |
| **Supabase Storage** | Photos, PDFs (`athlete-files`) | App | User JWT + storage policies; 1-hour signed URLs | Free | Live locally |
| **Supabase Edge Functions** | Server-only actions (section 3) | App, webhooks | User JWT, or the provider's secret | Free | Live locally |
| **Groq** | AI model for the AI coach and meal scan | `_shared/ai/groq.ts` | `GROQ_API_KEY` (function secret) | Free tier | Wired; switched on by key (rules engine without) |
| **RevenueCat + Google Play Billing** | Arcwell Plus subscriptions | App SDK (to add) → RevenueCat → `revenuecat-webhook` | Webhook shared secret | Free to $2.5k MTR | Webhook done and tested; SDK after Play Console |
| **Razorpay** | Coach subscriptions (links, outside the app) | Razorpay → `razorpay-webhook` | HMAC-SHA256 signature | Per transaction | Webhook done and tested; live after KYC |
| **Expo Push (FCM)** | Push notifications (events and scheduled reminders) | `notify` and `cron` functions → `exp.host` (`_shared/push.ts`) | Expo access token (optional) | Free | Functions done; delivery needs a development build |
| **pg_cron + pg_net** (inside Supabase) | Scheduled reminders and the retention purge (D111) | Postgres → `cron` function | `CRON_SECRET` (function secret, also in Vault) | Free | Done; turned on per project by two Vault secrets (doc 10) |
| **Android Health Connect** | Sleep, HRV, steps from devices | App, on device only | Android permission prompt | Free | Screen in place; module needs a development build |
| **Google Sign-In** | One-tap sign-in | Supabase Auth provider | OAuth client (Google Cloud) | Free | Planned (v1 launch) |
| **Resend** | Real sign-in emails (SMTP for Auth) | Supabase Auth | SMTP key (dashboard) | Free to 3k a month | Planned (local uses Mailpit) |
| **Sentry** | Crash and error reports | App, functions | DSN | Free tier | Planned |
| **EAS Build / Update** | Builds and over-the-air updates | Developers | Expo account | Free tier | Set up at funding |

Adding a service needs: a line in this table, a decision in DECISIONS.md, its secret listed in section 5, and a privacy check (what personal data it gets) recorded in doc 07 and the Privacy Policy.

## 2. Supabase from the app

**Client:** `app/src/lib/supabase.ts` creates one client from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Without them the app runs on sample data (sample mode).

| Area | Code | Calls |
|---|---|---|
| Sign-in | `features/accounts/repo.ts` | `auth.signInWithOtp({email})`, `auth.verifyOtp({email, token, type: 'email'})`, `auth.signOut()` |
| Accounts | `repo.ts` | `profiles`, `consents` (insert), `invites`, RPCs `redeem_invite`, `invite_preview`, `invite_open`, `invite_details`, `invite_coach_profile`, `end_link`, `share_history`, `athlete_tier`, `export_my_data` |
| Sync | `features/sync/cloud.ts`, `useCloudSync.ts` | Select every readable table; upsert and delete changed rows (diffs from `map.ts`); pulls every 20 s and on foreground |
| Chat | `cloud.ts` | Realtime `postgres_changes` on `messages`; `read_at` update |
| Files | `cloud.ts` | `storage.from('athlete-files').upload(<athlete>/<area>/<file>)`, `createSignedUrl(path, 3600)` |
| Functions | `repo.ts`, `features/ai/coachClient.ts`, `features/ai/scanMeal.ts` | `functions.invoke(name, {body})` (section 3) |

**Errors:** every wrapper returns `{data, error}`, where `error` is a plain sentence for the user ("Couldn't send that. It will retry."). Raw Postgres or HTTP errors are never shown.

## 3. Edge Functions (request and response specs)

All functions are `POST` with a JSON body and JSON replies. CORS is allowed for the app's web build. Error bodies are always `{ "error": "<code>" }` and never contain user data.

| Common code | HTTP | Meaning |
|---|---|---|
| `signed_out` | 401 | Missing or invalid user JWT |
| `unauthorized` | 401 | Webhook secret or signature wrong |
| `bad_request` | 400 | Body malformed or fails validation |
| `not_entitled` | 403 | Not Plus, no AI consent, or coached (D44) |
| `not_allowed` | 403 | Caller can't act on that row |
| `daily_limit` | 429 | Daily AI cap reached |
| `rate_limited` | 429 | Daily call cap reached for a non-AI function (S-01) |
| `method` | 405 | Not POST |
| `server` | 500 | Database error (logged as a code only) |

### 3.1 `ai-coach` (B8, D108)

- **Auth:** user JWT. **Checks in order:** signed in → `ai_entitled()` → out-of-scope filter (chat only; answered at once and not counted; covers injuries and pain in everyday words, medical conditions, medicines, drugs, supplements and contest prep, with the same pattern on the phone and the server, checked by a test) → `ai_try_use(feature, cap)` → model or rules → answer validated.
- **Daily caps:** chat 40, tailor 15, review 6.

**Request**

```json
{ "task": "chat" | "tailor" | "review",
  "question": "string, 2–500 chars (chat)",
  "text": "string, 2–500 chars (tailor)",
  "context": { "week numbers only: kcal, protein, sessions, sleep, weight trend …" } }
```

`context` is cleaned by `cleanContext()`: only known numeric fields survive. No names, notes or free text reach the model.

**Responses (200)**

| Task | Body |
|---|---|
| chat | `{ engine: "model" \| "rules", kind: "answer" \| "out_of_scope" \| "unknown", text, sources: [source ids] }` (ids from the approved list in `_shared/ai/coach.ts`; the app shows them as titles and links) |
| tailor | `{ engine, kinds: [0–3 of "minutes30", "trim", "knee", "back", "shoulder", "noBarbell"] }` |
| review | `{ engine, tips: [{ title, text, action: "nutrition" \| "recovery" \| "tailor" \| "plan" \| "keep_going", sources: [ids] }] }` |

If the model errors or its answer fails validation, the rules engine answers instead (`engine: "rules"`).

### 3.2 `scan-meal` (D96)

- **Auth:** user JWT; `ai_entitled()`; cap 20 a day.
- **Request:** `{ image: base64 (≤ 4 MB), mime: "image/jpeg" | "image/png" | "image/webp" }`.
- **Response 200:** `{ status: "ok", foods: [{ name, grams, kcal, protein, carbs, fat, confidence: "high" | "check" }] }` or `{ status: "not_food" }`. Calories are re-checked against the macros on the server. The athlete confirms before anything is logged.
- **Errors:** 413 `too_large`, 502 `unreadable` or `model`.
- **Needs:** `GROQ_VISION_MODEL`. Without it, the photo screen falls back to search.

### 3.3 `notify` (B5)

- **Auth:** user JWT. Every lookup runs as the caller first, so RLS proves the caller did the thing.
- **Request:** one of
  - `{ kind: "message", id }`;
  - `{ kind: "check_in", id }`;
  - `{ kind: "check_in_reply", athleteId, id }`;
  - `{ kind: "plan", athleteId }`.
- **Limit:** 300 calls per person per UTC day (`call_try_use`), then 429 `rate_limited`.
- **Settings:** if the recipient is an athlete who turned that type off (Menu → Notifications: `messages`, `checkIns`, `plan`), nothing is sent and the reply is `{ ok: true, sent: 0 }`.
- **Response:** `{ ok: true, sent: <device count> }`.
- **Push content:** title and "From <name>" only, never message text or health data. `data.route` opens the right screen.
- **Dead tokens:** tokens Expo reports as `DeviceNotRegistered` are deleted.

### 3.4 `delete-account` (Google Play rule)

- **Auth:** user JWT. Acts only on the caller's id from the verified session.
- **Request:** empty. **Response:** `{ ok: true }`.
- **Limit:** 5 calls per person per UTC day, then 429 `rate_limited`. The counter is keyed to the auth user, so someone who never finished onboarding can still delete their account.
- **Effect:** removes `athlete-files/<id>/**` (paged, through the Storage API), then deletes the auth user. Every table cascades; coaching links end.

### 3.5 `revenuecat-webhook` (B7)

- **Auth:** `Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH>` (constant-time compare). `verify_jwt = false`.
- **Request:** RevenueCat event `{ event: { type, app_user_id, product_id, expiration_at_ms, event_timestamp_ms, period_type, … } }`. `app_user_id` must be the Supabase user id (the app sets it at RevenueCat log-in).
- **Effect:** `plusChange()` maps INITIAL_PURCHASE, RENEWAL, UNCANCELLATION, PRODUCT_CHANGE, NON_RENEWING_PURCHASE and SUBSCRIPTION_EXTENDED to Plus until the expiry; CANCELLATION and BILLING_ISSUE keep Plus until the expiry; EXPIRATION sets free. Upserts `subscriptions`. Older events never overwrite newer ones.
- **Response:** `{ ok: true, tier }` or `{ ok: true, ignored: "<reason>" }` (always 200 for events we choose to skip, so RevenueCat doesn't retry).

### 3.6 `razorpay-webhook` (B7)

- **Auth:** `X-Razorpay-Signature` = HMAC-SHA256(raw body, `RAZORPAY_WEBHOOK_SECRET`). `verify_jwt = false`.
- **Request:** Razorpay `subscription.*` events; `payload.subscription.entity.notes.coach_id` is the coach's Supabase id (set when the subscription link is created).
- **Effect:** `coachChange()` maps authenticated, activated, charged and resumed to active; pending to grace; halted, paused, cancelled and completed to lapsed. Upserts `coach_billing`. Clients are never affected (D41).
- **Response:** `{ ok: true, status }` or `{ ok: true, ignored }`.

### 3.7 `demo-billing` (investor demos only)

- **Auth:** user JWT; returns 404 `off` unless `DEMO_BILLING=on`.
- **Request:** `{ action: "trial" | "cancel" }`.
- **Effect:** writes the same `subscriptions` row the RevenueCat webhook would (7-day trial).
- **Response:** `{ ok: true, tier }`. **Never enabled in production.**

### 3.8 `cron` (D111, pg_cron only)

- **Auth:** `x-cron-secret: <CRON_SECRET>` (constant-time compare), checked before the body is read. `verify_jwt = false`. Called only by `run_cron_call()` from pg_cron; never by the app.
- **Request:** `{ job: "reminders" }` (every 15 minutes) or `{ job: "purge" }` (daily, after `purge_expired()`).
- **reminders:** `claim_reminders()` returns the workout and check-in reminders due now and records them, so a rerun sends nothing twice. Pushes: "Training time" (→ `/athlete/training`) and "Check-in due today" (→ `/athlete/weekly-check-in`). No health data.
- **purge:** removes every file in `athlete-files` whose top folder is an account that no longer exists.
- **Response:** `{ ok: true, due, sent }` or `{ ok: true, orphans, removed }`. Errors: 401 `not_allowed`, 400 `bad_request`, 405 `method`, 500 `server`.

## 4. Outbound calls (from functions)

| To | From | Sent | Never sent |
|---|---|---|---|
| Groq `POST /openai/v1/chat/completions` | `_shared/ai/groq.ts` | System prompt, the question, week-level numbers, or the meal photo | Name, email, coach, notes, messages, ids |
| Expo `POST https://exp.host/--/api/v2/push/send` (batches of 100) | `notify`, `cron` | Device token, title, "From <name>" or a fixed reminder line, route | Message text, health data |

**Timeouts and failure:**
- Groq: failure → rules engine.
- Push: failure → skipped silently (the app works without push).
- No retries that could double-charge or double-send.

## 5. Secrets and configuration

| Name | Where | Used by |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `app/.env` (public by design) | App |
| `EXPO_PUBLIC_DEMO_BILLING` | `app/.env` (demo builds only) | Paywall |
| `AI_PROVIDER`, `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_VISION_MODEL` | Function secrets | AI |
| `REVENUECAT_WEBHOOK_AUTH` | Function secret + RevenueCat dashboard | Webhook |
| `RAZORPAY_WEBHOOK_SECRET` | Function secret + Razorpay dashboard | Webhook |
| `DEMO_BILLING` | Function secret (demo only) | demo-billing |
| `CRON_SECRET` | Function secret, and the same value in Vault as `cron_secret` | cron |
| Vault `project_url` | Vault (the project's `https://<ref>.supabase.co`) | `run_cron_call()` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Injected by Supabase | Functions |

- **Local:** `supabase/functions/.env` (git-ignored; template in `.env.example`).
- **Hosted:** `npx supabase secrets set NAME=value`.
- **The service-role key** exists only inside functions (`asService()`), used for webhooks, deletion, push-token lookup and the scheduled jobs. It is never in the app.

## 6. Versioning and change rules

- A function's request and response shape is a contract with the app. **Add fields; don't rename or remove** without shipping the app change first (old app versions stay in use for weeks).
- Every function the app calls must handle `OPTIONS` (CORS); every function rejects non-POST and returns the common error codes above. Shared helpers: `_shared/http.ts`.
- Webhooks must be **idempotent** (keyed on the user id, with `last_event_at` ordering) and return 200 for events they ignore.
- New integrations get curl checks recorded in the PR, plus a unit test for any pure mapping code in `_shared/`.

## 7. After funding (paid or account-gated)

| Step | Integration work |
|---|---|
| Play Console account | Add `react-native-purchases` (`npx expo install`), set the RevenueCat app user id to the Supabase id on sign-in, swap the demo trial for real purchase and restore, set the webhook URL and secret |
| Razorpay KYC | Create plans; make subscription links with `notes.coach_id`; point the webhook at the hosted function |
| Supabase Pro (Mumbai) | Link the project, push migrations, set secrets, deploy functions |
| Domain + Resend | Custom SMTP for Auth emails from the Arcwell domain |
| Google Cloud | OAuth client; enable Google in Supabase Auth |
| EAS development build | Turns on push (FCM credentials) and Health Connect (`react-native-health-connect` config plugin) |
| Sentry | `@sentry/react-native` with PII scrubbing; functions report error codes only |
