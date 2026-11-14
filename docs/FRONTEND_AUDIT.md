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

## 7. Front-end work still to do (recheck, 2026-11-14)

**Groups A and B done 2026-11-14 (D104).** Limits: old binary .xls files can't be imported (save as .xlsx or .csv), the athlete routine editor has no effort or block fields yet, PDFs open in the phone's own viewer rather than inside the app, and the Gyms map is a drawn "around you" view, not map tiles.

A second pass after D103: the design inventory (`docs/design/sitemap.md`, PLAN FE-1 to FE-9, SPEC) checked against the code, and every open finding above re-read. Items a later decision removed on purpose are left out: the Exercises tab, forgot password, the 1RM estimate, the floating AI button and the three-page welcome. Everything here can be built on sample data; nothing waits on the backend.

### A. Bugs and quick fixes (small, one sitting)

- [x] **Meal-scan photos aren't shrunk** before sending (section 4, item 5). Large photos fail with a generic error. Resize to about 1024 px with `expo-image-manipulator`, and show "photo too large" for a 413.
- [x] **The meal scan can spin forever** on a network error: `food/photo.tsx` has no `.catch` (item 6).
- [x] **Recovery's inner pages have no plan check**, so a free athlete can open them by link (item 7).
- [x] **Out-of-date text athletes see:**
  - `switch/[step].tsx:116` says the AI coach is "on Today and in the + menu".
  - `:249` says "A Progress tab joins your bar".
  - `:251` says "☰ → Training → History".
  - `menu/help.tsx:17` says "Tap + and Log food".
- [x] **Dates worked out in UTC** put anything from 00:00 to 05:30 IST on the day before. Affected: chat day headers (`ChatThread.tsx:101`), the cardio start date (`menu/shows.tsx:34`) and lead call dates (`BusinessPages.tsx:96`, `lead/[id].tsx:398,444`).
- [x] **Nested buttons in the exercise list.** The info button sits inside each row's button (`ExerciseList.tsx:91/106`, `317/345`). Web logs an error; make them siblings.
- [x] **Sign In on the welcome page does nothing** in sample builds (`app/index.tsx:31`). Open the sample account picker or hide the button.
- [x] **Text links without a button role or hit area** (section 4, Medium).
- [x] **Dead code and stale comments** (section 4, Low), including the unlinked `/athlete/exercises/new`.

### B. Screens and states that are missing or only partly built

**Athlete**

- [x] **Athletes never see an overdue check-in.** `dueText` only says "Due today", "Due tomorrow" or "Due <day>"; coaches do see overdue.
- [x] **The weekly check-in has no review step.** It is one long form; the design has measurements → photos → the week → review and send (F6-02 to F6-05).
- [x] **AI meal plan (F5-13).** Add a "Generate a meal plan" sample flow and break the loop: an empty plan's "Plan my day with AI" opens the assistant, which says "Build one in Nutrition → Meal plan".
- [x] **Offline banner on phones.** `useOnline()` only works on web; on Android it always says online. Use `expo-network`.
- [x] **No map on Gyms (G-01).** It is a list and search only.

**Sign-up and consent**

- [x] **Photo consent isn't asked at sign-up** (F1-05). Add it as an optional step; today it is only a switch in Privacy.
- [x] **No Google button on most sign-in screens.** Add the turned-off Google button (D62) to Sign In, coach sign-up and invite sign-up; today it is only on Save your plan.

**Coach**

- [x] **Coach onboarding answers are dropped.** Profile, services and the first template are never saved; the coach keeps the sample profile.
- [x] **Spreadsheet import (D55, CO-10).** The file is picked but nothing reads it. Add a draft-template review screen and an Import entry on Plans.
- [x] **No effort field in the plan builder (K-06/K-07).** Exercises have no RPE/RIR, though athletes log RPE (D83). Weeks are only a number.
- [x] **No endurance or station blocks** in the coach plan builder (PLAN FE-9 "not built yet"). Runs and stations are typed as reps text.
- [x] **Adherence is a fixed sample number, and overdue is matched from a text field.** Work both out from logs and the due day.
- [x] **The invite page shows only a name and avatar** (F3-02, D43). It should show specialisations, bio, services, certifications and approved transformations, which the profile editor promises.
- [x] **Approved transformations appear nowhere** on the coach profile, invite page or My coach.
- [x] **The coach photo can't be edited** after onboarding (K-20).
- [x] **No QR code or Instagram share** on the onboarding invite step (CO-11). The QR exists on the Business invite page.
- [x] **Coaches are never asked for notification permission** (X-07).

**Everyone**

- [x] **PDFs open in the external browser,** not an in-app viewer (X-06).
- [x] **No per-screen loading or error states.** They exist only at the root and the tab layouts. This is fine on sample data, but needed once data loads over the network.

### C. Tests for logic that has none

- [ ] Recovery scores (`recovery.ts`), the self-guided plan builder (`selfPlan`), `toSession` and `programWeek`, check-in due dates (`checkins.ts`) and `visibility` (D78).

### D. Docs

- [ ] **Update `docs/SPEC.md` to D103** (section 6). Also fix the two contradictions in `DECISIONS.md`: effort per workout vs per set, and copy-from-yesterday listed as v1.1.
- [ ] **`DESIGN.md` §7 marks every screen "Built ✅".** Correct the partial ones listed in B.

### Needs a development build, not just Expo Go

These can't be finished in Expo Go:

- Health Connect (steps, heart rate, sleep, watch VO2 max).
- Live heart rate in the interval timer.
- Exercise demo media, which also needs licensing.

## 8. Third pass (2026-11-14, after D104 and D105)

Every route, `router.push` target and stub was checked again. There are no stub screens, TODOs or "coming soon" pages. Every link goes to a real route; only `/dev/gallery` and `/dev/tokens` are unlinked. No raw colours were found outside `theme/`.

**Coach plan (D105), done.**
- Athletes who joined through a coach see a **Coach plan** tile in Hypertrophy, in place of Arcwell plan.
- It opens the program the coach assigned, with the program's name, "from" the coach, and the week.
- A new assignment shows up at once.
- Before this, sample clients came with only the plan's name, so athletes saw "building your plan" and no tile.

### E. Bugs

**All fixed 2026-11-14.** `lib/alert.ts` is one alert for phone and web, used everywhere. On web, Add a photo goes straight to the file picker. A coach who picks a different template or Blank in the builder restarts the program from week 1. Every assignment or change records `programUpdatedAt`, which raises a new "Your plan is ready" or "Coach updated your plan" notice.

- [x] **Confirm dialogs do nothing on web.** About 25 `Alert.alert` calls have no web fallback. Fix it with one shared `confirm()` helper like `confirmDiscard`. Size M.
  - **Blocking:**
    - `PhotoSlot.tsx:44` `choosePhoto`. Every "add a photo" path is dead on web: profiles, check-in and physique photos, chat images, onboarding.
    - Closing the race sim (`race/sim/live.tsx:61`).
    - Starting a workout while another runs (`workout/preview/[dayId].tsx:56`).
  - **Confirms that never fire:**
    - Sign out (coach menu, athlete Today, `menu/account.tsx`).
    - Sample reset.
    - Complete or remove a client (`client/status/[id].tsx:61,94`).
    - Disconnect a device (`recovery/connect.tsx:136`).
    - Delete a template (`MyRoutines.tsx:226`).
  - **Only the message is lost:** template and stack assign, recovery planner, create exercise, photo permission.
- [x] **A new program keeps the old start date.** When the coach picks a different template in the plan builder and saves, `saveProgram` keeps `programStart`. A new 4-week program can then open as "complete". Size S.
- [x] **"Plan assigned · starts Monday"** (`CoachData.tsx`, assignPlan) disagrees with the data: the program starts now. Size S.
- [x] **No "plan updated" notice for the athlete.** The plan item in `notifications.ts:63` is never new and ignores edits, though Settings has a toggle for it. Size S.
- [x] **UTC date slicing still left:** `coach/enhanced/[id].tsx:70,106` and `notifications.ts:68`. Size S.
- [x] **"1 exercises · N min"** on template cards for single-run days (`MyRoutines.tsx:48`). This breaks D100. Size S.
- [x] Dead export `SEASON` (`features/race/data.ts:25`). Size S.

### F. Partly built (known D104 limits)

- [ ] The athlete routine editor has no effort (RPE) or block fields. Size M.
- Still as designed:
  - .xls import (use .xlsx or .csv).
  - PDFs open outside the app.
  - A drawn Gyms map.

### C and D, rechecked

- **C (tests):** check-in due dates are now covered. Still untested:
  - `recovery.ts` (`dayFor`, `plannerFor`, `suggestFor`, `outlookFor`).
  - `selfPlan()`.
  - `toSession` and `programWeek`.
  - `visibility.ts` (`modulesOf`, `raceActive`).
- **D (docs)**, still open, and now also:
  - **SPEC.md** is behind on D97, D98, D101 and D105:
    - Coached athletes' bar and Progress.
    - Side menu.
    - Recovery.
    - Hypertrophy, Race and Endurance.
    - Templates.
    - RPE per set.
    - Nutrition rebuild.
  - **DESIGN.md §6** component table still says "not built" for parts now built: tab bar, set row, rest timer, macro bars, food row and portion picker, chat bubble, paywall card.

## 9. Full audit (2026-11-14, after D106)

A full pass over every route, link, alert, date, gate and recent decision.
- **Routes:** every route is reachable (only `/dev/*` is unlinked) and every link target exists.
- **Clean:** no direct `Alert.alert` is left, and no UTC date slicing in app code.
- **AI gating:** AI is hidden from coached athletes on every route and card.
- **Recent decisions:** D97 to D106 all show as decided.
- **Typecheck:** it had broken on the new legal test, which was missing its `@jest/globals` import. Fixed in the same commit as this section.

**Verdict:** on sample data the front end is feature-complete for v1, apart from effort and block fields in the athlete's template editor. What's left is small fixes, tests and docs.

### G. Bugs (all small)

**All fixed 2026-11-14:**
- `sessionWhat()` words single-exercise sessions (D100) on cards and notices.
- `NotFound` (SystemStates) handles pages for missing items.
- `coachLink()` builds the invite link everywhere, and the limit comes from `useCoachLimits`.
- `hitSlop` brings the small controls up to the 48 dp tap size.

The two "To decide" items are left for the founder.

- [x] **"1 exercises" on single-run days (D100)** in the workout notice (`notifications.ts:83`) and the logger header, "x of 1 exercises" (`workout/index.tsx:432`).
- [x] **Nested button in food rows.** The add button sits inside the row's button (`FoodParts.tsx:91/109`, used in `food/add.tsx`). This is the same fix as `ExerciseList`.
- [x] **Wrong or blank screen for an unknown id:**
  - `habits/[id]` and `race/sim/[id]` say "Join your coach first".
  - `history/[id]`, `recovery/protocol/[id]` and coach `chat/[id]` show an empty page.
- [x] **The coach invite page uses sample values** (`BusinessPages.tsx:384`):
  - The link is always `arcwell.app/c/anjali-kapoor`, while onboarding builds it from the coach's name.
  - "Client spots" ignores `settings.clientLimit`.
- [x] **The coach consent box has no "I'm 18 or older"** (`coachQuestions.ts:111`), unlike the athlete and invite consent boxes and the Terms.
- [x] **Small tap targets:**
  - The food tick box on the meal-scan result is 24 dp (`food/photo.tsx:385`).
  - The remove buttons in coach onboarding are about 34 dp (`QuestionScreen.tsx:592,696`).
- [x] **UTC slice in sample Instagram leads** (`instagram.ts:134,152`). It's correct in India, so low priority.
- [x] **Stale comments:**
  - `athlete/_layout.tsx:1` (Progress tab).
  - `food/add.tsx:4` (photo logging "coming").
  - A repeated comment in `assistant/nutrition.tsx:40`.
- **To decide:**
  - The AI chat forgets its messages when you leave the page.
  - The logger's progression hint uses the sparkle (AI) icon for coached athletes too, though it's rules-based and not AI.

### Still open from earlier

- [x] **F.** The athlete template editor now uses the coach's exercise rows: effort (RPE), defaulting to the rules range for the athlete's experience, plus run, erg and HYROX station blocks. The old `ExerciseRows` component is removed.
- [ ] **C. Tests** are missing for:
  - `recovery.ts`, `selfPlan()`, `toSession`, `programWeek`, `visibility.ts`;
  - `ai/tailor.ts`, `ai/answers.ts`, `science/strength.ts`;
  - `coach/crm.ts`, `enhanced.ts`, `supplements.ts`, `readSheet.ts`;
  - `notifications.ts`, `lib/alert.ts`.
- [ ] **D. Docs:**
  - `SPEC.md` is behind on D53 to D106.
  - `DESIGN.md` §3, §6 and §7 are out of date.
  - `sitemap.md` still has the Progress tab and the old menu.
  - `PLAN.md` still says the blocks are not built and FE-6 has "no APIs".
  - `DECISIONS.md` has two contradictions: D45's effort per workout, and copy-from-yesterday listed as v1.1.
- **By design, or waiting on the backend or a dev build:**
  - Supabase data and sign-in.
  - Play billing and Razorpay; the Razorpay button stays disabled.
  - Push delivery, Health Connect, live heart rate, exercise media.
  - Real invite tokens and the domain.
  - .xls import, the in-app PDF viewer, map tiles.
