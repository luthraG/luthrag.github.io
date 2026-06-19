# luthrag.github.io

Personal site of Gaurav Luthra - https://luthrag.github.io/

Hand-built static site (no frameworks). GitHub activity stats are pre-generated
into `data/stats.json` by `scripts/fetch-stats.mjs` and refreshed weekly by the
`Refresh GitHub stats` workflow.

Writing posts live in `writing/posts.json` (the single source of truth). After
adding or editing a post, regenerate the derived files:

```sh
node scripts/build-content.mjs
```

That rewrites the no-JS post list in `writing/index.html`, the homepage feature
card, `sitemap.xml`, and the RSS feed `writing/feed.xml` from `posts.json`.

Local preview:

```sh
python3 -m http.server 8080
```

Manual stats refresh:

```sh
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-stats.mjs
```
