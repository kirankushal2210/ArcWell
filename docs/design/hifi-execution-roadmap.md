# Arcwell — Hi-fi Execution Roadmap

Written 2026-11-11. **Planning only: a draft, not approved by the founder.** Updated 2026-11-12 for onboarding v2 (D52) and D53: 217 screens. It orders the work of turning the 217 low-fi wireframes into hi-fi mockups and then into code, so every screen has exactly one phase that owns it.

Where this plan and a source differ, the source wins, in this order: `docs/DECISIONS.md` → `docs/UI-HANDOFF.md` → `docs/DESIGN.md` → `docs/design/spec-sheet.html` → this file. Where the brief for this roadmap conflicts with or adds to a decided rule, the plan follows the decided rule, and the conflict is listed in [Open questions](#open-questions).

**How this was checked.** Every `<figure>` in the 15 files of `docs/design/wireframes/` was parsed by script: 217 figures, 217 unique screen IDs (re-run 2026-11-12 after D52 and D53). Each ID maps to exactly one phase: 0 unmapped, 0 duplicates, 0 IDs that aren't in a wireframe. The inventory is in [§5](#5-screen-inventory).

## Contents

1. [How each phase runs](#1-how-each-phase-runs)
2. [Global constraints (apply to every phase)](#2-global-constraints-apply-to-every-phase)
3. [Phase overview](#3-phase-overview)
4. [Phases](#4-phases)
5. [Screen inventory](#5-screen-inventory)
6. [Open questions](#open-questions)

---

## 1. How each phase runs

Every screen phase follows the loop in UI-HANDOFF.md §5 step 4 and `design-prompt.md`:

1. Pull 2–3 references: Mobbin once it's authorised, `references.md` until then.
2. Open the wireframe and follow its structure and content. The wireframe decides *what*; this phase decides *how it looks*.
3. Make 3–5 variations and combine the best parts by hand.
4. Run the critique prompt (`design-prompt.md` §5).
5. Check contrast, 48 dp targets, 130% text, phone widths 280 / 250 / 220 px, pinned buttons clear of the bottom bar, and bottom bars matching their tier.
6. Label each mockup **"Draft, not approved or user-tested"** and record it in DESIGN.md §7 (Mockup column).
7. Stop for founder review. A phase is never treated as approved because an earlier one was.

**Files.** Each phase lists two kinds of file:

- **Mockup:** the hi-fi phase output, under `docs/design/hifi/`, using one shared stylesheet, `docs/design/hifi/hifi.css`, which imports the tokens from `docs/design/theme-tokens.css` and adds only layout and component styles. It follows the same pattern as `wireframes/wireframe.css`: one HTML file per phase, one `<figure>` per screen, keeping the wireframe ID.
- **Build (later):** code targets for UI-HANDOFF.md §5 step 5. Route paths are proposals that follow Expo Router's `src/app/` convention (see `app/AGENTS.md`). Check the SDK 58 docs before creating them.

Nothing in this roadmap has been created yet.

---

## 2. Global constraints (apply to every phase)

Each phase's "(c) Constraints" lists these by number plus its own additions.

| # | Constraint | Source |
|---|---|---|
| **G1** | **Dark charcoal surfaces.** bg `#111316` → surface `#191C21` → raised `#22262D`. Depth comes from these steps, never from shadows. | D24, DESIGN.md §5 |
| **G2** | **Electric blue `#3D8BFF` is for the primary action and brand moments only**: one primary button per screen, with `#04101F` text on it. **Cyan `#22D3EE` is the second accent** for focus, selection, chart lines and the Training pillar. Accents stay small; most of the screen is charcoal and grey. | D24, spec sheet |
| **G3** | **Solid colours only. No gradients of any kind** (purple-blue or otherwise), no glows, no neon. | D24, design-prompt negative list |
| **G4** | **No glassmorphism**: no translucent or blurred surfaces and no frosted bars. Sheet scrims are solid black at fixed opacity. The F9-04 photo blur is a privacy feature on the photo content, not a UI material. | spec sheet rules |
| **G5** | **Deliberate spacing rhythm, never one gap everywhere.** 4 dp grid (4, 8, 12, 16, 24, 32, 48): 4–8 inside a group, 16 card padding, 24–32 between unrelated groups, 48 before a section break. | design-prompt §1, DESIGN.md §5 |
| **G6** | **Inter only**, with tabular numerals for every number. Scale: 32/40 bold · 22/28 semibold · 18/24 semibold · 16/24 · 14/20 medium · 12/16. Hierarchy comes from size and weight, not colour. | D46, DESIGN.md §5 |
| **G7** | **Lucide icons only.** The wireframe emoji (🔒 🔔 ☰) are placeholders. | UI-HANDOFF §3 |
| **G8** | **Coached athletes never see AI**: no AI tab, entry point, upsell, copy or badge on any coached-athlete screen. Free users see AI only at the drawn upgrade moments. | SPEC, D10, D44 |
| **G9** | **No streaks, XP, badges or confetti.** Never red for a missed target. Red is only for errors and destructive actions. | D24 |
| **G10** | **Accessibility floor:** WCAG AA (4.5:1 body text, 3:1 large text and control outlines), **48 × 48 dp** tap targets, layouts survive 130% text, never colour alone, screen-reader labels. | DESIGN.md §8 |
| **G11** | **Motion tokens:** 120 / 200 / 280 ms, easing `cubic-bezier(.2,0,0,1)`, numbers roll, skeletons never spinners, no animated background, and instant transitions with "Remove animations" on. The only 600 ms moment is F4-12. | DESIGN.md §5 |
| **G12** | **Android and Material 3**: 412 × 915 dp frame, top app bar, bottom bar, bottom sheets, system back. Never iOS patterns. Primary actions sit in the bottom half. | design-prompt §1 |
| **G13** | **Copy:** Indian English, calm and plain ("Log set"). Indian foods and portions (katori, roti), kg and cm only. Realistic data, including long names. | UI-HANDOFF §3, D45 |
| **G14** | **Bottom bars match the tier exactly.** Free: Today · Training · Nutrition. AI: + Recovery · AI Coaching. Coached: + Recovery · Progress. Coach: Clients · Check-ins · Plans · Messages · Business. No Recovery on free screens. | D2, D2a, D2b, D23 |

---

## 3. Phase overview

32 phases. **Gates** (◆) are decisions or checks that later phases wait on. They own no screens.

| Phase | Name | Screens | Waits on |
|---|---|---|---|
| ◆ 0 | Brand lock and references | 0 | founder: wordmark, illustration rule; Mobbin auth |
| 1 | Semantic tokens | 0 | 0 |
| 2a | Typography and base elements | 0 | 1 |
| 2b | Missing components and form states | 1 | 2a |
| 3 | Global navigation and app shell | 2 | 2a |
| ◆ 4 | Look direction: Today three ways | 0 | 0, 3 |
| 5 | Today by tier | 7 | 4 |
| 6 | Entry, sign-up and onboarding | 35 | 0 (wordmark), 5 |
| 7a | Training landing, library and history | 14 | 5 |
| 7b | Active workout and summary | 11 | 7a |
| 8a | Nutrition day log and adding food | 10 | 5 |
| 8b | AI photo logging and meal plans | 6 | 8a |
| 9 | Recovery | 4 | 5 |
| 10 | Physique tools | 4 | 3 |
| 11 | AI Coaching (AI subscribers only) | 8 | 5 |
| 12a | Coach chat: athlete side, and attachment viewers | 6 | 2b |
| 12b | Coached Progress area and weekly check-in | 11 | 2b, 12a |
| 12c | Transformation photo consent (athlete) | 3 | 12b |
| 13a | Coach onboarding | 15 | 3, 6 |
| 13b | Clients and client profile | 11 | 13a |
| 13c | Coach check-ins inbox and review | 4 | 12b, 13b |
| 13d | Plans: templates and builders | 7 | 7b, 8a |
| 13e | Coach messages | 2 | 12a |
| 13f | Business, transformations and coach lifecycle | 12 | 13b, 12c |
| 14 | Coaching changes: join, leave, close | 8 | 5, 12b, 16b |
| 15 | Side-menu destinations: Account, Notifications, Gyms | 14 | 3 |
| 16a | Empty states | 8 | 0 (illustration rule), each area phase |
| 16b | Trial, paywall and subscription | 9 | 5, 11 |
| 16c | System and error states | 5 | 2b |
| 16d | Long names and content stress pass | 0 | every screen phase |
| 17 | Accessibility and QA sweep | 0 | every screen phase |
| ◆ 18 | Record and hand to build | 0 | 17 |
| | **Total** | **217** | |

The order follows the handoff where the brief left it open. Tokens and base elements go first, then the Today direction is picked, then Today, Active workout and Food day log come first among screen phases (design-prompt cards 1–3). After that, phases can run in any order their dependencies allow.

---

## 4. Phases

### ◆ Phase 0 — Brand lock and references

- **Screens:** none (gate).
- **Why first:** Substack step 1 ("lock the brand before any screen") and UI-HANDOFF §5 steps 1–2.
- **Open founder decisions:**
  1. Wordmark: A Ring, B Arch or C Open c (`docs/design/wordmark-directions.html`, draft).
  2. Illustration rule: none (Lucide and real photos only) or simple line style for empty states only.
  3. Founder confirms the brand rules as stated back.
- **(a) Files:**
  - Read: `docs/design/wordmark-directions.html`, `docs/design/references.md`, `docs/design/assets.md`.
  - Create: `docs/design/hifi/references/` with Mobbin captures per screen card, once Mobbin is authorised.
  - Update after the founder decides: DESIGN.md §2 (logo, illustration rule), `assets.md` §1 and §4.
  - Build (later): `app/assets/images/icon.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`, `splash-icon.png` (replacing the Expo placeholders).
- **(b) Components:** wordmark lockup, app-icon symbol, mono version for photo exports (D45).
- **(c) Constraints:** G2, G3, G6. The logo must reflect the theme ("arc" for transformation, "well" for health and recovery).
- **Unblocks:** 6 (splash, welcome), 16a (empty states), 13f (export frame), 4 (references).

### Phase 1 — Semantic tokens

- **Screens:** none.
- **(a) Files:**
  - Mockup: `docs/design/theme-tokens.css` (done 2026-11-11; the founder chose to keep the decided values over the brief's examples) holds the `:root` custom properties copied from `spec-sheet.html` and DESIGN.md §5. Its named palette (`--charcoal-900` etc.) only labels existing values; the scrim `rgb(0 0 0 / 0.6)` was added to DESIGN.md §5 by D47. `docs/design/hifi/hifi.css` imports it.
  - Docs: DESIGN.md §5 stays the source.
  - Build (later): `app/src/theme/colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `motion.ts`, `index.ts`.
- **(b) Contents:**
  - **Colour roles:** bg, surface, surfaceRaised, border, borderStrong, text, textMuted, brand, onBrand, accent, training, nutrition, recovery, success, warning, danger.
  - **Interaction steps:** brand hover `#5A9CFF` and disabled `#5F6670` text (already in the spec sheet), and pressed steps.
  - **Font stacks:**
    - Mockups: `Inter, system-ui, sans-serif` with `font-feature-settings:"tnum"`.
    - App: Inter loaded with `expo-font` at weights 400 / 500 / 600 / 700, falling back to the Android system sans.
  - **Spacing:** the 4 dp grid (4, 8, 12, 16, 24, 32, 48), plus named rhythm tokens: `gapInGroup` 8, `cardPad` 16, `gapBetweenGroups` 24, `sectionBreak` 32–48.
  - **Radius:** 8 / 12 / 20 / full. Motion durations and easing.
- **(c) Constraints:** G1, G2, G3, G5, G6, G11. Every pair re-checked with the WCAG formula. No hex ramps (50–900) are invented; see Open question Q4.
- **Done when:** `theme-tokens.css` and DESIGN.md §5 match value for value.

### Phase 2a — Typography and base elements

- **Screens:** none (component sheet).
- **(a) Files:**
  - Mockup: create `docs/design/hifi/02-base-elements.html`.
  - Build (later): `app/src/components/Text.tsx`, `Button.tsx`, `TextInput.tsx`, `NumberStepper.tsx`, `Chip.tsx`, `StatusChip.tsx`, `Card.tsx`, `ListRow.tsx`, `SectionHeader.tsx`, `Avatar.tsx`.
- **(b) Components:**
  - Text styles: display, title, heading, body, label, caption.
  - Buttons: primary, secondary, ghost, destructive and disabled, each with pressed and focus states.
  - Text input: default, focus, error, disabled.
  - Number stepper.
  - Filter chip and status chip (active, paused, leaving, completed).
  - Card, list row, section header, avatar with initials fallback.
  - **Toggle (switch):** drawn 25 times in the wireframes but missing from the spec sheet. Material 3 switch: on is the accent, off is borderStrong.
- **(c) Constraints:** G2 (one primary per screen), G5, G6, G10 (48 dp height; focus ring in cyan), G11 (120 ms press), G12.

### Phase 2b — Missing components and form states

- **Screens (1):** S-03 Form validation.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/02b-components-forms.html`.
  - Update the spec sheet later, only on the founder's request (not part of this roadmap's output).
  - Build (later): `app/src/components/SegmentedControl.tsx`, `OptionCard.tsx`, `Checkbox.tsx`, `BottomSheet.tsx`, `CheckInField.tsx`, `PhotoSlot.tsx`, `FieldError.tsx`.
- **(b) Components:**
  - Segmented control: the `seg` pattern, used on 10 wireframe pages.
  - Onboarding option card, single and multi-select (`opt` / `sel`).
  - Checkbox.
  - Bottom sheet with grab handle and scrim.
  - **Check-in form fields** and **photo slot**: the two gaps the handoff names.
  - Inline field error and summary error.
- **(c) Constraints:** G4 (scrim solid, not blurred), G5, G9 (error red only for real errors), G10 (errors in text plus icon, not colour alone), G13 (plain error copy).

### Phase 3 — Global navigation and app shell

- **Screens (2):** N-04 Side menu (free), N-05 Side menu (Pro).
- **(a) Files:**
  - Mockup: create `docs/design/hifi/03-navigation.html`.
  - Build (later):
    - Components: `app/src/components/TopAppBar.tsx`, `BottomBar.tsx`, `SideMenu.tsx`, `OfflineBanner.tsx`.
    - Layout: `app/src/app/_layout.tsx`, which exists as a scaffold.
    - Proposed route groups: `app/src/app/(athlete)/(tabs)/_layout.tsx` and `app/src/app/(coach)/(tabs)/_layout.tsx`.
- **(b) Components:**
  - **Status bar and safe areas:** edge-to-edge Android, with insets for gesture and three-button navigation.
  - **Top app bar:** ☰ / back, title, actions.
  - **Bottom bars:** four variants. Three athlete tiers (Free 3 tabs, AI 5, coached 5) and the coach bar (Clients · Check-ins · Plans · Messages · Business).
  - Side menu, with the Pro lock row on free.
  - Minimised-workout bar slot, used in 7b.
  - Offline banner slot.
- **(c) Constraints:** G14 is the core check. G7 (Lucide tab icons), G10 (48 dp tab targets; labels always shown), G12. Selected tab: a raised pill with a cyan icon, as in the spec sheet. The coach shell has no ☰ athlete menu; coach settings live in Business (sitemap §5).

### ◆ Phase 4 — Look direction: Today three ways

- **Screens:** none owned. It draws N-01 three ways as a study; Phase 5 owns the real screens.
- **Why:** UI-HANDOFF §5 step 3 and Substack step 2. One page, three directions side by side, grounded in 2–3 Mobbin references and the spec sheet. **The founder picks one, and it sets the look for every later phase.**
- **(a) Files:** create `docs/design/hifi/04-today-directions.html`.
- **(b) Components:** whatever Today needs, from 2a, 2b and 3.
- **(c) Constraints:** G1–G14. Each direction must stay inside the tokens; they differ in hierarchy, density and composition, not palette.
- **Exit:** the founder's pick is recorded (proposed: DECISIONS.md, on the founder's say-so).

### Phase 5 — Today by tier

- **Screens (7):**
  - N-01 Today — free
  - N-02 Today — AI-coached
  - N-03 Today — human-coached
  - F4-01 Workout entry point on Today
  - W-01 Today — waiting for plan
  - CS-01 Coaching paused
  - CS-02 Coaching ending
- **(a) Files:**
  - Mockup: create `docs/design/hifi/05-today.html`.
  - Build (later): `app/src/app/(athlete)/(tabs)/index.tsx` (Today); `app/src/components/TodayWorkoutCard.tsx`, `CalorieBar.tsx`, `PillarCard.tsx`, `Banner.tsx`.
- **(b) Components:** today's workout card, calorie bar (calories only on free), macro bars (AI and coached), recovery summary (AI and coached only), coach note card (coached), banners for paused and ending, waiting-for-plan card.
- **(c) Constraints:** G1–G14, plus:
  - Layouts N-01 to N-03 are final (D2d, D23): restyle them, don't restructure.
  - **N-03 and W-01 show no AI** (G8).
  - **N-01 shows no Recovery** (D2b, D5a).
  - Pillar colours appear only as small markers.
  - Missed targets are neutral, never red.
- **Note:** the brief's "Coach state" for Today is read as the **human-coached athlete** (N-03). Coaches have no Today tab; their home is Clients (Phase 13b). See Q6.

### Phase 6 — Entry, sign-up and onboarding

- **Screens (35):**
  - Entry and account: F1-01, F1-02, F1-02a (role sheet), F1-03 to F1-05, F1-05b
  - Athlete onboarding (D52): AO-01 to AO-21, AO-21b. Draft mockups already exist in `hifi-mockups/onboarding-flow.html`.
  - Password reset: AC-05, AC-06
  - Invite link: F3-01 to F3-03
  - Coach is full: K-26
- **(a) Files:**
  - Mockup: create `docs/design/hifi/06-entry-onboarding.html`.
  - Build (later): proposed `app/src/app/(auth)/welcome.tsx`, `sign-up.tsx`, `sign-in.tsx`, `consent.tsx`, `forgot-password.tsx`, `app/src/app/(onboarding)/[step].tsx`, `app/src/app/invite/[code].tsx`; `app/src/components/OnboardingStep.tsx`, `ProgressDots.tsx`.
- **(b) Components:** wordmark (Phase 0), Google sign-in button, option cards, wheel picker for body stats and sleep (D53), segmented 1–5 scales, role sheet, consent rows with toggles, progress indicator, invite landing card with coach profile.
- **(c) Constraints:** G1–G14, plus:
  - **Waits on the wordmark** for F1-01 and F1-02.
  - F1-02 hero is a phone-in-phone carousel of real screens (D53), so it needs no photo; F1-02a is the role sheet.
  - **F1-05b skips the AI permission step** (D44, G8).
  - AO-21b promises no turnaround time.
  - AO-19 shows calories only for free users (D5); AO-20 lists no AI features (D44).
  - Sex is optional (D44).
  - The role is chosen before sign-up (D44).

### Phase 7a — Training landing, library and history

- **Screens (14):**
  - Training landing: T-01 to T-04
  - Workouts: TR-01, TR-02, TR-03 (create workout)
  - Programs: TR-04 (Pro), TR-05 (locked)
  - Muscle Analytics: TR-06 (Pro), TR-07 (locked)
  - W-02 Training — waiting for plan
  - F4-08 Exercise detail
  - F4-13 Workout history
- **(a) Files:**
  - Mockup: create `docs/design/hifi/07a-training-library.html`.
  - Build (later): proposed `app/src/app/(athlete)/(tabs)/training.tsx`, `app/src/app/(athlete)/workouts/index.tsx`, `workouts/new.tsx`, `programs/index.tsx`, `muscle-analytics.tsx`, `exercises/index.tsx`, `exercises/[id].tsx`, `history.tsx`; `app/src/components/WorkoutCard.tsx`, `ExerciseRow.tsx`, `LockedFeatureCard.tsx`, `MuscleSetsChart.tsx`.
- **(b) Components:** plan card (free starter, AI plan, coach plan), workout card, exercise row, exercise media slot, locked-feature card (TR-05, TR-07), weekly sets per muscle chart (D28), history list.
- **(c) Constraints:** G1–G14, plus:
  - Free sees templates only, with no editing (D26).
  - Locked cards appear only at the drawn upgrade moments.
  - **T-03 shows the coach's plan with no AI** (G8).
  - No video (D14).
  - Charts use solid cyan with no area gradient (G3).

### Phase 7b — Active workout and summary

- **Screens (11):**
  - Workout preview: F4-02
  - During the workout: F4-03 to F4-07, F4-09, F4-10
  - Finishing: F4-11, F4-12
  - Timed and bodyweight sets: TR-08
- **(a) Files:**
  - Mockup: create `docs/design/hifi/07b-active-workout.html`, including a motion demo for F4-12.
  - Build (later): proposed `app/src/app/(athlete)/workout/[id]/preview.tsx`, `workout/[id]/active.tsx`, `workout/[id]/summary.tsx`; `app/src/components/SetRow.tsx`, `RestTimerSheet.tsx`, `ExerciseOptionsSheet.tsx`, `SwapExerciseSheet.tsx`, `MiniWorkoutBar.tsx`, `SummaryRing.tsx`, `RollingNumber.tsx`.
- **(b) Components:** set row (previous value, kg, reps, done tick), timed and bodyweight set rows, rest timer sheet, edit sheet with stepper, options sheet, swap list, offline "saved on this phone" banner, minimised bar, finish dialog, per-workout effort rating (D45), summary ring with rolling numbers and a new-best row.
- **(c) Constraints:** G1–G14, plus:
  - **F4-12 is the only 600 ms big moment** (ring fills, volume rolls up, new best slides in, strong haptic, no confetti).
  - Haptic tick on each logged set.
  - One-handed use: the done tick and stepper sit in the thumb zone.
  - Big numbers in display weight, tabular.
  - Coached swaps are "today only" (D45).

### Phase 8a — Nutrition day log and adding food

- **Screens (10):**
  - Day log: F5-01 (paid / coached), F5-02 (free), F5-03 (empty day)
  - Adding food: F5-04 to F5-08
  - Editing: X-03 Edit a logged food, X-04 Removed — undo
- **(a) Files:**
  - Mockup: create `docs/design/hifi/08a-nutrition-log.html`.
  - Build (later): proposed `app/src/app/(athlete)/(tabs)/nutrition.tsx`, `app/src/app/(athlete)/food/add.tsx`, `food/search.tsx`, `food/[id]/portion.tsx`, `food/quick-add.tsx`, `food/new.tsx`; `app/src/components/MealSection.tsx`, `FoodResultRow.tsx`, `PortionPicker.tsx`, `MacroBars.tsx`, `UndoSnackbar.tsx`.
- **(b) Components:** calorie hero number, macro bars (paid and coached only), meal sections, food result row (verified badge plus personal foods; D45, no crowd database), portion picker (katori, roti, grams), quick add, custom food form, undo snackbar.
- **(c) Constraints:** G1–G14, plus:
  - **Free is calories only** (D5), with no macro hints.
  - Nutrition amber `#F5A524` is a marker, not a fill for whole cards.
  - Going over target is never red.
  - Indian foods and portions in every sample; portion gram weights stay "TBC" (PLAN.md).

### Phase 8b — AI photo logging and meal plans

- **Screens (6):**
  - AI photo logging: F5-09 camera, F5-10 analysing, F5-11 confirm results
  - Meal plans: F5-12 coach meal plan, F5-13 AI meal plan
  - F5-14 Upgrade moment (free)
- **(a) Files:**
  - Mockup: create `docs/design/hifi/08b-photo-meal-plans.html`.
  - Build (later): proposed `app/src/app/(athlete)/food/photo.tsx`, `app/src/app/(athlete)/meal-plan.tsx`; `app/src/components/CameraFrame.tsx`, `PhotoResultRow.tsx`, `MealPlanDay.tsx`.
- **(b) Components:** camera overlay, analysing skeleton (no spinner), editable result rows, meal plan day view, upgrade card.
- **(c) Constraints:** G1–G14, plus:
  - **F5-09 to F5-11 and F5-13 are Arcwell Plus only. F5-12 is coached-only and must show no AI wording** (G8).
  - AI photo wording waits on the Groq data terms (PLAN.md).
  - The analysing state uses a skeleton, not a spinner (G11).

### Phase 9 — Recovery

- **Screens (4):** R-01 Log today, R-02 Trends, R-03 First use, R-04 Coached, with coach target.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/09-recovery.html`.
  - Build (later): proposed `app/src/app/(athlete)/(tabs)/recovery.tsx`, `recovery/trends.tsx`; `app/src/components/SleepScoreDial.tsx`, `ScaleSelector.tsx`, `TrendChart.tsx`.
- **(b) Components:** 0–100 sleep score dial (D18), sleep hours stepper, quality, soreness and fatigue scales, trend chart, coach target card (R-04).
- **(c) Constraints:** G1–G14, plus:
  - **Never shown to free users** (D5a).
  - Scope is sleep, soreness and fatigue only, with no mobility routines (D4).
  - Recovery violet is a solid marker with no gradient dial (G3).
  - The score formula is TBC (D30), so mockups show a value with no formula claims.

### Phase 10 — Physique tools

- **Screens (4):** PH-01 Bodyweight, PH-02 Measurements, PH-03 Photos, PH-04 Charts.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/10-physique.html`.
  - Build (later): proposed `app/src/app/(athlete)/physique/bodyweight.tsx`, `measurements.tsx`, `photos.tsx`, `charts.tsx`; `app/src/components/PhotoGrid.tsx`, `LineChart.tsx`.
- **(b) Components:** bodyweight entry and list, measurement fields (cm), photo grid with the photo slot from 2b, line chart with range chips.
- **(c) Constraints:** G1–G14, plus:
  - Free for everyone (D5); reached from ☰.
  - Photos are private by default; consent copy follows D12.
  - kg and cm only (D45).
  - Arcwell branding stays on photo exports, so this waits on the wordmark mono version (Phase 0).

### Phase 11 — AI Coaching (AI subscribers only)

- **Screens (8):**
  - AI-01 AI Coaching
  - AI-02 Permission declined
  - AI-03 Turn off AI — confirm
  - AI-04 Out of scope
  - X-01 AI daily limit reached
  - X-02 AI plan couldn't be built
  - F8-05 Welcome — AI builds the plan
  - U-01 Upgrade — what changed
- **(a) Files:**
  - Mockup: create `docs/design/hifi/11-ai-coaching.html`.
  - Build (later):
    - Route: proposed `app/src/app/(athlete)/(tabs)/ai-coaching.tsx`.
    - Components: `app/src/components/AiPlanCard.tsx`, `AdjustmentRow.tsx`, `AiStateCard.tsx`.
    - Server side, already decided: entitlement and cap checks live in `supabase/functions/_shared/ai/`, not in the UI.
- **(b) Components:** AI plan summary card, "this week's change" card, adjust-my-plan list rows, permission-off state, limit and failure states, a structured "I can't help with that" state, building-plan skeleton.
- **(c) Constraints:** G1–G14, plus:
  - **The wireframes draw AI Coaching as a structured plan with adjustment options, not a chat.** No chat bubbles here unless the founder asks (Q5).
  - **Never reachable by coached athletes** (G8), enforced server-side.
  - Declining AI never blocks non-AI features (D8).
  - Out-of-scope requests route nowhere (D22).
  - AI is never shown as a character or avatar, and gets no sparkle or gradient treatment (G3).

### Phase 12a — Coach chat: athlete side, and attachment viewers

- **Screens (6):**
  - F7-01 Chat with coach
  - F7-02 Attach sheet
  - F7-03 Poor connection
  - CP-05 Chat switch
  - X-05 Image viewer
  - X-06 PDF viewer
- **(a) Files:**
  - Mockup: create `docs/design/hifi/12a-chat.html`.
  - Build (later): proposed `app/src/app/(athlete)/(tabs)/progress/chat.tsx`, `app/src/app/viewer/image.tsx`, `viewer/pdf.tsx`; `app/src/components/ChatBubble.tsx`, `AttachmentTile.tsx`, `ChatComposer.tsx`, `MessageStatus.tsx`.
- **(b) Components:**
  - Chat bubbles: sent and received, consecutive grouping, timestamps.
  - Composer input states: empty, typing, sending, failed and retry, offline.
  - Attachment sheet (image, PDF), attachment tiles, image viewer, PDF viewer.
- **(c) Constraints:** G1–G14, plus:
  - Text, image and PDF only: no voice notes (v1.1) and no video (D14).
  - Sent bubbles use a raised surface or a restrained brand tint, never a gradient (G3).
  - A failed state shows text plus icon (G10).
  - Long coach names must truncate cleanly.

### Phase 12b — Coached Progress area and weekly check-in

- **Screens (11):**
  - Check-in flow: F6-01 to F6-06
  - Check-in states: CP-01 due, CP-02 sent and awaiting feedback, CP-03 photos not allowed
  - Timeline: CP-04 Progress switch, CP-06 Past check-in (read-only)
- **(a) Files:**
  - Mockup: create `docs/design/hifi/12b-checkins-progress.html`.
  - Build (later): proposed `app/src/app/(athlete)/(tabs)/progress/index.tsx`, `progress/timeline.tsx`, `progress/check-in/[step].tsx`, `progress/check-in/[id].tsx`; `app/src/components/CheckInStep.tsx`, `TimelineItem.tsx`, `FeedbackCard.tsx`.
- **(b) Components:** three-way segmented switch (Check-ins · Progress · Chat), check-in due card, step header, check-in fields and photo slot (2b), review summary, coach feedback card, timeline item, read-only check-in view.
- **(c) Constraints:** G1–G14, plus:
  - **Coached only.** Athletes never see the coach's review tools (D11).
  - Photos are optional and never block submitting (D12).
  - Check-in questions as drawn in F6-04 (D45).
  - Overdue is neutral or warning, never red (G9).

### Phase 12c — Transformation photo consent (athlete)

- **Screens (3):** F9-03 Review request, F9-04 Adjust blur and crop, F9-06 Manage and withdraw.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/12c-photo-consent.html`.
  - Build (later): proposed `app/src/app/(athlete)/photo-requests/[id].tsx`, `photo-requests/manage.tsx`; `app/src/components/BlurCropEditor.tsx`, `ConsentStatusRow.tsx`.
- **(b) Components:** request card, before/after preview, blur and crop controls, approval status rows (pending, approved, withdrawn).
- **(c) Constraints:** G1–G14, plus:
  - Withdrawing is always one clear step (D38).
  - The blur is a content edit, so G4 doesn't apply to it.
  - Consent copy is plain and states who sees what.

### Phase 13a — Coach onboarding

- **Screens (15):**
  - Set up the business (D52): CO-02 to CO-12
  - First days: CO-13 to CO-15
  - K-19 Coach sign-up (CO-01 in the mockups)
  - Draft mockups already exist in `hifi-mockups/coach-onboarding.html`.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/13a-coach-onboarding.html`.
  - Build (later): proposed `app/src/app/(coach-onboarding)/[step].tsx`; `app/src/components/SetupChecklist.tsx`, `InviteShareCard.tsx`.
- **(b) Components:** agreement screen, profile form, services list, template picker, invite share card (copy, WhatsApp, Instagram, QR), setup checklist, first-client rows.
- **(c) Constraints:** G1–G14, plus:
  - Coach Terms copy waits on legal review (PLAN.md).
  - No certificate checks (SPEC), so certifications are labelled self-reported (D43).
  - Coach fees are paid outside the app (Razorpay), with no in-app purchase UI.

### Phase 13b — Clients and client profile

- **Screens (11):**
  - Client list and profile: K-01 to K-04
  - Profile sections: K-14 to K-18
  - K-24 Set sleep target and recovery note
  - K-30 Complete a client — confirm
- **(a) Files:**
  - Mockup: create `docs/design/hifi/13b-clients.html`.
  - Build (later): proposed `app/src/app/(coach)/(tabs)/clients/index.tsx`, `clients/[id]/[section].tsx`; `app/src/components/ClientRow.tsx`, `AttentionReason.tsx`, `AdherenceStat.tsx`, `ProfileTabs.tsx`.
- **(b) Components:** client row with avatar, status chip and needs-attention reason; filter chips; profile header; scrollable section tabs; adherence stats; private notes; status-change sheet; sleep target stepper.
- **(c) Constraints:** G1–G14, plus:
  - Sorted by "needs attention" (sitemap).
  - **History is shown only from the join date unless granted** (AGENTS.md RLS rule, D37), so mockups show the "before join" boundary.
  - Low adherence (under 60%, D45) is shown as warning, not red.
  - Density suits 20–60 clients.
  - Long names in rows: see 16d.

### Phase 13c — Coach check-ins inbox and review

- **Screens (4):** F6-07 Check-in inbox, F6-08 Check-in review, F6-09 Write feedback, F6-10 Check-in schedule.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/13c-coach-checkins.html`.
  - Build (later): proposed `app/src/app/(coach)/(tabs)/check-ins/index.tsx`, `check-ins/[id].tsx`, `check-ins/schedule.tsx`; `app/src/components/CompareMeasurements.tsx`, `PhotoCompare.tsx`.
- **(b) Components:** inbox rows (submitted, overdue, reviewed), compare-with-last measurements, photo compare, feedback composer, weekday picker.
- **(c) Constraints:** G1–G14, plus no reply-time promise (D45) and photos only where the athlete allowed them.

### Phase 13d — Plans: templates and builders

- **Screens (7):**
  - Templates and builders: K-05 to K-09
  - K-22 Meal plan templates
  - K-23 Coach exercise library
- **(a) Files:**
  - Mockup: create `docs/design/hifi/13d-plans.html`.
  - Build (later): proposed `app/src/app/(coach)/(tabs)/plans/index.tsx`, `plans/training/[id].tsx`, `plans/meals/[id].tsx`, `plans/assign.tsx`, `plans/exercises.tsx`; `app/src/components/WeekGrid.tsx`, `PlanExerciseEditor.tsx`, `MealBuilderRow.tsx`.
- **(b) Components:** template list, week and day grid, exercise editor (sets, reps, rest, effort), meal builder rows with totals, assign-and-customise sheet, exercise library list.
- **(c) Constraints:** G1–G14, plus:
  - Reuses 7b and 8a components rather than inventing new ones.
  - No supersets (v1.1, D45).
  - Billing lapse disables editing (D41); the state is in 13f.

### Phase 13e — Coach messages

- **Screens (2):** F7-04 Messages list, F7-05 Chat with client context.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/13e-coach-messages.html`.
  - Build (later): proposed `app/src/app/(coach)/(tabs)/messages/index.tsx`, `messages/[clientId].tsx`; `app/src/components/ConversationRow.tsx`, `ClientContextStrip.tsx`.
- **(b) Components:** conversation row with unread count, client context strip, and the 12a chat components.
- **(c) Constraints:** G1–G14, plus no chat with leads (D45) and no saved replies (v1.1).

### Phase 13f — Business, transformations and coach lifecycle

- **Screens (12):**
  - Leads and business: K-10 to K-13
  - Profile and settings: K-20 Edit coach profile, K-21 Coach settings
  - Transformations: F9-01 list, F9-02 request photos, F9-05 export approved photo
  - Lifecycle: K-25 Client limit reached, K-27 Billing lapsed, K-28 Delete coach account
- **(a) Files:**
  - Mockup: create `docs/design/hifi/13f-business.html`.
  - Build (later): proposed `app/src/app/(coach)/(tabs)/business/index.tsx`, `business/leads/[id].tsx`, `business/profile.tsx`, `business/billing.tsx`, `business/transformations/index.tsx`, `business/settings.tsx`; `app/src/components/LeadRow.tsx`, `ExportFrame.tsx`, `BillingStateCard.tsx`.
- **(b) Components:** lead row and status chips (new, contacted, converted, lost), invite link and QR, profile editor, transformation status rows, branded export frame, billing and limit state cards, destructive confirm.
- **(c) Constraints:** G1–G14, plus:
  - The export frame waits on the wordmark (Phase 0).
  - Razorpay link only; Play prices and invite domain are TBC (PLAN.md).
  - The coach profile audience is the invite page and own clients only (D43).
  - Delete uses the destructive style.

### Phase 14 — Coaching changes: join, leave, close

- **Screens (8):**
  - Joining a coach as an AI subscriber: J-01 to J-03
  - Leaving a coach: L-01 to L-03
  - K-29 Coach account closed (athlete)
  - AC-10 Coach access to earlier history
- **(a) Files:**
  - Mockup: create `docs/design/hifi/14-coaching-changes.html`.
  - Build (later): proposed `app/src/app/(athlete)/coach/index.tsx`, `coach/join.tsx`, `coach/leave.tsx`, `coach/history-access.tsx`; `app/src/components/WhatChangedList.tsx`.
- **(b) Components:** "what changed" list, explicit Play Store cancellation step, leave confirm with the photo choice (D38), history-access toggle.
- **(c) Constraints:** G1–G14, plus:
  - Cancellation is never automatic (D7a), and refunds happen outside the app (D19).
  - Logs are never deleted (D7c).
  - After leaving, the bottom bar shows the free set (G14, D21).
  - History sharing is off by default (D37).

### Phase 15 — Side-menu destinations: Account, Notifications, Gyms

- **Screens (14):**
  - Account: AC-01 to AC-04, AC-07 to AC-09
  - N-06 Notifications
  - Gyms: G-01 map and list, G-02 gym detail
  - Permissions and export: X-07 to X-10
- **(a) Files:**
  - Mockup: create `docs/design/hifi/15-account-gyms.html`.
  - Build (later): proposed `app/src/app/(athlete)/account/index.tsx`, `account/privacy.tsx`, `account/export.tsx`, `account/delete.tsx`, `account/profile.tsx`, `account/units.tsx`, `account/help.tsx`, `app/src/app/(athlete)/notifications.tsx`, `app/src/app/(athlete)/gyms/index.tsx`, `gyms/[id].tsx`; `app/src/components/SettingsRow.tsx`, `GymRow.tsx`, `MapView.tsx`.
- **(b) Components:** settings rows with toggles, permission rows, export progress, delete flow, notification list, gym list and map, equipment tags, pre-permission explainer, system dialog frame.
- **(c) Constraints:** G1–G14, plus:
  - Deleting with an active subscription shows the "Cancel in Play Store first" step (D36).
  - Units are kg only (D45).
  - Gyms are read-only (D15), and location is optional (D29).
  - X-08 is the Android system dialog: show it, don't restyle it.

### Phase 16a — Empty states

- **Screens (8):**
  - Athlete: E-01 Workout history, E-02 Notifications, E-03 Exercise library (no results), E-04 Physique charts (no data)
  - Coach: E-05 Check-in inbox, E-06 Messages, E-07 Leads, E-08 Transformations
- **(a) Files:**
  - Mockup: create `docs/design/hifi/16a-empty-states.html`.
  - Build (later): `app/src/components/EmptyState.tsx`.
- **(b) Components:** one empty-state pattern (icon or illustration, one line of copy, one action), applied to each list.
- **(c) Constraints:** G1–G14, plus:
  - **Waits on the illustration rule** (Phase 0). The wireframes hold 15 illustration placeholders.
  - Text is centred only for single empty-state messages (spec sheet).
  - The copy offers the next step and never shames.

### Phase 16b — Trial, paywall and subscription

- **Screens (9):**
  - Paywall and purchase: F8-01 Paywall, F8-02 Trial timeline, F8-03 AI consent, F8-04 Google Play purchase
  - Managing the subscription: F8-06 details, F8-07 payment problem, F8-08 subscription ended
  - Trial end: TL-01 day 5 reminder, TL-02 trial ended, not paid
- **(a) Files:**
  - Mockup: create `docs/design/hifi/16b-trial-paywall.html`.
  - Build (later): proposed `app/src/app/paywall.tsx`, `app/src/app/(athlete)/account/subscription.tsx`; `app/src/components/PaywallPlanCard.tsx`, `TrialTimeline.tsx`, `TrialReminderCard.tsx`.
- **(b) Components:** paywall with feature list, trial timeline (day 1, day 5 reminder, day 7 charge), AI consent sheet, Play purchase frame (system), subscription state cards.
- **(c) Constraints:** G1–G14, plus:
  - 7-day trial, then a hard paywall (D17).
  - "Not now" on consent returns to the paywall with no trial (D35).
  - The day-5 reminder is an in-app card plus push (D34).
  - **No dark patterns:** the price and charge date are visible, and the close control is a 48 dp target.
  - **Never shown to coached athletes** (G8).
  - Play prices are TBC, so mockups show a placeholder.

### Phase 16c — System and error states

- **Screens (5):** S-01 Loading, S-02 Error and retry, S-04 Permission denied, S-05 Force update, S-06 Maintenance / service down.
- **(a) Files:**
  - Mockup: create `docs/design/hifi/16c-system-states.html`.
  - Build (later): `app/src/components/Skeleton.tsx`, `ErrorState.tsx`, `PermissionDenied.tsx`; proposed `app/src/app/force-update.tsx`, `maintenance.tsx`.
- **(b) Components:** skeletons for every main list and card, error card with retry, permission-denied card with a Settings link, full-screen system pages.
- **(c) Constraints:** G1–G14, plus:
  - **Skeletons, never spinners** (G11).
  - Error messages never include health data (AGENTS.md).
  - Every list in every phase has empty, loading and error states (DESIGN.md §8). This phase defines them; 17 checks them.

### Phase 16d — Long names and content stress pass

- **Screens:** none owned. It is a sweep across all 217 screens.
- **(a) Files:** create `docs/design/hifi/16d-stress-pass.md`, a checklist and findings log. Fixes go back into the owning phase's mockup file.
- **(b) What it checks:**
  - Long Indian names, for example "Venkatasubramanian Raghunathan" and "Sai Lakshmi Priyadarshini Iyer".
  - Long gym, food and exercise names: "Paneer bhurji with 2 phulka", "Single-arm dumbbell Romanian deadlift".
  - Four-digit kcal and large volumes (12,450 kg).
  - Ten-plus items in lists, empty optional fields, 130% text, widths 280 / 250 / 220 px.
- **(c) Constraints:** G5, G10, G13. Truncation uses one line with an ellipsis and keeps the full text available. Numbers never truncate. Pinned buttons never overlap the bottom bar.

### Phase 17 — Accessibility and QA sweep

- **Screens:** none owned. It is a sweep across all 217 screens.
- **(a) Files:** create `docs/design/hifi/17-qa-report.md`, and update DESIGN.md §8 checkboxes when the founder asks.
- **(b) What it checks:**
  - WCAG AA contrast computed with the formula for every text and background pair actually used.
  - **48 × 48 dp tap targets** (see Q1 about 44 pt).
  - 130% text, screen-reader labels, and colour never used alone.
  - "Remove animations" respected.
  - Bottom bars per tier (G14), and no Recovery on free screens.
  - **No AI on any coached-athlete screen** (G8).
  - No gradients, glows or glass (G3, G4), and spacing rhythm (G5).
  - Every list has empty, loading and error states.
- **(c) Constraints:** all of G1–G14. Re-use the checks already run on the wireframes (UI-HANDOFF §7).

### ◆ Phase 18 — Record and hand to build

- **Screens:** none.
- **(a) Files:**
  - Update DESIGN.md §6 (component status) and §7 (Mockup column per screen).
  - The build order follows UI-HANDOFF §5 step 5: `app/src/theme/` first, then `app/src/components/`, then routes, then usability tests (PLAN.md).
- **(c) Constraints:** nothing is marked approved without the founder's explicit yes. Commit only when asked.

---

## 5. Screen inventory

All 217 wireframe screens, in file order, each with the one phase that owns it. Generated from the wireframe HTML, so titles are exactly as drawn.

| Phase | Count | | Phase | Count | | Phase | Count |
|---|---|---|---|---|---|---|---|
| 2b | 1 | | 8b | 6 | | 13d | 7 |
| 3 | 2 | | 9 | 4 | | 13e | 2 |
| 5 | 7 | | 10 | 4 | | 13f | 12 |
| 6 | 35 | | 11 | 8 | | 14 | 8 |
| 7a | 14 | | 12a | 6 | | 15 | 14 |
| 7b | 11 | | 12b | 11 | | 16a | 8 |
| 8a | 10 | | 12c | 3 | | 16b | 9 |
| 13a | 15 | | 13b | 11 | | 16c | 5 |
| 13c | 4 | | | | | **Total** | **217** |

| # | Screen | Wireframe file | Wireframe section | Phase |
|---|---|---|---|---|
| 1 | **F1-01** Splash | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Entry and account | 6 |
| 2 | **F1-02** Welcome | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Entry and account | 6 |
| 3 | **F1-02a** Choose your role (sheet) | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Entry and account | 6 |
| 4 | **F1-03** Sign up | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Entry and account | 6 |
| 5 | **F1-04** Sign in | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Entry and account | 6 |
| 6 | **F1-05** Consent | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Entry and account | 6 |
| 7 | **AO-01** Gender | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · About you (D52) | 6 |
| 8 | **AO-02** Age | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · About you (D52) | 6 |
| 9 | **AO-03** Height | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · About you (D52) | 6 |
| 10 | **AO-04** Current weight | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · About you (D52) | 6 |
| 11 | **AO-05** Main goal | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your goal | 6 |
| 12 | **AO-06** Goal weight | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your goal | 6 |
| 13 | **AO-07** Activity level | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your goal | 6 |
| 14 | **AO-08** Gym experience | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Training | 6 |
| 15 | **AO-09** Where you train | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Training | 6 |
| 16 | **AO-10** Training days | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Training | 6 |
| 17 | **AO-11** Session length and time | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Training | 6 |
| 18 | **AO-12** Injuries and limitations | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Training | 6 |
| 19 | **AO-13** Sleep | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Recovery | 6 |
| 20 | **AO-14** Sleep quality | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Recovery | 6 |
| 21 | **AO-15** Stress and energy | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Recovery | 6 |
| 22 | **AO-16** Diet type | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Nutrition | 6 |
| 23 | **AO-17** Meals per day | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Nutrition | 6 |
| 24 | **AO-18** Building your plan | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your plan | 6 |
| 25 | **AO-19** Calorie target | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your plan | 6 |
| 26 | **AO-20** Plan preview | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your plan | 6 |
| 27 | **AO-21** All set | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your plan | 6 |
| 28 | **AO-21b** All set — coached athlete | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F1 · Athlete onboarding · Your plan | 6 |
| 29 | **F3-01** Invite shared | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F3 · Joining through a coach's invite link | 6 |
| 30 | **F3-02** Invite landing (in app) | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F3 · Joining through a coach's invite link | 6 |
| 31 | **F3-03** Already coached (edge case) | [`f1-f3-onboarding.html`](wireframes/f1-f3-onboarding.html) | F3 · Joining through a coach's invite link | 6 |
| 32 | **CO-02** What you get | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 33 | **CO-03** Coach agreement | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 34 | **CO-04** How you coach | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 35 | **CO-05** Clients today | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 36 | **CO-06** Profile basics | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 37 | **CO-07** Specialisations | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 38 | **CO-08** About you | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 39 | **CO-09** Services | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 40 | **CO-10** First template | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 41 | **CO-11** Invite clients | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 42 | **CO-12** Ready to coach | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · Set up the coaching business | 13a |
| 43 | **CO-13** Clients — empty with setup checklist | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · First days as a coach | 13a |
| 44 | **CO-14** Clients — first clients join | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · First days as a coach | 13a |
| 45 | **CO-15** New client — assign plan | [`f2-coach-onboarding.html`](wireframes/f2-coach-onboarding.html) | F2 · First days as a coach | 13a |
| 46 | **F4-01** Entry point on Today | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · Before the workout | 5 |
| 47 | **F4-02** Workout preview | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · Before the workout | 7b |
| 48 | **F4-03** Active workout — set logging | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 49 | **F4-04** Rest timer | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 50 | **F4-05** Edit weight / reps | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 51 | **F4-06** Exercise options (···) | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 52 | **F4-07** Swap exercise | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 53 | **F4-08** Exercise detail | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7a |
| 54 | **F4-09** Offline during workout | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 55 | **F4-10** Minimised workout | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · During the workout | 7b |
| 56 | **F4-11** Finish confirmation | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · Finishing | 7b |
| 57 | **F4-12** Workout summary | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · Finishing | 7b |
| 58 | **F4-13** Workout history | [`f4-workout-logging.html`](wireframes/f4-workout-logging.html) | F4 · Finishing | 7a |
| 59 | **F5-01** Day log — paid / coached | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · The day's food log | 8a |
| 60 | **F5-02** Day log — free | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · The day's food log | 8a |
| 61 | **F5-03** Empty day | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · The day's food log | 8a |
| 62 | **F5-04** Add food — recent | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Adding food | 8a |
| 63 | **F5-05** Search results | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Adding food | 8a |
| 64 | **F5-06** Portion picker | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Adding food | 8a |
| 65 | **F5-07** Quick add | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Adding food | 8a |
| 66 | **F5-08** Create custom food | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Adding food | 8a |
| 67 | **F5-09** Photo — camera | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · AI photo logging (paid only) | 8b |
| 68 | **F5-10** Photo — analysing | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · AI photo logging (paid only) | 8b |
| 69 | **F5-11** Photo — confirm results | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · AI photo logging (paid only) | 8b |
| 70 | **F5-12** Coach meal plan | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Meal plans | 8b |
| 71 | **F5-13** AI meal plan (paid) | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Meal plans | 8b |
| 72 | **F5-14** Upgrade moment (free) | [`f5-food-logging.html`](wireframes/f5-food-logging.html) | F5 · Meal plans | 8b |
| 73 | **F6-01** Progress area — check-in due | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Athlete submits the weekly check-in | 12b |
| 74 | **F6-02** Step 1 — measurements | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Athlete submits the weekly check-in | 12b |
| 75 | **F6-03** Step 2 — photos | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Athlete submits the weekly check-in | 12b |
| 76 | **F6-04** Step 3 — how the week went | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Athlete submits the weekly check-in | 12b |
| 77 | **F6-05** Review and submit | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Athlete submits the weekly check-in | 12b |
| 78 | **F6-06** Coach feedback received | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Athlete submits the weekly check-in | 12b |
| 79 | **F6-07** Coach — check-in inbox | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Coach reviews check-ins | 13c |
| 80 | **F6-08** Coach — check-in review | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Coach reviews check-ins | 13c |
| 81 | **F6-09** Coach — write feedback | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Coach reviews check-ins | 13c |
| 82 | **F6-10** Coach — check-in schedule | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F6 · Coach reviews check-ins | 13c |
| 83 | **F7-01** Athlete — chat with coach | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F7 · Chat | 12a |
| 84 | **F7-02** Attach sheet | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F7 · Chat | 12a |
| 85 | **F7-03** Chat — poor connection | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F7 · Chat | 12a |
| 86 | **F7-04** Coach — messages list | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F7 · Chat | 13e |
| 87 | **F7-05** Coach — chat with client context | [`f6-f7-checkins-chat.html`](wireframes/f6-f7-checkins-chat.html) | F7 · Chat | 13e |
| 88 | **F8-01** Paywall | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Upgrading to the AI tier | 16b |
| 89 | **F8-02** Trial timeline | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Upgrading to the AI tier | 16b |
| 90 | **F8-03** AI consent | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Upgrading to the AI tier | 16b |
| 91 | **F8-04** Google Play purchase | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Upgrading to the AI tier | 16b |
| 92 | **F8-05** Welcome — AI builds the plan | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Upgrading to the AI tier | 11 |
| 93 | **F8-06** Subscription details | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Managing the subscription | 16b |
| 94 | **F8-07** Payment problem (grace period) | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Managing the subscription | 16b |
| 95 | **F8-08** Subscription ended | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F8 · Managing the subscription | 16b |
| 96 | **F9-01** Coach — transformations list | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F9 · Transformation photos — coach requests, athlete decides | 13f |
| 97 | **F9-02** Coach — request photos | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F9 · Transformation photos — coach requests, athlete decides | 13f |
| 98 | **F9-03** Athlete — review request | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F9 · Transformation photos — coach requests, athlete decides | 12c |
| 99 | **F9-04** Athlete — adjust blur and crop | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F9 · Transformation photos — coach requests, athlete decides | 12c |
| 100 | **F9-05** Coach — export approved photo | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F9 · Transformation photos — coach requests, athlete decides | 13f |
| 101 | **F9-06** Athlete — manage and withdraw | [`f8-f9-paywall-photos.html`](wireframes/f8-f9-paywall-photos.html) | F9 · Transformation photos — coach requests, athlete decides | 12c |
| 102 | **N-01** Today — free | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Bottom bars and Today by tier | 5 |
| 103 | **N-02** Today — AI-coached | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Bottom bars and Today by tier | 5 |
| 104 | **N-03** Today — human-coached | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Bottom bars and Today by tier | 5 |
| 105 | **N-04** Side menu — free | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Side menu (☰) | 3 |
| 106 | **N-05** Side menu — Pro | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Side menu (☰) | 3 |
| 107 | **N-06** Notifications | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Side menu (☰) | 15 |
| 108 | **AC-01** Account | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Account, privacy, export and deletion | 15 |
| 109 | **AC-02** Privacy and permissions | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Account, privacy, export and deletion | 15 |
| 110 | **AC-03** Export my data | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Account, privacy, export and deletion | 15 |
| 111 | **AC-04** Delete account | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Account, privacy, export and deletion | 15 |
| 112 | **AC-05** Forgot password | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Account, privacy, export and deletion | 6 |
| 113 | **AC-06** Reset link sent | [`f10-menu-today-account.html`](wireframes/f10-menu-today-account.html) | Account, privacy, export and deletion | 6 |
| 114 | **R-01** Recovery — log today | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Recovery (AI-coached and human-coached only) | 9 |
| 115 | **R-02** Recovery — trends | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Recovery (AI-coached and human-coached only) | 9 |
| 116 | **R-03** Recovery — first use | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Recovery (AI-coached and human-coached only) | 9 |
| 117 | **PH-01** Bodyweight | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Physique tools (side menu · all athletes) | 10 |
| 118 | **PH-02** Measurements | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Physique tools (side menu · all athletes) | 10 |
| 119 | **PH-03** Photos | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Physique tools (side menu · all athletes) | 10 |
| 120 | **PH-04** Charts | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | Physique tools (side menu · all athletes) | 10 |
| 121 | **AI-01** AI Coaching | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | AI Coaching (AI subscribers only) | 11 |
| 122 | **AI-02** AI Coaching — permission declined | [`f11-recovery-physique-ai.html`](wireframes/f11-recovery-physique-ai.html) | AI Coaching (AI subscribers only) | 11 |
| 123 | **CP-01** Check-ins — due | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Progress area: Check-ins · Progress · Chat (human-coached only) | 12b |
| 124 | **CP-02** Check-ins — sent, awaiting feedback | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Progress area: Check-ins · Progress · Chat (human-coached only) | 12b |
| 125 | **CP-03** Check-in — photos not allowed | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Progress area: Check-ins · Progress · Chat (human-coached only) | 12b |
| 126 | **CP-04** Progress switch | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Progress area: Check-ins · Progress · Chat (human-coached only) | 12b |
| 127 | **CP-05** Chat switch | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Progress area: Check-ins · Progress · Chat (human-coached only) | 12a |
| 128 | **W-01** Today — waiting for plan | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Waiting for the coach's plan | 5 |
| 129 | **W-02** Training — waiting for plan | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Waiting for the coach's plan | 7a |
| 130 | **J-01** Join coach — AI subscriber | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | AI subscriber joins a human coach | 14 |
| 131 | **J-02** End AI subscription | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | AI subscriber joins a human coach | 14 |
| 132 | **J-03** Joined — what changed | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | AI subscriber joins a human coach | 14 |
| 133 | **L-01** My coach | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Leaving a human coach | 14 |
| 134 | **L-02** Leave coach — confirm | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Leaving a human coach | 14 |
| 135 | **L-03** After leaving — what changed | [`f12-coached-area-switching.html`](wireframes/f12-coached-area-switching.html) | Leaving a human coach | 14 |
| 136 | **K-01** Client list | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Clients and client profile | 13b |
| 137 | **K-02** Client profile — overview | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Clients and client profile | 13b |
| 138 | **K-03** Client profile — training | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Clients and client profile | 13b |
| 139 | **K-04** Change client status | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Clients and client profile | 13b |
| 140 | **K-05** Plans — templates | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Plans: templates, plan builder, meal plan builder, assigning | 13d |
| 141 | **K-06** Plan builder — week | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Plans: templates, plan builder, meal plan builder, assigning | 13d |
| 142 | **K-07** Plan builder — exercise | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Plans: templates, plan builder, meal plan builder, assigning | 13d |
| 143 | **K-09** Meal plan builder | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Plans: templates, plan builder, meal plan builder, assigning | 13d |
| 144 | **K-08** Assign and customise | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Plans: templates, plan builder, meal plan builder, assigning | 13d |
| 145 | **K-10** Leads | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Leads and business | 13f |
| 146 | **K-11** Lead — add or edit | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Leads and business | 13f |
| 147 | **K-12** Business | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Leads and business | 13f |
| 148 | **K-13** Plan and billing | [`f13-coach-tools.html`](wireframes/f13-coach-tools.html) | Leads and business | 13f |
| 149 | **K-14** Client profile — nutrition | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Client profile — remaining sections | 13b |
| 150 | **K-15** Client profile — recovery | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Client profile — remaining sections | 13b |
| 151 | **K-16** Client profile — progress | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Client profile — remaining sections | 13b |
| 152 | **K-17** Client profile — check-ins | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Client profile — remaining sections | 13b |
| 153 | **K-18** Client profile — private notes | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Client profile — remaining sections | 13b |
| 154 | **K-19** Coach sign-up | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Coach sign-up, profile and settings | 13a |
| 155 | **K-20** Edit coach profile | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Coach sign-up, profile and settings | 13f |
| 156 | **K-21** Coach settings | [`f14-coach-profile-settings.html`](wireframes/f14-coach-profile-settings.html) | Coach sign-up, profile and settings | 13f |
| 157 | **T-01** Training — free | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Training tab — landing by tier | 7a |
| 158 | **T-02** Training — AI-coached | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Training tab — landing by tier | 7a |
| 159 | **T-03** Training — human-coached | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Training tab — landing by tier | 7a |
| 160 | **T-04** Exercise library | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Training tab — landing by tier | 7a |
| 161 | **AC-07** Edit profile | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Account extras and the free-to-AI change | 15 |
| 162 | **AC-08** Units | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Account extras and the free-to-AI change | 15 |
| 163 | **AC-09** Help and support | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Account extras and the free-to-AI change | 15 |
| 164 | **U-01** Upgrade — what changed | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Account extras and the free-to-AI change | 11 |
| 165 | **S-01** Loading | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Reusable states (apply to every screen) | 16c |
| 166 | **S-02** Error and retry | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Reusable states (apply to every screen) | 16c |
| 167 | **S-03** Form validation | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Reusable states (apply to every screen) | 2b |
| 168 | **S-04** Permission denied | [`f15-training-account-states.html`](wireframes/f15-training-account-states.html) | Reusable states (apply to every screen) | 16c |
| 169 | **X-01** AI daily limit reached | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | AI Coaching — limit and failure states (AI subscribers only) | 11 |
| 170 | **X-02** AI plan couldn't be built | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | AI Coaching — limit and failure states (AI subscribers only) | 11 |
| 171 | **X-03** Edit a logged food | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Nutrition — edit or delete a logged food | 8a |
| 172 | **X-04** Removed — undo | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Nutrition — edit or delete a logged food | 8a |
| 173 | **X-05** Image viewer | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Chat attachments — opening an image or PDF | 12a |
| 174 | **X-06** PDF viewer | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Chat attachments — opening an image or PDF | 12a |
| 175 | **X-07** Notification permission — before asking | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Notification permission and data export states | 15 |
| 176 | **X-08** Android notification dialog (system) | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Notification permission and data export states | 15 |
| 177 | **X-09** Export — preparing | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Notification permission and data export states | 15 |
| 178 | **X-10** Export — failed | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Notification permission and data export states | 15 |
| 179 | **E-01** Workout history — empty | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Athlete empty states | 16a |
| 180 | **E-02** Notifications — empty | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Athlete empty states | 16a |
| 181 | **E-03** Exercise library — no results | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Athlete empty states | 16a |
| 182 | **E-04** Physique charts — no data | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Athlete empty states | 16a |
| 183 | **E-05** Coach check-in inbox — empty | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Coach — empty states, meal plan templates and exercise library | 16a |
| 184 | **E-06** Coach messages — empty | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Coach — empty states, meal plan templates and exercise library | 16a |
| 185 | **E-07** Leads — empty | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Coach — empty states, meal plan templates and exercise library | 16a |
| 186 | **E-08** Transformations — empty | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Coach — empty states, meal plan templates and exercise library | 16a |
| 187 | **K-22** Plans — meal plan templates | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Coach — empty states, meal plan templates and exercise library | 13d |
| 188 | **K-23** Coach exercise library | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | Coach — empty states, meal plan templates and exercise library | 13d |
| 189 | **S-05** Force update | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | System screens — force update and maintenance (all roles) | 16c |
| 190 | **S-06** Maintenance / service down | [`f16-states-empty-system.html`](wireframes/f16-states-empty-system.html) | System screens — force update and maintenance (all roles) | 16c |
| 191 | **TR-01** Workouts — free | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Workouts (standalone sessions) | 7a |
| 192 | **TR-02** Workouts — Pro | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Workouts (standalone sessions) | 7a |
| 193 | **TR-03** Create workout (Pro) | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Workouts (standalone sessions) | 7a |
| 194 | **TR-08** Timed and bodyweight sets | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Workouts (standalone sessions) | 7b |
| 195 | **TR-04** Programs — Pro | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Programs and Muscle Analytics (Pro) | 7a |
| 196 | **TR-05** Programs — locked (free) | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Programs and Muscle Analytics (Pro) | 7a |
| 197 | **TR-06** Muscle Analytics — Pro | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Programs and Muscle Analytics (Pro) | 7a |
| 198 | **TR-07** Muscle Analytics — locked (free) | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Training → Programs and Muscle Analytics (Pro) | 7a |
| 199 | **G-01** Gyms — map and list | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Gyms — read-only map and directory | 15 |
| 200 | **G-02** Gym detail | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | ☰ Gyms — read-only map and directory | 15 |
| 201 | **CP-06** Past check-in — read-only | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | Coached athletes — past check-in, recovery target, history access, coaching status | 12b |
| 202 | **R-04** Recovery — coached, with coach target | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | Coached athletes — past check-in, recovery target, history access, coaching status | 9 |
| 203 | **AC-10** Coach access to earlier history | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | Coached athletes — past check-in, recovery target, history access, coaching status | 14 |
| 204 | **CS-01** Coaching paused (athlete) | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | Coached athletes — past check-in, recovery target, history access, coaching status | 5 |
| 205 | **CS-02** Coaching ending (athlete) | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | Coached athletes — past check-in, recovery target, history access, coaching status | 5 |
| 206 | **F1-05b** Consent — invite sign-up | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | Coached athletes — past check-in, recovery target, history access, coaching status | 6 |
| 207 | **AI-03** Turn off AI — confirm | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | AI permission, out-of-scope requests and trial end (AI subscribers) | 11 |
| 208 | **AI-04** Out of scope — "I can't help with that" | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | AI permission, out-of-scope requests and trial end (AI subscribers) | 11 |
| 209 | **TL-01** Trial ending — day 5 reminder | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | AI permission, out-of-scope requests and trial end (AI subscribers) | 16b |
| 210 | **TL-02** Trial ended — not paid | [`f17-training-menu-gyms-progress.html`](wireframes/f17-training-menu-gyms-progress.html) | AI permission, out-of-scope requests and trial end (AI subscribers) | 16b |
| 211 | **K-24** Set sleep target and recovery note | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Recovery target and completing a client | 13b |
| 212 | **K-30** Complete a client — confirm | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Recovery target and completing a client | 13b |
| 213 | **K-25** Client limit reached (coach) | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Client limit and coach billing lapse | 13f |
| 214 | **K-26** Invite page — coach is full (athlete) | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Client limit and coach billing lapse | 6 |
| 215 | **K-27** Coach billing lapsed | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Client limit and coach billing lapse | 13f |
| 216 | **K-28** Delete coach account — confirm | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Deleting a coach account | 13f |
| 217 | **K-29** Coach account closed (athlete) | [`f18-coach-lifecycle.html`](wireframes/f18-coach-lifecycle.html) | Deleting a coach account | 14 |

---

## Open questions

These are places where the brief for this roadmap conflicts with or adds to the decided rules. **The plan follows the decided rule in each case**, so nothing is blocked. The founder can overrule any of them.

| # | Brief said | Decided rule followed | What the founder can decide |
|---|---|---|---|
| **Q1** | 44 × 44 pt tap targets | **48 × 48 dp** (DESIGN.md §5, §8; Material 3). 44 pt is the iOS figure, and Arcwell is Android-only. | Confirm 48 dp. It's the larger target, so it satisfies both. |
| **Q2** | "Electric blue accents" | **Electric blue for primary actions plus cyan `#22D3EE` as the second accent** (D24, spec sheet). Pillar colours amber and violet also stay. | Confirm cyan stays as the second accent. |
| **Q3** | "No purple-blue gradients" | **No gradients of any kind** (D24, negative list), which is stricter. Recovery violet `#8B7CFF` stays as a solid pillar colour. | None needed unless gradients are wanted back. |
| **Q4** | "Hex scales" | DESIGN.md defines **semantic roles with single values**, not 50–900 ramps. Phase 1 adds only interaction steps already in the spec sheet. | Whether full tonal ramps are wanted. They'd mean new colour values for the founder to approve. |
| **Q5** | "AI coaching and messaging: chat bubbles" as one phase | The wireframes draw **AI Coaching (AI-01) as a structured plan with adjustment options, not a chat**. Chat bubbles exist only in coach ↔ athlete chat. They're kept as separate phases (11 and 12a), so a coached athlete's chat can never be confused with AI. | Whether AI Coaching should ever become conversational. That would be a scope change to SPEC. |
| **Q6** | "Today: Free, AI and Coach states" | Today exists for the free, AI-subscriber and **human-coached athlete** tiers (N-01 to N-03). Coaches have no Today tab (D23); their home is Clients (Phase 13b). "Coach state" was read as the human-coached athlete. | Confirm the reading. |
| **Q7** | "Coach and Client tab bars" | There are **four** bars: three athlete tiers plus coach (D2, D2a, D2b, D23). All four are in Phase 3. | None. |
| **Q8** | "Dark charcoal backgrounds" (light mode not mentioned) | DESIGN.md §5 says a light theme has the same roles with values TBD. **This roadmap covers the dark theme only**; light mode is not phased. | Whether a light theme is in v1 at all. If so, it's an extra phase after 1. |
| **Q9** | Phase order: tokens → base → navigation → Today | Kept, but the handoff adds **Phase 4: Today three ways**, which the founder picks from before Phase 5 and every later screen. | Confirm the extra gate. |
| **Q10** | "4px/8px spacing" | The **4 dp grid with steps 4, 8, 12, 16, 24, 32, 48**, plus named rhythm tokens (Phase 1). "No uniform spacing" is enforced as G5. | None. |
| **Q11** | Phases 1–10 only | 22 more phases were needed so every screen has an owner: onboarding (21 screens), coach onboarding, recovery, account and gyms, coaching changes, system states. | Merge any phases if preferred. Coverage stays the same. |
| **Q12** | (not in the brief) | **Still undecided:** wordmark (A Ring, B Arch, C Open c) and illustration rule (none, or a simple line style for empty states). Phases 6, 10, 13f and 16a wait on them. | Both decisions. |
| **Q13** | (not in the brief) | **Mobbin needs authorisation through `/mcp`** before Phase 4. Until then references come from `references.md`. | Authorise Mobbin. |
| **Q14** | (not in the brief) | K-23 *proposes* the coach exercise library as a third Plans tab (sitemap §5). The plan treats it as drawn. | Confirm the third Plans tab. |
| **Q15** | (not in the brief) | D25–D45 are **defaults Claude chose**, still to be reviewed by the founder. Phases that rely on them are marked with the D number, so a change only touches those phases. | Review D25–D45. |
