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
2. **RSS / Atom feeds** — **official bodies and trade press**, but **only direct RSS/Atom URLs** configured in `data/rss-feeds.json` (no HTML scraping, no Google News–style aggregation pages). Maintain a written source register in `data/SOURCES.md`.
3. Run the merge after changing seeds or feeds:

```bash
cd apps/eu-power-desk
python3 scripts/merge_items.py
```

This writes `web/data/items.json` (what the site reads). It de-duplicates by `link` / `id`.

### Terms of use

- Prefer **official** publisher RSS (regulators, TSOs, EU institutions). **Trade media** may be used **only** when you configure a **lawful, public feed URL** for that outlet. Do **not** scrape paywalled pages or bypass access controls.
- You are responsible for complying with each publisher’s terms; this repo only fetches public feed URLs you configure.

## Languages

- **Content** may mix **English, German, French, Spanish, or Italian** in titles/snippets depending on the feed (no auto-translation in MVP).
- **UI chrome** is English-first with a lightweight locale selector (`localStorage` key `eudesk_locale`) covering EN/DE and **falling back to EN strings** for FR/ES/IT until expanded.

## Tags (Signals filter)

Preset vocabulary (extend freely in JSON):

- `market-design`, `balancing`, `grid`, `storage`
- **`res-support`**, **`bess-support`** — auctions, tenders, capacity/CfD-style mechanisms, consultations on storage eligibility
- **`permits-grid`** — connection, hosting, permitting timelines
- **`use-of-system`** — TSO/DSO charges, DUoS/TNUoS-style components where applicable
- **`retail-bills`** — tariff / *bollette* components, pass-throughs to final customers
- **`gas-policy`** — gas price or regulatory measures that shift power-side incentives or bill items
- `taxes-levies` — explicit taxes/charges on production or consumption
- **`support-schemes`** — **legacy** catch-all; the Signals filter treats it as an alias when you pick **`res-support`** or **`bess-support`** (items tagged only `support-schemes` still surface under those filters)

Country pages include a static **Developer conditions (policy)** blurb from `data/countries.json` reminding what to track (RES support, BESS consultations, grid/UoS, retail/gas).

## Countries

Section slugs: `eu` (cross-border/EU-level), `de`, `fr`, `es`, `ch`, `pl`, `nordics`, `uk`, `it` (Italy uses lighter default copy unless you expand `data/countries.json`).

## Disclaimer

Content is for **informational** purposes only. Nothing here is legal, tax, or investment advice. “Opportunity” framing highlights **policy and market-design factors** that may affect storage participation—it is not a recommendation to transact.
