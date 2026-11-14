/**
 * Curated sidebar relationships. Keys are page slugs (services, guides, or
 * special pages like "services-hub"). Order = relevance, most relevant first.
 * Rules (docs/CONTENT-GUIDE.md section 7): 4-6 services, 2-3 guides per entry.
 * `npm run qa` fails if any slug here does not exist.
 */
export type RelatedEntry = { services: string[]; guides: string[] };

export const related: Record<string, RelatedEntry> = {
  // ---------- Services ----------
  'deadbolt-lock-installation': {
    services: ['deadbolt-strike-plate-reinforcement', 'deadbolt-replacement', 'smart-deadbolt-installation', 'double-cylinder-deadbolt-installation', 'keyed-alike-deadbolts'],
    guides: ['deadbolt-installation-cost', 'types-of-deadbolts', 'deadbolt-grades-ansi-bhma'],
  },
  'deadbolt-lock-repair': {
    services: ['deadbolt-replacement', 'deadbolt-strike-plate-reinforcement', 'broken-key-in-deadbolt', 'deadbolt-rekeying', 'deadbolt-lockout-service'],
    guides: ['deadbolt-wont-lock', 'deadbolt-installation-cost'],
  },
  'deadbolt-lockout-service': {
    services: ['broken-key-in-deadbolt', 'deadbolt-rekeying', 'deadbolt-lock-repair', 'smart-deadbolt-installation', 'keyed-alike-deadbolts'],
    guides: ['deadbolt-wont-lock', 'deadbolt-installation-cost'],
  },
  'deadbolt-rekeying': {
    services: ['deadbolt-replacement', 'keyed-alike-deadbolts', 'deadbolt-lockout-service', 'high-security-deadbolt', 'commercial-deadbolt-locks'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost'],
  },
  'deadbolt-replacement': {
    services: ['deadbolt-lock-repair', 'deadbolt-rekeying', 'smart-deadbolt-installation', 'high-security-deadbolt', 'deadbolt-lock-installation'],
    guides: ['deadbolt-grades-ansi-bhma', 'types-of-deadbolts', 'deadbolt-installation-cost'],
  },
  'smart-deadbolt-installation': {
    services: ['deadbolt-replacement', 'deadbolt-strike-plate-reinforcement', 'deadbolt-lock-installation', 'keyed-alike-deadbolts', 'deadbolt-lockout-service'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost', 'deadbolt-wont-lock'],
  },
  'double-cylinder-deadbolt-installation': {
    services: ['deadbolt-lock-installation', 'high-security-deadbolt', 'deadbolt-strike-plate-reinforcement', 'keyed-alike-deadbolts', 'smart-deadbolt-installation'],
    guides: ['single-vs-double-cylinder-deadbolt', 'types-of-deadbolts'],
  },
  'high-security-deadbolt': {
    services: ['deadbolt-strike-plate-reinforcement', 'commercial-deadbolt-locks', 'deadbolt-replacement', 'deadbolt-rekeying', 'double-cylinder-deadbolt-installation'],
    guides: ['deadbolt-grades-ansi-bhma', 'types-of-deadbolts'],
  },
  'broken-key-in-deadbolt': {
    services: ['deadbolt-lockout-service', 'deadbolt-lock-repair', 'deadbolt-rekeying', 'deadbolt-replacement'],
    guides: ['deadbolt-wont-lock', 'deadbolt-installation-cost'],
  },
  'keyed-alike-deadbolts': {
    services: ['deadbolt-rekeying', 'commercial-deadbolt-locks', 'deadbolt-replacement', 'high-security-deadbolt', 'deadbolt-lock-installation'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost'],
  },
  'commercial-deadbolt-locks': {
    services: ['high-security-deadbolt', 'keyed-alike-deadbolts', 'deadbolt-rekeying', 'deadbolt-strike-plate-reinforcement', 'smart-deadbolt-installation'],
    guides: ['deadbolt-grades-ansi-bhma', 'types-of-deadbolts'],
  },
  'deadbolt-strike-plate-reinforcement': {
    services: ['deadbolt-lock-installation', 'high-security-deadbolt', 'deadbolt-lock-repair', 'deadbolt-replacement', 'smart-deadbolt-installation'],
    guides: ['deadbolt-wont-lock', 'deadbolt-grades-ansi-bhma'],
  },

  // ---------- Guides ----------
  'types-of-deadbolts': {
    services: ['deadbolt-lock-installation', 'smart-deadbolt-installation', 'double-cylinder-deadbolt-installation', 'high-security-deadbolt', 'commercial-deadbolt-locks'],
    guides: ['single-vs-double-cylinder-deadbolt', 'deadbolt-grades-ansi-bhma'],
  },
  'single-vs-double-cylinder-deadbolt': {
    services: ['double-cylinder-deadbolt-installation', 'deadbolt-lock-installation', 'deadbolt-strike-plate-reinforcement', 'high-security-deadbolt'],
    guides: ['types-of-deadbolts', 'deadbolt-grades-ansi-bhma'],
  },
  'deadbolt-installation-cost': {
    services: ['deadbolt-lock-installation', 'deadbolt-replacement', 'deadbolt-rekeying', 'deadbolt-lockout-service', 'smart-deadbolt-installation'],
    guides: ['deadbolt-grades-ansi-bhma', 'types-of-deadbolts'],
  },
  'deadbolt-grades-ansi-bhma': {
    services: ['high-security-deadbolt', 'commercial-deadbolt-locks', 'deadbolt-replacement', 'deadbolt-strike-plate-reinforcement'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost'],
  },
  'deadbolt-wont-lock': {
    services: ['deadbolt-lock-repair', 'deadbolt-strike-plate-reinforcement', 'deadbolt-replacement', 'smart-deadbolt-installation', 'broken-key-in-deadbolt'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost'],
  },

  // ---------- Special pages ----------
  'services-hub': {
    services: ['deadbolt-lockout-service', 'deadbolt-lock-installation', 'deadbolt-lock-repair', 'deadbolt-rekeying'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost', 'deadbolt-grades-ansi-bhma'],
  },
  'guides-hub': {
    services: ['deadbolt-lock-repair', 'deadbolt-lock-installation', 'high-security-deadbolt', 'double-cylinder-deadbolt-installation'],
    guides: [],
  },
  'service-areas-hub': {
    services: ['deadbolt-lockout-service', 'deadbolt-lock-installation', 'deadbolt-rekeying', 'commercial-deadbolt-locks'],
    guides: ['deadbolt-installation-cost', 'types-of-deadbolts'],
  },
  /** Default sidebar for state and city pages (override per page with frontmatter relatedKey). */
  'area-page': {
    services: ['deadbolt-lockout-service', 'deadbolt-lock-installation', 'deadbolt-rekeying', 'deadbolt-lock-repair', 'deadbolt-strike-plate-reinforcement'],
    guides: ['deadbolt-installation-cost', 'single-vs-double-cylinder-deadbolt'],
  },
  about: {
    services: ['deadbolt-lock-installation', 'deadbolt-lock-repair', 'deadbolt-lockout-service', 'high-security-deadbolt'],
    guides: ['deadbolt-grades-ansi-bhma', 'types-of-deadbolts'],
  },
  contact: {
    services: ['deadbolt-lockout-service', 'broken-key-in-deadbolt', 'deadbolt-lock-repair', 'deadbolt-lock-installation'],
    guides: ['deadbolt-installation-cost', 'deadbolt-wont-lock'],
  },
  legal: {
    services: ['deadbolt-lock-installation', 'deadbolt-lock-repair', 'deadbolt-lockout-service', 'deadbolt-rekeying'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost'],
  },
};
