/* Arcwell onboarding prototype (D53). Inlined into onboarding-prototype.html by build.py.
 *
 * Motion follows Apple's fluid-interface rules, translated for the web:
 *  - springs set by damping ratio + response (no fixed durations), so every animation is interruptible
 *    and starts from the current on-screen value with the current velocity;
 *  - drags track the finger 1:1, rubber-band past the ends, and hand their release velocity to the spring;
 *  - flicks are projected with Apple's deceleration formula before choosing where to snap;
 *  - taps highlight on press, commit on release, and cancel if the finger moves 10 px;
 *  - prefers-reduced-motion turns slides into cross-fades.
 */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let slow = 1;

  // ---------- Springs: damping ratio + response, like SwiftUI / UIKit ----------
  const live = new Set();
  let raf = 0;
  let last = 0;
  class Spring {
    constructor(x, opts = {}, eps = 0.001) {
      this.x = x; this.v = 0; this.t = x; this.eps = eps;
      this.onUpdate = null; this.onRest = null;
      this.config(opts);
    }
    config({ response = 0.4, damping = 1 } = {}) {
      this.k = (2 * Math.PI / response) ** 2; // stiffness
      this.c = (4 * Math.PI * damping) / response; // 2 * damping * sqrt(stiffness)
      return this;
    }
    to(target, opts = {}) {
      this.config(opts);
      if (opts.velocity !== undefined) this.v = opts.velocity;
      this.t = target;
      wake(this);
      return this;
    }
    /** Hold the value under the finger: stops the animation where it is now (the presentation value). */
    hold(x = this.x) {
      this.x = this.t = x; this.v = 0;
      live.delete(this);
      if (this.onUpdate) this.onUpdate(this.x);
    }
    step(dt) {
      const n = Math.max(1, Math.ceil(dt / 0.004));
      const h = dt / n;
      for (let k = 0; k < n; k++) {
        const a = -this.k * (this.x - this.t) - this.c * this.v;
        this.v += a * h;
        this.x += this.v * h;
      }
      const done = Math.abs(this.x - this.t) < this.eps && Math.abs(this.v) < this.eps * 20;
      if (done) { this.x = this.t; this.v = 0; }
      if (this.onUpdate) this.onUpdate(this.x);
      return done;
    }
  }
  function wake(s) {
    live.add(s);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) / slow;
    last = now;
    for (const s of [...live]) {
      if (s.step(dt)) { live.delete(s); if (s.onRest) s.onRest(); }
    }
    raf = live.size ? requestAnimationFrame(frame) : 0;
  }

  // Apple's momentum projection (Designing Fluid Interfaces): where a flick would come to rest.
  const project = (v, d = 0.998) => ((v / 1000) * d) / (1 - d);
  // Progressive resistance past a boundary.
  const rubber = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function tracker() {
    const pts = [];
    return {
      add(e) { const t = e.timeStamp || performance.now(); pts.push({ x: e.clientX, y: e.clientY, t }); while (pts.length > 2 && t - pts[0].t > 100) pts.shift(); },
      vel() {
        if (pts.length < 2) return { x: 0, y: 0 };
        const a = pts[0], b = pts[pts.length - 1];
        if (performance.now() - b.t > 80) return { x: 0, y: 0 }; // finger stopped before lifting
        const dt = Math.max(0.008, (b.t - a.t) / 1000);
        return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
      },
      reset() { pts.length = 0; },
    };
  }
  const haptic = (ms = 6) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) { /* not supported */ } };

  function init() {
    const phone = document.getElementById("proto");
    if (!phone) return;
    const stage = phone.querySelector(".stage");
    const all = [...stage.querySelectorAll(".pscreen")];
    const flows = {
      a: all.filter((s) => s.dataset.flow === "w" || s.dataset.flow === "a"),
      c: all.filter((s) => s.dataset.flow === "w" || s.dataset.flow === "c"),
    };
    let flow = flows.a;
    let index = 0;
    let token = 0;
    let gesture = false; // a drag owns the pointer, so taps are suppressed
    const toast = phone.querySelector(".ptoast");
    let toastTimer = 0;
    const say = (text) => {
      toast.textContent = text; toast.classList.add("show");
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
    };
    const slowBox = document.getElementById("slowmo");
    if (slowBox) slowBox.addEventListener("change", () => { slow = slowBox.checked ? 5 : 1; });

    // ---------- Screens: push from the right, old screen slides 30% and dims; the same path back ----------
    const nav = new Spring(0, { response: 0.42, damping: 1 }, 0.0005);
    function render(p) {
      all.forEach((s) => {
        const i = flow.indexOf(s);
        const o = i - p;
        if (i < 0 || o <= -1 || o >= 1) { s.hidden = true; return; }
        s.hidden = false;
        s.style.zIndex = String(i + 1);
        if (reduce.matches) {
          s.style.transform = "none"; s.style.opacity = String(1 - Math.abs(o)); s.style.setProperty("--dim", "0");
        } else {
          s.style.opacity = "";
          s.style.transform = `translate3d(${o > 0 ? o * 100 : o * 30}%,0,0)`;
          s.style.setProperty("--dim", o < 0 ? (-o * 0.1).toFixed(3) : "0");
        }
      });
    }
    nav.onUpdate = render;
    nav.onRest = () => {
      all.forEach((s) => { s.inert = s !== flow[index]; });
      enter(flow[index]);
    };
    function go(i, velocity) {
      const target = clamp(i, 0, flow.length - 1);
      if (target !== index) token++;
      index = target;
      nav.to(index, { response: 0.42, damping: 1, velocity });
    }
    render(0);
    all.forEach((s) => { s.inert = s !== flow[0]; });

    // Single-choice questions start empty, so Next waits for an answer (Skip, where offered, doesn't).
    function updateNext(s) {
      const btn = s && s.querySelector(".foot .btn.primary");
      if (!btn) return;
      const ok = [...s.querySelectorAll(".glist[data-single]")].every((l) => l.querySelector(".sel.on"));
      btn.setAttribute("aria-disabled", ok ? "false" : "true");
    }
    all.forEach((s) => {
      if (s.dataset.flow === "w") return;
      s.querySelectorAll(".glist[data-single] .sel").forEach((r) => { r.classList.remove("on"); r.setAttribute("aria-checked", "false"); });
      updateNext(s);
    });

    // ---------- Screen-specific moments ----------
    function enter(s) {
      const my = token;
      const id = s.dataset.id;
      if (id === "AO-18") {
        const rows = [...s.querySelectorAll(".build > div")];
        const tick = s.querySelector(".build .ck svg");
        const tpl = tick ? tick.cloneNode(true) : null;
        const bar = s.querySelector(".loadbar i");
        rows.forEach((r) => { r.className = ""; r.querySelector(".ck").innerHTML = ""; });
        if (bar) bar.style.width = "0%";
        rows.forEach((r, k) => setTimeout(() => {
          if (my !== token) return;
          r.className = "done";
          if (tpl) r.querySelector(".ck").appendChild(tpl.cloneNode(true));
          if (bar) bar.style.width = `${Math.round(((k + 1) / rows.length) * 100)}%`;
        }, (300 + k * 420) * slow));
        setTimeout(() => { if (my === token && flow[index] === s) go(index + 1); }, (300 + rows.length * 420 + 450) * slow);
      }
      if (id === "AO-19") {
        const ring = s.querySelector("[data-ring]");
        const num = s.querySelector("[data-count]");
        const goal = num ? +num.dataset.count : 0;
        const sp = new Spring(0, { response: 0.6, damping: 1 }, 0.0005);
        sp.onUpdate = (p) => {
          if (ring) ring.setAttribute("stroke-dasharray", `${(p * 100).toFixed(2)} 100`);
          if (num) num.textContent = Math.round(goal * p).toLocaleString("en-IN");
        };
        sp.hold(0);
        sp.to(1, { response: 0.6, damping: 1 });
      }
    }

    // ---------- Edge swipe back: 1:1, release velocity decides, velocity carried into the spring ----------
    let edge = null;
    stage.addEventListener("pointerdown", (e) => {
      const r = stage.getBoundingClientRect();
      if (e.clientX - r.left > 24 || index === 0 || sheetOpen()) return;
      edge = { x: e.clientX, start: nav.x, w: r.width, tr: tracker() };
      edge.tr.add(e);
      nav.hold();
      stage.setPointerCapture(e.pointerId);
      gesture = true;
    }, true);
    stage.addEventListener("pointermove", (e) => {
      if (!edge) return;
      edge.tr.add(e);
      const dx = e.clientX - edge.x;
      let p = edge.start - Math.max(0, dx) / edge.w;
      if (dx < 0) p = edge.start + rubber(-dx, edge.w) / edge.w; // resist dragging forward
      nav.hold(clamp(p, index - 1, index + 0.2));
    });
    const endEdge = () => {
      if (!edge) return;
      const v = edge.tr.vel().x / edge.w; // screens per second, positive = towards back
      const moved = edge.start - nav.x;
      const back = v > 0.35 || (moved > 0.5 && v > -0.35);
      edge = null;
      setTimeout(() => { gesture = false; }, 0);
      go(back ? index - 1 : index, -v);
    };
    stage.addEventListener("pointerup", endEdge);
    stage.addEventListener("pointercancel", endEdge);

    // ---------- Taps: highlight on press, commit on release, cancel after 10 px ----------
    const TAP = "[data-act], .glist .sel, .chip.tok, .scale5 span, .daydots span, .seg.ios span, .modes span";
    let press = null;
    phone.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(TAP);
      if (!el || gesture) return;
      press = { el, x: e.clientX, y: e.clientY };
      el.classList.add("pressed");
    });
    phone.addEventListener("pointermove", (e) => {
      if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { press.el.classList.remove("pressed"); press = null; }
    });
    phone.addEventListener("pointerup", () => {
      if (!press) return;
      const el = press.el;
      press = null;
      el.classList.remove("pressed");
      if (!gesture) activate(el);
    });
    phone.addEventListener("pointercancel", () => { if (press) press.el.classList.remove("pressed"); press = null; });

    function activate(el) {
      const act = el.dataset.act;
      if (act) return doAct(act, el);
      const screen = el.closest(".pscreen");
      if (el.matches(".sel")) {
        if (el.classList.contains("faded")) return say("Coming later");
        const list = el.closest(".glist");
        if (list.hasAttribute("data-single")) {
          list.querySelectorAll(".sel").forEach((r) => { r.classList.toggle("on", r === el); r.setAttribute("aria-checked", String(r === el)); });
        } else {
          el.classList.toggle("on"); el.setAttribute("aria-checked", String(el.classList.contains("on")));
        }
        haptic();
        return updateNext(screen);
      }
      if (el.matches(".chip.tok")) {
        const box = el.parentElement;
        const isNone = el.textContent.trim() === "None";
        const turningOn = !el.classList.contains("on");
        const max = +box.dataset.max || 0;
        if (turningOn && max && box.querySelectorAll(".chip.tok.on").length >= max) return say(`Pick up to ${max}`);
        el.classList.toggle("on");
        if (turningOn) box.querySelectorAll(".chip.tok").forEach((c) => { if (c !== el && (isNone || c.textContent.trim() === "None")) c.classList.remove("on"); });
        box.querySelectorAll(".chip.tok").forEach((c) => c.setAttribute("aria-checked", String(c.classList.contains("on"))));
        const picked = box.parentElement.querySelector("[data-picked]");
        if (picked && max) picked.textContent = `${box.querySelectorAll(".chip.tok.on").length} of ${max} picked`;
        return haptic();
      }
      if (el.matches(".scale5 span, .seg.ios span")) {
        if (el.classList.contains("faded")) return say("Pounds come later (D45)");
        el.parentElement.querySelectorAll("span").forEach((x) => x.classList.toggle("on", x === el));
        return haptic();
      }
      if (el.matches(".daydots span")) { el.classList.toggle("on"); return haptic(); }
      if (el.matches(".modes span")) {
        const k = [...el.parentElement.querySelectorAll("span")].indexOf(el);
        return heroTo(k);
      }
    }

    function doAct(act, el) {
      if (act === "next") {
        if (el.matches(".btn") && el.getAttribute("aria-disabled") === "true") return;
        if (index >= flow.length - 1) return finish();
        return go(index + 1);
      }
      if (act === "back") return go(index - 1);
      if (act === "role") return openSheet();
      if (act === "close-role") return closeSheet();
      if (act === "athlete" || act === "coach") {
        closeSheet();
        flow = act === "athlete" ? flows.a : flows.c;
        render(nav.x);
        return setTimeout(() => go(1), 120 * slow);
      }
      if (act === "signin") return say("Sign in isn't part of this prototype");
    }
    function finish() {
      say("End of the prototype. Starting again.");
      setTimeout(() => { flow = flows.a; index = 0; token++; nav.hold(0); all.forEach((s) => { s.inert = s !== flow[0]; }); }, 900 * slow);
    }

    // ---------- Role sheet: rises without bounce; drag down to dismiss; a flick settles with damping 0.8 ----------
    const scrim = phone.querySelector(".scrim");
    const sheet = phone.querySelector(".rsheet");
    const ss = new Spring(1, { response: 0.3, damping: 1 }, 0.0005);
    const sheetOpen = () => ss.t < 1 || ss.x < 0.999;
    ss.onUpdate = (y) => {
      if (reduce.matches) { sheet.style.transform = "none"; sheet.style.opacity = String(1 - y); }
      else { sheet.style.opacity = ""; sheet.style.transform = `translate3d(0,${(y * 100).toFixed(2)}%,0)`; }
      scrim.style.opacity = String(clamp(1 - y, 0, 1));
      const open = y < 0.999 || ss.t < 1;
      scrim.style.pointerEvents = open ? "auto" : "none";
      sheet.style.visibility = open ? "visible" : "hidden";
    };
    ss.hold(1);
    function openSheet() { ss.to(0, { response: 0.3, damping: 1, velocity: ss.v }); }
    function closeSheet() { ss.to(1, { response: 0.3, damping: 1, velocity: ss.v }); }
    let sd = null;
    sheet.addEventListener("pointerdown", (e) => {
      sd = { y: e.clientY, start: ss.x, h: sheet.offsetHeight, tr: tracker(), moved: false };
      sd.tr.add(e);
      ss.hold();
      sheet.setPointerCapture(e.pointerId);
    });
    sheet.addEventListener("pointermove", (e) => {
      if (!sd) return;
      sd.tr.add(e);
      const dy = e.clientY - sd.y;
      if (Math.abs(dy) > 10) { sd.moved = true; gesture = true; }
      let p = sd.start + dy / sd.h;
      if (p < 0) p = -rubber(-p * sd.h, sd.h) / sd.h;
      ss.hold(p);
    });
    const endSheet = () => {
      if (!sd) return;
      const v = sd.tr.vel().y; // px/s
      const proj = ss.x + project(v, 0.99) / sd.h;
      const flick = Math.abs(v) > 300;
      ss.to(proj > 0.5 ? 1 : 0, { response: 0.3, damping: flick ? 0.8 : 1, velocity: v / sd.h });
      sd = null;
      setTimeout(() => { gesture = false; }, 0);
    };
    sheet.addEventListener("pointerup", endSheet);
    sheet.addEventListener("pointercancel", endSheet);

    // ---------- Hero carousel: 1:1 swipe, switcher thumb tracks the finger, projected snap ----------
    let heroTo = () => {};
    const hero = phone.querySelector("[data-hero]");
    if (hero) {
      const pages = hero.querySelector(".pages");
      const pgs = [...pages.querySelectorAll(".pg")];
      const modes = [...hero.querySelectorAll(".modes span")];
      const thumb = hero.querySelector(".mthumb");
      const PW = pgs[0].offsetWidth || 184;
      const minX = -(pgs.length - 1) * PW;
      const hs = new Spring(0, { response: 0.4, damping: 1 }, 0.05);
      hs.onUpdate = (x) => {
        pages.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
        const f = -x / PW;
        thumb.style.transform = `translateX(${(f * 100).toFixed(2)}%)`;
        const r = clamp(Math.round(f), 0, pgs.length - 1);
        modes.forEach((m, k) => m.classList.toggle("on", k === r));
        pgs.forEach((g, k) => g.setAttribute("aria-hidden", String(k !== r)));
      };
      heroTo = (k) => { haptic(); hs.to(-clamp(k, 0, pgs.length - 1) * PW, { response: 0.4, damping: 1, velocity: hs.v }); };
      const scr = hero.querySelector(".scr");
      let hd = null;
      scr.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".modes")) return;
        hd = { x: e.clientX, y: e.clientY, start: hs.x, lock: null, tr: tracker() };
        hd.tr.add(e);
      });
      scr.addEventListener("pointermove", (e) => {
        if (!hd) return;
        hd.tr.add(e);
        const dx = e.clientX - hd.x, dy = e.clientY - hd.y;
        if (!hd.lock && Math.hypot(dx, dy) > 8) {
          hd.lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          if (hd.lock === "x") { scr.setPointerCapture(e.pointerId); hs.hold(); gesture = true; }
        }
        if (hd.lock !== "x") return;
        let x = hd.start + dx;
        if (x > 0) x = rubber(x, PW);
        if (x < minX) x = minX - rubber(minX - x, PW);
        hs.hold(x);
      });
      const endHero = () => {
        if (!hd) return;
        if (hd.lock === "x") {
          const v = hd.tr.vel().x;
          const k = clamp(Math.round(-(hs.x + project(v, 0.99)) / PW), 0, pgs.length - 1);
          hs.to(-k * PW, { response: 0.4, damping: Math.abs(v) > 300 ? 0.85 : 1, velocity: v });
          setTimeout(() => { gesture = false; }, 0);
        }
        hd = null;
      };
      scr.addEventListener("pointerup", endHero);
      scr.addEventListener("pointercancel", endHero);
    }

    // ---------- Wheel pickers: 1:1 drag, rubber-band, projected flick, snap, a tick per value ----------
    phone.querySelectorAll(".wheel").forEach((w) => {
      const min = +w.dataset.min, max = +w.dataset.max, step = +w.dataset.step, dec = +w.dataset.dec || 0;
      const n = Math.round((max - min) / step) + 1;
      const H = 44;
      const box = w.querySelector(".items");
      box.innerHTML = "";
      const els = [];
      for (let k = 0; k < n; k++) {
        const it = document.createElement("span");
        it.className = "it";
        it.textContent = (min + k * step).toFixed(dec);
        box.appendChild(it);
        els.push(it);
      }
      const dim = w.offsetHeight || 220;
      let shown = Math.round((+w.dataset.value - min) / step);
      const sp = new Spring(-shown * H, { response: 0.35, damping: 1 }, 0.05);
      const delta = w.closest(".pick") && w.closest(".pick").querySelector("[data-delta] span");
      const from = w.dataset.deltaFrom !== undefined ? +w.dataset.deltaFrom : null;
      sp.onUpdate = (off) => {
        const c = -off / H;
        const lo = Math.max(0, Math.floor(c) - 4), hi = Math.min(n - 1, Math.ceil(c) + 4);
        els.forEach((el, k) => {
          if (k < lo || k > hi) { if (el.style.display !== "none") el.style.display = "none"; return; }
          el.style.display = "";
          const d = k - c, ad = Math.min(Math.abs(d), 3.2);
          el.style.transform = `translateY(${(k * H + off).toFixed(2)}px) rotateX(${(-d * 20).toFixed(1)}deg) scale(${(1 - ad * 0.08).toFixed(3)})`;
          el.style.opacity = String(Math.max(0, 1 - ad * 0.36).toFixed(3));
        });
        const r = clamp(Math.round(c), 0, n - 1);
        if (r !== shown) {
          shown = r;
          haptic(4);
          const val = min + r * step;
          w.setAttribute("aria-valuenow", val.toFixed(dec));
          if (delta && from !== null) {
            const diff = +(val - from).toFixed(dec);
            delta.textContent = diff === 0 ? "Same as now" : diff < 0 ? `${Math.abs(diff).toFixed(1)} kg to go · about 0.4 kg a week` : `${diff.toFixed(1)} kg to gain · about 0.25 kg a week`;
          }
        }
      };
      sp.hold(sp.x);
      const snapTo = (k, velocity) => sp.to(-clamp(k, 0, n - 1) * H, { response: 0.35, damping: 1, velocity });
      let d = null;
      w.addEventListener("pointerdown", (e) => {
        d = { y: e.clientY, start: sp.x, tr: tracker() };
        d.tr.add(e);
        sp.hold();
        w.setPointerCapture(e.pointerId);
        gesture = true;
      });
      w.addEventListener("pointermove", (e) => {
        if (!d) return;
        d.tr.add(e);
        let off = d.start + (e.clientY - d.y);
        const top = 0, bottom = -(n - 1) * H;
        if (off > top) off = top + rubber(off - top, dim);
        if (off < bottom) off = bottom - rubber(bottom - off, dim);
        sp.hold(off);
      });
      const end = () => {
        if (!d) return;
        const v = d.tr.vel().y;
        snapTo(Math.round(-(sp.x + project(v)) / H), v);
        d = null;
        setTimeout(() => { gesture = false; }, 0);
      };
      w.addEventListener("pointerup", end);
      w.addEventListener("pointercancel", end);
      w.addEventListener("wheel", (e) => { e.preventDefault(); snapTo(Math.round(-sp.t / H) + Math.sign(e.deltaY), sp.v); }, { passive: false });
      w.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") { e.preventDefault(); snapTo(Math.round(-sp.t / H) - 1, sp.v); }
        if (e.key === "ArrowDown") { e.preventDefault(); snapTo(Math.round(-sp.t / H) + 1, sp.v); }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (sheetOpen()) closeSheet(); else go(index - 1);
    });
    window.__proto = { go: (i) => go(i), get index() { return index; }, get flow() { return flow.map((s) => s.dataset.id); }, get gesture() { return gesture; }, get sheet() { return ss.x; }, nav };
  }
  window.addEventListener("DOMContentLoaded", init);
})();
