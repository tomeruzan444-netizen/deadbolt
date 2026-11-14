/**
 * Content + SEO QA for Deadbolt Fixers. Run after `npm run build`.
 *   npm run qa            -> report, exit 1 on errors
 * Rules come from docs/CONTENT-GUIDE.md. Also regenerates docs/FAQ-REGISTER.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseHtml } from 'node-html-parser';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src', 'content');

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

if (!fs.existsSync(DIST)) { console.error('dist/ not found. Run npm run build first.'); process.exit(1); }

// ---------- Load content frontmatter ----------
const readFm = (file) => {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? YAML.parse(m[1]) : {};
};
const pages = []; // { url, kind, file, fm }
const add = (dir, kind, toUrl) => {
  const d = path.join(CONTENT, dir);
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d, { recursive: true })) {
    if (!String(f).endsWith('.mdx')) continue;
    const slug = String(f).replace(/\\/g, '/').replace(/\.mdx$/, '');
    pages.push({ url: toUrl(slug), kind, slug, fm: readFm(path.join(d, String(f))) });
  }
};
add('services', 'service', (s) => `/${s}/`);
add('guides', 'guide', (s) => `/deadbolt-guides/${s}/`);
add('pages', 'page', (s) => (s === 'home' ? '/' : `/${s}/`));
add('areas', 'area', (s) => `/service-areas/${s}/`);
add('legal', 'legal', (s) => `/${s}/`);

// ---------- Helpers ----------
const norm = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const lower = (s) => norm(s).toLowerCase();
const countExact = (text, kw) => {
  const t = lower(text), k = lower(kw);
  const re = new RegExp(`(?<![a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'g');
  return (t.match(re) || []).length;
};
const words = (s) => lower(s).replace(/[^a-z0-9' ]/g, ' ').split(' ').filter(Boolean);
const STOP = new Set('a an the of to in on for and or is are do does can i my you your it its with without what how when why which should will be by from at this that than vs if much long get'.split(' '));
const sig = (s) => new Set(words(s).filter((w) => !STOP.has(w)));
const jaccard = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
const shingles = (s, n = 5) => { const w = words(s), out = new Set(); for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' ')); return out; };
const fileFor = (url) => path.join(DIST, url === '/' ? 'index.html' : url.replace(/^\//, ''), url.endsWith('/') ? 'index.html' : '');
const visibleText = (el) => {
  const c = el.clone();
  c.querySelectorAll('script, style, svg, noscript, template').forEach((n) => n.remove());
  return norm(c.textContent);
};

const BANNED = [
  [/\bdelve/i, 'delve'], [/in today'?s (fast-paced )?world/i, "in today's world"], [/it'?s important to note/i, "it's important to note"],
  [/look no further/i, 'look no further'], [/unlock(s|ing)? the (power|potential|secrets?)/i, 'figurative unlock'], [/\belevat(e|es|ed|ing)\b/i, 'elevate'],
  [/\bseamless(ly)?\b/i, 'seamless'], [/\brobust\b/i, 'robust'], [/navigate the (complexities|world)/i, 'navigate the complexities'],
  [/a testament to/i, 'a testament to'], [/whether you'?re [^.]{1,60}? or /i, "whether you're X or Y"], [/in conclusion/i, 'in conclusion'],
  [/\bultimately\b/i, 'ultimately'], [/rest assured/i, 'rest assured'], [/game[- ]changer/i, 'game-changer'],
  [/comprehensive guide/i, 'comprehensive guide'], [/when it comes to/i, 'when it comes to'], [/\bclick here\b/i, 'click here'],
];
const REQUIRED_BOTS = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot'];

// ---------- Per-page checks ----------
const allParas = []; // { url, text, sh }
const allFaqs = []; // { url, q, sig }
const linkGraph = new Map();
let peaceCount = 0;
const MAX_CTX_LINKS = 5;
const ctxAnchors = []; // { url, href, text }
const topicOf = new Map(); // url -> significant words of the page's H1 + keyword
const report = [];

const htmlFiles = fs.readdirSync(DIST, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));
const builtUrls = new Set(htmlFiles.map((f) => '/' + f.replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '/')).map((u) => u.replace(/\/\/$/, '/')));

for (const f of htmlFiles) {
  const url = ('/' + f.replace(/\\/g, '/').replace(/index\.html$/, '')).replace(/\/\/$/, '/');
  const root = parseHtml(fs.readFileSync(path.join(DIST, f), 'utf8'));
  const main = root.querySelector('main');
  const links = new Set(root.querySelectorAll('a[href^="/"]').map((a) => a.getAttribute('href').split('#')[0]));
  linkGraph.set(url, links);

  // Broken links (whole page)
  for (const href of links) {
    if (!href) continue;
    if (/\.(xml|txt|svg|png|ico|woff2)$/.test(href)) { if (!fs.existsSync(path.join(DIST, href))) err(url, `broken link ${href}`); continue; }
    if (!href.endsWith('/')) err(url, `internal link without trailing slash: ${href}`);
    if (!builtUrls.has(href)) err(url, `broken internal link ${href}`);
  }

  // Dashes + banned words across visible main text and meta
  const title = root.querySelector('title')?.textContent ?? '';
  const desc = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const mainText = main ? visibleText(main) : '';
  const scan = `${title} ${desc} ${mainText}`;
  if (/[—]/.test(scan)) err(url, 'em dash found');
  if (/[–]/.test(scan)) err(url, 'en dash found');
  for (const [re, name] of BANNED) if (re.test(scan)) err(url, `banned phrase: "${name}" -> ${scan.match(re)[0]}`);
  peaceCount += (lower(scan).match(/peace of mind/g) || []).length;

  // JSON-LD
  const ld = root.querySelectorAll('script[type="application/ld+json"]');
  const types = new Set();
  for (const s of ld) {
    try {
      const j = JSON.parse(s.textContent);
      const str = JSON.stringify(j);
      if (/:""/.test(str)) err(url, 'JSON-LD contains an empty string value');
      for (const n of j['@graph'] ?? [j]) types.add(n['@type']);
      for (const n of j['@graph'] ?? []) {
        if (n['@type'] === 'FAQPage' && !(n.mainEntity?.length > 0)) err(url, 'FAQPage without questions');
        if (n['@type'] === 'BreadcrumbList' && !(n.itemListElement?.length > 1)) err(url, 'BreadcrumbList too short');
        if (n['@type'] === 'AggregateRating' || n['@type'] === 'Review') err(url, 'review/rating schema is not allowed');
      }
    } catch (e) { err(url, `invalid JSON-LD: ${e.message}`); }
  }
  for (const t of ['Organization', 'WebSite', 'Locksmith']) if (!types.has(t)) err(url, `missing ${t} schema`);

  const meta = pages.find((p) => p.url === url);
  if (!meta) continue; // 404 etc.
  const fm = meta.fm;

  // Title/meta lengths
  if (title.length < 30 || title.length > 65) (meta.kind === 'legal' ? warn : err)(url, `title length ${title.length} (target 50-60): "${title}"`);
  else if (title.length < 50 || title.length > 60) warn(url, `title length ${title.length} (target 50-60)`);
  if (desc.length < 130 || desc.length > 165) err(url, `meta description length ${desc.length} (target 140-160)`);
  else if (desc.length < 140 || desc.length > 160) warn(url, `meta description length ${desc.length} (target 140-160)`);

  // Headings
  const h1s = root.querySelectorAll('h1');
  if (h1s.length !== 1) err(url, `${h1s.length} H1 elements`);
  let prev = 1;
  for (const h of main.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const lv = Number(h.tagName[1]);
    if (lv > prev + 1) err(url, `heading level skip: h${prev} -> h${lv} ("${norm(h.textContent).slice(0, 50)}")`);
    prev = lv;
  }
  if (!types.has('WebPage')) err(url, 'missing WebPage schema');
  if (url !== '/' && !types.has('BreadcrumbList')) err(url, 'missing BreadcrumbList schema');
  if (meta.kind === 'legal') continue;

  // Keyword rules
  const kw = fm.keyword;
  const body = root.querySelector('[data-body]');
  const bodyText = body ? visibleText(body) : '';
  const intro = root.querySelector('[data-intro]');
  const h1Text = norm(h1s[0]?.textContent ?? '');
  const kwBody = countExact(bodyText, kw);
  const wc = words(bodyText).length + words(intro ? intro.textContent : '').length;
  topicOf.set(url, `${h1Text} ${kw} ${fm.cardTitle ?? ''} ${fm.title ?? ''}`);
  if (!lower(h1Text).includes(lower(kw))) err(url, `H1 missing exact keyword "${kw}"`);
  if (kwBody < 5) err(url, `keyword "${kw}" appears ${kwBody}x in body (need 5+)`);
  if (wc && kwBody > Math.ceil(wc / 100)) warn(url, `keyword density high: ${kwBody} in ${wc} words`);
  if (!intro || countExact(intro.textContent, kw) < 1) err(url, 'keyword missing from answer-first intro');
  const h2s = body ? body.querySelectorAll('h2').map((h) => norm(h.textContent)) : [];
  if (!h2s.some((h) => countExact(h, kw) > 0)) err(url, 'keyword missing from every H2');
  if (countExact(title, kw) < 1) err(url, 'keyword missing from title tag');
  if (countExact(desc, kw) < 1) err(url, 'keyword missing from meta description');
  if (body && !body.querySelector('svg, table, .steps, .proc, .checklist, .flow, .svc-grid, .g-grid')) err(url, 'no visual element (svg/table/steps/checklist)');

  // Word counts
  const range = { service: [1000, 1800], guide: [1500, 2500] }[meta.kind];
  if (range && (wc < range[0] * 0.95 || wc > range[1] * 1.1)) warn(url, `word count ${wc} (target ${range[0]}-${range[1]})`);

  // Internal links in body
  // Contextual links = links inside the prose. Card grids, forms and CTA boxes are navigation, not context.
  const ctx = body ? body.querySelectorAll('a[href^="/"]').filter((a) => !a.closest('.svc-grid, .g-grid, form, .cta, .faq, nav')) : [];
  const bodyLinks = new Set(ctx.map((a) => a.getAttribute('href').split('#')[0]).filter((h) => h !== url));
  if (ctx.length > MAX_CTX_LINKS) err(url, `${ctx.length} contextual internal links in body (max ${MAX_CTX_LINKS})`);
  if (bodyLinks.size < 2) warn(url, `only ${bodyLinks.size} contextual internal links in body (aim for 3-${MAX_CTX_LINKS})`);
  if (bodyLinks.size < ctx.length) err(url, 'the same page is linked more than once in the body');
  for (const a of ctx) ctxAnchors.push({ url, href: a.getAttribute('href').split('#')[0], text: norm(a.textContent) });
  const anchors = body ? body.querySelectorAll('a').map((a) => lower(a.textContent)) : [];
  for (const a of anchors) if (/^(here|read more|learn more|this page|this)$/.test(a)) err(url, `weak anchor text "${a}"`);

  // FAQ
  const faqItems = root.querySelectorAll('.faq details');
  if (faqItems.length < 10 || faqItems.length > 15) err(url, `${faqItems.length} FAQs (need 10-15)`);
  for (const d of faqItems) {
    const q = norm(d.querySelector('summary')?.textContent ?? '');
    const a = norm(d.querySelector('p')?.textContent ?? '');
    const sentences = a.split(/(?<=[.!?])\s+/).filter(Boolean).length;
    if (sentences > 3) warn(url, `FAQ answer has ${sentences} sentences: "${q}"`);
    allFaqs.push({ url, q, sig: sig(q) });
  }

  // Paragraphs (for duplicate detection) + style checks
  if (body) {
    // Navigation cards (.svc-grid/.g-grid) repeat their blurbs by design; skip them.
    for (const p of body.querySelectorAll('p').filter((el) => !el.closest('.svc-grid, .g-grid, .proc'))) {
      const t = norm(p.textContent);
      if (t.length < 60) continue;
      allParas.push({ url, text: t, sh: shingles(t) });
      if (words(t).length > 75) warn(url, `long paragraph (${words(t).length} words): "${t.slice(0, 60)}..."`);
      if (/\?[^?]{0,140}\?/.test(t) && (t.match(/\?/g) || []).length >= 2) warn(url, `possible stacked rhetorical questions: "${t.slice(0, 70)}..."`);
    }
  }
  report.push({ url, kw, kwBody, wc, links: bodyLinks.size, faqs: faqItems.length, title: title.length, desc: desc.length });
}

// ---------- Cross-page checks ----------
if (peaceCount > 1) errors.push(`site: "peace of mind" used ${peaceCount}x (max 1)`);

for (let i = 0; i < allParas.length; i++) {
  for (let j = i + 1; j < allParas.length; j++) {
    const a = allParas[i], b = allParas[j];
    if (a.url === b.url) continue;
    if (a.text === b.text) { errors.push(`duplicate paragraph on ${a.url} and ${b.url}: "${a.text.slice(0, 70)}..."`); continue; }
    const s = jaccard(a.sh, b.sh);
    if (s > 0.35) errors.push(`near-duplicate paragraph (${s.toFixed(2)}) ${a.url} / ${b.url}: "${a.text.slice(0, 60)}..."`);
  }
}
for (let i = 0; i < allFaqs.length; i++) {
  for (let j = i + 1; j < allFaqs.length; j++) {
    const a = allFaqs[i], b = allFaqs[j];
    if (lower(a.q) === lower(b.q)) { errors.push(`duplicate FAQ "${a.q}" on ${a.url} and ${b.url}`); continue; }
    const s = jaccard(a.sig, b.sig);
    if (s >= 0.75 && a.sig.size > 2) errors.push(`near-duplicate FAQ (${s.toFixed(2)}): "${a.q}" (${a.url}) vs "${b.q}" (${b.url})`);
    else if (s >= 0.6 && a.sig.size > 2) warnings.push(`similar FAQ (${s.toFixed(2)}): "${a.q}" (${a.url}) vs "${b.q}" (${b.url})`);
  }
}
// Anchor relevance: the linked phrase must share a topic word with the page it points to.
const GENERIC = new Set(['deadbolt', 'deadbolts', 'lock', 'locks', 'locksmith', 'our', 'we', 'us', 'guide', 'page', 'service', 'services', 'here', 'more']);
const SYN = { business: 'commercial', businesses: 'commercial', office: 'commercial', contact: 'contact', message: 'contact', reach: 'contact', call: 'contact', touch: 'contact' };
const stem = (w) => SYN[w] ?? w.replace(/ment$/, '').replace(/(ing|ed|es|s|e)$/, '');
const topicSet = (s) => new Set([...sig(s)].filter((w) => !GENERIC.has(w)).map(stem));
for (const a of ctxAnchors) {
  const HUB = { '/services/': /servic/i, '/deadbolt-guides/': /guides?/i, '/service-areas/': /areas?/i };
  if (HUB[a.href]) { if (!HUB[a.href].test(a.text)) errors.push(`${a.url}: anchor "${a.text}" does not describe its target ${a.href}`); continue; }
  const topic = topicOf.get(a.href);
  if (!topic) continue;
  const aw = topicSet(a.text), tw = topicSet(topic);
  if (![...aw].some((w) => tw.has(w))) errors.push(`${a.url}: anchor "${a.text}" does not describe its target ${a.href}`);
}

// Unique keywords
const kwSeen = new Map();
for (const p of pages) if (p.fm.keyword) { const k = lower(p.fm.keyword); if (kwSeen.has(k)) errors.push(`keyword "${k}" owned by ${kwSeen.get(k)} and ${p.url}`); kwSeen.set(k, p.url); }

// Click depth
const depth = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) { const u = queue.shift(); for (const l of linkGraph.get(u) ?? []) if (!depth.has(l) && builtUrls.has(l)) { depth.set(l, depth.get(u) + 1); queue.push(l); } }
for (const p of pages) { const d = depth.get(p.url); if (d === undefined) errors.push(`${p.url}: not reachable from home`); else if (d > 3) errors.push(`${p.url}: click depth ${d}`); }

// related.ts slugs
const relSrc = fs.readFileSync(path.join(ROOT, 'src', 'data', 'related.ts'), 'utf8');
const slugs = new Set(pages.filter((p) => p.kind === 'service' || p.kind === 'guide').map((p) => p.slug));
for (const m of relSrc.matchAll(/'([a-z0-9-]+)'/g)) if (!slugs.has(m[1]) && !relSrc.includes(`'${m[1]}': {`) ) errors.push(`related.ts references unknown slug "${m[1]}"`);
for (const s of slugs) if (!relSrc.includes(`'${s}': {`)) errors.push(`related.ts has no entry for "${s}"`);

// sitemap / robots / llms
const smFile = fs.readdirSync(DIST).find((f) => /^sitemap-\d+\.xml$/.test(f));
const sm = smFile ? fs.readFileSync(path.join(DIST, smFile), 'utf8') : '';
for (const p of pages) if (!sm.includes(`${p.url}</loc>`)) errors.push(`sitemap missing ${p.url}`);
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
for (const b of REQUIRED_BOTS) if (!new RegExp(`User-agent: ${b}\\nAllow: /`).test(robots)) errors.push(`robots.txt does not allow ${b}`);
if (/Disallow: \/\s*$/m.test(robots)) errors.push('robots.txt disallows the whole site');
if (!/Sitemap: /.test(robots)) errors.push('robots.txt has no Sitemap line');
const llms = fs.readFileSync(path.join(DIST, 'llms.txt'), 'utf8');
for (const p of pages) if (p.kind !== 'legal' && !llms.includes(`${p.url})`)) errors.push(`llms.txt missing ${p.url}`);

// Photo sources must be optimized (owner rule): nothing over 300 KB in src/assets/photos
const photoDir = path.join(ROOT, 'src', 'assets', 'photos');
if (fs.existsSync(photoDir)) for (const f of fs.readdirSync(photoDir)) {
  const kb = fs.statSync(path.join(photoDir, f)).size / 1024;
  if (kb > 300) errors.push(`photo src/assets/photos/${f} is ${Math.round(kb)} KB (max 300 KB): recompress it`);
  if (/\.png$/i.test(f)) warnings.push(`photo src/assets/photos/${f} is a PNG: convert photos to JPG`);
}

// ---------- FAQ register ----------
const byPage = new Map();
for (const f of allFaqs) { if (!byPage.has(f.url)) byPage.set(f.url, []); byPage.get(f.url).push(f.q); }
let reg = '# FAQ Register\n\nGenerated by `npm run qa`. Every FAQ question used on the site, by page. New FAQs must not repeat or closely reword any question below.\n\n';
reg += `Total questions: ${allFaqs.length}\n\n`;
for (const [u, qs] of [...byPage.entries()].sort()) reg += `## ${u}\n\n${qs.map((q) => `- ${q}`).join('\n')}\n\n`;
fs.writeFileSync(path.join(ROOT, 'docs', 'FAQ-REGISTER.md'), reg);

// ---------- Output ----------
console.log('\nPAGE REPORT');
console.table(report.map((r) => ({ url: r.url, keyword: r.kw, 'kw#': r.kwBody, words: r.wc, links: r.links, faqs: r.faqs, title: r.title, meta: r.desc })));
if (warnings.length) { console.log(`\nWARNINGS (${warnings.length})`); warnings.forEach((w) => console.log('  ! ' + w)); }
if (errors.length) { console.log(`\nERRORS (${errors.length})`); errors.forEach((e) => console.log('  x ' + e)); }
console.log(`\n${errors.length ? 'QA FAILED' : 'QA PASSED'}: ${report.length} pages checked, ${allFaqs.length} FAQs, ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
