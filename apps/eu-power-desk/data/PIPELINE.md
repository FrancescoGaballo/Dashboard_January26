# Data pipeline (MVP)

## Inputs

| File | Purpose |
|------|---------|
| `data/seed-items.json` | Manually curated **verified** items (YAML would also work; JSON keeps the merge script dependency-free). |
| `data/rss-feeds.json` | Optional **RSS/Atom** URLs with default `country` + `tags` when the feed does not carry them. |
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

## Future automation (Phase 2)

- Schedule `merge_items.py` in CI (e.g. daily) with a cached artefact or commit bot **only** if your organisation accepts automated content commits.
- Optional: write country/tags from feed-specific rules (per-feed XPath or title keyword maps).
- Optional: replace JSON files with a small SQLite DB and a single export step for static hosting.

## Legal / terms of use

- Use **publisher-provided** RSS/Atom where permitted. Do not scrape paywalled content or circumvent access controls.
- Retain attribution (`source_name`, `source_url`, timestamps).
- Re-check redistribution rules for each feed owner before broad republishing beyond a personal desk tool.
