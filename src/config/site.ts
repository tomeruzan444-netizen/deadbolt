/**
 * Central site configuration. Every component that shows contact details,
 * and every JSON-LD block, reads from here.
 *
 * Empty strings mean "not available yet": components hide the field and
 * schema omits the property. Never put placeholder or fake values here.
 */

export interface PostalAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string; // two-letter state code, e.g. "TX"
  postalCode: string;
  addressCountry: 'US';
}

export const site = {
  name: 'Deadbolt Fixers',
  shortName: 'Deadbolt Fixers',
  // TODO(business): registered legal entity name, e.g. "Deadbolt Fixers LLC".
  legalName: '',
  // Canonical base URL. Change here to move the whole site to another domain.
  // Can be overridden at build time with the SITE_URL environment variable
  // (used for the temporary staging domain).
  baseUrl: (process.env.SITE_URL || 'https://deadboltfixers.com').replace(/\/$/, ''),
  tagline: 'The deadbolt specialists',
  description:
    'Deadbolt Fixers works only on deadbolt locks: installation, repair, lockouts, rekeying, replacement, smart and high security deadbolts for homes and businesses across the United States.',

  // TODO(business): customer phone number in E.164 format, e.g. "+15125550123".
  phone: '',
  // TODO(business): human-readable phone, e.g. "(512) 555-0123". Leave empty if phone is empty.
  phoneDisplay: '',
  // TODO(business): public contact email, e.g. "service@deadboltfixers.com".
  email: '',
  // TODO(business): fill all fields of the business address, or leave as null.
  address: null as PostalAddress | null,
  // TODO(business): opening hours, e.g. ["Mo-Fr 08:00-18:00", "Sa 09:00-14:00"] (schema.org format).
  hours: [] as string[],
  // TODO(business): human-readable hours line for the footer, e.g. "Mon-Fri 8am-6pm".
  hoursDisplay: '',
  // TODO(business): full profile URLs, e.g. { facebook: "https://facebook.com/..." }.
  social: {} as Record<string, string>,
  // TODO(business): form backend URL (Formspree, Basin, a serverless function...).
  // While empty, the contact form validates but explains that online booking is not live yet.
  formEndpoint: '',

  locale: 'en-US',
  country: 'United States',
  ogImage: '/og-default.png',
  // Earliest content date, used as WebSite/Organization reference date.
  launched: '2026-11-12',
} as const;

export const hasPhone = () => site.phone.trim() !== '' && site.phoneDisplay.trim() !== '';
export const hasEmail = () => site.email.trim() !== '';
export const hasAddress = () =>
  !!site.address &&
  Object.values(site.address).every((v) => typeof v === 'string' && v.trim() !== '');
export const hasHours = () => site.hoursDisplay.trim() !== '';
export const hasAnyContact = () => hasPhone() || hasEmail() || hasAddress();
export const telHref = () => `tel:${site.phone}`;
export const mailHref = () => `mailto:${site.email}`;
export const absUrl = (path: string) => `${site.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
