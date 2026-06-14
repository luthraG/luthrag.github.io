/* Cursor-reactive blueprint grid: a spring mesh that bulges + glows toward the
   pointer. Canvas, no deps. Enhances the static .bg-grid; falls back to it on
   touch devices or when reduced-motion is requested. Homepage only. */
(() => {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(pointer: fine)").matches) return; // touch: keep static grid

  const cssv = getComputedStyle(document.documentElement);
  const LINE = (cssv.getPropertyValue("--line").trim() || "#18222e");
  const ACCENT = (cssv.getPropertyValue("--accent").trim() || "#3ddc97");
  const rgba = (hex, a) => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  const canvas = document.createElement("canvas");
  canvas.id = "grid-fx";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  document.body.classList.add("gridfx"); // hides the CSS .bg-grid
  const ctx = canvas.getContext("2d");

  const SP = 56;     // grid spacing (matches the CSS grid)
  const R = 150;     // influence radius of the cursor
  const STR = 24;    // max displacement (px)
  const STIFF = 0.10, DAMP = 0.80; // spring constants
  let W, H, cols, rows, verts, grad;
  const mouse = { x: -9999, y: -9999, on: false };

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / SP) + 2;
    rows = Math.ceil(H / SP) + 2;
    verts = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push({ ox: c * SP, oy: r * SP, x: c * SP, y: r * SP, vx: 0, vy: 0 });
      verts.push(row);
    }
    // vertical fade so the grid is strongest near the top (matches CSS mask)
    grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, rgba(LINE, 0.34));
    grad.addColorStop(0.65, rgba(LINE, 0.06));
    grad.addColorStop(1, rgba(LINE, 0));
  }

  function frame() {
    let motion = 0;
    const R2 = 2 * R * R;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = verts[r][c];
        let tx = v.ox, ty = v.oy;
        if (mouse.on) {
          const dx = v.ox - mouse.x, dy = v.oy - mouse.y;
          const d2 = dx * dx + dy * dy;
          const f = Math.exp(-d2 / R2) * STR;          // gaussian falloff
          const d = Math.sqrt(d2) || 1;
          tx += (dx / d) * f;                            // repel: push away
          ty += (dy / d) * f;
        }
        v.vx += (tx - v.x) * STIFF; v.vx *= DAMP; v.x += v.vx;
        v.vy += (ty - v.y) * STIFF; v.vy *= DAMP; v.y += v.vy;
        motion += Math.abs(v.vx) + Math.abs(v.vy);
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = verts[r][c];
        c ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y);
      }
    }
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const v = verts[r][c];
        r ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y);
      }
    }
    ctx.stroke();

    // phosphor glow that follows the cursor
    if (mouse.on) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R * 1.5);
      g.addColorStop(0, rgba(ACCENT, 0.10));
      g.addColorStop(1, rgba(ACCENT, 0));
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x - R * 1.5, mouse.y - R * 1.5, R * 3, R * 3);
      ctx.globalCompositeOperation = "source-over";
    }
    return motion;
  }

  let raf = null;
  function loop() {
    const motion = frame();
    if (mouse.on || motion > 0.4) raf = requestAnimationFrame(loop);
    else raf = null; // idle until next interaction
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; kick(); }, { passive: true });
  addEventListener("mouseout", (e) => { if (!e.relatedTarget) { mouse.on = false; kick(); } });
  addEventListener("blur", () => { mouse.on = false; kick(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); kick(); }, 200); }, { passive: true });

  build();
  frame(); // initial static paint
})();
