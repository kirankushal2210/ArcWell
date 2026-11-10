# Arcwell — Implementation Plan

Rough estimates assume two builders using AI tools heavily. Total ≈ 18–24 weeks. Phase 7 can run in parallel with Phases 5–6.

## Pre-build blockers (no code, clear in parallel)

- [ ] Exercise demo media: confirm commercial licence (fallback: openly licensed stills)
- [ ] IFCT 2017: confirm usage rights; get it into machine-readable form
- [ ] Groq: current free models, rate limits, data retention, vision support
- [ ] Accounts: Google Play Console, Supabase (staging), AWS (S3), Expo, Razorpay (business KYC)
- [ ] Privacy policy + DPDP consent text (health data, AI, photos, coach access)
- [ ] IP India trademark search for "Arcwell" (software and fitness classes)
- [ ] Confirm Android package name before first Play upload (currently `com.arcwell.app`; permanent once published)

## Phase 0 — Setup (~1 week)

- [x] Repo with `app/` (Expo SDK 58, TypeScript, Expo Router) and `supabase/`
- [x] Supabase local config, migrations/tests/seed structure, pgTAP smoke test
- [x] AI provider interface (Groq first), secrets template
- [x] Lint, typecheck, CI (app, database tests, Edge Functions typecheck)
- [ ] Create GitHub repo and push
- [ ] Create staging Supabase project and link it
- [ ] EAS project + Android preview build profile

## Design phase — UI/UX foundations (1–2 weeks, before Phase 1)

Everything design-related lives in [DESIGN.md](DESIGN.md); mockups in `docs/design/`.

- [x] DESIGN.md: principles, brand, app structure per role, draft tokens, component list
- [ ] Confirm working assumptions (DESIGN.md section 0)
- [ ] Wireframes for core flows F1–F9
- [ ] Finalise tokens (incl. light theme) and build them in `app/src/theme/`
- [ ] Build core components in `app/src/components/`
- [ ] High-fidelity mockups for the 5–6 most important screens

After this, every phase starts by designing its screens with these components before writing code.

## Phase 1 — Foundations (2–3 weeks)

Auth (Google + email), role choice, onboarding; core tables with RLS on every table plus pgTAP tests for coach isolation, join-date visibility and revocation on leave; S3 signed-URL upload function with client-side compression; role-based app shell.

## Phase 2 — Coach ↔ client core (3 weeks)

Invite links (Android App Links) auto-linking client to coach; exercise library seed + browse/search/detail; plan builder (templates, assign, customise); Hevy-style workout logging with local caching of the in-progress workout; coach dashboard, client profile, client lifecycle.

## Phase 3 — Nutrition (2–3 weeks)

IFCT + curated dishes import with Indian portions; food search and logging (calories-only for free, full macros for paid/coached); coach fixed-meal plans and adherence.

## Phase 4 — Check-ins, chat, notifications (2–3 weeks)

Weekly check-ins (fixed form, coach-set day, photos, text reply); realtime chat with image/PDF attachments; the six notifications incl. scheduled check-in reminders; lead tracking.

## Phase 5 — Progress, recovery, transformations (2 weeks)

Measurements, photos, trends; recovery logs (paid + coached only); coach profile; transformation consent flow with face blur, withdrawal, and export.

## Phase 6 — Billing and entitlements (1–2 weeks)

RevenueCat + Google Play Billing with webhook → DB entitlements; Razorpay Subscription links + webhook for coaches; plan limits as settings; server-side gating (free / paid / coached, AI hidden for coached); account export and deletion.

## Phase 7 — AI features (3 weeks)

AI plan generation/adjustment from the library only, structured output + rule validation; AI meal plans; AI photo food logging (if a free vision model exists, else deferred); per-user daily caps, usage logging, routing out-of-scope goals to coaches.

## Phase 8 — Hardening and closed beta (2–4 weeks)

Sentry (free tier); Play internal and closed testing tracks; 3–5 coaches for 2–4 weeks; fix, then public Play Store launch.

## Testing priorities

1. pgTAP RLS tests on every change
2. Billing/entitlement tests (purchase, renew, expire, refund, coach plan limits)
3. AI validation tests on fixed sample athletes
4. Manual checklist for core flows

## Work split

Builder 1: database, RLS, Edge Functions, billing, AI. Builder 2: app screens, logging UX, chat, notifications. Every phase ends with a build on a real Android phone.
