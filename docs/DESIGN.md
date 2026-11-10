# Arcwell — Design

Single source of truth for Arcwell's UI/UX: principles, brand, app structure, flows, design tokens, components and screen status. Code in `app/src/theme/` must match the tokens here; change this file first, then the code.

Mockups and wireframes live in `docs/design/`.

**Pre-design research (complete these before designing screens):**

| Document | Contents |
|---|---|
| [Brand and product assessment](design/brand-assessment.md) | What the brand stands for, what the app must achieve, personas, jobs to be done |
| [Sitemap](design/sitemap.md) | Every v1 screen, by role and tier |
| [Competitor research](design/competitor-research.md) | Landscape, comparison, gaps Arcwell can own, UX patterns to adopt |
| [Design references](design/references.md) | Dribbble/Behance/shipped-app references by category, patterns to avoid |
| [Assets and licences](design/assets.md) | Fonts, icons, illustrations, photos, exercise media, data — with licence status |
| [Design generation prompt](design/design-prompt.md) | AI design-tool prompts for the athlete app and coach workspace |

## 0. Working decisions (ASSUMPTIONS — confirm or change)

| Decision | Current default | Why |
|---|---|---|
| Who designs | Founder + Claude; design system built directly in code, rough layouts as mockups | No design budget yet |
| Where designs live | Interactive HTML mockups in `docs/design/` (Figma later if a designer joins) | No tool to learn; shareable |
| Reference apps | Hevy (workout logging), MyFitnessPal (food logging), Trainerize/TrueCoach (coach side) | Proven patterns for each job |
| Theme | Dark-first, with a light theme | Gym use, low light, OLED Android phones |
| Language | English only at launch; layouts allow ~40% longer text for a later Hindi version | Avoid redesign when adding Hindi |
| Ergonomics | One-handed use mid-workout | Logging happens between sets |

## 1. Design principles

1. **Logging in seconds.** The most common actions (log a set, log a meal) take one or two taps. Pre-fill from the last session; never make people type what we can suggest.
2. **One thumb, sweaty hands.** Primary actions sit in the bottom half of the screen. Tap targets are at least 48dp. No precision gestures mid-workout.
3. **Today first.** Every role opens on what needs doing *today*: the athlete's workout and targets, the coach's overdue check-ins and unread messages.
4. **Coach's tool, athlete's companion.** The coach side is dense and efficient (a work tool). The athlete side is calm and encouraging (a daily habit).
5. **Honest numbers.** Show real data plainly. No fake precision, no shaming red for missed days; progress is shown as trends over time.
6. **Three pillars, three colours.** Training, Nutrition and Recovery each have one consistent colour across the app, so people always know where they are.
7. **Never show what you can't use.** Coached athletes never see AI. Free users see locked features only at natural upgrade moments, not everywhere.

## 2. Brand

- **Name:** Arcwell. "Arc" as in a transformation arc; "well" as in health and recovery.
- **Personality:** calm, competent, trustworthy — a serious coach's tool. Not loud, not "bro", not gamified.
- **Tagline (draft):** "Training, nutrition and recovery, coached as one."
- **Voice:** plain, short, encouraging. Say "Log set", not "Crush it!". Address the user as "you". Use Indian English and Indian units (kg, cm, katori).

## 3. App structure (information architecture)

Confirmed rules come from [DECISIONS.md](DECISIONS.md) (IDs in brackets). Section names are working labels until D3 is decided.

### Athlete bottom bar, by tier

| Tier | Bottom bar | Source |
|---|---|---|
| Free | Today · Training · Nutrition (no Recovery, no extra tabs) | D2b |
| AI-coached (Pro) | Today · Training · Nutrition · Recovery · AI Coaching | D2 |
| Human-coached (Pro) | Today · Training · Nutrition · Recovery · Progress — Progress is the combined Check-ins · Progress · Chat area | D2a, D11 |

- **Side menu (☰)** for all athletes, supplementing the bottom bar (D9): Account · Notifications · Training (Exercises, Workouts, Programs, History, Set Videos, Muscle Analytics) · Gyms · Physique (Bodyweight, Measurements, Photos, Charts).
- **Physique tools** are free and live in the side menu for everyone (D5, D9).
- **Pro access** covers AI subscribers and human-coached athletes; coached athletes need no AI subscription and never see AI coaching (D10).
- **Recovery** = sleep / sleep score, soreness, fatigue; hidden for free users (D4, D5a).
- **Open:** Today's exact contents (D2d); free access to Exercises, Workouts, History, Set Videos, Muscle Analytics, Gyms; what Set Videos, Muscle Analytics and Gyms do; Workouts vs Programs; contents of the coached Progress switch.

### Coach (proposal — coach navigation not yet reviewed)

| Tab | Contents |
|---|---|
| **Clients** | Client list sorted by "needs attention"; filters by status; client profiles |
| **Check-ins** | Inbox of submitted check-ins to review and reply to |
| **Plans** | Training and meal plan templates; plan builders; assigning |
| **Messages** | All client chats |
| **Business** | Leads, invite link, coach profile, transformations, plan and billing, settings |

## 4. Core flows to design first

| # | Flow | Status |
|---|---|---|
| F1 | Sign-up → choose role → onboarding questions | Wireframed — [f1-f3-onboarding.html](design/wireframes/f1-f3-onboarding.html) |
| F2 | Coach first run → profile → first template → share invite link | Wireframed — [f2-coach-onboarding.html](design/wireframes/f2-coach-onboarding.html) |
| F3 | Client taps invite link → installs → signs up → linked to coach | Wireframed — [f1-f3-onboarding.html](design/wireframes/f1-f3-onboarding.html) |
| F4 | Log a workout (start, log sets, rest timer, finish, summary) | Wireframed — [f4-workout-logging.html](design/wireframes/f4-workout-logging.html) |
| F5 | Log food (search, pick portion, add to meal; paid: photo) | Wireframed — [f5-food-logging.html](design/wireframes/f5-food-logging.html) |
| F6 | Weekly check-in (athlete submits → coach reviews and replies) | Wireframed — [f6-f7-checkins-chat.html](design/wireframes/f6-f7-checkins-chat.html) |
| F7 | Chat (text, image, PDF) | Wireframed — [f6-f7-checkins-chat.html](design/wireframes/f6-f7-checkins-chat.html) |
| F8 | Upgrade to paid AI tier (paywall) | Wireframed — [f8-f9-paywall-photos.html](design/wireframes/f8-f9-paywall-photos.html) |
| F9 | Transformation photo consent (request → approve with blur → withdraw) | Wireframed — [f8-f9-paywall-photos.html](design/wireframes/f8-f9-paywall-photos.html) |

| F10 | Bottom bars, side menu, Today by tier, notifications, account, privacy, export, delete, password reset | Wireframed — [f10-menu-today-account.html](design/wireframes/f10-menu-today-account.html) |
| F11 | Recovery, Physique tools, AI Coaching | Wireframed — [f11-recovery-physique-ai.html](design/wireframes/f11-recovery-physique-ai.html) |
| F12 | Coached Progress area, waiting for a plan, joining and leaving a coach | Wireframed — [f12-coached-area-switching.html](design/wireframes/f12-coached-area-switching.html) |
| F13 | Coach clients, client profile, plan and meal plan builders, assigning, leads, business | Wireframed — [f13-coach-tools.html](design/wireframes/f13-coach-tools.html) |

"Wireframed" means **drawn only**. No screen has been reviewed and approved by the founder or tested with users.

## 5. Design tokens (v0 — draft)

### Colour

Dark theme (default):

| Token | Value | Use |
|---|---|---|
| `bg` | `#0E1116` | App background |
| `surface` | `#161B22` | Cards, sheets |
| `surfaceRaised` | `#1F2630` | Inputs, pressed states |
| `border` | `#2A323D` | Dividers, outlines |
| `text` | `#F2F4F7` | Primary text |
| `textMuted` | `#9AA4B2` | Secondary text |
| `brand` | `#1FBF8F` | Primary actions, brand accent |
| `onBrand` | `#04140E` | Text on brand buttons |
| `training` | `#4C8DFF` | Training pillar |
| `nutrition` | `#F5A524` | Nutrition pillar |
| `recovery` | `#8B7CFF` | Recovery pillar |
| `success` | `#22C55E` | Completed, positive |
| `warning` | `#F59E0B` | Needs attention |
| `danger` | `#EF4444` | Destructive actions, errors only |

Light theme: same roles; values to be defined in the design-system step. All text/background pairs must meet WCAG AA contrast (4.5:1 for body text).

### Typography

- **Font:** Inter (open licence), with tabular numerals for weights, reps, calories and timers.
- **Scale:** `display` 32/40 bold · `title` 22/28 semibold · `heading` 18/24 semibold · `body` 16/24 regular · `label` 14/20 medium · `caption` 12/16 regular.
- Respect the system font-size setting; layouts must survive 130% text size.

### Spacing, shape, motion

- **Spacing:** 4-point scale — 4, 8, 12, 16, 24, 32, 48.
- **Radius:** 8 (inputs, chips) · 12 (cards) · 20 (sheets) · full (pills, avatars).
- **Tap targets:** minimum 48 × 48dp.
- **Motion:** short and functional (150–250 ms); respect the system "reduce motion" setting. Haptic tick when a set is logged.

## 6. Components (to build in `app/src/components/`)

| Component | Notes | Status |
|---|---|---|
| Button (primary, secondary, ghost, destructive) | 48dp min height | Not started |
| Text input, number stepper | Number stepper for kg/reps with big ± targets | Not started |
| Card, list row, section header | | Not started |
| Tab bar (athlete, coach variants) | | Not started |
| Set row | Previous value, weight, reps, done tick; the heart of logging | Not started |
| Rest timer | Bottom sheet, haptic at end | Not started |
| Macro ring / calorie bar | Pillar colours | Not started |
| Food result row, portion picker | Indian portions | Not started |
| Chat bubble, attachment tile | Images, PDFs | Not started |
| Check-in form fields, photo slot | | Not started |
| Empty state, error state, skeleton loader | Every list has all three | Not started |
| Paywall / locked-feature card | Shown only at upgrade moments | Not started |
| Avatar, status chip (active, paused, leaving, completed) | | Not started |

## 7. Screen inventory

Tracked here as screens are designed (Wireframe → Mockup → Built). **✅ in the Wireframe column means drawn only** — not reviewed by the founder, not tested with users.

| Screen | Role | Wireframe | Mockup | Built |
|---|---|---|---|---|
| F1-01 Splash | All | ✅ | — | — |
| F1-02 Welcome (role choice) | All | ✅ | — | — |
| F1-03 Sign up | All | ✅ | — | — |
| F1-04 Sign in | All | ✅ | — | — |
| F1-05 Consent | All | ✅ | — | — |
| F1-06 Goal | Athlete | ✅ | — | — |
| F1-07 Experience | Athlete | ✅ | — | — |
| F1-08 Body stats | Athlete | ✅ | — | — |
| F1-09 Injuries and limitations | Athlete | ✅ | — | — |
| F1-10 Schedule | Athlete | ✅ | — | — |
| F1-11 Equipment | Athlete | ✅ | — | — |
| F1-12 Diet type | Athlete | ✅ | — | — |
| F1-13a Summary — free | Athlete (free) | ✅ | — | — |
| F1-13b Summary — coached | Athlete (coached) | ✅ | — | — |
| F2-01 Coach — what you get | Coach | ✅ | — | — |
| F2-02 Coach agreement | Coach | ✅ | — | — |
| F2-03 Coach profile basics | Coach | ✅ | — | — |
| F2-04 About you | Coach | ✅ | — | — |
| F2-05 Services | Coach | ✅ | — | — |
| F2-06 First template | Coach | ✅ | — | — |
| F2-07 Invite clients | Coach | ✅ | — | — |
| F2-08 Clients — empty with setup checklist | Coach | ✅ | — | — |
| F2-09 Clients — first clients join | Coach | ✅ | — | — |
| F2-10 New client — assign plan | Coach | ✅ | — | — |
| F3-01 Invite shared (WhatsApp) | Coach → client | ✅ | — | — |
| F3-02 Invite landing | Athlete | ✅ | — | — |
| F3-03 Already coached (switch coach) | Athlete | ✅ | — | — |
| F4-01 Today — workout entry point | Athlete | ✅ | — | — |
| F4-02 Workout preview | Athlete | ✅ | — | — |
| F4-03 Active workout — set logging | Athlete | ✅ | — | — |
| F4-04 Rest timer | Athlete | ✅ | — | — |
| F4-05 Edit weight / reps | Athlete | ✅ | — | — |
| F4-06 Exercise options | Athlete | ✅ | — | — |
| F4-07 Swap exercise | Athlete | ✅ | — | — |
| F4-08 Exercise detail | Athlete | ✅ | — | — |
| F4-09 Offline during workout | Athlete | ✅ | — | — |
| F4-10 Minimised workout | Athlete | ✅ | — | — |
| F4-11 Finish confirmation | Athlete | ✅ | — | — |
| F4-12 Workout summary | Athlete | ✅ | — | — |
| F4-13 Workout history | Athlete | ✅ | — | — |
| F5-01 Day log — paid / coached | Athlete (paid, coached) | ✅ | — | — |
| F5-02 Day log — free | Athlete (free) | ✅ | — | — |
| F5-03 Empty day | Athlete | ✅ | — | — |
| F5-04 Add food — recent | Athlete | ✅ | — | — |
| F5-05 Search results | Athlete | ✅ | — | — |
| F5-06 Portion picker | Athlete | ✅ | — | — |
| F5-07 Quick add | Athlete | ✅ | — | — |
| F5-08 Create custom food | Athlete | ✅ | — | — |
| F5-09 Photo — camera | Athlete (paid) | ✅ | — | — |
| F5-10 Photo — analysing | Athlete (paid) | ✅ | — | — |
| F5-11 Photo — confirm results | Athlete (paid) | ✅ | — | — |
| F5-12 Coach meal plan | Athlete (coached) | ✅ | — | — |
| F5-13 AI meal plan | Athlete (paid) | ✅ | — | — |
| F5-14 Upgrade moment | Athlete (free) | ✅ | — | — |
| F6-01 Progress area — check-in due | Athlete (coached) | ✅ | — | — |
| F6-02 Check-in step 1 — measurements | Athlete (coached) | ✅ | — | — |
| F6-03 Check-in step 2 — photos | Athlete (coached) | ✅ | — | — |
| F6-04 Check-in step 3 — how the week went | Athlete (coached) | ✅ | — | — |
| F6-05 Check-in review and submit | Athlete (coached) | ✅ | — | — |
| F6-06 Coach feedback received | Athlete (coached) | ✅ | — | — |
| F6-07 Check-in inbox | Coach | ✅ | — | — |
| F6-08 Check-in review | Coach | ✅ | — | — |
| F6-09 Write feedback | Coach | ✅ | — | — |
| F6-10 Check-in schedule | Coach | ✅ | — | — |
| F7-01 Chat with coach | Athlete (coached) | ✅ | — | — |
| F7-02 Attach sheet | Athlete, Coach | ✅ | — | — |
| F7-03 Chat — poor connection | Athlete, Coach | ✅ | — | — |
| F7-04 Messages list | Coach | ✅ | — | — |
| F7-05 Chat with client context | Coach | ✅ | — | — |
| F8-01 Paywall | Athlete (free) | ✅ | — | — |
| F8-02 Trial timeline | Athlete (free) | ✅ | — | — |
| F8-03 AI consent | Athlete (upgrading) | ✅ | — | — |
| F8-04 Google Play purchase (system) | Athlete (upgrading) | ✅ | — | — |
| F8-05 Welcome — AI builds the plan | Athlete (paid) | ✅ | — | — |
| F8-06 Subscription details | Athlete (paid) | ✅ | — | — |
| F8-07 Payment problem (grace period) | Athlete (paid) | ✅ | — | — |
| F8-08 Subscription ended | Athlete | ✅ | — | — |
| F9-01 Transformations list | Coach | ✅ | — | — |
| F9-02 Request photos | Coach | ✅ | — | — |
| F9-03 Review request | Athlete (coached) | ✅ | — | — |
| F9-04 Adjust blur and crop | Athlete (coached) | ✅ | — | — |
| F9-05 Export approved photo | Coach | ✅ | — | — |
| F9-06 Manage and withdraw approvals | Athlete | ✅ | — | — |
| N-01 Today — free | Athlete (free) | ✅ | — | — |
| N-02 Today — AI-coached | Athlete (AI) | ✅ | — | — |
| N-03 Today — human-coached | Athlete (coached) | ✅ | — | — |
| N-04 Side menu — free | Athlete (free) | ✅ | — | — |
| N-05 Side menu — Pro | Athlete (Pro) | ✅ | — | — |
| N-06 Notifications | Athlete | ✅ | — | — |
| AC-01 Account | Athlete | ✅ | — | — |
| AC-02 Privacy and permissions | Athlete | ✅ | — | — |
| AC-03 Export my data | Athlete | ✅ | — | — |
| AC-04 Delete account | Athlete | ✅ | — | — |
| AC-05 Forgot password | All | ✅ | — | — |
| AC-06 Reset link sent / email check | All | ✅ | — | — |
| R-01 Recovery — log today | Athlete (Pro) | ✅ | — | — |
| R-02 Recovery — trends | Athlete (Pro) | ✅ | — | — |
| R-03 Recovery — first use | Athlete (Pro) | ✅ | — | — |
| PH-01 Bodyweight | Athlete | ✅ | — | — |
| PH-02 Measurements | Athlete | ✅ | — | — |
| PH-03 Photos | Athlete | ✅ | — | — |
| PH-04 Charts | Athlete | ✅ | — | — |
| AI-01 AI Coaching | Athlete (AI) | ✅ | — | — |
| AI-02 AI Coaching — permission declined | Athlete (AI) | ✅ | — | — |
| CP-01 Progress area — check-in due | Athlete (coached) | ✅ | — | — |
| CP-02 Check-in sent, awaiting feedback | Athlete (coached) | ✅ | — | — |
| CP-03 Check-in without photo permission | Athlete (coached) | ✅ | — | — |
| CP-04 Progress switch (contents open) | Athlete (coached) | ✅ | — | — |
| CP-05 Chat switch | Athlete (coached) | ✅ | — | — |
| W-01 Today — waiting for plan | Athlete (coached) | ✅ | — | — |
| W-02 Training — waiting for plan | Athlete (coached) | ✅ | — | — |
| J-01 Join coach — AI subscriber | Athlete (AI) | ✅ | — | — |
| J-02 End AI subscription | Athlete (AI) | ✅ | — | — |
| J-03 Joined — what changed | Athlete (coached) | ✅ | — | — |
| L-01 My coach | Athlete (coached) | ✅ | — | — |
| L-02 Leave coach — confirm | Athlete (coached) | ✅ | — | — |
| L-03 After leaving — what changed | Athlete (free) | ✅ | — | — |
| K-01 Client list | Coach | ✅ | — | — |
| K-02 Client profile — overview | Coach | ✅ | — | — |
| K-03 Client profile — training | Coach | ✅ | — | — |
| K-04 Change client status | Coach | ✅ | — | — |
| K-05 Plans — templates | Coach | ✅ | — | — |
| K-06 Plan builder — week | Coach | ✅ | — | — |
| K-07 Plan builder — exercise | Coach | ✅ | — | — |
| K-08 Assign and customise | Coach | ✅ | — | — |
| K-09 Meal plan builder | Coach | ✅ | — | — |
| K-10 Leads | Coach | ✅ | — | — |
| K-11 Lead — add or edit | Coach | ✅ | — | — |
| K-12 Business | Coach | ✅ | — | — |
| K-13 Plan and billing | Coach | ✅ | — | — |

## 8. Accessibility and quality checklist

- [ ] WCAG AA contrast for all text
- [ ] 48dp tap targets
- [ ] Works at 130% system font size
- [ ] Screen-reader labels on all icons and controls
- [ ] Never rely on colour alone (add icon or text)
- [ ] Every list has empty, loading and error states
- [ ] Reduce-motion respected

## 9. Decision log

| Date | Decision |
|---|---|
| 2026-11-10 | DESIGN.md created; working assumptions in section 0 pending founder confirmation |
| 2026-11-11 | Founder decisions D1–D12 recorded in [DECISIONS.md](DECISIONS.md); section 3 rewritten; F10–F13 drawn; existing screens updated |
