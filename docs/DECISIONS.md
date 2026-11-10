# Arcwell — Decision Log

Decisions confirmed by the founder during the wireframe review (started 2026-11-11). **Confirmed** entries are requirements. **Pending** entries are open and must not be treated as decided. Earlier approvals (before this review) are provisional unless listed here.

SPEC.md, DESIGN.md, the sitemap and the wireframes were updated to match D1–D12 on 2026-11-11. This file wins wherever they disagree.

Wireframe status: **drawn only.** No screen has been reviewed and approved by the founder, and none has been tested with users.

## Confirmed

| # | Date | Decision | Still open |
|---|---|---|---|
| D1 | 2026-11-11 | The original brief defines six athlete areas: Home, Training, Nutrition, Recovery, Progress, Coaching. SPEC.md's earlier "five plus coaching" wording was an interpretation. | — |
| D2 | 2026-11-11 | **Bottom bar, AI-coached athletes:** Today · Training · Nutrition · Recovery · AI Coaching | — |
| D2a | 2026-11-11 | **Bottom bar, human-coached athletes:** Today · Training · Nutrition · Recovery · Progress, where Progress is the combined Progress / Check-ins / Chat area (D11). | Contents of the Progress switch inside it |
| D2b | 2026-11-11 | **Free users have no Recovery button**, and no extra tabs are invented to fill space (free bar: Today · Training · Nutrition). | — |
| D4 | 2026-11-11 | **Recovery covers sleep / sleep score, soreness and fatigue only.** No stretching or mobility routines; nothing else added without discussion. | Sleep-score formula; coach recovery controls |
| D5 | 2026-11-11 | **Free access:** 2–3 workout templates, calories-only nutrition, plus bodyweight, measurements, progress photos and charts. | — |
| D5a | 2026-11-11 | **AI coaching and Recovery are paid features.** Recovery is hidden entirely for free users and appears with the relevant access. | Recovery history when paid access ends |
| D6 | 2026-11-11 | **One-week AI trial.** | Billing at trial end; what happens when it ends |
| D7 | 2026-11-11 | **Joining a human coach:** the coach's guidance replaces active training, nutrition and recovery guidance. | What a coach sets for recovery |
| D7a | 2026-11-11 | **AI subscriber switching to a coach:** includes an explicit subscription-cancellation step; never automatic. | Refund of unused paid time; server-side cancel vs Google Play (proposal pending) |
| D7b | 2026-11-11 | **Leaving a coach:** the coach-provided plan remains usable. | Edit rights; Recovery access after leaving; photo approvals |
| D7c | 2026-11-11 | Replacing active guidance **never deletes previous logs or history.** | — |
| D8 | 2026-11-11 | **AI permission asked at sign-up and again at first AI activation/use**, each explaining its purpose. Declining never blocks non-AI features. | Decline behaviour for an active trial/subscription; whether invite sign-ups see the sign-up step |
| D9 | 2026-11-11 | **Shared side menu (☰)** for all athletes, supplementing the bottom bar, with expandable groups: Account · Notifications · Training (Exercises, Workouts, Programs, History, Set Videos, Muscle Analytics) · Gyms · Physique (Bodyweight, Measurements, Photos, Charts). Physique tools live here for everyone (resolves former D2c). | What Set Videos, Muscle Analytics and Gyms do; Workouts vs Programs |
| D10 | 2026-11-11 | **Pro tool access** for AI subscribers and human-coached athletes. Coached athletes need no AI subscription and are never shown AI coaching. The reference screenshot's paid restrictions are not copied. | Free access to Exercises, Workouts, History, Set Videos, Muscle Analytics, Gyms |
| D11 | 2026-11-11 | **Human-coached combined area** (Check-ins / Progress / Chat): athletes submit their own check-ins and talk to their coach; they never see the coach's review or management tools. | Whether athletes can view past submissions and feedback |
| D12 | 2026-11-11 | **Optional photo consent never prevents submitting a check-in** without photos; permission is requested when relevant. | — |

## Pending

| # | Decision |
|---|---|
| D2d | Exact contents of Today (current Today screens N-01 to N-03 are proposals) |
| D3 | Final section names (all labels are working names) |
| — | Coach navigation (Clients · Check-ins · Plans · Messages · Business is a proposal) |

## Open items (for discussion, not decided)

- Free access to the Training menu items other than Programs, and to Gyms.
- Behaviour of Set Videos (video is out of v1 in SPEC.md), Muscle Analytics, Gyms; Workouts vs Programs.
- Contents of the coached Progress switch (same as Physique, or coach-specific).
- Past check-ins and coach feedback visibility for athletes.
- Sleep-score formula without wearables; what a coach sets for recovery.
- Trial billing and trial end; refund of unused paid time when joining a coach.
- AI permission decline effects on an active trial/subscription; invite sign-ups and the sign-up AI step.
- After leaving a coach: edit rights, Recovery access and history, photo approvals.
- Client status effects (paused, leaving, completed) on the athlete side; coach client limits and lapsed coach billing.
- Where out-of-scope AI goals are sent (no marketplace in v1); coach profile audience.
- From earlier review: sex question in onboarding, check-in rating questions, role order and role switching, intake questions, trial offered during onboarding, certifications field, coached athletes' swap/edit rules, tier name and price.
