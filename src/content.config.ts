import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faq = z.object({ q: z.string().min(8), a: z.string().min(8) });

const source = z.object({
  title: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  supports: z.string(),
});

const seoPage = z
  .object({
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
  })
  .refine((d) => d.h1.toLowerCase().includes(d.keyword.toLowerCase()), {
    message: 'h1 must contain the exact main keyword',
    path: ['h1'],
  });

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

/** Future: src/content/areas/{state}/{city}.mdx */
const areas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/areas' }),
  schema: seoPage,
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
