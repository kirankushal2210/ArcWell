"""Welcome screen (F1-02) and role sheet (F1-02a), D53.

Inspired by the founder's Bulky AI welcome reference: logo lock-up, a phone-in-phone hero, one big
line, one supporting line, Get Started and Sign in. Bulky shows one camera screen because it only
tracks calories; Arcwell's hero is a three-page carousel (Training · Meals · Recovery) whose mode
switcher sits inside the device, where Bulky's Scan Food switcher sits. No AI claim: everyone sees
this screen, and coached athletes never see AI.
"""
from _onb import notes
from _parts import i, logo, phone

MODES = ["Training", "Meals", "Recovery"]


def _training() -> str:
    rows = [("1", "60 kg", "× 8", "done"), ("2", "60 kg", "× 8", "done"), ("3", "62.5 kg", "× 6", "cur")]
    sets = "".join(
        f'<div class="setrow{" cur" if st == "cur" else ""}"><span class="n">{n}</span><b>{kg}</b><b>{reps}</b><span class="tick{" done" if st == "done" else ""}">{i("check") if st == "done" else ""}</span></div>'
        for n, kg, reps, st in rows)
    return f"""<span class="eyebrow"><span class="dot t"></span>Training</span>
      <div class="stack-1"><b class="title">Push day</b><span class="muted">Bench press · exercise 1 of 5</span></div>
      <div class="glist">{sets}</div>
      <span class="pillrow">{i("timer")}Rest 1:24</span>"""


def _meals() -> str:
    meals = [("Breakfast", "Poha, masala chai", "420"), ("Lunch", "Dal, 2 roti, bhindi", "610"), ("Snack", "Sprouts chaat", "210")]
    rows = "".join(f'<div class="kv"><span>{m}<br><small class="muted">{d}</small></span><span>{k}</span></div>' for m, d, k in meals)
    return f"""<span class="eyebrow"><span class="dot nu"></span>Meals</span>
      <div class="stack-1"><b class="title">1,240 <span class="muted" style="font-weight:500">of 1,850 kcal</span></b><div class="kcalbar"><i style="width:67%"></i></div></div>
      <div class="glist">{rows}</div>"""


def _recovery() -> str:
    return f"""<span class="eyebrow"><span class="dot r"></span>Recovery</span>
      <div class="ring-hero" style="width:200px;height:200px"><svg viewBox="0 0 36 36"><circle class="track" cx="18" cy="18" r="15.9155" fill="none" stroke-width="2.6"/><circle class="fill" cx="18" cy="18" r="15.9155" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="82 100"/></svg>
        <div class="v"><b>7h 20m</b><span>sleep · score 82</span></div></div>
      <div class="glist"><div class="kv"><span>Soreness</span><span>Low</span></div><div class="kv"><span>Energy</span><span>4 of 5</span></div></div>"""


PAGES = [_training, _meals, _recovery]


def device(page: int = 0) -> str:
    pages = "".join(f'<div class="pg" aria-hidden="{"false" if k == page else "true"}"><div class="inner">{fn()}</div></div>' for k, fn in enumerate(PAGES))
    modes = "".join(f'<span class="{"on" if k == page else ""}">{m}</span>' for k, m in enumerate(MODES))
    return f"""<div class="hero-dev" role="img" aria-label="Arcwell screens: training, meals and recovery" data-hero>
      <div class="scr"><span class="cam"></span>
        <div class="pages" style="transform:translateX({-184 * page}px)">{pages}</div>
        <div class="modes"><i class="mthumb" style="transform:translateX({100 * page}%)"></i>{modes}</div>
      </div></div>"""


def welcome_body(page: int = 0) -> str:
    return f"""<div class="welcome-head">{logo(34)}<span class="title">Arcwell</span></div>
        {device(page)}
        <div class="welcome-copy"><h1>Train. Eat. Recover.</h1><p>One app for your workouts, Indian meals and sleep, on your own or with your coach.</p></div>"""


WELCOME_FOOT = f"""<button class="btn primary full go" data-act="role">Get Started{i("arrow-right")}</button>
        <span class="signin-row">Already have an account? <a data-act="signin">Sign in</a></span>"""


def role_sheet() -> str:
    return f"""<div class="scrim" data-act="close-role"></div>
      <div class="rsheet" role="dialog" aria-label="Choose how you'll use Arcwell"><span class="grab"></span>
        <h2>How will you use Arcwell?</h2>
        <div class="glist">
          <div class="sel tall has-ic" data-act="athlete">{i("dumbbell")}<div class="grow"><b>I'm training</b><span>Your own workouts, meals and recovery</span></div>{i("chevron-right").replace('<i ', '<i class="chev" ')}</div>
          <div class="sel tall has-ic" data-act="coach">{i("clipboard-check")}<div class="grow"><b>I'm a coach</b><span>Plans, check-ins and chat for your clients</span></div>{i("chevron-right").replace('<i ', '<i class="chev" ')}</div>
        </div>
        <span class="caption muted" style="text-align:center">One role per account. Invited by a coach? Open their link instead.</span>
      </div>"""


def frames() -> str:
    common = ("Headline covers all three pillars; Bulky's single calorie promise becomes “Train. Eat. Recover.”",
              "No AI claim: everyone sees this screen, and coached athletes never see AI.")
    out = []
    for k, m in enumerate(MODES):
        extra = {0: "Hero is a three-page carousel. Swipe the phone or tap its switcher; it follows the finger 1:1 and settles on a spring (no auto-advance).",
                 1: "Meals page shows Indian dishes and the calorie bar, the same parts as the real food log.",
                 2: "Recovery page shows sleep and soreness. Recovery is on Plus or with a coach; free accounts don't get the tab (D2b)."}[k]
        out.append(phone(f"F1-02{'' if k == 0 else ' · ' + str(k + 1)}", f"Welcome · {m}", notes(extra, *common),
                         welcome_body(k), foot=WELCOME_FOOT, tight=True))
    out.append(phone("F1-02a", "Choose your role (sheet)", notes(
        "Get Started opens this sheet, so the role is still chosen before sign-up (D44) without two buttons on the welcome.",
        "Sheet rises critically damped (response 0.3, no bounce); drag it down to dismiss. After a flick it settles with damping 0.8, the sheet value Apple ships, and a flick dismisses even from a short drag.",
        "Scrim dims, never blurs. Each row goes to sign-up (F1-03) with the role set."),
        welcome_body(0), foot=WELCOME_FOOT, tight=True, overlay=role_sheet()))
    return "".join(out)
