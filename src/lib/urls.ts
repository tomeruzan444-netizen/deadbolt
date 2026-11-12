/** Single place that maps content entries to URLs and logical breadcrumb parents. */

export type Crumb = { name: string; url: string };

export const HOME: Crumb = { name: 'Home', url: '/' };
export const SERVICES_HUB: Crumb = { name: 'Services', url: '/services/' };
export const GUIDES_HUB: Crumb = { name: 'Deadbolt Guides', url: '/deadbolt-guides/' };
export const AREAS_HUB: Crumb = { name: 'Service Areas', url: '/service-areas/' };

export const serviceUrl = (slug: string) => `/${slug}/`;
export const guideUrl = (slug: string) => `/deadbolt-guides/${slug}/`;
export const areaUrl = (state: string, city?: string) =>
  city ? `/service-areas/${state}/${city}/` : `/service-areas/${state}/`;

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
