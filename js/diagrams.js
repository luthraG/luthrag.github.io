/* Article diagrams: hand-drawn concept SVGs (rough.js) + interactive widgets.
   Loaded only on article pages. Reads theme colors from CSS variables so the
   diagrams always match the site. */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const css = getComputedStyle(document.documentElement);
  const C = {
    accent: css.getPropertyValue("--accent").trim() || "#3ddc97",
    amber: css.getPropertyValue("--amber").trim() || "#f0b429",
    text: css.getPropertyValue("--text").trim() || "#dbe6ee",
    muted: css.getPropertyValue("--muted").trim() || "#74838f",
    faint: css.getPropertyValue("--faint").trim() || "#4a5662",
    line: css.getPropertyValue("--line-bright").trim() || "#24323f",
    panel: css.getPropertyValue("--panel").trim() || "#0c131c",
  };

  function mk(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function text(svg, x, y, str, { fill = C.text, size = 13, anchor = "middle", weight = 400, mono = true } = {}) {
    const t = mk("text", {
      x, y, "text-anchor": anchor, fill, "font-size": size, "font-weight": weight,
      "font-family": mono ? "Spline Sans Mono, monospace" : "Syne, sans-serif",
    });
    t.textContent = str;
    svg.appendChild(t);
    return t;
  }
  // crisp arrowhead (plain SVG, not sketched, for legibility)
  function arrow(svg, x1, y1, x2, y2, color) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const s = 7;
    const p = mk("polygon", {
      points: `${x2},${y2} ${x2 - s * Math.cos(ang - 0.42)},${y2 - s * Math.sin(ang - 0.42)} ${x2 - s * Math.cos(ang + 0.42)},${y2 - s * Math.sin(ang + 0.42)}`,
      fill: color,
    });
    svg.appendChild(p);
  }
  function svgRoot(host, w, h) {
    const svg = mk("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img" });
    host.appendChild(svg);
    return svg;
  }

  /* ============ Diagram A: the naive hot path ============ */
  function diagramHotPath(host) {
    const W = 680, H = 250;
    const svg = svgRoot(host, W, H);
    const rc = rough.svg(svg);

    // evaluator box
    svg.appendChild(rc.rectangle(34, 86, 168, 78, {
      stroke: C.accent, strokeWidth: 1.6, roughness: 1.4, fill: C.accent,
      fillStyle: "hachure", fillWeight: 0.7, hachureGap: 6, hachureAngle: 41,
    }));
    text(svg, 118, 120, "alert", { fill: C.text, size: 15 });
    text(svg, 118, 140, "evaluator", { fill: C.text, size: 15 });

    // TSDB box
    svg.appendChild(rc.rectangle(478, 72, 168, 106, {
      stroke: C.amber, strokeWidth: 1.6, roughness: 1.4, fill: C.amber,
      fillStyle: "cross-hatch", fillWeight: 0.6, hachureGap: 9, hachureAngle: 41,
    }));
    text(svg, 562, 118, "metrics", { fill: C.text, size: 15 });
    text(svg, 562, 138, "TSDB", { fill: C.text, size: 15 });

    // 4 fanned query arrows
    for (let i = 0; i < 4; i++) {
      const y1 = 104 + i * 14, y2 = 92 + i * 24;
      svg.appendChild(rc.line(206, y1, 470, y2, { stroke: C.faint, strokeWidth: 1.2, roughness: 1.8 }));
      arrow(svg, 206, y1, 472, y2, C.faint);
    }
    text(svg, 340, 58, "4+ history queries", { fill: C.amber, size: 13 });
    text(svg, 340, 222, "every single evaluation · uncached · recomputed each tick", { fill: C.muted, size: 12 });
    svg.appendChild(rc.line(120, 168, 120, 198, { stroke: C.faint, strokeWidth: 1, roughness: 2 }));
    text(svg, 120, 214, "CPU saturates at ~10 rules", { fill: C.faint, size: 11.5 });
  }

  /* ============ Diagram B: seasonal lookup grid ============ */
  function diagramSeasonal(host) {
    const W = 680, H = 300;
    const svg = svgRoot(host, W, H);
    const rc = rough.svg(svg);
    const cols = 12, rows = 7;
    const gx = 150, gy = 60, cw = 38, ch = 26;
    const gw = cols * cw, gh = rows * ch;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // grid lines (sketched)
    for (let r = 0; r <= rows; r++)
      svg.appendChild(rc.line(gx, gy + r * ch, gx + gw, gy + r * ch, { stroke: C.line, strokeWidth: 1, roughness: 1.3 }));
    for (let c = 0; c <= cols; c++)
      svg.appendChild(rc.line(gx + c * cw, gy, gx + c * cw, gy + gh, { stroke: C.line, strokeWidth: 1, roughness: 1.3 }));

    // a scatter of "warm" cells (crosshatch) to suggest learned profile
    const warm = [[0,2],[1,3],[2,4],[3,6],[4,7],[5,8],[6,5],[1,9],[3,2],[5,10],[2,7],[4,3]];
    warm.forEach(([r, c]) =>
      svg.appendChild(rc.rectangle(gx + c * cw + 2, gy + r * ch + 2, cw - 4, ch - 4, {
        stroke: "none", fill: C.muted, fillStyle: "hachure", fillWeight: 0.5, hachureGap: 4, hachureAngle: 50, roughness: 1.2,
      })));

    // highlighted target cell (Wed, slot ~ col 7)
    const hr = 2, hc = 7;
    svg.appendChild(rc.rectangle(gx + hc * cw + 1, gy + hr * ch + 1, cw - 2, ch - 2, {
      stroke: C.accent, strokeWidth: 1.8, fill: C.accent, fillStyle: "solid", roughness: 1.1,
    }));

    // day labels
    days.forEach((d, r) => text(svg, gx - 12, gy + r * ch + 17, d, { fill: C.muted, size: 11, anchor: "end" }));
    text(svg, gx + gw / 2, gy - 16, "time of day  →  288 five-minute slots", { fill: C.muted, size: 12 });
    text(svg, gx + gw / 2, gy - 34, "7 days × 288 slots = 2,016 buckets", { fill: C.faint, size: 11 });

    // timestamp tag + arrow into the target cell
    svg.appendChild(rc.rectangle(150, 250, 168, 32, { stroke: C.amber, strokeWidth: 1.4, roughness: 1.3 }));
    text(svg, 234, 270, "ts = Wed 14:32", { fill: C.amber, size: 12.5 });
    const tx = gx + hc * cw + cw / 2, ty = gy + hr * ch + ch;
    svg.appendChild(rc.line(234, 250, tx, ty + 6, { stroke: C.faint, strokeWidth: 1.2, roughness: 1.6 }));
    arrow(svg, 234, 250, tx, ty + 4, C.faint);
    // callout on the highlighted bucket
    text(svg, gx + hc * cw + cw / 2, gy + hr * ch - 8, "median + MAD", { fill: C.accent, size: 11 });
  }

  /* ============ Interactive widget: the anomaly band ============ */
  function widgetAnomalyBand(root) {
    const svgHost = root.querySelector("[data-band-svg]");
    const kInput = root.querySelector("[data-k]");
    const kOut = root.querySelector("[data-k-val]");
    const spikeBtn = root.querySelector("[data-spike]");
    const readout = root.querySelector("[data-readout]");
    const W = 680, H = 280, P = { t: 20, r: 16, b: 28, l: 38 };
    const iw = W - P.l - P.r, ih = H - P.t - P.b;
    const N = 120;

    // seasonal baseline (median per slot) + spread (MAD per slot)
    const base = [], mad = [];
    for (let i = 0; i < N; i++) {
      const hr = (i / N) * 24;
      base.push(60 + 30 * Math.sin((hr / 24) * 2 * Math.PI - 1.7));
      mad.push(5.5 + 2.5 * (0.5 + 0.5 * Math.sin((hr / 24) * 2 * Math.PI)));
    }
    // observations: baseline + stable noise (seeded so band changes don't reshuffle)
    let seed = 1337;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const obs = base.map((b, i) => b + (rnd() - 0.5) * mad[i] * 3.1);
    const spikes = []; // {i, v}

    const yMin = 10, yMax = 110;
    const x = (i) => P.l + (i / (N - 1)) * iw;
    const y = (v) => P.t + ih - ((v - yMin) / (yMax - yMin)) * ih;

    function render() {
      const k = parseFloat(kInput.value);
      kOut.textContent = k.toFixed(1);
      svgHost.innerHTML = "";
      const svg = svgHost;

      // gridlines
      for (let g = 0; g <= 4; g++) {
        const gy = P.t + (ih / 4) * g;
        svg.appendChild(mk("line", { x1: P.l, x2: W - P.r, y1: gy, y2: gy, stroke: C.line, "stroke-width": 1, "stroke-dasharray": g === 4 ? "none" : "3 5" }));
      }
      for (let h = 0; h <= 24; h += 6) {
        const xx = P.l + (h / 24) * iw;
        text(svg, xx, H - 8, `${String(h).padStart(2, "0")}:00`, { fill: C.faint, size: 10 });
      }

      // band area = median ± k·MAD
      let up = "", lo = "";
      for (let i = 0; i < N; i++) { up += `${i ? "L" : "M"}${x(i).toFixed(1)},${y(base[i] + k * mad[i]).toFixed(1)}`; }
      for (let i = N - 1; i >= 0; i--) { lo += `L${x(i).toFixed(1)},${y(base[i] - k * mad[i]).toFixed(1)}`; }
      svg.appendChild(mk("path", { d: up + lo + "Z", fill: C.accent, "fill-opacity": 0.12 }));

      // baseline (median) line
      let bl = "";
      for (let i = 0; i < N; i++) bl += `${i ? "L" : "M"}${x(i).toFixed(1)},${y(base[i]).toFixed(1)}`;
      svg.appendChild(mk("path", { d: bl, fill: "none", stroke: C.accent, "stroke-width": 1.6, "stroke-dasharray": "5 4", "stroke-opacity": 0.8 }));

      // observation points; outside band => anomaly
      let anomalies = 0;
      const all = obs.map((v, i) => ({ i, v }));
      spikes.forEach((s) => { all[s.i] = { i: s.i, v: s.v }; });
      for (const pt of all) {
        const dev = Math.abs(pt.v - base[pt.i]);
        const bad = dev > k * mad[pt.i];
        if (bad) anomalies++;
        svg.appendChild(mk("circle", {
          cx: x(pt.i), cy: y(pt.v), r: bad ? 3.4 : 2,
          fill: bad ? C.amber : C.muted, "fill-opacity": bad ? 1 : 0.55,
        }));
      }
      readout.innerHTML = `band = median ± <b>${k.toFixed(1)}</b>·MAD &nbsp;·&nbsp; flagged: <b>${anomalies}</b> / ${N}`;
    }

    kInput.addEventListener("input", render);
    spikeBtn.addEventListener("click", () => {
      const i = 8 + Math.floor(Math.random() * (N - 16));
      const dir = Math.random() > 0.5 ? 1 : -1;
      spikes.push({ i, v: base[i] + dir * (mad[i] * (5 + Math.random() * 5)) });
      render();
    });
    render();
  }

  /* ============ Diagram: sampling, not instrumenting ============ */
  function diagramSampling(host) {
    const W = 680, H = 230;
    const svg = svgRoot(host, W, H);
    const rc = rough.svg(svg);
    const axisY = 176, x0 = 48, x1 = 632;

    svg.appendChild(rc.line(x0, axisY, x1, axisY, { stroke: C.faint, strokeWidth: 1.5, roughness: 1.4 }));
    arrow(svg, x0, axisY, x1, axisY, C.faint);
    text(svg, x1, axisY + 18, "time", { fill: C.muted, size: 11, anchor: "end" });

    // sample ticks, each with a captured stack of varying depth; the bottom
    // frame is shared (always on CPU) -> drawn in accent to foreshadow the widest flame
    const depths = [3, 2, 4, 3, 2, 4, 3, 2, 3];
    const n = depths.length, gap = (x1 - x0 - 40) / (n - 1);
    const cw = 30, ch = 13;
    for (let i = 0; i < n; i++) {
      const cx = x0 + 22 + i * gap;
      svg.appendChild(rc.line(cx, axisY - 4, cx, axisY + 4, { stroke: C.faint, strokeWidth: 1, roughness: 1 }));
      for (let d = 0; d < depths[i]; d++) {
        const y = axisY - 12 - d * (ch + 2);
        const shared = d === 0;
        svg.appendChild(rc.rectangle(cx - cw / 2, y - ch, cw, ch, {
          stroke: shared ? C.accent : C.line, strokeWidth: shared ? 1.4 : 1,
          fill: shared ? C.accent : C.muted, fillStyle: "hachure",
          fillWeight: 0.5, hachureGap: 4, roughness: 1.1,
        }));
      }
    }
    text(svg, W / 2, 26, "100 samples / sec   ·   ~1% overhead", { fill: C.amber, size: 13 });
    text(svg, x0 + 22, axisY + 18, "each tick = one captured call stack", { fill: C.faint, size: 11, anchor: "start" });
  }

  /* ============ Diagram: many runtimes, one model ============ */
  function diagramRuntimes(host) {
    const W = 680, H = 300;
    const svg = svgRoot(host, W, H);
    const rc = rough.svg(svg);
    const runtimes = ["Go pprof", "Java JFR", "Python", "Node", "Ruby", ".NET", "PHP", "native"];
    const lx = 96, top = 44, rowH = 28;

    runtimes.forEach((r, i) => {
      const y = top + i * rowH;
      text(svg, lx, y + 4, r, { fill: C.muted, size: 12, anchor: "end" });
      svg.appendChild(rc.line(lx + 10, y, 250, 150, { stroke: C.line, strokeWidth: 0.8, roughness: 1.4 }));
    });

    // dispatcher
    svg.appendChild(rc.rectangle(250, 124, 150, 54, {
      stroke: C.accent, strokeWidth: 1.6, roughness: 1.3, fill: C.accent,
      fillStyle: "hachure", fillWeight: 0.6, hachureGap: 7,
    }));
    text(svg, 325, 147, "parser", { fill: C.text, size: 13 });
    text(svg, 325, 165, "dispatcher", { fill: C.text, size: 13 });

    // unified model
    svg.appendChild(rc.line(400, 151, 446, 151, { stroke: C.faint, strokeWidth: 1.4, roughness: 1.4 }));
    arrow(svg, 400, 151, 448, 151, C.faint);
    svg.appendChild(rc.rectangle(450, 126, 132, 50, {
      stroke: C.amber, strokeWidth: 1.6, roughness: 1.3,
    }));
    text(svg, 516, 147, "unified", { fill: C.amber, size: 12.5 });
    text(svg, 516, 164, "profile model", { fill: C.amber, size: 12.5 });

    // downstream consumers
    const outs = ["store", "query", "flamegraph"];
    outs.forEach((o, i) => {
      const y = 96 + i * 40;
      svg.appendChild(rc.line(582, 151, 606, y + 12, { stroke: C.line, strokeWidth: 0.8, roughness: 1.4 }));
      text(svg, 612, y + 16, o, { fill: C.muted, size: 11.5, anchor: "start" });
    });
    text(svg, 96, top - 22, "every runtime", { fill: C.faint, size: 11, anchor: "end" });
    text(svg, 325, 200, "new runtime = new parser, not a rewrite", { fill: C.faint, size: 11 });
  }

  /* ============ Interactive widget: flame graph ============ */
  function widgetFlamegraph(root) {
    const svg = root.querySelector("[data-fg-svg]");
    const readout = root.querySelector("[data-fg-readout]");
    const resetBtn = root.querySelector("[data-fg-reset]");
    const W = 680, rowH = 30, pad = 6, H = 220;

    // a sampled CPU profile of a request handler (value = samples in subtree)
    const tree = {
      name: "http.Serve", value: 1000, children: [
        { name: "router.Match", value: 60 },
        { name: "Handler.ServeHTTP", value: 910, children: [
          { name: "db.Query", value: 520, children: [
            { name: "conn.Read", value: 300 },
            { name: "rows.Scan", value: 180, children: [
              { name: "reflect.Set", value: 130 },
            ] },
          ] },
          { name: "json.Marshal", value: 250, children: [
            { name: "reflect.Walk", value: 210 },
          ] },
          { name: "tmpl.Render", value: 110, children: [
            { name: "html.Escape", value: 64 },
          ] },
        ] },
        { name: "mw.Log", value: 30 },
      ],
    };
    const TOTAL = tree.value;
    const palette = ["#3ddc97", "#36c6b0", "#2ea8c9", "#5b8def", "#f0b429", "#e8895a", "#9b8bd6", "#4db6a0"];
    const colorOf = (name) => {
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
      return palette[h % palette.length];
    };
    let focus = tree;

    function maxDepth(node, d = 0) {
      if (!node.children || !node.children.length) return d;
      return Math.max(...node.children.map((c) => maxDepth(c, d + 1)));
    }

    function render() {
      svg.innerHTML = "";
      const depthN = maxDepth(focus) + 1;
      const innerW = W - pad * 2;
      const scale = innerW / focus.value;
      const totalH = pad * 2 + depthN * rowH + 2;
      svg.setAttribute("viewBox", `0 0 ${W} ${totalH}`);
      svg.setAttribute("height", totalH);

      const drawNode = (node, depth, x) => {
        const w = node.value * scale;
        const y = pad + depth * rowH;
        const g = mk("g", { style: "cursor:pointer" });
        const fill = colorOf(node.name);
        const rect = mk("rect", {
          x: x + 0.5, y: y, width: Math.max(w - 1, 1), height: rowH - 3, rx: 3,
          fill, "fill-opacity": node === focus ? 1 : 0.82,
        });
        g.appendChild(rect);
        if (w > 34) {
          const chars = Math.floor((w - 10) / 6.6);
          const label = node.name.length > chars ? node.name.slice(0, Math.max(chars - 1, 1)) + "…" : node.name;
          const t = mk("text", {
            x: x + 7, y: y + (rowH - 3) / 2 + 4, fill: "#07121a",
            "font-size": 11, "font-family": "Spline Sans Mono, monospace", "pointer-events": "none",
          });
          t.textContent = label;
          g.appendChild(t);
        }
        const pct = ((node.value / TOTAL) * 100).toFixed(1);
        g.addEventListener("mouseenter", () => {
          rect.setAttribute("stroke", "#e7f4ee");
          rect.setAttribute("stroke-width", "1.5");
          readout.innerHTML = `<b>${node.name}</b> · ${node.value} samples · ${pct}% of CPU`;
        });
        g.addEventListener("mouseleave", () => {
          rect.removeAttribute("stroke");
          readout.textContent = "hover a frame · click to zoom";
        });
        g.addEventListener("click", () => { focus = node; render(); });
        svg.appendChild(g);

        let cx = x;
        (node.children || []).forEach((c) => { drawNode(c, depth + 1, cx); cx += c.value * scale; });
      };

      drawNode(focus, 0, pad);
      resetBtn.style.visibility = focus === tree ? "hidden" : "visible";
    }

    resetBtn.addEventListener("click", () => { focus = tree; render(); });
    render();
  }

  /* ---------- dispatch ---------- */
  function init() {
    if (typeof rough === "undefined") return;
    document.querySelectorAll("[data-diagram]").forEach((host) => {
      const kind = host.getAttribute("data-diagram");
      if (kind === "hot-path") diagramHotPath(host);
      else if (kind === "seasonal") diagramSeasonal(host);
      else if (kind === "sampling") diagramSampling(host);
      else if (kind === "runtimes") diagramRuntimes(host);
    });
    document.querySelectorAll("[data-widget='anomaly-band']").forEach(widgetAnomalyBand);
    document.querySelectorAll("[data-widget='flamegraph']").forEach(widgetFlamegraph);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
