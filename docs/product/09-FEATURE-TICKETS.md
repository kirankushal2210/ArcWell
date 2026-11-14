# 09 · Feature Ticket List

**Updated:** 14 November 2026 (to D111). The PRD (doc 01) broken into tickets. Agents and contributors pick **one open ticket at a time**, meet its acceptance criteria, and pass the checks in AGENTS.md §6. When it's done, flip the status here in the same change.

**Status key:**
- ✅ done (built and tested on the local stack);
- 🟡 partial (works, with a known part left);
- ⬜ open;
- 💰 open, needs money or a paid account (after funding).

**Sizes:** S ≤ 1 day · M 2–4 days · L 1–2 weeks.

## Epic A · Accounts and access (B1)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| A-01 | Email-code sign-up and sign-in | 6-digit code by email; session persists; sign-out returns the phone to sample data | M | ✅ |
| A-02 | Roles fixed at sign-up | Role can't be changed by the user (pgTAP) | S | ✅ |
| A-03 | Consent per purpose | Health data required; AI and photos optional; append-only with policy version; withdraw in Privacy | S | ✅ |
| A-04 | 18+ confirmation | Sign-up can't finish without it (D106) | S | ✅ |
| A-05 | Personal invites with plans (D56) | Single use, 14-day expiry; plans, notes, name and details handed over on redeem | M | ✅ |
| A-06 | General invite link | Walk-ins join the coach; respects `coach_has_room` and standing | S | ✅ |
| A-07 | Leave, complete or remove a link | Access ends at once (pgTAP); athlete keeps data, becomes free | S | ✅ |
| A-08 | History sharing | Off by default; on lets the coach see earlier logs (pgTAP) | S | ✅ |
| A-09 | Google sign-in (D62, D112) | One tap on Android; links to the same account by email; the button appears only once it works | M | ⬜ needs a development build and a Google OAuth client |
| A-10 | Production sign-in email | Codes sent from the Arcwell domain through Resend | S | 💰 domain |
| A-11 | Invite links open the app | Domain + `assetlinks.json` + preview page; Play Install Referrer, with the typed code as fallback | M | 💰 domain |

## Epic B · Plans and templates (B2)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| B-01 | Training, nutrition, recovery and supplement plans | Coach (in good standing) or the self-guided athlete writes; others denied (pgTAP) | M | ✅ |
| B-02 | Coach plan in the athlete's Training (D105) | "Coach plan" replaces "Arcwell plan" for coached athletes | S | ✅ |
| B-03 | Templates (training, meals, stack) | Coach-only (pgTAP); starter, from scratch, from a spreadsheet | M | ✅ |
| B-04 | Plan builder with RPE and run, erg and station blocks (D104) | Rules from D69 enforced; "Why this?" sources | L | ✅ |
| B-05 | Enhanced tracking (D64) | Only after the athlete's consent; guard trigger | S | ✅ |
| B-06 | Custom exercises | Owner writes; coach and clients read | S | ✅ |
| B-07 | Exercise demo media | Licensed stills or video on exercise pages | M | 💰 licence |

## Epic C · Logging (B3, B4)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| C-01 | Workout logger | Sets with kg, reps, RPE; rest timer; plate maths; survives an app kill | L | ✅ |
| C-02 | Workouts and routines sync | Coach sees from join date (pgTAP); offline changes never pulled over | M | ✅ |
| C-03 | Food logging with Indian portions | IFCT + curated foods; macros and fibre; "My foods" | L | ✅ |
| C-04 | Meal plans with "Ate this" | Logs the planned items in one tap | S | ✅ |
| C-05 | AI meal scan (D96) | Plus only; athlete confirms before logging; cap 20 a day | M | 🟡 works; needs `GROQ_VISION_MODEL` set |
| C-06 | Server food database | `foods` table seeded from IFCT | M | ⬜ waits on IFCT usage rights (free to ask) |

## Epic D · Coaching loop (B5)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| D-01 | Weekly check-ins with photos | Coach replies only (guard); photos in private storage | M | ✅ |
| D-02 | Live chat with photos and PDFs | Realtime; read receipts; no duplicate on retry | M | ✅ |
| D-03 | Push on message, check-in, reply, plan change | `notify` checks the caller; no health data in the push | M | 🟡 server done; delivery needs a development build |
| D-04 | Scheduled pushes: check-in due, daily workout | `pg_cron` job calls a function; respects notification settings | M | 🟡 server done (D111: `claim_reminders`, `cron` function, pgTAP); delivery needs a development build; on per project via Vault secrets |
| D-05 | Report a coach profile | Button on the coach profile; goes to a support inbox | S | ✅ My coach and the invite page; mail to support (D111) |

## Epic E · Progress and recovery (B6)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| E-01 | Weight, measurements, photos | Coach sees from join day (pgTAP) | M | ✅ |
| E-02 | Recovery, habits, water, activity day logs | Plus and coached only | M | ✅ |
| E-03 | Transformation requests | Coach asks; athlete approves or withdraws (guard) | S | ✅ |
| E-04 | Export my data | JSON of everything the caller owns | S | ✅ |
| E-05 | Delete account | Files then user; cascades; works offline-safe | S | ✅ |
| E-06 | Health Connect | Sleep, HRV, steps read on device | M | ⬜ needs a development build |
| E-07 | Live heart rate in the interval timer | From the watch through Health Connect | M | ⬜ needs a development build |

## Epic F · Billing (B7)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| F-01 | Tier from the database | `athlete_tier()`: coached, pro or free | S | ✅ |
| F-02 | RevenueCat webhook | Secret checked; idempotent; older events ignored | M | ✅ |
| F-03 | Razorpay webhook | HMAC checked; clients never affected (D41) | M | ✅ |
| F-04 | Coach limits and lapsed billing (D40, D41) | Full or lapsed coach can't invite or edit plans (pgTAP) | S | ✅ |
| F-05 | Demo trial for investors | `demo-billing`, off unless `DEMO_BILLING=on` | S | ✅ |
| F-06 | Real Plus purchase in the app | `react-native-purchases`; buy, restore, and the RevenueCat id = Supabase id | M | 💰 Play Console |
| F-07 | Coach subscription links | Razorpay plans and links with `notes.coach_id` | S | 💰 company KYC |

## Epic G · AI coach (B8)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| G-01 | AI chat, tailor today, weekly review on the server (D108) | Entitlement, then cap (40, 15, 6); out of scope declined; rules fallback; sources | L | ✅ |
| G-02 | Coached athletes never served (D44) | 403 from the server even by direct call | S | ✅ |
| G-03 | Switch on the model | `GROQ_API_KEY` and `GROQ_MODEL` set on the hosted project | S | ⬜ free key |
| G-04 | AI chat memory (D109) | Today's chat kept on the phone only; clears at midnight and on Clear chat, sign-out, deletion, AI off; nothing on the server | S | ✅ |

## Epic H · Platform, quality and launch

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| H-01 | The 10 product documents | `docs/product/01`–`10` and AGENTS.md, linked from the README | M | ✅ |
| H-02 | CI runs every required check | lint (ESLint, tokens, legal), typecheck, Jest, pgTAP, db lint, deno check | S | ✅ |
| H-03 | Tests for untested logic | `recovery.ts`, `selfPlan()`, `programWeek`, `visibility.ts`, `tailor.ts`, `crm.ts`, `readSheet.ts`, `lib/alert.ts` | M | ✅ 94 tests in 8 files; found and fixed two bugs: vegan example day had chicken and dairy, and renewals from the 29th–31st slipped into the next month |
| H-12 | EAS build profiles | `app/eas.json`: development, preview (APK), production (app bundle) with channels | S | ✅ (linking to an Expo account is part of H-06) |
| H-13 | Billing mapping unit tests | RevenueCat and Razorpay event mapping covered by Jest | S | ✅ |
| H-14 | Foreign-key indexes | Every foreign key indexed (migration `fk_indexes`) | S | ✅ |
| H-15 | Demo readiness pass | Every coach and athlete screen opened as the demo accounts; the DEMO.md story checked | M | ✅ 116 screens crawled; fixed: Business tab crash (seeded lead), lead not found, negative stress and low recovery for clients without check-ins, 12 screens with no not-found state, injury questions not declined, two "+" buttons on Today, a leftover Sign out on Today, "Pro" label, switched-off Google button (D112) |
| H-04 | Investor demo | Seed script, guide, screenshots (DEMO.md) | M | ✅ |
| H-05 | Staging project | Supabase free project in Mumbai; migrations pushed; functions deployed | S | ⬜ free |
| H-06 | Installable test app | EAS internal distribution APK | S | ⬜ free tier |
| H-07 | Production project | Supabase Pro in Mumbai, backups | S | 💰 |
| H-08 | Play Store listing and closed testing | Data safety form, privacy URL, 3–5 coaches for 2–4 weeks | M | 💰 |
| H-09 | Legal review and company details | Registered name, address, Grievance Officer in the legal pages | S | 💰 |
| H-10 | Expert content review (D69) | Sports scientist and dietitian sign-off | M | 💰 |
| H-11 | Trademark search and filing | IP India, 1–2 classes | S | 💰 |

## Epic S · Security (doc 07 §10)

| ID | Ticket | Acceptance criteria | Size | Status |
|---|---|---|---|---|
| S-01 (SEC-01) | Rate limits on non-AI functions | Per-user limit on `notify` and `delete-account` | S | ✅ `call_try_use` (300 and 5 a day), pgTAP and curl |
| S-02 (SEC-02) | Sentry with PII scrubbing | App and functions; no health data in events | S | ⬜ free tier |
| S-03 (SEC-03) | Retention purge job | 30 days live, 90 days backups, as the Privacy Policy says | S | ✅ `purge_expired` + `cron` storage sweep, daily (D111) |
| S-04 (SEC-04) | CAPTCHA on sign-up | hCaptcha or Turnstile in Supabase Auth | S | ⬜ if abuse appears |
| S-05 (SEC-05) | Encrypt the on-phone cache | Encrypted storage for synced data | M | ⬜ v1.1 |
| S-06 (SEC-06) | External security review | Pen test before public launch | M | 💰 |

## Founder decisions blocking tickets

| Decision | Blocks |
|---|---|
| Company details | H-09 |
| Prices for Plus and coach plans | F-06, F-07 |
| Invite-link domain | A-10, A-11 |
