# Arcwell — Design Generation Prompt

Adapted 2026-11-11 from the founder's "Bulky AI" nutrition prompt, rewritten to match `docs/DESIGN.md`, `brand-assessment.md` and `sitemap.md`. Use it with an AI design tool (e.g. Figma Make, Google Stitch, Claude design artifacts). Generate in **two passes** (Part A athlete, Part B coach) — one pass with ~30 screens produces shallow results.

## What changed from the Bulky prompt, and why

| Bulky prompt | Arcwell prompt | Reason |
|---|---|---|
| iPhone mockups, Apple login | Android (Pixel-style) mockups, Google + email only | Android-only launch; no Apple account |
| Streaks, XP, "addictive" | Consistency shown as calm weekly trends; "habit-forming, never pushy" | Brand principle: not gamified, no shaming (DESIGN.md §1) |
| Electric blue / cyan gradients | Charcoal + brand green, with blue / amber / violet for Training / Nutrition / Recovery | Agreed palette; colour carries meaning |
| Nutrition only | Training, Nutrition, Recovery, Progress, Coach + coach workspace | Arcwell is all-in-one with two roles |
| Gender, weight-gain goal | Arcwell onboarding questions incl. Indian diet type | Agreed onboarding (SPEC.md) |
| 3-day trial paywall inside onboarding | Paywall shown at upgrade moments, not during onboarding | Research: paywall in onboarding hurts trust; coached athletes never see it |
| Generic Western foods | Indian foods and portions (dal, roti, paneer, katori) | India-first |

---

## Part A — Athlete app prompt

```
Design a complete, consistent mobile UI design system and screen set for "Arcwell", an Android fitness app launching in India.

ABOUT ARCWELL
Arcwell brings training, nutrition and recovery into one app. It serves two roles:
- Athletes: people training on their own (free tier or a paid AI-coach tier) or with a human coach.
- Coaches: online fitness coaches who manage all their clients in Arcwell (designed separately in Part B).
Mission: make good coaching easier to deliver and harder to fake. Tagline: "Training, nutrition and recovery, coached as one."

The athlete app helps people:
- follow today's workout and log sets in seconds
- log Indian meals quickly (calories for free users; full macros for paid and coached users)
- track recovery (sleep, soreness, fatigue)
- see progress through weight, measurements, photos and trends
- chat with their coach and submit weekly check-ins (coached users)
- get AI-built training and meal plans and AI photo food logging (paid users only)

BRAND PERSONALITY
Calm, competent, trustworthy — like a respected senior coach. Encouraging, honest, evidence-minded.
NOT loud, NOT neon, NOT "beast mode" bodybuilding, NOT gamified. No streak flames, XP, badges or confetti. Never shame the user: missed targets are shown neutrally, never in red.

DESIGN STYLE
- Modern 2026 product aesthetic; minimal, uncluttered, premium
- Dark mode first (also show 2 key screens in light mode)
- Near-black backgrounds, generous spacing, rounded corners, soft depth; no heavy gradients or glassmorphism
- Large, clear numbers carry the hierarchy (weights, reps, calories, timers)
- Built for one-handed use mid-workout: primary actions in the bottom half, tap targets at least 48dp
- Colour is used only to carry meaning

COLOUR TOKENS
- Background #0E1116, surface #161B22, raised surface #1F2630, border #2A323D
- Text #F2F4F7, muted text #9AA4B2
- Brand / primary action: green #1FBF8F (text on it #04140E)
- Training: blue #4C8DFF · Nutrition: amber #F5A524 · Recovery: violet #8B7CFF
- Success #22C55E, warning #F59E0B, danger #EF4444 (errors and destructive actions only)
- All text must meet WCAG AA contrast

TYPOGRAPHY
Inter. Tabular numerals for all metrics. Scale: display 32 bold, title 22 semibold, heading 18 semibold, body 16, label 14 medium, caption 12.

COMPONENTS (show as a design-system sheet first)
Buttons (primary, secondary, ghost, destructive), inputs, number stepper with large +/- for kg and reps, cards, list rows, bottom tab bar, set-logging row (previous | kg | reps | done tick), rest-timer bottom sheet, calorie bar and macro rings, food result row, portion picker (katori, roti, piece, grams), chat bubbles with image/PDF attachments, check-in form fields with photo slots, status chips, empty / loading / error states, locked-feature card.

NAVIGATION
Bottom tabs: Today · Train · Eat · Progress · Coach. Profile and settings open from the avatar.

SCREENS
1. Splash — Arcwell wordmark with a subtle arc symbol, dark, minimal.
2. Welcome — calm headline, two choices: "I'm training" and "I'm a coach"; Google sign-in and email.
3. Sign in / Sign up — Google button, email and password, forgot password. (No Apple login.)
4. Invite landing — "Join Coach Joseph on Arcwell" with the coach's photo and a single CTA.
5. Consent — clear, friendly screen for health data and photo consent with toggles.
6. Onboarding (one question per screen, thin progress bar): goal; experience level; age, height, weight; injuries or limitations; training days and session length; equipment (gym / home / none); diet type (veg, non-veg, eggetarian, vegan, Jain); summary screen showing the starting plan or "Your coach will assign your plan".
7. Today — greeting; today's workout card (blue); calories and macros remaining (amber); recovery check-in task (violet); for coached users a "check-in due Sunday" card and latest coach message; for paid users one short AI tip. Calm weekly consistency strip (dots for days logged) instead of a streak counter.
8. Workout detail — exercise list with sets x reps, demo thumbnail, "Start workout" pinned at bottom.
9. Active workout — set table with previous values pre-filled, big tap-to-complete ticks, rest timer sheet, swap exercise, finish button.
10. Workout summary — total volume, personal records, duration, calm congratulation.
11. Exercise detail — looping demo media, technique cues, muscles worked, alternatives.
12. Eat (day log) — meals (breakfast, lunch, snacks, dinner) with Indian foods (poha, dal, roti, paneer bhurji, curd rice), calorie and macro totals, "+ Add food".
13. Food search and portion picker — search results, then portion in katori / roti / piece / grams, live calorie and macro preview.
14. AI photo food logging (paid) — camera preview of a thali, "Analysing" state, results sheet listing detected items with editable portions and a required "Confirm" step.
15. Meal plan — coach's fixed meals or AI meal plan, tick off eaten meals.
16. Progress — weight trend chart, measurements, side-by-side progress photo comparison, recovery trends (sleep, soreness, fatigue), weekly summary.
17. Recovery log — quick daily sliders for sleep hours, soreness, fatigue; plain-language readiness note.
18. Coach tab (coached) — chat with the coach (text, photo, PDF), weekly check-in form (measurements, photos, questions), past check-ins with coach feedback, transformation photo request with "Approve with face blur / Decline".
19. AI coach (paid) — conversational screen for adjusting plans; when a goal is out of scope it suggests working with a human coach.
20. Upgrade (free users, shown at natural moments such as tapping macros or recovery) — honest paywall: monthly and yearly options in INR, clear feature list, trial reminder timeline, "Restore purchase", no countdown timers or fake discounts.
21. Profile and settings — profile, subscription (managed via Google Play), my coach (history-access toggle, leave coach), notifications, units, privacy (export data, delete account), sign out.
22. Notification examples (Android style), calm tone:
    - "Push day is ready — 5 exercises, about 50 min"
    - "You have 620 kcal left today"
    - "Coach Joseph replied to your check-in"
    - "Weekly check-in is due tomorrow"

STATES
Show empty, loading and error states for Today, Eat and Progress, and an offline banner during a workout ("Saved on your phone — will sync").

OUTPUT
High-quality Android mockups (Pixel-style frame, 412x915 dp), realistic content in Indian English and kg/cm, all screens sharing one design system. The app should feel premium, calm, motivating, simple and trustworthy — habit-forming, never pushy.
```

---

## Part B — Coach workspace prompt

```
Using the same Arcwell design system as before (same colours, typography, components and dark-first style), design the coach side of the Arcwell Android app.

The coach is an online fitness coach in India with 20–60 clients, replacing WhatsApp and Excel. The coach UI should feel like a professional work tool: denser than the athlete app, triage-first, fast to scan, nothing decorative. Never re-sort a list while the coach is using it.

NAVIGATION
Bottom tabs: Clients · Check-ins · Plans · Messages · Business.

SCREENS
1. Coach onboarding — profile basics (photo, specialisations, bio), services, create first template (skippable), share invite link via WhatsApp / Instagram / copy, plan info ("Free during beta").
2. Clients — list sorted by "needs attention": overdue check-ins, low adherence, unread messages. Each row: avatar, name, status chip (active / paused / leaving / completed), adherence percentage, last activity. Filters at top. "Invite client" button.
3. Client profile — header with key stats (adherence, weight trend, days with coach); tabs for Overview, Training, Nutrition, Recovery, Progress, Check-ins, Notes; status change and "End coaching".
4. Check-ins inbox — submitted / overdue / reviewed sections.
5. Check-in review — answers, measurements compared with last week, progress photos side by side, text feedback box and send.
6. Plan builder — weeks and days, add exercises from the library, sets / reps / rest / effort, reorder by drag, save as template, assign to client.
7. Meal plan builder — meals with Indian foods and exact quantities, live calorie and macro totals.
8. Messages — conversation list and chat with image and PDF attachments.
9. Business — leads list (new, contacted, converted, lost), invite link and QR, edit coach profile, transformations (request photo use, status pending / approved / withdrawn, export blurred before/after), plan and billing.
10. Empty states — no clients yet (with invite CTA), no check-ins this week.

OUTPUT
Android mockups (Pixel-style, 412x915 dp), realistic Indian names and data, consistent with the athlete app.
```

---

## After generating

Treat generated screens as **exploration, not final designs**. Check each against DESIGN.md (principles, tokens, accessibility checklist) before adopting. Record accepted decisions in DESIGN.md §9 and screen status in §7.
