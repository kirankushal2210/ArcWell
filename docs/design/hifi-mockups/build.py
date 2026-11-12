"""Regenerate the Arcwell hi-fi mockup pages: `python3 build.py` in this folder."""
import page_coach
import page_coach_onb
import page_core
import page_onboarding
import page_plus
import page_proto
from _parts import HERE, page

for file, module, cls in [
    ("index.html", page_core, ""),
    ("athlete-plus-coached.html", page_plus, ""),
    ("coach-and-system.html", page_coach, ""),
    ("onboarding-flow.html", page_onboarding, "xl"),
    ("coach-onboarding.html", page_coach_onb, "xl"),
    ("onboarding-prototype.html", page_proto, "proto"),
]:
    title, lead, body = module.build()
    (HERE / file).write_text(page(file, title, lead, body, cls))
    print("wrote", file)
