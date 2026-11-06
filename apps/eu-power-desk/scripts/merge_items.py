#!/usr/bin/env python3
"""
Merge manual seed items with RSS/Atom feeds into web/data/items.json.
Uses Python 3 standard library only.
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = ROOT / "web" / "data" / "items.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

USER_AGENT = "EUPowerMarketDesk/0.1 (+https://github.com/FrancescoGaballo/Dashboard_January26; merge_items)"


def _iso_z(dt: datetime | None) -> str:
    if dt is None:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _norm_url(url: str | None) -> str | None:
    if not url:
        return None
    u = url.strip()
    return u or None


def _stable_id(parts: list[str]) -> str:
    h = hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:16]
    return f"rss-{h}"


def _fetch(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def _text(el: ET.Element | None) -> str:
    if el is None:
        return ""
    return "".join(el.itertext()).strip()


def _parse_datetime(s: str | None) -> datetime | None:
    if not s:
        return None
    s = s.strip()
    # ISO 8601
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except ValueError:
        pass
    # RFC 822 (subset)
    try:
        from email.utils import parsedate_to_datetime

        return parsedate_to_datetime(s)
    except (ValueError, TypeError):
        return None


ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}


def parse_atom(root: ET.Element, feed_meta: dict[str, Any]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    default_country = feed_meta.get("default_country", "eu")
    default_tags: list[str] = feed_meta.get("default_tags") or []
    feed_title = _text(root.find("atom:title", ATOM_NS)) or feed_meta.get("id", "feed")

    for entry in root.findall("atom:entry", ATOM_NS):
        title = _text(entry.find("atom:title", ATOM_NS))
        link_el = None
        for le in entry.findall("atom:link", ATOM_NS):
            if le.get("rel") in (None, "alternate") and le.get("href"):
                link_el = le
                break
        if link_el is None:
            for le in entry.findall("atom:link", ATOM_NS):
                if le.get("href"):
                    link_el = le
                    break
        link_raw = link_el.get("href") if link_el is not None else ""
        site = feed_meta.get("site_base_url") or ""
        link = urljoin(site, link_raw) if link_raw else ""
        guid = _text(entry.find("atom:id", ATOM_NS)) or link
        summary = _text(entry.find("atom:summary", ATOM_NS)) or _text(entry.find("atom:content", ATOM_NS))
        updated = (
            _text(entry.find("atom:updated", ATOM_NS))
            or _text(entry.find("atom:published", ATOM_NS))
            or ""
        )
        published_at = _iso_z(_parse_datetime(updated) or _parse_datetime(None))

        tags = list(default_tags)
        item_id = _stable_id([guid, link, title])

        items.append(
            {
                "id": item_id,
                "title": title or "(Untitled)",
                "summary": (summary or "")[:1200],
                "country": default_country,
                "tags": tags,
                "published_at": published_at,
                "source_name": feed_title,
                "source_url": feed_meta.get("feed_url", ""),
                "url": link,
            }
        )
    return items


def parse_rss(root: ET.Element, feed_meta: dict[str, Any]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    default_country = feed_meta.get("default_country", "eu")
    default_tags: list[str] = feed_meta.get("default_tags") or []
    channel = root.find("channel")
    if channel is None:
        return items
    feed_title = _text(channel.find("title")) or feed_meta.get("id", "feed")

    for elem in channel.findall("item"):
        title = _text(elem.find("title"))
        link_raw = _text(elem.find("link"))
        site = feed_meta.get("site_base_url") or ""
        link = urljoin(site, link_raw) if link_raw else ""
        guid = _text(elem.find("guid")) or link
        desc = _text(elem.find("description"))
        pub = _text(elem.find("pubDate"))
        published_at = _iso_z(_parse_datetime(pub))

        # Strip simple HTML tags from description for summary
        summary = re.sub(r"<[^>]+>", " ", desc or "")
        summary = re.sub(r"\s+", " ", summary).strip()

        item_id = _stable_id([guid, link, title])
        tags = list(default_tags)

        items.append(
            {
                "id": item_id,
                "title": title or "(Untitled)",
                "summary": summary[:1200],
                "country": default_country,
                "tags": tags,
                "published_at": published_at,
                "source_name": feed_title,
                "source_url": feed_meta.get("feed_url", ""),
                "url": link,
            }
        )
    return items


def parse_feed(xml_bytes: bytes, feed_meta: dict[str, Any]) -> list[dict[str, Any]]:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as e:
        print(f"[merge_items] XML parse error for {feed_meta.get('feed_url')}: {e}", file=sys.stderr)
        return []

    tag = root.tag.lower()
    if tag.endswith("feed"):
        return parse_atom(root, feed_meta)
    if tag.endswith("rss"):
        return parse_rss(root, feed_meta)
    print(f"[merge_items] Unknown root element {root.tag!r} for {feed_meta.get('feed_url')}", file=sys.stderr)
    return []


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def merge() -> list[dict[str, Any]]:
    seed = load_json(DATA / "seed-items.json")
    feed_config = load_json(DATA / "rss-feeds.json")

    by_key: dict[str, dict[str, Any]] = {}
    order_counter = 0

    def add_item_impl(item: dict[str, Any]) -> None:
        nonlocal order_counter
        guid = (item.get("id") or item.get("guid") or "").strip()
        link = _norm_url(item.get("url")) or ""
        key = guid or link
        if not key:
            key = _stable_id([item.get("title", ""), item.get("published_at", "")])
        if key in by_key:
            return
        item.pop("is_sample", None)
        item["_ord"] = order_counter
        order_counter += 1
        by_key[key] = item

    for item in seed.get("items") or []:
        add_item_impl(dict(item))

    for feed in feed_config.get("feeds") or []:
        url = feed.get("feed_url")
        if not url:
            continue
        try:
            body = _fetch(url)
        except (urllib.error.URLError, OSError) as e:
            print(f"[merge_items] Fetch failed {url}: {e}", file=sys.stderr)
            continue
        for item in parse_feed(body, feed):
            add_item_impl(item)

    items = list(by_key.values())
    # Newest first (ISO timestamps compare lexicographically); stable tie-break
    items.sort(key=lambda x: (x.get("published_at", ""), x.get("_ord", 0)), reverse=True)
    for it in items:
        it.pop("_ord", None)

    return items


def main() -> None:
    items = merge()
    payload = {"generated_at": _iso_z(None), "items": items}
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    countries_src = DATA / "countries.json"
    countries_dst = ROOT / "web" / "data" / "countries.json"
    shutil.copyfile(countries_src, countries_dst)
    print(f"Wrote {OUT} ({len(items)} items)")
    print(f"Copied {countries_src} -> {countries_dst}")


if __name__ == "__main__":
    main()
