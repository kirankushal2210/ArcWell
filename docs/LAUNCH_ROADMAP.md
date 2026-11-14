# Arcwell: from finished front end to a live app

Written 14 November 2026, after the full front-end audit (FRONTEND_AUDIT.md §9) and its fixes (commit 9326a2d).

- [Where things stand](#where-things-stand)
- [1. Front end: what's still pending](#1-front-end-whats-still-pending)
- [2. Back end: what exists and what's pending](#2-back-end-what-exists-and-whats-pending)
- [3. Tech stack](#3-tech-stack)
- [4. Start to deployment, step by step](#4-start-to-deployment-step-by-step)
- [5. What costs money](#5-what-costs-money)
- [6. Decisions waiting on the founder](#6-decisions-waiting-on-the-founder)

## Where things stand

**The front end is feature-complete for v1 on sample data.**

- Every screen in the spec is built and reachable.
- Data lives on the phone (AsyncStorage, through `features/coach/CoachData.tsx`).
- Lint, typecheck, 159 unit tests and 73 database tests pass.

**The back end has its foundations and one live feature.**

- **Seven tables, each with row-level security (RLS) and tests:** accounts, consents, coach links, invites, preferences, subscriptions and AI usage.
- **One working Edge Function:** the AI meal scan.
- **No hosted environment yet.** Everything runs on the local Supabase stack.

---

## 1. Front end: what's still pending

### Small, can be done now

| Item | Size |
|---|---|
| Tests for logic that has none. Athlete: `recovery.ts`, `selfPlan()`, `toSession`, `programWeek`, `visibility.ts`, `notifications.ts`. AI: `tailor.ts`, `answers.ts`. Science: `strength.ts`. Coach: `crm.ts`, `enhanced.ts`, `supplements.ts`, `readSheet.ts`. Also `lib/alert.ts`. | M |
| Docs: bring `SPEC.md` up to D106. Update `DESIGN.md` §3, §6 and §7 and `sitemap.md`. Fix the two contradictions in `DECISIONS.md`. Correct `PLAN.md`'s "not built" lines. | M |
| Two founder calls (§6): the AI chat forgets its messages, and the logger's progression hint uses the AI sparkle icon. | S |

### Needs a development build, not Expo Go

These can only be finished in a development build (EAS):
- Health Connect (sleep, heart rate, HRV and steps from a watch).
- Live heart rate in the interval timer.
- Exercise demo media, which also needs a licence (§5).
- The real Google sign-in button, which is turned off today (D62).
- Push notifications that arrive with the app closed.

### Front-end work that comes with the back end

These change as each back-end slice replaces sample data:
- Loading and error states on each screen. The shared pieces exist: `LoadingScreen`, `ScreenError` and `OfflineBanner`.
- Offline sync for the workout in progress and food logs.
- Real invite links: the domain plus Android App Links, so a tapped link opens the app.
- Billing screens driven by RevenueCat and Razorpay instead of sample states.
- A "Report" button on coach profiles. Copyright notices come in by email until then.

---

## 2. Back end: what exists and what's pending

### Already built (`supabase/`)

- **Tables:**
  - `profiles` (role, name)
  - `consents` (append-only, latest per purpose wins)
  - `coach_clients` (status, join date, history access)
  - `invites` (general and personal, single-use)
  - `athlete_preferences`
  - `subscriptions`
  - `ai_usage` (daily cap)
- **Functions:**
  - access checks: `coach_can_read`, `is_active_client_of`, `is_active_coach_of`, `has_consent`, `ai_entitled`
  - invite flow: `redeem_invite`, `invite_preview`
  - coaching and AI: `end_coaching`, `set_history_access`, `ai_try_use`
- **Edge Function `scan-meal`:** it checks sign-in, entitlement and the daily cap, calls Groq vision and validates the answer. It doesn't log any health data.
- **AI layer** `supabase/functions/_shared/ai/`: one interface over providers, Groq first, swappable to Claude or OpenAI.
- **CI** (`.github/workflows/ci.yml`): app lint and typecheck, database tests and database lint.

### Pending slices (PLAN.md, in order)

Every slice ships the same pieces:
- migrations;
- RLS on every table;
- pgTAP tests proving that a coach can't see another coach's clients, that a coach sees data only from the join date unless the athlete shares history, and that access ends when coaching ends;
- a repository that replaces that part of the sample store, so screens don't change.

| Slice | What it adds | Main pieces |
|---|---|---|
| **B1 Accounts and coach links** | Email-code and Google sign-in, roles, onboarding answers saved, invites, joining and leaving a coach | Supabase Auth with custom email (SMTP), the B1 tables above, profile repository, splitting `CoachData.tsx` per area |
| **B2 Plans and templates** | Training programs, meal plans, recovery protocols, supplements and Enhanced, templates, assigning | `programs`, `program_days`, `planned_exercises`, `meal_plans`, `protocols`, `templates`, `supplements`, `enhanced_cycles` (consent-gated); coach writes, client reads |
| **B3 Workout logging** | Sessions and sets, routines (templates), custom exercises, race sims, cardio | `sessions`, `session_sets`, `routines`, `custom_exercises`, `race_sims`; the workout in progress stays on the phone and syncs |
| **B4 Food logging** | Food logs, my foods, meal-plan logging | `food_logs`, `my_foods`, a `foods` table seeded from IFCT and the curated dishes, once rights are confirmed |
| **B5 Check-ins, chat, files, notifications** | Weekly check-ins with photos, realtime chat with images and PDFs, the six notifications | `check_ins`, `messages` (Supabase Realtime), private Storage buckets with short-lived signed URLs, `push_tokens`, Expo push sent from an Edge Function, reminders on a schedule (`pg_cron`) |
| **B6 Progress, recovery, consent** | Weigh-ins, measurements, progress photos, recovery logs, habits, transformation approvals, export and delete | `weigh_ins`, `measurements`, `photos`, `recovery_logs`, `habits`, `transformations`, an `export-account` function, and a deletion job (30 days live, 90 days backups, as the Privacy Policy says) |
| **B7 Billing and entitlements** | Arcwell Plus through Google Play, coach plans through Razorpay | RevenueCat SDK plus a webhook into `subscriptions`; Razorpay subscription links plus a webhook; server-side tier checks; coach client limits and lapsed billing |
| **B8 AI** | AI plans and adjustments, AI meal plans, the AI chat, the meal scan (done) | Edge Functions over `_shared/ai/`, entitlement and daily-cap checks, output validated against the D69 rules, coached athletes never served |

### Cross-cutting work

- **Coach CRM:** leads, Instagram leads and timeline, with coach-only RLS. Part of B2 or B5.
- **Invite links:** a domain, an `assetlinks.json` for Android App Links, and a small web page that previews and redirects. Play Install Referrer carries the invite through install, with the typed code as fallback.
- **Monitoring:** Sentry in the app and the Edge Functions, with no health data in logs.
- **Backups:** daily backups on the paid Supabase plan. Point-in-time recovery is optional.
- **Rate limits and abuse:** per-user caps on AI, and size limits on uploads.
- **Environments:** local, then staging, then production. Secrets live only in env files and EAS secrets (AGENTS.md).

---

## 3. Tech stack

| Layer | Choice | Status |
|---|---|---|
| App | **Expo SDK 58**, React Native, TypeScript, Expo Router, React Compiler, Reanimated | Built |
| Design | Own design system: theme tokens, primitives, Liquid Glass dark theme (D67) | Built |
| Device storage | AsyncStorage now; encrypted storage for the offline copy once synced | Partly |
| Builds and updates | **EAS Build** (Android App Bundles), **EAS Update** (over-the-air fixes) | Not set up |
| Back end | **Supabase**: Postgres with RLS, Auth, Storage, Realtime, Edge Functions (Deno), `pg_cron` | Foundations built, local only |
| Hosting region | Supabase **Mumbai (ap-south-1)**, keeping data in India (D72) | Project not created |
| Database tests | **pgTAP** through the Supabase CLI | In CI |
| Sign-in | Supabase Auth: email one-time code plus Google | Tables done, flow not wired |
| Email | **Resend** or Amazon SES as custom SMTP for sign-in codes (Supabase's built-in email is rate-limited) | Not set up |
| Files | Supabase Storage, private buckets, signed URLs, photos compressed on the phone | Not set up |
| Push | **Expo Notifications** (FCM underneath) | Screens built, delivery not wired |
| AI | Provider-neutral layer; **Groq** first, can switch to Claude or OpenAI by config | Meal scan live; rest is front end only |
| Athlete billing | **RevenueCat** plus **Google Play Billing** | Not set up |
| Coach billing | **Razorpay** subscription links plus a webhook, outside the app | Not set up |
| Wearables | **Health Connect** (Android), needs a development build | Simulated |
| Crash reporting | **Sentry** (free tier) | Not set up |
| Legal pages | Static HTML from `features/legal/docs.ts`, hosted with the invite-link site | Built, not hosted |
| Website and links | A static host for the invite pages, legal pages and `assetlinks.json` (Vercel, Netlify or Cloudflare Pages, all with free tiers) | Not set up |
| CI | GitHub Actions | Built |

---

## 4. Start to deployment, step by step

### Step 1: Accounts and paperwork (start now, some take weeks)

1. Register the company (Private Limited or LLP) and open a business bank account. Razorpay KYC, Google Play payouts and the legal pages need these.
2. Open a Google Play Console developer account as an organisation. Organisation accounts need a D-U-N-S number, which is free but takes days.
3. Create Supabase projects: **staging** (the free plan is fine) and **production** (Pro plan), both in Mumbai.
4. Create an Expo (EAS) account and project.
5. Create a RevenueCat account and link it to Play Console.
6. Open a Razorpay business account and complete KYC.
7. Get a Groq API key. Confirm its data-retention terms (PLAN.md).
8. Buy the domain. Set up business email: support@, privacy@ and copyright@.
9. Clear the legal items:
   - lawyer review of the legal pages;
   - name a Grievance Officer;
   - IP India trademark search for "Arcwell";
   - register a DMCA agent (optional at first).
10. Clear the content items:
    - IFCT 2017 usage rights;
    - an exercise media licence;
    - review of the evidence rules by a sports scientist and a dietitian;
    - Indian portion weights checked by a nutrition reviewer.

### Step 2: Environments (about a week)

1. Link the staging project and run the migrations there.
2. Set Edge Function secrets: Groq key, RevenueCat and Razorpay webhook secrets.
3. Turn on custom SMTP (Resend) for sign-in emails, and Google sign-in (a Google Cloud OAuth client).
4. EAS:
   - development, preview and production build profiles;
   - Android package name confirmed (`com.arcwell.app` is permanent once published);
   - EAS secrets for the public Supabase URL and anon key.
5. Sentry project, with its DSN in EAS secrets.

### Step 3: Build the back end, slice by slice (B1 to B8, about 10 to 14 weeks)

Build B1 to B8 in order (§2). For each slice:
1. Build it against the local stack.
2. Run `npm run lint && npm run typecheck && npm run db:test`.
3. Check it on web and on a phone.
4. Push it to staging.

B7 waits on the Play Console, RevenueCat and Razorpay KYC. B8 waits on Groq's terms.

### Step 4: Development build and device features (in parallel with step 3)

1. Make an EAS development build and install it on test phones.
2. Wire in Health Connect, live heart rate, push and Google sign-in.
3. Add exercise media once licensed.

### Step 5: Store setup

1. Play Console:
   - the app listing, screenshots and content rating;
   - **Data safety** form, matching the Privacy Policy;
   - **Health apps** declaration;
   - privacy policy URL and **account deletion URL** (`legal/delete-account.html`);
   - target audience 18+;
   - country availability (India only at launch avoids the EU's GDPR).
2. In-app products: Arcwell Plus monthly and yearly, with the 7-day trial, mirrored in RevenueCat.
3. Host the website: invite pages, legal pages and `assetlinks.json`.

### Step 6: Beta and launch (2 to 4 weeks)

1. Play **internal testing** for the team.
2. Play **closed testing** with 3 to 5 real coaches and their clients for 2 to 4 weeks. Newer personal Play accounts must run a closed test with at least 12 testers for 14 days before going public; organisation accounts are exempt.
3. Meet the success bar in SPEC.md:
   - no lost workout or chat data;
   - no coach can see another coach's clients;
   - check-ins, chat and plans work end to end;
   - Arcwell Plus can be bought.
4. Switch to the **production** Supabase project, then release publicly.

### Step 7: Running it

- Watch Sentry, Supabase usage and AI spend against the daily caps.
- Ship fixes with EAS Update. Native changes need a new store build.
- Take database backups, test a restore once, and run the deletion job.
- Answer grievance and copyright emails within 24 hours.

---

## 5. What costs money

Prices were checked online on 14 November 2026, mostly from third-party summaries. **Confirm each on the vendor's own pricing page before budgeting.** USD amounts in rupees are approximate.

### Recurring software

| Service | Needed for | When | Cost |
|---|---|---|---|
| **Supabase Pro** (production) | Database, sign-in, files, realtime, functions in Mumbai; daily backups; projects never pause | From beta | **$25/month** per organisation, including $10 of compute (one Micro instance). Larger compute costs more (around $15 Small, $60 Medium). Point-in-time recovery is about $100/month extra (optional). Staging can stay on the free plan. |
| **Expo EAS** | Cloud builds and over-the-air updates | From the first development build | **Free:** 15 Android builds a month, updates to 1,000 users. **Starter $19/month:** priority builds and more update users. **Production $199/month:** larger teams; not needed at launch. |
| **Groq** (AI) | Meal scan, AI plans and chat (Plus only) | B8 | **Free tier**, rate-limited, no card. Paid per token beyond that; vision models are cents per million tokens. Daily caps keep it predictable. Switching to Claude or OpenAI later would cost more per request. |
| **Resend** (or Amazon SES) | Sign-in code emails | B1 | Free for about 3,000 emails a month, then about $20/month. SES is about $0.10 per 1,000 emails. |
| **Domain** | Invite links, legal pages, email | Before beta | About ₹800 to ₹2,000 a year. |
| **Business email** | support@, privacy@, copyright@ | Before beta | Zoho Mail has a free tier; Google Workspace is about ₹150 to ₹350 per user per month. |
| **Sentry** | Crash and error reports | Beta | Free developer plan to start; Team is about $26/month later. |
| **Static web host** | Invite and legal pages, `assetlinks.json` | Before beta | Free tier (Vercel, Netlify or Cloudflare Pages). |
| **GitHub** | Code and CI | Now | Free for a private repo with the included Actions minutes. |
| **Expo push, Health Connect, Google sign-in** | Notifications, wearables, sign-in | B5, device work | Free. |

### Fees that take a cut of revenue

| Service | What it takes |
|---|---|
| **Google Play** | **15%** of Arcwell Plus subscription revenue. Auto-renewing subscriptions are 15% from day one. |
| **RevenueCat** | Free up to **$2,500 a month** in tracked revenue, then about **1%** of gross revenue (check how it counts revenue above $2,500). |
| **Razorpay** (coach plans) | No setup or yearly fee. About **2%** per payment plus 18% GST on the fee. Subscriptions may add about 0.9% (sources disagree). New merchants from July 2026 may get a 0% platform-fee offer. |

### One-time costs

| Item | Cost |
|---|---|
| **Google Play developer account** | **$25** once |
| Company registration (Private Limited) | About ₹7,000 to ₹15,000 through a filing service, plus stamp duty and state fees |
| Trademark filing for "Arcwell" (IP India) | ₹4,500 per class for individuals, startups and small businesses; ₹9,000 for others. Software and fitness may need 2 classes. |
| DMCA agent registration (US Copyright Office) | $6, renewed every 3 years (optional while India-only) |
| Lawyer review of the legal pages and coach terms | Quote needed. Budget a few tens of thousands of rupees. |
| Sports scientist and dietitian review (D69) | Quote needed |
| Exercise demo media licence | Quote needed. Openly licensed stills are the free fallback. |
| Apple developer account | $99 a year, **only** when iOS is added (not v1) |

### Rough monthly running cost

These figures leave out the revenue cuts above.

- **During beta:** about **$25 to $45 a month** (₹2,100 to ₹3,800): Supabase Pro, plus EAS Starter if you want faster builds. Everything else stays on free tiers.
- **First months after launch:** about **$50 to $120 a month**, depending on compute size, AI use beyond Groq's free tier, the email tier and Sentry.

---

## 6. Decisions waiting on the founder

1. **AI chat memory:** should past AI chat messages be kept (stored server-side in B8), or start fresh each time?
2. **Progression hint icon:** the workout logger's progression hint is rules-based but shows the AI sparkle icon, and coached athletes see it too. Should it get a different icon?
3. **Company details for the legal pages:** registered name, address, Grievance Officer and the city for disputes.
4. **Launch availability:** India only, which is recommended?
5. **Pricing:** Arcwell Plus monthly and yearly prices, and the coach plan price and client limits.
6. **Invite-link domain:** for example `arcwell.app`.

Sources for the prices:

- [Supabase pricing](https://supabase.com/pricing)
- [Expo pricing](https://expo.dev/pricing) and [Expo usage-based billing](https://docs.expo.dev/billing/usage-based-pricing/)
- [RevenueCat free plan (costbench)](https://costbench.com/software/subscription-billing/revenuecat/free-plan/)
- [Razorpay pricing](https://razorpay.com/pricing) and [Razorpay SaaS pricing guide](https://razorpay.com/blog/best-payment-gateway-pricing-saas-india-tco-guide/)
- [Groq pricing summary (morphllm)](https://www.morphllm.com/groq-pricing)
- [Google Play service fees](https://support.google.com/googleplay/android-developer/answer/112622?hl=en)
