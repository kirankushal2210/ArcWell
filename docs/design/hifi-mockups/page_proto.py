"""Interactive onboarding prototype (D53): one phone running Welcome → role sheet → athlete or coach flow.

Screens are captured from the same builders as the static boards, so the prototype never drifts from them.
Behaviour lives in proto.js (inlined), following Apple's fluid-interface rules.
"""
import _parts
import onb_athlete
import page_coach_onb
import welcome
from _parts import HERE, NAV, SB

ATHLETE = [f"AO-{k:02d}" for k in range(1, 22)]
COACH = [f"CO-{k:02d}" for k in range(2, 13)]


def _capture() -> dict:
    _parts.CAPTURE = []
    try:
        welcome.frames()
        onb_athlete.build_all()
        for fn in (page_coach_onb.start, page_coach_onb.practice, page_coach_onb.profile, page_coach_onb.setup):
            fn()
        caps = _parts.CAPTURE
    finally:
        _parts.CAPTURE = None
    by = {}
    for c in caps:
        by.setdefault(c["id"], c)  # first welcome frame = page 1 of the hero
    return by


def _screen(c: dict, flow: str) -> str:
    foot = f'<div class="foot">{c["foot"]}</div>' if c["foot"] else ""
    return f'<section class="pscreen" data-id="{c["id"]}" data-flow="{flow}" aria-label="{c["id"]} {c["name"]}">{c["inner"]}{foot}</section>'


SPEC = [
    ("Next and Back", "Push from the right; the old screen slides 30% left and dims. Back retraces the same path.", "damping 1.0 · response 0.42 s"),
    ("Swipe from the left edge", "Follows the finger 1:1. On release the velocity decides back or stay, and is handed to the spring, so there's no seam.", "same spring, initial velocity from the finger"),
    ("Wheel pickers", "Drag 1:1 with rubber-banding past the ends. A flick is projected with Apple's deceleration (0.998), then snaps to a value, with a light tick per value.", "damping 1.0 · response 0.35 s"),
    ("Welcome hero", "Swipe the phone or tap its switcher. The black thumb tracks the finger; a flick picks the page it's heading for.", "damping 1.0, or 0.85 after a flick"),
    ("Role sheet", "Rises without bounce. Drag down to dismiss; a flick dismisses even from a short drag. Scrim dims, never blurs.", "response 0.3 s · damping 1.0, or 0.8 after a flick"),
    ("Taps", "Highlight on press, commit on release, cancel if the finger moves 10 px. Buttons scale to 97% while pressed.", "120 ms (duration-micro)"),
    ("Calorie result", "Ring fills and the number counts up once. No confetti.", "damping 1.0 · response 0.6 s"),
    ("Reduced motion", "Slides become cross-fades; press scaling is off.", "prefers-reduced-motion"),
]


def build() -> tuple[str, str, str]:
    by = _capture()
    screens = _screen(by["F1-02"], "w") + "".join(_screen(by[k], "a") for k in ATHLETE) + "".join(_screen(by[k], "c") for k in COACH)
    rows = "".join(f"<tr><th>{a}</th><td>{b}</td><td>{c}</td></tr>" for a, b, c in SPEC)
    js = (HERE / "proto.js").read_text()
    body = f"""
  <section class="group">
    <div class="proto-wrap">
      <div class="phone proto" id="proto" aria-label="Interactive Arcwell onboarding prototype">
        {SB}
        <div class="stage">{screens}</div>
        {NAV}
        {welcome.role_sheet()}
        <div class="ptoast" role="status" aria-live="polite"></div>
      </div>
      <aside class="proto-notes">
        <h2 class="heading">Try it</h2>
        <ul class="notes">
          <li>Tap <b>Get Started</b>, pick a role, and answer each question. Next waits for an answer; Skip doesn't.</li>
          <li>Drag the <b>wheel pickers</b>, or flick them. Mouse wheel and arrow keys work too.</li>
          <li>Swipe the <b>phone in the welcome hero</b>, or tap Training · Meals · Recovery.</li>
          <li>Drag from the <b>left edge</b> of the phone to go back, or press Esc.</li>
        </ul>
        <label class="slowmo"><input type="checkbox" id="slowmo"> Slow motion (5×), to check the motion frame by frame</label>
        <h2 class="heading">Motion spec</h2>
        <table class="spec"><thead><tr><th>Interaction</th><th>Behaviour</th><th>Spring</th></tr></thead><tbody>{rows}</tbody></table>
        <p class="caption muted">Springs are set by damping ratio and response, as in Apple's Designing Fluid Interfaces, so any animation can be grabbed mid-flight and reversed from where it is. In the app these map to Reanimated springs and react-native-gesture-handler, with haptics from expo-haptics. Draft, not approved or user-tested; the prototype skips sign-up, consent and saving answers.</p>
      </aside>
    </div>
  </section>
  <script>
{js}
  </script>"""
    lead = "Welcome → Get Started → role sheet → athlete onboarding (AO-01 to AO-21) or coach onboarding (CO-02 to CO-12), clickable, with Apple-style fluid motion (D53)."
    return ("Onboarding prototype", lead, body)
