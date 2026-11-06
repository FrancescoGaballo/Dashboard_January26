/* EU Power Market Desk — shared browser logic (no bundler). */

const DATA = {
  countries: null,
  items: null,
};

const LOCALE_STORAGE_KEY = "eudesk_locale";

/** UI strings: EN + partial DE for “cheap” i18n; extend fr/es/it later. */
const UI_STRINGS = {
  en: {
    "nav.home": "Home",
    "nav.signals": "Signals",
    "nav.locale": "UI",
    "lang.en": "English",
    "lang.de": "Deutsch",
    "lang.fr": "Français",
    "lang.es": "Español",
    "lang.it": "Italiano",
    "home.title": "Regional snapshot",
    "home.lede":
      "Curated news and important market-design and policy changes—with optional battery storage (BESS) participation context (routes, enablers/blockers). Not investment advice.",
    "home.regions": "Regions & countries",
    "home.recent": "Recent signals (all regions)",
    "home.disclaimer":
      "Disclaimer: This MVP aggregates public syndicated feeds and manual notes for personal research. It is not legal, regulatory, or investment advice. Verify items at the original source. Titles/snippets may appear in EN/DE/FR/ES/IT depending on the publisher feed.",
    "signals.title": "Signals feed",
    "signals.lede":
      "One consolidated stream with source and timestamp. Filter by region, tag, or language. EU-wide RSS items appear under EU & cross-border until you re-tag them manually for a country.",
    "signals.filter.region": "Region",
    "signals.filter.region_all": "All regions",
    "signals.filter.tag": "Tag",
    "signals.filter.tag_all": "All tags",
    "signals.filter.lang": "Language",
    "signals.filter.item_lang_all": "All (item languages)",
    "signals.filter.lang_other": "Unknown / other",
    "signals.filter.search": "Search title / summary",
    "signals.search.placeholder": "e.g. balancing, congestion…",
    "signals.reset": "Reset",
    "signals.disclaimer":
      "Aggregated feeds may include items outside your focus—tighten filters or rely on manual seed-items.json for curation. Trade press is RSS/Atom only; do not scrape aggregator HTML.",
    "country.back": "← Back to regions",
    "country.signals_for": "Signals for this region",
    "country.not_found_title": "Region not found",
    "country.not_found_body": "Use a valid ?slug= parameter (see Home).",
    "country.no_items":
      "No signals tagged for this region yet. Add entries in data/seed-items.json or adjust RSS defaults.",
    "country.filter_signals": "Filter Signals for this region →",
    "country.bess_heading": "Optional BESS lens (not advice)",
    "country.developer_heading": "Developer conditions (policy)",
    "country.open_full_feed": "Open the full feed",
    "meta.published": "Published",
    "meta.source": "Source",
    "meta.region": "Region",
    "meta.language": "Language",
    "meta.lang_unknown": "—",
    "empty.no_signals_merge": "No items yet — run python3 scripts/merge_items.py",
    "empty.no_match": "No items match these filters.",
    "bess.framing": "BESS framing (not advice):",
  },
  de: {
    "nav.home": "Start",
    "nav.signals": "Signale",
    "nav.locale": "Oberfläche",
    "lang.en": "English",
    "lang.de": "Deutsch",
    "lang.fr": "Français",
    "lang.es": "Español",
    "lang.it": "Italiano",
    "home.title": "Regionalüberblick",
    "home.lede":
      "Kuratierte Nachrichten und wichtige Marktdesign-/Politikänderungen—optional mit BESS-Kontext (Teilnahmewege, Rahmenbedingungen). Keine Anlageberatung.",
    "home.regions": "Regionen & Länder",
    "home.recent": "Neueste Signale (alle Regionen)",
    "home.disclaimer":
      "Hinweis: Dieses MVP bündelt öffentliche RSS-/Atom-Feeds und manuelle Notizen für die persönliche Recherche. Keine Rechts-, Regulierungs- oder Anlageberatung. Titel/Auszüge können je nach Feed auf EN/DE/FR/ES/IT stehen.",
    "signals.title": "Signal-Feed",
    "signals.lede":
      "Ein konsolidierter Strom mit Quelle und Zeitstempel. Filter nach Region, Tag oder Sprache. EU-weite RSS-Einträge erscheinen unter EU & grenzüberschreitend, bis Sie sie manuell für ein Land nachverfolgen.",
    "signals.filter.region": "Region",
    "signals.filter.region_all": "Alle Regionen",
    "signals.filter.tag": "Tag",
    "signals.filter.tag_all": "Alle Tags",
    "signals.filter.lang": "Sprache",
    "signals.filter.item_lang_all": "Alle (Feed-Sprachen)",
    "signals.filter.lang_other": "Unbekannt / andere",
    "signals.filter.search": "Titel / Zusammenfassung suchen",
    "signals.search.placeholder": "z. B. balancing, Congestion…",
    "signals.reset": "Zurücksetzen",
    "signals.disclaimer":
      "Feeds können Einträge außerhalb Ihres Fokus enthalten—Filter verschärfen oder manuell kuratieren. Fachpresse nur per RSS/Atom; keine Aggregator-HTML-Scraper.",
    "country.back": "← Zurück zu den Regionen",
    "country.signals_for": "Signale für diese Region",
    "country.not_found_title": "Region nicht gefunden",
    "country.not_found_body": "Bitte einen gültigen ?slug=-Parameter verwenden (siehe Start).",
    "country.no_items":
      "Noch keine Signale für diese Region. Einträge in data/seed-items.json ergänzen oder RSS-Defaults anpassen.",
    "country.filter_signals": "Signale für diese Region filtern →",
    "country.bess_heading": "Optionaler BESS-Blick (keine Beratung)",
    "country.developer_heading": "Rahmenbedingungen für Entwickler (Politik)",
    "country.open_full_feed": "Gesamten Feed öffnen",
    "meta.published": "Veröffentlicht",
    "meta.source": "Quelle",
    "meta.region": "Region",
    "meta.language": "Sprache",
    "meta.lang_unknown": "—",
    "empty.no_signals_merge": "Noch keine Einträge — python3 scripts/merge_items.py ausführen",
    "empty.no_match": "Keine Treffer für diese Filter.",
    "bess.framing": "BESS-Einordnung (keine Beratung):",
  },
};

["fr", "es", "it"].forEach((code) => {
  UI_STRINGS[code] = { ...UI_STRINGS.en };
});

/** BCP 47 display labels for feed item languages (subset). */
const LANG_LABELS = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

const TAG_SUGGESTIONS = [
  "market-design",
  "balancing",
  "grid",
  "res-support",
  "bess-support",
  "permits-grid",
  "use-of-system",
  "retail-bills",
  "gas-policy",
  "taxes-levies",
  "storage",
  // Legacy: prefer res-support / bess-support; Signals maps alias when filtering
  "support-schemes",
];

/** Legacy tag: selecting `res-support` or `bess-support` also matches items tagged only `support-schemes`. */
const TAG_ALIASES = {
  "res-support": ["support-schemes"],
  "bess-support": ["support-schemes"],
};

const ACCEPT_LANGS = ["en", "de", "fr", "es", "it"];

function itemMatchesTagFilter(itemTags, selectedTag) {
  if (!selectedTag) return true;
  const tags = itemTags || [];
  if (tags.includes(selectedTag)) return true;
  const extra = TAG_ALIASES[selectedTag];
  if (!extra) return false;
  return extra.some((a) => tags.includes(a));
}

function getLocale() {
  try {
    const v = (localStorage.getItem(LOCALE_STORAGE_KEY) || "en").toLowerCase();
    return UI_STRINGS[v] ? v : "en";
  } catch {
    return "en";
  }
}

function setLocale(code) {
  const c = (code || "en").toLowerCase();
  const next = UI_STRINGS[c] ? c : "en";
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  return next;
}

function t(key) {
  const loc = getLocale();
  const table = UI_STRINGS[loc] || UI_STRINGS.en;
  return table[key] != null ? table[key] : UI_STRINGS.en[key] != null ? UI_STRINGS.en[key] : key;
}

function formatLanguage(code) {
  if (!code) return t("meta.lang_unknown");
  const c = String(code).toLowerCase();
  return LANG_LABELS[c] || c.toUpperCase();
}

async function loadJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

function tagSpan(text) {
  return el("span", { class: "tag" }, [text]);
}

function countryName(slug) {
  const c = DATA.countries && DATA.countries.countries
    ? DATA.countries.countries.find((x) => x.slug === slug)
    : null;
  return c ? c.name : slug.toUpperCase();
}

function renderItemCard(item) {
  const wrap = el("article", { class: "panel" });

  const titleLink = el(
    "a",
    { href: item.url || "#", target: "_blank", rel: "noopener noreferrer" },
    [item.title || "(Untitled)"]
  );
  wrap.appendChild(el("h3", { class: "item-title" }, [titleLink]));

  const meta = el("div", { class: "meta-row" });
  meta.appendChild(el("span", {}, [`${t("meta.published")}: ${formatDate(item.published_at)}`]));
  const src = item.source_name || "Source";
  if (item.source_url) {
    const sLink = el(
      "a",
      { href: item.source_url, target: "_blank", rel: "noopener noreferrer" },
      [src]
    );
    meta.appendChild(el("span", {}, [`${t("meta.source")}: `, sLink]));
  } else {
    meta.appendChild(el("span", {}, [`${t("meta.source")}: ${src}`]));
  }
  meta.appendChild(el("span", {}, [`${t("meta.region")}: ${countryName(item.country || "")}`]));
  const langCode = (item.language || "").trim();
  meta.appendChild(
    el("span", {}, [`${t("meta.language")}: ${langCode ? formatLanguage(langCode) : t("meta.lang_unknown")}`])
  );
  wrap.appendChild(meta);

  if (item.summary) {
    wrap.appendChild(el("p", { class: "item-summary" }, [item.summary]));
  }

  const tags = item.tags && item.tags.length ? item.tags : [];
  if (tags.length) {
    const row = el("div", { class: "meta-row" });
    tags.forEach((tag) => row.appendChild(tagSpan(tag)));
    wrap.appendChild(row);
  }

  if (item.opportunity_note) {
    const opp = el("div", { class: "opportunity" });
    opp.appendChild(el("strong", {}, [`${t("bess.framing")} `]));
    opp.appendChild(document.createTextNode(item.opportunity_note));
    wrap.appendChild(opp);
  }

  return wrap;
}

function applyDomTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = t(key);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (!key || !("placeholder" in node)) return;
    node.placeholder = t(key);
  });
  root.querySelectorAll("select option[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = t(key);
  });
}

function wireLocaleSelect(selectEl) {
  if (!selectEl) return;
  const loc = getLocale();
  selectEl.value = loc;
  applyDomTranslations(document);
  selectEl.addEventListener("change", () => {
    setLocale(selectEl.value);
    applyDomTranslations(document);
    document.documentElement.setAttribute("lang", getLocale());
    window.dispatchEvent(new CustomEvent("eudesk-locale-change", { detail: { locale: getLocale() } }));
  });
  document.documentElement.setAttribute("lang", loc);
}

async function bootCommon() {
  [DATA.countries, DATA.items] = await Promise.all([
    loadJson("data/countries.json"),
    loadJson("data/items.json"),
  ]);
}

window.EUDesk = {
  DATA,
  loadJson,
  formatDate,
  qs,
  tagSpan,
  countryName,
  renderItemCard,
  bootCommon,
  TAG_SUGGESTIONS,
  itemMatchesTagFilter,
  t,
  getLocale,
  setLocale,
  applyDomTranslations,
  wireLocaleSelect,
  formatLanguage,
  ACCEPT_LANGS,
};
