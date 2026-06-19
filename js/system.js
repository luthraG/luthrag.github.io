/* Homepage centerpiece: an interactive, hand-drawn architecture map. A request
   animates left to right through the stages; hover any stage for what it does and
   the numbers behind it. Reads theme colors from CSS, uses rough.js for the
   sketched look, falls back to a static scene under reduced-motion. */
(() => {
  "use strict";
  const svg = document.querySelector("[data-sysmap]");
  if (!svg || typeof rough === "undefined") return;
  const readout = document.querySelector("[data-sysmap-readout]");
  const NS = "http://www.w3.org/2000/svg";
  const css = getComputedStyle(document.documentElement);
  const C = {
    accent: css.getPropertyValue("--accent").trim() || "#3ddc97",
    amber: css.getPropertyValue("--amber").trim() || "#f0b429",
    text: css.getPropertyValue("--text").trim() || "#dbe6ee",
    muted: css.getPropertyValue("--muted").trim() || "#74838f",
    faint: css.getPropertyValue("--faint").trim() || "#4a5662",
    line: css.getPropertyValue("--line-bright").trim() || "#24323f",
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rc = rough.svg(svg);
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const label = (x, y, s, fill, size, weight) => {
    const t = mk("text", { x, y, "text-anchor": "middle", fill, "font-size": size, "font-family": "Spline Sans Mono, monospace", "font-weight": weight || 400 });
    t.textContent = s; svg.appendChild(t); return t;
  };
  const arrow = (x1, y1, x2, y2, color) => {
    svg.appendChild(rc.line(x1, y1, x2, y2, { stroke: color, strokeWidth: 1.3, roughness: 1.4 }));
    const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
    svg.appendChild(mk("polygon", { points: `${x2},${y2} ${x2 - s * Math.cos(a - 0.42)},${y2 - s * Math.sin(a - 0.42)} ${x2 - s * Math.cos(a + 0.42)},${y2 - s * Math.sin(a + 0.42)}`, fill: color }));
  };

  const NW = 150, NH = 72, TOP = 64, GAP = 40;
  const xs = [24, 24 + (NW + GAP), 24 + 2 * (NW + GAP), 24 + 3 * (NW + GAP), 24 + 4 * (NW + GAP)];
  const cy = TOP + NH / 2;
  const NODES = [
    { id: "client", x: xs[0], t1: "client", t2: "apps", color: C.muted, desc: "<b>Client apps</b> - the millions of users the platform serves. Every one of them is a request that has to come back fast." },
    { id: "edge", x: xs[1], t1: "edge", t2: "nginx", color: C.accent, desc: "<b>Edge (Nginx)</b> - request fingerprinting, behavioral rate limits and automated blocking stop abusive traffic before it ever reaches an app server." },
    { id: "svc", x: xs[2], t1: "services", t2: "microservices", color: C.accent, desc: "<b>Services</b> - a monolith decomposed into 10+ microservices: <b>30% faster</b> deploys and <b>40% lower</b> p95 latency." },
    { id: "cache", x: xs[3], t1: "cache", t2: "redis", color: C.amber, desc: "<b>Cache (Redis)</b> - hot paths served from memory, so the database never sees the easy questions." },
    { id: "store", x: xs[4], t1: "store", t2: "ES + Mongo", color: C.amber, desc: "<b>Store (Elasticsearch + MongoDB)</b> - retrieval and data-science ranking over <b>7M+</b> listings, feeding search and recommendations." },
  ];
  const OBS = { x: xs[1], y: 250, w: xs[3] + NW - xs[1], h: 60, desc: "<b>Observability</b> - self-training anomaly detection, continuous profiling, and a unified telemetry query language watching every stage above." };
  const canHover = matchMedia("(hover: hover)").matches;
  const DEFAULT = canHover
    ? "A request flows left to right, narrating each stage as it goes. <b>Hover</b> any stage to inspect it."
    : "A request flows left to right, narrating each stage as it goes.";

  // ---- static scene ----
  label(xs[0] + NW / 2, 36, "request  →", C.faint, 12);
  // connectors between main nodes
  for (let i = 0; i < NODES.length - 1; i++) arrow(NODES[i].x + NW, cy, NODES[i + 1].x - 6, cy, C.faint);
  // observability plane + dashed telemetry feeds
  svg.appendChild(rc.rectangle(OBS.x, OBS.y, OBS.w, OBS.h, { stroke: C.accent, strokeWidth: 1.4, roughness: 1.2, fill: C.accent, fillStyle: "hachure", fillWeight: 0.5, hachureGap: 8 }));
  label(OBS.x + OBS.w / 2, OBS.y + 26, "observability", C.text, 14, 600);
  label(OBS.x + OBS.w / 2, OBS.y + 46, "anomaly detection · continuous profiling · query language", C.muted, 11.5);
  [NODES[1], NODES[2], NODES[3]].forEach((n) => {
    const x = n.x + NW / 2;
    svg.appendChild(mk("line", { x1: x, y1: TOP + NH, x2: x, y2: OBS.y, stroke: C.faint, "stroke-width": 1, "stroke-dasharray": "2 6", opacity: 0.7 }));
  });
  label(OBS.x + OBS.w / 2, OBS.y - 8, "telemetry", C.faint, 10.5);

  // nodes (sketched fill + labels)
  NODES.forEach((n) => {
    svg.appendChild(rc.rectangle(n.x, TOP, NW, NH, {
      stroke: n.color, strokeWidth: 1.6, roughness: 1.25, fill: n.color,
      fillStyle: "hachure", fillWeight: 0.5, hachureGap: 7, hachureAngle: 41,
    }));
    label(n.x + NW / 2, cy - 4, n.t1, C.text, 15, 600);
    label(n.x + NW / 2, cy + 16, n.t2, C.muted, 11.5);
  });

  // ---- interactive overlays (hit area + highlight) ----
  const overlays = [];
  let hovered = null, lit = null, narrated = -1;
  const addOverlay = (id, x, y, w, h, desc, name) => {
    const r = mk("rect", {
      x, y, width: w, height: h, rx: 9, fill: "transparent", stroke: "transparent", "stroke-width": 0,
      style: "cursor:pointer", tabindex: "0", role: "img", "aria-label": name + ": " + desc.replace(/<[^>]+>/g, ""),
    });
    const enter = () => { hovered = id; readout.innerHTML = desc; paint(); };
    const leave = () => { hovered = null; narrated = -1; readout.innerHTML = DEFAULT; paint(); };
    r.addEventListener("mouseenter", enter);
    r.addEventListener("mouseleave", leave);
    r.addEventListener("focus", enter);
    r.addEventListener("blur", leave);
    svg.appendChild(r);
    overlays.push({ id, rect: r });
  };
  NODES.forEach((n) => addOverlay(n.id, n.x, TOP, NW, NH, n.desc, n.t1));
  addOverlay("obs", OBS.x, OBS.y, OBS.w, OBS.h, OBS.desc, "observability");
  function paint() {
    overlays.forEach((o) => {
      const on = o.id === hovered || (hovered === null && o.id === lit);
      o.rect.setAttribute("stroke", on ? C.accent : "transparent");
      o.rect.setAttribute("stroke-width", on ? "2" : "0");
    });
  }
  readout.innerHTML = DEFAULT;

  // ---- packet animation ----
  const halo = mk("circle", { r: 11, fill: C.accent, opacity: 0.18, "pointer-events": "none" });
  const dot = mk("circle", { r: 4.5, fill: C.accent, "pointer-events": "none" });
  svg.append(halo, dot);
  const pts = NODES.map((n) => n.x + NW / 2);
  const place = (x) => { halo.setAttribute("cx", x); halo.setAttribute("cy", cy); dot.setAttribute("cx", x); dot.setAttribute("cy", cy); };

  if (reduce) { place(pts[0]); halo.setAttribute("opacity", 0); dot.setAttribute("opacity", 0.5); return; }

  const ease = (t) => t * t * (3 - 2 * t);
  const narrate = (i) => { if (hovered !== null || i === narrated) return; narrated = i; readout.innerHTML = NODES[i].desc; };
  let stop = 0, phase = "dwell", dwell = 0.8, t = 0, last = 0;
  function frame(now) {
    if (!last) last = now;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (phase === "dwell") {
      lit = stop; narrate(stop); place(pts[stop]);
      if ((dwell -= dt) <= 0) { phase = "travel"; t = 0; }
    } else {
      const next = stop + 1;
      if (next >= pts.length) { stop = 0; phase = "dwell"; dwell = 0.8; place(pts[0]); }
      else {
        t += dt * 0.9;
        lit = t < 0.5 ? stop : next;
        place(pts[stop] + (pts[next] - pts[stop]) * ease(Math.min(t, 1)));
        if (t >= 1) { stop = next; phase = "dwell"; dwell = 0.8; }
      }
    }
    paint();
    raf = requestAnimationFrame(frame);
  }
  let raf = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
  });
})();
