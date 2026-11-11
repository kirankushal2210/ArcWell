# Arcwell — UI/UX design references

Collected 2026-11-10 for the flows and components in `docs/DESIGN.md`. **Link only:** these are inspiration, not assets. No images or design files have been downloaded, embedded or copied. Do not trace or reproduce any of them.

How to read the tables: **What to borrow** names one specific pattern and how it maps to Arcwell. A ⚠ marks a reference that partly conflicts with the calm, non-gamified personality; take only the named pattern.

Source notes:
- Dribbble shot pages can't be fetched by automated tools. Dribbble entries were checked against search-result titles and descriptions, so open each one before relying on its visual details.
- Mobbin, Pinterest and Land-book pages did not show up in public search results (Mobbin's screen library needs a login). ScreensDesign and Lazyweb, two public screen libraries, are used as stand-ins for shipped-app screens. A useful follow-up is a signed-in Mobbin pass on Hevy, WHOOP, Strava and MyFitnessPal.
- Some vendor pages (FitBudd, HubFit, TrueCoach) are marketing copy. They are cited for a pattern, not for feature claims.

---

## Visual direction (summary)

The strongest references for Arcwell are not fitness concept shots. They are shipped tools that treat data calmly: WHOOP's near-black canvas, where colour only ever means something; Oura's 2025 move from five tabs to three, with readiness, sleep and activity as quiet circles on a "Today" tab; MacroFactor's "adherence-neutral" nutrition charts, which never turn red when you miss a target; and Hevy's plain set table with a PREVIOUS column. Together they point to a near-black, low-chroma interface. Colour is used semantically: electric blue for actions, and cyan, amber and violet only to say "you are in Training, Nutrition or Recovery". Large tabular numerals carry the hierarchy, not gradients or illustration. This matches the `#0E1116` charcoal and pillar palette already drafted in DESIGN.md.

The coach side should borrow from work tools, not fitness apps. That means Linear's information-dense, triage-first inbox, and TrueCoach and Trainerize's habit of sorting clients by compliance and flagging who needs attention. Rows are compact (one line of status, one of context) and sorted by urgency, with nothing decorative. Across both roles the references support layered depth: an overview of three numbers, then a trend screen that answers one question, then a deep-dive screen for power users. They also support honest commerce: Strava's "honest paywall" timeline and reminder before the trial ends, not countdown timers and fake discounts. Most Dribbble fitness concepts lean on neon accents, 3D renders, streak flames and gradient cards. They are useful for single layouts but are the main source of the "patterns to avoid" list.

---

## 1. Onboarding and goal/questionnaire flows (F1, F2, F3)

| Reference | Source / URL | What to borrow |
|---|---|---|
| Onboarding goal selection screen examples (MyFitnessPal, BetterMe, MyGrowth) | ScreensDesign — https://screensdesign.com/articles/onboarding-goal-selection-screen-examples/ | One question per screen with a thin progress bar under the heading (MyGrowth), and goal options worded as outcomes people recognise ("Build muscle", not internal plan names). Decide single- vs multi-select per question, because each implies different plan logic. |
| MyFitnessPal onboarding flow | Lazyweb — https://lazyweb.com/canvas/flows/myfitnesspal/onboarding | A full-width goal list that leads to body stats and then a computed calorie target summary. This is the sequence for Arcwell's athlete onboarding before the first Today screen. |
| JustFit onboarding | Lazyweb — https://lazyweb.com/canvas/flows/justfit/onboarding | Large tappable goal cards ("Lose weight / Build muscle / Keep fit") sized for the thumb, with the primary button pinned at the bottom. ⚠ The flow continues into heavy paywall pressure; borrow only the cards. |
| Crewlift Onboarding (Light Mode) | Dribbble — https://dribbble.com/shots/17204166-Crewlift-Onboarding-Light-Mode | Matching a user to a trainer by goal, age and schedule. A useful model for the "choose role → coached / self-guided" branch and the invite-link flow (F3). |
| Designing Onboarding Experience for a Fitness App | Contra case study — https://contra.com/p/Uqo6ssYY-designing-onboarding-experience-for-a-fitness-app | The questionnaire was designed in both themes from the start, with a different accent per theme. Shows how to keep one flow coherent across dark and light before the light theme is defined. |
| Strava onboarding design teardown | ScreensDesign — https://screensdesign.com/articles/strava-onboarding-design/ | Asks for permissions (health connect, notifications) at the moment they are needed, not as a block at the start. Apply to Health Connect and notification prompts on Android. |

## 2. Workout logging — set rows, rest timer, exercise detail (F4)

| Reference | Source / URL | What to borrow |
|---|---|---|
| Hevy — track workouts | Shipped app — https://www.hevyapp.com/features/track-workouts/ and screens at https://screensdesign.com/showcase/hevy-workout-tracker-gym-log | The set table (Set · PREVIOUS · kg · reps · ✓) with the PREVIOUS column shown only during a live workout, a sticky duration/volume header, and "Add set" at the end of each exercise card. This is the canonical model for Arcwell's Set row component. |
| Workout app rest-timer controls UX (Boostcamp, JEFIT, WeGLOW, Zing) | ScreensDesign — https://screensdesign.com/articles/workout-app-rest-timer-controls-ux/ | Boostcamp's bottom sheet keeps −15s/+15s apart from Pause/Skip so a sweaty tap can't skip rest by mistake. JEFIT keeps the countdown inline in the set log. WeGLOW shows a next-exercise preview under the ring. Combine these: inline countdown, plus an expandable sheet with separated controls. |
| Workout Tracker App (Tae S. Yang) | Dribbble — https://dribbble.com/shots/4847116-Workout-Tracker-App | When a set is ticked, a "Take a rest" affordance appears directly under that row. This keeps the eye where the thumb already is. |
| Strava strength overhaul (workout log and muscle maps) | Press release — https://www.whoop.com/us/en/press-center/strava-overhauls-strength-experience-with-expanded-partner-ecosystem-new-workout-log-and-muscle-maps/ | A muscle-map summary at workout finish, so the summary screen shows which areas were trained, not just volume totals. |
| Muscle and Motion — exercise detail | Shipped app knowledge centre — https://www.muscleandmotion.com/knowledge-center/strength-training-app/ | Exercise detail with demo video at the top, then an "Active muscles" panel grouping target vs synergist muscles in two tones, then a "Common mistakes" tab. A good structure for Arcwell's exercise detail sheet; use the training blue at two opacities instead of extra colours. |
| Liiift — Workout Tracker | App Store — https://apps.apple.com/app/id6477523615 | The rest timer starts automatically when a set is logged. That saves one tap, which matches principle 1 (logging in seconds). Pair it with the haptic tick in DESIGN.md. |

## 3. Food, calorie and macro logging; macro rings (F5)

| Reference | Source / URL | What to borrow |
|---|---|---|
| MacroFactor dashboard revamp | Shipped app — https://macrofactor.com/dashboard-revamp/ | "Colourful but adherence-neutral": going over a target never turns red, and a met target is gently highlighted. A consumed/remaining toggle that remembers your choice. Chart time-range buttons within thumb reach. This is principle 5 (honest numbers) made real. |
| MacroFactor — food log widgets | Help centre — https://help.macrofactorapp.com/en/articles/225-understanding-the-widgets-at-the-top-of-the-dashboard | Three swipeable target widgets at the top of the food log (today / week / energy balance), so the log list stays the hero. Food detail opens a custom number keypad for portions. Adapt it for katori and gram entry. |
| MyFitnessPal | Lazyweb Health & Fitness library — https://www.lazyweb.com/company/category/health-and-fitness (MyFitnessPal entry) | Meal sections (Breakfast/Lunch/Dinner/Snacks), each with its own "Add food" row, and a top line of goal − food + exercise = remaining. Familiar to most Indian users who have tracked before. ⚠ Ad-heavy and cluttered; borrow the structure, not the density. |
| Calorie Counter App UI Kit (Nutrio) | Dribbble — https://dribbble.com/services/89035-Calorie-Counter-App-UI-Kit | One large calorie figure with three smaller macro rings beneath it, plus barcode and search entry points in the same row. Map the rings to the nutrition amber with protein, carbs and fat as tints. |
| AI Calorie Tracking App case study | Contra — https://contra.com/p/OOeMMoQl-ai-calorie-tracking-app-full-case-study | Photo logging that returns an editable item list with macros, not a single guessed total. This is the right confirmation step for the paid photo-logging feature. |
| MacroRings: Watch Calorie Log | App Store — https://apps.apple.com/app/id6757923348 | Remaining calories as a glanceable ring complication. A good model for an Android home-screen widget later. |

## 4. Recovery, sleep and readiness dashboards

| Reference | Source / URL | What to borrow |
|---|---|---|
| WHOOP design breakdown | 925 Studios — https://www.925studios.co/blog/whoop-design-breakdown | Three-layer depth (3 numbers → one-question trend screen → raw deep-dive), a near-black canvas where colour always carries meaning, and the primary metric set huge for reading at arm's length. Its critique of WHOOP's robotic coaching copy is a useful warning for Arcwell's voice. |
| Oura app redesign (Today / Vitals / My Health) | 9to5Google — https://9to5google.com/2025/10/20/oura-app-redesign/ | Five tabs merged into three, with readiness, sleep and activity as small circles at the top of Today. This confirms Arcwell's choice to put Recovery inside Today and Progress rather than in its own tab. |
| Health Mate — Sleep Score (Withings) | Dribbble — https://dribbble.com/shots/5569607-Health-Mate-Sleep-Score | A single 0–100 hero score with the sub-metrics that make it up listed directly below, each tappable. This is how to explain a readiness number without hiding the inputs (honest numbers). |
| Sleep Score Mobile App | Dribbble — https://dribbble.com/shots/24092511-Sleep-Score-Mobile-App | Calm, low-saturation night palette. A reference for how far the recovery violet can be muted on charcoal while staying legible. |
| Wringly smart-ring health dashboard | Contra — https://contra.com/p/BeksssQl-wringly-smart-ring-health-dashboard-design | One score per page, with the recovery signals that drive it listed beneath. This fits a Recovery detail screen reached from the Today card. |
| Sleep++ readiness score | Developer blog — https://www.david-smith.org/blog/2022/01/24/readiness-score/ | A written explanation of how the score is built, shown next to the score. A good model for an "About this score" sheet that builds trust. |

## 5. Progress — charts, measurements, before/after photos (F9)

| Reference | Source / URL | What to borrow |
|---|---|---|
| Progress (aligned daily selfies) | TechCrunch — https://techcrunch.com/2016/03/18/progress-lets-you-visualize-your-weight-loss-by-taking-perfectly-aligned-daily-selfies/amp/ | A ghost outline of the previous photo plus a level indicator in the camera view, so front, side and back photos line up week to week. Use it in the check-in photo slot. |
| Self Compare app concept (case study) | Portfolio — https://aattig.myportfolio.com/body-dismorphia | Compare only against your own past self, with no external benchmarks or "ideal" bodies. Sets the ethical tone for photo comparison and transformation consent (F9). |
| Weight Diary (trend line) | App Store — https://apps.apple.com/app/id410413185 | Raw daily weigh-ins as muted dots, with a smoothed trend line as the main mark. Never show daily noise as progress or failure. |
| MacroFactor charts | Shipped app — https://macrofactor.com/dashboard-revamp/ | Summary averages above each chart that update with the selected range, tap-and-hold for a single data point, and an optional edge-to-edge full-screen chart. |
| Hevy Coach — client measurements and photos | Shipped app — https://www.hevyapp.com/features/trainer-platform/ | Measurements, body fat and photos logged by the athlete appear automatically on the coach's client profile. This is the data contract for the Progress ↔ Coach link. |
| Progress-photo comparison pattern (Azeoo) | Help docs — https://support.azeoo.com/en/article/progress-photos-1av1j63/ | Side-by-side comparison restricted to the same angle (front/side/back), with an optional slider. Keep the slider as a secondary mode; side-by-side is easier one-handed. |

## 6. Coach or trainer dashboard on mobile (F2, Coach tabs)

| Reference | Source / URL | What to borrow |
|---|---|---|
| TrueCoach — managing your clients | Help centre — https://help.truecoach.co/articles/2403919-managing-your-clients | Sort clients by compliance rate (completed ÷ programmed over 7/30/90 days) and alert when compliance starts dropping. This is the basis for Arcwell's "needs attention" sort. Show the % and the reason, not just a red dot. |
| Trainerize FitMetrics "Smart Views" | Trainerize blog — https://www.trainerize.com/blog/?p=24458 | Saved views that flag clients who need attention and say why ("no workout in 5 days", "check-in overdue"). Use them as filter chips on the Clients tab. |
| Linear — UI redesign and mobile | Linear — https://linear.app/now/how-we-redesigned-the-linear-ui and https://linear.app/mobile | Calm high density: tight row rhythm, low-contrast dividers, one accent, and status shown by small glyphs. Also the newer Priority/Other inbox split (https://linear.app/changelog/2026-09-03-priority-inbox). Copy this split for the Check-ins inbox: "Needs reply" and "Everything else". |
| SaaS inbox patterns | SaaSFrame — https://www.saasframe.io/patterns/inbox?60e91b22_page=1 | Show only the fields that support a triage decision (who, what, when, priority), and don't re-sort rows while the coach is acting on them. That avoids taps landing on the wrong client. |
| Fitness Trainer Tracker | Dribbble — https://dribbble.com/shots/6353924-Fitness-Trainer-Tracker | A mobile member list where each row leads to "assign plan". A compact example of the client row → plan assignment path. |
| Spottyr coach app | DesignRush — https://www.designrush.com/best-designs/apps/spottyr-app-design | Coach bottom tabs (dashboard, clients, sessions, reports) with search and filters at the top of the client list. Close to Arcwell's coach IA; check the tab labels against it. |

## 7. Check-in forms and chat/messaging (F6, F7)

| Reference | Source / URL | What to borrow |
|---|---|---|
| Client check-in template | Coachway — https://coachway.io/articles/client-check-in-template/ | A check-in that takes under 5 minutes: 1–5 scales for sleep, hunger, energy, training and adherence, then two open questions ("what went well / what felt hard"). Use it as the default Arcwell check-in template. |
| HubFit coach app — check-in review inbox | HubFit — https://hubfit.com/help/academy/getting-started/the-coach-app | Submitted check-ins land in a dedicated review inbox on the coach's phone, separate from chat. This matches Arcwell's separate Check-ins tab. |
| Best client check-in apps (2026) | FitBudd — https://www.fitbudd.com/insights/best-client-check-in-accountability-apps-for-online-coaching-software-2026 | Keep the check-in inside the app where the athlete already logs, because emailed form links have lower completion. Add a gentle reminder when a check-in is missed. |
| Chats — YourCoach Health | Dribbble — https://dribbble.com/shots/23266927-Chats-YourCoach-Health | A coach–client chat inside a health platform. Use it to see how session or plan context cards sit inline with message bubbles. |
| UI Dashboard — Messaging App | Dribbble — https://dribbble.com/shots/21991967-UI-Dashboard-Messaging-App | Dark-mode chat with clear status markers and a shared-media panel. Adapt the panel as a "Files" view (images, PDFs) in a client chat. |

## 8. Paywall and subscription upgrade screens (F8)

| Reference | Source / URL | What to borrow |
|---|---|---|
| Strava "honest paywall" | UX Collective — https://uxdesign.cc/stravas-bumpy-road-to-monetisation-5b82f23fcf07 and Lazyweb research — https://lazyweb.com/research/strava-low-density-trial-paywall | A trial timeline (today → reminder 2 days before → billing date) with a promised reminder, and fewer words around the trial. Trust-building and suited to the calm brand. |
| Strava locked-feature paywall | Lazyweb — https://experiments.lazyweb.com/flow/strava/locked-feature-paywall | A paywall triggered from the feature being tapped, showing that feature's value in context. This is the "natural upgrade moment" in principle 7. |
| Apple Fitness — paywall and subscription | Lazyweb — https://lazyweb.com/canvas/flows/apple-fitness/paywall-subscription (full flow needs a free sign-up) | Restrained premium paywall: one hero, a short benefit list, a single primary button, and the price stated plainly. A tone reference for the AI-tier screen. |
| Anatomy of a paywall | UX Collective — https://uxdesign.cc/anatomy-of-a-paywall-how-to-design-a-mobile-paywall-that-converts-db33a3cefd88 | A checklist: price stated clearly, plan comparison, restore purchase, close button always visible. Use it as an acceptance checklist for the Paywall component. |
| silBe / WeGLOW paywalls | ScreensDesign — https://screensdesign.com/apps/silbe-fitness-for-her/ and https://screensdesign.com/apps/weglow-home-workout-for-women/?vs=201705 | Two or three plan cards with "best value" on the yearly plan and the per-month price shown. ⚠ Both add testimonials and urgency; borrow only the plan-card layout. |

## 9. Dark-mode fitness UI systems; colour and typography

| Reference | Source / URL | What to borrow |
|---|---|---|
| WHOOP colour system | 925 Studios — https://www.925studios.co/blog/whoop-design-breakdown | Three meaning-bound colours repeated on every screen and no decorative accents. Apply this discipline to brand, training, nutrition and recovery, and keep red for errors only (as DESIGN.md already says). |
| What theme do health and fitness apps default to? | Lazyweb research — https://labs.lazyweb.com/research/what-theme-do-health-fitness-apps-use.md | Data on how often health apps default to dark. Use it to sanity-check the dark-first decision and follow the system setting by default. |
| Fit Note — product design and brand identity | Contra — https://contra.com/p/A3vYMNRc-fit-note-product-design-brand-identity | A dark UI built on a structured, extensible system (built to add dashboards without breaking consistency). A reference for building Arcwell's tokens once and reusing them. ⚠ Its "cinematic" photography goes further than Arcwell needs. |
| Fitness in Style — Modern Dark UI for Workout Tracking | Behance search listing — https://www.behance.net/search/projects//fitness%20tracking?locale=en_US | A dark workout tracker with neutral greys and a single accent. Open it to compare surface steps (`bg` → `surface` → `surfaceRaised`). Unverified past the listing. |
| FitBuddy — Fitness app UX case study | Behance — https://www.behance.net/gallery/166257929/FitBuddy-Fitness-app-UX-Case-Study?locale=en_US | Full case-study structure (research → flows → UI kit). A template for documenting Arcwell's own screens in `docs/design/`. |
| Blaze — smart fitness tracking in light and dark mode | Contra — https://contra.com/p/mcOAP3Xr-blaze-smart-fitness-tracking-in-light-and-dark-mode | The same screens designed in both themes side by side. Useful when defining the light-theme values DESIGN.md leaves open. |
| Linear UI refresh | Linear changelog — https://linear.app/changelog/2026-03-12-ui-refresh | Typography-led hierarchy on a dark canvas, with weight and size doing the work instead of colour. Pairs well with Inter and tabular numerals. |

---

## Patterns to avoid

- **Neon on black** (electric lime, cyan, magenta glows). Common in Dribbble fitness concepts; reads as "bro" and fails the calm personality. Keep accents at the chroma drafted in DESIGN.md.
- **Streak flames, XP bars, badges, leaderboards and confetti** (seen in Gymverse/GymLevels-style apps). Conflicts with "not gamified". If anything is celebrated, celebrate consistency quietly, as MacroFactor does.
- **Red for missed targets or days.** Breaks principle 5. Over target is neutral; red is for destructive actions and errors only.
- **Hype copy** ("Crush it!", "Beast mode", "No excuses"). Use "Log set", "Nice work, 3 sets done".
- **Countdown timers, fake discounts and hidden close buttons on paywalls** (common in onboarding-paywall apps; Lazyweb finds 54% of Health & Fitness onboarding flows include a paywall). Show the price plainly and keep close visible.
- **Paywall before value.** Don't put the upgrade screen in onboarding. Show it only at a locked feature (principle 7).
- **3D renders, stock muscle-man photography and gradient hero cards** as decoration. Fine in marketing, noise in a logging tool.
- **Precision gestures mid-workout** (tiny steppers, swipe-to-delete as the only path, long-press menus for core actions).
- **Re-sorting coach lists while the coach is acting.** Freeze order until the screen is refreshed.
- **Before/after imagery against "ideal" bodies or other users.** Compare only against the athlete's own history, with consent (F9).

## Moodboard — visual direction statements

1. Charcoal, not black: `#0E1116` with three soft surface steps, and colour only where it means something.
2. Numbers are the hero. Big tabular Inter figures; labels small and muted beneath.
3. One pillar, one colour. Cyan, amber or violet tells you where you are; electric blue tells you what to do (D24).
4. Three numbers first, one question per screen next, raw data only when asked.
5. The bottom half is the work zone. Every primary action sits within thumb reach at 48dp or more.
6. Trends over days: smoothed lines and muted dots, never a red "you failed" state.
7. The coach side reads like a calm inbox: dense rows, quiet dividers, sorted by who needs you.
8. Premium through restraint. Plain prices, honest trials, no confetti.
