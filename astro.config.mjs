import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import rehypeTableWrap from './src/lib/rehype-table-wrap.mjs';
import { isLive } from './src/lib/area-gate.mjs';

const SITE = (process.env.SITE_URL || 'https://deadboltfixers.com').replace(/\/$/, '');

/** Map every content URL to its frontmatter `updated` date, for sitemap <lastmod>. */
/** Area pages that are built only in AREAS_PREVIEW mode: never listed in the sitemap. */
const HIDDEN = new Set();
function lastmodMap() {
  const map = new Map();
  const dirs = { services: (s) => `/${s}/`, guides: (s) => `/deadbolt-guides/${s}/`, pages: (s) => (s === 'home' ? '/' : `/${s}/`), legal: (s) => `/${s}/`, areas: (s) => `/service-areas/${s}/` };
  for (const [dir, toUrl] of Object.entries(dirs)) {
    const base = path.join('src', 'content', dir);
    if (!fs.existsSync(base)) continue;
    for (const f of fs.readdirSync(base, { recursive: true }).map(String)) {
      if (!f.endsWith('.mdx')) continue;
      const m = fs.readFileSync(path.join(base, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const fm = m ? YAML.parse(m[1]) : {};
      const url = SITE + toUrl(f.replace(/\\/g, '/').replace(/\.mdx$/, ''));
      if (dir === 'areas' && !isLive(fm)) { HIDDEN.add(url); continue; }
      if (fm.updated) map.set(url, new Date(fm.updated).toISOString());
    }
  }
  return map;
}
const LASTMOD = lastmodMap();

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404') && !HIDDEN.has(page),
      serialize(item) {
        const lm = LASTMOD.get(item.url);
        if (lm) item.lastmod = lm;
        return item;
      },
    }),
  ],
  markdown: {
    smartypants: false,
    rehypePlugins: [rehypeTableWrap],
  },
  prefetch: false,
});
