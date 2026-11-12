"""Coach onboarding (after “I'm a coach”), in the same reference style as the athlete flow (D52).

Same IDs as the wireframes in docs/design/wireframes/f2-coach-onboarding.html (old F2 IDs are noted per screen): sign up → what you get → coach agreement →
your coaching → profile → services → first template → invite → clients.
"""
from _onb import chip, foot, notes, obar, options, qh, sel
from _parts import appbar, group, i, logo, phone

SEC = {"practice": ("Your coaching", ""), "profile": ("Profile", ""), "services": ("Services", ""), "plans": ("Templates", "t")}
ORD = list(SEC)


def bar(sec: str, k: int, n: int) -> str:
    return obar(sec, k, n, ORD, SEC)


GOOGLE = '<button class="btn google full"><span class="gmark" aria-hidden="true">G</span>Continue with Google</button>'
OR = '<div class="row"><div class="grow" style="height:1px;background:var(--color-border)"></div><span class="caption muted">or with email</span><div class="grow" style="height:1px;background:var(--color-border)"></div></div>'


def start() -> str:
    signup = phone("CO-01", "Sign up as a coach", notes(
        "Same screen as K-19 (wireframe f14).",
        "Same sign-up as athletes (F1-03); the banner shows the role chosen on Welcome.",
        "Google first; no Apple sign-in on Android."),
        f"""{appbar("Create your coach account", left="arrow-left", left_label="Back", small=True)}
        <div class="banner">{i("clipboard-check")}<span class="grow">Signing up as a coach</span><a class="link" style="min-height:0">Change</a></div>
        {GOOGLE}{OR}
        <div class="stack-4">
          <div class="field"><span class="lbl">Name</span><div class="input">Joseph Mathew</div></div>
          <div class="field"><span class="lbl">Email</span><div class="input focus">joseph@fitwithjoseph.in</div></div>
          <div class="field"><span class="lbl">Password</span><div class="input"><span class="ph">At least 8 characters</span><span class="unit">{i("eye")}</span></div></div>
        </div>""",
        foot='<button class="btn primary full">Create account</button><span class="caption muted">By continuing you agree to the Terms and Privacy Policy.</span>')
    value = phone("CO-02", "What you get", notes(
        "Was F2-01.",
        "Sells the time Arcwell saves versus WhatsApp and Excel; coaches are the paying customer.",
        "“Free for your clients” removes the main objection to switching."),
        f"""<div class="qh" style="padding-top:var(--space-4)">{logo(44)}<h2>Run your coaching in one place</h2><p>Built for coaches in India.</p></div>
        <div class="stack">""" + "".join(
            f'<div class="feat">{i(ic)}<div class="grow"><b>{t}</b><span>{s}</span></div></div>' for ic, t, s in [
                ("list-checks", "Plans clients actually follow", "Training and Indian meal plans in their app"),
                ("clipboard-check", "Check-ins without chasing", "Reminders, photos and numbers side by side"),
                ("users", "See who needs you", "Adherence, missed workouts and messages in one list"),
                ("gift", "Free for your clients", "They download Arcwell and join with your link"),
            ]) + "</div>",
        tight=True, foot=foot("Set up my coaching") + '<span class="caption muted" style="justify-self:center">Takes about 5 minutes</span>')
    agree = phone("CO-03", "Coach agreement", notes(
        "Was F2-02.",
        "Coaches handle clients' health data, so DPDP duties are stated plainly, not buried.",
        "Replaces athlete consent (F1-05) for coaches. Coach Terms need legal review (PLAN.md).",
        "Continue stays disabled until the box is ticked."),
        qh("Looking after your clients' data", "Your clients trust you with health information and photos. By coaching on Arcwell you agree to:", "shield-check") +
        '<div class="stack">' + "".join(
            f'<div class="feat">{i(ic)}<div class="grow"><b>{t}</b><span>{s}</span></div></div>' for ic, t, s in [
                ("shield-check", "Use client data only for coaching them", "Never share, sell or post it elsewhere"),
                ("image", "Ask before sharing photos", "Transformation photos need the client's approval in the app"),
                ("door-open", "Respect when clients leave", "Your access ends with the coaching; their history stays with them"),
            ]) + "</div>" +
        f'<div class="glist"><div class="sel multi on" role="checkbox" aria-checked="true"><div class="grow"><b>I agree to the Coach Terms and Privacy Policy</b></div><span class="ck">{i("check")}</span></div></div>',
        tight=True, foot=foot("Continue"))
    return group("CO · 01–03", "Coach sign-up", "Welcome → “I'm a coach” → sign up → what you get → agreement.", signup + value + agree)


def practice() -> str:
    how = phone("CO-04", "How you coach", notes(
        "New in D52, from the reference style. Tunes the setup checklist: in-person coaches get the QR code first.",
        "Not shown to clients."),
        bar("practice", 1, 2) + qh("How do you coach?", "We'll set things up the way you work.", "building-2") +
        options(sel("In person", "At a gym or studio", icon="building-2", tall=True),
                sel("Online", "Clients anywhere, over chat and calls", icon="smartphone", tall=True),
                sel("Both", "A mix of gym-floor and online clients", True, "repeat", tall=True)),
        foot=foot())
    size = phone("CO-05", "Clients today", notes(
        "New in D52. Sizes the suggested coach plan and the client limit message (D40); no price shown here.",
        "Ranges, not an exact number, so nobody has to count."),
        bar("practice", 2, 2) + qh("How many clients do you coach right now?", "Roughly is fine.", "users") +
        options(sel("Just starting", "No paying clients yet", icon="sprout"),
                sel("1–10 clients", icon="user"),
                sel("11–30 clients", "", True, "users"),
                sel("31–60 clients", icon="users-round"),
                sel("More than 60", icon="building")),
        tight=True, foot=foot())
    return group("CO · 04–05", "Your coaching", "Two taps that shape the setup checklist. Same option cards as the athlete flow.", how + size)


def profile() -> str:
    basics = phone("CO-06", "Profile basics", notes(
        "Was F2-03.",
        "The only required step: name, photo and city power the invite landing page (F3-02).",
        "Display name is free text, so “Coach Joseph” or “Fit with Joseph” both work."),
        bar("profile", 1, 3) + qh("Your coach profile", "This is what clients see when they join you.", "id-card") +
        f"""<div class="row" style="gap:var(--space-4)"><div class="photo-add">{i("camera")}</div><div class="stack-1"><b class="label">Add a photo</b><span class="caption muted">A clear face photo builds trust on WhatsApp previews.</span></div></div>
        <div class="field"><span class="lbl">Name clients see</span><div class="input focus">Coach Joseph</div></div>
        <div class="field"><span class="lbl">City</span><div class="input">Bengaluru<span class="unit">{i("map-pin")}</span></div></div>""",
        foot=foot())
    spec = phone("CO-07", "Specialisations", notes(
        "Was F2-03.",
        "Pick up to 3; shown on the profile and the invite page.",
        "A fourth tap shows “Pick up to 3”; it doesn't silently drop one."),
        bar("profile", 2, 3) + qh("What do you specialise in?", "Pick up to 3. Clients see these first.", "award") +
        f"""<div class="row wrap" data-max="3">{chip("Fat loss", True)}{chip("Strength", True)}{chip("Muscle gain")}{chip("Women's fitness")}{chip("Beginners", True)}{chip("Contest prep")}{chip("Home workouts")}{chip("PCOS")}{chip("Endurance")}{chip("Mobility")}</div>
        <span class="caption muted" data-picked>3 of 3 picked</span>""",
        foot=foot())
    about = phone("CO-08", "About you", notes(
        "Was F2-04.",
        "Optional, can be added later. Certifications are self-reported and not verified in v1.",
        "Instagram links back to where coaches find clients."),
        bar("profile", 3, 3) + qh("About you", "Optional. You can add this later.", "pencil-line") +
        f"""<div class="field"><span class="lbl">Short bio</span><div class="textarea" style="color:var(--color-text)">I help busy professionals lose fat and get strong with simple, sustainable plans.</div><span class="help">84 / 160</span></div>
        <div class="row" style="gap:var(--space-3)"><div class="field grow"><span class="lbl">Instagram</span><div class="input">@coachjoseph</div></div><div class="field" style="width:104px"><span class="lbl">Years</span><div class="input num">5</div></div></div>
        <div class="field"><span class="lbl">Certifications <span class="muted" style="font-weight:400">(self-reported)</span></span><div class="input"><span class="ph">e.g. ACE-CPT, K11</span></div></div>""",
        tight=True, foot=foot(skip=True))
    return group("CO · 06–08", "Profile", "What clients see on the invite page. Only the basics are required.", basics + spec + about)


def setup() -> str:
    services = phone("CO-09", "Services", notes(
        "Was F2-05.",
        "Display only: Arcwell doesn't take client payments; coaches bill clients themselves.",
        "Price is optional (“Price on request”)."),
        bar("services", 1, 1) + qh("Your coaching services", "Shown on your profile. Payments stay between you and your clients.", "indian-rupee") +
        '<div class="stack">' + "".join(
            f'<div class="card"><div class="between"><b class="label">{t}</b><b class="label num">{p}</b></div><span class="caption muted">{s}</span></div>' for t, p, s in [
                ("12-week fat loss", "₹12,000", "Training + meal plan · weekly check-ins · chat"),
                ("Monthly coaching", "₹4,500 / month", "Training + meal plan · weekly check-ins"),
            ]) + f'<button class="btn secondary full">{i("plus")}Add a service</button></div>',
        foot=foot(skip=True))
    template = phone("CO-10", "First template", notes(
        "Was F2-06.",
        "Starting from an Arcwell template is fastest; the plan builder is drawn in F13.",
        "D55: “Copy from my spreadsheet” is in v1. Choosing it shows a file chooser for Excel (.xlsx, .xls), Google Sheets or CSV; after setup the file becomes a draft template the coach checks before any client sees it."),
        bar("plans", 1, 1) + qh("Create your first training template", "Reuse it for every client and adjust per person.", "clipboard-list") +
        options(sel("Start from an Arcwell template", "Push / pull / legs, upper / lower, full body", True, "layout-template", tall=True),
                sel("Build from scratch", "Opens the plan builder", icon="pencil-ruler", tall=True),
                sel("Copy from my spreadsheet", "Excel, Google Sheets or CSV", icon="sheet", tall=True)),
        foot=foot("Continue", skip=True, skip_label="Skip, I'll do this later"))
    def dark(x: int, y: int) -> bool:
        for fx, fy in ((0, 0), (14, 0), (0, 14)):  # three finder squares, like a real QR code
            if fx <= x < fx + 7 and fy <= y < fy + 7:
                dx, dy = x - fx, y - fy
                return dx in (0, 6) or dy in (0, 6) or (2 <= dx <= 4 and 2 <= dy <= 4)
            if fx - 1 <= x <= fx + 7 and fy - 1 <= y <= fy + 7:
                return False
        return (x * 73 + y * 151 + x * y * 37) % 7 < 3
    qr = "".join(f'<i class="{"" if dark(x, y) else "o"}"></i>' for y in range(21) for x in range(21))
    invite = phone("CO-11", "Invite clients", notes(
        "Was F2-07.",
        "One personal link for all clients, shared where coaches already talk (WhatsApp first).",
        "Editable pre-written message; QR for gym-floor clients. Link can be reset in Business."),
        qh("Invite your clients", "Clients download Arcwell free and connect to you automatically.", "send") +
        f"""<div class="input" style="background:var(--color-surface)">{i("link")}<span class="grow">arcwell.app/j/joseph</span><a class="link" style="min-height:0">Copy</a></div>
        <div class="share4">{"".join(f'<div><span>{i(ic)}</span>{t}</div>' for ic, t in [("message-circle", "WhatsApp"), ("instagram", "Instagram"), ("message-square", "SMS"), ("share-2", "More")])}</div>
        <div class="field"><span class="lbl">Message (edit if you like)</span><div class="textarea" style="color:var(--color-text)">Hi! I'm moving our coaching to Arcwell: your plans, check-ins and chat in one app. Join here: arcwell.app/j/joseph</div></div>
        <div class="row" style="gap:var(--space-4)"><div class="qr">{qr}</div><span class="caption muted">Show this QR code to clients at the gym.</span></div>""",
        tight=True, foot=foot("Done"))
    done = phone("CO-12", "Ready to coach", notes(
        "Same calm finish as the athlete flow: mark, check badge, a summary. No confetti.",
        "Skipped steps become the Clients-tab checklist (CO-13)."),
        f"""<div style="flex:1;display:grid;align-content:center;gap:var(--space-6)">
          <div class="medal">{logo(72)}<span class="badge">{i("check")}</span></div>
          <div class="qh center"><h2>You're ready to coach</h2><p>Your profile is live and your link is ready to share.</p></div>
          <div class="card" style="gap:0">
            <div class="kv"><span>Profile</span><span>{i("check")} Done</span></div>
            <div class="kv"><span>Services</span><span>2 added</span></div>
            <div class="kv"><span>Training template</span><span>Full body · edit later</span></div>
            <div class="kv"><span>Meal plan template</span><span class="muted">To do</span></div>
          </div></div>""",
        foot=foot("Go to Clients"))
    return group("CO · 09–12", "Services, template and invite", "Everything after the profile can be skipped and finished from the checklist.",
                 services + template + invite + done)


def first_days() -> str:
    empty = phone("CO-13", "Clients · empty with checklist", notes(
        "Was F2-08.",
        "Skipped steps aren't lost: they stay here until done or dismissed.",
        "Turns the empty state into a to-do list instead of a dead end."),
        appbar("Clients", right=["user-plus"]) +
        f"""<div class="card g4"><div class="between"><b class="label">Finish setting up</b><span class="caption muted num">4 of 6</span></div>
          <div class="loadbar"><i style="width:66%"></i></div>
          <div class="build">
            <div class="done"><span class="ck">{i("check")}</span>Create your profile</div>
            <div class="done"><span class="ck">{i("check")}</span>Accept coach terms</div>
            <div class="done"><span class="ck">{i("check")}</span>Add your services</div>
            <div class="done"><span class="ck">{i("check")}</span>Create a training template</div>
            <div class="now"><span class="ck"></span><span class="grow">Create a meal plan template</span><a class="link" style="min-height:0">Create</a></div>
            <div class="now"><span class="ck"></span><span class="grow">Invite your first client</span><a class="link" style="min-height:0">Invite</a></div>
          </div></div>
        <div class="stack-1"><b class="label">No clients yet</b><span class="label muted" style="font-weight:400">When someone joins with your link, they'll appear here.</span></div>""",
        tab=("coach", "Clients"), tight=True)
    joined = phone("CO-14", "Clients · first clients join", notes(
        "Was F2-09.",
        "New clients sit under “Needs a plan” until the coach assigns one.",
        "Invite-link open counts are v1.1 (D45), so they aren't shown."),
        appbar("Clients", right=["user-plus"]) +
        f"""<div class="banner">{i("user-check")}<span class="grow">Priya Sharma joined you. Assign her plan to get started.</span></div>
        <div class="row"><span class="chip on">New · 2</span>{chip("Active · 0")}{chip("All · 2")}</div>
        <span class="eyebrow">Needs a plan</span>
        <div class="card flush">""" + "".join(
            f'<div class="wo"{" style=\"border-top:var(--border-divider)\"" if n else ""}><span class="av">{a}</span><div class="grow"><b>{nm}</b><span>{s}</span></div><a class="link" style="min-height:0">Assign</a></div>'
            for n, (a, nm, s) in enumerate([("PS", "Priya Sharma", "Lose fat · joined 10 min ago"), ("RV", "Rahul Verma", "Get stronger · joined yesterday")])) +
        "</div>",
        tab=("coach", "Clients"), tight=True)
    client = phone("CO-15", "New client · answers and plan", notes(
        "Was F2-10.",
        "Everything a WhatsApp intake form would ask, already answered, including the new training and recovery answers (D52).",
        "No custom intake questions in v1 (D44). The coach's plan replaces the client's guidance (D7)."),
        appbar("Priya Sharma", left="arrow-left", left_label="Back to clients", right=["ellipsis-vertical"], small=True) +
        f"""<div class="card dense" style="gap:0">""" + "".join(f'<div class="kv"><span>{k}</span><span>{v}</span></div>' for k, v in [
            ("Goal", "Lose fat · to 63 kg"), ("Body", "26 · 162 cm · 68.0 kg · female"), ("Activity", "Mostly sitting"),
            ("Experience", "6 months – 2 years"), ("Training", "Gym · 4 × 45 min · mornings"), ("Injuries", "Lower back"),
            ("Sleep", "6.5 h · okay · stress 4/5"), ("Diet", "Vegetarian · 3 meals")]) +
        f"""</div>
        <div class="stack"><button class="btn primary full">{i("dumbbell")}Assign training plan</button><button class="btn secondary full">{i("utensils")}Assign meal plan and targets</button></div>
        <div class="row" style="justify-content:space-between"><a class="link">Sleep target (K-24)</a><a class="link">Check-in day</a><a class="link">Message</a></div>""",
        tab=("coach", "Clients"), tight=True)
    return group("CO · 13–15", "First days as a coach", "Empty list with a checklist → first clients join → answers ready, assign a plan.",
                 empty + joined + client)


def build() -> tuple[str, str, str]:
    flow = " ".join(f'<b>{a}</b>{i("arrow-right")}' for a in ["Welcome · I'm a coach", "Sign up", "What you get", "Agreement", "Your coaching", "Profile", "Services", "Template", "Invite"]) + "<b>Clients</b>"
    lead = f'What happens after “I’m a coach”, in the same style as the athlete flow (D52). Same CO-xx IDs as the F2 wireframes; drawn at 1.3×. <span class="flowline" style="margin-top:var(--space-2)">{flow}</span>'
    return ("Coach onboarding, every screen", lead, start() + practice() + profile() + setup() + first_days())
