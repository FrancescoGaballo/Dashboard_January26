# EU Power Market Desk (MVP)

Personal, read-only dashboard for **curated** European power-market news and **important regulatory / market-design / price–cost policy** changes, with optional **BESS opportunity framing** (participation routes, enablers/blockers). **Not investment advice.**

## Run locally (static site)

From this directory:

```bash
cd apps/eu-power-desk/web
python3 -m http.server 8080 --bind 127.0.0.1
```

Open:

- Home (all regions): [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
- Signals feed: [http://127.0.0.1:8080/signals.html](http://127.0.0.1:8080/signals.html)

No build step is required for the UI. The pages load JSON from `web/data/`.

## Refresh data (ingestion)

The MVP ships a **maintainable** hybrid:

1. **Manual curated items** — edit `data/seed-items.json` (short schema in that file).
2. **RSS / Atom feeds** (where terms allow machine-readable syndication) — list feeds in `data/rss-feeds.json`, then run:

```bash
cd apps/eu-power-desk
python3 scripts/merge_items.py
```

This writes `web/data/items.json` (what the site reads). It de-duplicates by `link` / `id`.

### Terms of use

- Prefer **official** publisher RSS (regulators, TSOs, EU institutions). Do **not** scrape paywalled pages or bypass access controls.
- You are responsible for complying with each publisher’s terms; this repo only fetches public feed URLs you configure.

## Countries

Section slugs: `de`, `fr`, `es`, `ch`, `pl`, `nordics`, `uk`, `it` (Italy uses lighter default copy unless you expand `data/countries.json`).

## Disclaimer

Content is for **informational** purposes only. Nothing here is legal, tax, or investment advice. “Opportunity” framing highlights **policy and market-design factors** that may affect storage participation—it is not a recommendation to transact.
