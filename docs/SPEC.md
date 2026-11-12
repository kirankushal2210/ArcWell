# Arcwell — Product Spec (v1)

Agreed 2026-11-10. Source of truth for scope; change it here before changing code.

## Product

One Android app that combines training, nutrition and recovery.

- **For coaches:** a client-management platform (CRM) with training, nutrition, recovery and check-in tools built in, replacing WhatsApp + Excel.
- **For athletes:** a tracker, plus an optional paid AI coach for people who don't want to pay for a human coach.

Positioning: AI is a cheap alternative for general fitness; human coaches suit serious goals (e.g. bodybuilding). Arcwell replaces low-effort "copy-paste ChatGPT plan" coaching, not good coaches.

Market: India first. Android only at launch. Compliance: India DPDP Act.

## Users and tiers

| User | Pays | Gets |
|---|---|---|
| Free athlete | ₹0 | 2–3 training templates and basic logging; food logging by search, calories only; bodyweight, measurements, progress photos and charts. No Recovery, no AI. |
| Paid athlete (AI) | Monthly or yearly via Google Play (RevenueCat); one-week AI trial, then a hard paywall (unpaid → Free) | Pro tools + AI-built/adjusted training plans, full macros, AI meal plans, AI photo food logging, Recovery |
| Coached athlete | ₹0 | Pro tools without an AI subscription, plus whatever their coach assigns (training, nutrition, recovery). **AI is never shown.** |
| Coach | Monthly SaaS fee via Razorpay (outside the app). Price TBD after build; plan limits are configurable settings. | Client dashboard, profiles, plan builder, check-ins, chat, leads, client lifecycle, coach profile |

## v1 scope

**Athlete app** (decisions D1–D52 in [DECISIONS.md](DECISIONS.md)):

- Bottom bar — free: Today · Training · Nutrition. AI-coached: Today · Training · Nutrition · Recovery · AI Coaching. Human-coached: Today · Training · Nutrition · Recovery · Progress, where Progress is the combined Check-ins · Progress · Chat area.
- Side menu (☰) for all athletes: Account · Notifications · Training (Exercises, Workouts, Programs, History, Muscle Analytics) · Gyms · Physique (Bodyweight, Measurements, Photos, Charts). Workouts are standalone sessions (free: templates only; Pro: create your own); Programs are multi-week plans (Pro); Muscle Analytics shows weekly sets per muscle group (Pro); Gyms is a read-only map / directory (free). No Set Videos (no video in v1).
- Recovery: sleep / sleep score (0–100), soreness, fatigue only. No stretching or mobility routines. Coaches can set a sleep target and a recovery note.
- Coached athletes see their past check-ins and coach feedback in a Progress timeline.

- Training: Hevy-style workout logging; small exercise library of common gym equipment; demo media from a commercially licensed source.
- Nutrition: IFCT 2017 + curated Indian dishes, Indian portions (katori, roti, piece); coach meal plans as fixed meals with exact foods and quantities.
- Onboarding (D52), one question per screen in five sections:
  - About you: gender (optional, for the calorie estimate), age, height, current weight.
  - Your goal: main goal (lose fat, build muscle, get stronger, body recomposition, general fitness), goal weight (optional), daily activity level.
  - Training: experience, where you train (gym / home with equipment list / none), days per week and preferred days, session length and usual time of day, injuries/limitations.
  - Recovery (all optional): usual sleep hours with bed and wake times, sleep quality, stress, energy and soreness.
  - Nutrition: diet type (veg, non-veg, eggetarian, vegan, Jain), meals per day.
  - Free athletes then see a calorie target (calories only), a preview of what the free plan includes, and their first workout. Coached athletes skip these; their coach sets targets and plans. No AI, trial or paywall anywhere in onboarding.

**Coach workspace** (same app, different interface by role): coach onboarding (what you get, coach agreement, how you coach and roughly how many clients, profile and specialisations, optional bio, services, first template (Arcwell template, from scratch, or copied from their spreadsheet), invite link, then a setup checklist on Clients); client list with adherence and overdue check-ins; client profiles; plan builder with reusable templates, including importing a coach's existing Excel, Google Sheets or CSV workouts into a draft template (D55); weekly check-ins (fixed form, coach picks the day per client, text reply); instant chat with image/PDF attachments; client lifecycle (active, paused, leaving, completed); basic leads; coach profile with transformation photos.

**AI (paid athletes only):** plans built and adjusted only from the approved exercise library and validated by server-side programming rules; AI meal plans; AI photo food logging. Out-of-scope requests (contest prep, injury rehab) show "I can't help with that"; they are not routed anywhere. Turning off AI permission hides AI features but doesn't cancel billing; cancellation and refunds are handled in Google Play.

**Notifications:** new message, check-in due, check-in submitted (coach), plan assigned, daily workout reminder, coach feedback.

**Out of v1:** iOS, marketplace/discovery, certificate checks (certifications are optional and self-reported), equipment-photo workouts, research-backed AI chat, wearables, barcode scanning, phone OTP login, coaching teams, coach web dashboard, admin app, video of any kind (attachments or set videos), full offline mode, lb units. v1.1 candidates are listed in DECISIONS.md (D45).

## Key rules

- One coach per athlete at a time. Joining is via the coach's invite link.
- A coach sees a client's data only while linked, only from the join date, unless the athlete grants earlier history.
- On leaving (or when the coach marks the client completed or deletes their account): coach access ends immediately; athlete keeps all history and becomes a free athlete; the coach's plan stays, read-only; Recovery is hidden (history kept).
- Transformation photos: coach requests, **athlete approves** (optional face blur), athlete can withdraw at any time.
- Consent at sign-up for health data; AI permission asked at sign-up **and** again at first AI use; declining AI never blocks non-AI features. Optional photo consent never blocks a check-in. Account export and deletion available.
- Joining a coach: the coach's guidance replaces active training, nutrition and recovery guidance; an AI subscriber's switch includes an explicit subscription-cancellation step in Google Play. Leaving a coach: the coach's plan stays usable, read-only. No history is ever deleted by these changes.
- AI and all privileged actions run server-side only; paid AI users have a daily request cap.

## Architecture

- App: Expo SDK 58, React Native 0.88, TypeScript, Expo Router (`app/`).
- Backend: Supabase — Postgres + row-level security, Auth (Google + email), Realtime (chat), Edge Functions (`supabase/`).
- Files: Amazon S3 via short-lived signed URLs issued by Edge Functions; images compressed client-side.
- AI: provider-neutral layer (`supabase/functions/_shared/ai/`), Groq free tier at launch, swappable to Claude/OpenAI by config.
- Offline: in-progress workout cached on device, synced on reconnect.
- Notifications: Expo Notifications. Builds: EAS.
- Billing: RevenueCat + Google Play Billing (athletes); Razorpay Subscription links + webhook Edge Function (coaches).
- Admin: Supabase dashboard (no custom admin app in v1).

## Definition of done (v1)

3–5 real coaches run all their clients on the Android app for 2–4 weeks with: no lost workout or chat data; no coach able to see another coach's clients; check-ins, chat and plans working end to end; the paid AI tier purchasable via Google Play. Automated tests cover access rules (RLS) and billing; everything else is tested by hand against a checklist.

## Known risks

Exercise media licensing; Groq free-tier vision support; free-model accuracy for structured plans; health data to AI providers under DPDP; Android-only excludes iPhone clients; S3 costs after free credits; Supabase free-plan limits; thin regional Indian food data; two-person scope; gym directory data source and accuracy; "Arcwell" trademark conflicts outside India (US software mark, US/Canada supplement mark) — IP India search required before branding spend.
