"""Athlete onboarding, reference-style (D52): about you, goal, training, recovery, nutrition, then results."""
from _onb import chip, foot, notes, obar, options, qh, sel, wheel
from _parts import group, i, logo, phone

# Lucide 0.460 has no mars/venus, so these two are drawn in its 24 px, 2 px-stroke style.
_SV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
MARS = _SV + '<circle cx="10" cy="14" r="5"/><path d="M14 10l6-6M15 4h5v5"/></svg>'
VENUS = _SV + '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/></svg>'

CM = '<span class="on" role="radio">cm</span><span role="radio">ft / in</span>'
KG = '<span class="on" role="radio">kg</span><span class="faded">lb · later</span>'


def about() -> str:
    gender = phone("AO-01", "Gender", notes(
        "Used only for the calorie estimate (D44); “Prefer not to say” uses an average.",
        "Big two-up cards like the reference, plus the third option underneath.",
        "Skip (top right) = Prefer not to say."),
        obar("you", 1, 4) + qh("Let's get to know you better", "This helps us personalise your plan and targets.", "user-round") +
        options(sel("Male", on=True, icon=MARS, tall=True), sel("Female", icon=VENUS, tall=True), sel("Prefer not to say", icon="circle-dashed")),
        foot=foot(skip=True))
    age = phone("AO-02", "Age", notes(
        "Needed for the calorie estimate. Wheel picker: drag or flick, it snaps to a whole year; tap the number to type.",
        "13–80 accepted; under 18 shows a note to train with an adult's guidance."),
        obar("you", 2, 4) + qh("How old are you?", "Your age changes how many calories you burn.", "cake") +
        wheel(27, "years", lo=13, hi=80),
        foot=foot())
    height = phone("AO-03", "Height", notes(
        "Wheel snaps to 1 cm; the segmented control switches to ft / in for people who think in feet.",
        "Haptic tick on every major mark (light)."),
        obar("you", 3, 4) + qh("What's your height?", "We use this to calculate your calorie needs.", "ruler") +
        wheel(172, "cm", lo=120, hi=220, toggle=CM),
        foot=foot())
    weight = phone("AO-04", "Current weight", notes(
        "Wheel steps of 0.1 kg. kg only in v1 (D45), so lb shows as “later”.",
        "Becomes the first entry on the weight chart."),
        obar("you", 4, 4) + qh("What's your current weight?", "This is your starting point.", "scale") +
        wheel(74.5, "kg", step=0.1, lo=30, hi=200, dec=1, toggle=KG),
        foot=foot())
    return group("AO · 01–04", "About you", "Four quick facts for the calorie estimate. Centred headers, wheel pickers, one question per screen (D53).",
                 gender + age + height + weight)


def goal() -> str:
    main = phone("AO-05", "Main goal", notes(
        "Single select; drives the calorie target and the starter workouts.",
        "Outcome words, not jargon. Body recomposition added from the reference.",
        "Asked before goal weight so that screen knows which way to point."),
        obar("goal", 1, 3) + qh("What's your main goal?", "We'll build your plan around this.", "target") +
        options(sel("Lose fat", "Get leaner, keep your muscle", True, "flame"),
                sel("Build muscle", "Gain size with a small surplus", icon="biceps-flexed"),
                sel("Get stronger", "Lift more on the big lifts", icon="dumbbell"),
                sel("Body recomposition", "Lose fat and build muscle slowly", icon="refresh-cw"),
                sel("General fitness", "Feel fitter and healthier", icon="heart")),
        tight=True, foot=foot())
    gw = phone("AO-06", "Goal weight", notes(
        "Starts at the current weight and moves the way the goal points.",
        "Shows the gap and a safe pace (about 0.5% of body weight a week). Never promises a date.",
        "Optional: “Skip for now” keeps the goal without a target weight."),
        obar("goal", 2, 3) + qh("What's your goal weight?", "Where do you want to be?", "flag") +
        wheel(70.0, "kg", step=0.1, lo=30, hi=200, dec=1, delta_from=74.5,
              delta=f'{i("trending-down")}<span>4.5 kg to go · about 0.4 kg a week</span>'),
        foot=foot(skip=True))
    act = phone("AO-07", "Activity level", notes(
        "Day-to-day movement outside workouts; sets the activity multiplier.",
        "Plain examples instead of PAL numbers."),
        obar("goal", 3, 3) + qh("How active are you during the day?", "Outside your workouts.", "footprints") +
        options(sel("Mostly sitting", "Desk job, little walking", icon="armchair"),
                sel("Lightly active", "Some walking most days", icon="footprints"),
                sel("Moderately active", "On your feet most of the day", True, "person-standing"),
                sel("Very active", "Physical job or lots of walking", icon="bike"),
                sel("Extra active", "Hard physical work every day", icon="hard-hat")),
        tight=True, foot=foot())
    return group("AO · 05–07", "Your goal", "What you want and how you live: the rest of the calorie maths.", main + gw + act)


def training() -> str:
    exp = phone("AO-08", "Gym experience", notes(
        "Described by time and comfort so people rate themselves honestly.",
        "Sets starter workout difficulty and default rest times."),
        obar("training", 1, 5) + qh("What's your gym experience?", "So your workouts start at the right level.", "dumbbell") +
        options(sel("New to the gym", "Under 6 months, or coming back", icon="sprout"),
                sel("Some experience", "6 months to 2 years", True, "dumbbell"),
                sel("Experienced", "2 to 5 years, most lifts feel familiar", icon="trophy"),
                sel("Very experienced", "5+ years, you plan your own", icon="medal")),
        foot=foot())
    where = phone("AO-09", "Where you train", notes(
        "Home reveals the kit list, so starter workouts only use what they own.",
        "Gym and No equipment skip the list."),
        obar("training", 2, 5) + qh("Where do you train?", "We'll only pick exercises you can do.", "map-pin") +
        options(sel("Gym", "Machines, barbells, dumbbells", icon="building-2"),
                sel("Home", "Some equipment", True, "house"),
                sel("No equipment", "Bodyweight only", icon="person-standing")) +
        f'<div class="field"><span class="lbl">What do you have at home?</span><div class="row wrap">{chip("Dumbbells", True)}{chip("Resistance bands")}{chip("Pull-up bar", True)}{chip("Bench")}{chip("Kettlebell")}</div></div>',
        tight=True, foot=foot())
    days = phone("AO-10", "Training days", notes(
        "Days per week sets the starter split; preferred days only drive reminders.",
        "Picking more days than the number shows a gentle note, not an error."),
        obar("training", 3, 5) + qh("How often can you train?", "Be realistic: consistency beats ambition.", "calendar-days") +
        f"""<div class="field"><span class="lbl">Days per week</span><div class="scale5"><span>2</span><span>3</span><span class="on">4</span><span>5</span><span>6</span></div></div>
        <div class="field"><span class="lbl">Which days suit you? <span class="muted" style="font-weight:400">(optional)</span></span>
          <div class="daydots"><span class="on">M</span><span>T</span><span class="on">W</span><span>T</span><span class="on">F</span><span class="on">S</span><span>S</span></div>
          <span class="caption muted">4 of 4 picked.</span></div>""",
        foot=foot())
    length = phone("AO-11", "Session length and time", notes(
        "Length caps starter workouts; time of day sets the reminder (default one hour before).",
        "Reminders can be turned off in Account."),
        obar("training", 4, 5) + qh("How long can you train?", "Per session, warm-up included.", "timer") +
        f"""<div class="scale5" style="grid-template-columns:repeat(4,1fr)"><span>30 min</span><span class="on">45 min</span><span>60 min</span><span>90 min</span></div>
        <div class="stack-1" style="padding-top:var(--space-2)"><span class="lbl label">When do you usually train?</span></div>""" +
        options(sel("Morning", "Before 10 am", True, "sunrise"), sel("Afternoon", "10 am – 4 pm", icon="sun"), sel("Evening", "After 4 pm", icon="moon")),
        tight=True, foot=foot())
    inj = phone("AO-12", "Injuries and limitations", notes(
        "Multi-select; “None” clears the others. Each maps to exercise exclusions.",
        "Safety note shown here, not buried in the terms."),
        obar("training", 5, 5) + qh("Any injuries or limitations?", "We'll avoid exercises that could hurt.", "bandage") +
        f"""<div class="row wrap">{chip("None")}{chip("Lower back", True)}{chip("Knee")}{chip("Shoulder", True)}{chip("Wrist / elbow")}{chip("Neck")}{chip("Ankle")}{chip("Hip")}{chip("Other")}</div>
        <div class="field"><span class="lbl">Anything else? <span class="muted" style="font-weight:400">(optional)</span></span><div class="textarea" style="min-height:52px">e.g. slipped disc 2 years ago</div></div>
        <div class="safety">{i("info")}<span>Arcwell isn't a medical service. For pain or a recent injury, check with a doctor or physiotherapist first.</span></div>""",
        tight=True, foot=foot(skip=True, skip_label="No injuries, skip"))
    return group("AO · 08–12", "Training", '<span class="dot t"></span> Experience, place, schedule and limits: everything the starter workouts need.',
                 exp + where + days + length + inj)


def recovery() -> str:
    sleep = phone("AO-13", "Sleep", notes(
        "Average sleep sets a starting sleep target; bed and wake times feed the wind-down reminder.",
        "Free athletes don't get the Recovery tab (D2b); answers still space out hard sessions and carry over to Recovery on Plus or with a coach."),
        obar("recovery", 1, 3) + qh("How much do you sleep?", "On a normal night.", "bed") +
        wheel(7.0, "hours", step=0.5, lo=3, hi=12, dec=1, rows=3) +
        f"""<div class="timepair"><div><span>{i("bed")}Bedtime</span><b>11:30 pm</b></div><div><span>{i("alarm-clock")}Wake up</span><b>6:30 am</b></div></div>""",
        tight=True, foot=foot(skip=True))
    quality = phone("AO-14", "Sleep quality", notes(
        "One tap, words not stars.",
        "“Poor” or “Very poor” adds a recovery tip on Today; never a diagnosis."),
        obar("recovery", 2, 3) + qh("How well do you usually sleep?", "Be honest; it changes how hard we push you.", "moon-star") +
        options(sel("Great", "Wake up rested most days", icon="smile"),
                sel("Okay", "Rested some days, tired others", True, "meh"),
                sel("Poor", "Often wake up tired", icon="frown"),
                sel("Very poor", "Trouble falling or staying asleep", icon="cloud-moon")),
        foot=foot(skip=True))
    load = phone("AO-15", "Stress and energy", notes(
        "Two 1–5 scales with the same end labels as the weekly check-in (F6), so the baseline compares directly.",
        "High stress with low energy starts training one step easier for the first two weeks."),
        obar("recovery", 3, 3) + qh("How do your days feel lately?", "A baseline you'll update in check-ins.", "activity") +
        f"""<div class="stack-4">
          <div class="field"><span class="lbl">Stress</span><div class="scale5"><span>1</span><span>2</span><span class="on">3</span><span>4</span><span>5</span></div><div class="scale5-l"><span>Calm</span><span>Very stressed</span></div></div>
          <div class="field"><span class="lbl">Energy</span><div class="scale5"><span>1</span><span>2</span><span>3</span><span class="on">4</span><span>5</span></div><div class="scale5-l"><span>Very low</span><span>Great</span></div></div>
          <div class="field"><span class="lbl">Muscle soreness after training</span><div class="row wrap">{chip("Rarely")}{chip("Sometimes", True)}{chip("Often")}</div></div>
        </div>""",
        tight=True, foot=foot(skip=True))
    return group("AO · 13–15", "Recovery", '<span class="dot r"></span> Three light questions: sleep, sleep quality, stress and energy. All skippable.',
                 sleep + quality + load)


def nutrition() -> str:
    diet = phone("AO-16", "Diet type", notes(
        "Indian categories with one-line definitions (Jain and eggetarian are often misunderstood).",
        "Allergies are v1.1 (D45)."),
        obar("nutrition", 1, 2) + qh("How do you eat?", "We'll only suggest foods that fit.", "salad") +
        options(sel("Vegetarian", "Dairy, no meat or eggs", True, "leaf"),
                sel("Eggetarian", "Vegetarian plus eggs", icon="egg"),
                sel("Non-vegetarian", "Meat, fish and eggs", icon="drumstick"),
                sel("Vegan", "No animal products", icon="sprout"),
                sel("Jain", "No root vegetables, meat or eggs", icon="flower-2")),
        tight=True, foot=foot())
    meals = phone("AO-17", "Meals per day", notes(
        "Splits the calorie target into meal slots on the food log.",
        "Coaches see it too; it saves an intake question."),
        obar("nutrition", 2, 2) + qh("How many times do you eat a day?", "Your food log follows this.", "utensils") +
        f'<div class="scale5" style="grid-template-columns:repeat(4,1fr)"><span>2</span><span>3</span><span class="on">4</span><span>5+</span></div>' +
        f'<div class="card"><span class="eyebrow"><span class="dot nu"></span>Your food log</span>' +
        "".join(f'<div class="kv"><span>{m}</span><span>{t}</span></div>' for m, t in [("Breakfast", "8:00 am"), ("Lunch", "1:30 pm"), ("Evening snack", "5:30 pm"), ("Dinner", "9:00 pm")]) +
        "</div>",
        foot=foot("Finish"))
    return group("AO · 16–17", "Nutrition", '<span class="dot nu"></span> Diet type and meal rhythm. Ends with “Finish”, because a coached client has no plan yet.',
                 diet + meals)


def results() -> str:
    building = phone("AO-18", "Building your plan", notes(
        "Shown only while the server works out the plan; never padded with a fake delay.",
        "Progress bar and steps, never a spinner. Each line ticks as it's done (200 ms)."),
        f"""<div style="flex:1;display:grid;align-content:center;gap:var(--space-6)">
          <div class="medal">{logo(72)}</div>
          <div class="qh center"><h2>Building your plan</h2><p>Putting your answers together.</p></div>
          <div class="loadbar"><i style="width:68%"></i></div>
          <div class="build">
            <div class="done"><span class="ck">{i("check")}</span>Daily calorie target</div>
            <div class="done"><span class="ck">{i("check")}</span>Starter workouts for your home kit</div>
            <div class="now"><span class="ck"></span>Rest days from your sleep and stress</div>
            <div class="todo-s"><span class="ck"></span>Reminders on your training days</div>
          </div></div>""")
    target = phone("AO-19", "Calorie target · result", notes(
        "The ring fills and the number rolls up once (600 ms, critically damped), the one big moment of onboarding; no confetti.",
        "Free nutrition is calories only (D5), so the reference's macro row becomes weekly pace, workouts and sleep, as grouped rows.",
        "Plus and coached accounts see protein, carbs and fat here instead."),
        f"""<div class="qh" style="padding-top:var(--space-4)"><h2>Your daily target</h2><p>This gets you to 70.0 kg at a steady pace.</p></div>
        <div class="ring-hero"><svg viewBox="0 0 36 36"><circle class="track" cx="18" cy="18" r="15.9155" fill="none" stroke-width="2.6"/><circle class="fill" cx="18" cy="18" r="15.9155" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="100 100" data-ring/></svg>
          <div class="v"><b data-count="1850">1,850</b><span>kcal a day</span></div></div>
        <div class="glist">
          <div class="kv"><span><span class="dot nu"></span> Weekly change</span><span>−0.4 kg</span></div>
          <div class="kv"><span><span class="dot t"></span> Workouts</span><span>4 a week · 45 min</span></div>
          <div class="kv"><span><span class="dot r"></span> Sleep target</span><span>7.5 h</span></div>
        </div>""",
        tight=True, foot=foot("Continue", skip=True, skip_label="Adjust target"))
    preview = phone("AO-20", "Plan preview", notes(
        "Five things the free plan really includes. No AI items: AI is Plus-only and onboarding never sells it (D44).",
        "Each row names something from their answers, so it reads as theirs."),
        qh("Here's what your plan includes", "Built from your answers to help you reach 70.0 kg.", "list-checks") +
        '<div class="stack">' + "".join(
            f'<div class="feat">{i(ic)}<div class="grow"><b>{t}</b><span>{s}</span></div></div>'
            for ic, t, s in [
                ("flame", "Calorie tracking", "1,850 kcal a day · Indian dishes, vegetarian"),
                ("dumbbell", "3 starter workouts", "Full body A, B, C · 45 min · dumbbells, pull-up bar"),
                ("timer", "Workout logging", "Sets, reps and a rest timer that buzzes"),
                ("trending-up", "Progress tracking", "Weight, measurements and private photos"),
                ("bell", "Smart reminders", "Mon, Wed, Fri, Sat at 6:00 am"),
            ]) + "</div>",
        tight=True, foot=foot())
    done = phone("AO-21", "You're all set", notes(
        "Calm finish: mark with a check badge, one card pointing at today's first step. No emoji, no confetti.",
        "Primary goes to Today, where the first workout sits on top."),
        f"""<div style="flex:1;display:grid;align-content:center;gap:var(--space-6)">
          <div class="medal">{logo(72)}<span class="badge">{i("check")}</span></div>
          <div class="qh center"><h2>All set, let's go</h2><p>Your plan is ready. Show up, log it, and we'll handle the maths.</p></div>
          <div class="feat">{i("flag")}<div class="grow"><b>First up: Full body A</b><span>Today · 45 min · about 6 exercises</span></div></div>
        </div>""",
        foot=foot("Go to Today", skip=True, skip_label="Have a coach? Enter invite code"))
    coached = phone("AO-21b", "All set · coached athlete", notes(
        "After AO-17, coached athletes skip AO-18 to AO-20: the coach sets targets and plans. No AI anywhere (D7).",
        "“While you wait” gives the coach baseline data and avoids an empty first day."),
        f"""<div class="medal" style="margin-top:var(--space-6)"><span class="av lg" style="width:96px;height:96px;font-size:var(--text-xl)">JM</span><span class="badge">{i("check")}</span></div>
        <div class="qh center"><h2>You're connected with Coach Joseph</h2><p>Joseph will review your answers and send your plan. We'll tell you when it's ready.</p></div>
        <div class="card"><span class="eyebrow">While you wait</span>
          <div class="todo"><span class="ring"></span>Log today's weight</div>
          <div class="todo"><span class="ring"></span>Add your first progress photo</div>
          <div class="todo"><span class="ring"></span>Say hello in chat</div>
        </div>""",
        tight=True, foot='<button class="btn primary full">Go to Today</button><button class="btn secondary full">Message Joseph</button>')
    return group("AO · 18–21", "Your plan", "Build, reveal, preview, go. Coached athletes get their own last screen.",
                 building + target + preview + done + coached)


def build_all() -> str:
    return about() + goal() + training() + recovery() + nutrition() + results()
