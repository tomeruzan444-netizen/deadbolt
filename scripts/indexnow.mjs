/**
 * Submit every URL in the built sitemap to IndexNow (Bing, Yandex, Seznam, Naver...).
 * Run after a production deploy:  npm run build && <deploy> && npm run indexnow
 * The key file public/<key>.txt must be live at https://deadboltfixers.com/<key>.txt.
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = '56f8a12f7dfcdc3f1d2e49b0a8cdf240';
const HOST = 'deadboltfixers.com';
const dist = path.resolve('dist');
const smFile = fs.readdirSync(dist).find((f) => /^sitemap-\d+\.xml$/.test(f));
const urls = [...fs.readFileSync(path.join(dist, smFile), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.every((u) => u.startsWith('https://' + HOST + '/'))) throw new Error('sitemap is not a production build (wrong host)');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URLs`);
if (res.status >= 400) { console.log(await res.text()); process.exit(1); }
