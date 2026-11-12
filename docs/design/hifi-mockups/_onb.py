"""Onboarding parts in Apple setup-flow style (D53), built on the D52 flow.

Centred glyph + large title, grouped inset lists with checkmarks, wheel pickers, segmented
controls, a full-width primary button with a plain-text secondary. Android conventions stay:
back arrow, system back gesture, Android status and navigation bars.
"""
from _parts import i

# Sections shown on the progress bar, with their pillar dot (dots only, D50).
SECTIONS = {
    "you": ("About you", ""),
    "goal": ("Your goal", ""),
    "training": ("Training", "t"),
    "recovery": ("Recovery", "r"),
    "nutrition": ("Nutrition", "nu"),
}
ORDER = list(SECTIONS)
_CUR: tuple[str, str, int, int] | None = None  # set by obar(), shown by the next qh()


def notes(*items: str) -> str:
    return '<ul class="notes">' + "".join(f"<li>{t}</li>" for t in items) + "</ul>"


def obar(section: str, k: int, n: int, order: list[str] | None = None, sections: dict | None = None) -> str:
    """Back arrow + one segment per section (the current one fills k/n). The section name moves to the header."""
    global _CUR
    order = order or ORDER
    sections = sections or SECTIONS
    cur = order.index(section)
    segs = "".join(
        f'<i><b style="width:{100 if s < cur else (round(100 * k / n) if s == cur else 0)}%"></b></i>' for s in range(len(order))
    )
    name, dot = sections[section]
    _CUR = (name, dot, k, n)
    return f'<div class="obar"><button class="iconbtn edge" aria-label="Back" data-act="back">{i("arrow-left")}</button><div class="segs" role="progressbar" aria-label="{name}, step {k} of {n}">{segs}</div><span></span></div>'


def qh(title: str, sub: str = "", glyph: str = "") -> str:
    """Centred header: glyph, section eyebrow (from obar), large title, one-line reason."""
    global _CUR
    g = f'<i class="glyph" data-lucide="{glyph}"></i>' if glyph else ""
    eb = ""
    if _CUR:
        name, dot, k, n = _CUR
        d = f'<span class="dot {dot}"></span>' if dot else ""
        eb = f'<span class="eyebrow">{d}{name} · {k} of {n}</span>'
        _CUR = None
    return f'<div class="qh">{g}{eb}<h2>{title}</h2>{f"<p>{sub}</p>" if sub else ""}</div>'


def sel(title: str, sub: str = "", on: bool = False, icon: str = "", tall: bool = False, multi: bool = False) -> str:
    cls = "sel" + (" on" if on else "") + (" tall" if tall else "") + (" multi" if multi else "") + (" has-ic" if icon else "")
    ic = (icon if icon.startswith("<svg") else i(icon)) if icon else ""
    return f'<div class="{cls}" role="{"checkbox" if multi else "radio"}" aria-checked="{"true" if on else "false"}">{ic}<div class="grow"><b>{title}</b>{f"<span>{sub}</span>" if sub else ""}</div><span class="ck">{i("check")}</span></div>'


def options(*rows: str, multi: bool = False) -> str:
    return f'<div class="glist" role="{"group" if multi else "radiogroup"}"{"" if multi else " data-single"}>' + "".join(rows) + "</div>"


def chip(label: str, on: bool = False) -> str:
    return f'<span class="chip tok{" on" if on else ""}" role="checkbox" aria-checked="{"true" if on else "false"}">{i("check")}{label}</span>'


def wheel(value: float, unit: str, *, step: float = 1, lo: float | None = None, hi: float | None = None, dec: int = 0,
          delta: str = "", toggle: str = "", delta_from: float | None = None, rows: int = 5, **_ignored) -> str:
    """Wheel picker: the value sits in the centre band, neighbours fade and tilt away.
    The static frame shows five rows; the prototype script rebuilds the full range and makes it draggable."""
    lo = value - 40 * step if lo is None else lo
    hi = value + 40 * step if hi is None else hi
    half = rows // 2
    out = []
    for k in range(-half, half + 1):
        v = value + k * step
        if lo <= v <= hi:
            d = abs(k)
            out.append(f'<span class="it" style="transform:translateY({k * 44}px) rotateX({-k * 20}deg) scale({1 - d * 0.08:.2f});opacity:{[1, .55, .25, .12][min(d, 3)]}">{v:.{dec}f}</span>')
    tg = f'<span class="seg ios" role="radiogroup">{toggle}</span>' if toggle else ""
    dl = f'<span class="delta" data-delta>{delta}</span>' if delta else ""
    df = f' data-delta-from="{delta_from}"' if delta_from is not None else ""
    return (f'<div class="pick">{tg}{dl}<div class="wheel" style="height:{rows * 44}px" role="slider" aria-label="{unit}" aria-valuenow="{value}" tabindex="0" '
            f'data-value="{value}" data-step="{step}" data-min="{lo}" data-max="{hi}" data-dec="{dec}"{df}>'
            f'<span class="band"></span><span class="items">{"".join(out)}</span><span class="unit">{unit}</span></div></div>')


TOP_SKIP = {"Skip for now", "No injuries, skip", "Skip, I'll do this later"}


def foot(label: str = "Next", skip: bool = False, skip_label: str = "Skip for now") -> str:
    """Primary button pinned at the same height on every screen. A plain "Skip" sits top-right
    (in the app bar's free slot) so it never pushes the button around; other secondary actions stay below it."""
    if not skip:
        return f'<button class="btn primary full" data-act="next">{label}</button>'
    if skip_label in TOP_SKIP:
        return f'<button class="btn primary full" data-act="next">{label}</button><a class="skip top" data-act="next">Skip</a>'
    return f'<button class="btn primary full" data-act="next">{label}</button><a class="skip" data-act="next">{skip_label}</a>'
