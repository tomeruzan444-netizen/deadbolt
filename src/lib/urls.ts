/** Single place that maps content entries to URLs and logical breadcrumb parents. */

export type Crumb = { name: string; url: string };

export const HOME: Crumb = { name: 'Home', url: '/' };
export const SERVICES_HUB: Crumb = { name: 'Services', url: '/services/' };
export const GUIDES_HUB: Crumb = { name: 'Deadbolt Guides', url: '/deadbolt-guides/' };

export const serviceUrl = (slug: string) => `/${slug}/`;
/** Flat URLs: every service and guide sits directly under the domain (owner decision 2026-11-14). */
export const guideUrl = (slug: string) => `/${slug}/`;

/** Maps a slug from related.ts to a URL, regardless of collection. */
export const slugUrl = (slug: string, kind: 'service' | 'guide') =>
  kind === 'service' ? serviceUrl(slug) : guideUrl(slug);

export const serviceCrumbs = (title: string, slug: string): Crumb[] => [
  HOME,
  SERVICES_HUB,
  { name: title, url: serviceUrl(slug) },
];

export const guideCrumbs = (title: string, slug: string): Crumb[] => [
  HOME,
  GUIDES_HUB,
  { name: title, url: guideUrl(slug) },
];

export const simpleCrumbs = (title: string, url: string): Crumb[] => [HOME, { name: title, url }];
