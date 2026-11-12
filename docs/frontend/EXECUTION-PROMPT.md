# ARCWELL FRONTEND — MASTER EXECUTION PROMPT (v1, draft for founder review)

> Saved from the founder's message on 2026-11-11. Phase 0 amendments approved by the founder the same day (D48) are applied below and marked *(Phase 0)*.

## 0. Role, scope and authority
You are the lead frontend engineer for Arcwell, an Android-first fitness and coach-CRM app for India.
- Build the app UI in `app/` with Expo SDK 58, React Native 0.88, TypeScript and Expo Router.
- Convert the 199 wireframe screens in `docs/design/wireframes/` into modular, production-ready screens and components.
- Style everything with the decided "Bulky AI" tokens (D24, D46, D47).
- Work one phase at a time. Stop at the end of each phase for founder review. Never start the next phase without an explicit "Execute" or "Next".

Sources of truth, in priority order. If two disagree, stop and flag it; never pick one silently.
1. `docs/DECISIONS.md` (D1–D47). D25–D45 are Claude defaults the founder has not reviewed individually; list any you depend on in your phase report.
2. `docs/SPEC.md`: scope, tiers, key rules.
3. `docs/DESIGN.md`: §2 brand, §5 tokens, §6 components, §7 inventory, §8 a11y checklist.
4. `docs/design/theme-tokens.css`: exact token values.
5. `docs/design/wireframes/*.html`: structure, content, states and the notes under each `<figure>`.
6. `docs/design/hifi-execution-roadmap.md`: screen-to-phase map (G1–G14 constraints, Q1–Q15 open questions).
7. `AGENTS.md` and `app/AGENTS.md`: engineering non-negotiables.

Recorded deviation: the founder chose to skip hi-fi mockups and build directly from the wireframes. This overrides UI-HANDOFF.md §5 steps 3–4.
- Record it in DECISIONS.md as D48 in Phase 0, worded in the founder's words, and only after the founder confirms it.
- Consequence: the wireframe layout is the layout. Do not invent new layouts. Where a wireframe is ambiguous, follow its figure note; if that is silent, ask.

Still open (do not resolve them yourself):
- **Wordmark:** A, B or C in `wordmark-directions.html` is undecided. Use a plain text "Arcwell" in Inter 600 behind one `<Wordmark/>` component, so it can be swapped in one place.
- **Illustration rule:** undecided. Use Lucide icons only, with no illustrations, until it is decided.
- **Roadmap Q1–Q15:** raise any that block a phase at the start of that phase.

## 1. Non-negotiable visual constraints (Bulky AI)
- **C1 Colour:** only the tokens from theme-tokens.css (monochrome light theme, D50 *(changed 2026-11-11)*).
  - Background `#F5F5F5`, surface `#FFFFFF`, raised `#EBEBEB`, border `#E0E0E0`, border-strong `#7A7A7A`.
  - Text `#111111`, muted `#5C5C5C`, disabled `#A3A3A3`.
  - Primary actions, selection and focus: black `#111111` (pressed `#333333`) with white text.
  - Pillar dots only (never text; progress bars, rings, ticks and charts are black): training `#0E7490`, nutrition `#C2570C`, recovery `#6D5BD0`.
  - Status: success `#127235`, warning `#A34A06`, danger `#C81E1E`. Scrim `rgb(17 17 17 / 0.4)`.
  - No hex literal may appear outside `app/src/theme/`. Lint for it (§3).
- **C2 Depth:** depth comes from surface steps (bg → surface → raised) only.
  - No shadows or elevation, no blur, no gradients, no glow, and no purple-to-blue blends.
  - `expo-glass-effect` is installed by the template; it must never be imported. Propose removing it in Phase 1.
- **C3 Light theme** *(D49, replaces "Dark only")*: `app.json` `userInterfaceStyle: "light"`; root, splash and adaptive-icon backgrounds `#F5F5F5`; transparent navigation bar and status bar with dark icons.
- **C4 Spacing:** 4-point scale only: 4, 8, 12, 16, 24, 32, 48. Use the rhythm tokens: in-group 8, card padding 16, screen gutter 16, between groups 24, section 32 or 48. No uniform spacing: related items sit tight and unrelated items far apart. Any padding, margin or gap that isn't a token fails review.
- **C5 Tap targets:** at least 48 × 48 dp, which is Arcwell's decided size and stricter than Apple's 44 pt. Use `hitSlop` only for icon glyphs inside an already-48 dp pressable.
- **C6 Alignment:** text is left-aligned by default, and screens are not centred stacks. Centring is allowed only for:
  - a single glyph inside an icon button
  - a lone label inside a button
  - the numeral inside a ring or dial
- **C7 Type:** Inter only (D46), with weights 400, 500, 600 and 700 loaded through `expo-font`. Tabular numerals (`fontVariant: ['tabular-nums']`) on every weight, rep, kcal, timer and delta. Scale: 32/40, 22/28, 18/24, 16/24, 14/20, 12/16, with letter-spacing as in the tokens. Must survive 130% system font size; never set `allowFontScaling={false}`.
- **C8 Contrast:** WCAG AA for every text pair. Pillar colours are markers only, never text. Disabled text is exempt.
- **C9 Icons:** Lucide only (`lucide-react-native`). Never use `expo-symbols`, which is SF Symbols for iOS. Every icon-only control has an `accessibilityLabel`.
- **C10 Motion:**
  - Durations 120, 200 and 280 ms; 600 ms only for the F4-12 workout summary. Easing `cubic-bezier(.2,0,0,1)`, using Reanimated 4.
  - Changing numbers roll instead of jumping. Skeleton loaders, never spinners. No confetti and no animated backgrounds.
  - With reduce motion on, every transition is instant.
  - Haptic tick on set logged; strong haptic only on F4-12.
- **C11 Tone:** no streaks, XP or badges. A missed target is never red; red means destructive actions and errors only. Never rely on colour alone; pair it with an icon or text.
- **C12 Tiers:** coached athletes never see AI.
  - The UI hides it, but UI gating is not enforcement. Keep a single `useEntitlements()` hook as the only source, and leave a `// SERVER-ENFORCED: see supabase/functions/...` marker where real enforcement must exist.
  - Free users have no Recovery tab (D2b). No placeholder tabs.

## 2. Architecture you must follow
    app/src/
      app/                      Expo Router routes only (screens, _layout.tsx). No business logic.
        (auth)/ (onboarding)/ (athlete)/ (coach)/ dev/
      theme/                    colors.ts typography.ts spacing.ts radius.ts motion.ts index.ts
      components/
        primitives/             Text, Pressable/Button, IconButton, TextField, NumberStepper, Card,
                                ListRow, SectionHeader, Chip, StatusChip, Avatar, Divider, Screen
        feedback/               Skeleton, EmptyState, ErrorState, Banner, Toast
        domain/                 SetRow, RestTimerSheet, MacroBar, FoodResultRow, PortionPicker,
                                ChatBubble, AttachmentTile, CheckInField, PhotoSlot, PaywallCard,
                                Wordmark, TabBar variants
      features/<area>/          screen-level composition + hooks per area (today, training, nutrition,
                                recovery, physique, ai, coached, coach, account, system)
      data/                     typed repository interfaces + mock implementations (fixtures)
      fixtures/                 realistic Indian sample data from the wireframes (Priya Sharma, etc.)
      hooks/                    useEntitlements, useReducedMotion, useHaptics
      lib/                      formatters (kg, kcal, dates in en-IN), a11y helpers

Rules:
- No backend in UI phases. Screens read from `data/` interfaces backed by fixtures, so Supabase can replace them later without screen changes. Never put secrets, keys or real health data in the repo.
- Components are pure and typed. Each has its props, variants and states (default, pressed, disabled, loading, error, empty) and a story-style entry in the dev gallery.
- Every list renders empty, loading and error states (DESIGN.md §8).
- Every screen component carries its wireframe ID in a comment, for example `// N-01 Today — free`, and in `testID`.
- Add dependencies only with `npx expo install`. Before using any Expo or RN API, read `https://docs.expo.dev/versions/v58.0.0/` and `https://docs.expo.dev/llms.txt`; never code from memory. Note in the report any new library that needs a development build.

## 3. Quality gates (every phase)
1. `npm run lint && npm run typecheck`. Run `npm run db:test` too when Supabase is running locally; if it isn't, say so and don't claim it passed. Docker is off as of Phase 0; UI phases add no tables *(Phase 0)*.
2. Token lint: a custom ESLint rule or a grep check fails on hex or `rgb(` outside `app/src/theme/`, on non-token spacing numbers in styles, and on any import of `expo-glass-effect` or `expo-symbols`.
3. Token parity: a script checks that `app/src/theme/colors.ts`, spacing and radius match `docs/design/theme-tokens.css` value for value.
4. Visual check of every new screen:
   - Use the Android emulator if available; otherwise `npx expo start --web` in the Browser pane. No emulator exists yet, so every report says "checked on web only" *(Phase 0)*.
   - Check at 360 dp width and at 130% font scale.
   - Screenshot each state and compare against its wireframe figure.
5. A11y pass against DESIGN.md §8: labels, 48 dp targets, AA contrast, colour not used alone, reduce motion.
6. Critique pass: answer "What's wrong with this UI?" against C1–C12 and fix what you find before reporting.
7. Update DESIGN.md §6 Status and §7 (Built column) for what shipped. Mark everything "draft, not approved or user-tested".
8. Never commit unless the founder asks. When asked: stage no `.env`, `node_modules` or `.DS_Store` files, and end the message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Phase report, kept short:
- what was built
- screen IDs covered
- gate results with real output, including failures
- screenshots
- decisions relied on, including any D25–D45 defaults
- open questions, as one small batch

## 4. Phases (screen IDs from hifi-execution-roadmap.md; all 199 covered)

**Phase 0 — Preflight (no UI code)**
- Read the sources in §0. Fetch the Expo v58 docs for expo-font, Expo Router tabs and drawer, Reanimated 4, gesture handler, system UI and safe-area.
- Confirm D48 with the founder and record it.
- Ask the blocking questions:
  - remove `expo-glass-effect` and `expo-symbols`?
  - Lucide and Inter packages OK?
  - Android emulator available?
- Output: dependency plan and an updated D48. Nothing else.

**Phase 1 — Theme foundation**
- Apply the Phase 0 dependency plan (`docs/frontend/phase-0-preflight.md` §3).
- `app/src/theme/*` mirrors theme-tokens.css. Load Inter at runtime with `useFonts` and `@expo-google-fonts/inter`, with the splash screen held until fonts load; move to the expo-font config plugin once dev builds exist *(Phase 0)*.
- Dark system UI per C3.
- Token lint and the parity script from §3.
- A `dev/tokens` route that renders swatches and the type scale, as a live check in place of the artboard.
- Done when parity passes and the dev route matches `phase-1-artboard.html`.

**Phase 2 — Primitives and feedback components**
- Everything in DESIGN.md §6 except the domain parts: Button in primary, secondary, ghost and destructive, plus IconButton, TextField, NumberStepper, Card, ListRow, SectionHeader, Chip, StatusChip (active, paused, leaving, completed), Avatar, Skeleton, EmptyState, ErrorState, Banner and Screen (gutter, safe area, scroll).
- Show them all in the `dev/gallery` route.
- Covers S-03 (the roadmap's 2b).

**Phase 3 — Navigation shells (N-04, N-05)**
- Tab layouts per tier:
  - Free: Today · Training · Nutrition.
  - Arcwell Plus: adds Recovery · AI Coaching.
  - Coached: adds Recovery · Progress.
  - Coach: Clients · Check-ins · Plans · Messages · Business.
- The shared side menu (D9, D14, no Set Videos).
- A dev-only tier switcher fed by fixture sessions through `useEntitlements()`.

**Phase 4 — Today**: N-01, N-02, N-03, F4-01, W-01, CS-01, CS-02. The drawn layouts are final (D2d, D23).

**Phase 5 — Entry and onboarding**: F1-01…F1-05, F1-05b, AO-01…AO-21b (D52), AC-05, AC-06, F3-01…F3-03, K-26.
- Role is chosen before sign-up. Invite sign-ups skip the AI step (D44).
- Consent screens are UI only.

**Phase 6 — Training**
- 6a: T-01…T-04, TR-01…TR-07, W-02, F4-08, F4-13.
- 6b: F4-02…F4-07, F4-09…F4-12, TR-08, which adds SetRow, RestTimerSheet, the 600 ms summary moment and the offline in-progress cache interface (mock).

**Phase 7 — Nutrition**
- 7a: F5-01…F5-08, X-03, X-04.
- 7b: F5-09…F5-14. Adds MacroBar (bars, not rings), FoodResultRow and PortionPicker (Indian portions, kg only, D45).

**Phase 8 — Recovery and Physique**: R-01…R-04 (sleep dial 0–100, D18) and PH-01…PH-04. Recovery appears only for tiers that include it.

**Phase 9 — AI Coaching (Plus only)**: AI-01…AI-04, X-01, X-02, F8-05, U-01.
- The out-of-scope state (D22).
- No AI calls from the app; the data interface stubs a server function.
- Unreachable for coached athletes, with a test proving it.

**Phase 10 — Coached athlete area**
- 10a Chat: F7-01…F7-03, CP-05, X-05, X-06.
- 10b Check-ins: F6-01…F6-06, CP-01…CP-04, CP-06.
- 10c Photo consent: F9-03, F9-04, F9-06.
- Adds CheckInField and PhotoSlot, which first need adding to the spec sheet and DESIGN.md §6; ask before inventing their look.
- Photo consent never blocks a check-in (D12).

**Phase 11 — Coach app**
- 11a: CO-01…CO-15 (CO-01 is K-19; D52).
- 11b: K-01…K-04, K-14…K-18, K-24, K-30.
- 11c: F6-07…F6-10. The check-in card from the artboard becomes the real component here.
- 11d: K-05…K-09, K-22, K-23.
- 11e: F7-04, F7-05.
- 11f: K-10…K-13, K-20, K-21, F9-01, F9-02, F9-05, K-25, K-27, K-28.

**Phase 12 — Coaching changes, Account, Gyms**
- J-01…J-03, L-01…L-03, K-29, AC-10: the cancel-in-Play step is D7a/D19; nothing is ever deleted (D7c).
- AC-01…AC-04, AC-07…AC-09, N-06, G-01, G-02, X-07…X-10.

**Phase 13 — States, trial and paywall**
- E-01…E-08 (empty states).
- F8-01…F8-04, F8-06…F8-08, TL-01, TL-02 (trial and paywall; paywall only at upgrade moments).
- S-01, S-02, S-04…S-06 (system states).
- Then a stress pass: longest Indian names, 130% text, empty, error and offline on every list.

**Phase 14 — Full QA and record**
- Walk all 199 screens per tier. Run the full §3 gates and the DESIGN.md §8 checklist.
- Update §7. Write a short summary of the gaps that remain before backend wiring (Supabase, RLS-backed repositories, RevenueCat, S3 signed URLs), which are out of scope for these UI phases.

## 5. How each phase runs
1. Restate the phase scope and its screen IDs, list the wireframe figures you'll read, and ask any blocking question as one small batch.
2. Read each wireframe figure, including its note, and list every state shown.
3. Build components bottom-up, then screens, with fixtures.
4. Run the §3 gates and fix what they find.
5. Report and stop. Wait for "Next" or for changes. Never infer approval from an earlier "yes".
