# luthrag.github.io

Personal site of Gaurav Luthra - https://luthrag.github.io/

Hand-built static site (no frameworks). GitHub activity stats are pre-generated
into `data/stats.json` by `scripts/fetch-stats.mjs` and refreshed weekly by the
`Refresh GitHub stats` workflow.

Local preview:

```sh
python3 -m http.server 8080
```

Manual stats refresh:

```sh
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-stats.mjs
```
