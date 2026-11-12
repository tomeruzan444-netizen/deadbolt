# Content Guide: Deadbolt Nation Locksmiths

This is the operating manual for every word on deadboltnation.com. Anyone (human or AI) adding or editing a page must follow it. The keyword ownership table lives in [`KEYWORD-MAP.md`](./KEYWORD-MAP.md). The FAQ register is generated into [`FAQ-REGISTER.md`](./FAQ-REGISTER.md) by `npm run qa`.

Contents:
1. Brand and entity basics
2. Voice and tone (with good vs bad examples)
3. Page structure templates
4. Keyword rules
5. Banned words and patterns
6. FAQ rules
7. Internal linking rules and `related.ts`
8. Sourcing, accuracy and the "never invent" list
9. Visual and infographic guidelines
10. Uniqueness: giving every page its own "color"
11. Pre-publish checklist
12. How to add a new page
13. Rule precedence (brief vs global writing guidelines)

---

## 1. Brand and entity basics

- Company name, always: **Deadbolt Nation Locksmiths**. Short form "Deadbolt Nation" is allowed in navigation, the logo and the title-tag suffix only. Never "DN", "Deadbolt Nation LLC" (legal name comes from config), or "Deadbolt Nation Locksmith" (singular).
- What we are: a locksmith company that works on deadbolt locks only, for homes and small businesses across the United States.
- Language: American English. US spelling (color, center, aluminum), inches written as `2-3/8"` or "2-3/8 inches", US dollars.
- Contact details come from `src/config/site.ts`. Never type a phone number, address or email into content. If you need a call to action, use the `<CTA />` component, which hides empty fields.

## 2. Voice and tone

We sound like a senior deadbolt technician explaining something to a homeowner at their front door: calm, direct, specific, a little opinionated when experience justifies it.

- Use "we" for the company and "you" for the reader.
- Short paragraphs: 1-3 sentences, max ~60 words. Vary sentence length.
- Plain English first, then the technical term, explained once: "the backset (the distance from the door edge to the center of the bore hole)".
- Prefer field knowledge: what we actually see, what homeowners get wrong, what to check before buying.
- Every paragraph must teach, clarify or help the reader decide. If it does none of these, delete it.

### Good vs bad

| Bad | Good | Why |
|---|---|---|
| "Rest assured, our robust solutions will elevate your home security." | "A Grade 2 deadbolt with a reinforced strike and 3-inch screws stops most kick-in attempts at the jamb, which is where doors usually fail." | Specific, testable, no filler. |
| "Whether you're a homeowner or a landlord, we've got you covered." | "Landlords usually rekey between tenants. Homeowners usually rekey once, the week they move in." | Two concrete facts instead of a false binary. |
| "Deadbolt repair is important. In this article we will delve into deadbolt repair." | "If your deadbolt only turns when you push or pull the door, the lock is usually fine. The bolt is rubbing the strike plate." | Answer-first, starts with value. |
| "Our fast, reliable, affordable service..." | "We quote before we start, and the quote includes the hardware." | No three-adjective list; a verifiable commitment (only if true, see §8). |
| "It's important to note that codes vary." | "Codes vary by city. Call your local building department before you install a keyed-inside lock on a bedroom or exit door." | Says what to do. |

## 3. Page structure templates

All non-legal pages, in this order:

1. Breadcrumbs (component, automatic)
2. H1 containing the main keyword exactly
3. **Answer-first intro**: 2-4 sentences that fully answer the page's main question on their own. Contains the main keyword. Must not restate the title.
4. Optional key-facts box (3-5 bullets of hard specifics)
5. Table of contents (automatic on pages with `toc: true`; required for guides and service pages over ~1,200 words)
6. Body sections (H2/H3, no skipped levels). Each H2 section must make sense if quoted alone.
7. At least one visual: SVG infographic, diagram, comparison table, step graphic or checklist
8. Contextual internal links throughout the body (see §7)
9. CTA block (`<CTA />`)
10. FAQ: 10-15 questions (see §6)
11. Guides only: short "Sources" list

The sidebar (related services, helpful guides, contact card) is added by the layout on every page except home. Do not paste sidebar content into the body.

### Service page (1,000-1,800 words)
- Intro answers: what the service is, who needs it, what the visit involves.
- Typical H2 set (vary the wording and order per page, see §10): signs you need it / when it makes sense; what we check first; how the job is done (numbered steps or process graphic); options and hardware choices; mistakes we see; cost factors (short, link to the cost guide); related services in passing.
- "Last updated" date visible (from `updated` frontmatter).
- Schema: `Service` + `BreadcrumbList` + `FAQPage` (automatic from frontmatter).

### Guide (1,500-2,500 words)
- Intro answers the core question outright (e.g. "There are seven common types of deadbolts...").
- At least one comparison table and one diagram or step graphic.
- Ends where a professional is needed, with a natural link to the matching service.
- "Last updated" date visible. Short "Sources" section at the end.
- Schema: `Article` + `BreadcrumbList` + `FAQPage`.

### Hub (services, guides, service areas)
- Intro explains what the section covers and how to pick the right page.
- A card or list for every child page with a one-sentence unique description (not copied from the child's meta description).
- 400-900 words of genuinely useful framing (e.g. "which service do I need?" decision table on the services hub).
- FAQ 10-15, about choosing between children, not repeating children's FAQs.

### Service area: state or city (future)
- Only publish with real local substance: state licensing status verified from the official state source, local code office link, housing/door types common in the area, areas served.
- Main keyword pattern from `KEYWORD-MAP.md`. No city-name swaps of another page: different angle, headings, examples and FAQs every time.
- Schema: `Service` with `areaServed` set to the state/city + `BreadcrumbList` + `FAQPage`.

### Legal pages (privacy, accessibility)
No keyword rules, no FAQ, no sidebar CTA requirements. Plain, accurate language. Privacy policy carries a code comment recommending legal review.

## 4. Keyword rules

Each page's main keyword is in its frontmatter `keyword` field and in `KEYWORD-MAP.md`.

| Location | Rule |
|---|---|
| H1 | Contains the keyword exactly as written (case-insensitive). |
| Body prose | Exact match **at least 5 times**. Counted in the main article body (paragraphs, lists, tables, H2/H3), **excluding** H1, FAQ, breadcrumbs, sidebar, nav, footer and CTA. Case-insensitive; curly apostrophes normalized. |
| First paragraph | Contains the keyword. |
| At least one H2 | Contains the keyword. |
| Title tag | Keyword near the start. 50-60 characters. Formula: `{Keyword in Title Case}: {Specific benefit or angle} \| Deadbolt Nation` (shorten the angle to fit). |
| Meta description | Contains the keyword. 140-160 characters. Formula: answer + specific + soft action. Example: "Deadbolt rekeying changes the pins so old keys stop working, without replacing the lock. See when to rekey, what it involves and how it compares." |
| Density | Soft ceiling: no more than about 1 exact match per 120 words. If you need more, use variations. |

If a sentence sounds forced with the keyword, **rewrite the sentence**, do not drop the keyword. Mix in semantic variations from the secondary keywords column.

## 5. Banned words and patterns

The QA script (`npm run qa`) scans for these. Any hit fails the build check.

**Words and phrases**
- delve
- in today's fast-paced world / in today's world
- it's important to note
- look no further
- unlock the power / unlock the potential / unlock the secrets (figurative "unlock" in any form). Literal unlocking of a lock is fine and expected on this site.
- elevate
- seamless / seamlessly
- robust
- navigate the complexities / navigate the world of
- a testament to
- whether you're ... or ...
- in conclusion
- ultimately
- rest assured
- game-changer / game changer
- comprehensive guide
- when it comes to
- peace of mind: **maximum once on the entire site** (QA counts site-wide)

**Patterns**
- Em dashes (—). Use commas, periods or a simple hyphen. En dashes (–) are also replaced: use "to" for ranges ("$50 to $90") or a hyphen.
- Stacked rhetorical questions (two or more questions in a row in body prose).
- Intro paragraphs that restate the title.
- Three-adjective lists ("fast, reliable and affordable").
- Ending every section with a summary sentence. A section ends when its last useful point is made.
- "Click here", "read more", "learn more" as link text.

## 6. FAQ rules

- 10-15 questions per page (except legal pages and 404).
- Answers: 1-3 sentences, direct. The first sentence answers the question; the rest adds one useful specific.
- Questions must be specific to the page's topic and inside its "Owns" territory in `KEYWORD-MAP.md`.
- **No FAQ question may appear on more than one page**, including reworded duplicates ("How long does rekeying take?" vs "How much time does a rekey take?" counts as a duplicate). The QA script checks exact and near-duplicates.
- Questions are phrased the way people search: "Can you rekey a smart deadbolt?" not "Information about smart lock rekeying".
- FAQ content is marked up as `FAQPage` automatically from the `faqs` frontmatter. Visible text and schema must match (they do, because both render from the same data).
- Before writing FAQs for a new page, open `docs/FAQ-REGISTER.md` (regenerated by `npm run qa`) and make sure none of your questions are already used.

## 7. Internal linking rules

- Every page links to **4-8 other relevant pages within the body text** (sidebar, nav and footer links do not count).
- Anchor text is descriptive and varied: the target's topic in natural words ("rekeying the existing cylinders", "our guide to ANSI deadbolt grades"). Never "click here". Don't use the exact same anchor for the same target twice on one page.
- Service pages link to their related guides; guides link to the matching service where a pro is needed.
- Hubs link to every child.
- Always link the cross-link pairs listed at the bottom of `KEYWORD-MAP.md`.
- Every page must be reachable within 3 clicks from home (it is, via nav and hubs; QA verifies).
- Use trailing slashes in every internal URL: `/deadbolt-rekeying/`.

### `src/data/related.ts`
The sidebar is driven by a curated map, not by randomness:

```ts
export const related: Record<string, { services: string[]; guides: string[] }> = {
  'deadbolt-rekeying': {
    services: ['deadbolt-replacement', 'keyed-alike-deadbolts', 'deadbolt-lockout-service', 'high-security-deadbolt'],
    guides: ['types-of-deadbolts', 'deadbolt-installation-cost'],
  },
  // ...
};
```

When you add a page:
1. Add its own entry with 4-6 services and 2-3 guides, ordered by relevance.
2. Add the new page's slug to the entries of the 3-5 pages most related to it.
3. Run `npm run qa`, which fails if a slug in `related.ts` does not exist or a page has no entry.

## 8. Sourcing, accuracy and the "never invent" list

### Approved sources
Facts and technical claims must come from these (or sources of equal authority). URLs are verified during research and stored per page.

- **Standards**: ANSI/BHMA A156.40 (residential deadbolts), A156.36 (auxiliary locks) and A156.13 (mortise locks) as applicable; confirm the current edition and scope of each standard on bhma.org before citing it; BHMA (buildershardware.com); UL 437 (high-security cylinders, ul.com).
- **Codes**: NFPA 101 Life Safety Code (nfpa.org); International Residential Code and International Building Code (codes.iccsafe.org); ADA Standards for Accessible Design (ada.gov / access-board.gov).
- **Manufacturers**: Schlage, Kwikset, Medeco, Mul-T-Lock, Yale, Baldwin, ASSA ABLOY, Allegion installation instructions and spec sheets.
- **Consumer protection and trade**: FTC consumer advice on hiring a locksmith (consumer.ftc.gov); ALOA Security Professionals Association (aloa.org); state licensing boards (for state pages).
- **Reputable publications** for cost data and context: Consumer Reports, This Old House, Angi/HomeAdvisor cost guides, Bob Vila. Cite cost ranges with the publisher named in `sources`.
- **Smart lock protocols**: Connectivity Standards Alliance (Matter, Zigbee), Z-Wave Alliance.

### Recording sources
Every content file has a `sources` frontmatter list:

```yaml
sources:
  - title: "ANSI/BHMA A156.40 Residential Deadbolts"
    publisher: "BHMA"
    url: "https://..."
    supports: "Grade 1/2/3 cycle and strength test definitions"
```

`supports` says which claim the source backs, so facts can be audited later. Guides display a short "Sources" list. Service pages keep sources in frontmatter only.

### Never invent
Do not write, imply or put in schema any of the following unless the business supplies it and it is verified:
- statistics, survey numbers, "X% of burglaries..." style claims without a named source
- prices presented as our price list (ranges only, sourced, labeled as typical national ranges that vary by location)
- testimonials, reviews, ratings, star counts, `AggregateRating` or `Review` schema
- awards, "best of" badges, years in business, founding date, number of technicians, team names or bios
- licenses, bonds, insurance amounts, certifications, association memberships
- response-time guarantees ("in 15 minutes")
- licensing in any specific state

Where the company will later need such a detail, leave a code comment, never visible text:

```mdx
{/* TODO(business): add years in business once confirmed */}
```

### Topic-specific accuracy rules
- **Licensing**: say that some states and cities require locksmith licensing and explain how to verify (ask for the license number, check the state board). Never claim a license.
- **Double cylinder codes**: explain that many jurisdictions restrict locks that need a key to open from inside on doors used for egress, and tell the reader to check with their local building department. Do not state a specific state's rule unless verified from the official code.
- **Lockout methods**: describe non-destructive entry only at a high level ("specialist tools that manipulate the lock without damage"). Never give step-by-step bypass, picking or bumping instructions.
- **Proof of residence**: we verify identity and right of access before opening a lock. State this on lockout and broken-key pages.
- **Lubrication**: dry lubricants (graphite or PTFE-based dry lube) for cylinders; follow the manufacturer's guidance, since some manufacturers specify their own lubricant.

## 9. Visual and infographic guidelines

- Inline SVG, hand-built, in the "precision hardware" style: thin strokes (1-1.5px at 1x), ink lines on paper or brass/steel lines on graphite, measurement lines with arrowheads, small mono-type spec labels, numbered callouts in circles.
- Use the CSS tokens (`currentColor`, `var(--brass)`, `var(--steel)`) so SVGs adapt to light and dark sections.
- Each SVG: `role="img"`, a `<title>` and `<desc>`, and an adjacent visible caption or text equivalent (a list or table that conveys the same information) for complex diagrams.
- Accuracy: dimensions shown must match sources (e.g. 1" throw, 2-3/8" / 2-3/4" backset, 2-1/8" bore). Never decorate with made-up specs.
- Keep each SVG under ~8 KB where possible. No raster images unless necessary; if needed, AVIF/WebP with `srcset`, width/height and `loading="lazy"` below the fold.
- No stock photos of people, fake technicians or fake vans.
- Planned shared infographics (in `src/components/graphics/`): deadbolt anatomy (exploded), installation steps, rekeying pin stacks before/after, single vs double cylinder, ANSI grade chart, strike plate reinforcement, repair-or-replace flowchart, service visit process.

## 10. Uniqueness: giving every page its own "color"

Each page must read as its own piece, not a template with the keyword swapped.

Before writing, choose and record in frontmatter (`angle` field, not displayed) a combination of:
- **Angle**: myth-busting, step-by-step, insider "what we check", problem-solution, comparison, mistakes to avoid, decision guide, Q&A.
- **Opening style**: quick answer up front (always required by §3) followed by one of: a field scenario, a surprising specific, a common misconception, a direct instruction.
- **Section structure**: vary H2 order, heading style (questions vs statements), list vs table vs prose.
- **Ending**: a practical next step, a field tip, a decision rule. Never a recap.

Rules:
- No reused sentences or paragraphs between pages, including rewording or synonym-swapping. QA flags paragraphs with high similarity across pages.
- No shared intro or outro templates.
- Related pages (rekeying vs keyed alike, single vs double guide vs double cylinder service) must answer *different sub-questions*; check the "Owns" column.

### Color register (fill in as pages are written)

| Page | Angle | Opening | Ending |
|---|---|---|---|
| _(added during Phase 5)_ | | | |

## 11. Pre-publish checklist

- [ ] Keyword is in `KEYWORD-MAP.md` and owned by no other page
- [ ] H1 contains the exact keyword; only one H1
- [ ] Exact keyword 5+ times in body (QA count), in first paragraph and in one H2
- [ ] Title 50-60 chars, keyword near start; meta description 140-160 chars with keyword
- [ ] Answer-first intro, 2-4 sentences, does not restate the title
- [ ] Word count within range for the page type
- [ ] 4-8 contextual internal links in body, descriptive anchors, trailing slashes
- [ ] `related.ts` entry added and reciprocal links added
- [ ] At least one visual with `<title>`/`<desc>`/text equivalent
- [ ] 10-15 FAQs, none in `FAQ-REGISTER.md` already
- [ ] Banned words/patterns: zero hits; no em dashes
- [ ] Every fact traceable to a `sources` entry; nothing from the "never invent" list
- [ ] `updated` date set; `published` set for new pages
- [ ] `angle` recorded and added to the color register
- [ ] `npm run build && npm run qa` passes (schema, links, sitemap, duplicates)

## 12. How to add a new page

1. **Claim the keyword**: add a row to `docs/KEYWORD-MAP.md` (keyword, intent, secondary terms, FAQ territory, neighbors).
2. **Create the content file** in the right collection:
   - Service: `src/content/services/{slug}.mdx` (URL becomes `/{slug}/`)
   - Guide: `src/content/guides/{slug}.mdx` (URL becomes `/deadbolt-guides/{slug}/`)
   - Service area: `src/content/areas/{state}/{city}.mdx` (URL becomes `/service-areas/{state}/{city}/`)
3. **Fill the frontmatter** (validated by the schema in `src/content.config.ts`; the build fails on missing fields):

   ```yaml
   ---
   title: "Deadbolt Rekeying"            # display name used in nav/breadcrumbs
   h1: "Deadbolt Rekeying Without Replacing Your Lock"
   metaTitle: "Deadbolt Rekeying: New Keys, Same Lock | Deadbolt Nation"
   metaDescription: "..."
   keyword: "deadbolt rekeying"
   secondaryKeywords: ["rekey a deadbolt", "rekey vs replace"]
   intent: "transactional"
   intro: "..."                          # answer-first paragraph (rendered under H1)
   keyFacts: ["...", "..."]              # optional
   toc: true
   published: 2026-11-12
   updated: 2026-11-12
   angle: "insider: what changes inside the cylinder"
   faqs:
     - q: "..."
       a: "..."
   sources:
     - title: "..."
       publisher: "..."
       url: "..."
       supports: "..."
   ---
   ```
4. **Write the body** in MDX following §2-§10. Import graphics from `src/components/graphics/`.
5. **Update `src/data/related.ts`** (own entry + reciprocal entries).
6. **Add body links** from 2-4 existing related pages to the new page.
7. **Run** `npm run build && npm run qa`. Sitemap, `llms.txt`, nav dropdown (services), hub cards and schema update automatically.
8. **Commit and push** to `main`; Vercel deploys.

## 13. Rule precedence (brief vs global writing guidelines)

The owner's general article guidelines (used across projects) differ from this site's brief in a few places. For this website, **the project brief wins** where they conflict, because pages here are website pages with strict SEO structure rather than standalone articles:

| Topic | General article guideline | This site |
|---|---|---|
| Keyword in H1/title | Title must NOT contain the keyword | H1 and title tag MUST contain the exact keyword |
| Length | 700-1,000 words | Services 1,000-1,800; guides 1,500-2,500 |
| Internal links | Max 2-3 | 4-8 contextual links per page |
| FAQ | Optional, 3-4 | Required, 10-15, site-wide unique |
| Banned "unlock" | Banned | Figurative use banned; literal lock use allowed |

Everything else from the general guidelines applies in full: a unique angle/opening/voice/structure per page, no near-duplicate content, a 40-60 word snippet-ready answer early on, no invented facts, short paragraphs, bold used sparingly, and a closing that adds a next step rather than a summary.
