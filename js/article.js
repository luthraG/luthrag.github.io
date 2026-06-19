/* Article reading aids: a top scroll-progress bar and a sticky section TOC with
   scroll-spy, built from the h2 sections. Article pages only, no deps. */
(() => {
  "use strict";
  const article = document.querySelector(".article");
  if (!article) return;

  /* ---------- reading progress bar ---------- */
  const bar = document.createElement("div");
  bar.className = "read-progress";
  document.body.appendChild(bar);
  const clamp = (n) => Math.max(0, Math.min(1, n));
  function onScroll() {
    const r = article.getBoundingClientRect();
    const total = r.height - innerHeight;
    bar.style.width = (total > 0 ? clamp(-r.top / total) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- section TOC + scroll-spy ---------- */
  const heads = [...article.querySelectorAll(".prose h2")];
  if (heads.length < 3) return;

  const toc = document.createElement("nav");
  toc.className = "toc";
  toc.setAttribute("aria-label", "On this page");
  toc.innerHTML = '<div class="toc-title">On this page</div>';
  const links = [];
  heads.forEach((h, i) => {
    const no = h.querySelector(".h2-no");
    const clone = h.cloneNode(true);
    const n = clone.querySelector(".h2-no");
    if (n) n.remove();
    const label = clone.textContent.trim();
    const id = "sec-" + (no ? no.textContent.trim() : String(i + 1));
    h.id = id;
    const a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = label;
    toc.appendChild(a);
    links.push(a);
  });
  document.body.appendChild(toc);

  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const id = e.target.id;
          links.forEach((a) => a.classList.toggle("active", a.hash === "#" + id));
        }
      }
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  heads.forEach((h) => spy.observe(h));
})();
