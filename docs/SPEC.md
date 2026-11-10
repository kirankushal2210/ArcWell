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
| Free athlete | ₹0 | 2–3 training templates and basic logging; food logging by search, calories only. No recovery, no AI. |
| Paid athlete (AI) | Monthly via Google Play (RevenueCat) | AI-built/adjusted training plans, full macros, AI meal plans, AI photo food logging, recovery, full progress |
| Coached athlete | ₹0 | Whatever their coach assigns. **AI is never shown.** |
| Coach | Monthly SaaS fee via Razorpay (outside the app). Price TBD after build; plan limits are configurable settings. | Client dashboard, profiles, plan builder, check-ins, chat, leads, client lifecycle, coach profile |

## v1 scope

**Athlete app:** Home, Training, Nutrition, Recovery, Progress; plus Coach chat (coached) or AI coach (paid).

- Training: Hevy-style workout logging; small exercise library of common gym equipment; demo media from a commercially licensed source.
- Nutrition: IFCT 2017 + curated Indian dishes, Indian portions (katori, roti, piece); coach meal plans as fixed meals with exact foods and quantities.
- Onboarding: goal, experience, age/height/weight, injuries/limitations, training days and session length, equipment access (gym/home/none), diet type (veg, non-veg, eggetarian, vegan, Jain).

**Coach workspace** (same app, different interface by role): client list with adherence and overdue check-ins; client profiles; plan builder with reusable templates; weekly check-ins (fixed form, coach picks the day per client, text reply); instant chat with image/PDF attachments; client lifecycle (active, paused, leaving, completed); basic leads; coach profile with transformation photos.

**AI (paid athletes only):** plans built and adjusted only from the approved exercise library and validated by server-side programming rules; AI meal plans; AI photo food logging. Out-of-scope goals (contest prep, injury rehab) are routed to coaches.

**Notifications:** new message, check-in due, check-in submitted (coach), plan assigned, daily workout reminder, coach feedback.

**Out of v1:** iOS, marketplace/discovery, certificate checks, equipment-photo workouts, research-backed AI chat, wearables, barcode scanning, phone OTP login, coaching teams, coach web dashboard, admin app, video attachments, full offline mode.

## Key rules

- One coach per athlete at a time. Joining is via the coach's invite link.
- A coach sees a client's data only while linked, only from the join date, unless the athlete grants earlier history.
- On leaving: coach access ends immediately; athlete keeps all history and becomes a free athlete.
- Transformation photos: coach requests, **athlete approves** (optional face blur), athlete can withdraw at any time.
- Consent at sign-up for health data and AI processing; account export and deletion available.
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

Exercise media licensing; Groq free-tier vision support; free-model accuracy for structured plans; health data to AI providers under DPDP; Android-only excludes iPhone clients; S3 costs after free credits; Supabase free-plan limits; thin regional Indian food data; two-person scope; "Arcwell" trademark conflicts outside India (US software mark, US/Canada supplement mark) — IP India search required before branding spend.
