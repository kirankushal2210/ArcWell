# Arcwell — UI/UX Handoff

Written 2026-11-11 at the end of the product, wireframe and spec-sheet phase, so the visual UI/UX phase can start in a fresh session. Read this first, then the files it points to. **The files win over this summary** wherever they differ.

## 1. What Arcwell is

The founder's own fitness app, unrelated to Buzzly. One **Android** app for **India** combining training, nutrition and recovery, with two roles in the same app:

- **Athletes**
  - **Free:** 2–3 starter workouts, calorie-only food logging, physique tools (bodyweight, measurements, photos, charts). No Recovery, no AI.
  - **Arcwell Plus:** paid through Google Play, with a 7-day trial and then a hard paywall. Adds AI training plans and meal plans, full macros, AI photo food logging, Recovery and Pro tools.
  - **Human-coached:** pay nothing and get Pro tools plus whatever their coach assigns. **They never see AI.**
- **Coaches:** a client-management tool replacing WhatsApp and Excel. They pay a monthly fee through Razorpay, outside the app. One coach per athlete; athletes join through the coach's invite link. No marketplace and no certificate checks in v1.

Stack: Expo SDK 58 (React Native 0.88, TypeScript), Supabase, Amazon S3, Groq behind a swappable AI layer, RevenueCat for Google Play billing, Razorpay. The repo is at `/Users/kirankushal22/Desktop/arcwell`. The Phase 0 scaffold is in `app/` and `supabase/`. **No production UI code has been written yet.**

## 2. Where everything is

| File | What it is | Status |
|---|---|---|
| `docs/SPEC.md` | v1 scope, tiers, key rules, architecture | Current |
| `docs/DECISIONS.md` | **Decision log, D1–D46. Wins over every other doc.** | Current |
| `docs/DESIGN.md` | Principles, brand, information architecture, tokens (§5), components (§6), screen inventory (§7), decision log (§9) | Current |
| `docs/PLAN.md` | Build phases, pre-launch tasks | Current |
| `docs/design/sitemap.md` | Every v1 screen by role and tier | Current |
| `docs/design/wireframes/f1…f18*.html` | **199 low-fi wireframe screens**, shared `wireframe.css` | Complete; not reviewed screen by screen, not user-tested |
| `docs/design/spec-sheet.html` | **Visual design system**: tokens, type, spacing, radius, Lucide icons, every component, states, motion demos | Draft for founder review |
| `docs/design/design-prompt.md` | Design language block, negative list, 19 per-screen prompt cards (type, goal, tone, wireframe IDs, references), critique prompt, checklist | Current |
| `docs/design/references.md` | Real shipped-app references per area (Hevy, MacroFactor, WHOOP, Oura, TrueCoach, Trainerize, Linear, Strava…) | Current |
| `docs/design/brand-assessment.md`, `competitor-research.md`, `assets.md` | Research by Claude, not approved | Background |

Wireframe screen-ID prefixes:

| Prefix | Area |
|---|---|
| F1–F9 | Core flows |
| N | Today and side menu |
| AC | Account |
| R | Recovery |
| PH | Physique |
| AI | AI Coaching |
| CP | Coached Progress area |
| W | Waiting for a coach's plan |
| J / L | Joining / leaving a coach |
| K | Coach screens |
| T / TR | Training |
| G | Gyms |
| TL | Trial |
| CS | Coaching status |
| X / E | Extra and empty states |
| S | System states |
| U | Upgrade |

## 3. Decided design direction (do not re-open without the founder)

- **Navigation (D2, D2a, D2b, D23):**

  | User | Bottom bar |
  |---|---|
  | Free | Today · Training · Nutrition |
  | AI subscriber | Today · Training · Nutrition · Recovery · AI Coaching |
  | Human-coached | Today · Training · Nutrition · Recovery · Progress (Check-ins · Progress timeline · Chat) |
  | Coach | Clients · Check-ins · Plans · Messages · Business |

  A shared ☰ side menu: Account · Notifications · Training (Exercises, Workouts, Programs, History, Muscle Analytics) · Gyms · Physique.
- **Visual (D24):** dark charcoal, electric blue and cyan accents, minimal and premium. **Solid colours only: no gradients, no glows.** No streaks, XP, badges or confetti. Never red for a missed target.
- **Tokens (DESIGN.md §5, spec sheet):**
  - Backgrounds: bg `#111316`, surface `#191C21`, raised `#22262D`
  - Lines: border `#2D323A` (dividers), borderStrong `#6B7482` (control outlines)
  - Text: `#F2F4F7`, muted `#9AA4B2`
  - Brand: `#3D8BFF` (text on it `#04101F`); accent and Training `#22D3EE`
  - Pillars: Nutrition `#F5A524`, Recovery `#8B7CFF`
  - Status: success `#22C55E`, warning `#F59E0B`, danger `#EF4444`

  All main pairs pass WCAG AA.
- **Type:** Inter for everything (D46), with tabular numerals. Scale 32 / 22 / 18 / 16 / 14 / 12.
- **Spacing and shape:** 4 dp grid, grouped spacing. Radius 8 / 12 / 20 / full. Depth comes from surface steps, not shadows. Tap targets 48 dp. Material 3 conventions, never iOS patterns.
- **Icons:** Lucide only. Emoji in the wireframes (🔒 🔔) are placeholders.
- **Motion:**
  - Numbers roll when they change.
  - Timings: 120 ms micro, 200 ms standard, 280 ms sheets.
  - **One** 600 ms "big moment": the workout summary (ring fills, volume rolls up, new best slides in).
  - Skeleton loaders, never spinners. No animated background.
  - Instant transitions when "Remove animations" is on.
- **Copy:** Indian English, calm and plain ("Log set", not "Crush it!"). Indian foods and portions (katori, roti). kg and cm only. Realistic data, including long names.

## 4. The process we're following

The founder gave three sources. **Keep them separate.**

**A. Video 1, "Nessie" (motion):** rolling numbers; about a fifth of a second per animation; save the biggest animation for the biggest moment; skeletons instead of spinners; an optional slow background. Already applied in the spec sheet; the background was deliberately left out.

**B. Video 2, "nostalgic memory app" (process):**
1. **Spec sheet first.** Every colour, font, spacing step, radius and component, normalised before screens. **Done** (`spec-sheet.html`), apart from check-in form fields and the photo slot, which aren't in it yet.
2. **Inspiration:** a Pinterest mood board for the feeling, and **Mobbin** for real screens from apps in the same niche.
3. **Build:** Claude Code (the video also uses Paper MCP, which isn't connected) to lay out screens, with the **Mobbin MCP** to check designs against reputable apps. Craft every screen one by one, thoroughly.

**C. Substack, Nelson Lee, "I designed 87 app screens without Figma"** (only steps 1–2 are public; 3–5 are paywalled):
1. **Lock the brand first:** logo, colours, typeface and **illustration style** before any screen. Save Mobbin or Refero references and give them to Claude with the brand board. **Have Claude state its rules back before designing** (which colour does which job, the type scale, where illustrations may appear).
2. **Explore three directions side by side** on one canvas, then choose.

Also see the PDF guide "Designing UI without the slop", already folded into `design-prompt.md`:
- AI-assisted, not AI-generated.
- Each prompt names the platform, screen type, user goal and tone.
- A negative list.
- Real references for every screen.
- 3–5 variations, then a "What's wrong with this UI?" critique.
- Contrast, tap-target and text-scaling checks.

## 5. Next steps, in order

1. **Mobbin.** The founder is connecting it (`claude mcp add mobbin --scope user --transport http https://api.mobbin.com/mcp`, then signing in). Confirm the Mobbin tools are available in the new session. If they aren't, use `references.md`.
2. **Close the brand gaps (Substack step 1):**
   - **Logo / wordmark:** the founder has nothing in mind; it **must reflect the app's theme**. Arcwell means a transformation *arc* plus health and recovery (*well*); the mood is calm, competent and premium; the colours are charcoal with electric blue and cyan. Draft **3 wordmark directions** in those colours for the founder to choose from. Don't treat any as approved.
   - **Illustration rule:** proposal is no illustrations, only Lucide icons and real photos, which fits the minimal direction; the alternative is a simple line style for empty states. The founder decides.
   - Then **state the brand rules back** before any screen design.
3. **Three directions side by side (Substack step 2):** draw the **Today** screen three ways on one page, grounded in 2–3 Mobbin references and the spec sheet. The founder picks one, and it sets the look for every other screen.
4. **Screen by screen (Video 2 step 3):** start with Today, then Active workout, then Food day log (design-prompt.md cards 1–3), then the rest. For each screen:
   - pull references
   - follow the wireframe
   - make 3–5 variations and combine the best parts
   - run the critique
   - check contrast, 48 dp targets and 130% text
   - record it in DESIGN.md §7 (Mockup column)
5. Later: build tokens in `app/src/theme/` and components in `app/src/components/`, then usability tests (PLAN.md).

Open items that are not design blockers are listed in PLAN.md:
- Coach Terms legal review
- Groq data terms
- Indian portion gram weights
- invite domain
- Play prices
- sleep-score formula
- gym data source

DECISIONS.md D25–D45 are **defaults chosen by Claude**, applied at the founder's request; the founder still needs to review them.

## 6. How to work with this founder

- Ask focused questions in **small batches** and keep reports concise.
- **Never infer approval.** Earlier blanket "yes" answers don't approve later work. Mark new screens "draft, not approved or user-tested". If documents disagree, flag it instead of picking one.
- **Don't expand the scope**, and don't present your own suggestions as requirements.
- **Commit only when asked.** Check that no secrets, `.env` files, `node_modules` or `.DS_Store` files are staged. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. There's no GitHub remote yet, so everything is local on `main`.
- The founder's email is private; never send it to outside services.
- The founder sometimes writes "Grok" and means **Groq**.

## 7. Tooling notes

- Headless Chrome isn't installed, and the browser pane can't screenshot `file://` pages. To render HTML, use Playwright from the Buzzly repo:
  - Write a temporary `.tmp-shot.mjs` in `/Users/kirankushal22/Desktop/Buzzly-website`, run it with `node`, then delete it.
  - Don't touch Buzzly's tracked files, including its `.claude/launch.json`.
- Checks used so far:
  - no horizontal overflow at phone widths of 280, 250 and 220 px
  - pinned buttons never overlap the bottom bar
  - bottom bars match the allowed sets per tier
  - no Recovery on free screens
  - no open-decision boxes
  - contrast computed with the WCAG formula
- External scripts in HTML: Google Fonts (Inter) and `unpkg.com/lucide@0.460.0` are used in the spec sheet.
