# Arcwell — Implementation Plan

Rough estimates assume two builders using AI tools heavily. Total ≈ 18–24 weeks. Phase 7 can run in parallel with Phases 5–6.

## Pre-build blockers (no code, clear in parallel)

- [ ] Exercise demo media: confirm commercial licence (fallback: openly licensed stills)
- [ ] IFCT 2017: confirm usage rights; get it into machine-readable form
- [ ] Groq: current free models, rate limits, data retention, vision support
- [ ] Accounts: Google Play Console, Supabase (hosted, Mumbai; founder creates it, D72), Expo, Razorpay (business KYC)
- [ ] Privacy policy + DPDP consent text (health data, AI, photos, coach access): drafted, with Terms and Copyright policy (D106, docs/legal/README.md); needs legal review and company details
- [ ] IP India trademark search for "Arcwell" (software and fitness classes)
- [ ] Confirm Android package name before first Play upload (currently `com.arcwell.app`; permanent once published)
- [ ] Coach Terms legal review (coaches handle client health data under DPDP)
- [ ] Groq data terms: confirm the AI photo-deletion wording in F8-03
- [ ] Standard gram weights for Indian portions (katori, phulka, piece), checked by a nutrition reviewer
- [ ] Review of the FE-2 evidence rules and Sources screen by a qualified sports scientist and a registered dietitian (D69)
- [ ] Invite-link domain and web page (link preview + redirect)
- [ ] Play Console prices for Arcwell Plus (monthly, yearly) and trial setup
- [ ] Sleep-score formula (from hours and quality, no wearables)
- [ ] Gym directory data source and licence

## Phase 0 — Setup (~1 week)

- [x] Repo with `app/` (Expo SDK 58, TypeScript, Expo Router) and `supabase/`
- [x] Supabase local config, migrations/tests/seed structure, pgTAP smoke test
- [x] AI provider interface (Groq first), secrets template
- [x] Lint, typecheck, CI (app, database tests, Edge Functions typecheck)
- [x] Create GitHub repo and push
- [ ] Create staging Supabase project and link it
- [ ] EAS project + Android preview build profile

## Design phase — UI/UX foundations (1–2 weeks, before Phase 1)

Everything design-related lives in [DESIGN.md](DESIGN.md); mockups in `docs/design/`.

- [x] DESIGN.md: principles, brand, app structure per role, draft tokens, component list
- [ ] Confirm working assumptions (DESIGN.md section 0)
- [x] Wireframes for all v1 flows F1–F18 (199 screens; decisions in DECISIONS.md D1–D45)
- [ ] Founder review of the applied defaults D25–D45 and a screen-by-screen pass
- [ ] Usability test of the core flows (onboarding, workout logging, food logging, check-in) with 3–5 people
- [x] Finalise tokens and build them in `app/src/theme/` (dark only; the light theme is deferred by D67)
- [x] Build core components in `app/src/components/`
- [x] ~~High-fidelity mockups for the 5–6 most important screens~~ (skipped by D48: built straight from the wireframes)

After this, every phase starts by designing its screens with these components before writing code.

## Front-end completion (founder decision, 2026-11-13)

The front end is finished on sample data before any backend wiring (Phases 1–8 below then connect these screens to Supabase). Audit on 2026-11-13: about 160 of the 199 inventory screens built. Remaining work, in order:

- [x] **FE-1 Coached loop:** Progress area (Check-ins · Progress · Chat, CP-01 to CP-06), image viewer (X-05), coach completes or closes → athlete moves to Free (K-29, K-30), switch-coach invite (F3-03), client limit and coach full (K-25, K-26), coach billing lapsed (K-27)
- [x] **FE-2 Science foundation (D69):** one evidence rules module that every screen, template, generator and later the AI follows:
  - training: weekly hard sets per muscle within the researched range (no junk volume), sets taken close to failure (0–3 reps in reserve), rep ranges by goal, rest periods, training frequency, progression, deloads;
  - nutrition: energy and protein targets (protein from goal or lean weight for higher body fat), rate of loss or gain, fibre and hydration;
  - recovery: sleep need, and when to pull back training after a poor night;
  - audit and fix existing content: the onboarding plan generator, starter and coach templates, the coach plan builder (live volume warnings), the exercise library cues;
  - "Why this?" explainers on targets and plans, and a Sources screen listing each paper (author, year, journal, DOI), every source checked on PubMed before it ships;
  - review by a qualified sports scientist and dietitian before launch (added to the pre-build blockers).
- [x] **FE-3 Training depth:** Programs (TR-04, TR-05), Muscle Analytics with weekly sets against the FE-2 ranges (TR-06, TR-07), estimated 1RM and strength charts, plate calculator, coach exercise library (K-23), free starter workouts (TR-01)
- [x] **FE-4 Money states:** subscription details, payment problem, subscription ended (F8-06 to F8-08), trial timeline and reminders (F8-02, TL-01, TL-02), upgrade what changed (U-01)
- [x] **FE-5 Extras:** water tracking, reminders, coach message to several clients, Gyms (G-01, G-02), first-run tips
- [x] **FE-6 AI, front end only (D70):** no models, no APIs, no AI code. Screens run on sample responses and the FE-2 rules, clearly marked as sample. Pro athletes only; coached athletes never see AI (D44).
  - AI plan builder: build, review and accept a training plan; tailor it ("30 minutes today", "my knee hurts", "no barbell").
  - Nutrition assistant: meal plan generation and swaps, fit a meal into the day, eating out, Indian dishes; photo food logging with mock results (F5-09 to F5-11).
  - Recovery-aware day: after a poor night (for example 4 hours' sleep before a hard session) a suggestion on Today to cut that day's volume, with the reason. Nothing changes unless the athlete accepts; accepting tailors that day's workout only.
  - Weekly AI review of training, food and recovery; every suggestion shows why, and links to its FE-2 source.
  - AI states: AI off, out of scope, daily limit, couldn't build a plan (AI-02, AI-04, X-01, X-02).
  - Coached athletes: no AI; their coach sees a plain low-recovery flag on the client profile and decides.
- [x] **FE-7 System states and full QA loop:** loading, error, offline, permission denied, force update, maintenance, notification pre-ask (S-01 to S-06, X-07, F4-09, F7-03), PDF attach and viewer UI (F7-02, X-06), then a full walk of every screen as free, Pro, coached and coach, fixing what's found, until nothing is left (Phase 14 of the frontend execution prompt)

- [x] **FE-8 Habits and cardio fitness (D74–D81):** smaller buttons (D81); module preferences and `useVisibility()` (D78); Morning start card with the cortisol-rhythm curve (D80); Daily habits with the Today selector, library, habit sheets and safety checks (D74, D77); Cardio fitness with estimates, tests, interval sessions and the live timer (D79); long-exhale breathing, focus block, walk after a meal, nutrition signals, if-then plans and the coach habits section.
- [x] **FE-9 HYROX race track (D76):** race data by season, race goal and onboarding branch, Race section, race simulator and results, hybrid-race plan rules, and the client race summary for coaches.
  - Not built yet: dedicated endurance and station blocks in the coach plan builder (coaches can already add runs and stations as exercises with reps such as "5 × 1 km"); Health Connect for steps, heart rate and watch VO2 max (needs the development build); the jet-lag travel mode (v1.1); live heart rate in the interval timer.

## Backend build (D72, D73)

The front end is complete (FE-1 to FE-7). The backend wires those screens to Supabase one slice at a time, coach loop first. Each slice: migrations with RLS and pgTAP tests (coach isolation, join-date visibility, access ending on leave), a repository that replaces the sample store for that area so screens don't change, then a check on web and a phone. Built against the local stack first; the hosted Mumbai project follows once the founder creates it.

- [ ] **B1 Accounts, roles and coach links:** email-code sign-in (D62), profiles and consents, coach and athlete roles, invites (general and personal, single-use), coach_clients with status, history access and ending coaching; split the sample store (`CoachData.tsx`) into per-area repositories.
- [ ] **B2 Plans and templates:** training programs, meal plans, recovery protocols, supplements, templates and assigning; coach-only writes, client reads.
- [ ] **B3 Workout logging:** sessions and sets with the in-progress workout cached on the phone and synced on reconnect; routines and custom exercises.
- [ ] **B4 Food logging:** food logs, my foods and meal-plan logging on the current sample food data until the IFCT rights and reviewed Indian data arrive.
- [ ] **B5 Check-ins, chat, files and notifications:** weekly check-ins with photos in Supabase Storage, realtime chat with photos and PDFs, the six notifications with Expo Notifications.
- [ ] **B6 Progress, recovery and consent:** weigh-ins, measurements, progress photos, recovery logs, transformation photo approvals and withdrawal, export and delete.
- [ ] **B7 Billing and entitlements:** RevenueCat with Google Play for Arcwell Plus, Razorpay links for coaches, server-side tier checks (coached athletes never get AI). Waits on Play Console, RevenueCat and Razorpay KYC.
- [ ] **B8 AI:** the AI layer in `supabase/functions/_shared/ai/` behind the FE-6 screens, with entitlement and daily-cap checks and output validated against the D69 rules.

## Phase 1 — Foundations (2–3 weeks)

Auth (Google + email), role choice, onboarding; core tables with RLS on every table plus pgTAP tests for coach isolation, join-date visibility and revocation on leave; Supabase Storage signed-URL uploads with client-side compression (D72); role-based app shell.

## Phase 2 — Coach ↔ client core (3 weeks)

Invite links (Android App Links) auto-linking client to coach, including personal invites that carry a pending client's plans and skip onboarding (D56; Play Install Referrer through install, typed code fallback, single-use tokens, RLS on pending clients); exercise library seed + browse/search/detail; plan builder (templates, assign, customise); Hevy-style workout logging with local caching of the in-progress workout; coach dashboard, client profile, client lifecycle.

## Phase 3 — Nutrition (2–3 weeks)

IFCT + curated dishes import with Indian portions; food search and logging (calories-only for free, full macros for paid/coached); coach fixed-meal plans and adherence.

## Phase 4 — Check-ins, chat, notifications (2–3 weeks)

Weekly check-ins (fixed form, coach-set day, photos, text reply); realtime chat with image/PDF attachments; the six notifications incl. scheduled check-in reminders; lead tracking.

## Phase 5 — Progress, recovery, transformations (2 weeks)

Measurements, photos, trends; recovery logs with sleep score (paid + coached only) and coach sleep targets; Workouts, Programs, Muscle Analytics, Gyms directory; coach profile; transformation consent flow with face blur, withdrawal, and export.

## Phase 6 — Billing and entitlements (1–2 weeks)

RevenueCat + Google Play Billing with webhook → DB entitlements; Razorpay Subscription links + webhook for coaches; plan limits as settings; server-side gating (free / paid / coached, AI hidden for coached); account export and deletion.

## Phase 7 — AI features (3 weeks)

AI plan generation/adjustment from the library only, structured output + rule validation; AI meal plans; AI photo food logging (if a free vision model exists, else deferred); per-user daily caps, usage logging, "I can't help with that" for out-of-scope requests (no routing).

## Phase 8 — Hardening and closed beta (2–4 weeks)

Sentry (free tier); Play internal and closed testing tracks; 3–5 coaches for 2–4 weeks; fix, then public Play Store launch.

## Testing priorities

1. pgTAP RLS tests on every change
2. Billing/entitlement tests (purchase, renew, expire, refund, coach plan limits)
3. AI validation tests on fixed sample athletes
4. Manual checklist for core flows

## Work split

Builder 1: database, RLS, Edge Functions, billing, AI. Builder 2: app screens, logging UX, chat, notifications. Every phase ends with a build on a real Android phone.
