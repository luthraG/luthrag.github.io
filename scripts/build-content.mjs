// Regenerates everything derived from writing/posts.json, so the post list lives
// in exactly one place. Run after editing posts.json:
//   node scripts/build-content.mjs
//
// Regenerates:
//   - writing/index.html  no-JS post list   (between <!-- posts:start --> / <!-- posts:end -->)
//   - index.html          homepage feature  (between <!-- feature:start --> / <!-- feature:end -->)
//   - sitemap.xml         every page + article
//   - writing/feed.xml    RSS 2.0 from the posts

import { readFileSync, writeFileSync } from "node:fs";

const ORIGIN = "https://luthrag.github.io";
const posts = JSON.parse(readFileSync("writing/posts.json", "utf8"));
if (!Array.isArray(posts) || !posts.length) {
  console.error("posts.json is empty or not an array");
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const latest = posts.map((p) => p.published).filter(Boolean).sort().pop();

// replace the lines strictly between two marker lines, keeping the markers
function replaceBlock(html, startMark, endMark, inner) {
  const lines = html.split("\n");
  const si = lines.findIndex((l) => l.includes(startMark));
  const ei = lines.findIndex((l) => l.includes(endMark));
  if (si < 0 || ei < 0 || ei < si) throw new Error(`markers not found: ${startMark}`);
  return [...lines.slice(0, si + 1), ...inner.split("\n"), ...lines.slice(ei)].join("\n");
}

// ---- writing/index.html : the no-JS post list (all posts) ----
const postLi = (p) =>
  `    <li>
      <a href="${esc(p.file)}">
        <span class="post-date">${esc(p.date)}</span>
        <div class="post-meta">
          <h2>${esc(p.title)}</h2>
          <p>${esc(p.blurb)}</p>
          <div class="post-tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div>
      </a>
    </li>`;

let widx = readFileSync("writing/index.html", "utf8");
widx = replaceBlock(widx, "<!-- posts:start", "<!-- posts:end -->", posts.map(postLi).join("\n"));
writeFileSync("writing/index.html", widx);

// ---- index.html : the homepage feature card (latest post only) ----
const f = posts[0];
const featureCard =
  `      <a class="writing-feature" href="writing/${esc(f.file)}">
        <span class="wf-meta">latest · ${esc(f.year)} · ${esc(f.topic)}</span>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.blurbHome || f.blurb)}</p>
        <span class="wf-cta">Read the article →</span>
      </a>`;
let home = readFileSync("index.html", "utf8");
home = replaceBlock(home, "<!-- feature:start", "<!-- feature:end -->", featureCard);
writeFileSync("index.html", home);

// ---- sitemap.xml ----
const urls = [
  { loc: `${ORIGIN}/`, lastmod: latest, pri: "1.0" },
  { loc: `${ORIGIN}/writing/`, lastmod: latest, pri: "0.8" },
  ...posts.map((p) => ({ loc: `${ORIGIN}/writing/${p.file}`, lastmod: p.published, pri: "0.7" })),
];
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pri}</priority></url>`).join("\n") +
  `\n</urlset>\n`;
writeFileSync("sitemap.xml", sitemap);

// ---- writing/feed.xml (RSS 2.0) ----
const rfc822 = (d) => new Date(d + "T00:00:00Z").toUTCString().replace("GMT", "+0000");
const xesc = (s) => esc(s); // same entity escaping is valid in XML text
const item = (p) =>
  `  <item>
    <title>${xesc(p.title)}</title>
    <link>${ORIGIN}/writing/${p.file}</link>
    <guid isPermaLink="true">${ORIGIN}/writing/${p.file}</guid>
    <pubDate>${rfc822(p.published)}</pubDate>
    <description>${xesc(p.blurb)}</description>
${(p.tags || []).map((t) => `    <category>${xesc(t)}</category>`).join("\n")}
  </item>`;
const feed =
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Gaurav Luthra - Writing</title>
  <link>${ORIGIN}/writing/</link>
  <description>Deep dives on distributed systems, observability, performance and data platforms.</description>
  <language>en-us</language>
  <atom:link href="${ORIGIN}/writing/feed.xml" rel="self" type="application/rss+xml"/>
  <lastBuildDate>${rfc822(latest)}</lastBuildDate>
${posts.map(item).join("\n")}
</channel>
</rss>
`;
writeFileSync("writing/feed.xml", feed);

console.log(`build-content: ${posts.length} posts -> writing/index.html, index.html, sitemap.xml, writing/feed.xml`);
