/**
 * Mobile Lighthouse on home, one service page and one guide.
 *   npm run build && npm run preview   (in another terminal; default http://localhost:4321)
 *   npm run lighthouse [baseUrl]
 * Fails (exit 1) if any category is under 95. Reports saved to lighthouse-reports/.
 */
import fs from 'node:fs';
// Lighthouse's canonical audit uses URL.parse (Node 22+); polyfill for Node 20.
if (typeof URL.parse !== 'function') URL.parse = (u, b) => { try { return new URL(u, b); } catch { return null; } };
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const base = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');
const pages = ['/', '/deadbolt-lock-installation/', '/deadbolt-grades-ansi-bhma/'];
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
fs.mkdirSync('lighthouse-reports', { recursive: true });
let fail = false;
const rows = [];
for (const p of pages) {
  const r = await lighthouse(base + p, { port: chrome.port, output: 'html', logLevel: 'error', formFactor: 'mobile', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const c = r.lhr.categories;
  const a = r.lhr.audits;
  const row = {
    page: p,
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    LCP: a['largest-contentful-paint'].displayValue,
    CLS: a['cumulative-layout-shift'].displayValue,
    TBT: a['total-blocking-time'].displayValue,
    weight: a['total-byte-weight'].displayValue,
  };
  rows.push(row);
  if ([row.perf, row.a11y, row.bp, row.seo].some((s) => s < 95)) {
    fail = true;
    const failed = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable').map((x) => `${x.id}: ${x.title}`);
    console.log(`\n${p} audits below 0.9:\n  ` + failed.join('\n  '));
  }
  fs.writeFileSync(`lighthouse-reports/${p.replace(/\//g, '_') || 'home'}.html`, r.report);
}
await chrome.kill();
console.table(rows);
process.exit(fail ? 1 : 0);
