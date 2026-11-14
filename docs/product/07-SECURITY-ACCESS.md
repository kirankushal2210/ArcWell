# 07 · Security and Access Document

**Updated:** 14 November 2026 (to D108). Who can see and do what, how that's enforced, what happens when things fail, and what we do when something goes wrong. **Rule:** access is enforced in the database (row-level security) and on the server, never only by hiding things in the app.

## 1. Roles

| Role | How you get it | Notes |
|---|---|---|
| **Signed out** | Default | Can open legal pages, the invite page (coach profile preview) and onboarding. Nothing personal |
| **Athlete (free)** | Sign up as an athlete | `profiles.role = 'athlete'`, fixed at sign-up |
| **Athlete (Plus)** | Active `subscriptions` row (RevenueCat, or the demo trial) | `athlete_tier() = 'pro'` |
| **Coached athlete** | Redeems a coach's invite | `athlete_tier() = 'coached'`. Never AI, even with a Plus row (D44) |
| **Coach** | Sign up as a coach | `profiles.role = 'coach'`. Standing and room from `coach_billing` (D40, D41) |
| **Service** | Edge Functions only (`asService()`) | Webhooks, account deletion, push lookup. Bypasses RLS, so it's used only after the function has checked the caller |
| **Operator (founders)** | Supabase dashboard | No admin app in v1. Dashboard accounts use 2FA; production data is opened only to fix a reported problem |

A user's role can't be changed by the user (`check_role` trigger). One account is one role.

## 2. Permission matrix

✓ = allowed · — = denied · "from join" = only rows dated on or after the link started, unless the athlete shares history.

| Data | Athlete (own) | Their current coach | Past coach | Other coaches | Signed out |
|---|---|---|---|---|---|
| Profile, preferences | read, write | read | — | — | — |
| Plans (training, nutrition, recovery, supplements) | read; write if self-guided | read, write (in good standing) | — | — | — |
| Workouts, food, body, photos, day logs | read, write | read from join | — | — | — |
| Check-ins | read, write | read from join; reply only | — | — | — |
| Messages | read, send while linked | read and send in their thread, from join | — | — | — |
| Coach's notes about the client | — | read, write | read, write (their own notes) | — | — |
| Templates, leads, CRM | — | own only | own only | — | — |
| Transformation photos | approve, withdraw | ask; see if approved | see only if approved | — | — |
| Subscription, AI usage | read | — | — | — | — |
| Coach billing | — | own only | — | — | — |
| Files (`athlete-files/<athlete>/…`) | read, write | read; add only into `chat/` | — | — | — |
| Coach profile | — | own | — | — | invite preview fields only (`invite_coach_profile`) |
| Consents | read, add | — | — | — | — |

**AI (chat, tailor, review, meal scan):** only Plus athletes who gave AI consent and have no coach. Checked by `ai_entitled()` inside every AI function, before any model call.

## 3. How it's enforced

1. **RLS on every table** (27 tables, 182 pgTAP tests in `supabase/tests/`; `008_schema_hygiene` fails if any table lacks RLS or a policy). Policies use the helper functions in doc 05 §5. Every new table must ship with tests proving the three rules in AGENTS.md.
2. **Least-privilege grants:**
   - `anon` gets nothing except the invite-preview functions;
   - `authenticated` gets column-level insert and update only where the app writes;
   - ids, owners, timestamps and status set by the server can't be written by users.
3. **Guards inside rows:** triggers stop a coach from editing an athlete's check-in answers (reply only), a recipient from editing a message (only `read_at`), and anyone from approving a transformation except the athlete.
4. **Security-definer functions** run with `search_path = ''`, schema-qualified names, explicit caller checks, and `execute` revoked from `public` and `anon` unless meant for them.
5. **Edge Functions** read the caller from the verified JWT, never from the body; run lookups as the caller first (so RLS applies); use the service role only after.
6. **Webhooks** check a shared secret (RevenueCat) or HMAC signature (Razorpay) with a constant-time compare, before parsing anything.
7. **Storage:** one private bucket. The path's first folder is the owner (`storage_owner()`). Files are shown only through signed URLs that expire in 1 hour; payloads store paths, never URLs.
8. **Sessions:** 1-hour access tokens with rotating refresh tokens. Sign-in codes are 6 digits, expire in 1 hour and are rate-limited per IP (30 tries per 5 minutes).

## 4. Consent (DPDP Act, 2023)

| Purpose | Asked | If declined |
|---|---|---|
| `health_data` | At sign-up (required to use the app: it's a health app) | Can't create an account |
| `ai` | Before the first AI feature | AI stays off; everything else works |
| `photos` | Before the first progress or check-in photo | Photos stay off; everything else works |

- Consents are **append-only**: each change is a new row with the policy version, and the latest row per purpose wins.
- Withdrawing is as easy as giving: Menu → Privacy and permissions.
- **Age:** 18+ only (D106), confirmed at sign-up. No accounts for minors, so no guardian consent flow is needed.

**Data-subject rights:**
- **Access:** Export my data (`export_my_data()`, JSON).
- **Correction:** edit any field in the app.
- **Erasure:** Delete account (`delete-account`; immediate, with files).
- **Grievance:** the contact in the Privacy Policy.

## 5. Data protection

| Area | Rule |
|---|---|
| Location | Production data in Supabase **Mumbai (ap-south-1)** |
| In transit | HTTPS only (TLS from Supabase); no plain-HTTP endpoints in hosted builds |
| At rest | Supabase encryption at rest (disk and backups). The on-phone cache is AsyncStorage (not encrypted yet: ticket SEC-05) |
| To AI | Only week-level numbers and the user's question; never names, email, notes, messages, ids or earlier chat (`cleanContext`) |
| AI chat | Kept on the phone only, for the day; never stored on the server; wiped on Clear chat, sign-out, account deletion and AI off (D109) |
| In push | "New message, from <name>": never message text or health data |
| In logs | **No health data or personal data in logs or error messages**: functions log an error *name* or *code* only. App errors shown to users are plain sentences |
| Secrets | Never in the app or git. Public app config only (`EXPO_PUBLIC_*`). Function secrets via `supabase secrets set`. The service-role key lives only inside functions |
| Retention | Deleted accounts are cleared from live systems within 30 days and from backups within 90 days (Privacy Policy). Ended coaching keeps the athlete's data with the athlete |

## 6. Error boundaries and screen states

Every screen handles all five states, using the shared components:

| State | Component | Rule |
|---|---|---|
| Loading | `LoadingScreen` / `Skeleton` | Skeleton where the layout is known; never a blank screen |
| Empty | Screen's own empty card | Says what to do next, with one action |
| Error | `ScreenError` (with Retry) | Root `ErrorBoundary` in `app/_layout.tsx` catches render crashes; the message never shows a stack trace or data |
| Offline | `OfflineBanner` (`useOnline`) | Logging still works; changes wait and sync later |
| Not found or no access | `NotFound` | Same screen for "doesn't exist" and "not yours", so ids can't be probed |

## 7. Failure protocols

| Failure | What happens | Who sees what |
|---|---|---|
| Network down while logging | Saved on the phone; pushed when back. Pulls never overwrite unsaved changes (D107) | Offline banner; nothing lost |
| Push to the server fails (retryable) | Retried on the next sync; pulls wait | Nothing; the change stays on the phone until it saves |
| Write refused by RLS | Not retried; the server's copy wins on the next pull | The change disappears (e.g. the link ended) |
| AI model down or answer invalid | Rules engine answers (`engine: "rules"`) | A normal answer |
| AI cap reached | 429 `daily_limit` | "That's today's questions used. They reset tomorrow." (meal scan: search or quick add instead) |
| Webhook fails | Provider retries (200 is returned only after the write) | Nothing; older events never overwrite newer |
| Coach payment lapses | Grace, then lapsed: can't invite or edit plans | Coach sees a banner; **clients are never affected** (D41) |
| Coaching ends | Link ends; coach access stops at once | Athlete keeps everything, plans read-only |
| App crash | Root error boundary, Retry | "Something went wrong": nothing you logged was lost, Try again |

## 8. Incident and breach response

1. **Detect:** user report, Sentry (when wired), Supabase logs, or a failing pgTAP test.
2. **Contain (within 1 hour):**
   - turn off the affected function (`supabase functions delete` or remove its secret);
   - rotate any exposed key in the provider and in function secrets;
   - revoke sessions if accounts are affected.
3. **Assess:** what data, whose, since when. Use Supabase logs, never by browsing user data more than needed.
4. **Notify:**
   - **CERT-In** within 6 hours of noticing a reportable cyber incident (CERT-In directions, 2022);
   - the **Data Protection Board of India** and **affected users** without delay for a personal-data breach, with the full report within 72 hours (DPDP Rules).
5. **Fix and prove:** a migration or code fix with a pgTAP or unit test that fails before and passes after.
6. **Write up:** a blameless note in `docs/incidents/` (what, impact, timeline, fix, prevention). No personal data in the note.

**Who:** the founder is the incident owner until a security lead is hired. The Privacy Policy names the grievance officer contact.

## 9. Secure development rules (for people and AI agents)

- Never add a table without RLS, policies and pgTAP tests in the same change.
- Never call the service role from the app, and never pass a user id in a body to decide whose data to touch.
- Never log request bodies, questions, answers, photos, emails or names.
- Never put a signed URL, token or key in a payload, URL query string or log.
- Validate every function input (type, length, allowed values) before use; cap sizes (500 chars for AI text, 4 MB for images).
- `npm run lint && npm run typecheck && npm run db:test` and jest must pass; CI runs `deno check` on functions.

## 10. Known gaps (tracked in doc 09)

| Ticket | Gap | When |
|---|---|---|
| SEC-01 | No rate limit on non-AI functions (`notify`, `delete-account`) beyond Auth's IP limits | Before beta |
| SEC-02 | Sentry with PII scrubbing not wired | Before beta |
| SEC-03 | Retention purge job (30/90 days) not built for the hosted project | Before launch |
| SEC-04 | CAPTCHA on sign-up (Supabase Auth supports hCaptcha / Turnstile) | If abuse appears |
| SEC-05 | On-phone cache not encrypted | v1.1 |
| SEC-06 | External security review / pen test | After funding, before public launch |
