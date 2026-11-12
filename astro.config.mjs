import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeTableWrap from './src/lib/rehype-table-wrap.mjs';

const SITE = (process.env.SITE_URL || 'https://deadboltfixers.com').replace(/\/$/, '');

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
      filter: (page) => !page.includes('/404'),
    }),
  ],
  markdown: {
    smartypants: false,
    rehypePlugins: [rehypeTableWrap],
  },
  prefetch: false,
});
