/*
 * Static generator for the Fancy Text site.
 * Run: node generate.js   ->   writes everything into ./public
 *
 * Page families:
 *   /<slug>/   one page per text style/effect (data/text.json)
 *   /          homepage (grid grouped into Styles / Effects / Case)
 *
 * The tool IS the page: each page server-renders the input (with a sample) and
 * every style row (SEO + works with no JS). assets/tool.js re-renders the rows
 * live as the user types, using the SAME shared module (assets/fonts.js) that
 * this generator uses, so server + client output match exactly.
 */
const fs = require("fs");
const path = require("path");
const FONTS = require("./assets/fonts.js");

// ---- config -------------------------------------------------------------
const DOMAIN = process.env.DOMAIN || "https://text.elevatedprogress.com";
const BASE = process.env.BASE || "";
const SITE = "Fancy Text";
const OUT = path.join(__dirname, "public");
const ASSETS = path.join(__dirname, "assets");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "text.json"), "utf8"));
const PAGES = DATA.pages;
const SAMPLE = "Hello World";

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// ---- html layout --------------------------------------------------------
function layout({ title, desc, urlPath, h1, body }) {
  const canonical = DOMAIN + BASE + urlPath;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="${BASE}/styles.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5580575158570188" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TJY4TRRKD6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TJY4TRRKD6');</script>
</head>
<body>
<header class="site-head"><div class="wrap">
  <a class="brand" href="${BASE}/">✨ ${SITE}</a>
  <nav class="nav"><a href="${BASE}/#styles">Styles</a><a href="${BASE}/#effects">Effects</a><a href="${BASE}/#case">Case</a></nav>
</div></header>
<main class="wrap">
  <div class="crumbs"><a href="${BASE}/">Home</a> ›&nbsp;${h1}</div>
  <h1>${h1}</h1>
  ${body}
</main>
<footer class="site-foot"><div class="wrap">
  <a href="${BASE}/">Home</a><a href="${BASE}/#styles">Text styles</a><a href="${BASE}/#effects">Text effects</a><a href="${BASE}/#case">Case converter</a>
  <span>· ${SITE} — free fancy text and font styles you can copy and paste anywhere. Part of <a href="https://elevatedprogress.com/">Elevated Progress</a>. · <a href="https://elevatedprogress.com/privacy/">Privacy Policy</a></span>
</div></footer>
<script src="${BASE}/fonts.js"></script>
<script src="${BASE}/tool.js" defer></script>
</body>
</html>`;
}

function grid(links) {
  return `<div class="grid">` + links.map(l =>
    `<a href="${BASE}${l.href}">${l.emoji ? `<span class="chip-emoji">${l.emoji}</span>` : ""}${l.label}</a>`).join("") + `</div>`;
}

// ---- tool block (server-rendered input + all style rows) ----------------
function rowsHtml(sample, emphId) {
  let list = FONTS.STYLES;
  if (emphId) {
    const first = FONTS.STYLES.find(s => s.id === emphId);
    if (first) list = [first].concat(FONTS.STYLES.filter(s => s.id !== emphId));
  }
  return list.map((s, i) => {
    const primary = (emphId && i === 0) ? " primary" : "";
    return `<div class="frow${primary}" data-style="${s.id}">
      <span class="fname">${s.name}</span>
      <span class="fout" data-out>${escapeHtml(s.fn(sample))}</span>
      <button type="button" class="copy-btn" data-copy>Copy</button>
    </div>`;
  }).join("\n");
}

function toolBlock(sample, emphId) {
  return `<div class="tool" data-tool>
    <div class="input-wrap">
      <label for="src">Your text</label>
      <textarea id="src" data-src rows="2" spellcheck="false" placeholder="Type or paste your text here…">${escapeHtml(sample)}</textarea>
      <div class="input-foot">
        <button type="button" class="clear-btn" data-clear>Clear</button>
        <span class="hint">Tap <b>Copy</b> on any style, then paste it wherever you like.</span>
      </div>
    </div>
    <div class="rows" data-rows>${rowsHtml(sample, emphId)}</div>
  </div>`;
}

// ---- write helpers ------------------------------------------------------
const urls = [];
function writePage(urlPath, html) {
  const dir = path.join(OUT, urlPath.replace(/^\/+|\/+$/g, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  urls.push(urlPath);
}

const pageLink = p => ({ href: `/${p.slug}/`, emoji: p.emoji, label: p.h1.replace(/ (Generator|Converter).*$/, "") });

// ---- build --------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
for (const entry of fs.readdirSync(OUT)) {
  if (entry === ".git" || entry === "CNAME") continue;
  fs.rmSync(path.join(OUT, entry), { recursive: true, force: true });
}
for (const f of fs.readdirSync(ASSETS)) fs.copyFileSync(path.join(ASSETS, f), path.join(OUT, f));

// per-page
for (const p of PAGES) {
  const related = PAGES.filter(o => o.slug !== p.slug).map(pageLink);
  const body = `${toolBlock(SAMPLE, p.emph)}
  <div class="ad-slot">Advertisement</div>
  <div class="prose">
    <p>${p.intro}</p>
    <p><b>How to use it:</b> type or paste your words in the box, and every style updates as you type. Hit <b>Copy</b> next to the one you want, then paste it into your bio, caption, message, or username. Nothing is saved and there's nothing to install.</p>
    <p class="compat">${p.note}</p>
  </div>
  <h2>More text styles</h2>
  ${grid(related)}
  <div class="ad-slot">Advertisement</div>`;
  writePage(`/${p.slug}/`, layout({
    title: p.title,
    desc: p.desc,
    urlPath: `/${p.slug}/`,
    h1: p.h1,
    body,
  }));
}

// homepage
{
  const flagship = PAGES.filter(p => p.group === "flagship");
  const byGroup = g => PAGES.filter(p => p.group === g).map(pageLink);
  const title = `Fancy Text Generator — Copy & Paste Cool Fonts (${PAGES.length - 1}+ Styles)`;
  const desc = `Type once and copy your text in bold, italic, cursive, bubble, small-caps, upside-down, strikethrough and more. Free fancy fonts to paste on Instagram, TikTok, Discord, and everywhere. No signup.`;
  const body = `<p class="lead">Type your text once and copy it in dozens of Unicode font styles — real characters you can paste into Instagram, TikTok, Discord, X, and any bio or caption. No account, no download, nothing to install.</p>
  ${toolBlock(SAMPLE, null)}
  <div class="ad-slot">Advertisement</div>
  <h2 id="start">Start here</h2>
  ${grid(flagship.map(pageLink))}
  <h2 id="styles">Font styles</h2>
  ${grid(byGroup("Styles"))}
  <h2 id="effects">Text effects</h2>
  ${grid(byGroup("Effects"))}
  <h2 id="case">Case tools</h2>
  ${grid(byGroup("Case"))}
  <div class="prose"><p>Every style here is made of ordinary Unicode characters, not images or installed fonts — that's why you can copy a line and paste it anywhere text goes. A few decorative styles show up as empty boxes in a handful of older apps; if one looks broken where you paste it, just pick another. Bold, italic, and wide are the most widely supported.</p></div>
  <div class="ad-slot">Advertisement</div>`;
  writePage(`/`, layout({ title, desc, urlPath: `/`, h1: `Fancy Text Generator`, body }));
}

// -- sitemap + robots + meta files --
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${DOMAIN}${BASE}${u}</loc></url>`).join("\n")}
</urlset>`;
fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.writeFileSync(path.join(OUT, "CNAME"), "text.elevatedprogress.com\n");
fs.writeFileSync(path.join(OUT, "ads.txt"), "google.com, pub-5580575158570188, DIRECT, f08c47fec0942fa0\n");

console.log(`Generated ${urls.length} pages into ./public`);
