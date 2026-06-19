/* Playable hero terminal: types an intro, then runs real commands. Single-screen
   (each command clears, so output never scrolls), with a rotating placeholder and
   a subtle one-line autosuggest. Homepage only, no deps. */
(() => {
  "use strict";
  const root = document.querySelector("[data-term]");
  if (!root) return;
  const out = root.querySelector("[data-term-out]");
  const input = root.querySelector("[data-term-input]");
  const lineEl = root.querySelector(".term-line");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const print = (html, cls) => {
    const d = document.createElement("div");
    d.className = "term-row" + (cls ? " " + cls : "");
    d.innerHTML = html;
    out.appendChild(d);
  };

  // suggestion line, lives just under the input
  const sug = document.createElement("div");
  sug.className = "term-sug";
  lineEl.insertAdjacentElement("afterend", sug);

  /* ---- content ---- */
  const WHOAMI = [
    "<span class='t-key'>founder</span>  <span class='t-str'>Yuvanya Systems · CTO</span>",
    "<span class='t-key'>role</span>     <span class='t-str'>Distinguished Engineer</span>",
    "<span class='t-key'>focus</span>    <span class='t-str'>observability · backend</span>",
    "<span class='t-key'>uptime</span>   <span class='t-str'>15y+</span>",
  ];
  const WORK = ["anomaly-engine", "profiler", "query-lang", "recommender", "edge-defense", "content-sync"];
  const WRITING = [
    ["the-hard-part-of-sampling-is-the-zero.html", "The Hard Part of Sampling Is the Zero", "sampling: the zero"],
    ["where-your-llm-tokens-go.html", "Where Your LLM Tokens Actually Go", "where llm tokens go"],
    ["continuous-profiling.html", "Continuous Profiling", "continuous profiling"],
    ["anomaly-detection-at-nanosecond-cost.html", "Anomaly Detection, at Nanosecond Cost", "anomaly detection"],
  ];
  const mobile = () => matchMedia("(max-width: 600px)").matches;
  const SECTIONS = ["experience", "work", "writing", "activity", "consulting", "honors", "contact"];
  const TARGETS = SECTIONS.concat(["github", "linkedin", "email"]);
  const CMDS = ["help", "whoami", "ls", "cat", "open", "clear"];

  const go = (href) => { location.href = href; };
  const jump = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
  const cols = (arr, n) => { const r = []; for (let i = 0; i < arr.length; i += n) r.push(arr.slice(i, i + n).map((x) => `<span class='t-key'>${x}</span>`).join("   ")); return r.join("\n"); };

  const COMMANDS = {
    help: () => [
      "<span class='t-key'>whoami</span>  <span class='t-faint'>who I am</span>",
      "<span class='t-key'>ls</span>      <span class='t-faint'>work · writing</span>",
      "<span class='t-key'>cat</span>     <span class='t-faint'>patents · skills</span>",
      "<span class='t-key'>open</span>    <span class='t-faint'>a section or link</span>",
      "<span class='t-key'>clear</span>   <span class='t-faint'>reset the screen</span>",
    ].join("\n"),
    whoami: () => WHOAMI.join("\n"),
    ls: (a) => a === "writing"
      ? WRITING.map(([, , s]) => `<span class='t-key'>${esc(s)}</span>`).join("\n")
      : cols(WORK, mobile() ? 2 : 3),
    cat: (a) => {
      if (a === "patents") return "US9392144B2 <span class='t-faint'>(granted)</span> · US2015/0373231 <span class='t-faint'>(application)</span>";
      if (a === "skills" || a === "stack") return "[ Go · Python · Node · K8s · GCP/AWS · ES · Mongo · Redis · Kafka · LLM/RAG ]";
      return a ? `cat: ${esc(a)}: no such file` : "usage: cat patents|skills";
    },
    open: (a) => {
      if (!a) return "usage: open &lt;target&gt;";
      const ext = { github: "https://github.com/luthraG", linkedin: "https://www.linkedin.com/in/luthrag" };
      if (a === "email") { location.href = "mailto:luthra.zenith@gmail.com"; return "opening mail…"; }
      if (ext[a]) { window.open(ext[a], "_blank", "noopener"); return `opening ${a}…`; }
      if (SECTIONS.includes(a)) { jump(a); return `jumping to ${a}…`; }
      const art = WRITING.find(([f]) => f === a || f === a + ".html");
      if (art) { go("writing/" + art[0]); return `opening "${esc(art[1])}"…`; }
      return `open: unknown target '${esc(a)}'`;
    },
    clear: () => null,
  };
  const ALIASES = { "?": "help", man: "help", contact: "open contact", email: "open email", github: "open github", linkedin: "open linkedin" };

  const hist = []; let hpos = 0;

  function run(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    hist.push(cmd); hpos = hist.length;
    const line = ALIASES[cmd] || cmd;
    const name = line.split(/\s+/)[0], arg = line.split(/\s+/)[1], rest = line.slice(name.length).trim();
    out.innerHTML = ""; // single screen: only this command's output
    if (name === "clear") return;
    print(`<span class='t-prompt'>$</span> ${esc(cmd)}`);
    const fn = COMMANDS[name];
    if (!fn) { print(`<span class='t-err'>command not found: ${esc(name)}</span> · try <span class='t-key'>help</span>`); return; }
    const res = fn(arg, rest);
    if (res != null) print(res);
  }

  /* ---- autosuggest (one faint line) ---- */
  function suggestState() {
    const v = input.value;
    const parts = v.split(/\s+/);
    if (parts.length <= 1) return { prefix: "", frag: parts[0], pool: CMDS };
    const base = parts[0];
    const pool = base === "open" ? TARGETS : base === "ls" ? ["work", "writing"] : base === "cat" ? ["patents", "skills"] : [];
    return { prefix: base + " ", frag: parts[1] || "", pool };
  }
  function updateSug() {
    const { prefix, frag, pool } = suggestState();
    const cands = pool.filter((c) => c.startsWith(frag));
    if (!input.value || !cands.length || (cands.length === 1 && cands[0] === frag)) { sug.innerHTML = ""; return; }
    sug.innerHTML = cands.slice(0, 7).map((c) => `<span class='term-opt' data-v="${prefix + c}">${c}</span>`).join("");
  }
  sug.addEventListener("mousedown", (e) => {
    const o = e.target.closest(".term-opt");
    if (!o) return;
    e.preventDefault();
    const needsArg = /^(open|ls|cat)$/.test(o.dataset.v);
    input.value = o.dataset.v + (needsArg ? " " : "");
    input.focus(); updateSug();
  });
  let tabState = null;
  function complete() {
    const v = input.value;
    if (!tabState || tabState.v !== v) {
      const { prefix, frag, pool } = suggestState();
      const cands = pool.filter((c) => c.startsWith(frag));
      if (!cands.length) { tabState = null; return; }
      tabState = { prefix, cands, idx: 0, v: null };
    } else {
      tabState.idx = (tabState.idx + 1) % tabState.cands.length;
    }
    const unique = tabState.prefix === "" && tabState.cands.length === 1;
    input.value = tabState.prefix + tabState.cands[tabState.idx] + (unique ? " " : "");
    if (unique) tabState = null; // recompute next Tab in the new (arg) context
    else tabState.v = input.value;
    updateSug();
  }

  input.addEventListener("input", updateSug);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { run(input.value); input.value = ""; sug.innerHTML = ""; }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (hpos > 0) { hpos--; input.value = hist[hpos] || ""; updateSug(); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (hpos < hist.length) { hpos++; input.value = hist[hpos] || ""; updateSug(); } }
  });
  root.addEventListener("click", (e) => { if (e.target.tagName !== "A" && !e.target.closest(".term-opt")) input.focus(); });

  /* ---- rotating placeholder ---- */
  const HINTS = ["type 'help'", "try 'whoami'", "try 'ls work'", "try 'open writing'", "try 'cat skills'"];
  input.placeholder = HINTS[0];
  if (!reduce) {
    let hi = 0;
    setInterval(() => { if (input.value) return; hi = (hi + 1) % HINTS.length; input.placeholder = HINTS[hi]; }, 550);
  }

  /* ---- intro: type the command, print the block, then enable input ---- */
  const cmdLine = "$ whoami";
  const outLines = WHOAMI.concat(["<span class='t-faint'>type</span> <span class='t-key'>help</span> <span class='t-faint'>- this shell is real.</span>"]);
  lineEl.style.visibility = "hidden";
  const finish = () => { lineEl.style.visibility = "visible"; };
  if (reduce) {
    print("<span class='t-cmd'>" + cmdLine + "</span>");
    outLines.forEach((l) => print(l || "&nbsp;"));
    finish();
  } else {
    const row = document.createElement("div");
    row.className = "term-row t-cmd";
    out.appendChild(row);
    let ci = 0;
    (function typeCmd() {
      row.textContent = cmdLine.slice(0, ++ci);
      if (ci < cmdLine.length) { setTimeout(typeCmd, 36 + Math.random() * 42); return; }
      let i = 0;
      (function nextLine() {
        if (i >= outLines.length) { finish(); return; }
        print(outLines[i] || "&nbsp;"); i++;
        setTimeout(nextLine, 130);
      })();
    })();
  }
})();
