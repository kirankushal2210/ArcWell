"""Shared building blocks for the Arcwell hi-fi mockup pages (black and white, D50).

Run `python3 build.py` in this folder to regenerate every page. Each page links
../theme-tokens.css and hifi.css, and also inlines exact copies of both so it
still renders in viewers that can't load linked files.
"""
import base64
from pathlib import Path

HERE = Path(__file__).parent
TOKENS = (HERE.parent / "theme-tokens.css").read_text().strip()
CSS = (HERE / "hifi.css").read_text().strip()
# Logo mark (D51), inlined so it shows in viewers that can't load linked files.
_MARK = base64.b64encode((HERE.parents[2] / "app/assets/brand/arcwell-mark-ink.png").read_bytes()).decode()


def logo(h: int = 28) -> str:
    return f'<img class="logo" alt="" aria-hidden="true" style="height:{h}px" src="data:image/png;base64,{_MARK}">'

PAGES = [
    ("index.html", "1–8 · System, entry, athlete core"),
    ("athlete-plus-coached.html", "9–13 · Plus, recovery, progress, coached"),
    ("coach-and-system.html", "14–17 · Coach, menu, states, notifications"),
    ("onboarding-flow.html", "Athlete onboarding · every screen"),
    ("coach-onboarding.html", "Coach onboarding · every screen"),
    ("onboarding-prototype.html", "Onboarding prototype · interactive"),
]


def page(file: str, title: str, lead: str, body: str, cls: str = "") -> str:
    nav = "".join(f'<a href="{f}">{t}</a>' for f, t in PAGES if f != file)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<!-- Exact copies of ../theme-tokens.css and hifi.css for viewers that can't load linked files.
     The <link>s below win wherever they load. Regenerate with build.py; never edit by hand. -->
<style id="tokens-fallback">
{TOKENS}
</style>
<style id="hifi-fallback">
{CSS}
</style>
<link rel="stylesheet" href="../theme-tokens.css">
<link rel="stylesheet" href="hifi.css">
<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
</head>
<body>
<main class="board{(" " + cls) if cls else ""}">
  <header class="board-head">
    <span class="eyebrow">Arcwell · hi-fi mockups · black and white (D50)</span>
    <h1>{title}</h1>
    <p>{lead}</p>
    <p class="caption muted">Draft, not approved or user-tested. Android, 360 × 760 dp frames. Every value comes from theme-tokens.css. The logo is the pull-up mark (D51); photos are placeholder tiles.</p>
    <nav class="board-nav">{nav}</nav>
  </header>
{body}
</main>
<script>window.lucide && lucide.createIcons();</script>
</body>
</html>
"""


def group(idx: str, title: str, lead: str, frames: str) -> str:
    return f"""
  <section class="group">
    <div class="group-head"><span class="idx">{idx}</span><h2>{title}</h2><p>{lead}</p></div>
    <div class="frames">{frames}</div>
  </section>"""


def i(name: str) -> str:
    return f'<i data-lucide="{name}"></i>'


SB = f'<div class="sb"><span>9:41</span><span class="ic">{i("signal")}{i("wifi")}{i("battery-full")}</span></div>'
NAV = '<div class="navbar"><i></i></div>'

TABS = {
    "free": [("house", "Today"), ("dumbbell", "Training"), ("utensils", "Nutrition")],
    "plus": [("house", "Today"), ("dumbbell", "Training"), ("utensils", "Nutrition"), ("moon", "Recovery"), ("sparkles", "AI Coaching")],
    "coached": [("house", "Today"), ("dumbbell", "Training"), ("utensils", "Nutrition"), ("moon", "Recovery"), ("trending-up", "Progress")],
    "coach": [("users", "Clients"), ("clipboard-check", "Check-ins"), ("list-checks", "Plans"), ("message-circle", "Messages"), ("briefcase", "Business")],
}


def bnav(tier: str, on: str) -> str:
    items = "".join(
        f'<a class="{"on" if label == on else ""}"><span class="pill">{i(icon)}</span><span>{label}</span></a>'
        for icon, label in TABS[tier]
    )
    return f'<nav class="bnav">{items}</nav>'


# When set to a list, phone() also records each screen's parts (used by the prototype page).
CAPTURE: list | None = None

# Dense screens use the 16 dp gap between groups so the whole screen fits one static frame.
TIGHT = {"N-01", "N-02", "N-03", "F5-01", "AI-01", "F8-01", "R-01", "PH-01", "F6-02 · F6-04", "F6-07", "AC-01"}


def phone(
    id_: str,
    name: str,
    note: str,
    body: str,
    *,
    tab: tuple[str, str] | None = None,
    foot: str = "",
    overlay: str = "",
    tight: bool = False,
    raw: bool = False,
) -> str:
    """One phone frame with its caption. `raw` skips the padded body (camera, chat)."""
    tight = tight or id_ in TIGHT
    inner = body if raw else f'<div class="body{" tight" if tight else ""}">{body}</div>'
    if CAPTURE is not None:
        CAPTURE.append({"id": id_, "name": name, "inner": inner, "foot": foot})
    return f"""
    <figure>
      <div class="phone" role="img" aria-label="{id_} {name}">
        {SB}
        {inner}
        {f'<div class="foot">{foot}</div>' if foot else ''}
        {bnav(*tab) if tab else ''}
        {NAV}
        {overlay}
      </div>
      <figcaption><b>{id_} · {name}</b><span>{note}</span></figcaption>
    </figure>"""


def appbar(title: str, *, left: str = "menu", right: list[str] | None = None, small: bool = False, left_label: str = "Open menu") -> str:
    rights = "".join(f'<button class="iconbtn{" end" if n == len(right or []) - 1 else ""}" aria-label="{r}">{i(r)}</button>' for n, r in enumerate(right or []))
    lb = f'<button class="iconbtn edge" aria-label="{left_label}">{i(left)}</button>' if left else ""
    return f'<div class="appbar">{lb}<span class="title{" sm" if small else ""}">{title}</span>{rights}</div>'


def dial(value: int, label: str, *, small: bool = False, kind: str = "") -> str:
    r = 15.9155
    return f"""<div class="dial{' sm' if small else ''}"><svg viewBox="0 0 36 36"><circle class="track" cx="18" cy="18" r="{r}" fill="none" stroke-width="3.2"/><circle class="fill {kind}" cx="18" cy="18" r="{r}" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="{value} 100"/></svg><div class="v"><b>{value}</b><span>{label}</span></div></div>"""


def bar(pct: int, kind: str = "") -> str:
    return f'<div class="bar {kind}"><i style="width:{pct}%"></i></div>'


def ph(label: str, h: int = 120, icon: str = "image") -> str:
    """Placeholder photo tile (no external images)."""
    return f'<div class="ph" style="height:{h}px;display:grid;place-items:center;color:var(--color-text-muted)">{i(icon)}<span class="lbl">{label}</span></div>'
