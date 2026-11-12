# Deadbolt Nation Locksmiths: website

Static marketing website for **Deadbolt Nation Locksmiths**, a US locksmith company that works only on deadbolt locks. Built with [Astro](https://astro.build) (static output, almost no JavaScript), MDX content collections and hand-written CSS.

- Production domain (planned): `https://deadboltnation.com`
- Staging (Hostinger temporary domain): `https://lavenderblush-alligator-506840.hostingersite.com` (built with `noindex`)

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs static site to dist/
npm run preview      # serves dist/ locally
npm run qa           # content + SEO checks over dist/ (run after build)
npm run lighthouse   # mobile Lighthouse on 3 pages (needs `npm run preview` running)
node scripts/lint-content.mjs --all   # fast source-level content lint, no build needed
```

Requires Node 20+. Lighthouse and screenshot scripts use the local Google Chrome install.

## Where to add phone, email and address

Everything lives in **`src/config/site.ts`**. Each empty field has a `TODO(business)` comment.

| Field | Format | Where it appears once filled |
|---|---|---|
| `phone` + `phoneDisplay` | `+15125550123` and `(512) 555-0123` | Header "Call Now", mobile sticky bar, CTAs, sidebar, footer, contact page, JSON-LD `telephone` |
| `email` | `service@deadboltnation.com` | Footer, contact page, sidebar, JSON-LD |
| `address` | object with street, city, state, ZIP | Footer, contact page, JSON-LD `PostalAddress` |
| `hours` / `hoursDisplay` | `["Mo-Fr 08:00-18:00"]` / `Mon-Fri 8am-6pm` | Footer, contact block, JSON-LD `openingHours` |
| `social` | `{ facebook: "https://..." }` | JSON-LD `sameAs` |
| `formEndpoint` | Formspree/Basin/serverless URL | Contact form submits here (FormData via fetch) |
| `legalName` | registered entity name | Footer copyright, JSON-LD |
| `baseUrl` | canonical domain | Canonicals, sitemap, schema (or set `SITE_URL` env var at build) |

Empty values are never rendered: buttons, lines and schema properties simply disappear. Never put placeholder numbers in this file.

Other business facts (years in business, licenses, insurance, team) have `TODO(business)` comments in `src/content/pages/about.mdx`. Add them only once verified.

## Project structure

```
docs/                    Content guide, keyword map, research, FAQ register, architecture
public/                  Fonts (self-hosted WOFF2), favicon, OG image, .htaccess
scripts/                 qa.mjs, lint-content.mjs, lighthouse.mjs, shot.mjs, make-images.mjs
src/config/site.ts       Company config (contact details live here)
src/content/             MDX pages: services/, guides/, pages/, legal/, areas/
src/content.config.ts    Frontmatter schemas (build fails on missing SEO fields)
src/data/related.ts      Curated sidebar relationships
src/components/          Header, Footer, Sidebar, Faq, Cta, ContactForm, graphics/ (SVG diagrams)
src/layouts/             BaseLayout (head, schema), PageLayout (breadcrumbs + sidebar), LegalLayout
src/lib/                 schema.ts (JSON-LD), urls.ts (URL + breadcrumb logic)
src/pages/               Routes, robots.txt.ts, llms.txt.ts
```

## How to add a new page

Read **`docs/CONTENT-GUIDE.md`** first (voice, structure, keyword rules, banned words, FAQ rules). Then:

1. Claim the keyword in `docs/KEYWORD-MAP.md`.
2. Create the MDX file:
   - Service: `src/content/services/{slug}.mdx` → `/{slug}/`
   - Guide: `src/content/guides/{slug}.mdx` → `/deadbolt-guides/{slug}/`
   - City page: `src/content/areas/{state}/{city}.mdx` → `/service-areas/{state}/{city}/`
3. Fill in the frontmatter (copy an existing page; the schema in `src/content.config.ts` validates it, including 10-15 FAQs and the keyword in the H1).
4. Add the page to `src/data/related.ts` (its own entry and reciprocal entries).
5. Link to it from 2-4 related pages.
6. `node scripts/lint-content.mjs path/to/file.mdx`, then `npm run build && npm run qa`.

Navigation, footer, hub cards, sitemap, `llms.txt` and JSON-LD update automatically.

## Deploy

### Vercel
1. Import the GitHub repo in Vercel. Framework preset: **Astro**. Build command `npm run build`, output `dist`.
2. Add the environment variable `SITE_URL=https://deadboltnation.com` (optional; that is the default).
3. Add the domain in Vercel and point DNS at it. `vercel.json` sets trailing slashes and cache headers.

### Hostinger (static hosting, current staging)
1. Build for the target domain:
   ```bash
   SITE_URL=https://your-domain NOINDEX=1 npm run build   # drop NOINDEX=1 for the real launch
   ```
2. Zip the **contents** of `dist/` (including `.htaccess`) and deploy it with hPanel's file manager (extract into `public_html`) or the Hostinger API/MCP static-site deploy, which replaces the site root.
3. `public/.htaccess` handles HTTPS, www removal, trailing slashes, the 404 page, compression and caching.

### Going live on the real domain
- Build without `NOINDEX=1` and with `SITE_URL` set to the real domain.
- Submit `https://deadboltnation.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.

## Quality gates

`npm run qa` checks every built page for: one H1 with the exact keyword, 5+ exact keyword uses in body, keyword in intro/H2/title/meta, 10-15 FAQs, 4+ body links, title and meta lengths, heading order, banned phrases and dashes, duplicate or near-duplicate paragraphs and FAQs across pages, JSON-LD validity, broken links, click depth, sitemap, robots.txt and llms.txt coverage. It also regenerates `docs/FAQ-REGISTER.md`.

## Content sources

All technical facts come from `docs/RESEARCH.md` (standards bodies, codes, manufacturer documentation, consumer agencies), and each page lists its sources in frontmatter. Do not add facts that are not traceable to a reliable source.
