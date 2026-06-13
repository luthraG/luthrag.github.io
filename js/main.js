/* Gaurav Luthra - portfolio interactions & telemetry charts (no dependencies) */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  document.getElementById("yr").textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  const burger = $(".nav-burger");
  const navLinks = $(".nav-links");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- scroll-spy nav ---------- */
  const spyLinks = $$('.nav-links a[href^="#"]').filter((a) => a.hash.length > 1);
  const spyTargets = spyLinks
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        spyLinks.forEach((a) =>
          a.classList.toggle("active", a.hash === "#" + e.target.id)
        );
      }
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  spyTargets.forEach((t) => spy.observe(t));
  addEventListener("scroll", () => {
    if (scrollY < 200) spyLinks.forEach((a) => a.classList.remove("active"));
  }, { passive: true });

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min((i % 6) * 60, 300)}ms`;
    io.observe(el);
  });

  /* ---------- count-up numbers ---------- */
  function countUp(el, target, suffix = "", dur = 1200) {
    const t0 = performance.now();
    const fmt = (n) =>
      n >= 1000 ? n.toLocaleString("en-US") : String(n);
    function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const cio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        countUp(el, +el.dataset.count, el.dataset.suffix || (el.dataset.plus ? "+" : ""));
        cio.unobserve(el);
      }
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ---------- hero terminal typing ---------- */
  const termLines = [
    ['t-cmd', '$ whoami --verbose'],
    ['', ''],
    ['t-key', 'founder   ', 't-str', '"Yuvanya Systems"'],
    ['t-key', 'role      ', 't-str', '"Distinguished Engineer"'],
    ['t-key', 'oss       ', 't-str', '"CubeAPM - anomaly detection, profiler, CQL"'],
    ['t-key', 'stack     ', 't-str', '[py, go, node, k8s, es, llm]'],
    ['t-key', 'uptime    ', 't-str', '15y+'],
  ];
  const termEl = document.getElementById("term-code");
  if (termEl && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let li = 0, ci = 0, html = "";
    function lineText(parts) {
      let out = "";
      for (let i = 0; i < parts.length; i += 2) out += parts[i + 1];
      return out;
    }
    function renderLine(parts, upTo) {
      let out = "", used = 0;
      for (let i = 0; i < parts.length; i += 2) {
        const cls = parts[i], txt = parts[i + 1];
        if (used >= upTo) break;
        const take = txt.slice(0, upTo - used);
        out += cls ? `<span class="${cls}">${take}</span>` : take;
        used += take.length;
      }
      return out;
    }
    function type() {
      if (li >= termLines.length) return;
      const parts = termLines[li];
      const full = lineText(parts);
      ci++;
      termEl.innerHTML = html + renderLine(parts, ci);
      if (ci >= full.length) {
        html += renderLine(parts, full.length) + "\n";
        li++; ci = 0;
        setTimeout(type, full ? 160 : 60);
      } else {
        setTimeout(type, 14 + Math.random() * 26);
      }
    }
    setTimeout(type, 600);
  } else if (termEl) {
    termEl.innerHTML = termLines
      .map((p) => {
        let out = "";
        for (let i = 0; i < p.length; i += 2)
          out += p[i] ? `<span class="${p[i]}">${p[i + 1]}</span>` : p[i + 1];
        return out;
      })
      .join("\n");
  }

  /* ================= GitHub telemetry ================= */
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  const compact = (n) =>
    n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
    : String(n);

  fetch("data/stats.json")
    .then((r) => r.json())
    .then(renderStats)
    .catch(() => {
      $("#stats-stamp").textContent = "// stats temporarily unavailable";
    });

  function renderStats(s) {
    /* stat tiles */
    const tiles = [
      ["st-contrib", s.totals12mo.contributions],
      ["st-commits", s.totals12mo.commits],
      ["st-prs", s.prTotals.count],
      ["st-lines", s.prTotals.additions + s.prTotals.deletions],
      ["st-reviews", s.totals12mo.reviews],
      ["st-stars", s.stars],
    ];
    for (const [id, val] of tiles) {
      const el = document.getElementById(id);
      const tio = new IntersectionObserver((es) => {
        if (es[0].isIntersecting) {
          if (val >= 100000) el.textContent = compact(val);
          else countUp(el, val);
          tio.disconnect();
        }
      }, { threshold: 0.5 });
      tio.observe(el);
    }

    renderMonthlyChart(s.monthly);
    renderHeatmap(s.calendar);
    renderLangs(s.languages);

    $("#stats-stamp").textContent =
      `// last updated ${s.generated.slice(0, 10)} · github.com/${s.login}`;
  }

  /* ---------- monthly commits + PRs chart ---------- */
  function renderMonthlyChart(monthly) {
    const host = document.getElementById("chart-monthly");

    function draw() {
      host.innerHTML = "";
      const W = Math.max(host.clientWidth, 320);
      const isSmall = W < 560;
      const data = isSmall ? monthly.slice(-36) : monthly; // 3yr view on small screens
      const H = isSmall ? 240 : 300;
      const P = { t: 16, r: 8, b: 26, l: 36 };
      const iw = W - P.l - P.r, ih = H - P.t - P.b;
      const maxV = Math.max(...data.map((d) => Math.max(d.commits, d.prs)), 10);
      const x = (i) => P.l + (i / (data.length - 1)) * iw;
      const y = (v) => P.t + ih - (v / maxV) * ih;

      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H });

      const defs = svgEl("defs", {});
      defs.innerHTML =
        `<linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0" stop-color="#3ddc97" stop-opacity="0.34"/>
           <stop offset="1" stop-color="#3ddc97" stop-opacity="0"/>
         </linearGradient>
         <filter id="glow"><feGaussianBlur stdDeviation="2.4" result="b"/>
           <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
      svg.appendChild(defs);

      /* gridlines + y labels */
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const v = Math.round((maxV / steps) * i);
        const gy = y(v);
        svg.appendChild(svgEl("line", {
          x1: P.l, x2: W - P.r, y1: gy, y2: gy,
          stroke: "#18222e", "stroke-width": 1,
          "stroke-dasharray": i === 0 ? "none" : "3 5",
        }));
        const t = svgEl("text", {
          x: P.l - 8, y: gy + 4, "text-anchor": "end",
          fill: "#4a5662", "font-size": 10, "font-family": "Spline Sans Mono, monospace",
        });
        t.textContent = compact(v);
        svg.appendChild(t);
      }

      /* x labels: january of each year */
      for (let i = 0; i < data.length; i++) {
        const [yy, mm] = data[i].month.split("-");
        if (mm === "01" || (isSmall && (mm === "01" || mm === "07"))) {
          const t = svgEl("text", {
            x: x(i), y: H - 8, "text-anchor": "middle",
            fill: "#4a5662", "font-size": 10, "font-family": "Spline Sans Mono, monospace",
          });
          t.textContent = mm === "01" ? `'${yy.slice(2)}` : "·";
          svg.appendChild(t);
          svg.appendChild(svgEl("line", {
            x1: x(i), x2: x(i), y1: P.t, y2: P.t + ih,
            stroke: "#18222e", "stroke-width": 1, "stroke-dasharray": "2 6",
          }));
        }
      }

      const path = (key) =>
        data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join("");

      /* commits: area + glow line */
      svg.appendChild(svgEl("path", {
        d: path("commits") + `L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`,
        fill: "url(#gc)",
      }));
      svg.appendChild(svgEl("path", {
        d: path("commits"), fill: "none", stroke: "#3ddc97",
        "stroke-width": 2, "stroke-linejoin": "round", filter: "url(#glow)",
      }));
      /* PRs: amber line */
      svg.appendChild(svgEl("path", {
        d: path("prs"), fill: "none", stroke: "#f0b429",
        "stroke-width": 1.6, "stroke-linejoin": "round", "stroke-dasharray": "1 0",
        opacity: 0.95,
      }));

      /* hover crosshair + tooltip */
      const cross = svgEl("line", {
        y1: P.t, y2: P.t + ih, stroke: "#3ddc97", "stroke-width": 1,
        opacity: 0, "stroke-dasharray": "3 3",
      });
      const dotC = svgEl("circle", { r: 3.5, fill: "#3ddc97", opacity: 0 });
      const dotP = svgEl("circle", { r: 3.5, fill: "#f0b429", opacity: 0 });
      svg.append(cross, dotC, dotP);

      let tip = $(".chart-tip");
      if (!tip) {
        tip = document.createElement("div");
        tip.className = "chart-tip";
        document.body.appendChild(tip);
      }

      const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      svg.addEventListener("pointermove", (e) => {
        const rect = svg.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * W;
        const i = Math.max(0, Math.min(data.length - 1,
          Math.round(((px - P.l) / iw) * (data.length - 1))));
        const d = data[i];
        cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i));
        cross.setAttribute("opacity", 0.5);
        dotC.setAttribute("cx", x(i)); dotC.setAttribute("cy", y(d.commits)); dotC.setAttribute("opacity", 1);
        dotP.setAttribute("cx", x(i)); dotP.setAttribute("cy", y(d.prs)); dotP.setAttribute("opacity", 1);
        const [yy, mm] = d.month.split("-");
        tip.innerHTML = `<strong>${MONTHS[+mm - 1]} ${yy}</strong><br>` +
          `<span class="tc">●</span> ${d.commits} commits<br>` +
          `<span class="tp">●</span> ${d.prs} pull requests`;
        tip.classList.add("on");
        const tw = tip.offsetWidth;
        tip.style.left = Math.min(e.clientX + 14, innerWidth - tw - 10) + "px";
        tip.style.top = e.clientY - 10 + "px";
      });
      svg.addEventListener("pointerleave", () => {
        cross.setAttribute("opacity", 0);
        dotC.setAttribute("opacity", 0);
        dotP.setAttribute("opacity", 0);
        tip.classList.remove("on");
      });

      host.appendChild(svg);
    }

    draw();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(draw, 200); });
  }

  /* ---------- contribution heatmap ---------- */
  function renderHeatmap(calendar) {
    const host = document.getElementById("heatmap");
    const CELL = 11, GAP = 3, TOP = 18, LEFT = 26;

    // organize into week columns (calendar already starts on a Sunday per GitHub)
    const weeks = [];
    let week = new Array(new Date(calendar[0][0] + "T00:00:00Z").getUTCDay()).fill(null);
    for (const [date, count] of calendar) {
      week.push({ date, count });
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length) weeks.push(week);

    const W = LEFT + weeks.length * (CELL + GAP);
    const H = TOP + 7 * (CELL + GAP) + 4;
    const max = Math.max(...calendar.map((c) => c[1]), 1);
    const level = (c) =>
      c === 0 ? "#101820"
      : c <= max * 0.15 ? "#0e3a2a"
      : c <= max * 0.35 ? "#14684a"
      : c <= max * 0.65 ? "#23a96f"
      : "#3ddc97";

    const svg = svgEl("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` });

    const DAYS = ["", "mon", "", "wed", "", "fri", ""];
    DAYS.forEach((d, i) => {
      if (!d) return;
      const t = svgEl("text", {
        x: 0, y: TOP + i * (CELL + GAP) + CELL - 2,
        fill: "#4a5662", "font-size": 9, "font-family": "Spline Sans Mono, monospace",
      });
      t.textContent = d;
      svg.appendChild(t);
    });

    const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    let lastMonth = -1;
    weeks.forEach((wk, wi) => {
      const first = wk.find(Boolean);
      if (first) {
        const m = new Date(first.date + "T00:00:00Z").getUTCMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          const t = svgEl("text", {
            x: LEFT + wi * (CELL + GAP), y: 10,
            fill: "#4a5662", "font-size": 9, "font-family": "Spline Sans Mono, monospace",
          });
          t.textContent = MONTHS[m];
          svg.appendChild(t);
        }
      }
      wk.forEach((day, di) => {
        if (!day) return;
        const r = svgEl("rect", {
          x: LEFT + wi * (CELL + GAP), y: TOP + di * (CELL + GAP),
          width: CELL, height: CELL, rx: 2.5, fill: level(day.count),
        });
        const title = svgEl("title", {});
        title.textContent = `${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}`;
        r.appendChild(title);
        svg.appendChild(r);
      });
    });

    host.appendChild(svg);
    host.scrollLeft = host.scrollWidth; // most recent weeks visible first
  }

  /* ---------- languages ---------- */
  function renderLangs(languages) {
    const host = document.getElementById("langs");
    const top = languages.slice(0, 6);
    const total = top.reduce((a, l) => a + l.size, 0);
    for (const l of top) {
      const pct = (l.size / total) * 100;
      const row = document.createElement("div");
      row.className = "lang-row";
      row.innerHTML =
        `<span class="ln">${l.name}</span>` +
        `<span class="lang-bar"><i style="background:${l.color}"></i></span>` +
        `<span class="lp">${pct.toFixed(1)}%</span>`;
      host.appendChild(row);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => { row.querySelector("i").style.width = pct + "%"; })
      );
    }
  }
})();
