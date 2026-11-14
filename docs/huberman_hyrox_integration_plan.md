# Daily protocols and HYROX: integration plan

Status: **approved by the founder on 2026-11-13** (decisions D74–D81). Written 2026-11-13.

Inputs:
- The book *Protocols* (all 7 chapters, 47 protocols and the reference notes, read in full).
- The current codebase (front end complete on sample data; backend B1 to B8 not started).
- SPEC.md and D57 to D73.

The working notes from the book read-through are kept outside the repo; this file holds everything the plan needs.

---

## 0. Summary

**What the book gives us.** Most of the book's value for Arcwell is in a handful of daily behaviours with good human evidence:
- morning light;
- a steady wake time;
- a caffeine cut-off;
- dim lights and no screens before bed;
- steps and walks after meals;
- weekly cardio, including one hard session;
- protein, fibre and minimally processed food.

A second tier is reasonable as **optional** tools with honest labels: NSDR, the long-exhale sigh, a 5-minute meditation, naps, cold exposure with guardrails, fermented foods, fatty fish, a focus block, and if-then plans.

The rest we leave out. That covers supplements and nootropics, prescription drugs, nicotine, red-light and skin-sun protocols, binaural beats, hypnosis, hyperventilation breathing, and the grief and trauma-writing protocols. They are either:
- weak or author-practice evidence that fails D69;
- unsafe to hand to the public from a fitness app;
- tied to products the author sells or advises;
- or mental-health care that needs a clinician.

Section 2 gives a verdict for every one of the 47 protocols.

**Arcwell already has a third of this.** Recovery (D60) already ships these protocols:
- wind-down, the same wake time every day, and a caffeine cut-off;
- a 20-minute nap and box breathing;
- NSDR, an easy walk and an easy cardio day;
- a deload, protein at every meal, sauna, and cold.

It also has a sleep planner. Nutrition already has water, fibre and protein targets. The plan extends these rather than adding a parallel system.

**HYROX: should there be a separate plan?** Not a separate app, tier or account type. **Yes**, a separate *training plan type*.
- A HYROX athlete's week is concurrent training (running, strength and station work) built backwards from a race date. The hypertrophy plan's targets don't fit that week. Running both would overload recovery, so while a race goal is active, the "hybrid race" plan replaces the normal plan.
- Everything else is shared: logging, nutrition, Recovery, habits, coach tools and history.
- It appears only for athletes who choose a race goal, or whose coach assigns a hybrid program. Nobody else ever sees a HYROX screen, tile or notification (section 3).

**VO2 max training (cardio fitness).** It becomes an opt-in part of regular Training (section 3B), not only part of HYROX.
- Research is clear that cardio fitness is one of the strongest predictors of long-term health. It is raised most efficiently by 1 to 2 interval sessions a week at about 90 to 95% of maximum heart rate (for example 4 × 4 minutes) on top of easy aerobic work.
- Arcwell would measure a starting point (watch estimate, a 12-minute test, a walking test or a rough estimate from a few questions). It then fits interval sessions around the lifting plan, on non-leg days and on a bike or rower if the athlete prefers, and retests every 6 to 8 weeks.
- Running is never required.

**Above everything: the athlete decides what Arcwell shows (section 4.0, proposed D78).**
- Every add-on is a module the athlete turns on: cardio fitness, running, daily movement, sleep and light habits, calm tools, mobility, focus and race.
- A module that's off leaves **no trace**: no cards, no section tabs, no plan sessions, no reminders, no "you should try this" prompts.
- Someone who only wants hypertrophy sees a hypertrophy plan, their food and their recovery, nothing else.
- Preferences are asked once, as one optional screen in onboarding, and changed any time in "What Arcwell shows".

**Clutter control in one line:**
- Only chosen modules exist.
- Today shows at most a hero card, three tiles and the dock.
- A habit appears only inside its time window.
- An athlete runs at most five habits at once.
- Everything else sits one tap deeper (section 4).

**Order.** The coach-loop backend (B1 to B3) stays first. This work runs in parallel as front-end phases FE-8 (habits) and FE-9 (HYROX) on sample data. Its tables land inside the existing backend slices (B2, B3, B6, B7) instead of as a new slice (section 7).

### Decisions this plan asks for (proposed numbers)
| # | Decision |
|---|---|
| D74 | Arcwell adds **Daily habits** across five areas (Sleep and light · Movement · Calm · Nutrition · Focus). Personal growth is out of scope. Every habit passes the D69 evidence check and is rules-based (no AI), so coached athletes get it too. |
| D75 | **No author or book branding** in the app. Habits use Arcwell's own names and cite primary research, never the book. No supplement, drug or device is ever suggested; athletes may log their own supplements (as in D64). |
| D76 | **HYROX race track:** an opt-in race goal that switches the plan to a hybrid-race program, adds a Race section to Training and a race simulator. It is hidden from everyone without a race goal. |
| D77 | **Clutter rules** from section 4 become design law (like D61): the Today card limit, time windows, the five-habit cap, and the notification budget. |
| D78 | **The athlete decides what exists.** Everything beyond the main goal is an opt-in module. An off module leaves no trace anywhere: Today, tabs, plan, notifications and suggestions. A coach's assigned training always shows. |
| D79 | **Cardio fitness (VO2 max)** is an opt-in Training module: baseline estimate or test, interval sessions fitted around lifting by the D69 rules, any cardio machine (running optional), and a retest every 6 to 8 weeks. HYROX reuses it. |

---

## 1. Ground rules that shape everything

1. **D69 decides, not the book.** The book is a list of candidates. A habit ships only if primary human research supports it, and its claim is limited to what that research shows.
   - Each shipped habit carries an evidence level: **Strong** (meta-analyses or repeated RCTs), **Moderate** (some RCTs or consistent cohorts), or **Limited** (small or early trials; shipped only as optional and labelled "early evidence").
   - Sources go into `features/science/sources.ts` after a PubMed check, the same process as FE-2.
   - The book's notes are useful leads, but several are animal studies, preprints, podcasts or the author's own lab. The book flags many of its own items as anecdotal; the caffeine delay, the mobility drills and the "Clean and Lean" diet are examples.
2. **Where the book and Arcwell disagree, Arcwell's rules stand**, and we say so in the "Why this?" sheet.
   - **Resistance training:** the book trains each muscle directly once a week, 4 to 9 sets, every set to failure, and argues against 12 to 20 weekly sets. Arcwell keeps 10 to 20 hard sets per muscle per week at 0 to 3 reps in reserve, per the dose-response and proximity-to-failure meta-analyses in FE-2. We don't import the book's split.
   - **Protein:** the book says about 2.2 g/kg. Arcwell keeps 1.8 g/kg, or 2.0 g/kg when losing fat; the meta-analytic plateau is around 1.6 g/kg with a confidence interval up to about 2.2.
   - **Water:** the book's hourly formula has no trial behind it. Arcwell keeps the EFSA targets.
3. **No branding, no products.** No author name, likeness, book title or quotes in the app or store listing.
   - Using a named personality implies endorsement, and the book discloses commercial ties on several protocols (glasses, sunscreen, mattress cover, yerba mate, apps).
   - We never name brands or devices.
4. **Rules, not AI.** Habit suggestions come from the same rules engine as D60's daily outlook. That means coached athletes see them (D44 forbids AI, not rules), and coaches can assign them.
5. **Safety screens before risky habits.** Cold exposure, breath holds, naps for people with insomnia and the 1-mile or Cooper test each get a one-time screen first. It covers heart conditions, pregnancy, epilepsy, insomnia and new to exercise. A "yes" hides the habit and suggests talking to a doctor.
6. **Data minimisation (DPDP).**
   - No GPS: sunrise and sunset come from the city the athlete picks.
   - No free-text journals on the server; growth and journalling are out anyway.
   - Device data comes in only with its own consent (Health Connect, D60).

---

## 2. Task 1: what the book offers, and what Arcwell takes

### 2.1 How the 7 book pillars map onto Arcwell (no new tabs)
| Book pillar | Arcwell area | Lives in |
|---|---|---|
| Sleep + Light (chapters 1 and 5 repeat each other; light protocols 1 to 3 are sleep protocols 1 to 3) | **Sleep and light** | Recovery > Sleep; Today in its time windows |
| Exercise | **Movement** | Training (cardio, steps, tests); Today |
| Stress control | **Calm** | Recovery (breathing, NSDR, cold); the + sheet |
| Nutrition | **Nutrition** | Nutrition tab (existing targets and new food signals) |
| Focus, motivation, learning | **Focus** (small) | The + sheet (focus block); goals (if-then plans) |
| Personal growth | Out of scope | none |

### 2.2 Verdict on every protocol
Key to the Verdict column:
- **Core:** offered by default, Strong or Moderate evidence.
- **Optional:** in the library, Moderate or Limited evidence, labelled.
- **Tip:** a one-time setup tip, not a daily habit.
- **Out:** left out, with the reason.
- **Has:** Arcwell already has it.

Tracker types are defined in 2.3. Windows are relative to the athlete's own wake time (W) and bedtime (B), not the clock.

**Sleep and light**
| Book protocol | Arcwell habit | Verdict | Tracker · window | Evidence and notes |
|---|---|---|---|---|
| Sleep 1 / Light 1: daylight soon after waking | Morning daylight | **Core** | check + minutes · W to W+60 min. Target by sky: about 10 min clear, 20 partly cloudy, 30 overcast | Strong for light as the main clock signal and for morning light advancing the clock (human lab work). The minutes are a practical guide, not trial doses; say so. A 10,000 lux lamp is allowed as a fallback, with no brand named. |
| Sleep 2 / Light 2: afternoon light | Afternoon daylight | Optional (Limited) | check + minutes · W+6 h to sunset | The book calls its supporting studies small. |
| Sleep 3 / Light 3 + Sleep 14: dim lights, no screens before bed | Wind-down (extends D60's 30-minute wind-down to 60) | **Core / Has** | check · B−60 min to B | Strong: evening room light suppresses melatonin, and lit screens delay sleep (human lab RCTs). |
| Sleep 4: consistent sleep and wake times, ±30 min | Same wake time | **Core / Has** | derived from sleep data or check · at W | Moderate: sleep regularity is linked to health outcomes (large cohorts). The sleep planner already sets bedtimes. |
| Sleep 5: cool bedroom (about 18 to 20 °C) | Bedroom set-up tip | Tip | one-time card in the sleep planner | Moderate (reviews of thermal environment). Not a daily habit. |
| Sleep 6: warm the room before waking | none | Out | none | Needs a smart thermostat; thin evidence. |
| Sleep 7: naps of 15 to 20 min, not late | 20-minute nap | **Has** (add rules) | timer · not after B−8 h | Moderate. Hidden for people who report insomnia (the book says so too). |
| Sleep 8: NSDR | 10-minute rest (NSDR) | **Has**, Optional (Limited) | timer 10/20/30 | Small trials only. Never claim it replaces sleep; the book itself says "30 min = 2 h of sleep" lacks lab support. |
| Sleep 9: sleep supplements | none | Out | athletes may log their own (D64 list) | Weak or absent trials for most; we never suggest doses. |
| Sleep 10: prescription sleep drugs | none | Out | none | Medical care. |
| Sleep 11: caffeine cut-off 8 to 10 h before bed | Caffeine cut-off | **Core / Has** | clock time of last caffeine · reminder at B−9 h | Strong (RCT and meta-analysis). **Leave out** the "delay caffeine 90 min after waking" advice: the book itself says no trial supports it. |
| Sleep 12: no alcohol within 8 h of bed | Alcohol and sleep | Optional | count + time | Strong that alcohol harms sleep. Logged neutrally, no shaming. |
| Sleep 13: avoid cannabis as a sleep aid | none | Out | none | Not a habit; outside our scope. |
| Sleep 15: jet lag plan | Travel mode | Later (v1.1) | multi-day plan | The physiology is sound (light timing), but the book's plan has no citations and it's a big flow. Revisit after launch. |
| Light 4: sun on the skin, 20 to 30 min | none | Out | none | Skin-cancer risk in high-UV India; benefits rest partly on mouse work. The book's author owns a sunscreen brand. |
| Light 5: red and near-infrared light devices | none | Out | none | Device-dependent, small trials, product ties disclosed by the book. |

**Movement**
| Book protocol | Arcwell habit | Verdict | Tracker · window | Evidence and notes |
|---|---|---|---|---|
| Exercise 1: walk 7,000 to 10,000 steps | Daily steps | **Core** | device count, or manual · all day | Strong: step-count meta-analyses (benefit rises up to about 8,000 to 10,000 a day, lower for older adults). Needs Health Connect for automatic counts; manual entry until then. |
| Exercise 1: walk 5 to 30 min after meals | Walk after a meal | **Core** | check · within 30 min after a logged meal | Moderate to Strong: meta-analyses on blood glucose after meals. Ties into the Nutrition log. |
| Exercise 1: break up sitting every 30 min | none | Out of v1 | none | Needs background sensing; noisy reminders. |
| Exercise 2: resistance training 3 days a week (book split) | none | **Not adopted** | none | D69 rules stand (section 1). We do take the warm-up set pattern as an optional helper in the workout logger. |
| Exercise 3: three cardio sessions a week (long easy, moderate, short hard) | Weekly cardio → becomes the **Cardio fitness module** (3B) for athletes who turn it on | **Core** (inside the module) | minutes by intensity, from heart rate or effort · weekly | Strong: WHO guidance of 150 to 300 min moderate or 75 to 150 min vigorous a week, plus resistance training at least twice a week. VO2max-related fitness is strongly linked to mortality (cohorts). The 3-session pattern is offered as a template. Max heart rate uses the Tanaka formula (208 − 0.7 × age); zones come from heart rate with a device, otherwise from effort and the talk test. |
| Exercise 3: mile test or 12-minute Cooper test | Fitness test (part of the Cardio fitness module) | Optional | result + date · every 8 to 12 weeks | Moderate: the Cooper test is a validated VO2max estimate. Needs the safety screen. |
| Exercise 4: four mobility drills, 10 min, 2 to 4 times a week | Mobility (10 min) | Optional (Limited) | check · weekly count | The book's drills have **no citations** and are the author's own. We use evidence that full-range resistance training and stretching improve range of motion, with a generic routine labelled "practice, not trial-tested". |

**Calm (stress control)**
| Book protocol | Arcwell habit | Verdict | Tracker · window | Evidence and notes |
|---|---|---|---|---|
| Stress 1: physiological sigh | Long-exhale breathing (a second pattern in the existing Breathe screen) | Optional (Moderate) | timer 1 to 5 min · any time | One RCT (Balban 2023), from the author's own lab: disclose that. On-demand use goes in the + sheet. |
| Stress 2: cold exposure, 1 to 3 min, 3 to 7 times a week | Cold shower or plunge | **Has**, Optional, with guardrails | timer · never within 6 h after strength work | Cold soon after lifting blunts muscle gain (RCT and meta-analysis). The brown-fat "11 minutes a week" figure comes from winter swimmers (observational), so it isn't used as a target. The safety screen is required. Never combined with breath holds. |
| Stress 3: NSDR | (same as Sleep 8) | **Has** | none | none |
| Stress 4: 5-minute meditation on waking | 5-minute meditation | Optional (Moderate) | timer · W to W+2 h | Brief daily meditation trials. The book's month-by-month ladder is the author's scheme, so it isn't used. |
| Stress 5: morning cortisol "stack" | **Morning start** card on Today (D80) | **Core, changed by the founder (D80)** | 4 ticks (daylight, water, movement, optional coffee or tea) + a typical cortisol-rhythm curve · W to W+3 h | Light, exercise and caffeine each raise cortisol in studies; a steeper day-to-night slope is linked with better health (observational). The curve is a typical rhythm, not a measurement. Water counts for hydration only. |
| Stress 6: anti-stress supplements | none | Out | athlete may log their own | none |

**Nutrition**
| Book protocol | Arcwell habit | Verdict | Tracker · window | Evidence and notes |
|---|---|---|---|---|
| Nutrition 1: 90% unprocessed or minimally processed | Whole-food share | **Core**, data-dependent | % of calories from minimally processed foods, weekly | Strong: an inpatient RCT on ultra-processed diets and umbrella reviews. **Needs a processing tag (NOVA class) on every food**: IFCT and the curated dishes don't have one. Until they do, show nothing rather than guess. |
| Nutrition 2: hydration (book formula) | Water | **Has** | existing | Keep the EFSA targets. For the race track, add the sweat-loss check (weigh before and after training) from ACSM fluid guidance. |
| Nutrition 3: protein at every meal, CP:C ratio | Protein target + protein per meal | **Has**, extended | per-meal grams | Daily target unchanged. Add "spread protein over meals" (about 0.3 to 0.4 g/kg a meal, reviews). The CP:C ratio is the book's own heuristic, so we don't adopt it. Showing "protein per 100 kcal" when sorting foods is a fact, not a target, and is fine. |
| Nutrition 4: vegetables, fruit, fibre | Fibre | **Has** | existing (25 to 29 g, EFSA/Lancet review) | Optional fruit and vegetable servings in a later phase. |
| Nutrition 5: healthy fats, saturated fat ≤10% | Saturated fat share | Optional | % of calories, weekly · Nutrition detail page | Strong (WHO guideline). The book's seed-oil avoidance is the author's opinion; leave it out. |
| Nutrition 6: 2 to 4 servings of low-sugar fermented foods | Fermented foods (curd, buttermilk, idli and dosa batter, kanji) | Optional (Limited) | count · daily | One small RCT (n = 36). It fits Indian diets well, so worth offering, labelled early evidence. |
| Nutrition 7: fatty fish or omega-3 | Fatty fish | Optional | weekly count · 1 to 2 servings | Dietary-guideline level for fish. No supplement dosing. Vegetarians see an honest note instead of a target. |
| Time-restricted eating, last meal 2 to 3 h before bed (chapter text) | none | Out | none | The book itself cites a year-long RCT showing no benefit beyond calories. The last-meal timing is weak. |

**Focus**
| Book protocol | Arcwell habit | Verdict | Tracker · window | Evidence and notes |
|---|---|---|---|---|
| Learning 1: phone in another room, short focus blocks | Focus block | Optional (Limited to Moderate) | timer (25 / 45 / 60 / 90 min) + "phone away" check · the athlete's focus hours | Phone-presence studies are mixed. Micro-break meta-analysis. A plain timer with no claims beyond "fewer interruptions". |
| Learning 1: caffeine, theanine, alpha-GPC, tyrosine, nicotine, prescription stimulants | none | **Out** | none | Supplements, drugs and nicotine: never suggested. |
| Learning 1: 40 Hz binaural beats, noise colours, hypnosis app, cyclic hyperventilation, cold for focus | none | Out | none | Mixed or small evidence. The hypnosis app has an advisor tie. Hyperventilation carries a drowning and blackout risk. |
| Learning 1: exercise before focus work | none (covered by Movement) | none | none | none |
| Learning 2: WOOP / mental contrasting | **If-then plan** on any goal or habit ("If X gets in the way, I will Y") | **Core** | one-time, editable | Strong for implementation intentions (meta-analyses) and Moderate for mental contrasting. Fits onboarding goals and the race goal. |
| Learning 3: aim for about 15% errors | none | Out | none | It comes from a modelling study, and we have no learning feature. |
| Learning 4: sleep after learning | (Sleep) | none | none | none |
| Learning 5: micro-rests | Optional chime in the focus block | Optional | setting | Micro-break meta-analysis. |
| Learning 6: self-testing | none | Out | none | Strong evidence, but not a fitness-app job. |

**Personal growth (all out of scope)**
| Book protocol | Verdict | Why |
|---|---|---|
| Growth 1: present-focused attention | Out | No dose; not measurable. |
| Growth 2: a psychologist's daily guide (gratitude, alone time, hobbies) | Out (gratitude possible later) | Clinical-experience advice from a podcast, not trials. Gratitude trials show small effects; revisit after launch if wanted. |
| Growth 3: expressive writing, 4 days | Out | Mood can dip after sessions (the book says so); needs crisis signposting. Free-text trauma writing is sensitive data under DPDP. |
| Growth 4: grief reframing | Out | Mental-health care. The book itself says it doesn't replace grief therapy, and its 10 to 30 min dose has no cited trial. |

**Tally:** 47 book protocols →
- 11 core;
- 15 optional habits or tools;
- 3 extend existing nutrition targets;
- 1 setup tip;
- 1 later (travel mode);
- 1 covered by another habit;
- 15 out.

Because the chapters repeat each other, the 11 core protocols merge into **9 core habits** in the app:
- morning daylight;
- wind-down;
- same wake time;
- caffeine cut-off;
- daily steps;
- walk after a meal;
- weekly cardio;
- whole-food share;
- if-then plans.

Three of these are already in Arcwell.

### 2.3 Tracker types (what the database models)
| Type | Example | Logged by |
|---|---|---|
| `check` | Morning daylight done | one tap on the Today tile |
| `minutes` | 20 min daylight | tile sheet stepper |
| `count` | 2 servings of fermented food | stepper |
| `clock_time` | last caffeine at 13:40 | "now" button or time picker |
| `amount` | steps, grams | device or manual |
| `timer` | NSDR, breathing, focus block, cold | built-in timer (it logs itself) |
| `rating` | 1 to 5 (only where a habit needs it, for example energy after NSDR) | sheet |
| `derived` | Same wake time (from sleep data), whole-food share (from the food log), cardio minutes (from workouts) | computed, never asked |

Prefer `derived` whenever data already exists, so the athlete never logs the same thing twice.

### 2.4 Inputs the habits need (asked only when a habit needs them)
- Usual wake time and bedtime, weekday and weekend (already asked in onboarding D52 Recovery; reused).
- City, for sunrise and sunset; no GPS.
- Focus hours (only if Focus block is turned on).
- Safety screen answers (only for gated habits).
- Device data through Health Connect (steps, sleep, heart rate, HRV, resting heart rate), already planned in D60.

### 2.5 Biometric inputs
- Steps.
- Sleep start, end and stages.
- Resting heart rate.
- HRV.
- Heart rate during workouts (for zone minutes).
- VO2max estimate (from devices that write it).
- Weight (existing).
- Fitness-test results.

All are stored as time-series samples (section 5).

---

## 3. Task 2: HYROX

### 3.1 What the race demands
- 8 × 1 km runs, each followed by one station, always in this order:
  1. SkiErg 1,000 m
  2. Sled push 50 m
  3. Sled pull 50 m
  4. Burpee broad jumps 80 m
  5. Row 1,000 m
  6. Farmers carry 200 m
  7. Sandbag lunges 100 m
  8. Wall balls 100 reps
- Time spent moving between the runs and the stations (the "Roxzone") counts toward the finish time.
- Divisions: Open and Pro for women and men, Doubles (women, men, mixed), Relay (4 people), and age groups.

Singles loads for the 25/26 season (sled weights include the sled; check against the official rulebook each season):

| Station | Women Open | Women Pro / Men Open | Men Pro |
|---|---|---|---|
| Sled push | 102 kg | 152 kg | 202 kg |
| Sled pull | 78 kg | 103 kg | 153 kg |
| Farmers carry | 2 × 16 kg | 2 × 24 kg | 2 × 32 kg |
| Sandbag lunges | 10 kg | 20 kg | 30 kg |
| Wall balls | 4 kg to 2.70 m | 6 kg (women to 2.70 m, men to 3.00 m) | 9 kg to 3.00 m |

The SkiErg, row and burpee broad jumps are the same in every division. Loads and rules change between seasons, and some sources already quote 26/27 rulebooks. So **all race data lives in tables tagged by season, never in code**, and someone owns updating it each season (open question 7).

Our exercise library already has every station except a sandbag walking lunge, which needs adding. The library's existing set types (distance and time, weight and distance, weight and reps) already cover every segment.

### 3.2 Who sees HYROX (progressive disclosure)
| Athlete | Sees |
|---|---|
| No race goal (almost everyone) | Nothing HYROX. The station exercises sit in the library as normal exercises. One line in the goal picker and one card in the Programs catalog are the only doors in. |
| Self-guided, sets a race goal | A Race section in Training (the 4th section tab, allowed by D61). A race countdown on Today in the last 12 weeks. A "Race sim" tile in the + sheet. The plan switches to hybrid-race. |
| Coached, coach assigns a hybrid program or sets a race goal | The same; the coach's program is the plan. |
| Race goal completed or cancelled | The Race section hides; the plan returns to the previous goal; sims stay in History. |

Entry points:
- An onboarding goal option, "Train for a HYROX race". It asks 4 extra questions only if chosen: race date, division, recent 5 km time, and kit access (sled, SkiErg, rower, wall-ball target).
- "I have a race" in Profile.
- The Programs catalog card.
- A coach assigning a race goal or program.

### 3.2b Race questions by level (founder request, 2026-11-13)
Athletes who pick the race goal answer race questions instead of the goal-weight question. The general body, training, recovery and food questions stay, because calories and recovery need them.

| Everyone | First race | Raced before | Advanced (Pro, podiums, qualifying) |
|---|---|---|---|
| Raced before? · weeks to race · division and kit · running now (km a week) · recent 5 km time (skipped if not running yet) | Stations tried · aim (finish, run every km, or a target time) · target time if the aim is a time | Best finish time · that race's division · where time was lost (up to 3: running, slowing on later runs, Roxzone, any station) · target time | Everything in Raced before, plus in-race run pace and the season goal (personal best, age-group podium, World Championships) |

**How the answers shape the plan (`features/science/hybrid.ts`):**
- First races: at most 5 days a week; untried stations are practised first at light loads.
- Weak areas: weak stations first, with one extra round; notes for Roxzone and late-race fade.
- Running: easy-run length follows current weekly km (run-walk for non-runners).
- Paces: interval and race paces come from the 5 km time (race pace about 1.25 × 5 km pace, from in-race running at about 84% of threshold speed in Pro men, gutierrezhellin2026hyrox) or from the advanced athlete's real race pace. These are starting estimates, replaced by sim splits.
- Advanced athletes: compromised running from Base and 1 km repeats instead of 400 m.

**What the research says by level:**
- First-timers mostly lose time on the sleds, sandbag lunges, wall balls and transitions, and slow down on later runs.
- Running is about half of race time (rappelt2026hyrox, brandt2025hyrox).
- Strength stations cost slower athletes the most.
- Elite athletes are even across stations.

Finish-time averages from third-party sites disagree, so the app quotes none.

### 3.3 The hybrid-race plan (rules in `features/science/hybrid.ts`, D69 sources to verify)
**Phases, counted back from race day:**
- **Base:** more than 16 weeks out.
- **Build:** 16 to 8 weeks out.
- **Specific:** 8 to 2 weeks out.
- **Taper:** the final 7 to 14 days. Cut volume by about 40 to 60% and keep intensity and session frequency (taper meta-analysis).

A race less than 8 weeks away starts in Specific, with a warning that the time is short.

**Sessions per week by days available:**
| Days | Strength | Runs | Hybrid (stations plus compromised running) |
|---|---|---|---|
| 3 | 1 full body | 1 intervals | 1 |
| 4 | 2 | 1 easy | 1 |
| 5 | 2 | 2 (1 easy, 1 threshold or intervals) | 1 |
| 6 | 2 | 3 (easy, threshold, long easy) | 1 |

**Rules:**
- **Intensity mix:** about 80% of endurance time easy and 20% hard (polarised or pyramidal distribution, endurance research).
- **Strength:** 2 sessions, compound-led. A lower weekly set target than the hypertrophy plan (about 6 to 10 hard sets per major muscle) at 1 to 3 reps in reserve. No sets to failure on lower-body lifts within 48 h before a key run.
  - Source: concurrent-training meta-analyses, which find little effect on hypertrophy and maximal strength when sessions are spread out and some loss of explosive strength.
  - Same-day order: strength first if strength is the limiter, run first if running is; when possible keep sessions at least 6 h apart.
- **Running load:** progress gradually. Flag any single run more than about 10% longer than the longest run in the last 30 days (recent running-injury cohort; verify).
- **Stations:** technique work from Base. Race-load exposure from Build (sleds weekly in Specific).
- **Compromised running:** 1 km runs straight after stations, from Build onwards.
- **Simulations:**
  - A half sim (4 runs + 4 stations) every 3 to 4 weeks in Build.
  - One full sim 3 to 5 weeks out.
  - None in the final 10 days.
- **Recovery link (D60):** a sim or race counts as top strain. The next day's outlook suggests an easy day. Coached athletes' coaches see it.
- **Nutrition link:**
  - Carbohydrate guidance scales with training load (sports-nutrition position stands: roughly 3 to 5 g/kg a day for moderate training, 5 to 7 g/kg for heavy).
  - Shown only on the race track, as a range with "Why this?".
  - Protein stays as it is.
  - Sweat-loss check for hydration.

### 3.4 The race simulator
**Session types:**
- Full sim (8 + 8).
- Half sim (4 + 4).
- Compromised run (choose stations).
- Station test (one station for time).
- Run test (1 km or 5 km).
- Custom.
- **Race** (a real event, logged live or entered afterwards).

**Race mode (live):**
- Full screen; the dock and tab bar are hidden (like a workout in progress).
- One very large "Next" button: the whole lower half of the screen.
- A lap timer shows the current segment, its target split and the gap to target.
- Optionally, Roxzone is timed separately with two taps per station (in and out).
- Undo the last split. Pause in training sims only.
- Light haptics on each split; the screen stays awake.
- Time is computed from saved timestamps, not a running timer, so an app kill or phone lock loses nothing. The in-progress sim is cached on the phone, like the in-progress workout.
- Equipment substitutions per segment, set before starting, from library exercises. For example, a treadmill push with the motor off instead of the sled push, or a heavy dumbbell walk instead of a sled pull. They are marked on the results so they aren't compared with real station times.

**Results:**
- Total time.
- A stacked bar: run vs stations vs Roxzone.
- A per-segment table with the difference from the previous sim and from the target.
- Run pace across the 8 runs (how much the pace fades).
- Station bests.
- A predicted race time from recent components, labelled "estimate".
- No external rankings (no licensed result data).

**Pacing plan:** turns a target time into target splits, based on the athlete's own run and station history, and shows them in race mode.

### 3.5 Coach side
- **Plan builder:** endurance blocks (distance or time, intensity by zone, effort or pace, intervals), station blocks that pull the division load automatically, and a "race sim" block. Plus a hybrid program template.
- **Client profile:** a Race section when the client has a race goal (countdown, phase, sims and splits, station bests), following the join-date visibility rules.

### 3.6 Name and trademark
HYROX is a registered trademark. Using the word to say "train for a HYROX race" is normally fine, but:
- no HYROX logo or visual style;
- no wording that implies a partnership.

Add this to SPEC's known risks next to the "Arcwell" trademark, and check it with the same IP review.

---

## 3B. VO2 max training ("Cardio fitness", proposed D79)

An opt-in module of regular Training, for anyone who wants it, whatever their main goal. HYROX reuses the same engine. It replaces the "Weekly cardio" and "Fitness test" rows in 2.2 for athletes who turn it on; for everyone else, neither appears.

### 3B.1 What the research says (every source is verified on PubMed in step 1)
- **Why it matters.**
  - Cardiorespiratory fitness (VO2 max) is one of the strongest predictors of all-cause and cardiovascular mortality. In a large meta-analysis, each 1-MET (3.5 ml/kg/min) higher fitness went with roughly 13% lower all-cause mortality (Kodama 2009), and an overview of systematic reviews confirms the pattern (Lang 2024).
  - These are associations, but training trials show VO2 max rises reliably with training, so it is a target worth training.
- **What raises it most.** Both steady aerobic work and intervals raise VO2 max; intervals near maximum effort raise it more per minute.
  - **Meta-analyses:** Bacon 2013, Milanović 2015, Wen 2019. Longer intervals (2 minutes or more), more total work and programmes of several weeks did best.
  - **Direct comparison:** 4 × 4 minutes at 90 to 95% of max heart rate, with 3 minutes easy between, beat long slow running and threshold running (Helgerud 2007).
  - **Sprint intervals:** 4 to 6 × 30 seconds all-out also work in far less time, but they are harder to tolerate (Gist 2014).
  - **Short intervals:** repeated short intervals (for example 30 s on, 15 s off) work well in trained people (Rønnestad 2015).
- **Dose.**
  - One to two interval sessions a week on top of easy aerobic work is enough for most people. The biggest gains come in the first 6 to 12 weeks.
  - People who barely improve usually do improve with more training rather than being "non-responders" (Montero & Lundby 2017).
  - For people doing a lot of cardio, mostly easy with a small amount very hard works best (Stöggl & Sperlich 2014).
- **Alongside lifting.**
  - Combined training mostly preserves muscle growth.
  - Interference with lower-body strength and power is bigger with running than cycling, and when sessions are close together (Wilson 2012, Sabag 2018, Schumann 2022).
  - So for hypertrophy-first athletes, intervals go on non-leg days or at least 6 hours apart, ideally on a bike, rower or SkiErg.
- **Measuring without a lab.**
  - Watch estimates (moderate accuracy; verify the validation meta-analysis before using any error figure).
  - The 12-minute Cooper run (Cooper 1968) or the 1-mile Rockport walk for beginners and older adults (Kline 1987).
  - A rough non-exercise estimate from age, sex, resting heart rate and activity (HUNT model, Nes 2011).
  - Results are placed against age and sex percentiles from the FRIEND registry (Kaminsky 2022).
- **Safety.**
  - The PAR-Q+ questionnaire before hard intervals or tests (Warburton 2011).
  - In the Generation 100 RCT, 4 × 4 sessions twice a week were feasible and safe for adults aged 70 to 77 (Stensvold 2020).
- **The book's VO2 content** (Exercise protocol 3) matches the research: one short near-max session a week (30 s hard / 60 s easy × 6 to 12, or 4 × 4), plus moderate and long easy sessions. We use the research-backed versions above, not the book's own heart-rate rules.

### 3B.2 Who sees it
- **Only athletes who turn on Cardio fitness.** It's on by default only for the "general fitness" and HYROX goals, and can be switched off.
- **Or whose coach assigns interval sessions.**
- **Running is a separate choice.** Without it, every session uses the machines the athlete picked.

### 3B.3 How it fits the plan (rules in `features/science/cardio.ts`)
**Starting level** comes from the best estimate available:
1. a recent test;
2. otherwise the watch;
3. otherwise the non-exercise estimate.

The level is beginner, intermediate or advanced, and the result is shown as a percentile for the athlete's age and sex.

**Weekly prescription:**
| Level | Intervals | Easy aerobic |
|---|---|---|
| Beginner | 1 a week: start at 4 × 2 min "hard but steady" (effort 7 to 8 out of 10), building to 4 × 4 min over about 6 weeks | 1 × 20 to 30 min |
| Intermediate | 1 to 2 a week: 4 × 4 min or 5 to 6 × 3 min at 90 to 95% of max heart rate | 1 to 2 × 30 to 45 min |
| Advanced or short on time | 2 a week, rotating long intervals, short intervals (e.g. 3 sets of 13 × 30 s / 15 s) and, for time-poor athletes, 4 to 6 × 30 s sprints | 2 × 30 to 60 min |

**Rules:**
- **Placement with lifting:**
  - Intervals go on upper-body or rest days.
  - Never within 6 hours of a lower-body session, and never the day before a heavy leg day.
  - If the athlete has few days, a short interval block goes after upper-body lifting.
  - The interval count respects the days the athlete allowed for cardio.
- **Intensity targets:**
  - With a heart-rate device: 85 to 95% of max heart rate (Tanaka formula, or the athlete's own tested max). The first minute of each interval is ignored, because heart rate lags.
  - Without one: effort 8 to 9 out of 10, "only a few words at a time".
- **Progression:**
  - Add one interval, or one minute per interval, every 1 to 2 weeks while the targets are met.
  - Every 4th week is lighter.
  - Retest every 6 to 8 weeks.
- **Recovery link (D70):** on a low-recovery day, the interval session is suggested as an easy session instead, or moved. It changes only if the athlete accepts.
- **Strain link (D60):** interval sessions count toward strain using effort × minutes.

### 3B.4 Screens
**Training > Plan gets one "Cardio fitness" card** (only with the module on). It shows the current VO2 max estimate and its trend, the percentile for age and sex, and the next interval session.

**Interval timer (live session):**
- Full screen.
- Work and rest phases in different colours, with the round count.
- Heart-rate zone if a device is connected, otherwise the effort cue.
- A haptic on each phase change.
- Saved as an endurance session with its intervals.

**Fitness test flow:**
1. The safety screen (PAR-Q+).
2. A choice of Cooper 12-minute run, Rockport walk, or the watch estimate. Bike and rower tests are added only if step 1 finds a validated field protocol for them.
3. The result, with its percentile and "Why this?".

**Cardio detail page:** VO2 max trend, minutes per week at 85% of max heart rate or above, sessions done, sources.

**Coach builder:** interval blocks (work, rest, rounds, intensity), already in the program-block schema (5.4).

---

## 4. Task 3: keeping it simple (the clutter rules, proposed as D77 and D78)

### 4.0 First rule: the athlete decides what exists (D78)
Everything beyond the main goal is a **module** the athlete turns on. A module that's off leaves no trace:
- no Today card;
- no section tab;
- no sessions in the plan;
- no reminders;
- no habit suggestions;
- no "you should try this" prompts.

Hiding something never deletes its history.

| Module | On by default | What it adds when on |
|---|---|---|
| **Main goal training** (always on) | always | The plan and logging for the chosen goal: build muscle, get stronger, lose fat, recomposition, general fitness or HYROX |
| **Cardio fitness (VO2 max)** | only for "general fitness" and HYROX goals | Cardio card, interval sessions in the plan, fitness tests (3B) |
| **Running** | only for HYROX | Running sessions and run tests. Otherwise cardio uses the machines the athlete picked |
| **Daily movement** | off | Steps and walk after a meal |
| **Sleep and light habits** | off | Morning daylight, wind-down, caffeine cut-off, same wake time |
| **Calm tools** | off (Recovery's breathing screen stays where it is) | Breathing, NSDR and meditation as Today habits; cold with its safety check |
| **Mobility** | off | 10-minute mobility |
| **Focus** | off | Focus block, if-then plans |
| **Race** | only with a race goal | The Race section, the simulator and the hybrid-race plan |

**Example: a hypertrophy-only athlete sees:**
- Today: the workout, calories and protein, weight.
- Training: Plan · History · Exercises.
- Nutrition and Recovery as they are today.

There are no cardio sessions, steps, habits, VO2 max or HYROX anywhere, and no reminders about them. The only places any module is mentioned are the "What Arcwell shows" settings page and the Programs and habits libraries, where the athlete goes on their own.

**How preferences are set:**
- **Onboarding: one optional screen after the goal.** It asks "Anything else you'd like help with?", with chips for the modules and "Just my main goal" selected by default.
  - Under the cardio chip, one honest line: cardio fitness is closely linked to long-term health, and it can be added any time.
  - That's the only time Arcwell mentions it unprompted.
- **"What Arcwell shows"** (side menu > Account): one switch per module.
  - Turning a module on runs its just-in-time setup (2.4), for example the safety screen or picking cardio machines.
  - Turning it off hides it at once.
- **Per-module choices:**
  - Cardio machines the athlete is happy to use (bike, rower, SkiErg, run, incline walk, stairs, swim). Running is never assumed.
  - How many days a week, and which days, cardio may use.
- **Coached athletes:** the coach's assigned training always shows; the coach plan wins for training. The athlete's preferences still control habits and reminders. The coach sees the client's choices read-only, so they can plan around them.

**How it's enforced in code:**
- One `useVisibility()` hook (4.4) combines tier, coached flag, race goal and preferences.
- Every card, route, section tab, notification and plan-generator input asks it by module key.
- The plan generator only creates cardio sessions when the Cardio module is on, and only on the chosen machines.
- Unit tests prove a hypertrophy-only athlete's Today selector and plan contain no cardio, habit or race items. The QA route sweep includes a hypertrophy-only athlete.

### 4.1 Hard limits
1. **Today:** one hero card, up to **three** tiles in a 2-column bento grid, and the dock (D68). Everything else goes under one "Later today" row that expands. Cards are solid; glass stays on the functional layer only (D67).
2. **Five active habits at most, and none unless the athlete chose a habit module.**
   - Someone who turns on Sleep and light habits starts with up to **three**, suggested from their answers. For example, poor sleep → wind-down and caffeine cut-off.
   - More unlock after two weeks. The library says why: fewer habits stick better.
3. **A habit shows only inside its window.**
   - Morning light appears at wake time and leaves 60 min later.
   - The caffeine cut-off appears from B−10 h to B−8 h.
   - Wind-down appears from B−60 min.
   - Outside its window a habit lives only in the library.
4. **No new bottom tabs.** At most four section tabs (D61). The Race section only exists for race athletes. Habits live inside existing tabs (2.1).
5. **One number or one action per card.** Details are one tap deeper; science is behind "Why this?" (existing).
6. **Notification budget:** at most **two** habit nudges a day, chosen by the athlete. Quiet from bedtime to wake time. No nudge for a habit already done.
7. **Ask just in time.** Onboarding gets only one optional "anything else?" screen (4.0) and the race goal branch. A module or habit asks for its inputs (city, focus hours, cardio machines, the safety screen) the first time it's turned on.
8. **One tap to log.**
   - Tapping a tile ticks it; long-press opens the sheet.
   - Timers log themselves.
   - Device data ticks habits automatically (steps, wake time, cardio minutes).
9. **No guilt.**
   - Weekly consistency ("5 of 7 days"), not streaks.
   - Missed habits aren't shown in red.
   - Nothing appears for a habit never started.

### 4.2 Today across the day (example athlete with habits, daily movement and calm tools on: wake 06:30, bed 22:30, race goal off; a hypertrophy-only athlete sees only the workout and food cards)
| Time | Hero | Tiles (max 3) | Later today |
|---|---|---|---|
| 06:30 to 07:30 | Morning check-in (D60) | Morning daylight · Water · 5-min meditation (if active) | Workout, caffeine cut-off |
| 07:30 to 12:30 | Today's workout | Steps · Protein so far · Focus block (in focus hours) | Walk after lunch, cut-off |
| 12:30 to 14:30 | Today's workout or the next meal | Caffeine cut-off (from B−10 h) · Walk after a meal (30 min after a logged meal) · Steps | Afternoon daylight |
| 14:30 to 21:30 | Workout, or "Done today" summary | Afternoon daylight · Steps · Water | Wind-down |
| 21:30 to bed | **Evening mode:** Wind-down (lights low, screens away) | Tomorrow's plan · Bedtime from the sleep planner | none |
| After a workout (2 h) | Recovery card: protein, a cold-water guard ("not for 6 h after lifting") | | |
| Race athlete, last 12 weeks | Race countdown and this week's key session (replaces the workout hero) | | |

The selector ranks candidate cards by:
1. a hard window (the card is due now);
2. what today's data suggests (for example, after a 4-hour night it shows NSDR and a lighter day, D70);
3. what the athlete chose;
4. coach-assigned before self-chosen.

It keeps the top four (one hero and three tiles).

### 4.3 Depth layers
- **L0:** a Today tile (state plus one action).
- **L1:** the habit sheet (how to, today's log, the timer).
- **L2:** the habit page (week view, settings, window, reminders).
- **L3:** "Why this?" with sources (existing).

The library is a separate L2 page, reached from the side menu ("Daily habits") and from Recovery.

### 4.4 State management
- **Server state:** one repository per area (`protocols`, `race`), replacing the sample store, as B1 already plans for the rest of the app. Add TanStack Query for caching, retries and offline reads; no global store.
- **Derived state:** `selectToday(input, now)` is a pure function in `features/protocols/now.ts`. Its inputs are wake and bed times, active habits, today's logs, the training day, the recovery score, tier, the coached flag and the race goal. It is unit-tested, with no network and no clock inside it.
- **Clock:** a `useNow()` hook ticking each minute and re-reading when the app returns to the foreground.
- **Visibility:** one `useVisibility()` hook for tier, coached flag, race goal, module preferences, active habits and AI permission. Screens never check tiers or preferences themselves; the server repeats every tier check (B7).
- **Sim state:** a pure reducer over timestamped events (start, split, undo, finish), saved to the phone after every event and synced like workouts.
- **Content:** the habit catalog and race data ship as typed static data in the front-end phases (like `sources.ts`), then come from the reference tables in the backend phases.

---

## 5. Data schema (Supabase Postgres)

Conventions (from AGENTS.md and D62):
- RLS on every table.
- Reference tables: everyone signed in can read; only the service role writes.
- Athlete tables: the athlete owns them. A coach reads only while linked, only from the join date unless history is granted, and access stops when the link ends. The existing `coach_clients` helpers are reused.
- Every change is a migration, with pgTAP tests in `supabase/tests/`.
- The "Slice" column says which backend slice builds each table.

### 5.1 Enums
- `habit_area`: sleep_light, movement, calm, nutrition, focus
- `evidence_level`: strong, moderate, limited
- `tracker_kind`: check, minutes, count, clock_time, amount, timer, rating, derived
- `window_anchor`: wake, bed, sunset, after_meal, after_workout, focus_hours, anytime
- `habit_origin`: self, coach, suggested
- `habit_status`: active, paused, ended
- `log_source`: manual, timer, device, derived
- `race_segment_kind`: run, station, roxzone
- `sim_kind`: full_sim, half_sim, compromised, station_test, run_test, custom, race
- `race_goal_status`: active, completed, cancelled
- `program_kind` (in B2): general, hypertrophy, strength, hybrid_race
- `session_kind` (in B3): strength, endurance, hybrid, race_sim, mobility, walk

### 5.2 Reference tables (read-only to users)
| Table | Columns | Slice |
|---|---|---|
| `evidence_sources` | id text pk, pmid text, doi text, citation text, year int, study_type text, claim text, caveat text, verified_at timestamptz, verified_by text | B2 |
| `habits` | id text pk (slug, e.g. `morning-daylight`), area, name, summary, steps jsonb, tracker tracker_kind, unit text, default_target numeric, target_min numeric, target_max numeric, window jsonb {anchor, start_min, end_min}, evidence evidence_level, safety jsonb {screen_ids[], never_with[], min_gap_after_strength_min}, min_tier text ('free' or 'plus'), coach_assignable bool, version int, retired_at timestamptz | B2 |
| `habit_sources` | habit_id fk, source_id fk, pk (habit_id, source_id) | B2 |
| `race_formats` | id text pk ('hyrox'), name, season text ('25/26'), active bool | B2 |
| `race_format_segments` | format_id fk, ordinal smallint (1 to 16), kind race_segment_kind, station_key text, distance_m int, reps int, exercise_id fk to library, pk (format_id, ordinal) | B2 |
| `race_divisions` | id text pk ('open_women' and so on), format_id fk, label, team_size smallint, is_pro bool | B2 |
| `race_division_loads` | division_id fk, station_key, load_kg numeric, implement text, target_height_m numeric, pk (division_id, station_key) | B2 |

### 5.3 Athlete tables
| Table | Columns and constraints | Who can do what | Slice |
|---|---|---|---|
| `athlete_preferences` (D78) | athlete_id pk fk profiles; modules text[] checked against the module list (cardio_fitness, running, daily_movement, sleep_light, calm, mobility, focus); cardio_modalities text[] (bike, rower, skierg, run, incline_walk, stairs, swim); cardio_days smallint[] (0 to 6); hr_max_override smallint null; resting_hr smallint null; habit_nudges_per_day smallint default 2 check 0 to 2; updated_at | athlete read/write; linked coach reads while linked (to plan around it), never writes | B1 (it's read by every slice after) |
| `athlete_rhythm` | athlete_id pk fk profiles, wake_time time, bed_time time, weekend_wake time, weekend_bed time, timezone text, city text, focus_start time, focus_end time, updated_at | athlete read/write; linked coach reads while linked | B6 |
| `athlete_habits` | id uuid pk, athlete_id, habit_id fk, origin habit_origin, assigned_by uuid null (coach), target numeric null, window_override jsonb null, reminder_time time null, safety_ack_at timestamptz null, status habit_status, started_at, ended_at, **unique (athlete_id, habit_id) where status = 'active'**, a trigger caps active habits at 5 and refuses gated habits without safety_ack_at, a check that min_tier allows it | athlete inserts self rows and can pause any; coach inserts or updates origin = 'coach' rows for active clients only; coach reads per the join-date rule | B6 (B7 adds the tier check) |
| `habit_logs` | id uuid pk, athlete_id, habit_id fk, local_date date, occurred_at timestamptz, value numeric null, done bool, source log_source, workout_session_id uuid null, created_at, index (athlete_id, local_date) | athlete read/write own; coach reads where occurred_at ≥ the visible-from date and the link is active | B6 |
| `biometric_samples` | id uuid pk, athlete_id, metric text (steps, sleep_minutes, hrv_ms, rhr_bpm, resp_rate, spo2, vo2max_est, hr_zone_minutes), value numeric, unit text, start_at, end_at, source text (manual or the Health Connect app id), external_id text, **unique (athlete_id, source, external_id)** to stop duplicates | athlete read and insert; coach reads per the join-date rule; device inserts need a `device_data` consent row | B6 (sync after the dev build) |
| `fitness_tests` | id uuid pk, athlete_id, test text (cooper_12min, rockport_walk, mile, run_1km, run_5km, nonexercise_estimate), result numeric, unit, vo2max_est numeric (computed by the documented equation for that test), inputs jsonb (for example heart rate at the end of the walk; the non-exercise answers), tested_at, workout_session_id null | as above | B6 |
| `goal_plans` (if-then plans) | id uuid pk, athlete_id, goal_ref text (onboarding goal, race goal id or habit id), wish text, obstacle text, plan text, updated_at | athlete only; **coach can't read** (personal) | B6 |
| `race_goals` | id uuid pk, athlete_id, format_id, division_id, race_date date, event_name text, target_seconds int null, status race_goal_status, created_by uuid, created_at, **unique (athlete_id) where status = 'active'** | athlete read/write; coach read/write for active clients; coach reads per the join-date rule | B3 |
| `race_sims` | id uuid pk, athlete_id, workout_session_id uuid unique fk (B3 sessions, so sims count in history and strain), race_goal_id null, format_id, division_id, kind sim_kind, started_at, finished_at, total_seconds int, is_race bool, notes text | as habit logs | B3 |
| `race_sim_splits` | sim_id fk on delete cascade, ordinal smallint, segment_kind, station_key null, distance_m int null, reps int null, load_kg numeric null, seconds int, avg_hr int null, substitute_exercise_id null, pk (sim_id, ordinal) | visibility follows the parent sim (policy uses EXISTS on `race_sims`) | B3 |

**Views** (security_invoker, so RLS still applies):
- `race_station_bests` (best time per station per division, without substitutions).
- `habit_week` (done days per habit per week).
- `cardio_week` (minutes by intensity from sessions and heart-rate samples).
- `vo2_trend` (one series from fitness tests and device VO2 max samples, each point tagged with its source).

### 5.4 Changes to tables already planned in B2 and B3 (not built yet, so no migration is edited)
- `programs.kind program_kind`.
- `program_blocks`:

  | Column | Type |
  |---|---|
  | block_id | id |
  | day_id | fk |
  | ordinal | int |
  | block_kind | strength_exercise, endurance, interval_set, station, race_sim |
  | exercise_id | null |
  | prescription | jsonb: sets, reps and reps in reserve for strength; distance_m or duration_s plus intensity {zone, effort or pace_s_per_km} for endurance; work_s, rest_s and rounds for intervals; division-linked load for stations |

  Stored as one validated jsonb rather than a column per sport. It's checked by a Postgres check function and by the same TypeScript schema on the phone.
- `workout_sessions.kind session_kind`.
- Sets carry nullable kg, reps, distance_m, duration_s and avg_hr, matching the library's set types.

### 5.5 pgTAP tests to add
1. Coach A can't read coach B's client in any new athlete table (rhythm, habits, logs, samples, tests, race goals, sims, splits).
2. A coach sees logs, samples, sims and splits only from the join date, unless history is granted. Access ends when the link ends.
3. A coach can add or change only `origin = 'coach'` habits, only for active clients, and never edits the athlete's own rows.
4. A coach can never read `goal_plans`.
5. Reference tables are readable by any signed-in user and not writable.
6. Uniqueness: one active race goal; one active row per habit; the five-habit cap; a gated habit can't be activated without `safety_ack_at`.
7. Splits are visible only when their parent sim is visible.
8. Tier: a free athlete can't activate a Plus-only habit (if open question 2 makes any habits Plus). A coached athlete can activate any coach-assigned habit.
9. A device sample insert fails without a `device_data` consent.
10. `athlete_preferences`: only the athlete writes. A linked coach reads it and loses access when the link ends. An unknown module name is rejected.

---

## 6. Front-end architecture (which screens get what)

### 6.1 New modules
| Path | What |
|---|---|
| `features/science/habits.ts` | Habit rules: windows, targets by sky or age, safety gates, the cold-after-strength guard, the five-habit cap. Pure functions. |
| `features/science/hybrid.ts` | Hybrid-race plan rules (3.3): phase, weekly template, intensity mix, taper, sim schedule. |
| `features/protocols/catalog.ts` | Typed habit catalog (mirrors `habits`). |
| `features/protocols/now.ts` | `selectToday()` card selector (4.2). |
| `features/protocols/` components | `HabitTile`, `HabitSheet`, `HabitTimer` (reuses Breathe), `WindDownMode`, `SafetyScreen`, `IfThenPlan`. |
| `features/race/data.ts` | Formats, segments, divisions, loads (season-tagged). |
| `features/race/sim.ts` | Sim reducer over timestamped events, predictions, pacing plan. |
| `features/race/` components | `SplitButton`, `SegmentRow`, `SplitsTable`, `PaceFadeChart`, `RaceCountdown`. |
| `features/entitlements/useVisibility.ts` | One visibility hook: tier, coached flag, race goal and module preferences (4.0, 4.4). Every card, route, section tab, notification and the plan generator ask it. |
| `features/science/cardio.ts` | VO2 max rules (3B.3): level from the estimate, weekly prescription, placement around lifting, progression, retest timing, test equations and FRIEND percentiles. |
| `features/cardio/` components | `CardioFitnessCard`, `IntervalTimer` (live), `FitnessTestFlow`, `Vo2Trend`. |
| test runner | Add `jest-expo` for the pure modules (selector, rules, sim reducer). The repo has no unit test runner today. |

### 6.2 Screens
**Athlete**
| Route | Change |
|---|---|
| `athlete/(tabs)/index.tsx` (Today) | Replace the stacked groups with the hero, the 3-tile bento, "Later today" and evening mode, all driven by `selectToday()`. The dock is unchanged. |
| `athlete/habits/index.tsx` (new) | Daily habits library by area: active ones on top, the cap shown, evidence badges. |
| `athlete/habits/[id].tsx` (new) | Habit page: how to, target, window, reminder, week view, "Why this?". |
| `athlete/habits/setup.tsx` (new) | Just-in-time setup: times, city, focus hours, safety screen. |
| `athlete/recovery/protocols.tsx` | Becomes "Suggested today" from the same catalog, linking to the library. Sleep gets the morning-light and wind-down cards and the bedroom tip. |
| `athlete/recovery/breathe.tsx` | Adds the long-exhale pattern next to box breathing. |
| `athlete/focus.tsx` (new) | Focus block timer (25/45/60/90 min), phone-away check, optional micro-rest chime. |
| `athlete/(tabs)/training.tsx` | Section tabs Plan · History · Exercises · **Race** (Race only with a race goal). The Plan page shows weekly cardio minutes and the fitness-test card. |
| `athlete/race/index.tsx` (new, Race section) | Countdown, phase, this week's key sessions, last sim, station bests, predicted time. |
| `athlete/race/setup.tsx` (new) | Race goal: date, division, target, kit access, if-then plan. |
| `athlete/race/sim/new.tsx` (new) | Sim type, division, substitutions, pacing plan. |
| `athlete/race/sim/live.tsx` (new) | Race mode (3.4). |
| `athlete/race/sim/[id].tsx` (new) | Results. |
| Onboarding `features/onboarding/questions.ts` | Adds the "Train for a HYROX race" goal and its 4-question branch. Adds the optional "Anything else you'd like help with?" module screen after the goal ("Just my main goal" by default). |
| `athlete/menu/shows.tsx` (new, "What Arcwell shows") | One switch per module; cardio machines and cardio days. |
| `athlete/cardio/index.tsx` (new) | Cardio detail: VO2 max trend, intensity minutes, sessions, sources. |
| `athlete/cardio/test.tsx` (new) | Fitness test flow with PAR-Q+. |
| `athlete/cardio/session/[id].tsx` (new) | Live interval timer. |
| Training > Plan | Cardio fitness card and interval sessions in the week, only with the module on. |
| + sheet (`QuickLog.tsx`) | "Race sim" only for race athletes; "Focus block" only if that habit is active; "Breathe" for everyone with Recovery. |
| Side menu | A "Daily habits" entry. |
| Nutrition detail | Protein per meal, saturated-fat share, and the whole-food share once foods carry a processing tag. |

**Coach**
| Route | Change |
|---|---|
| Client profile (`ClientSections.tsx`) | Habits section: assign, weekly consistency; never their if-then plans. Race section when the client has a race goal. |
| Recovery protocol builder (D56) | Picks from the same habit catalog. |
| Plan builder | Endurance, interval, station and race-sim blocks; the hybrid template; division loads filled in. |

---

## 7. Order of work

**Proposal: Builder 1 keeps going on B1 to B3 (the coach loop, D73). Builder 2 builds FE-8 and FE-9 on sample data at the same time.** The new tables are added inside B2, B3, B6 and B7 as each slice is built, so nothing waits on a new backend slice.

| Step | What | Done when |
|---|---|---|
| 0 | **Approve this plan.** Write D74 to D77 into DECISIONS.md. Update SPEC.md scope: habits, race track, the trademark risk, and "Out of v1" for growth, supplements and travel mode. Wireframe the Today bento, evening mode, the Race section and race mode in DESIGN.md before building. | Founder signs off on the wireframes. |
| 1 | **Evidence pass.** Check every core and optional habit's sources and the hybrid rules on PubMed (the FE-2 process). Add them to `sources.ts`. Write `habits.ts` and `hybrid.ts`. Add `jest-expo` and unit tests for both. | Every shipped habit has at least one verified source, and its claim matches it. Tests pass. |
| 2 | **FE-8a, preferences and habits core:** module preferences first (the onboarding "anything else?" screen, "What Arcwell shows", `useVisibility()` wired into every existing screen), then the catalog, `selectToday()`, Today bento and evening mode, library, habit page, just-in-time setup, safety screen, one-tap logging, the five-habit cap, notification budget. Uses existing sample data. | Free, Plus, coached and coach walkthroughs pass at 375 px and 130% text. No more than 3 tiles at any hour of a simulated day. A hypertrophy-only athlete sees no cardio, habit or race item on any route. |
| 3 | **FE-8b, Cardio fitness module (VO2 max):** `cardio.ts` rules with unit tests, starting estimate and fitness test flow with PAR-Q+, Cardio fitness card, interval sessions in the plan on the chosen machines and days, live interval timer, VO2 trend. | Plans for every level × machine × day count pass the placement rules (no intervals within 6 h of a lower-body session). Off means absent. |
| 3b | **FE-8c, area features:** long-exhale breathing, focus block, walk after a meal, fermented food and fish counts, protein per meal and saturated-fat share, if-then plans, coach habits section. | Same QA walk. |
| 4 | **FE-9a, race basics:** race data, race goal and onboarding branch, Race section, the plan switch, and the "hidden unless race goal" rule everywhere. | An athlete without a race goal sees no HYROX surface anywhere (checked route by route). |
| 5 | **FE-9b, simulator:** sim reducer with tests, race mode, results, substitutions, pacing plan, predictions. | A 90-minute sim survives app kill and phone lock with correct splits. |
| 6 | **FE-9c, hybrid plan and coach:** `hybrid.ts` plan generator, the coach builder's endurance, station and sim blocks, the client Race section. | Generated weeks pass the rules checks (intensity mix, strength spacing, taper). |
| 7 | **QA loop** as in FE-7: every screen as free, Plus, coached, race athlete and coach until nothing is left. Accessibility at 130% text. | Clean pass. |
| 8 | **Backend, inside the existing slices:** B1 (`athlete_preferences`), B2 (evidence, habits, race reference tables, program kinds and blocks), B3 (session kinds, race goals, sims, splits), B6 (rhythm, athlete habits, logs, samples, fitness tests and VO2 trend, if-then plans), B7 (tier checks). Each comes with migrations, RLS and the pgTAP tests in 5.5. | `npm run db:test` passes, including the new isolation tests. |
| 9 | **Devices:** Health Connect in the development build (steps, sleep, heart rate, HRV), then automatic ticking of derived habits. | Data is checked on a real Android phone. |
| 10 | **Expert review (D69):** the sports scientist and dietitian review `habits.ts`, `hybrid.ts` and the race nutrition ranges before launch. | Signed off. |

Rough size, relative to the earlier front-end phases: FE-8 about FE-3 + FE-5 + FE-4 (with the cardio module); FE-9 about FE-3 + FE-6. Step 1 is small but has to come first.

---

## 8. Open questions for the founder
1. **Scope:** SPEC's definition of done is real coaches running clients (D73). Should habits and HYROX ship in v1, or right after launch with the front end built now? This plan assumes they're built in parallel and launch together, but the backend order doesn't change either way.
2. **Tiers:** which habits are free?
   - Suggestion: free athletes get the core sleep and movement habits (up to 3).
   - Plus gets the full library, the Calm tools inside Recovery (already Plus), and the hybrid plan.
   - The race simulator itself is free, because logging is free in Arcwell.
3. **HYROX for self-guided athletes:** should the generated hybrid plan be Plus-only (like Programs, D71), or do coached-only first while coaches in India pick up HYROX clients?
4. **Focus:** keep the small Focus area (focus block and if-then plans), or drop it entirely to stay a fitness app?
5. **Gratitude:** leave growth fully out (recommended), or add gratitude later as one optional habit?
6. **Health Connect timing:** steps, wake time and cardio minutes work far better from a device. Should the development build (D62) move earlier so FE-8 can test real data?
7. **Race data owner:** who updates divisions and loads each HYROX season, and checks the rulebook?
8. **Trademark:** add HYROX to the planned IP review alongside "Arcwell".
9. **Cardio default:** cardio fitness is on by default only for "general fitness" and HYROX. Should "lose fat" also default to on, given cardio adds energy burn, or stay off and be chosen like everything else? (Recommended: off, chosen.)
10. **Cardio tier:** should the Cardio fitness module be free (the estimate, tests and one interval session a week) with the full progression in Plus, or Plus only like Programs (D71)?

---

## Appendix A: sources to verify on PubMed in step 1
These are candidates from the book's notes and the wider literature. None ships until it is checked.
- **Morning light, evening light and melatonin:**
  - Gooley 2011, J Clin Endocrinol Metab (room light before bed);
  - Chang 2015, PNAS (light-emitting e-readers);
  - Leproult 2001, J Clin Endocrinol Metab (morning bright light);
  - Brown 2022, PLOS Biol (daytime and evening light recommendations).
- **Sleep regularity:** Windred 2024, Sleep (UK Biobank).
- **Caffeine:** Drake 2013, J Clin Sleep Med (caffeine 0, 3 and 6 h before bed); Gardiner 2023, Sleep Med Rev (meta-analysis).
- **Alcohol:** Ebrahim 2013, Alcohol Clin Exp Res (review).
- **Naps:** Dutheil 2021 (meta-analysis of naps and performance), or the umbrella review the book cites.
- **NSDR / yoga nidra:** Datta 2021 (insomnia RCT); the yoga nidra systematic reviews.
- **Steps:** Paluch 2022, Lancet Public Health (meta-analysis); Banach 2023, Eur J Prev Cardiol.
- **Walk after a meal:** Buffey 2022, Sports Med (meta-analysis).
- **Activity guidelines:** Bull 2020, Br J Sports Med (WHO guidelines).
- **Fitness and mortality:** Mandsager 2018, JAMA Netw Open; Kodama 2009, JAMA (meta-analysis).
- **Max heart rate and the Cooper test:** Tanaka 2001, JACC; Cooper 1968, JAMA.
- **Range of motion:** Alizadeh 2023, Sports Med.
- **Breathing:** Balban 2023, Cell Rep Med (author's lab; disclose).
- **Brief meditation:** Basso 2019, Behav Brain Res.
- **Cold after strength training:** Roberts 2015, J Physiol; Fyfe 2019 (meta-analysis).
- **Ultra-processed food:** Hall 2019, Cell Metab (RCT); Lane 2024, BMJ (umbrella review).
- **Protein:** Morton 2018, Br J Sports Med (meta-analysis); Schoenfeld & Aragon 2018, JISSN (per meal).
- **Saturated fat:** WHO 2023 guideline.
- **Fermented foods:** Wastyk 2021, Cell (RCT, n = 36).
- **Fish:** AHA science advisory on seafood.
- **Fibre:** Reynolds 2019, Lancet.
- **If-then plans:** Gollwitzer & Sheeran 2006, Adv Exp Soc Psychol (meta-analysis); a mental contrasting meta-analysis.
- **Micro-breaks:** Albulescu 2022, PLOS One (meta-analysis).
- **Concurrent training:** Schumann 2022, Sports Med (meta-analysis); Wilson 2012, J Strength Cond Res (meta-analysis); Eddens 2018, Sports Med (exercise order); Sabag 2018, J Sports Sci (HIIT with resistance training).
- **VO2 max and mortality:** Kodama 2009, JAMA (meta-analysis); Lang 2024, Br J Sports Med (overview of systematic reviews); Mandsager 2018, JAMA Netw Open.
- **Raising VO2 max:**
  - Helgerud 2007, Med Sci Sports Exerc (4 × 4 vs other methods);
  - Bacon 2013, PLoS One; Milanović 2015, Sports Med; Wen 2019, J Sports Sci (interval meta-analyses);
  - Gist 2014, Sports Med (sprint intervals);
  - Rønnestad 2015 (short intervals);
  - Montero & Lundby 2017, J Physiol (response to dose);
  - Stensvold 2020, BMJ (Generation 100, older adults).
- **Estimating VO2 max:**
  - Cooper 1968, JAMA; Kline 1987, Med Sci Sports Exerc (Rockport walk);
  - Nes 2011, Med Sci Sports Exerc (non-exercise estimate);
  - Kaminsky 2022, Mayo Clin Proc (FRIEND percentiles);
  - a smartwatch VO2 max validation meta-analysis (find and verify).
- **Pre-exercise screening:** Warburton 2011, Health Fit J Can (PAR-Q+).
- **Endurance intensity distribution:** Stöggl & Sperlich 2014, Front Physiol.
- **Taper:** Bosquet 2007, Med Sci Sports Exerc (meta-analysis).
- **Running load spikes:** Frandsen 2025, Br J Sports Med (verify).
- **Race nutrition:**
  - Thomas 2016, ACSM/AND/DC position stand (carbohydrate by load);
  - ACSM 2007 fluid replacement position stand.
- **HYROX-specific performance studies (2024–25):** search and add only if peer-reviewed.
