/**
 * Fast source-level content linter (no build needed).
 *   node scripts/lint-content.mjs src/content/services/deadbolt-rekeying.mdx [...more files]
 *   node scripts/lint-content.mjs --all
 * Approximates the rules in docs/CONTENT-GUIDE.md. The authoritative check is `npm run build && npm run qa`.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const args = process.argv.slice(2);
const CONTENT = 'src/content';
const allFiles = ['services', 'guides', 'pages']
  .flatMap((d) => (fs.existsSync(path.join(CONTENT, d)) ? fs.readdirSync(path.join(CONTENT, d), { recursive: true }).map((f) => path.join(CONTENT, d, String(f))) : []))
  .filter((f) => f.endsWith('.mdx')).map((f) => path.normalize(f));
const files = args.includes('--all') ? allFiles : args.map((f) => path.normalize(f));

const parse = (file) => {
  const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return { fm: m ? YAML.parse(m[1]) : {}, body: m ? m[2] : src };
};
const norm = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').toLowerCase();
const countExact = (text, kw) => {
  const re = new RegExp(`(?<![a-z0-9])${norm(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'g');
  return (norm(text).match(re) || []).length;
};
const STOP = new Set('a an the of to in on for and or is are do does can i my you your it its with without what how when why which should will be by from at this that than vs if much long get'.split(' '));
const sig = (s) => new Set(norm(s).replace(/[^a-z0-9' ]/g, ' ').split(' ').filter((w) => w && !STOP.has(w)));
const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };

const BANNED = [
  /\bdelve/i, /in today'?s (fast-paced )?world/i, /it'?s important to note/i, /look no further/i, /unlock(s|ing)? the (power|potential|secrets?)/i,
  /\belevat(e|es|ed|ing)\b/i, /\bseamless(ly)?\b/i, /\brobust\b/i, /navigate the (complexities|world)/i, /a testament to/i,
  /whether you'?re [^.\n]{1,60}? or /i, /in conclusion/i, /\bultimately\b/i, /rest assured/i, /game[- ]changer/i, /comprehensive guide/i,
  /when it comes to/i, /\bclick here\b/i, /peace of mind/i,
];

// All FAQs on the site, for duplicate checks
const siteFaqs = allFiles.flatMap((f) => (parse(f).fm.faqs ?? []).map((x) => ({ file: f, q: x.q, s: sig(x.q) })));

let fails = 0;
for (const file of files) {
  const { fm, body } = parse(file);
  const out = [];
  const bad = (m) => out.push('  x ' + m);
  const note = (m) => out.push('  ! ' + m);
  const kw = fm.keyword;
  const text = body
    .split('\n').filter((l) => !/^import /.test(l)).join('\n')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
  const prose = text.replace(/<[^>]+>/g, ' ').replace(/[#*_`>|]/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const words = prose.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  const kwN = countExact(prose, kw);
  const h2 = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const links = new Set([...text.matchAll(/\]\((\/[^)#\s]*)/g), ...text.matchAll(/href=["'](\/[^"'#]*)/g)].map((m) => m[1]));
  const seg = path.normalize(file).split(path.sep);
  const kind = seg.includes('services') ? 'service' : seg.includes('guides') ? 'guide' : 'page';

  if (!kw) bad('no keyword in frontmatter');
  if (fm.h1 && !norm(fm.h1).includes(norm(kw))) bad(`H1 missing keyword: "${fm.h1}"`);
  if (kwN < 5) bad(`keyword "${kw}" in body ${kwN}x (need 5+, FAQ/intro not counted)`);
  if (kwN > Math.ceil(words / 100)) note(`keyword density high (${kwN} in ~${words} words)`);
  if (!fm.intro || countExact(fm.intro, kw) < 1) bad('keyword missing from intro');
  if (!h2.some((h) => countExact(h, kw) > 0)) bad('keyword missing from all H2s');
  if (!fm.metaTitle || countExact(fm.metaTitle, kw) < 1) bad('keyword missing from metaTitle');
  if (!fm.metaDescription || countExact(fm.metaDescription, kw) < 1) bad('keyword missing from metaDescription');
  if (fm.metaTitle && (fm.metaTitle.length < 50 || fm.metaTitle.length > 60)) bad(`metaTitle ${fm.metaTitle.length} chars (50-60)`);
  if (fm.metaDescription && (fm.metaDescription.length < 140 || fm.metaDescription.length > 160)) bad(`metaDescription ${fm.metaDescription.length} chars (140-160)`);
  const nf = (fm.faqs ?? []).length;
  if (nf < 10 || nf > 15) bad(`${nf} FAQs (need 10-15)`);
  for (const f of fm.faqs ?? []) if (f.a.split(/(?<=[.!?])\s+/).length > 3) note(`FAQ answer over 3 sentences: "${f.q}"`);
  const mdLinks = [...text.matchAll(/\]\((\/[^)#\s]*)/g)].length;
  if (mdLinks > 5) bad(`${mdLinks} contextual internal links in body (max 5)`);
  for (const l of links) if (!l.endsWith('/')) bad(`link without trailing slash: ${l}`);
  if (!/<(svg|[A-Z]\w+)|\n\|.+\|\n/.test(text)) bad('no visual (component, svg or table)');
  const range = { service: [1000, 1800], guide: [1500, 2500] }[kind];
  if (range && (words < range[0] || words > range[1] * 1.1)) note(`~${words} body words (target ${range[0]}-${range[1]})`);
  const raw = fs.readFileSync(file, 'utf8');
  if (/—/.test(raw)) bad('em dash present');
  if (/–/.test(raw)) bad('en dash present');
  for (const re of BANNED) { const m = raw.match(re); if (m) bad(`banned phrase: "${m[0]}"`); }
  for (const p of text.split(/\n\s*\n/).filter((p) => !/^\s*([-*]|\d+\.|\||<|#)/.test(p))) { const w = p.split(/\s+/).filter(Boolean).length; if (w > 75) note(`long paragraph (${w} words): "${p.trim().slice(0, 50)}..."`); }
  for (const f of fm.faqs ?? []) {
    const s = sig(f.q);
    for (const o of siteFaqs) {
      if (o.file === file) continue;
      const j = jac(s, o.s);
      if (norm(o.q) === norm(f.q) || (j >= 0.75 && s.size > 2)) bad(`FAQ duplicates ${path.basename(o.file)}: "${f.q}" ~ "${o.q}"`);
      else if (j >= 0.6 && s.size > 2) note(`FAQ similar to ${path.basename(o.file)}: "${f.q}" ~ "${o.q}"`);
    }
  }
  const failed = out.some((l) => l.startsWith('  x'));
  if (failed) fails++;
  console.log(`${failed ? 'FAIL' : 'ok  '} ${file}  [kw ${kwN}x, ~${words} words, ${links.size} links, ${nf} FAQs]`);
  out.forEach((l) => console.log(l));
}
process.exit(fails ? 1 : 0);
