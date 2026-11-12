"""Page 2: AI Coaching, paywall, recovery, progress, coached check-in and chat (prompt sections 9–13)."""
from _parts import appbar, bar, dial, group, i, ph, phone

# ---------- 9 AI Coaching (Plus only) ----------
def ai() -> str:
    home = phone("AI-01", "AI Coaching · plan", "Plus only. Plans use only the approved exercise library and pass server-side rules. Never shown to coached athletes (D10).",
        f"""{appbar("AI Coaching", right=["settings"])}
        <div class="card g4">
          <div class="between"><span class="eyebrow"><span class="dot t"></span>Your plan</span><span class="tag plus">Plus</span></div>
          <div class="stack-1"><span class="heading">Build muscle · 4 days</span><span class="label muted num" style="font-weight:400">Week 3 of 8 · next adjustment Sunday</span></div>
          {bar(37, "t")}
          <div class="card flush" style="background:var(--color-surface-raised)">
            <div class="lr" style="padding-inline:var(--space-3)"><div class="t"><b>Mon · Push</b><span>6 exercises · done</span></div>{i("check")}</div>
            <div class="lr" style="padding-inline:var(--space-3)"><div class="t"><b>Thu · Push</b><span>Today · 6 exercises</span></div>{i("chevron-right")}</div>
          </div>
        </div>
        <div class="card"><div class="between"><span class="eyebrow"><span class="dot nu"></span>Meal plan</span><span class="caption muted num">2,300 kcal · veg</span></div>
          <span class="label" style="font-weight:400">Poha · dal tadka with 2 phulka · paneer bhurji</span></div>
        <div class="card raised"><div class="row" style="gap:var(--space-3)"><span class="ico" style="background:var(--color-surface)">{i("camera")}</span><div class="stack-1 grow"><span class="label">Log food with a photo</span><span class="caption muted">AI estimates the dish and portion. You confirm.</span></div>{i("chevron-right")}</div></div>""",
        tab=("plus", "AI Coaching"))
    camera = phone("AI-03", "Photo food logging · camera", "Large preview with a framing guide. Photos are deleted after analysis (wording pending Groq terms, PLAN.md).",
        f"""<div class="body tight" style="padding-bottom:var(--space-4)">
          {appbar("Photo log", left="x", left_label="Close", small=True)}
          <div class="camera">{ph("Camera preview", 420, "camera")}<div class="reticle"></div></div>
          <p class="caption muted">Fit the whole plate in the frame. Works best in daylight.</p>
          <div class="row" style="justify-content:space-between"><button class="iconbtn outline" aria-label="Choose from gallery">{i("image")}</button><button class="btn primary" style="flex:1">{i("scan")}Scan food</button><button class="iconbtn outline" aria-label="Flash">{i("zap")}</button></div>
        </div>""", raw=True)
    result = phone("AI-03b", "Photo food logging · result", "Analysing shows a skeleton (never a spinner); then the result sheet to confirm or edit.",
        f"""<div class="body tight">{appbar("Photo log", left="x", left_label="Close", small=True)}{ph("Your photo", 300)}</div>""", raw=True,
        overlay=f"""<div class="scrim"></div><div class="sheet">
          <div class="grab"></div>
          <div class="stack-1"><span class="eyebrow">{i("sparkles")} AI estimate · check it</span><span class="heading">Rajma chawal</span></div>
          <div class="between"><span class="mid">560<small>kcal</small></span><span class="caption muted">1 plate · about 350 g</span></div>
          <div class="macros"><div><span class="caption muted">Protein</span><span class="label num">18 g</span></div><div><span class="caption muted">Carbs</span><span class="label num">92 g</span></div><div><span class="caption muted">Fat</span><span class="label num">12 g</span></div></div>
          <div class="row wrap"><span class="chip">½ plate</span><span class="chip on">{i("check")}1 plate</span><span class="chip">1½</span><span class="chip">Edit items</span></div>
          <div class="row"><button class="btn secondary grow">Retake</button><button class="btn primary grow">Add to dinner</button></div>
        </div>""")
    loading = phone("AI-03a", "Photo food logging · analysing", "Skeleton in the shape of the result. Reduced motion: no pulse.",
        f"""<div class="body tight">{appbar("Photo log", left="x", left_label="Close", small=True)}{ph("Your photo", 300)}</div>""", raw=True,
        overlay="""<div class="scrim"></div><div class="sheet" aria-label="Analysing your photo">
          <div class="grab"></div><span class="label muted">Analysing your photo…</span>
          <div class="sk" style="height:24px;width:55%"></div><div class="sk" style="height:40px;width:40%"></div>
          <div class="row"><div class="sk grow" style="height:40px"></div><div class="sk grow" style="height:40px"></div><div class="sk grow" style="height:40px"></div></div>
          <div class="sk card" style="height:48px"></div>
        </div>""")
    nope = phone("AI-04", "Out of scope", "Standard state for contest prep, injury rehab and similar (D22). No routing to coaches.",
        f"""{appbar("AI Coaching", left="arrow-left", left_label="Back", small=True)}
        <div class="card"><span class="caption muted">You asked</span><span class="label" style="font-weight:400">"Can you plan my peak week for a bodybuilding show?"</span></div>
        <div class="empty">
          <div class="tile">{i("circle-slash")}</div>
          <div class="stack-1"><h3 class="heading">I can't help with that</h3><p class="label muted" style="font-weight:400">Contest prep, injury rehab and medical questions need a qualified professional. Your current plan is unchanged.</p></div>
          <button class="btn secondary full">Back to my plan</button>
        </div>""",
        tab=("plus", "AI Coaching"))
    return group("09", "AI Coaching · Arcwell Plus only", "Shown only to Plus subscribers. Every AI estimate is labelled and confirmed by the athlete.", home + camera + loading + result + nope)

# ---------- 10 Trial and paywall ----------
def paywall() -> str:
    feat = lambda t: f'<div class="row" style="gap:var(--space-3)"><span style="color:var(--color-success)">{i("check")}</span><span class="label" style="font-weight:400">{t}</span></div>'
    pay = phone("F8-01", "Arcwell Plus · trial offer", "Shown only at upgrade moments. Honest copy: trial length, price and how to cancel are all visible before tapping.",
        f"""{appbar("", left="x", left_label="Close")}
        <div class="stack-1"><span class="eyebrow">{i("sparkles")} Arcwell Plus</span><h2 class="display">A plan that adjusts as you do</h2></div>
        <div class="stack">{feat("AI-built training plans, adjusted weekly")}{feat("AI meal plans for your diet type")}{feat("Log food with a photo")}{feat("Full macros: protein, carbs, fat")}{feat("Recovery: sleep score, soreness, fatigue")}</div>
        <div class="stack">
          <div class="opt on"><div class="grow"><b>Yearly <span class="tag plus" style="margin-left:var(--space-1)">Save 33%</span></b><span class="num">₹ 2,399 / year · ₹ 200 a month</span></div><span class="radio"></span></div>
          <div class="opt"><div class="grow"><b>Monthly</b><span class="num">₹ 299 / month</span></div><span class="radio"></span></div>
        </div>""",
        foot='<button class="btn primary full">Start 7-day free trial</button><span class="caption muted">Free for 7 days, then ₹ 2,399 a year. We remind you on day 5. Cancel any time in Play Store. Prices are placeholders.</span>')
    remind = phone("TL-01", "Trial reminder · day 5", "In-app card and push on day 5, before Google Play charges on day 7 (D34).",
        f"""{appbar("Today", right=["bell"])}
        <div class="card g4"><div class="row" style="gap:var(--space-3);align-items:flex-start"><span class="ico">{i("calendar-clock")}</span><div class="stack-1 grow"><span class="label">Your trial ends in 2 days</span><span class="caption muted">On Sat, 14 Nov Google Play charges ₹ 2,399 for a year of Plus.</span></div></div>
          <div class="row"><button class="btn secondary grow">Manage in Play Store</button><button class="btn ghost">Keep Plus</button></div></div>
        <div class="card"><div class="between"><span class="eyebrow"><span class="dot t"></span>Today's workout</span><span class="tag">AI plan</span></div><span class="heading">Pull · back and biceps</span><span class="label muted" style="font-weight:400">6 exercises · about 50 min</span></div>""",
        tab=("plus", "Today"))
    ended = phone("F8-08", "Trial ended · back to Free", "Unpaid → Free (D17). AI plan stays as a read-only plan (D33); Recovery hides, history kept (D32).",
        f"""{appbar("Today", right=["bell"])}
        <div class="card g4"><div class="stack-1"><span class="label">Your Plus trial has ended</span><span class="caption muted">Your plan stays here as read-only, and your recovery history is kept. Subscribe to pick up where you left off.</span></div>
          <button class="btn primary full">See Plus plans</button></div>
        <div class="card"><div class="between"><span class="eyebrow"><span class="dot t"></span>Today's workout</span><span class="tag">Read-only plan</span></div><span class="heading">Pull · back and biceps</span><span class="label muted" style="font-weight:400">Last adjusted 8 Nov</span></div>""",
        tab=("free", "Today"))
    return group("10", "Trial and paywall", "7-day trial into a hard paywall (D6, D17). No dark patterns: price, trial end and cancellation are always visible.", pay + remind + ended)

# ---------- 11 Recovery ----------
def recovery() -> str:
    rate = lambda name, v: f'<div class="field"><span class="lbl">{name}</span><div class="row">' + "".join(
        f'<span class="chip{" on" if k == v else ""}" style="flex:1;justify-content:center">{k}</span>' for k in range(1, 6)) + "</div></div>"
    plus = phone("R-01", "Recovery · Plus", "Sleep, soreness and fatigue only (D4). Sleep score 0–100 dial (D18).",
        f"""{appbar("Recovery", right=["calendar"])}
        <div class="card"><div class="row" style="gap:var(--space-4)">{dial(78, "of 100")}<div class="stack grow"><span class="eyebrow"><span class="dot r"></span>Last night</span><span class="mid">7 h 10<small>min</small></span><span class="caption muted">Quality: good · in bed 23:20</span></div></div></div>
        <div class="card g4"><span class="heading">How do you feel today?</span>{rate("Soreness", 2)}{rate("Fatigue", 3)}</div>
        <div class="card"><span class="eyebrow">This week</span>
          <svg class="chart" viewBox="0 0 296 80" aria-label="Sleep score this week">{"".join(f'<rect class="colbar" x="{8+k*42}" y="{80-v*0.7}" width="24" height="{v*0.7}" rx="4"/>' for k, v in enumerate([72, 65, 80, 77, 70, 84, 78]))}</svg>
          <div class="between caption muted"><span>Fri</span><span>Thu</span></div></div>""",
        tab=("plus", "Recovery"))
    coached = phone("R-03", "Recovery · coached", "Coach can set a sleep target and a recovery note (SPEC).",
        f"""{appbar("Recovery", right=["calendar"])}
        <div class="card"><div class="row" style="gap:var(--space-3);align-items:flex-start"><span class="av sm">AK</span><div class="stack-1 grow"><span class="label">Note from Coach Anjali</span><span class="label muted" style="font-weight:400">Deload this week. Aim for 8 hours and keep sessions easy.</span></div></div></div>
        <div class="card"><div class="row" style="gap:var(--space-4)">{dial(64, "of 100")}<div class="stack grow"><span class="eyebrow"><span class="dot r"></span>Last night</span><span class="mid">6 h 05<small>min</small></span><span class="caption muted num">Target 8 h · 1 h 55 min short</span></div></div>
          {bar(76, "r")}</div>
        <div class="card g4"><span class="heading">Log today</span>{rate("Soreness", 4)}{rate("Fatigue", 3)}</div>""",
        tab=("coached", "Recovery"))
    return group("11", "Recovery · Plus and coached only", "Hidden entirely for Free (D5a). Short of a target reads as information, never red.", plus + coached)

# ---------- 12 Progress and physique ----------
def progress() -> str:
    pts = [58.1, 58.0, 58.3, 58.4, 58.2, 58.6, 58.7, 58.9]
    x = lambda k: 32 + k * 36
    y = lambda v: 12 + (59.2 - v) * 70
    line = " ".join(f"{x(k)},{y(v)}" for k, v in enumerate(pts))
    chart = f"""<svg class="chart" viewBox="0 0 296 120" aria-label="Bodyweight 58.1 to 58.9 kg over 8 weeks">
      {"".join(f'<line class="grid" x1="28" x2="296" y1="{y(v)}" y2="{y(v)}"/><text x="0" y="{y(v)+4}">{v:.0f}</text>' for v in [59.0, 58.0])}
      <polyline class="line b" points="{line}"/>{"".join(f'<circle class="pt" style="stroke:var(--color-brand)" cx="{x(k)}" cy="{y(v)}" r="3.5"/>' for k, v in enumerate(pts[:-1]))}
      <circle class="last" style="fill:var(--color-brand)" cx="{x(7)}" cy="{y(pts[-1])}" r="4.5"/></svg>"""
    phys = phone("PH-01", "Physique", "Free for everyone (D5). Bodyweight, measurements and photos; compare any two weeks.",
        f"""{appbar("Physique", left="arrow-left", left_label="Back", right=["plus"])}
        <div class="row wrap"><span class="chip on">{i("check")}Weight</span><span class="chip">Measurements</span><span class="chip">Photos</span></div>
        <div class="card"><div class="between"><span class="mid">58.9<small>kg</small></span><span class="label muted num">+0.8 kg in 8 weeks</span></div>{chart}
          <div class="between caption muted"><span>18 Sep</span><span>12 Nov</span></div></div>
        <div class="card flush"><div class="lr"><div class="t"><b>Waist</b><span>Measured 10 Nov</span></div><span class="r"><b class="label num" style="color:var(--color-text)">68.5 cm</b><span class="num">−1.0</span></span></div>
          <div class="lr"><div class="t"><b>Arms</b><span>Measured 10 Nov</span></div><span class="r"><b class="label num" style="color:var(--color-text)">27.0 cm</b><span class="num">+0.5</span></span></div></div>
        <div class="stack"><div class="between"><span class="heading">Photos</span><a class="link">Compare</a></div>
          <div class="row">{ph("Week 1", 120, "user")}{ph("Week 8", 120, "user")}</div></div>""".replace('<div class="row">' + ph("Week 1", 120, "user"), '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">' + ph("Week 1", 120, "user")))
    muscle = phone("PH-04", "Muscle analytics", "Pro only (D13): weekly sets per muscle group.",
        f"""{appbar("Muscle analytics", left="arrow-left", left_label="Back", small=True)}
        <div class="row wrap"><span class="chip on">{i("check")}This week</span><span class="chip">Last 4 weeks</span></div>
        <div class="card g4">""" + "".join(
            f'<div class="stack-1"><div class="between"><span class="label">{m}</span><span class="label num muted">{s} sets</span></div>{bar(min(100, s * 5), "t")}</div>'
            for m, s in [("Chest", 14), ("Back", 16), ("Shoulders", 10), ("Quads", 12), ("Hamstrings", 6), ("Biceps", 8), ("Triceps", 9)]) +
        '<span class="caption muted">Bars fill at 20 sets. A low number is information, not a warning.</span></div>',
        tab=("plus", "Training"))
    timeline = phone("CP-01", "Progress · coached timeline", "Coached athletes see past check-ins and coach feedback (D16). They never see the coach's review tools (D11).",
        f"""{appbar("Progress")}
        <div class="row wrap"><span class="chip on">{i("check")}Check-ins</span><span class="chip">Progress</span><span class="chip">Chat</span></div>
        <div class="card g4"><div class="between"><span class="label">Week 3 · submitted Sun</span><span class="status completed">Reviewed</span></div>
          <div class="stats"><div class="stat"><span class="k">Weight</span><span class="v">58.9</span><span class="d">+0.4 kg</span></div><div class="stat"><span class="k">Workouts</span><span class="v">4/4</span><span class="d">—</span></div><div class="stat"><span class="k">Avg kcal</span><span class="v">2,240</span><span class="d">−60</span></div></div>
          <div class="row" style="gap:var(--space-3);align-items:flex-start"><span class="av sm">AK</span><span class="label" style="font-weight:400">Great week. Add 2.5 kg to bench and keep protein above 100 g.</span></div></div>
        <div class="card"><div class="between"><span class="label">Week 2 · submitted Sun</span><span class="status completed">Reviewed</span></div><span class="caption muted num">58.5 kg · 3/4 workouts · 2,150 kcal</span></div>""",
        tab=("coached", "Progress"))
    return group("12", "Progress and physique", "Neutral numbers: changes are shown as plain values, never judged by colour.", phys + muscle + timeline)

# ---------- 13 Coached check-in and chat ----------
def coached() -> str:
    rate = lambda name, v: f'<div class="between"><span class="label">{name}</span><div class="row" style="gap:var(--space-1)">' + "".join(
        f'<span class="chip{" on" if k == v else ""}" style="width:36px;justify-content:center;padding:0">{k}</span>' for k in range(1, 6)) + "</div></div>"
    form = phone("F6-02 · F6-04", "Weekly check-in", "Fixed form (D45). Weight and workouts are pre-filled from logs. Photos optional: consent never blocks submitting (D12).",
        f"""{appbar("Check-in · week 4", left="x", left_label="Close", small=True)}
        <div class="stats"><div class="stat"><span class="k">Avg weight</span><span class="v">59.1</span></div><div class="stat"><span class="k">Workouts</span><span class="v">4/4</span></div><div class="stat"><span class="k">Avg kcal</span><span class="v">2,280</span></div></div>
        <div class="field"><span class="lbl">Waist</span><div class="input num">68.0<span class="unit">cm</span></div></div>
        <div class="card g4">{rate("Energy", 4)}{rate("Hunger", 3)}{rate("Stress", 2)}{rate("Digestion", 4)}</div>
        <div class="field"><span class="lbl">Struggles or questions</span><div class="input" >Weekend wedding — overate on Saturday</div></div>
        <div class="row" style="gap:var(--space-2)"><span class="ico">{i("camera")}</span><span class="label grow" style="font-weight:400">Add photos <span class="muted">(optional)</span></span>{i("chevron-right")}</div>""",
        foot='<button class="btn primary full">Submit check-in</button>')
    chat = phone("F7-01", "Chat with coach", "Text, images and PDFs (no video, D14). Realtime.",
        f"""<div class="body tight" style="padding-bottom:0">
          <div class="appbar"><button class="iconbtn edge" aria-label="Back">{i("arrow-left")}</button><span class="av sm">AK</span><div class="grow stack-1" style="gap:0"><span class="label">Coach Anjali Kapoor</span><span class="caption muted">Your coach</span></div></div>
          <div class="stack" style="flex:1;align-content:end">
            <span class="caption muted" style="justify-self:center">Today</span>
            <div class="bub">Saw your check-in. How's the knee on squats?<small>09:12</small></div>
            <div class="bub me">Much better! No pain at 50 kg.<small>09:20</small></div>
            <div class="att">{i("file-text")}<div class="stack-1"><span class="label">Week 4 plan.pdf</span><span class="caption muted">PDF · 220 KB</span></div></div>
            <div class="bub">Here's this week. Squat moves to 52.5 kg.<small>09:24</small></div>
          </div>
        </div>
        <div class="composer"><button class="iconbtn" aria-label="Attach image or PDF">{i("paperclip")}</button><div class="input"><span class="ph">Message</span></div><button class="iconbtn" aria-label="Send" style="color:var(--color-brand)">{i("send")}</button></div>""",
        raw=True)
    consent = phone("F9-03", "Photo approval request", "Coach requests, athlete approves, optional face blur, withdraw any time (SPEC).",
        f"""{appbar("Photo request", left="x", left_label="Close", small=True)}
        <div class="stack-1"><h2 class="title">Coach Anjali wants to use 2 photos</h2><p class="muted">For her coach profile, as a before-and-after. Only with your approval.</p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">{ph("Week 1", 160, "user")}{ph("Week 8", 160, "user")}</div>
        <div class="card"><div class="between"><div class="stack-1"><span class="label">Blur my face</span><span class="caption muted">Applied before sharing</span></div><span class="tick" style="background:var(--color-accent);border-color:var(--color-accent);color:var(--color-on-accent)">{i("check")}</span></div></div>
        <p class="caption muted">You can withdraw at any time in Account → Photos.</p>""",
        foot='<button class="btn primary full">Approve with face blur</button><button class="btn ghost full">Decline</button>')
    return group("13", "Coached athlete: check-in, chat, photos", "Coached athletes submit their own check-ins and talk to their coach. No AI anywhere.", form + chat + consent)

def build() -> tuple[str, str, str]:
    return ("Plus, recovery, progress and coached",
            "AI Coaching (Plus only), trial and paywall, Recovery, Progress and Physique, and the coached athlete's check-in, chat and photo approval (prompt sections 9–13).",
            ai() + paywall() + recovery() + progress() + coached())
