# Documented sources (MVP)

This file is the **living source register** for EU Power Market Desk. Pair it with the product spec at `/cursor/stores/self/docs/eu-power-desk-spec.md`.

## Ingestion rules (confirmed)

| Rule | Detail |
|------|--------|
| **Syndication only** | Ingest **RSS or Atom** endpoints the publisher exposes for machine-readable syndication. |
| **Official bodies** | Preferred: regulators, TSOs, ENTSO-E, ACER, European Commission/DGs, national ministries—**via their feeds** where available. |
| **Trade press** | Allowed **only** when the outlet provides a **direct RSS/Atom feed URL** you configure in `rss-feeds.json` (not a third-party news aggregator page). |
| **No news-aggregator scraping** | Do **not** scrape Google News–style HTML pages, “latest news” grids, or other pages without a dedicated feed contract. |
| **No paywall circumvention** | Do not bypass paywalls, logins, or rate limits; feeds must be **lawfully accessible** to you. |

Configure concrete feed URLs in `rss-feeds.json`. For each feed, record **publisher**, **feed URL**, **default geography/tags**, and **ToS / attribution** notes in the table below when you enable it.

## Active & candidate feeds

| Publisher | Type | Feed URL (RSS/Atom) | Default region (`country`) | Terms / attribution notes |
|-----------|------|---------------------|---------------------------|---------------------------|
| ENTSO-E | Official | `https://www.entsoe.eu/rss.xml` | `eu` | Verify current ENTSO-E site terms for automated retrieval and display in a personal tool; attribution shown in-app. |
| ACER | Official | `https://www.acer.europa.eu/media/rss.xml` | `eu` | Some networks may TLS-timeout intermittently; retry later. Confirm ACER media reuse rules. |
| *(add trade press)* | Trade press | *(RSS URL you verify returns 200)* | *(slug)* | Link to the outlet’s **official RSS terms** or copyright page; many prohibit full-text republication—this MVP uses **title + short excerpt** from the feed only. |

Add rows as you enable feeds. Remove or disable feeds if terms change.

## Manual curation

Items in `seed-items.json` should name **`source_name`** and **`source_url`** (organisation home or specific notice). Optional: **`language`** (ISO 639-1, e.g. `de`, `fr`) when the headline is not English.
