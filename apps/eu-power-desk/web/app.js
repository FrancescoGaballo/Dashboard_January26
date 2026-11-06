/* EU Power Market Desk — shared browser logic (no bundler). */

const DATA = {
  countries: null,
  items: null,
};

const TAG_SUGGESTIONS = [
  "market-design",
  "balancing",
  "grid",
  "support-schemes",
  "taxes-levies",
  "storage",
];

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
  meta.appendChild(el("span", {}, [`Published: ${formatDate(item.published_at)}`]));
  const src = item.source_name || "Source";
  if (item.source_url) {
    const sLink = el(
      "a",
      { href: item.source_url, target: "_blank", rel: "noopener noreferrer" },
      [src]
    );
    meta.appendChild(el("span", {}, ["Source: ", sLink]));
  } else {
    meta.appendChild(el("span", {}, [`Source: ${src}`]));
  }
  meta.appendChild(el("span", {}, [`Region: ${countryName(item.country || "")}`]));
  wrap.appendChild(meta);

  if (item.summary) {
    wrap.appendChild(el("p", { class: "item-summary" }, [item.summary]));
  }

  const tags = item.tags && item.tags.length ? item.tags : [];
  if (tags.length) {
    const row = el("div", { class: "meta-row" });
    tags.forEach((t) => row.appendChild(tagSpan(t)));
    wrap.appendChild(row);
  }

  if (item.opportunity_note) {
    const opp = el("div", { class: "opportunity" });
    opp.appendChild(el("strong", {}, ["BESS framing (not advice): "]));
    opp.appendChild(document.createTextNode(item.opportunity_note));
    wrap.appendChild(opp);
  }

  return wrap;
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
};
