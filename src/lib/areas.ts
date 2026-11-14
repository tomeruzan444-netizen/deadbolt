/** Helpers for state and city pages. Everything goes through the publishing gate in area-gate.mjs. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { isBuilt, isLive } from './area-gate.mjs';

export type Area = CollectionEntry<'areas'>;

/** Pages built in this run (live pages, plus drafts when AREAS_PREVIEW=1). */
export async function builtAreas(): Promise<Area[]> {
  const all = await getCollection('areas');
  const built = all.filter((a) => isBuilt(a.data));
  for (const a of built) {
    const isCity = a.id.includes('/');
    if (isCity !== (a.data.kind === 'city')) throw new Error(`areas/${a.id}: kind "${a.data.kind}" does not match the file location`);
    if (isCity) {
      const parent = all.find((s) => s.id === a.id.split('/')[0]);
      if (!parent) throw new Error(`areas/${a.id}: no state page src/content/areas/${a.id.split('/')[0]}.mdx`);
      if (!isBuilt(parent.data)) throw new Error(`areas/${a.id} is live but its state page is not: publish the state first`);
    }
  }
  return built;
}

const byName = (a: Area, b: Area) => a.data.place.name.localeCompare(b.data.place.name);

export const builtStates = async () => (await builtAreas()).filter((a) => a.data.kind === 'state').sort(byName);
export const builtCities = async (state: string) =>
  (await builtAreas()).filter((a) => a.data.kind === 'city' && a.id.startsWith(`${state}/`)).sort(byName);

/** Preview builds mark unpublished pages noindex so they can never leak into an index. */
export const areaNoindex = (a: Area) => !isLive(a.data);
