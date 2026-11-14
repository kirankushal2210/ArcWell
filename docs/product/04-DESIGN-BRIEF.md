# 04 · UI/UX Design Brief

**Updated:** 14 November 2026 (to D108). The visual and interaction rules every screen follows. Tokens are code: `app/src/theme/` must match `docs/design/theme-tokens.css`, and `npm run tokens:check` fails on raw colours, spacing or off-system imports. The longer reference (component specs, history) is [DESIGN.md](../DESIGN.md). Where the two differ, this brief wins.

## 1. Feel

Calm, competent, trustworthy, like a respected senior coach. **Not** loud, "beast mode", neon or gamified.

| Arcwell is | Arcwell is not |
|---|---|
| Quietly confident, clear, plain English | Hype, exclamation marks, fitness slang |
| Warm and encouraging | Shaming (no red "missed!" walls, no streak guilt) |
| Evidence-minded: every target has "Why this?" with sources | Miracle claims, bro science, supplement pushing |
| Indian-first: dal, roti, katori, ₹, IST | A Western app with Indian food bolted on |

## 2. Colour (dark only, black and red: D83)

| Token | Value | Use |
|---|---|---|
| `bg` | #0A0A0A | App background |
| `surface` | #151515 | Cards, groups, sheets |
| `surfaceRaised` | #1F1F1F | Raised controls, keypad |
| `border` / `borderStrong` | #2B2B2B / #767676 | Dividers / inputs and ticks |
| `text` | #F2F2F2 | Primary text |
| `textMuted` | #A3A3A3 | Secondary text, captions |
| `textDisabled` | #5C5C5C | Disabled |
| `brand` | #D32F2F (hover #B71C1C) | The one primary action per screen, selected chips, ticks |
| `onBrand` | #FFFFFF | Text and icons on brand |
| `training` / `recovery` | #FF5A52 | Pillar dots and accents |
| `nutrition` / `success` | #7BD389 | Pillar dot, positive change |
| `warning` | #F5B841 | Needs attention, grace periods |
| `danger` | #FF5A52 | Destructive actions, errors |
| `glass` / `glassEdge` | rgba(36,36,36,.5) / rgba(255,255,255,.14) | Floating tab bar and + button only (Liquid Glass, D67) |

**Rules:**
- **One brand-red primary button per screen.** Secondary actions are surface buttons; destructive actions use danger text.
- **Pillar colours mark where you are.** Never use them for decoration.
- **No gradients, glows or neon.** Glass is only for the floating bottom controls.
- **Contrast:** text on bg or surface meets WCAG AA. Muted text is never used for something you must read to act.

## 3. Typography

One family, **Inter** (400 Regular, 500 Medium, 600 Semibold, 700 Bold), with tabular numerals for every number (weights, reps, kcal, timers).

| Role | Size / line height | Weight | Use |
|---|---|---|---|
| display | 32 / 40 | Bold | Page heroes ("Hi Ravi", "Your plan is ready") |
| title | 22 / 28 | Semibold | Page titles, big numbers |
| heading | 18 / 24 | Semibold | Card titles |
| body | 16 / 24 | Regular | Default text |
| label | 14 / 20 | Medium | Buttons, list sub-lines |
| caption | 12 / 16 | Regular | Meta, sources, hints |
| eyebrow | 12, caps, tracked | Medium | Section labels ("THIS WEEK") |

**Rules:**
- Sentence case everywhere.
- Left-aligned, except hero moments.
- System font scaling is always on; never disable it.
- Copy is plain, specific and short. No "Oops!", no "Awesome!".
- Errors say what to do next.

## 4. Layout and spacing

- **Spacing:** a 4-point grid with only these steps: 0, 4, 8, 12, 16, 24, 32, 48. Use the rhythm aliases:
  - inline 8, in-group 8;
  - card padding 16, page gutter 16;
  - between groups 24, section 32, section break 48.
- **Radius:** sm 10, md 12, lg 16 (cards), xl 28 (sheets), full (pills, round buttons).
- **Tap targets:** ≥ 48 dp. Main buttons look 36 dp tall with a 48 dp hit area (D81). Small icons get `hitSlop`.
- **Thumb zone:** primary actions sit at the bottom (a footer button or the action dock above the tab bar). The top holds titles and the Progress and menu buttons (D101).

**Navigation (D61):** three levels only.
1. Bottom bar: athlete Today, Training, Nutrition, Recovery, plus the + button; coach Clients, Check-ins, Plans, Messages, Business.
2. Section tabs under a page title: at most 4, swipeable.
3. Pushed pages with Back.

Sheets are for choices and quick logs, never for long forms.

**Density:**
- **Coach side:** a dense work tool (lists, numbers, status chips).
- **Athlete side:** calm daily companion (one thing at a time, generous spacing).

## 5. Components (use these; don't invent new ones)

| Group | Components |
|---|---|
| Primitives (`components/primitives`) | `Text` (roles and tones), `Button` (primary, secondary, ghost, destructive; sm or md), `IconButton`, `PressableScale`, `Chip`, `TextField`, `NumberStepper`, `Avatar`, `StatusChip` |
| Feedback (`components/feedback`) | `Skeleton`, `ErrorState`. Screen states: `LoadingScreen`, `ScreenError`, `OfflineBanner`, `NotFound` (`features/system/SystemStates`) |
| Layout | `Page`, `PageHeader`, `MenuPage`, `Group` / `GroupRow`, `NavRow`, `ToggleRow`, `InfoCard`, `Eyebrow`, `KeyValues`, `Sheet` / `SheetRow`, `SectionTabs`, `ActionDock` |
| Domain | `RoutineCard`, `PlanExerciseRows`, `MacroCards`, `FoodRow`, `ChatThread`, `WhyThis` (evidence sheet), `PolicyLinks` / `LegalRows` |
| Alerts | `lib/alert` only (never `Alert.alert` directly), so confirms work on web |

## 6. Motion

- Short and functional: press scale 0.98, with standard durations for sheets and screens (`theme/motion`).
- Reduced motion on means durations go to 0 and presses don't scale (`durationFor`, `pressScaleFor`).
- No confetti, except one short celebration when the plan is ready (D57).

## 7. Imagery and icons

- **Icons:** lucide only, 18 to 24 dp, stroke 2; filled only for selected state.
- **The sparkle means AI, and only AI (D110).** Use it only for AI features or entry points to the AI coach, never for rules-based hints, and never where a coached athlete can see it.
- **Brand:** the pull-up silhouette logo (D51), in red on dark or white on red.
- **Photos:** only the user's own (progress, meals, chat). No stock fitness models.
- **Exercise media:** none until licensed; use names and cues.

## 8. Accessibility

- Every icon-only button has an `accessibilityLabel`.
- Toggles and ticks use `accessibilityRole="checkbox"` with their checked state.
- Status is never shown by colour alone: always a word or icon too.
- The order of reading matches the order on screen.
- Supports the system font size up to 200% without clipping key actions.

## 9. Inspiration (patterns, not looks)

| For | Reference | What we take |
|---|---|---|
| Workout logging | Hevy | Set rows, previous values, rest timer, quick ticks |
| Food logging | MyFitnessPal, HealthifyMe | Recent and frequent first, portions, meal slots |
| Recovery | WHOOP, Oura | Rings with one clear number and a plain-English line |
| Coach tools | Trainerize, TrueCoach | Client list sorted by "needs attention", check-in review queue |
| Controls | Apple Liquid Glass | Floating translucent tab bar |

The full reference board is in [design/references.md](../design/references.md) and [competitor-research.md](../design/competitor-research.md). Visual explorations: `docs/design/arcwell-*.html`.

## 10. Anti-slop checklist (reject a screen if any is true)

- [ ] More than one red primary button, or red used for decoration
- [ ] Raw hex colours, magic spacing numbers, or a font other than Inter
- [ ] Centred paragraphs, ALL-CAPS body text, emoji in UI copy
- [ ] Generic AI filler ("Unlock your potential!", "Supercharge your fitness journey")
- [ ] A spinner where a skeleton fits, or a blank screen on error or not-found
- [ ] A tap target under 48 dp, or an icon button without a label
- [ ] A number without units or context ("70" instead of "70.0 kg")
- [ ] AI (or the AI sparkle) shown to a coached athlete, or a paywall shown more than at natural moments
- [ ] Copy that blames or shames the user
