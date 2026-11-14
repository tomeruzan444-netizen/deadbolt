/**
 * Publishing status of every state and city page.
 *   npm run areas        -> table of draft / scheduled / live pages, next publish dates
 * The gate itself lives in src/lib/area-gate.mjs. A scheduled page goes live on the first
 * build + deploy on or after its publishOn date.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { areaStatus } from '../src/lib/area-gate.mjs';

const DIR = path.join('src', 'content', 'areas');
const rows = [];
if (fs.existsSync(DIR)) {
  for (const f of fs.readdirSync(DIR, { recursive: true }).map(String)) {
    if (!f.endsWith('.mdx')) continue;
    const m = fs.readFileSync(path.join(DIR, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = m ? YAML.parse(m[1]) : {};
    const slug = f.replace(/\\/g, '/').replace(/\.mdx$/, '');
    rows.push({ url: `/service-areas/${slug}/`, kind: fm.kind, status: areaStatus(fm), publishOn: fm.publishOn ? String(fm.publishOn).slice(0, 10) : '', facts: (fm.localFacts ?? []).length });
  }
}
rows.sort((a, b) => a.url.localeCompare(b.url));
if (!rows.length) { console.log('No area pages yet. Add src/content/areas/{state}.mdx (see docs/CONTENT-GUIDE.md, "Service area pages").'); process.exit(0); }
console.table(rows);
const count = (s) => rows.filter((r) => r.status === s).length;
console.log(`live ${count('live')} · scheduled ${count('scheduled')} · draft ${count('draft')}`);
const next = rows.filter((r) => r.status === 'scheduled').map((r) => r.publishOn).sort()[0];
if (next) console.log(`Next scheduled publish: ${next} (rebuild + deploy + npm run indexnow on or after that date)`);
