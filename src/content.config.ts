import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faq = z.object({ q: z.string().min(8), a: z.string().min(8) });

const source = z.object({
  title: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  supports: z.string(),
});

const seoBase = z.object({
    title: z.string(),
    h1: z.string(),
    metaTitle: z.string().max(70),
    metaDescription: z.string().min(100).max(170),
    keyword: z.string(),
    secondaryKeywords: z.array(z.string()).default([]),
    intent: z.enum(['transactional', 'commercial', 'informational', 'navigational']),
    intro: z.string(),
    keyFacts: z.array(z.string()).optional(),
    cardBlurb: z.string(),
    toc: z.boolean().default(false),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    angle: z.string(),
    faqs: z.array(faq).min(10).max(15),
    sources: z.array(source).default([]),
    order: z.number().default(100),
    icon: z.string().optional(),
});

const h1HasKeyword = (d: { h1: string; keyword: string }) => d.h1.toLowerCase().includes(d.keyword.toLowerCase());
const h1Rule = { message: 'h1 must contain the exact main keyword', path: ['h1'] };
const seoPage = seoBase.refine(h1HasKeyword, h1Rule);

/**
 * State and city pages. Every page must carry verified local facts with a source each,
 * so no page can be a city-name swap of another (docs/CONTENT-GUIDE.md, "Service area pages").
 * Publishing is gated by `draft` + `publishOn` (src/lib/area-gate.mjs).
 */
const localFact = z.object({
  topic: z.enum(['licensing', 'building-code', 'rental-law', 'climate', 'housing', 'consumer-protection', 'other']),
  fact: z.string().min(40),
  source: z.string().url(),
  checked: z.coerce.date(),
});
const areaPage = seoBase
  .extend({
    kind: z.enum(['state', 'city']),
    place: z.object({
      name: z.string(),
      stateName: z.string(),
      stateCode: z.string().length(2),
    }),
    draft: z.boolean().default(true),
    publishOn: z.coerce.date().optional(),
    localFacts: z.array(localFact).min(4),
    /** Neighborhoods, suburbs or counties the local team actually covers (from the business, not invented). */
    coverage: z.array(z.string()).default([]),
    /** Optional sidebar override; defaults to the "area-page" entry in src/data/related.ts. */
    relatedKey: z.string().optional(),
  })
  .refine(h1HasKeyword, h1Rule)
  .refine((d) => d.draft || !!d.publishOn, { message: 'publishOn is required once draft is false', path: ['publishOn'] })
  .refine((d) => d.sources.length >= 3, { message: 'area pages need at least 3 sources', path: ['sources'] })
  .refine((d) => d.keyword.toLowerCase().includes(d.place.name.toLowerCase()), { message: 'keyword must contain the place name', path: ['keyword'] });

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/services' }),
  schema: seoPage,
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: seoPage,
});

/** Home, hubs, about, contact. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: seoPage,
});

/** src/content/areas/{state}.mdx (state page) and src/content/areas/{state}/{city}.mdx (city page). */
const areas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/areas' }),
  schema: areaPage,
});

const legal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().max(70),
    metaDescription: z.string().min(100).max(170),
    updated: z.coerce.date(),
  }),
});

export const collections = { services, guides, pages, areas, legal };
