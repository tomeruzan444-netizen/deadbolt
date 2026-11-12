/** JSON-LD builders. All entities are emitted in one @graph per page with stable @ids. */
import { site, hasPhone, hasEmail, hasAddress, absUrl } from '../config/site';
import type { Crumb } from './urls';

type Json = Record<string, unknown>;

const ORG_ID = `${site.baseUrl}/#organization`;
const WEBSITE_ID = `${site.baseUrl}/#website`;
const LOCKSMITH_ID = `${site.baseUrl}/#locksmith`;

const US = { '@type': 'Country', name: 'United States' };

function contactProps(): Json {
  const p: Json = {};
  if (hasPhone()) p.telephone = site.phone;
  if (hasEmail()) p.email = site.email;
  if (hasAddress() && site.address) p.address = { '@type': 'PostalAddress', ...site.address };
  return p;
}

export function organization(): Json {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    ...(site.legalName ? { legalName: site.legalName } : {}),
    url: `${site.baseUrl}/`,
    logo: { '@type': 'ImageObject', url: absUrl('/logo.png'), width: 512, height: 512 },
    description: site.description,
    founder: site.founders.map((f) => ({ '@type': 'Person', name: f.name, jobTitle: f.role, worksFor: { '@id': ORG_ID } })),
    knowsAbout: ['Deadbolt locks', 'Deadbolt installation', 'Deadbolt repair', 'Deadbolt rekeying', 'ANSI/BHMA A156.40', 'UL 437'],
    ...(sameAs.length ? { sameAs } : {}),
    ...contactProps(),
  };
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${site.baseUrl}/`,
    name: site.name,
    inLanguage: site.locale,
    publisher: { '@id': ORG_ID },
  };
}

export function locksmith(): Json {
  const node: Json = {
    '@type': 'Locksmith',
    '@id': LOCKSMITH_ID,
    name: site.name,
    url: `${site.baseUrl}/`,
    image: absUrl(site.ogImage),
    description: site.description,
    areaServed: US,
    parentOrganization: { '@id': ORG_ID },
    knowsAbout: [
      'Deadbolt lock installation',
      'Deadbolt lock repair',
      'Deadbolt rekeying',
      'Smart deadbolts',
      'High security deadbolts',
      'ANSI/BHMA A156.40',
    ],
    ...contactProps(),
  };
  if (site.hours.length) node.openingHours = site.hours;
  return node;
}

export function webPage(opts: { url: string; name: string; description: string; crumbs?: Crumb[]; dateModified?: Date }): Json {
  const full = absUrl(opts.url);
  return {
    '@type': 'WebPage',
    '@id': `${full}#webpage`,
    url: full,
    name: opts.name,
    description: opts.description,
    inLanguage: site.locale,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': LOCKSMITH_ID },
    ...(opts.crumbs && opts.crumbs.length > 1 ? { breadcrumb: { '@id': `${full}#breadcrumb` } } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified.toISOString().slice(0, 10) } : {}),
  };
}

export function breadcrumbs(url: string, crumbs: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absUrl(url)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.url),
    })),
  };
}

export function faqPage(url: string, faqs: { q: string; a: string }[]): Json {
  return {
    '@type': 'FAQPage',
    '@id': `${absUrl(url)}#faq`,
    isPartOf: { '@id': `${absUrl(url)}#webpage` },
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function service(opts: { url: string; name: string; description: string; areaServed?: Json }): Json {
  return {
    '@type': 'Service',
    '@id': `${absUrl(opts.url)}#service`,
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: absUrl(opts.url),
    provider: { '@id': LOCKSMITH_ID },
    areaServed: opts.areaServed ?? US,
    category: 'Locksmith services',
  };
}

export function article(opts: {
  url: string;
  headline: string;
  description: string;
  published: Date;
  modified: Date;
}): Json {
  return {
    '@type': 'Article',
    '@id': `${absUrl(opts.url)}#article`,
    headline: opts.headline.slice(0, 110),
    description: opts.description,
    mainEntityOfPage: { '@id': `${absUrl(opts.url)}#webpage` },
    datePublished: opts.published.toISOString().slice(0, 10),
    dateModified: opts.modified.toISOString().slice(0, 10),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    image: absUrl(site.ogImage),
    inLanguage: site.locale,
  };
}

export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}

export const siteWideNodes = () => [organization(), website(), locksmith()];
