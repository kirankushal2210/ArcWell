# 01 · Product Requirements Document (PRD)

**Product:** Arcwell · **Version:** v1 (Android, India) · **Updated:** 14 November 2026 (to decision D108)
**Owner:** Founder · **Status:** source of truth for *what* we build and *why*. Change this document before changing scope in code.

This replaces `docs/SPEC.md` as the scope document (SPEC stays as history). Every decision referenced as D-number is in [DECISIONS.md](../DECISIONS.md).

---

## 1. What we are building

One Android app that brings **training, nutrition and recovery** together, with two sides in the same app:

- **For coaches:** a coaching platform and CRM. It replaces WhatsApp plus Excel: plans, check-ins, chat, client lifecycle and the business pipeline in one place.
- **For athletes:** a science-based tracker that coached clients use free, plus an optional paid AI coach (**Arcwell Plus**) for people who don't want a human coach.

**Tagline (draft):** "Training, nutrition and recovery, coached as one."

## 2. Why Arcwell exists (the problem)

| Who | Today | The pain |
|---|---|---|
| Indian online coaches (Instagram, WhatsApp) | Plans in Excel or PDF, check-ins as chat photos, payments tracked by hand | Hours a week chasing clients and copy-pasting plans; scattered data; looks unprofessional; clients churn |
| Their clients | Plans buried in chat, food logging built for Western food | Not sure what to do today; tedious logging of dal, roti and katori portions; low accountability |
| Self-guided gym-goers | Generic apps, "bro science", copy-paste ChatGPT plans | No plan that adapts to them; no trustworthy guidance at an Indian price |

**Why us:**
- Built for Indian food, portions and prices from day one.
- Everything is evidence-based: every target and rule cites PubMed-checked research (D69).
- The coach and the client work in one app, free for the client.

## 3. Who it is for

| Persona | Description | What they must be able to do easily |
|---|---|---|
| **Coach "Joseph"**, 29, Bengaluru | 40 online clients, Instagram-led, WhatsApp plus Excel | Add a client in under 5 minutes, build and assign plans, review check-ins in under 2 minutes each, chat, see who needs attention, run the business pipeline |
| **Coached athlete "Priya"**, 26, Pune | Pays a coach to lose fat and get stronger | Know today's workout and food, log a set in 2 taps, log Indian meals fast, send a weekly check-in, chat with the coach |
| **Self-guided athlete "Meera"**, 24 | Trains alone, can't afford a coach | Get a plan built from her answers, log, and pay a small fee for an AI coach that adapts |
| **Free athlete** | Trying the app | Templates, basic logging, bodyweight and photos, with no paywall nagging |

Market: **India first**, English at launch (layouts allow Hindi later), **Android only** at launch. Compliance: India's DPDP Act, 2023.

## 4. Tiers and pricing

| Tier | Pays | Gets |
|---|---|---|
| Free athlete | ₹0 | Starter templates, logging, food by search (calories), bodyweight, measurements, photos, charts. No Recovery, no AI. |
| **Arcwell Plus** (self-guided) | Monthly or yearly through Google Play (RevenueCat), 7-day trial | Full macros, Recovery, programs, the AI coach (chat, tailor today, weekly review), AI meal scan, meal-plan and plan builders |
| Coached athlete | ₹0 | Plus tools without AI, plus the coach's training, nutrition and recovery plans. **AI is never shown, and the server enforces it (D44).** |
| Coach | Monthly fee through Razorpay, outside the app. Price set after beta; client limit is a setting (default 40). | Clients, plans, templates, check-ins, chat, CRM, coach profile, invites |

## 5. Product principles

1. **Logging in seconds:** the common actions take one or two taps, pre-filled from last time.
2. **One thumb, sweaty hands:** main actions sit in the bottom half; tap targets are at least 48 dp.
3. **Today first:** every role opens on what needs doing today.
4. **Science only:** no junk volume, no bro science, every target has a "Why this?" with sources (D69).
5. **Never show what you can't use:** coached athletes never see AI, and locked features appear only at natural moments.
6. **Honest numbers:** trends, not shaming, and no fake precision.
7. **Privacy by default:** a coach sees a client only while linked and only from the join date (unless the athlete shares earlier history); the athlete owns their data.

## 6. v1 scope (what's in)

**Athlete**
- **Onboarding:**
  - five sections, one question per screen (D52);
  - the plan is ready before sign-up (D57);
  - sign-up by email code (Google sign-in later);
  - consent for health data, AI and photos;
  - 18+ only (D106).
- **Today:** the coach's message, the check-in due, morning habits and cortisol curve, up next, nutrition and recovery summaries, and the + quick log.
- **Training:**
  - Hypertrophy, Race (when a HYROX goal is set) and Endurance tabs;
  - workout logger with RPE per set, rest timer and plate maths;
  - templates and the Coach plan / Arcwell plan (D105);
  - exercise library (~440);
  - progressive overload view; cardio fitness (VO2 max); HYROX race tools.
- **Nutrition:**
  - IFCT 2017 plus curated Indian and tier-1 city foods, in Indian portions;
  - macros and fibre (D103) and food quality;
  - meal plans with "Ate this";
  - AI meal scan (Plus).
- **Recovery (Plus and coached):** Sleep, Recovery and Strain, morning check-in, sleep planner, protocols, habits; devices through Health Connect (needs a development build).
- **Progress:** weight, measurements and photos; check-ins and coach replies; chat.
- **AI coach (Plus only):** chat, tailor today and weekly review on the server with guardrails (D108); today's chat is kept on the phone only and clears at midnight (D109); plan builder and meal-plan generator (rules).
- **Account:**
  - privacy and permissions; history sharing with the coach;
  - export my data; delete account;
  - notifications; legal pages (D106).

**Coach**
- **Onboarding:** profile, services, first template (Arcwell starter, from scratch, or imported from a spreadsheet), invite link.
- **Clients:** "Needs attention", adherence from logs, client profile with overview, training, nutrition and recovery, and status (active, paused, leaving, completed).
- **Adding a client:** add them before they join, build all three plans, and send a personal invite carrying the plans (D56). There's also a general invite link for walk-ins.
- **Plans:**
  - templates, the plan builder with RPE targets and run, erg and station blocks (D104);
  - meal plans, recovery protocols;
  - supplement stacks, and Enhanced tracking for competitive bodybuilders with the athlete's consent (D64).
- **Check-ins and messages:** weekly check-ins with review and reply; live chat with photos and PDFs.
- **Business:** CRM with leads, Instagram leads, calls, conversion, accounts and renewals (D63, D66); transformation requests that the athlete approves.

**Platform**
- Accounts, sync and access rules on Supabase (D107).
- Billing webhooks for RevenueCat and Razorpay.
- Push notifications for message, check-in due, check-in submitted, reply, plan assigned and daily workout.

## 7. Out of scope for v1

- **Platforms and channels:** iOS; coach web dashboard; admin app (use the Supabase dashboard); marketplace or coach discovery.
- **Content and features:**
  - video of any kind;
  - barcode scanning;
  - journalling, grief and personal-growth tools;
  - supplement or nootropic suggestions (D75);
  - jet-lag mode;
  - lb units;
  - full offline mode (only the workout in progress and recent data stay on the phone);
  - wearable APIs other than Health Connect.
- **Accounts:** phone OTP login; coaching teams.
- **Trust checks:** certificate checks (certifications are self-reported).

v1.1 candidates are listed under D45 in DECISIONS.md.

## 8. Key rules (must always hold)

1. One coach per athlete at a time. A personal invite is single-use and expires in 14 days.
2. A coach sees a client's data only while linked and only from the join date, unless the athlete shares earlier history. Access ends the moment the link ends.
3. When coaching ends, the athlete keeps all their history and the coach's plan, read-only, and becomes a free athlete.
4. Transformation photos: the coach asks, the athlete approves (optional face blur) and can withdraw any time.
5. Consent is recorded per purpose (health data, AI, photos). Declining AI or photos never blocks anything else.
6. AI and all privileged actions run on the server. Plus users have daily caps. Out-of-scope questions are declined (D22).
7. A lapsed coach can't invite or change plans (D41); a full coach can't take new clients (D40). Existing clients are never affected.

## 9. Success metrics

**Launch gate (definition of done for v1)**
- 3 to 5 real coaches run all their clients on Arcwell for 2 to 4 weeks with:
  - no lost workout or chat data;
  - no coach able to see another coach's clients;
  - check-ins, chat and plans working end to end;
  - Arcwell Plus purchasable through Google Play.
- Automated tests cover the access rules and billing.

**Business KPIs (targets to confirm after beta)**

| Area | Metric | First target |
|---|---|---|
| Coaches | Coaches active weekly; clients per coach; check-ins reviewed within 48 h; retention after beta | 80% of beta coaches convert to paid |
| Coach speed | Time to onboard a client; time to review a check-in | under 5 min; under 2 min |
| Athletes | Retention at day 7 and day 30; workouts and meals logged a week | D30 ≥ 35% |
| Revenue | Free → Plus conversion; Plus 30-day retention | ≥ 4%; ≥ 60% |
| Quality | Crash-free sessions; cross-coach data incidents | > 99.5%; zero |

## 10. Release plan

1. **Now (free):**
   - front end complete;
   - backend B1 to B8 on the local stack;
   - investor demo ([DEMO.md](../DEMO.md)).
2. **After funding:**
   - company registration; Supabase Pro in Mumbai; Play Console and RevenueCat; Razorpay live; domain and email;
   - legal review; content reviews by a sports scientist and a dietitian;
   - exercise media licence.
3. **Beta:** Play closed testing with 3 to 5 coaches for 2 to 4 weeks against the launch gate.
4. **Launch:** India only on Google Play.

The steps and costs are in [LAUNCH_ROADMAP.md](../LAUNCH_ROADMAP.md).

## 11. Assumptions and risks

| Risk | Mitigation |
|---|---|
| Exercise media licence cost | Openly licensed stills as fallback |
| Free AI model quality and terms (Groq) | Rules engine as guardrail and fallback (D108); provider swappable by config |
| Health data and AI under DPDP | Only week-level numbers go to the AI; consent per purpose; data in Mumbai |
| Android only leaves out iPhone clients | iOS after funding (Expo makes it a build, not a rewrite) |
| Thin regional Indian food data | IFCT plus curated dishes; "My foods"; nutrition reviewer |
| "Arcwell" trademark outside India; "HYROX" is a trademark | IP India search before branding spend; HYROX used only to describe the race (D76) |
| Two-person team | Strict scope (section 7), with guardrails for AI coding agents ([AGENTS.md](../../AGENTS.md)) |

## 12. The other product documents

| # | Document |
|---|---|
| 02 | [Technical requirements](02-TECH-REQUIREMENTS.md) |
| 03 | [App flow](03-APP-FLOW.md) |
| 04 | [UI/UX design brief](04-DESIGN-BRIEF.md) |
| 05 | [Backend schema](05-BACKEND-SCHEMA.md) |
| 06 | [API integrations](06-API-INTEGRATIONS.md) |
| 07 | [Security and access](07-SECURITY-ACCESS.md) |
| 08 | [AI guardrails and rules](../../AGENTS.md) (the rule file every agent reads) |
| 09 | [Feature tickets](09-FEATURE-TICKETS.md) |
| 10 | [Deployment and testing runbook](10-DEPLOYMENT-RUNBOOK.md) |
