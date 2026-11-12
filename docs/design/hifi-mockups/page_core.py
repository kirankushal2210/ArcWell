"""Page 1: design system, entry screens and athlete core (prompt sections 1–8)."""
import re
from _parts import appbar, bar, dial, group, i, logo, ph, phone

# ---------- Design system ----------
SWATCHES = [
    ("Background", "#F5F5F5", "--color-bg"), ("Surface", "#FFFFFF", "--color-surface"), ("Raised", "#EBEBEB", "--color-surface-raised"),
    ("Text", "#111111", "--color-text"), ("Muted", "#5C5C5C", "--color-text-muted"), ("Black · actions", "#111111", "--color-brand"),
    ("Training marker", "#0E7490", "--color-training"), ("Nutrition", "#C2570C", "--color-nutrition"), ("Recovery", "#6D5BD0", "--color-recovery"),
    ("Success", "#127235", "--color-success"), ("Warning", "#A34A06", "--color-warning"), ("Danger", "#C81E1E", "--color-danger"),
]

def system() -> str:
    sw = "".join(f'<div class="sw"><i style="background:var({v})"></i><b>{n}</b><span>{h} · {v}</span></div>' for n, h, v in SWATCHES)
    types = [("display", "73.8 kg", "32/40 Bold"), ("title", "Check-ins", "22/28 Semibold"), ("heading", "Priya Sharma", "18/24 Semibold"),
             ("", "Weekend wedding — overate on Saturday.", "16/24 Regular"), ("label", "Send feedback", "14/20 Medium"), ("caption", "Submitted 2 h ago", "12/16 Regular")]
    ty = "".join(f'<div class="typerow"><span class="{c} num">{s}</span><span class="caption muted">{m}</span></div>' for c, s, m in types)
    return f"""
  <section class="group">
    <div class="group-head"><span class="idx">00</span><h2>Design system</h2><p>Black and white (D50): black is the only action colour; colour is kept for small pillar markers and status. Depth comes from surface steps: white cards on grey, raised one step darker. No shadows, gradients, glow or blur. Inter only; Lucide icons; 4-point spacing.</p></div>
    <div class="sw-grid">{sw}</div>
    <div class="sys">
      <div class="card"><span class="eyebrow">Type scale · Inter</span>{ty}</div>
      <div class="card">
        <span class="eyebrow">Buttons · 48 dp</span>
        <button class="btn primary full">{i("play")}Start workout</button>
        <button class="btn secondary full">Log food</button>
        <button class="btn ghost full">Not now</button>
        <button class="btn destructive full">Delete my account</button>
      </div>
      <div class="card">
        <span class="eyebrow">Inputs, chips, status</span>
        <div class="field"><span class="lbl">Email</span><div class="input focus">priya.sharma@</div><span class="help">Focused: 2 dp black outline</span></div>
        <div class="field"><span class="lbl">Password</span><div class="input error"><span class="ph">••••</span></div><span class="msg">{i("circle-alert")}Use at least 8 characters</span></div>
        <div class="row wrap"><span class="chip">½</span><span class="chip on">{i("check")}1 katori</span><span class="chip">1½</span><span class="chip">grams</span></div>
        <div class="row wrap"><span class="status active">Active</span><span class="status paused">Paused</span><span class="status leaving">Leaving</span><span class="status completed">Completed</span></div>
      </div>
      <div class="card">
        <span class="eyebrow">Progress and motion</span>
        <div class="between"><span class="label">Calories</span><span class="label num">1,420 / 2,300 kcal</span></div>{bar(62)}
        <div class="row" style="gap:var(--space-4)">{dial(78, "Sleep", small=True)}<div class="stack-1"><span class="label">Sleep score</span><span class="caption muted">Dial fills in 600 ms only on the workout summary; elsewhere numbers roll in 200 ms.</span></div></div>
        <span class="anno">Press 120 ms · tabs and rolls 200 ms · sheets 280 ms · skeletons, never spinners</span>
      </div>
    </div>
  </section>"""

# ---------- 1–4 Entry ----------
def entry() -> str:
    splash = phone("F1-01", "Splash", f"Shown only while the session loads (under 1.5 s). Pull-up mark (D51).",
        f'<div style="flex:1;display:grid;place-items:center">{logo(96)}</div>', raw=True)
    welcome = phone("F1-02", "Welcome", "Role is chosen first (D44): athlete is the primary action.",
        f"""<div class="row" style="padding-top:var(--space-2);gap:var(--space-2)">{logo(36)}<span class="heading">Arcwell</span></div>
        <div class="stack-4" style="margin-top:var(--space-8)">
          <h1 class="display">For all your <span class="brand">training</span> and <span class="brand">nutrition</span> needs.</h1>
          <p class="muted">The one-place health application where you can track everything. Track your training, nutrition, and recovery, on your own or with your coach.</p>
        </div>""",
        foot=f"""<button class="btn primary full">I'm training</button><button class="btn secondary full">I'm a coach</button>
        <div class="row"><span class="label muted" style="font-weight:400">Have an account?</span><a class="link">Sign In</a></div>""")
    signup = phone("F1-03 · S-03", "Sign up, with validation", "Checked on leaving a field and on submit. Message under the field says how to fix it; icon + 2 dp outline, never colour alone.",
        f"""{appbar("Create your account", left="arrow-left", left_label="Back", small=True)}
        <button class="btn google full"><span class="gmark" aria-hidden="true">G</span>Continue with Google</button>
        <div class="row"><div class="grow" style="height:1px;background:var(--color-border)"></div><span class="caption muted">or with email</span><div class="grow" style="height:1px;background:var(--color-border)"></div></div>
        <div class="stack-4">
          <div class="field"><span class="lbl">Name</span><div class="input">Priya Sharma</div></div>
          <div class="field"><span class="lbl">Email</span><div class="input error">priya@gmail</div><span class="msg">{i("circle-alert")}Enter a full email, like name@example.com</span></div>
          <div class="field"><span class="lbl">Password</span><div class="input"><span class="ph">At least 8 characters</span></div><span class="help">Use at least 8 characters</span></div>
        </div>""",
        foot='<button class="btn primary full">Create account</button><span class="caption muted">By continuing you agree to the Terms and Privacy Policy.</span>')
    signin = phone("F1-04", "Sign in", "Google or email only. No Apple login, no phone OTP in v1.",
        f"""{appbar("Welcome back", left="arrow-left", left_label="Back", small=True)}
        <button class="btn google full"><span class="gmark" aria-hidden="true">G</span>Continue with Google</button>
        <div class="row"><div class="grow" style="height:1px;background:var(--color-border)"></div><span class="caption muted">or with email</span><div class="grow" style="height:1px;background:var(--color-border)"></div></div>
        <div class="stack-4">
          <div class="field"><span class="lbl">Email</span><div class="input focus">priya.sharma@gmail.com</div></div>
          <div class="field"><span class="lbl">Password</span><div class="input">••••••••••<span class="unit">{i("eye")}</span></div></div>
          <a class="link">Forgot password?</a>
        </div>""",
        foot='<button class="btn primary full">Sign in</button>')
    return group("01–03", "Splash, welcome and sign-in", "Calm, plain entry. The pull-up mark (D51) leads; the name is set in Inter.", splash + welcome + signup + signin)

def step(n: int, total: int = 7) -> str:
    return '<div class="progress">' + "".join(f'<i class="{"on" if k < n else ""}"></i>' for k in range(total)) + "</div>"

def opt(title: str, sub: str = "", on: bool = False, icon: str = "") -> str:
    ic = f'<span class="ico">{i(icon)}</span>' if icon else ""
    return f'<div class="opt{" on" if on else ""}">{ic}<div class="grow"><b>{title}</b>{f"<span>{sub}</span>" if sub else ""}</div><span class="radio"></span></div>'

def onboarding() -> str:
    """Four representative screens; the full flow (D52) is on onboarding-flow.html."""
    import onb_athlete as ob
    frames = re.findall(r"\n    <figure>.*?</figure>", ob.build_all(), re.S)
    pick = [f for f in frames if any(f'aria-label="{k} ' in f for k in ("AO-01", "AO-03", "AO-05", "AO-19"))]
    return group("04", "Athlete onboarding", 'Onboarding v2 (D52): five sections, wheel pickers, one question per screen, Apple setup-flow style (D53). Every screen, with training and recovery, is on <a class="link" href="onboarding-flow.html">onboarding-flow.html</a>.', "".join(pick))

# ---------- 5 Today ----------
def today_workout(title: str, sub: str, who: str) -> str:
    return f"""<div class="card g4">
      <div class="between"><span class="eyebrow"><span class="dot t"></span>Today's workout</span><span class="tag">{who}</span></div>
      <div class="stack-1"><span class="heading">{title}</span><span class="label muted" style="font-weight:400">{sub}</span></div>
      <button class="btn primary full">{i("play")}Start workout</button>
    </div>"""

def today() -> str:
    cal = lambda macros: f"""<div class="card">
      <div class="between"><span class="eyebrow"><span class="dot nu"></span>Nutrition</span><span class="caption muted num">880 kcal left</span></div>
      <div class="between"><span class="mid">1,420<small>/ 2,300 kcal</small></span></div>{bar(62)}
      {macros}</div>"""
    macros = f"""<div class="macros" style="padding-top:var(--space-2)">
        <div><span class="caption muted">Protein</span>{bar(58)}<span class="caption num">64 / 110 g</span></div>
        <div><span class="caption muted">Carbs</span>{bar(66)}<span class="caption num">190 / 290 g</span></div>
        <div><span class="caption muted">Fat</span>{bar(60)}<span class="caption num">42 / 70 g</span></div></div>"""
    weight = """<div class="card"><div class="between"><span class="eyebrow">Bodyweight</span><span class="caption muted num">7-day average</span></div>
      <div class="between"><span class="mid">58.9<small>kg</small></span><span class="label num muted">+0.4 kg this week</span></div></div>"""
    sleep = f"""<div class="card"><div class="row" style="gap:var(--space-4)">{dial(78, "of 100", small=True)}<div class="stack-1 grow"><span class="eyebrow"><span class="dot r"></span>Sleep score</span><span class="label">7 h 10 min · good</span><span class="caption muted">Soreness: legs, mild</span></div></div></div>"""
    hello = lambda s: f'{appbar("Today", right=["bell"])}<p class="muted" style="margin-top:calc(-1 * var(--space-4))">{s}</p>'
    free = phone("N-01", "Today · Free", "Free bar: Today · Training · Nutrition. Calories only; no Recovery (D2b, D5).",
        hello("Thursday, 12 Nov") + today_workout("Full body A", "5 exercises · about 45 min", "Template") + cal("") + weight +
        f'<div class="card raised"><div class="row" style="gap:var(--space-3)"><span class="ico" style="background:var(--color-surface)">{i("sparkles")}</span><div class="stack-1 grow"><span class="label">Want a plan built for you?</span><span class="caption muted">Try Arcwell Plus free for 7 days.</span></div>{i("chevron-right")}</div></div>',
        tab=("free", "Today"))
    plus = phone("N-02", "Today · Arcwell Plus", "Plus bar adds Recovery and AI Coaching. Full macros.",
        hello("Thursday, 12 Nov · Week 3 of your plan") + today_workout("Push · chest and triceps", "6 exercises · about 50 min", "AI plan") + cal(macros) + sleep,
        tab=("plus", "Today"))
    coached = phone("N-03", "Today · Coached", "Coach's guidance replaces AI (D7). AI is never shown. Check-in due card.",
        hello("Thursday, 12 Nov") +
        f"""<div class="card"><div class="row" style="gap:var(--space-3)"><span class="av sm">AK</span><div class="stack-1 grow"><span class="label">Check-in due Sunday</span><span class="caption muted">Coach Anjali Kapoor · takes 3 minutes</span></div>{i("chevron-right")}</div></div>""" +
        today_workout("Lower body · squat focus", "Week 3, day 2 · 5 exercises", "From Coach Anjali") + cal(macros),
        tab=("coached", "Today"))
    return group("05", "Today", "One home per tier. Free shows calories only and a quiet Plus card; Plus shows the AI plan; coached shows the coach's plan and check-in.", free + plus + coached)

# ---------- 6–7 Workout ----------
def workout() -> str:
    rows = [("1", "60 × 8", "60", "8", True), ("2", "60 × 8", "62.5", "8", True), ("3", "60 × 7", "62.5", "7", False)]
    tr = "".join(
        f'<tr class="{"done" if d else ""}"><td class="set">{s}</td><td class="prev">{p}</td><td><span class="cell{" cur" if not d else ""}">{k}</span></td><td><span class="cell">{r}</span></td><td><span class="tick" aria-label="Mark set done">{i("check")}</span></td></tr>'
        for s, p, k, r, d in rows)
    table = f'<table class="sets"><thead><tr><th>Set</th><th>Previous</th><th>kg</th><th>Reps</th><th></th></tr></thead><tbody>{tr}</tbody></table>'
    active = phone("F4-02", "Active workout", "Hevy-style set rows. Current cell has a black outline. Haptic tick when a set is logged.",
        f"""<div class="appbar"><button class="iconbtn edge" aria-label="Minimise">{i("chevron-down")}</button><div class="grow stack-1"><span class="label">Push · chest and triceps</span><span class="caption muted num">24:18 · 2 of 6 exercises</span></div><button class="btn sm primary">Finish</button></div>
        <div class="banner">{i("cloud-off")}Saved on your phone — will sync</div>
        <div class="stack">
          <div class="between"><div class="stack-1"><span class="heading">Bench press</span><span class="caption muted">Barbell · rest 2:00</span></div><button class="iconbtn end" aria-label="Exercise options">{i("ellipsis-vertical")}</button></div>
          {table}
          <button class="btn ghost full" style="justify-content:flex-start;padding:0">{i("plus")}Add set</button>
        </div>
        <div class="card"><div class="between"><div class="stack-1"><span class="label">Incline dumbbell press</span><span class="caption muted num">3 sets · 22.5 kg × 10</span></div>{i("chevron-right")}</div></div>""")
    rest = phone("F4-05", "Rest timer", "Bottom sheet (280 ms). Haptic at the end. ±15 s on 48 dp targets.",
        '<div class="appbar"><div class="grow stack-1"><span class="label">Push · chest and triceps</span><span class="caption muted num">25:02</span></div></div>',
        overlay=f"""<div class="scrim"></div><div class="sheet">
          <div class="grab"></div>
          <div class="stack-1"><span class="eyebrow"><span class="dot t"></span>Rest</span><span class="label muted" style="font-weight:400">Next: Bench press, set 3 · 62.5 kg × 8</span></div>
          <span class="num" style="font-size:48px;line-height:56px;font-weight:700;letter-spacing:-1px">1:24</span>
          {bar(30, "t")}
          <div class="row"><button class="btn secondary grow">−15 s</button><button class="btn secondary grow">+15 s</button></div>
          <button class="btn primary full">Skip rest</button>
        </div>""")
    mini = phone("F4-09", "Minimised workout", "Dark bar keeps the workout one tap away while browsing.",
        f"""{appbar("Nutrition", right=["search"])}
        <div class="card"><div class="between"><span class="eyebrow"><span class="dot nu"></span>Today</span><span class="caption muted num">1,420 / 2,300 kcal</span></div>{bar(62)}</div>
        <div class="card flush"><div class="lr"><div class="t"><b>Breakfast</b><span>Poha · chai</span></div><span class="r">410 kcal</span></div><div class="lr"><div class="t"><b>Lunch</b><span>Dal tadka · 2 roti · salad</span></div><span class="r">640 kcal</span></div></div>
        <div style="flex:1"></div>
        <div class="minibar"><span class="grow stack-1"><b class="label">Push · 25:40</b><span class="caption" style="opacity:.8">Resting · 0:48 left</span></span><button class="iconbtn" aria-label="Open workout">{i("chevron-up")}</button></div>""",
        tab=("plus", "Nutrition"))
    summary = phone("F4-12", "Workout summary", "The one big moment: ring fills, volume rolls up, new bests slide in (600 ms), strong haptic, no confetti.",
        f"""{appbar("", left="x", left_label="Close")}
        <div class="stack-1"><span class="eyebrow"><span class="dot t"></span>Workout complete</span><h2 class="display">Push · chest and triceps</h2><span class="label muted num" style="font-weight:400">Thursday · 52 min</span></div>
        <div class="row" style="gap:var(--space-4)">{dial(100, "sets", kind="t")}<div class="stack grow"><div class="stack-1"><span class="caption muted">Total volume</span><span class="mid">6,840<small>kg</small></span></div><div class="stack-1"><span class="caption muted">Sets</span><span class="label num">18 of 18</span></div></div></div>
        <div class="stack"><span class="eyebrow">New bests</span>
          <div class="card flush">
            <div class="lr"><span class="ico">{i("trophy")}</span><div class="t"><b>Bench press</b><span>62.5 kg × 8 · up from 60 kg</span></div></div>
            <div class="lr"><span class="ico">{i("trophy")}</span><div class="t"><b>Cable fly</b><span>15 kg × 12</span></div></div>
          </div></div>
        <span class="anno">600 ms · ring + volume roll + bests slide in · reduced motion: instant</span>""",
        foot='<button class="btn primary full">Done</button>')
    return group("06–07", "Active workout and summary", "Built to be used one-handed between sets: big targets, previous values in view, offline-safe.", active + rest + mini + summary)

# ---------- 8 Food ----------
def food() -> str:
    def meal(name, kcal, items):
        rows = "".join(f'<div class="lr"><span class="thumb"></span><div class="t"><b>{n}</b><span>{q}</span></div><span class="r">{k}</span></div>' for n, q, k in items)
        return f'<div class="stack"><div class="between"><span class="heading">{name}</span><span class="label muted num">{kcal} kcal</span></div><div class="card flush">{rows}<div class="lr"><span class="link">{i("plus")}&nbsp;Add food</span></div></div></div>'
    log = phone("F5-01", "Food day log", "Calories for everyone; macros on Plus and coached.",
        f"""<div class="appbar"><button class="iconbtn edge" aria-label="Previous day">{i("chevron-left")}</button><span class="title sm" style="flex:1">Thursday, 12 Nov</span><button class="iconbtn end" aria-label="Next day">{i("chevron-right")}</button></div>
        <div class="card"><div class="between"><span class="mid">1,420<small>/ 2,300 kcal</small></span><span class="caption muted num">880 left</span></div>{bar(62)}</div>
        {meal("Breakfast", "410", [("Poha", "1 katori · 250 kcal", "250"), ("Masala chai", "1 cup · with sugar", "160")])}
        {meal("Lunch", "640", [("Dal tadka · 2 phulka", "1 katori · 2 pieces", "420")])}""",
        tab=("coached", "Nutrition"))
    search = phone("F5-03 · F5-05", "Search and portion", "Indian dishes from IFCT 2017 + curated list. Portion chips sit in a 48 dp row.",
        f"""<div class="input focus">{i("search")}<span>dal</span></div>
        <div class="card flush">
          <div class="lr"><div class="t"><b>Dal tadka</b><span>1 katori · 220 kcal · P 11 g</span></div><span class="tag">Verified</span></div>
          <div class="lr"><div class="t"><b>Dal makhani</b><span>1 katori · 330 kcal · P 12 g</span></div><span class="tag">Verified</span></div>
          <div class="lr"><div class="t"><b>Moong dal chilla</b><span>1 piece · 120 kcal · P 7 g</span></div><span class="tag">Verified</span></div>
        </div>""",
        overlay=f"""<div class="scrim"></div><div class="sheet">
          <div class="grab"></div>
          <div class="between"><div class="stack-1"><span class="heading">Dal tadka</span><span class="caption muted">Verified · IFCT 2017</span></div><span class="mid">330<small>kcal</small></span></div>
          <div class="row wrap"><span class="chip-hit"><span class="chip">½</span></span><span class="chip-hit"><span class="chip">1 katori</span></span><span class="chip-hit"><span class="chip on">{i("check")}1½</span></span><span class="chip-hit"><span class="chip">2</span></span><span class="chip-hit"><span class="chip">grams</span></span></div>
          <div class="macros"><div><span class="caption muted">Protein</span><span class="label num">16 g</span></div><div><span class="caption muted">Carbs</span><span class="label num">42 g</span></div><div><span class="caption muted">Fat</span><span class="label num">12 g</span></div></div>
          <div class="field"><span class="lbl">Meal</span><div class="row wrap"><span class="chip">Breakfast</span><span class="chip on">{i("check")}Lunch</span><span class="chip">Dinner</span><span class="chip">Snack</span></div></div>
          <button class="btn primary full">Add to lunch</button>
        </div>""")
    plan = phone("F5-09", "Coach meal plan", "Fixed meals with exact foods and quantities. One tap logs a meal as eaten.",
        f"""{appbar("Meal plan", left="arrow-left", left_label="Back", small=True)}
        <div class="row" style="gap:var(--space-3)"><span class="av sm">AK</span><span class="label muted" style="font-weight:400">From Coach Anjali · 2,300 kcal · veg</span></div>
        <div class="card"><div class="between"><span class="heading">Breakfast · 8:00</span><span class="status active">Eaten</span></div>
          <span class="label" style="font-weight:400">Poha 1 katori · peanuts 15 g · milk 200 ml</span><span class="caption muted num">410 kcal · P 18 g</span></div>
        <div class="card"><div class="between"><span class="heading">Lunch · 13:30</span><span class="caption muted">Not logged</span></div>
          <span class="label" style="font-weight:400">Dal tadka 1 katori · 2 phulka · cucumber salad · curd 100 g</span><span class="caption muted num">640 kcal · P 26 g</span>
          <button class="btn secondary full">{i("check")}Log as eaten</button></div>
        <div class="card"><div class="between"><span class="heading">Snack · 17:00</span><span class="caption muted">Not logged</span></div>
          <span class="label" style="font-weight:400">Roasted chana 40 g · banana</span><span class="caption muted num">260 kcal · P 9 g</span></div>""",
        tab=("coached", "Nutrition"))
    return group("08", "Food", "Search-first logging with Indian portions. Coached athletes follow fixed meals from their coach.", log + search + plan)

def build() -> tuple[str, str, str]:
    return ("System, entry and athlete core",
            "Design system, splash, welcome, sign-in, onboarding, Today in three tiers, the workout flow and food logging (prompt sections 1–8).",
            system() + entry() + onboarding() + today() + workout() + food())
