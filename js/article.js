/* Article reading aids: a top scroll-progress bar, a sticky section TOC with
   scroll-spy, and prev/next links from posts.json. Article pages only, no deps. */
(() => {
  "use strict";
  const article = document.querySelector(".article");
  if (!article) return;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
  if (heads.length >= 3) {
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
      const id = "sec-" + (no ? no.textContent.trim() : String(i + 1));
      h.id = id;
      const a = document.createElement("a");
      a.href = "#" + id;
      a.textContent = clone.textContent.trim();
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
  }

  /* ---------- prev / next from posts.json (newest-first) ---------- */
  const foot = article.querySelector(".article-foot");
  if (foot) {
    fetch("posts.json")
      .then((r) => r.json())
      .then((posts) => {
        if (!Array.isArray(posts) || posts.length < 2) return;
        const here = location.pathname.split("/").pop();
        const idx = posts.findIndex((p) => p.file === here);
        if (idx < 0) return;
        const card = (p, dir) =>
          p ? `<a class="more-card" href="${esc(p.file)}"><span class="more-dir">${dir}</span><h4>${esc(p.title)}</h4></a>` : "";
        const html = card(posts[idx - 1], "← newer") + card(posts[idx + 1], "older →");
        if (!html) return;
        const nav = document.createElement("nav");
        nav.className = "article-more";
        nav.setAttribute("aria-label", "More writing");
        nav.innerHTML = html;
        foot.insertAdjacentElement("afterend", nav);
      })
      .catch(() => {});
  }
})();
