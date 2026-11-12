# Frontend Phase 2 — Primitives and feedback components: report

Date: 2026-11-11 · Status: built; draft, not approved or user-tested · Checked on **web only** (D48)

## Built

**`app/src/components/primitives/`**

| Component | What it does |
|---|---|
| `Text` | The only text component. Roles display/title/heading/body/label/caption, plus an uppercase `eyebrow`. Tones are limited to token colours. `numeric` sets tabular numerals. Always left-aligned and always font-scaled. |
| `PressableScale` | Press feedback for every tappable element: scale 0.98 over 120 ms, interruptible, and none with reduced motion. |
| `Button` | Primary, secondary, ghost and destructive variants, with optional icon. Disabled uses a raised fill with disabled text. Loading swaps in `loadingLabel`, with no spinner. 48 dp, label 16/600. |
| `IconButton` | 48 × 48, plain, outline or filled. `accessibilityLabel` is required. |
| `TextField` | Label, helper, error, leading icon, unit. Focus shows a cyan outline. Error shows a danger outline, an icon and a message. The box stays 48 dp, so focus and error never shift the layout. |
| `NumberStepper` | ± buttons at 48 dp and a 32 px tabular value that rolls on change over 200 ms. Exposed to screen readers as an adjustable control with increment and decrement. |
| `Card` | Surface or raised level, optionally pressable. Depth comes only from surface steps. |
| `ListRow` | 56 dp minimum. Avatar or icon, title, subtitle, trailing value, chevron. Long names truncate. |
| `SectionHeader` | Eyebrow with optional pillar dot and a 48 dp text action. |
| `Chip` | Portion or filter chip: 32 dp visual inside a 48 dp target. Selected shows a tick, cyan outline and cyan text. |
| `StatusChip` | Active, paused, leaving or completed (D39): a dot plus the word. |
| `Avatar` | Initials on raised, or a photo through expo-image. |
| `Divider` | Decorative only, hidden from screen readers. |
| `Screen` | Charcoal background, 16 dp gutters, safe areas, optional pinned footer. |

**`app/src/components/feedback/`**

| Component | What it does |
|---|---|
| `Skeleton`, `SkeletonGroup` | Content-shaped blocks pulsing over 1.4 s; still with reduced motion. The group is announced once as "Loading". |
| `EmptyState` | Icon tile, title, body and an optional primary action. |
| `ErrorState` | Raised panel with a danger icon, the message, and a 48 dp "Try again". |
| `Banner` | Info, offline or warning: icon plus text. |

**Other files**

- `app/src/hooks/useReducedMotion.ts`
- `app/src/theme/motion.ts`: adds `skeletonPulse` (see question 3)
- `app/src/app/dev/gallery.tsx`: every component in every state, plus a working S-03 form
- `docs/DESIGN.md` §6: five rows marked built

**Screen covered:** S-03 (form validation). It runs in the gallery: Name, Email and Password are checked when you leave a field and on submit. Each message sits under its field, says how to fix it, and comes with an icon and a heavier outline.

## Gate results

- `npm run lint` (expo lint + tokens:check): **pass**. The React Compiler lint first flagged `scale.value = …` in a render closure. All shared values now use Reanimated 4's `.get()` / `.set()`.
- `npm run typecheck`: **pass**.
- `npm run db:test`: **not run**. Docker is off, and no tables changed.

## Visual and a11y check (web, 360 × 800)

**Passed**
- No horizontal overflow (scrollWidth 360).
- All 30 pressables are at least 48 × 48. "Try again" was 37 px wide and is fixed.
- All 7 inputs are exactly 48 tall, unfocused and focused. They were 50–52 and grew on focus; fixed.
- Every pressable has a label (0 unlabelled).
- Email focus gives a cyan 2 dp outline. Tab away gives "Enter a full email, like name@example.com" with an icon.
- Stepper + goes 72.5 → 75.0 kg, and the screen-reader label updates.

**Not checked**
- Android rendering and TalkBack.
- 130% font size.
- Reduced motion (web can't toggle Android's "Remove animations").
- The skeleton pulse and the number roll by eye on a device.

## Critique pass: what's wrong, and what I did

1. **Spec-sheet sizes off the 4-point grid** (C4):
   - button padding 20 → 16
   - input padding 14 → 16
   - label gap 6 → 8
   - stepper padding 6 → 4
   - status-chip padding 10 → 8
   - empty-state icon radius 16 → 12 (`radius.md`)
   - pillar dot: was a 2 px rounded square, now a circle
2. **The spec-sheet empty state is centred.** It's built left-aligned to follow C6 (question 1).
3. **The stepper value is visually centred** between its ± buttons, as in the spec sheet. I treated it like the "numeral in a dial" exception to C6 (question 1).
4. **Toast not built.** It's not in the Phase 2 list, and its "Undo" colour in the spec sheet (`#1F5FC4`) isn't a token (question 2).
5. **Web shows a white frame for about a second** before Inter loads. A `+html.tsx` shell fixes it, but the dev server on :8081, which I didn't start, needs a restart to pick it up. With it in place and no restart, the page came up blank, so I removed it. Android isn't affected: the charcoal splash covers it.
6. **The browser drew its own yellow focus ring** inside the input. I removed it (`outlineWidth: 0`); the field already draws its own cyan outline.

## Decisions relied on

D12 is not used yet. Relied on: D24, D39 (statuses), D45 (kg), D46, D47, D48. D39 and D45 are among the defaults (D25–D45) you haven't reviewed individually.

## Questions for the founder

1. Keep the empty state left-aligned (C6) rather than centred as in the spec sheet? Is a centred stepper value OK as an exception?
2. Toast: build it in a later phase, and with which action colour? The spec sheet's `#1F5FC4` isn't a token; `--color-brand` on a light toast fails contrast, so this needs a decision.
3. Add the 1.4 s skeleton pulse to `theme-tokens.css` and DESIGN.md §5 as a motion token?
4. May I restart the dev server on :8081 to add the `+html.tsx` web shell (web-only white flash)?
5. Start Phase 3 (navigation shells, N-04 and N-05)?
