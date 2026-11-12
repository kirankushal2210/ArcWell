"""Page 3: coach workspace, side menu and account, states, notifications (prompt sections 14–17)."""
from _parts import appbar, bar, group, i, ph, phone

# ---------- 14 Coach workspace ----------
def coach() -> str:
    clients = [("PS", "Priya Sharma", "Check-in overdue · 2 days", "92%", "active"),
               ("RV", "Rahul Verma", "Low adherence this week", "48%", "active"),
               ("VS", "Venkatalakshmi Subramanian", "Leaving 30 Nov", "81%", "leaving"),
               ("AM", "Arjun Mehta", "Paused until 1 Dec", "—", "paused"),
               ("KS", "Karan Singh", "On track", "96%", "active")]
    rows = "".join(f'<div class="lr"><span class="av">{a}</span><div class="t"><b>{n}</b><span>{s}</span></div><span class="r"><span class="label num" style="color:var(--color-text)">{p}</span><span class="status {st}">{st.title()}</span></span></div>' for a, n, s, p, st in clients)
    lst = phone("K-01", "Clients", "Adherence and overdue check-ins at a glance. Status chips pair a dot with a word (D39).",
        f"""{appbar("Clients", right=["search", "user-plus"])}
        <div class="row wrap"><span class="chip on">{i("check")}Needs attention · 4</span><span class="chip">Active · 28</span><span class="chip">Paused · 3</span></div>
        <div class="card flush">{rows}</div>""",
        tab=("coach", "Clients"))
    inbox_rows = [("PS", "Priya Sharma", "−0.6 kg · 4/4 workouts · 1 question", "2 h ago"),
                  ("RV", "Rahul Verma", '+0.2 kg · 2/4 workouts · "knee sore"', "5 h ago"),
                  ("AI", "Ananya Iyer", "−0.4 kg · 3/3 workouts", "Yesterday")]
    inbox = phone("F6-07", "Check-in inbox", "Triage: to review (oldest first), overdue with Send reminder, reviewed.",
        f"""{appbar("Check-ins", right=["calendar"])}
        <p class="muted" style="margin-top:calc(-1 * var(--space-4))">Week of 9 Nov</p>
        <div class="row wrap"><span class="chip on">{i("check")}To review · 9</span><span class="chip">Overdue · 3</span><span class="chip">Reviewed · 24</span></div>
        <div class="card flush">""" + "".join(f'<div class="lr"><span class="av">{a}</span><div class="t"><b>{n}</b><span>{s}</span></div><span class="r">{t}</span>{i("chevron-right")}</div>' for a, n, s, t in inbox_rows) + """</div>
        <div class="stack"><span class="eyebrow">Overdue</span><div class="card"><div class="between"><div class="row" style="gap:var(--space-3)"><span class="av">KS</span><div class="stack-1"><span class="label">Karan Singh</span><span class="caption muted">Due Sunday · 2 days late</span></div></div><button class="btn sm secondary">Send reminder</button></div></div></div>""",
        tab=("coach", "Check-ins"))
    trs = [("Weight (avg)", "74.4", "73.8", "−0.6"), ("Waist", "84.0", "83.0", "−1.0"), ("Workouts", "4/4", "4/4", "—"), ("Avg kcal", "1,880", "1,910", "+30"), ("Avg sleep", "6.5 h", "6.8 h", "+0.3")]
    table = "".join(f'<div class="lr" style="min-height:40px;padding:var(--space-2) 0"><span class="label grow" style="font-weight:400">{k}</span><span class="label num muted" style="width:56px;text-align:right">{a}</span><span class="label num" style="width:56px;text-align:right">{b}</span><span class="label num muted" style="width:48px;text-align:right">{d}</span></div>' for k, a, b, d in trs)
    review = phone("F6-08", "Check-in review", "One scrolling screen; numbers come from logs, so the coach copies nothing into Excel. '1 of 9 ›' goes to the next client.",
        f"""<div class="appbar"><button class="iconbtn edge" aria-label="Back to inbox">{i("arrow-left")}</button><span class="label grow">Inbox</span><span class="label num muted">1 of 9</span><button class="iconbtn end" aria-label="Next client">{i("chevron-right")}</button></div>
        <div class="stack-1"><span class="heading">Priya Sharma · Week 3</span><span class="caption muted">Fat loss · 3 weeks with you · submitted 2 h ago</span></div>
        <div class="card flush"><div class="lr" style="min-height:32px;padding:var(--space-2) 0"><span class="caption muted grow"></span><span class="caption muted" style="width:56px;text-align:right">Last wk</span><span class="caption muted" style="width:56px;text-align:right">This wk</span><span class="caption muted" style="width:48px;text-align:right">Δ</span></div>{table}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">{ph("Week 2", 96, "user")}{ph("Week 3", 96, "user")}</div>
        <div class="card"><span class="caption muted">Energy 4 · Hunger 3 · Stress 2 · Digestion 4</span><span class="label" style="font-weight:400">"Weekend wedding — overate on Saturday"</span></div>""",
        foot='<button class="btn primary full">Write feedback</button>')
    t = lambda n, s: f'<div class="lr"><span class="ico">{i("list-checks")}</span><div class="t"><b>{n}</b><span>{s}</span></div>{i("chevron-right")}</div>'
    plans = phone("K-05", "Plans · templates", "Reusable templates; assign to a client, then customise.",
        f"""{appbar("Plans", right=["search"])}
        <div class="row wrap"><span class="chip on">{i("check")}Training · 6</span><span class="chip">Meals · 4</span></div>
        <div class="card flush">{t("Fat loss · 4 days", "Upper/lower · assigned to 9 clients")}{t("Muscle gain · 5 days", "Push/pull/legs · 7 clients")}{t("Beginner full body · 3 days", "12 clients")}{t("Post-partum return · 3 days", "2 clients")}</div>""",
        foot=f'<button class="btn primary full">{i("plus")}New template</button>',
        tab=("coach", "Plans"))
    ex = [("Back squat", "4 × 6–8 · rest 2:30"), ("Romanian deadlift", "3 × 8–10 · rest 2:00"), ("Walking lunge", "3 × 12 each · rest 1:30"), ("Leg curl", "3 × 12 · rest 1:00")]
    builder = phone("K-06", "Plan builder", "Day by day; every exercise comes from the shared library.",
        f"""{appbar("Fat loss · 4 days", left="arrow-left", left_label="Back", small=True, right=["ellipsis-vertical"])}
        <div class="row wrap"><span class="chip">Day 1 · Upper</span><span class="chip on">{i("check")}Day 2 · Lower</span><span class="chip">Day 3</span><span class="chip">Day 4</span></div>
        <div class="card flush">""" + "".join(f'<div class="lr"><span class="ico">{i("grip-vertical")}</span><div class="t"><b>{n}</b><span>{s}</span></div><button class="iconbtn end" aria-label="Edit {n}">{i("pencil")}</button></div>' for n, s in ex) + f"""</div>
        <button class="btn secondary full">{i("plus")}Add exercise</button>""",
        foot='<button class="btn primary full">Assign to client</button>')
    business = phone("K-10 · K-14", "Business · invite and leads", "Invite link auto-links client to coach. Basic leads list; leads are contacted outside the app (D45).",
        f"""{appbar("Business")}
        <div class="card g4"><span class="eyebrow">Your invite link</span><div class="input"><span class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">arcwell.app/c/anjali-kapoor</span></div>
          <div class="row"><button class="btn secondary grow">{i("copy")}Copy</button><button class="btn primary grow">{i("share-2")}Share</button></div>
          <span class="caption muted num">28 of 40 client spots used</span>{bar(70, "b")}</div>
        <div class="stack"><div class="between"><span class="heading">Leads</span><a class="link">Add lead</a></div>
          <div class="card flush"><div class="lr"><span class="av">NR</span><div class="t"><b>Neha Rao</b><span>Instagram · asked about pricing</span></div><span class="r">New</span></div>
          <div class="lr"><span class="av">SG</span><div class="t"><b>Siddharth Gupta</b><span>Referral · call on Friday</span></div><span class="r">Follow up</span></div></div></div>""",
        tab=("coach", "Business"))
    return group("14", "Coach workspace", "Same app, coach interface. Bar: Clients · Check-ins · Plans · Messages · Business (D23). No AI anywhere.", lst + inbox + review + plans + builder + business)

# ---------- 15 Side menu and account ----------
def menu() -> str:
    drawer = phone("N-04", "Side menu", "Shared side menu for all athletes (D9). No Set Videos (D14).",
        f"""{appbar("Today", right=["bell"])}<div class="sk card" style="height:180px"></div>""",
        overlay=f"""<div class="scrim"></div><div class="drawer">
          <div class="row" style="gap:var(--space-3);padding:0 var(--space-3) var(--space-4)"><span class="av">PS</span><div class="stack-1"><b class="label">Priya Sharma</b><span class="caption muted">Arcwell Plus</span></div></div>
          <div class="mi">{i("user")}Account</div><div class="mi">{i("bell")}Notifications<span class="end num">2</span></div>
          <div class="mi-head">Training</div>
          <div class="mi">{i("dumbbell")}Exercises</div><div class="mi on">{i("list")}Workouts</div><div class="mi">{i("calendar-range")}Programs</div><div class="mi">{i("history")}History</div><div class="mi">{i("chart-bar")}Muscle analytics</div>
          <div class="mi-head">More</div>
          <div class="mi">{i("map-pin")}Gyms</div><div class="mi">{i("scale")}Physique</div>
        </div>""")
    row = lambda icon, t, s="", end="": f'<div class="lr"><span class="ico">{i(icon)}</span><div class="t"><b>{t}</b>{f"<span>{s}</span>" if s else ""}</div>{f"<span class=r>{end}</span>" if end else ""}{i("chevron-right")}</div>'
    account = phone("AC-01", "Account", "Subscription, goals, reminders, notifications, data export and deletion (SPEC).",
        f"""{appbar("Account", left="arrow-left", left_label="Back", small=True)}
        <div class="card"><div class="row" style="gap:var(--space-3)"><span class="av lg">PS</span><div class="stack-1 grow"><span class="heading">Priya Sharma</span><span class="caption muted">priya.sharma@gmail.com</span></div></div></div>
        <div class="card flush">{row("sparkles", "Arcwell Plus", "Yearly · renews 14 Nov 2027")}{row("target", "Goals", "Build muscle · 2,300 kcal")}{row("alarm-clock", "Reminders", "Workout 18:00")}{row("bell", "Notifications", "5 of 6 on")}</div>
        <div class="card flush">{row("download", "Export my data")}{row("trash-2", "Delete account")}</div>
        <button class="btn ghost full" style="justify-content:flex-start;padding:0">{i("log-out")}Sign out</button>""")
    return group("15", "Side menu and account", "Drawer for athletes; account holds everything about the person and their data.", drawer + account)

# ---------- 16 States ----------
def states() -> str:
    loading = phone("S-01", "Loading", "Skeleton in the shape of the content. Pulses 1.4 s; still with reduced motion.",
        f"""{appbar("Nutrition", right=["search"])}
        <div class="sk card" style="height:112px"></div><div class="sk" style="height:20px;width:40%"></div>
        <div class="sk card" style="height:56px"></div><div class="sk card" style="height:56px"></div><div class="sk card" style="height:56px"></div>""",
        tab=("free", "Nutrition"))
    empty = phone("E-02", "Empty", "Left-aligned (C6), one clear action. Lucide icon, no illustration.",
        f"""{appbar("History", left="arrow-left", left_label="Back", small=True)}
        <div class="card"><div class="empty"><div class="tile">{i("dumbbell")}</div>
          <div class="stack-1"><h3 class="heading">No workouts yet</h3><p class="label muted" style="font-weight:400">Finished workouts show up here, grouped by week.</p></div>
          <button class="btn primary full">Start today's workout</button></div></div>""")
    error = phone("S-02", "Error", "Says what failed and that data is safe; retry is a 48 dp target.",
        f"""{appbar("Nutrition", right=["search"])}
        <div class="err">{i("circle-alert")}<div class="stack-1 grow"><span>Couldn't load your food log. Your entries are safe.</span><a class="link">Try again</a></div></div>
        <div class="banner">{i("cloud-off")}You're offline. New entries are saved on your phone.</div>""",
        tab=("free", "Nutrition"))
    return group("16", "Empty, loading and error", "Every list has all three (DESIGN.md §8).", loading + empty + error)

# ---------- 17 Notifications ----------
NOTIFS = [("New message", "Coach Anjali", "New message from Coach Anjali", "\"Here's this week. Squat moves to 52.5 kg.\"", "now"),
          ("Check-in due", "Arcwell", "Your weekly check-in is due today", "Takes about 3 minutes.", "8:00"),
          ("Check-in submitted", "Arcwell · coach", "Priya submitted her check-in", "−0.6 kg · 4/4 workouts · 1 question", "2 h"),
          ("Plan assigned", "Arcwell", "Your coach assigned a new plan", "Fat loss · 4 days starts Monday.", "Mon"),
          ("Workout reminder", "Arcwell", "Today: Push day · 45 min", "6 exercises. Tap to start.", "18:00"),
          ("Coach feedback", "Coach Anjali", "Your coach replied to your check-in", "\"Great week. Add 2.5 kg to bench.\"", "Sun")]

def notif(app, title, body, when) -> str:
    return f'<div class="notif"><span class="app">A</span><div class="t"><span class="top"><span>{app}</span><span>·</span><span class="num">{when}</span></span><b>{title}</b><span>{body}</span></div></div>'

def notifications() -> str:
    lock = f"""<figure><div class="lock" role="img" aria-label="Lock screen with Arcwell notifications"><span class="clock">9:41</span><span class="date">Thursday, 12 November</span>
      {notif(*NOTIFS[4][1:])}{notif(*NOTIFS[0][1:])}{notif(*NOTIFS[1][1:])}</div>
      <figcaption><b>Lock screen</b><span>Three of the six, as an athlete would see them.</span></figcaption></figure>"""
    cards = "".join(f'<div class="stack-1"><span class="caption muted">{k}</span>{notif(*rest)}</div>' for k, *rest in NOTIFS)
    allsix = f'<figure><div class="notif-list">{cards}</div><figcaption><b>All six v1 notifications</b><span>The only notifications in v1 (SPEC). Coach-only: "check-in submitted".</span></figcaption></figure>'
    return group("17", "Push notifications", "Six notifications, plain and specific. No streak nags, no guilt.", lock + allsix)

def build() -> tuple[str, str, str]:
    return ("Coach, menu, states and notifications",
            "The coach workspace, the athlete side menu and account, empty/loading/error states, and the six push notifications (prompt sections 14–17).",
            coach() + menu() + states() + notifications())
