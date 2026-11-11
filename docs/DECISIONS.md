# Arcwell — Decision Log

Decisions confirmed by the founder during the wireframe review (started 2026-11-11). **Confirmed** entries are requirements. Earlier approvals (before this review) are provisional unless listed here.

SPEC.md, DESIGN.md, the sitemap and the wireframes were updated to match on 2026-11-11. This file wins wherever they disagree.

Wireframe status: **all v1 screens drawn (F1–F18); none reviewed screen by screen or tested with users.**

There are two sources of decisions:

- **Founder** (D1–D12, and D13–D24 from the founder's "Executive Defaults" on 2026-11-11).
- **Default** (D25–D45). The founder told Claude to finish the wireframes without further questions. Where the founder's list didn't cover an open item, Claude chose a conservative default. These are applied so the wireframes are complete, but the founder did not pick them individually. **Review them before the build.**

## Confirmed — founder

| # | Date | Decision |
|---|---|---|
| D1 | 2026-11-11 | The original brief defines six athlete areas: Home, Training, Nutrition, Recovery, Progress, Coaching. |
| D2 | 2026-11-11 | **Bottom bar, AI-coached athletes:** Today · Training · Nutrition · Recovery · AI Coaching |
| D2a | 2026-11-11 | **Bottom bar, human-coached athletes:** Today · Training · Nutrition · Recovery · Progress, where Progress is the combined Check-ins · Progress · Chat area (D11). The Progress switch is the check-in timeline (D16). |
| D2b | 2026-11-11 | **Free users have no Recovery button**, and no extra tabs are invented to fill space (free bar: Today · Training · Nutrition). |
| D2d | 2026-11-11 | **Today:** the drawn layouts N-01 to N-03 are final for v1 (from D23). |
| D4 | 2026-11-11 | **Recovery covers sleep / sleep score, soreness and fatigue only.** No stretching or mobility routines. Sleep score shown as a 0–100 dial (D18). |
| D5 | 2026-11-11 | **Free access:** 2–3 workout templates, calories-only nutrition, plus bodyweight, measurements, progress photos and charts. |
| D5a | 2026-11-11 | **AI coaching and Recovery are paid features.** Recovery is hidden entirely for free users and appears with the relevant access. |
| D6 | 2026-11-11 | **One-week AI trial.** Billing and trial end: D17. |
| D7 | 2026-11-11 | **Joining a human coach:** the coach's guidance replaces active training, nutrition and recovery guidance. |
| D7a | 2026-11-11 | **AI subscriber switching to a coach:** includes an explicit subscription-cancellation step; never automatic. Cancellation and refunds happen in Google Play (D19). |
| D7b | 2026-11-11 | **Leaving a coach:** the coach-provided plan stays usable, read-only (D21). |
| D7c | 2026-11-11 | Replacing active guidance **never deletes previous logs or history.** |
| D8 | 2026-11-11 | **AI permission asked at sign-up and again at first AI activation/use**, each explaining its purpose. Declining never blocks non-AI features. Revoking: D20. |
| D9 | 2026-11-11 | **Shared side menu (☰)** for all athletes: Account · Notifications · Training (Exercises, Workouts, Programs, History, Muscle Analytics) · Gyms · Physique (Bodyweight, Measurements, Photos, Charts). *Amended by D14: Set Videos removed.* |
| D10 | 2026-11-11 | **Pro tool access** for AI subscribers and human-coached athletes. Coached athletes need no AI subscription and are never shown AI coaching. Free access per menu item: D13. |
| D11 | 2026-11-11 | **Human-coached combined area** (Check-ins / Progress / Chat): athletes submit their own check-ins and talk to their coach; they never see the coach's review or management tools. They can see their past check-ins and feedback (D16). |
| D12 | 2026-11-11 | **Optional photo consent never prevents submitting a check-in** without photos; permission is requested when relevant. |
| D13 | 2026-11-11 | **Workouts vs Programs.** Programs are multi-week containers; Workouts are standalone sessions. Free: Workouts (templates only) and History. Pro only: Programs and Muscle Analytics. |
| D14 | 2026-11-11 | **No video in v1.** Set Videos is removed from the side menu and every screen, in line with SPEC (no video attachments). |
| D15 | 2026-11-11 | **Gyms** is a read-only map / directory view. |
| D16 | 2026-11-11 | **Coached Progress area:** a timeline of past check-ins and coach feedback the athlete can open. |
| D17 | 2026-11-11 | **Trial end:** standard 7-day trial into a hard paywall. If unpaid, the user reverts to Free (Recovery tab hides). |
| D18 | 2026-11-11 | **Sleep score:** standard 0–100 dial. |
| D19 | 2026-11-11 | **Refunds** are handled entirely outside the app; the app shows a generic "Manage subscription in Play Store" state. |
| D20 | 2026-11-11 | **Revoking AI permission** hides AI features immediately but leaves the trial / subscription active in the background. |
| D21 | 2026-11-11 | **Leaving a coach:** the user reverts to Free. Recovery tab hidden. Plans become read-only. |
| D22 | 2026-11-11 | **Out-of-scope AI requests** show a standard "I can't help with that" state. No routing to coaches (no marketplace). Replaces SPEC's earlier "routed to coaches". |
| D23 | 2026-11-11 | **Navigation is final:** coach tabs Clients · Check-ins · Plans · Messages · Business; Today layouts N-01 to N-03. |
| D24 | 2026-11-11 | **Visual direction:** dark charcoal backgrounds, electric blue / cyan accents, minimal premium UI (from the founder's Bulky AI prompt). The green palette is dropped. No streaks or XP. |

## Applied defaults — chosen by Claude, review before build

| # | Topic | Default applied |
|---|---|---|
| D25 | Free access to Exercises and Gyms | Free. Free workouts need exercise detail; Gyms is read-only. |
| D26 | Custom workouts | Pro users can create their own workouts (TR-03). Free users can't edit templates or build workouts. |
| D27 | Free "starter programme" wording | Renamed "starter workouts" (2–3 templates), because Programs are Pro (D13). |
| D28 | Muscle Analytics content | Weekly sets per muscle group from logged workouts. Pro only. |
| D29 | Gym data | Directory listing only: name, area, distance, equipment tags. Data source chosen at build time; location permission optional (city search works without it). |
| D30 | Sleep score formula | Computed from sleep hours and sleep quality; exact formula set at build time. No wearables. |
| D31 | Coach recovery controls | Coach sets a nightly sleep target and an optional recovery note per client; shown on the athlete's Recovery screen. |
| D32 | Recovery history after paid access ends | Kept but hidden; returns on resubscribing or joining a coach. |
| D33 | AI plan after paid access ends | Stays usable as a read-only plan; stops adapting (F8-08). |
| D34 | Trial reminder | In-app card and push on day 5, before Google Play charges on day 7. |
| D35 | AI consent "Not now" (F8-03, before purchase) | Returns to the paywall; no trial starts. |
| D36 | Deleting an athlete account with an active subscription | Shown a "Cancel in Play Store first" step (D19). |
| D37 | Earlier history access | One switch, "Share my history from before I joined", off by default, can be turned off any time (AC-10). |
| D38 | Photo approvals when leaving a coach | The athlete is asked at leave time: keep approved photos shared, or withdraw them. They can still withdraw later (F9-06). |
| D39 | Client status effects | Paused: plan, chat and coach access stay; check-ins and reminders pause. Leaving: everything continues until the end date, with a banner. Completed: same as the athlete leaving (D21). |
| D40 | Coach client limit | When at the limit, the invite page says the coach isn't taking new clients; existing clients unaffected. |
| D41 | Coach billing lapsed | 7-day grace, then the coach can't invite clients or assign or edit plans until paid. Clients are unaffected; chat and check-ins continue. |
| D42 | Deleting a coach account | All clients revert to Free as if they had left (D21) and are notified; their history stays with them. |
| D43 | Coach profile audience | Shown only on the coach's invite page (F3-02) and to the coach's own clients. |
| D44 | Roles, sign-up and onboarding | One role per account in v1; the role is chosen before sign-up. Invite sign-ups skip the AI permission step (coached athletes never see AI). Sex is an optional onboarding question (for calorie estimates). Coached athletes answer the standard onboarding; no custom coach intake in v1. No trial offered during onboarding. |
| D45 | Smaller v1 scope choices | Units are kg only in v1 (lb later). Check-in questions as drawn in F6-04 (no custom questions in v1). Coached swaps are "today only" with the coach notified; no coach exercise lock. Effort is rated per workout, not per set. Timed and bodyweight sets are in v1 (TR-08); supersets later. No chat with leads (leads are contacted outside the app). Foods: verified plus personal only (no crowd database). Tier name "Arcwell Plus"; price set in Play Console. Section names as drawn (D3). Low adherence means under 60%. No reply-time promise for coaches. Arcwell branding stays on photo exports. DESIGN.md §0 working decisions adopted as stated. The logo is designed in the mockup stage, not the wireframes. |

**Moved to v1.1 by D45:** summary share card, saved replies, voice notes, coach custom check-in questions, recipe builder, copy-from-yesterday meals, allergies field, spreadsheet import, invite-link open counts, export branding removal, supersets, lb units.

## Not design decisions (tracked in PLAN.md)

These need outside input and don't block the wireframes: Coach Terms legal review; Groq data terms for AI photo wording; standard gram weights for Indian portions (nutrition reviewer); invite-link domain; Play prices; sleep-score formula details; gym data source.
