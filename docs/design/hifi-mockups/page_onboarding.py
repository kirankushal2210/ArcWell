"""Onboarding flow, every screen, drawn large (1.3×): F1-01 to F1-05, F1-05b, AO-01 to AO-21b (D52) and the F3 invite path.

Follows the F1/F3 wireframes (docs/design/wireframes/f1-f3-onboarding.html) and the index.html visual
language. Black and white (D50), pull-up mark (D51).
"""
from _parts import appbar, group, i, logo, ph, phone
import onb_athlete
import welcome as welcome_mod

KBD = '<div class="kbd">' + "".join(
    "<div>" + "".join("<i></i>" for _ in range(n)) + "</div>" for n in (10, 9, 7)
) + '<div><i></i><i class="w"></i><i></i></div></div>'


def notes(*items: str) -> str:
    return '<ul class="notes">' + "".join(f"<li>{t}</li>" for t in items) + "</ul>"


def stepbar(n: int, total: int = 7) -> str:
    bars = "".join(f'<i class="{"on" if k < n else ""}"></i>' for k in range(total))
    return f"""<div class="stepbar">
      <div class="between"><button class="iconbtn edge" aria-label="Back">{i("arrow-left")}</button><span class="count">{n} of {total}</span><span style="width:48px"></span></div>
      <div class="progress">{bars}</div>
    </div>"""


def q(title: str, sub: str = "") -> str:
    return f'<div class="stack-1"><h2 class="title">{title}</h2>{f"<p class=\"muted\">{sub}</p>" if sub else ""}</div>'


def opt(title: str, sub: str = "", on: bool = False, icon: str = "", multi: bool = False) -> str:
    ic = f'<span class="ico">{i(icon)}</span>' if icon else ""
    mark = (f'<span class="tick" style="width:24px;height:24px;{"background:var(--color-accent);border-color:var(--color-accent);color:var(--color-on-accent)" if on else ""}">{i("check") if on else ""}</span>'
            if multi else '<span class="radio"></span>')
    return f'<div class="opt{" on" if on else ""}">{ic}<div class="grow"><b>{title}</b>{f"<span>{sub}</span>" if sub else ""}</div>{mark}</div>'


def chip(label: str, on: bool = False) -> str:
    return f'<span class="chip{" on" if on else ""}">{i("check") if on else ""}{label}</span>'


def stepper(value: str, unit: str, label: str) -> str:
    return f'<div class="stepper"><button class="iconbtn" aria-label="Decrease {label}">{i("minus")}</button><span class="v">{value}<small>{unit}</small></span><button class="iconbtn" aria-label="Increase {label}">{i("plus")}</button></div>'


CONTINUE = '<button class="btn primary full">Continue</button>'
GOOGLE = '<button class="btn google full"><span class="gmark" aria-hidden="true">G</span>Continue with Google</button>'
OR = '<div class="row"><div class="grow" style="height:1px;background:var(--color-border)"></div><span class="caption muted">or with email</span><div class="grow" style="height:1px;background:var(--color-border)"></div></div>'


def entry() -> str:
    splash = phone("F1-01", "Splash", notes(
        "Shown only while the session loads, under 1.5 s. No tagline.",
        "Black mark on the light background, centred; matches the native splash (app.json).",
        "Returning, signed-in users go straight to their home tab."),
        f'<div style="flex:1;display:grid;place-items:center">{logo(120)}</div><div style="padding-bottom:var(--space-6);text-align:center" class="caption muted">v1.0</div>', raw=True)

    welcome = welcome_mod.frames()

    signup = phone("F1-03", "Sign up", notes(
        "Google first: fastest, no password. No Apple sign-in on Android.",
        "The chosen role is shown with a way to change it.",
        "Email sign-up sends a verification link; onboarding continues while unverified."),
        f"""{appbar("Create your account", left="arrow-left", left_label="Back", small=True)}
        <div class="banner">{i("dumbbell")}<span class="grow">Signing up as an athlete</span><a class="link" style="min-height:0">Change</a></div>
        {GOOGLE}{OR}
        <div class="stack-4">
          <div class="field"><span class="lbl">Name</span><div class="input"><span class="ph">Your name</span></div></div>
          <div class="field"><span class="lbl">Email</span><div class="input"><span class="ph">name@example.com</span></div></div>
          <div class="field"><span class="lbl">Password</span><div class="input"><span class="ph">At least 8 characters</span><span class="unit">{i("eye")}</span></div></div>
        </div>""",
        foot="""<button class="btn primary full">Create account</button>
        <span class="caption muted">By continuing you agree to the <u>Terms</u> and <u>Privacy Policy</u>.</span>""")

    signup_err = phone("F1-03 · error", "Sign up · typing and validation", notes(
        "The screen scrolls so the active field and the main button stay above the keyboard.",
        "Checked when leaving a field and on submit; the message says how to fix it.",
        "Error = icon + 2 dp red outline + text, never colour alone."),
        f"""{appbar("Create your account", left="arrow-left", left_label="Back", small=True)}
        <div class="stack-4">
          <div class="field"><span class="lbl">Email</span><div class="input error">priya@gmail</div><span class="msg">{i("circle-alert")}Enter a full email, like name@example.com</span></div>
          <div class="field"><span class="lbl">Password</span><div class="input focus">••••••<span class="unit">{i("eye")}</span></div><span class="help">2 more characters</span></div>
        </div>
        <button class="btn primary full">Create account</button>""",
        tight=True, overlay="", foot=KBD.replace('class="kbd"', 'class="kbd" style="margin:0 calc(-1 * var(--gutter-screen))"'))

    signin = phone("F1-04", "Sign in", notes(
        "Google or email only; no phone OTP in v1.",
        "Returning users skip role and onboarding and land on their role's home tab.",
        "Forgot password opens a reset-link sheet."),
        f"""{appbar("Welcome back", left="arrow-left", left_label="Back", small=True)}
        {GOOGLE}{OR}
        <div class="stack-4">
          <div class="field"><span class="lbl">Email</span><div class="input focus">priya.sharma@gmail.com</div></div>
          <div class="field"><span class="lbl">Password</span><div class="input">••••••••••<span class="unit">{i("eye")}</span></div></div>
          <a class="link">Forgot password?</a>
        </div>""",
        foot="""<button class="btn primary full">Sign in</button>
        <div class="row"><span class="label muted" style="font-weight:400">New here?</span><a class="link">Create account</a></div>""")

    return group("F1 · 01–04", "Entry and account",
                 'Splash → Welcome (three-page hero) → Get Started → role sheet → Sign up or Sign in → Consent → athlete or coach onboarding. Welcome redrawn from the founder’s Bulky AI reference (D53).',
                 splash + welcome + signup + signup_err + signin)


def consent_rows(ai: bool) -> str:
    rows = [
        ("heart-pulse", "Health and fitness data", "Body stats, workouts, meals and recovery. Required to use Arcwell.", "on locked"),
        ("image", "Progress photos", "Stored privately. Only you, and your coach if you have one, can see them.", "on"),
    ]
    if ai:
        rows.append(("sparkles", "AI features (optional)", "Lets AI use your logs to build plans. Asked again before first use.", ""))
    rows.append(("bell", "Reminders and notifications", "Workouts, check-ins and coach messages.", "on"))
    return '<div class="card" style="padding-top:var(--space-1);padding-bottom:var(--space-1);gap:0">' + "".join(
        f'<div class="consent"><span class="ico">{i(ic)}</span><div class="grow"><b>{t}</b><span>{s}</span></div><span class="sw {st}"></span></div>'
        for ic, t, s, st in rows) + "</div>"


def consent() -> str:
    c = phone("F1-05", "Consent", notes(
        "DPDP: plain-language, specific, reversible. Health data is required (switch locked on); photos optional (D12).",
        "First AI permission step, with its purpose (D8). Off by default; saying no blocks nothing else.",
        "Everything here can be changed later in Account → Privacy."),
        f"""<div style="padding-top:var(--space-4)">{q("Your data, your choice", "We store health data to personalise your plan. Change these any time.")}</div>
        {consent_rows(True)}""",
        tight=True, foot=CONTINUE + '<a class="link" style="justify-self:start">Read the Privacy Policy</a>')
    c_inv = phone("F1-05b", "Consent · invite sign-up", notes(
        "People joining through a coach's link never see the AI row (D44): coached athletes never see AI.",
        "A line names the coach and what they will see, from the day they join.",
        "Enforced server-side too, not just hidden here."),
        f"""<div style="padding-top:var(--space-4)">{q("Your data, your choice", "Arcwell stores health information so you and Coach Joseph can track your progress.")}</div>
        <div class="banner">{i("user-check")}<span>Coach Joseph sees your data from the day you join.</span></div>
        {consent_rows(False)}""",
        tight=True, foot=CONTINUE + '<a class="link" style="justify-self:start">Read the Privacy Policy</a>')
    return group("F1 · 05", "Consent", "One screen of switches before any question. Two versions: self-sign-up and coach invite.", c + c_inv)


def invite() -> str:
    wa = phone("F3-01", "Invite shared on WhatsApp", notes(
        "Link preview (title, coach photo) is generated on our side so it looks trustworthy.",
        "Needs a small web page at the link domain to open the app or Play Store."),
        f"""<div class="appbar" style="background:var(--color-surface);margin:0 calc(-1*var(--gutter-screen));padding:0 var(--gutter-screen)"><button class="iconbtn edge" aria-label="Back">{i("arrow-left")}</button><span class="av sm">JM</span><span class="title sm">Joseph</span></div>
        <div class="wa"><span>Hey! I'll be coaching you on Arcwell. Tap to join:</span>
          <div class="prev"><div class="row">{logo(28)}<b class="label">Join Coach Joseph on Arcwell</b></div><span class="caption muted">arcwell.app/j/joseph</span></div>
        </div>""", raw=False)

    landing = phone("F3-02", "Invite landing · in app", notes(
        "Shown before sign-up so the client knows who they're joining and what the coach will see.",
        "Join leads to F1-03 with role = athlete pre-set; Welcome is skipped.",
        "Invalid or expired link → friendly error, “Ask your coach for a new link”."),
        f"""<div class="row" style="padding-top:var(--space-2);gap:var(--space-2)">{logo(28)}<span class="heading">Arcwell</span></div>
        <div class="stack-4"><span class="av lg">JM</span>
          <div class="stack-1"><h2 class="title">Coach Joseph Mathew</h2><span class="label muted" style="font-weight:400">Fat loss · Strength · Bengaluru</span></div>
          <p>Joseph will build your training and meal plans, review your weekly check-ins and chat with you here.</p>
        </div>
        <div class="banner">{i("eye")}<span>Your coach sees your workouts, meals, recovery and progress from the day you join.</span></div>""",
        foot='<button class="btn primary full">Join Joseph</button><button class="btn ghost full">Not now</button>')

    switch = phone("F3-03", "Already coached · edge case", notes(
        "One coach at a time, with an explicit choice.",
        "AI subscribers joining a coach go through the cancellation step instead (J-01 → J-03).",
        "The old coach loses access; history stays with the athlete."),
        f"""{appbar("", left="x", left_label="Close")}
        {q("Already have a coach", "You're joining Coach Joseph.")}
        <div class="card g4">
          <div class="row"><span class="av">AR</span><div class="stack-1"><b class="label">Coach Anita Rao</b><span class="caption muted">Your coach since Aug 2026</span></div></div>
          <p class="label muted" style="font-weight:400">You can only have one coach at a time. Joining Joseph ends your coaching with Anita, and she loses access to your data. Your history stays with you.</p>
        </div>""",
        foot='<button class="btn primary full">Switch to Joseph</button><button class="btn secondary full">Keep Coach Anita</button>')
    return group("F3", "Joining through a coach's invite link",
                 "WhatsApp link → Play Store if needed → invite landing → sign up (role skipped) → consent without AI (F1-05b) → questions AO-01 to AO-17 → AO-21b.",
                 wa + landing + switch)


def build() -> tuple[str, str, str]:
    flow = " ".join(f'<b>{a}</b>{i("arrow-right")}' for a in ["Splash", "Welcome", "Sign up", "Consent", "About you", "Goal", "Training", "Recovery", "Nutrition"]) + "<b>Your plan</b>"
    lead = f'Athlete onboarding redrawn from the founder’s reference flow (D52), with training and recovery added. Drawn at 1.3× with the notes behind each screen. Coach onboarding is on its own page. <span class="flowline" style="margin-top:var(--space-2)">{flow}</span>'
    return ("Onboarding flow, every screen", lead, entry() + consent() + onb_athlete.build_all() + invite())
