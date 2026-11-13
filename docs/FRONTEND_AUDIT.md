# Front-end audit before the backend build

Date: 2026-11-14 · Branch `frontend-habits-cardio-race` at D102 · Read-only audit of `app/src` and `supabase/`, with the main findings checked by hand.

## In one paragraph

The front end is complete as a sample app. It has 148 screens: 82 athlete, 46 coach (including coach onboarding), 12 for onboarding, join and sign-in, plus system and dev pages. Every athlete, coach, free, Plus and coached flow in SPEC has a screen. Almost all data lives on the phone in one AsyncStorage blob (`arcwell.sample.v1`) plus the running workout (`arcwell.active.v1`). Only three things touch Supabase today:

- email-code sign-in, which writes `profiles` and the health-data consent;
- the real meal scan (`scan-meal` edge function);
- nothing else. `features/accounts/repo.ts` (invites, preferences) is written but imported nowhere.

Lint, typecheck, 104 unit tests and 73 database tests pass. No secrets are in the repo and there are no `console.*` calls in the app. Coached athletes have no path to AI on any screen.

---

## 1. What is built: athlete

| Area               | Screens                                                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**          | Today tab                                                                                                                                                                                                                                                           | Workout card with round Start button (D100), food against target, recovery, strain and stress rings, coach message and check-in for coached, trial banner for Plus, Morning start and habits when on |
| **Training**       | Hypertrophy · Race · Endurance tabs (D99); workout logger with RPE 1–10 and rest timer; workout preview and summary; templates and routine builder; Arcwell plan; programs; muscle analytics; progressive-overload history and edit; exercises and detail; calendar | Minimised workout bar with discard (D102). Programs and analytics are locked for Free                                                                                                                |
| **Endurance**      | Cardio fitness (VO2 estimate), tests (Cooper, Rockport, questionnaire with PAR-Q+), live interval timer                                                                                                                                                             | Only when the cardio module is on                                                                                                                                                                    |
| **HYROX**          | Race page, setup, simulator (new, live splits, results)                                                                                                                                                                                                             | Only with an active race goal (D76)                                                                                                                                                                  |
| **Nutrition**      | Day log with streak, calorie and macro rings, food quality card, Same as yesterday; food search (236 foods, incl. 98 urban), portion, quick add, custom food; meal plan; water; AI meal scan                                                                        | Free sees calories only; scan is Plus only                                                                                                                                                           |
| **Recovery**       | Overview, Sleep, Recovery, Strain; morning check-in; HRV status, early warning, rest mode, fitness age, cycle (women), 7/30-day trend; health monitor, stress, outlook, sleep planner, activity, protocols, breathing; Health Connect                               | Locked for Free on the tab                                                                                                                                                                           |
| **Progress**       | Progress page from the top-right button (D101): weekly chart, dashboard, bodyweight; Check-ins and Chat tabs for coached                                                                                                                                            |                                                                                                                                                                                                      |
| **Physique**       | Bodyweight, measurements, photos, charts                                                                                                                                                                                                                            | Free for everyone                                                                                                                                                                                    |
| **Coached extras** | Weekly check-in, past check-ins, chat, transformation photo approval, enhanced (PED) consent, history access, leave coach                                                                                                                                           |                                                                                                                                                                                                      |
| **Habits**         | Library, habit detail, if-then plans                                                                                                                                                                                                                                | Module-gated (D78)                                                                                                                                                                                   |
| **Menu**           | Account, profile, units, What Arcwell shows, reminders, notifications, privacy (AI switch), my coach, export, delete, help, gyms, subscription, switch flows                                                                                                        |                                                                                                                                                                                                      |
| **AI (sample)**    | AI coach chat, plan builder, tailor, weekly review, nutrition assistant, Today suggestion                                                                                                                                                                           | All labelled "sample" except the meal scan (D96)                                                                                                                                                     |
| **Onboarding**     | Welcome, role, 17 question steps with HYROX and women's-health branches, body-fat picker, building, ready, save (consent and sign-up), Plus paywall, connected                                                                                                      | Answers held in memory until save                                                                                                                                                                    |
| **Join and auth**  | Invite code, coach general link, email OTP                                                                                                                                                                                                                          | Invite codes are checked locally, not by `redeem_invite`                                                                                                                                             |

## 2. What is built: coach

| Area           | Screens                                                                                                                                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Onboarding** | Agreement, how you coach, profile, specialisations, services, first template, invite, ready and sign-in                                                                                                                                                                    |
| **Clients**    | List with setup checklist and filters; add client before they join; personal invite and general invite link with QR; client profile (Overview, Training, Nutrition, Recovery, habits, race summary, low-recovery flag); notes; status (active, paused, leaving, completed) |
| **Plans**      | Client training, nutrition, recovery and supplement plans; training and meal templates with assign to many; supplement stacks; enhanced (PED and markers, after consent)                                                                                                   |
| **Check-ins**  | To review, overdue with Remind, reviewed; review with week on week, photo compare, reply, Send and next; per-client due day                                                                                                                                                |
| **Messages**   | Threads, search, unread, chat with photo and PDF, broadcast to several clients                                                                                                                                                                                             |
| **Business**   | CRM overview, leads (stages, follow-ups, timeline), Instagram, client accounts (package, fee, renewal)                                                                                                                                                                     |
| **Menu**       | Profile, transformations (request, status, export), billing, settings, coach exercise library, science, help, export, delete account                                                                                                                                       |

SPEC items that are only partly there:

- **Coach onboarding answers are not saved.** Profile, services and the first template are dropped; the coach keeps the sample profile.
- **Excel/CSV import is missing.** The file picker stores only the file name.
- **Adherence and overdue are faked.** Adherence is a fixed sample number, and overdue is matched from a text field instead of worked out from the due day.
- **Transformation photos don't show anywhere.** The "show on profile" flag isn't shown on the coach profile or invite page.

## 3. Stubs that the backend (or a dev build) must replace

| Stub                                                      | Where                                       | Becomes                                                          |
| --------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| All data on the phone                                     | `CoachData.tsx`, `ActiveWorkout.tsx`        | Per-area repositories on Supabase (B1–B6)                        |
| Invites made and claimed on the phone                     | `CoachData.tsx:359`, `JoinScreen.tsx`       | `invites`, `redeem_invite`, `invite_preview` (already in the DB) |
| Plus trial and purchase flip a local tier                 | `startPlus` / `endPlus`                     | RevenueCat and Play → `subscriptions` (B7)                       |
| Coach billing and client limit                            | `limits.tsx`, `menu/billing.tsx`            | Razorpay webhook plus a limit check in `redeem_invite` (B7)      |
| AI answers, plans, tailoring, review, nutrition assistant | `features/ai/*`                             | Edge functions on `_shared/ai` (B8)                              |
| Health Connect                                            | `recovery/connect.tsx:117` (simulated data) | Development build with Health Connect                            |
| Reminders saved but not scheduled                         | `menu/reminders`                            | Expo Notifications                                               |
| Export and delete                                         | `menu/export`, `menu/delete` (local only)   | Edge functions (B6)                                              |
| Gyms                                                      | `SAMPLE_GYMS`                               | Directory table (data source still open)                         |
| Exercise demo clips                                       | `ExerciseFacts.tsx:74` placeholder          | Licensed media                                                   |
| Force update / maintenance                                | `system/status.ts:4` hardcoded "ok"         | Remote config                                                    |

---

## 4. Problems found

### Fix before or during the first backend slice

1. **Fixed 2026-11-14 — a finished workout could be lost.** Finishing now saves history at once, before the cleared workout in progress; a pending save is written if the store goes away. Checked on web: the session was stored within 0.2 s. Original finding:
   - `finishWorkout` writes history through an 800 ms debounced save, while the active workout clears through a 400 ms one.
   - If the app is killed in between, the workout is gone from both places.
   - Neither save runs on unmount: the cleanup only cancels the timer (`CoachData.tsx:460`, `ActiveWorkout.tsx:72`).
   - This breaks SPEC's "no lost workout data". Fix: save immediately on finish, and save any pending change on cleanup.
2. **Fixed 2026-11-14 — a failed load could overwrite saved data.** An unreadable copy is now backed up (`arcwell.sample.backup`, `arcwell.active.backup`) and saving stops for that run; checked on web with a damaged copy. Original finding: if reading or parsing the stored blob fails, the app still marks itself loaded (`CoachData.tsx:430`), then saves sample state over the real data. Fix: back up the raw value and block saving.
3. **Fixed 2026-11-14 — AI consent was never recorded on the server.** `features/auth/consent.ts` now writes the `ai` row when AI is allowed at the paywall or AI screen and when it is switched on or off in Privacy (signed-in builds only; not testable without the backend running). Original finding: the app only inserts the `health_data` consent (`AuthProvider.tsx:139`), and the privacy switch only sets a local flag. `ai_entitled()` needs an `ai` consent row, so the real meal scan would refuse everyone once accounts are on. Fix: write the `ai` consent when AI is turned on at the paywall, the first AI use and in privacy (and withdraw it when turned off).
4. **Fixed 2026-11-14 — "today" was frozen on Nutrition and Recovery.** `useToday()` / `useDayPicker()` (`features/athlete/useToday.ts`) re-read the date every minute and on return to the app; a day left on today follows it. Checked on web by moving the clock a day. Original finding: both tabs keep the date from the moment they first open (`nutrition.tsx:400`, `recovery.tsx:52`). Left open overnight, the next morning's breakfast is filed under yesterday. Fix: a shared `useToday()` that updates at midnight and when the app returns.
5. **Meal-scan photos aren't resized.** Full-size photos go up as base64, and the server rejects anything over 4 MB with 413. The app shows a generic error for that, and it goes against D72 ("compressed client-side"). Fix: resize to about 1024 px before sending, and add a "photo too large" message.
6. **The meal scan can spin forever.** The scan call has no `.catch` (`food/photo.tsx:86`), so a network error leaves "Analysing…" up. Fix: catch and show the error.
7. **Recovery sub-pages have no plan check.** Confirmed: only the Recovery tab is locked for Free. Check-in, health, stress, outlook, planner, protocols, activity and connect open from a direct link.

### The coach access rules exist only in the database

The DB already enforces join-date visibility and access ending on leave, with 36 pgTAP tests. The app's sample store does not, so these must come from the server once data is real, not be rebuilt on the phone:

- **History has no date limit.** Coach screens read a client's whole history (sessions, weights, food, recovery, chat, check-ins), and `joined` is free text such as "19 Oct".
- **"Share earlier history" is all or nothing.** It sets `historyFrom` to 2000-01-01.
- **Completed clients stay fully visible.** Their profile, tabs and Message button still work, and their check-ins count in the badges, although the status screen says "your access stops at once".

### Medium

- **Food search and chat aren't virtualised.** Both render every row in a ScrollView; chat also keys messages by index. Fix: cap search results, and move chat to an inverted FlatList keyed by message id before Realtime.
- **Some dates are worked out in UTC.** Chat day headers, the cardio start date and lead call dates use UTC, so anything from 00:00 to 05:30 IST lands on the day before. Use the local `dateKey()`.
- **Four "today" helpers do the same thing.** `today`, `todayDate`, `todayKey` and `isoToday`. Keep one.
- **Some in-app text is out of date:**
  - `switch/[step].tsx` says "A Progress tab joins your bar", "☰ → Training → History" and "AI coach is on Today and in the + menu".
  - `menu/help.tsx` says "Tap + and Log food", but for self-guided athletes + is now AI.
- **Text links aren't real buttons.** Three tappable text links have no button role or hit area (`menu/shows.tsx:139`, `RacePage.tsx:71`, `MealPlanEditor.tsx:153`).

### Low

- **Dead code:**
  - `features/onboarding/OnboardingScreen.tsx`.
  - `/athlete/exercises/new`, which nothing links to.
  - About 15 unused exports. Among them are `REP_RANGES`, `PROGRESSION` and `FIBRE_G` in `science/rules.ts`, whose values are hard-coded again elsewhere; the logic should import them instead.
- **Leftovers from removed features:** stale header comments that mention the old Progress tab, Overload tab and "+ button"; the unused `blue400` colour; "cyan" comments; and `styles.newRow` in `training.tsx`.
- **Small date-maths risks:** `programWeek` uses `Math.floor` across daylight-saving weeks, and `new Date("YYYY-MM-DD")` parses as UTC in two places.
- **Side effect in render:** `registerCustomExercises` runs during `CoachData`'s render.
- **No tests for key logic:**
  - recovery scores (`recovery.ts`, 778 lines);
  - the self-guided plan builder (`selfPlan`);
  - `toSession` and `programWeek`;
  - check-in due dates;
  - `visibility` (D78 "an off module leaves no trace").

---

## 5. Backend readiness

### Already in the database

| Migration                | Contents                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth_foundations`       | `profiles`, `consents` (append-only), `coach_clients` (join date, history from, end), one active coach per athlete; `coach_can_read`, `end_coaching`, `set_history_access` |
| `b1_invites_preferences` | `invites` (general and personal, single-use, expiry), `invite_preview`, `redeem_invite`; `athlete_preferences`                                                             |
| `ai_entitlement_usage`   | `subscriptions` (free/pro), `ai_usage`, `ai_entitled()`, `ai_try_use()`                                                                                                    |

RLS is on every table; 73 pgTAP tests cover coach isolation, join date, history grant, access ending, invites and AI entitlement.

Edge function `scan-meal`: JWT → `ai_entitled` → daily cap → vision model → validated output.

### Gaps between the schema and the app

- **End reasons don't match.** The DB allows `left`, `completed`, `removed` and `account_deleted`; the app uses `left`, `completed` and `closed`.
- **Missing coaching statuses.** `coach_clients` has no paused or leaving state.
- **No pending clients.** D56's "pending client", whose plans a coach builds before the athlete joins, has no table; invites only carry a name.
- **`subscriptions` is too thin.** It lacks status (trial, active, grace, cancelled, expired), plan (monthly, yearly) and dates.
- **The AI cap is only partly on the server.** It covers only the meal scan; the 30-a-day AI chat cap is a local counter.
- **Invites don't check the coach's plan.** `redeem_invite` doesn't check the coach's client limit or lapsed billing.
- **The cap counts failed calls.** `ai_try_use` uses up a request before the model call, so a failed call still counts.
- **CRM has no slice.** Leads and client accounts are in none of B1–B8.

### Data-model risks (plan for these, don't port the sample shape)

- **One record mixes coach and athlete data.** A coach-owned `Client` record embeds the athlete's own health data. In the DB they must be split: athlete-owned rows read by the coach through `coach_can_read`, and coach-private notes, account and attention kept separately.
- **Leaving or switching coach makes a new athlete id.** `${id}-own` and new `c…` ids are created; in the DB the athlete id stays fixed and only `coach_clients` changes.
- **Ids are made on the phone.** They are `Date.now()` based, and several mutations return them synchronously for navigation. Switch to client-generated UUIDs so screens don't change.
- **Dates are stored as display text.** Examples: "Sat, 14 Nov" with no year, "Sat", "today", "not yet". Store ISO dates and timestamps, and keep `ai_usage`'s UTC day in mind for an Indian user's local day.
- **Some things are keyed by name.** Templates are assigned by name, sessions store exercise names, and custom exercises are de-duplicated by name. Give exercises and templates stable ids; the library (about 430 exercises) and foods (236) move to the DB.
- **Derived values are stored as data.** Adherence, unread counts, `line`, `attention`, check-in row strings and template client counts should be computed or kept up to date by the server.
- **Some writes change several things at once.** `finishWorkout`, `submitCheckIn`, `addClient` from a lead, `assignTemplate`, `leaveCoach` and `closeCoachAccount` need RPCs or transactions.
- **Every read is instant and local.** Screens call synchronous getters during render behind one load gate. Repositories need a cache layer, for example React Query, so screens stay the same.
- **Files are local URIs.** Chat images and PDFs, check-in photos, progress photos, food photos and transformations need private Storage with signed URLs (D72).
- **Sensitive data needs its own consent and RLS.** PED use and blood markers, cycle data and private if-then plans (stored today in the settings the coach can read).

### Gating that is decided only on the phone

These need a server check, not just the hidden UI:

- tier (`meTier`);
- the AI screens and their daily cap;
- Plus-only programs, analytics, recovery, macros and scan;
- the coach client limit and lapsed billing;
- photo and enhanced consents.

### Suggested order

1. ~~Fix problems 1–4 in section 4.~~ Done 2026-11-14. Problems 5–7 remain.
2. **B1 Accounts and coach links.** Wire `repo.ts` into join and invite, add pending clients and statuses, record `ai` consent, and split `CoachData.tsx` into repositories behind the same hooks.
3. **B3 Workout logging next (ahead of B2).** It is the core athlete loop and the one with the strictest "no lost data" rule. Use stable exercise ids and an offline queue.
4. **B2 Plans, B4 Food, B5 Check-ins and chat, B6 Progress and recovery.** Each slice ships migrations, RLS, pgTAP tests and a repository.
5. **B7 Billing and B8 AI.** These wait on Play Console, RevenueCat and Razorpay; B8 extends the scan-meal pattern.

## 6. Docs that are out of date

`docs/SPEC.md` predates D83–D102:

- **Tab bar (:29).** Progress is now a top-right button for everyone, and + is the AI button for self-guided athletes.
- **Side menu (:30).** It still lists Exercises and History; Exercises is gone and History is now Progressive overload.
- **Recovery (:31).** It is missing the D98 additions.
- **Training (:40).** It is missing Hypertrophy, Race and Endurance, templates and RPE per set.
- **Nutrition (:41).** It is missing the D94–D96 rebuild and the real scan.
- **Decision range (:27).** It still says "D1–D52".

`docs/DECISIONS.md` also contradicts itself:

- D45 says effort is rated per workout, which D83 replaced.
- Copy-from-yesterday meals is listed as v1.1, but D96 shipped it.
