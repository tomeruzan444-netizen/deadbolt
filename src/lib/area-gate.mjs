/**
 * Single publishing gate for state and city pages (src/content/areas).
 * Used by the Astro routes, astro.config (sitemap), scripts/qa.mjs and scripts/areas-status.mjs,
 * so a page is either live everywhere or nowhere.
 *
 * A page is live when `draft: false` AND `publishOn` is today or earlier (UTC, at build time).
 * Pages go live gradually: set publishOn dates in batches, then rebuild + deploy on/after each date.
 * AREAS_PREVIEW=1 builds drafts and future pages too (with noindex) for local review only.
 */

export const PREVIEW = process.env.AREAS_PREVIEW === '1';

const today = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');

/** @param {{ draft?: boolean, publishOn?: string | Date }} fm */
export function isLive(fm) {
  if (!fm || fm.draft !== false || !fm.publishOn) return false;
  return new Date(fm.publishOn) <= today();
}

/** Built at all (live, or any page in preview mode). */
export const isBuilt = (fm) => PREVIEW || isLive(fm);

/** @returns {'draft' | 'scheduled' | 'live'} */
export function areaStatus(fm) {
  if (!fm || fm.draft !== false) return 'draft';
  return isLive(fm) ? 'live' : 'scheduled';
}
