// Fetches GitHub activity stats for the portfolio site and writes data/stats.json.
// Usage: GITHUB_TOKEN=... node scripts/fetch-stats.mjs
// Run weekly by .github/workflows/stats.yml

import { writeFileSync, mkdirSync } from "node:fs";

const LOGIN = "luthraG";
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

// Log token scopes up front - missing scopes make GitHub return zeros, not errors.
{
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `bearer ${TOKEN}`, "User-Agent": "luthrag-portfolio-stats" },
  });
  console.error(`token scopes: ${res.headers.get("x-oauth-scopes") || "(none reported)"}`);
}

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "luthrag-portfolio-stats",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function iso(d) {
  return d.toISOString();
}

const now = new Date();
const YEARS = 10;

// ---- Monthly commit / PR counts for the last 10 years ----
// contributionsCollection is queried per calendar month (the API caps a
// single collection range at 1 year and has no monthly breakdown).
const months = [];
for (let i = YEARS * 12 - 1; i >= 0; i--) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
  months.push({
    key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
    from: iso(start),
    to: iso(end < now ? end : now),
  });
}

// Small concurrency pool to keep 120 month-queries fast without tripping
// secondary rate limits.
const POOL = 6;
const monthly = new Array(months.length);
let next = 0;
async function monthWorker() {
  while (next < months.length) {
    const idx = next++;
    const m = months[idx];
    const data = await gql(
      `query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
          }
        }
      }`,
      { login: LOGIN, from: m.from, to: m.to }
    );
    const c = data.user.contributionsCollection;
    monthly[idx] = {
      month: m.key,
      commits: c.totalCommitContributions,
      prs: c.totalPullRequestContributions,
      reviews: c.totalPullRequestReviewContributions,
    };
  }
}
await Promise.all(Array.from({ length: POOL }, monthWorker));
process.stderr.write(`fetched ${monthly.length} months of contribution data\n`);

// ---- 12-month totals + daily contribution calendar (heatmap) ----
const yearAgo = new Date(now);
yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);
const calData = await gql(
  `query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      followers { totalCount }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }`,
  { login: LOGIN, from: iso(yearAgo), to: iso(now) }
);
const cc = calData.user.contributionsCollection;
const calendar = cc.contributionCalendar.weeks.flatMap((w) =>
  w.contributionDays.map((d) => [d.date, d.contributionCount])
);

// ---- Repos: stars and language byte totals ----
let stars = 0;
const langBytes = new Map();
const langColors = new Map();
let cursor = null;
do {
  const data = await gql(
    `query($login: String!, $cursor: String) {
      user(login: $login) {
        repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false) {
          pageInfo { hasNextPage endCursor }
          nodes {
            stargazerCount
            languages(first: 6, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name color } }
            }
          }
        }
      }
    }`,
    { login: LOGIN, cursor }
  );
  const repos = data.user.repositories;
  for (const r of repos.nodes) {
    stars += r.stargazerCount;
    for (const e of r.languages.edges) {
      langBytes.set(e.node.name, (langBytes.get(e.node.name) || 0) + e.size);
      langColors.set(e.node.name, e.node.color);
    }
  }
  cursor = repos.pageInfo.hasNextPage ? repos.pageInfo.endCursor : null;
} while (cursor);

const languages = [...langBytes.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([name, size]) => ({ name, size, color: langColors.get(name) || "#8b98a5" }));

// ---- Lines changed: additions/deletions across PRs authored in last 10 years ----
// Chunked by year because the search API caps any single query at 1000 results.
let prAdditions = 0;
let prDeletions = 0;
let prCount = 0;
for (let y = 0; y < YEARS; y++) {
  const from = new Date(Date.UTC(now.getUTCFullYear() - y - 1, now.getUTCMonth(), now.getUTCDate()));
  const to = new Date(Date.UTC(now.getUTCFullYear() - y, now.getUTCMonth(), now.getUTCDate()));
  const range = `${from.toISOString().slice(0, 10)}..${to.toISOString().slice(0, 10)}`;
  let prCursor = null;
  do {
    const data = await gql(
      `query($q: String!, $cursor: String) {
        search(type: ISSUE, query: $q, first: 100, after: $cursor) {
          issueCount
          pageInfo { hasNextPage endCursor }
          nodes { ... on PullRequest { additions deletions } }
        }
      }`,
      { q: `author:${LOGIN} is:pr created:${range}`, cursor: prCursor }
    );
    for (const n of data.search.nodes) {
      if (n && typeof n.additions === "number") {
        prAdditions += n.additions;
        prDeletions += n.deletions;
        prCount++;
      }
    }
    prCursor = data.search.pageInfo.hasNextPage ? data.search.pageInfo.endCursor : null;
  } while (prCursor);
}

const stats = {
  generated: iso(now),
  login: LOGIN,
  followers: calData.user.followers.totalCount,
  totals12mo: {
    contributions: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions,
    prs: cc.totalPullRequestContributions,
    reviews: cc.totalPullRequestReviewContributions,
  },
  monthly,
  calendar,
  stars,
  languages,
  prTotals: { years: YEARS, count: prCount, additions: prAdditions, deletions: prDeletions },
};

// Tokens with missing scopes silently return zeros instead of erroring:
// the default Actions GITHUB_TOKEN zeroes user contribution queries, and a
// PAT without public_repo zeroes the PR search. Refuse to overwrite good data.
if (
  stats.totals12mo.contributions < 10 ||
  monthly.every((m) => m.commits === 0) ||
  prCount === 0
) {
  console.error(
    `Sanity check failed: contributions=${stats.totals12mo.contributions} prCount=${prCount} ` +
      "(token likely lacks read:user and/or public_repo scope). Not writing."
  );
  process.exit(1);
}

mkdirSync("data", { recursive: true });
writeFileSync("data/stats.json", JSON.stringify(stats));
console.log(
  `wrote data/stats.json: ${stats.totals12mo.contributions} contributions (12mo), ` +
    `${prCount} PRs / +${prAdditions} -${prDeletions} lines (${YEARS}yr), ${stars} stars`
);
