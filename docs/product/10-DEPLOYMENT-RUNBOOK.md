# 10 · Deployment and Testing Runbook

**Updated:** 14 November 2026 (to D111). How to test Arcwell on a laptop, how to run staging, how a change reaches production, and the checklist that must be fully ticked before launch. Follow the steps in order; don't skip a gate because "it worked locally".

| Environment | Backend | App build | Who uses it | Cost | Status |
|---|---|---|---|---|---|
| **Local** | Supabase CLI in Docker | Expo dev server (web or Expo Go) | Developers, investor demo | Free | ✅ in use |
| **Staging** | Supabase free project, Mumbai | EAS `preview` APK (internal link) | Team, beta coaches before Play | Free | ⬜ not created (ticket H-05, H-06) |
| **Production** | Supabase Pro, Mumbai | EAS `production` app bundle on Google Play | Real users | Paid | 💰 after funding (H-07, H-08) |

Build profiles are in [`app/eas.json`](../../app/eas.json): `development` (development client), `preview` (internal APK, channel `preview`) and `production` (Play app bundle, channel `production`). Each profile reads its public settings from the matching EAS environment.

---

## Part A · Local testing

### A1. One-time setup

1. Install Node 24, and Docker (Docker Desktop, or `colima start` on a Mac).
2. Install the packages:

   ```bash
   npm install
   npm --prefix app install
   ```

3. `cp app/.env.example app/.env` and `cp supabase/functions/.env.example supabase/functions/.env`.
4. `npm run db:start`, then put the printed `PUBLISHABLE_KEY` in `app/.env` as `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. For demos only: `EXPO_PUBLIC_DEMO_BILLING=1` in `app/.env` and `DEMO_BILLING=on` in `supabase/functions/.env`.

### A2. Start everything (every session)

| Step | Command | Check |
|---|---|---|
| 1. Docker | `colima start` (or open Docker Desktop) | `docker ps` works |
| 2. Backend | `npm run db:start` | Prints the API URL `http://127.0.0.1:54321` (storage is pinned to v1.89.0 by the script) |
| 3. Fresh data (optional) | `npm run db:reset`, then `npm run demo:seed -- --reset` | Four demo accounts exist ([DEMO.md](../DEMO.md)) |
| 4. Functions | `npx supabase functions serve --env-file supabase/functions/.env` | Lists the 7 functions |
| 5. App | `npm --prefix app run start` → web or Expo Go | Welcome screen loads |
| Sign-in codes | Local inbox http://127.0.0.1:54324 | Code arrives within seconds |

### A3. Automated checks (must pass before any commit is pushed)

```bash
npm run lint        # ESLint + design tokens + static legal pages
npm run typecheck   # TypeScript, strict
npm run test        # Jest: logic, sync mapping, AI guardrails, billing mapping, push tickets, chat memory
npm run db:test     # pgTAP: every table's access rules
npm run db:lint     # schema lint
deno check --node-modules-dir=auto supabase/functions/*/index.ts
```

CI runs the same set on every pull request (`.github/workflows/ci.yml`: app, database and functions jobs). A red check blocks the merge.

### A4. Manual smoke test (after any change to sync, accounts, plans or functions)

Use two browser windows, one at http://localhost:8081 and one at http://127.0.0.1:8081: different addresses keep separate sign-ins.

| # | Do | Expect |
|---|---|---|
| 1 | Coach signs in, adds a client, builds plans, creates an invite | Invite code shown |
| 2 | Second window: join with the code, consent, sign up | Coach's plan already in Training as "Coach plan" |
| 3 | Athlete sends a chat message; coach replies | Each appears on the other side within seconds |
| 4 | Athlete logs a workout and a meal | Coach's client page shows them within about 20 s |
| 5 | Athlete sends a check-in; coach replies | "Coach replied" on the athlete's side |
| 6 | Coach opens another coach's client by URL | Not found |
| 7 | New self-guided athlete finishes onboarding and starts the trial | AI coach appears |
| 8 | Plus athlete asks the AI coach about protein; then about an injury | A sourced answer; then a polite decline |
| 9 | Coached athlete calls `ai-coach` directly | 403 `not_entitled` |
| 10 | Turn the network off, log a set, turn it back on | Set saved, never lost |
| 11 | Export data; delete a test account | JSON downloads; account and files gone |

### A5. Function checks (curl)

Run against `http://127.0.0.1:54321/functions/v1/<name>`. Record the results in the pull request. Use test secrets from your own `supabase/functions/.env` and never paste them into the PR.

| Function | Cases that must pass |
|---|---|
| `ai-coach` | No token → 401 · coached athlete → 403 · Plus chat → 200 with sources · out-of-scope → 200 `out_of_scope` · 41st chat of the day → 429 |
| `scan-meal` | No token → 401 · bad body → 400 · image over 4 MB → 413 · not Plus → 403 |
| `notify` | Message the caller didn't send → 403 · own message → 200 `sent` · recipient turned Messages off → 200 `sent: 0` · past 300 calls today → 429 `rate_limited` |
| `delete-account` | No token → 401 · own account → 200, then the user and files are gone · signed up but never onboarded → 200 · past 5 calls today → 429 |
| `cron` | No or wrong `x-cron-secret` → 401 · GET → 405 · unknown job → 400 · `reminders` → 200 `due`, `sent` · `purge` → 200; files under a folder with no account are removed, a live account's files stay |
| `revenuecat-webhook` | Wrong `Authorization` → 401 · `TEST` → 200 · purchase → `subscriptions` row is Plus · an older event → ignored |
| `razorpay-webhook` | Bad signature → 401 · `subscription.charged` with `notes.coach_id` → `coach_billing` active |
| `demo-billing` | With `DEMO_BILLING` unset → 404 |

### A6. Common local problems

| Symptom | Fix |
|---|---|
| Storage container keeps restarting | Start with `npm run db:start` (it pins storage v1.89.0), not bare `supabase start` |
| "Cannot connect to Docker" after a restart | `colima start`, then `npm run db:start` |
| No sign-in email | Check http://127.0.0.1:54324; the local limit is 60 emails an hour |
| Web preview runs out of memory | Start Expo with `NODE_OPTIONS=--max-old-space-size=8192` |
| A new migration doesn't apply | Its timestamp must sort after the last one; `npx supabase migration up` |

---

## Part B · Staging protocol

Staging is a hosted copy with **fake data only**. It's where a change is proven on real infrastructure before it touches users.

### B1. Create it once (free)

1. Create a Supabase project: free plan, region **Mumbai (ap-south-1)**, a strong database password kept in a password manager.
2. Link it, push the schema, and deploy the functions:

   ```bash
   npx supabase link --project-ref <staging-ref>
   npx supabase db push
   npx supabase functions deploy
   ```

3. Set the function secrets:

   ```bash
   npx supabase secrets set AI_PROVIDER=groq GROQ_API_KEY=… GROQ_MODEL=… REVENUECAT_WEBHOOK_AUTH=… RAZORPAY_WEBHOOK_SECRET=…
   ```

   Set `DEMO_BILLING=on` only if staging is used for demos.
4. **Turn on the scheduled jobs** (reminders every 15 minutes, purge daily; D111). Make one long random secret, then set it in both places, from the SQL editor for Vault:

   ```bash
   npx supabase secrets set CRON_SECRET=<long random string>
   ```

   ```sql
   select vault.create_secret('https://<staging-ref>.supabase.co', 'project_url');
   select vault.create_secret('<the same long random string>', 'cron_secret');
   ```

   Check it: `select public.run_cron_call('purge');` returns a request id, and `select * from net._http_response order by id desc limit 1;` shows status 200. Without both Vault secrets the jobs run but call nothing.
5. **Auth settings** (dashboard):
   - email OTP on, length 6;
   - site URL and redirect URLs set to the app scheme `arcwell://`;
   - custom SMTP when the domain exists (until then, staging's built-in mail has a low hourly limit).
6. Turn on 2FA for every dashboard account. Don't give staging access to anyone who doesn't need it.
7. **EAS** (free plan):
   - `npx eas-cli@latest login`, then `npx eas-cli@latest init` (links the project);
   - `npx eas-cli@latest env:create` for the `preview` environment with the staging URL and publishable key;
   - `npx eas-cli@latest update:configure` to set up channels.
8. **Webhooks in test mode:** point the RevenueCat sandbox and the Razorpay test-mode webhooks at the staging functions.

### B2. Every change

1. The PR is green in CI and the local smoke test (A4) passes.
2. **Deploy to staging in this order:**
   1. `npx supabase db push` (migrations first, and they must be backward compatible: see B3);
   2. `npx supabase functions deploy <changed>`;
   3. the app: `npx eas-cli@latest update --channel preview` for JavaScript-only changes, or `npx eas-cli@latest build --profile preview` when native code or config changed.
3. Run the staging smoke test: A4 steps 1–9 on two phones with the preview APK.
4. Check the function logs in the Supabase dashboard for errors. Logs contain codes only, never data.
5. Merge only after staging passes. Write "staging: passed" with the date in the PR.

### B3. Migration rules for hosted databases

- **Expand, then contract.** Add a column or table first, ship the app that uses it, and remove the old one only in a later release. Old app versions stay installed for weeks.
- Never rename or drop in the same release that starts using the replacement.
- `npx supabase db push` must never prompt to reset. If it does, stop: the hosted history differs from the repo.
- Every migration has passed `npm run db:test` locally. If it changes access, it also comes with a new pgTAP test.

### B4. Staging data rules

- Test accounts only (`@arcwell.test` or team addresses). **No real client health data, ever.**
- `npm run demo:seed` is for local only. Seed staging by hand or with fake data.
- Reset staging freely; it has no backups promise.

---

## Part C · Production launch checklist

Every box must be ticked, with the name of the person who checked it, before the Play release goes past closed testing.

### C1. Business and legal

- [ ] Company registered; business bank account
- [ ] Legal pages filled in: legal name, address, Grievance Officer, courts city. `npm --prefix app run legal:check` reports nothing still to fill
- [ ] Lawyer review of the Terms, Privacy Policy and coach terms
- [ ] Sports scientist and dietitian review of the evidence rules (D69)
- [ ] Trademark search done; filing started
- [ ] Prices set: Plus monthly and yearly; the coach plan

### C2. Infrastructure

- [ ] Supabase **Pro** project in Mumbai; daily backups on; point-in-time recovery decided
- [ ] `npx supabase db push` and `functions deploy` to production from the release commit
- [ ] Secrets set: Groq, RevenueCat, Razorpay live. **`DEMO_BILLING` not set**
- [ ] Auth:
  - sign-ups on, email OTP, 1-hour tokens with rotation;
  - rate limits reviewed;
  - custom SMTP through Resend on the Arcwell domain, with SPF and DKIM passing;
  - site and redirect URLs set to `arcwell://` and the invite domain
- [ ] Domain live: invite pages, the hosted legal pages, `/.well-known/assetlinks.json` with the release key's SHA-256, `support@` and `privacy@` mailboxes
- [ ] Dashboard: 2FA for all members; access limited to the founders
- [ ] Sentry on in the app and functions with PII scrubbing; one test error seen (S-02)
- [ ] `CRON_SECRET` and the Vault secrets `project_url` and `cron_secret` set (B1 step 4), so the reminders and the retention purge run (S-03, D-04); one purge run checked in `net._http_response`
- [ ] A restore from backup tested once on a scratch project

### C3. App build

- [ ] `EXPO_PUBLIC_DEMO_BILLING` **unset** in the production EAS environment; the production URL and publishable key set
- [ ] RevenueCat SDK in, with the app user id = Supabase user id; purchase and restore tested with a Play test account (F-06)
- [ ] Development-build features verified on a real Android phone: push (all 4 events), Health Connect, Google sign-in
- [ ] `npx eas-cli@latest build --profile production` (app bundle); version and build number increased
- [ ] Every automated check green on the release commit (A3); the full smoke test (A4) passed on staging with the release build

### C4. Google Play

- [ ] Developer account (organisation) verified
- [ ] Store listing: name, short and full description (no medical claims), screenshots, icon, feature graphic
- [ ] Privacy Policy URL (hosted page); account deletion URL and the in-app path (Menu → Account → Delete)
- [ ] Data safety form matches doc 07: health and fitness data, photos, email; encrypted in transit; deletion available; not sold
- [ ] Content rating questionnaire; target audience 18+ (D106)
- [ ] Health apps declaration completed
- [ ] Subscriptions created with the same product ids RevenueCat uses; the 7-day trial set
- [ ] Closed testing track: 3–5 coaches with their clients for 2–4 weeks (the PRD launch gate)

### C5. Launch gate (from the PRD) is met

- [ ] No lost workout or chat data during the beta
- [ ] No coach could see another coach's clients (pgTAP green, and no reports)
- [ ] Check-ins, chat and plans worked end to end for every beta coach
- [ ] A Plus purchase through Google Play worked
- [ ] Automated tests cover the access rules (pgTAP) and billing (pgTAP + Jest)

### C6. Release

1. Promote from closed testing to production as a **staged rollout**: 10%, then 50% after 48 h with no crash spike, then 100%.
2. Watch for the first 48 hours:
   - Sentry crash-free sessions (target > 99.5%);
   - Supabase function error rate and database CPU;
   - RevenueCat and Razorpay webhook deliveries (all 200);
   - support inbox.
3. Announce to coaches only after the 50% step is stable.

---

## Part D · Rollback and hotfix

| What broke | Roll back by | Notes |
|---|---|---|
| App JavaScript | `npx eas-cli@latest update:republish` the previous update on `production`, or halt the Play staged rollout | Fastest; no store review |
| Native app build | Halt the rollout in Play Console; ship the previous version code as a new build | Play can't downgrade installed users |
| Edge Function | Check out the previous commit, then `npx supabase functions deploy <name>` | Or remove its secret to make it fail closed |
| Migration | **Fix forward** with a new migration; restore from backup only for data loss | Never edit an applied migration |
| A secret leaked | Rotate it at the provider, then `secrets set`, then redeploy | Follow the incident steps in doc 07 §8 |

**Hotfix path:**
1. Branch from the release commit.
2. Fix it, with a test that fails before the fix.
3. Green CI.
4. Staging smoke test (the affected steps only).
5. Production in the order of B2.
6. Write an incident note if users were affected.
