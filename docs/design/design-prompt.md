# Arcwell — Design Generation Prompts

Rewritten 2026-11-11 to follow the "Designing UI without the slop" guide (AI-assisted, not AI-generated). Visual direction from the founder's Bulky AI prompt (D24): dark charcoal, electric blue / cyan accents, minimal. Product rules from `docs/DECISIONS.md` (D1–D45), screens from the wireframes in `wireframes/` (F1–F18).

Use with any AI design tool (Claude, Figma Make, Google Stitch). **Generated screens are drafts.** The founder decides; the wireframes and DECISIONS.md win over anything a tool produces.

## How to use this file

One screen at a time, in this order:

1. **Collect references.** Open the 2–3 reference links listed on the screen's card and take screenshots. Attach them to the prompt.
2. **Attach the wireframe** for that screen (screenshot from `wireframes/`, IDs on each card).
3. **Paste three blocks:** the [design language](#1-design-language-paste-into-every-prompt), the [negative list](#2-negative-list-paste-into-every-prompt), then the screen card.
4. **Ask for 3–5 variations.** Pick the strongest layout, colour use and type treatment, and combine them by hand.
5. **Critique pass.** Screenshot the combined screen and run the [critique prompt](#5-critique-prompt).
6. **Check** against the [after-generating checklist](#6-after-generating-checklist), then record the outcome in DESIGN.md §7 (Mockup column).

Start with the design-system sheet (card 0), then Today, Active workout and Food day log. Those three set the look for everything else.

---

## 1. Design language (paste into every prompt)

```
PRODUCT
Arcwell: an Android fitness app for India that combines training, nutrition and recovery.
Athletes use it on their own (free or a paid AI tier, "Arcwell Plus") or with a human coach.
Coaches use the same app, with a different interface, to manage 20–60 clients.

PLATFORM
Android only. Material 3 conventions: bottom navigation bar, top app bar, bottom sheets,
system back. Pixel-style frame, 412 x 915 dp. Tap targets at least 48 dp.
Dark theme. One-handed use: primary actions in the bottom half of the screen.

COLOUR (dark theme, solid colours only)
Background #111316 · surface #191C21 · raised surface #22262D · border #2D323A
Text #F2F4F7 · muted text #9AA4B2
Primary action: electric blue #3D8BFF, text on it #04101F
Accent: cyan #22D3EE for focus, selection and chart lines
Pillars: Training cyan #22D3EE · Nutrition amber #F5A524 · Recovery violet #8B7CFF
Success #22C55E · warning #F59E0B · danger #EF4444 (errors and destructive actions only)
Colour always means something. Most of the screen is charcoal and grey; accents are small.

TYPE
Inter, with tabular numerals for every number (kg, reps, kcal, timers).
Scale: 32 bold display · 22 semibold title · 18 semibold heading · 16 body · 14 medium label · 12 caption.
Hierarchy comes from size and weight, not colour.

SPACING AND SHAPE
4 dp grid: 4, 8, 12, 16, 24, 32, 48.
Group related items tightly (8) and separate unrelated groups generously (24–32). Not one gap everywhere.
Radius: 8 inputs and chips · 12 cards · 20 sheets · full for pills and avatars.
Depth from surface steps (#111316 → #191C21 → #22262D), not shadows.
Dividers #2D323A; input and control outlines #6B7482.

MOTION
Numbers roll to new values instead of jumping. 120 ms press feedback, 200 ms standard,
280 ms sheets. One big 600 ms moment: the workout summary. Skeleton loaders, never spinners.
No animated backgrounds. Everything instant when "Remove animations" is on.

ICONS
Lucide (line icons, 1.5 px stroke, 24 dp). No other icon set.

COPY
Indian English. Short, plain, encouraging: "Log set", not "Crush it!".
Realistic Indian content: dal, roti, poha, paneer; portions in katori, roti, piece.
Realistic data: include one long name (e.g. "Venkatalakshmi Subramanian"), uneven numbers
(73.6 kg, 1,240 kcal), and lists that don't all fit on screen.
Units: kg and cm only.
```

## 2. Negative list (paste into every prompt)

```
DO NOT:
- use any gradient (no blue-to-cyan, no purple-to-blue), on buttons, cards, heroes or backgrounds
- add neon glows, light bloom or outer glows around cyan or blue elements
- use glassmorphism, frosted blur or heavy drop shadows to create hierarchy
- centre everything: text is left-aligned; centre only single empty-state messages
- use a three-card feature grid unless there are exactly three equal things
- use emoji as icons, or sparkle / ✨ / fire motifs (the wireframes use 🔒 🔔 as placeholders only — draw Lucide icons)
- use lorem ipsum, or data that flatters the layout (every name fitting on one line, perfect round numbers)
- invent a logo, tagline, mascot or product name; show "Arcwell" as plain text only
- add streaks, XP, badges, levels, leaderboards, confetti or "addictive" mechanics
- show missed targets in red; going over or under a target is neutral
- add hype copy, countdown timers, fake discounts, "only 2 spots left", or a hidden close button
- add any feature, tab or menu item that isn't in the screen description below
- show AI anywhere on a screen for a human-coached athlete
- add video, play buttons or "watch" affordances (no video in v1)
- use iOS patterns (iOS back chevrons, iOS switches, Apple sign-in, SF Symbols)
```

### Find this model's own defaults (10 minutes, once per tool)

The list above is generic. Before the first real screen, measure the tool you're using:

1. Prompt for the Today screen three times, in three fresh sessions, with a bare prompt ("Design the Today screen of an Android fitness app"). No design language, no references.
2. Put the three results side by side and note every choice that appears in all three.
3. For each, ask: did we want that, or did the model? Add the model's choices to the negative list above.
4. Also ask the tool directly: "What visual choices did you make here that you'd make for almost any app? List them."

Repeat when switching tools or models.

---

## 3. Athlete screens

Each card gives the four things a prompt must specify (platform comes from the design language): **screen type, user goal, tone**, plus content, states, wireframe and references.

### Card 0 — Design-system sheet (do this first)

- **Screen type:** component sheet, not a screen.
- **Goal:** fix every component's look before any screen is designed.
- **Tone:** systematic, neutral.
- **Content:** buttons (primary, secondary, ghost, destructive) · text input · number stepper with large ± for kg and reps · card · list row · section label · bottom navigation (3-item and 5-item) · side menu drawer with an expandable group and a locked row · set row (previous · kg · reps · tick), plus bodyweight and timed variants · rest-timer sheet · calorie bar and three macro bars · portion picker chips (katori, roti, piece, g) · chat bubbles with an image and a PDF tile · status chips (active, paused, leaving, completed) · 0–100 dial · empty, loading (skeleton) and error blocks · locked-feature card.
- **Already done:** [spec-sheet.html](spec-sheet.html) renders all of these. Attach screenshots of it to every screen prompt instead of regenerating components.
- **References:** WHOOP colour system, Linear UI refresh, Fit Note design system (references.md §9).

### Card 1 — Today

- **Wireframes:** N-01 (free), N-02 (AI), N-03 (coached); states TL-01, CS-01, W-01.
- **Screen type:** home dashboard.
- **User goal:** see what to do today and start it in one tap.
- **Tone:** calm, quiet, confident; one obvious next action.
- **Content:** cards for today's workout (primary "Start workout"), calories left, and (paid and coached only) recovery; coached users also get a "check-in due" card. Bottom bar per tier (see N-01 to N-03). ☰ opens the side menu.
- **States:** first day (no data yet), coach plan not assigned yet (W-01), trial ending card (TL-01).
- **References:** Oura Today (three small circles), WHOOP home, MacroFactor dashboard (§3, §4).

### Card 2 — Active workout

- **Wireframes:** F4-03, F4-04, F4-09, TR-08.
- **Screen type:** live logging tool used mid-set.
- **User goal:** log a set with one tap and see the rest timer, with sweaty hands.
- **Tone:** focused, utilitarian; large numbers, no decoration.
- **Content:** timer and Finish at the top; exercise blocks with the set table (Set · Previous · kg · Reps · ✓), previous values pre-filled; rest-timer bottom sheet with −15 s / +15 s apart from Skip.
- **States:** offline banner ("Saved on your phone — will sync"), bodyweight and timed sets.
- **References:** Hevy set table, Boostcamp rest-timer sheet, Liiift auto rest (§2).

### Card 3 — Food day log

- **Wireframes:** F5-01 (paid and coached), F5-02 (free), F5-03 (empty), X-03.
- **Screen type:** daily log.
- **User goal:** see calories left and add the next meal quickly.
- **Tone:** clear, non-judgemental; going over target stays neutral.
- **Content:** "kcal left" as the hero number; macros for paid and coached only; Breakfast / Lunch / Snacks / Dinner with Indian foods and portions; "+ Add food" per meal.
- **States:** empty day, a long food name, free calories-only version with one quiet upgrade card.
- **References:** MacroFactor dashboard, MyFitnessPal meal sections (§3).

### Card 4 — Food search and portion picker

- **Wireframes:** F5-04, F5-05, F5-06.
- **Screen type:** search, then bottom-sheet picker.
- **User goal:** find "dal tadka" and log 1 katori in under 10 seconds.
- **Tone:** fast, plain.
- **Content:** search field, recent foods, results with kcal per portion; picker with katori / roti / piece / g chips, stepper and live kcal (and macros for paid).
- **States:** no results, slow network.
- **References:** MyFitnessPal search, Nutrio portion layout (§3).

### Card 5 — AI photo food logging (Arcwell Plus only)

- **Wireframes:** F5-09, F5-10, F5-11, X-01.
- **Screen type:** camera, then a confirm list.
- **User goal:** photograph a thali and confirm what was found.
- **Tone:** honest about uncertainty.
- **Content:** detected items with editable portions; low-confidence items marked "Not sure"; required Confirm button with the total.
- **States:** analysing, nothing recognised, daily limit reached.
- **References:** AI Calorie Tracking case study (§3).

### Card 6 — Recovery log

- **Wireframes:** R-01, R-04 (coached, with coach target), R-02.
- **Screen type:** quick daily form.
- **User goal:** log last night's sleep, soreness and fatigue in about 10 seconds.
- **Tone:** calm, night-time, muted violet.
- **Content:** sleep-hours stepper, three sliders with labelled ends, 0–100 sleep-score dial with "from your hours and how well you slept", Save pinned.
- **References:** Withings Sleep Score, Sleep Score app palette, Sleep++ explanation (§4).

### Card 7 — Coached Progress area

- **Wireframes:** CP-01, CP-04, CP-06, F6-02 to F6-05, CP-05.
- **Screen type:** segmented area (Check-ins · Progress · Chat).
- **User goal:** send this week's check-in and read past feedback from the coach.
- **Tone:** personal, supportive.
- **Content:** check-in due card; Progress timeline of past check-ins with feedback and plan changes; check-in steps (measurements, optional photos, how the week went, review).
- **States:** photos not allowed (check-in still sends), check-in sent and awaiting feedback.
- **References:** Coachway check-in template, YourCoach chat (§7).

### Card 8 — Physique charts and photos

- **Wireframes:** PH-01, PH-03, PH-04, E-04.
- **Screen type:** chart and gallery.
- **User goal:** see the bodyweight trend and compare two photos.
- **Tone:** private, matter-of-fact.
- **Content:** smoothed trend line over muted daily dots; range switch; same-angle side-by-side photo compare.
- **States:** fewer than two entries.
- **References:** Weight Diary trend, MacroFactor charts, Azeoo photo compare (§5).

### Card 9 — AI Coaching (Arcwell Plus only)

- **Wireframes:** AI-01, AI-02, AI-04, X-02.
- **Screen type:** plan overview with structured actions (not a chat).
- **User goal:** see this week's change and adjust the plan.
- **Tone:** competent, transparent ("why" shown with every change).
- **Content:** current plan, "this week's change" with its reason, four adjust options.
- **States:** "I can't help with that" for contest prep or injury rehab; AI turned off; plan couldn't be built.
- **References:** WHOOP three-layer depth (§4).

### Card 10 — Paywall

- **Wireframes:** F8-01, F8-02, TR-05.
- **Screen type:** upgrade screen opened from a locked feature.
- **User goal:** understand what Plus adds and what the trial costs.
- **Tone:** honest, restrained.
- **Content:** four benefits, yearly and monthly plans in ₹ (prices from Play Console), "Start 7-day free trial", trial timeline (today, day 5 reminder, day 7 charge), Restore purchase, visible close.
- **References:** Strava honest paywall and timeline, Apple Fitness paywall, Anatomy of a paywall (§8).

### Card 11 — Onboarding question

- **Wireframes:** F1-06 to F1-12.
- **Screen type:** one question per screen.
- **User goal:** answer quickly and see progress.
- **Tone:** welcoming, brief.
- **Content:** thin progress bar, question, large tappable options, Continue pinned at the bottom.
- **References:** MyGrowth / MyFitnessPal onboarding, JustFit goal cards (§1). Do not copy JustFit's paywall.

### Card 12 — Side menu

- **Wireframes:** N-04 (free), N-05 (Pro).
- **Screen type:** navigation drawer.
- **User goal:** reach tools that aren't in the bottom bar.
- **Tone:** tidy, scannable.
- **Content:** Account · Notifications · Training (Exercises, Workouts, Programs, History, Muscle Analytics) · Gyms · Physique (Bodyweight, Measurements, Photos, Charts). Free users see a small lock on Programs and Muscle Analytics only.
- **References:** Linear sidebar density (§6).

---

## 4. Coach screens

Coach screens are a work tool: denser than the athlete app, triage-first, nothing decorative. Never re-sort a list while the coach is acting on it. Bottom bar: Clients · Check-ins · Plans · Messages · Business.

### Card 13 — Client list

- **Wireframes:** K-01, K-25, F2-08.
- **Screen type:** triage list.
- **User goal:** see who needs attention today and why.
- **Tone:** efficient, calm density.
- **Content:** filter chips (Needs attention, Active, Paused, Leaving, Completed); rows with avatar, name, reason ("check-in overdue"), adherence %, last activity.
- **States:** no clients yet, client limit reached.
- **References:** TrueCoach compliance sort, Trainerize Smart Views, Linear inbox (§6).

### Card 14 — Client profile

- **Wireframes:** K-02, K-03, K-14 to K-18.
- **Screen type:** detail with section switcher.
- **User goal:** understand one client's week in 30 seconds.
- **Tone:** factual.
- **Content:** header stats (adherence, weight trend, weeks coached); sections Overview, Training, Nutrition, Recovery, Progress, Check-ins, Notes; data from the join date only.
- **References:** Hevy Coach client profile (§5), Linear density (§6).

### Card 15 — Check-in review

- **Wireframes:** F6-07, F6-08, F6-09.
- **Screen type:** review and reply.
- **User goal:** review a check-in, compare with last week, reply and move to the next client.
- **Tone:** focused.
- **Content:** answers, measurements vs last week, photos side by side, feedback box, "Send and next client".
- **References:** HubFit review inbox, Coachway template (§7).

### Card 16 — Plan builder

- **Wireframes:** K-05, K-06, K-07, K-22.
- **Screen type:** editor.
- **User goal:** build a week of training from the library and save it as a template.
- **Tone:** precise, tool-like.
- **Content:** weeks and days, exercise rows with sets / reps / rest / effort, reorder, add from library.
- **References:** Hevy set table (§2), Linear editing density (§6).

### Card 17 — Messages and chat

- **Wireframes:** F7-04, F7-05.
- **Screen type:** conversation list and chat.
- **User goal:** answer a client with context.
- **Tone:** familiar, like a messaging app.
- **Content:** unread markers; chat with a linked workout or check-in card, image and PDF attachments.
- **References:** Dark messaging dashboard, YourCoach chat (§7).

### Card 18 — Business

- **Wireframes:** K-12, K-10, K-13, F9-01, K-27.
- **Screen type:** hub list.
- **User goal:** manage leads, profile, transformations and billing.
- **Tone:** professional.
- **Content:** Leads, Invite link and QR, Coach profile, Transformations, Plan and billing, Settings.
- **States:** payment problem banner (K-27).

---

## 5. Critique prompt

Run on every combined screen before calling it done:

```
Here is a screenshot of a screen from Arcwell, an Android fitness app. [Attach screenshot, the wireframe and the design language.]
What's wrong with this UI? Check specifically:
- Does anything break the design language (colours, type scale, spacing, radius, Lucide icons)?
- Does anything from the negative list appear?
- Is the most important action obvious and in the bottom half?
- Is spacing grouped (tight within groups, generous between), or uniform everywhere?
- Would a long name, a big number or an empty list break the layout?
- Any text under 4.5:1 contrast, or tap targets under 48 dp?
- Anything that differs from the wireframe without a good reason?
List problems only, most serious first.
```

Then fix and re-run once. This is not a substitute for testing with real users (PLAN.md).

## 6. After-generating checklist

- [ ] Matches its wireframe and the decisions it cites (DECISIONS.md wins)
- [ ] Only design-language colours; no gradients or glows
- [ ] Lucide icons only; no emoji as icons
- [ ] Text 4.5:1 contrast (large text 3:1); tap targets 48 dp
- [ ] Holds up at 130% system font size
- [ ] Empty, loading and error states designed for every list
- [ ] No AI shown to human-coached athletes; no video; kg only
- [ ] Recorded in DESIGN.md §7 (Mockup column)

## Font

- **Inter for everything, headings included** (founder decision D46, 2026-11-11). Character comes from the type scale, weight and tabular numerals, not a second typeface.
