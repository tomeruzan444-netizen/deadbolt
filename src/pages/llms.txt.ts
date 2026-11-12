import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { site, absUrl } from '../config/site';
import { serviceUrl, guideUrl } from '../lib/urls';

export const GET: APIRoute = async () => {
  const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const page = async (id: string) => (await getEntry('pages', id))?.data;
  const hubs: [string, string][] = [
    ['/', 'home'], ['/services/', 'services'], ['/deadbolt-guides/', 'deadbolt-guides'],
    ['/service-areas/', 'service-areas'], ['/about/', 'about'], ['/contact/', 'contact'],
  ];
  const lines: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} is a US locksmith company that works exclusively on deadbolt locks. It serves homeowners, renters, landlords, property managers and small businesses across the United States. Content on this site explains deadbolt standards (ANSI/BHMA A156.40 grades, UL 437), installation dimensions, egress code considerations for double cylinder locks, and how to hire a locksmith safely.`,
    '',
    '## Main pages',
  ];
  for (const [url, id] of hubs) {
    const d = await page(id);
    if (d) lines.push(`- [${d.title}](${absUrl(url)}): ${d.cardBlurb}`);
  }
  lines.push('', '## Deadbolt services');
  for (const s of services) lines.push(`- [${s.data.title}](${absUrl(serviceUrl(s.id))}): ${s.data.cardBlurb}`);
  lines.push('', '## Deadbolt guides');
  for (const g of guides) lines.push(`- [${g.data.title}](${absUrl(guideUrl(g.id))}): ${g.data.cardBlurb}`);
  lines.push(
    '',
    '## Policies',
    `- [Privacy Policy](${absUrl('/privacy-policy/')}): How form submissions and analytics data are handled.`,
    `- [Accessibility Statement](${absUrl('/accessibility-statement/')}): WCAG 2.2 AA commitment and how to report issues.`,
    '',
  );
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
