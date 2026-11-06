# Data pipeline (MVP)

## Inputs

| File | Purpose |
|------|---------|
| `data/seed-items.json` | Manually curated **verified** items (YAML would also work; JSON keeps the merge script dependency-free). |
| `data/rss-feeds.json` | **RSS/Atom only** — official and **trade press** feeds (direct feed URLs; no HTML news aggregators). Defaults: `country`, `tags`, optional `language`, optional `site_base_url`. |
| `data/SOURCES.md` | Source register + ToS / attribution notes (maintain as feeds are enabled). |
| `data/countries.json` | Page copy per country / region. |

## Merge

```bash
python3 scripts/merge_items.py
```

Writes `web/data/items.json` — the static site loads this file via `fetch()`.

### Behaviour

- Fetches each configured feed over HTTPS (stdlib only).
- Parses RSS 2.0 and Atom entry elements.
- Merges with manual items; **de-duplicates** using `guid`, `id`, or normalised `link`.
- On fetch/parse failure, logs to stderr and continues with remaining feeds.
- Adds **`language`** (ISO 639-1 primary subtag) when known: RSS `<language>` / `dc:language`, Atom `xml:lang`, feed-level `language` in `rss-feeds.json`, or manual seed.

## Future automation (Phase 2)

- Schedule `merge_items.py` in CI (e.g. daily) with a cached artefact or commit bot **only** if your organisation accepts automated content commits.
- Optional: write country/tags from feed-specific rules (per-feed XPath or title keyword maps).
- Optional: replace JSON files with a small SQLite DB and a single export step for static hosting.

## Legal / terms of use

- Use **publisher-provided** RSS/Atom where permitted. **Do not** scrape generic HTML news pages or third-party aggregators (e.g. Google News-style listings); trade press must supply a **feed endpoint** you are permitted to poll.
- Do not scrape paywalled content or circumvent access controls.
- Retain attribution (`source_name`, `source_url`, timestamps).
- Re-check redistribution rules for each feed owner before broad republishing beyond a personal desk tool.
