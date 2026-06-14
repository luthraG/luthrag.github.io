/* Hero name: typewriter reveal on a visitor's first load (remembered), then
   cursor-reactive letters (lean away + phosphor glow) on every visit after.
   Homepage only. Reduced-motion -> static; touch -> typewriter once, no cursor. */
(() => {
  "use strict";
  const el = document.querySelector(".hero-name");
  if (!el) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const L1 = el.dataset.l1 || el.textContent.trim();
  const L2 = el.dataset.l2 || "";
  el.setAttribute("aria-label", (L1 + " " + L2).trim());

  const KEY = "hero-typed-at";
  const REPLAY_AFTER = 30 * 24 * 60 * 60 * 1000; // re-welcome after 30 days
  let typedRecently = false;
  try {
    const last = parseInt(localStorage.getItem(KEY) || "0", 10);
    typedRecently = last > 0 && Date.now() - last < REPLAY_AFTER;
  } catch (e) { typedRecently = false; }
  const markTyped = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };

  function letterSpan(ch) {
    const s = document.createElement("span");
    s.className = "ltr";
    s.textContent = ch;
    return s;
  }
  function buildStatic() {
    el.textContent = "";
    const letters = [];
    [...L1].forEach((c) => { const s = letterSpan(c); el.appendChild(s); letters.push(s); });
    if (L2) { el.appendChild(document.createElement("br")); [...L2].forEach((c) => { const s = letterSpan(c); el.appendChild(s); letters.push(s); }); }
    return letters;
  }

  /* ----- cursor-reactive letters (spring physics, matches the grid) ----- */
  function enableCursor(letters) {
    if (reduce || !fine) return;
    const st = letters.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, g: 0 }));
    let centers = [];
    const measure = () => {
      centers = letters.map((l) => { const r = l.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; });
    };
    const mouse = { x: -9999, y: -9999, t: 0 };
    const R = 130, STR = 12, R2 = 2 * R * R;
    let raf = null;
    function frame() {
      let motion = 0;
      for (let i = 0; i < letters.length; i++) {
        const c = centers[i], s = st[i];
        const dx = c.cx - mouse.x, dy = c.cy - mouse.y, d2 = dx * dx + dy * dy;
        const f = Math.exp(-d2 / R2);
        const d = Math.sqrt(d2) || 1;
        s.vx += ((dx / d) * f * STR - s.x) * 0.12; s.vx *= 0.78; s.x += s.vx;
        s.vy += ((dy / d) * f * STR - s.y) * 0.12; s.vy *= 0.78; s.y += s.vy;
        s.g += (f - s.g) * 0.12;
        letters[i].style.transform = `translate(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px)`;
        letters[i].style.textShadow = s.g > 0.02 ? `0 0 ${(s.g * 16).toFixed(1)}px rgba(61,220,151,${(s.g * 0.7).toFixed(2)})` : "none";
        motion += Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(f - s.g);
      }
      if (performance.now() - mouse.t < 1500 || motion > 0.4) raf = requestAnimationFrame(frame);
      else raf = null;
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    measure();
    addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = performance.now(); kick(); }, { passive: true });
    addEventListener("resize", () => { measure(); kick(); }, { passive: true });
    addEventListener("scroll", measure, { passive: true });
  }

  /* ----- typewriter, then hand off to cursor ----- */
  function typeThenCursor() {
    el.textContent = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(caret);
    const seq = [...L1, "\n", ...L2];
    const letters = [];
    let i = 0;
    const id = setInterval(() => {
      const ch = seq[i];
      if (ch === "\n") el.insertBefore(document.createElement("br"), caret);
      else { const s = letterSpan(ch); el.insertBefore(s, caret); letters.push(s); }
      if (++i >= seq.length) {
        clearInterval(id);
        setTimeout(() => { caret.remove(); enableCursor(letters); }, 650);
      }
    }, 90);
  }

  if (reduce) { buildStatic(); return; }            // no motion at all
  if (typedRecently) { enableCursor(buildStatic()); } // seen it within 30 days: straight to cursor
  else { typeThenCursor(); markTyped(); }             // first visit (or 30+ days later): type, then cursor
})();
