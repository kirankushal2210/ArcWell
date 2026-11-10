# Arcwell — Assets and Licences

What we need, where it comes from, and whether we can legally use it in a commercial app. Checked 2026-11-10. **Always re-read the licence at the source before shipping** — licences change. Nothing here has been downloaded yet.

Status: ✅ safe for commercial use · ⚠️ usable with conditions/checks · ❌ avoid.

## 1. Brand assets (to create)

| Asset | Status | Notes |
|---|---|---|
| Logo — wordmark + symbol (arc motif) | To design | Design phase; also needed for app icon and Play Store |
| App icon (Android adaptive: foreground, background, monochrome) | To design | Template placeholder icons in `app/assets/images/` must be replaced |
| Splash screen | To design | |
| Colour palette, type, spacing | Draft in DESIGN.md §5 | |
| Play Store listing graphics (feature graphic 1024×500, screenshots) | Later (Phase 8) | |
| Coach-shareable templates (invite card, transformation export frame) | Later (Phase 5) | Arcwell-branded, coach name overlaid |

## 2. Typography

| Font | Licence | Status | Notes |
|---|---|---|---|
| Inter | SIL Open Font License | ✅ | Recommended UI font; tabular numerals; load via `expo-font` / `@expo-google-fonts/inter` |
| Alternatives: Manrope, Plus Jakarta Sans | SIL OFL | ✅ | For a warmer brand display face if wanted |
| Noto Sans Devanagari | SIL OFL | ✅ | For a later Hindi version |

## 3. Icons

| Set | Licence | Status | Notes |
|---|---|---|---|
| Lucide | ISC | ✅ | Clean line icons, calm tone; recommended |
| Phosphor | MIT | ✅ | Multiple weights; good fallback |
| Material Symbols | Apache 2.0 | ✅ | Native Android feel; available via `@expo/vector-icons` |
| Custom fitness icons (equipment, muscle groups) | To create | — | Off-the-shelf sets are thin here |

## 4. Illustrations, empty states, motion

| Source | Licence | Status | Notes |
|---|---|---|---|
| Open Peeps (Pablo Stanley) | CC0 | ✅ | Hand-drawn people; adaptable for empty states |
| unDraw | unDraw licence (free, no attribution) | ⚠️ | Commercial use allowed; read the restrictions (no re-distribution as an illustration pack) |
| LottieFiles free animations | Per-animation (Lottie Simple License for free ones) | ⚠️ | Check each animation; keep motion subtle |
| Custom illustration set | — | Later | Best for a distinctive brand once funded |

## 5. Photography (marketing, onboarding)

| Source | Licence | Status | Notes |
|---|---|---|---|
| Unsplash | Unsplash License | ✅ | Free commercial use; can't be sold unaltered or used to build a competing service; avoid identifiable-person endorsement implications |
| Pexels | Pexels License | ✅ | Similar terms |
| Own shoot with beta coaches/clients | — | Best | Authentic Indian gym context; needs signed model releases |

Prefer Indian gym and food imagery — most stock fitness photography is Western.

## 6. Exercise demonstration media — highest-risk asset

| Source | Licence (as found) | Status | Notes |
|---|---|---|---|
| ExerciseDB API (official, subscription) | Revocable licence only while subscribed; terms say data must be freshly requested each use (no storing/caching) | ❌ for our model | Can't self-host media; app breaks if subscription lapses. [Terms](https://exercisedb.notion.site/ExerciseDB-API-Terms-of-Use-226983b728ca8090bf7be79564e4b356) |
| ExerciseDB on Gumroad (one-time purchase) | Seller claims commercial rights | ⚠️ | Verify full licence text and provenance before buying; there are reports of copied GIF packs drawing legal notices |
| Open-source "ExerciseDB" API clones on GitHub | Code under MIT; media licence unclear | ❌ until proven | MIT covers code, not necessarily the GIFs |
| free-exercise-db (yuhonas) | Described as public domain by third parties | ⚠️ | Confirm the repo's own LICENSE covers the images; still photos only. [Overview](https://providers.apievangelist.com/providers/free-exercise-db/) |
| wger exercise database | Exercise data and images mostly CC-BY-SA 4.0; some images from Wikipedia with their own terms | ⚠️ | Commercial use allowed with attribution and share-alike on the media; check per-image licence. [Docs](https://wger.readthedocs.io/) |
| WorkoutLabs illustrations | Paid licence | ⚠️ | Commercial licensing available. [Licensing](https://workoutlabs.com/exercise-illustrations-licensing/) |
| **Film our own clips** with a coach | Owned | ✅ Recommended | Short loops, consistent angle and lighting, Indian gym setting; ~60–100 exercises for launch is achievable |

**Recommendation:** launch with self-filmed clips for the core library, using wger / free-exercise-db stills (with attribution) only as temporary placeholders.

## 7. Data assets

| Asset | Licence / status | Notes |
|---|---|---|
| IFCT 2017 (National Institute of Nutrition) | ⚠️ Usage rights to confirm | Published as book/PDF; needs digitising or a verified dataset |
| USDA FoodData Central | Public domain (CC0) | ✅ Fallback for generic foods |
| Curated Indian dishes and portions | Our own | Build and review in-house |

## 8. Open actions

- [ ] Decide logo direction (founder input, see brand-assessment.md §4)
- [ ] Confirm free-exercise-db image licence in its repo; confirm wger attribution format
- [ ] Plan a filming day for exercise clips (list of launch exercises, model release)
- [ ] Confirm IFCT 2017 usage rights
- [ ] Replace Expo placeholder icons once the logo exists
