/**
 * A region arranged for reading, and the exports written from it.
 *
 * A region is a map, and the map is the export — that is what the design says 6.3 means here, and
 * this tool had neither the map on screen nor any export at all. `buildRegionMapSvgString` has
 * existed in `$lib/map` the whole time with one caller, a CLI script. It has two now.
 *
 * The Markdown is a gazetteer rather than a transcript of the page: the realms with who rules them,
 * the settlements, and the organizations. What it deliberately leaves out is the heraldry — a coat
 * of arms is a picture, its blazon is a sentence only a herald reads, and the map carries the
 * region's identity to the table.
 *
 * 6.4 has teeth in the ordinary way. Most regions have no organizations worth listing and some have
 * no settlements; both sections are dropped when empty, and so is the culture line when the region
 * was named from a referenced culture the payload does not own.
 */

import { getHonorific, type StoredCharacter } from '$lib/characters';
import { buildRegionMapSvgString, type RegionMapSvgSettlement } from '$lib/map';

import type { RegionSnapshot, StoredRealm } from './region_snapshot.js';

/** A titled list of lines; dropped entirely when it has no lines. */
export type RegionSection = {
  heading: string;
  lines: string[];
};

/** A region arranged for reading, independent of the format it is finally written in. */
export type RegionDocument = {
  title: string;
  paragraphs: string[];
  sections: RegionSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** What to head the document with: the region's name, or the kind when it has none. */
export function regionDisplayName(region: { name: string }): string {
  const name = region.name.trim();
  return name === '' ? 'Region' : name;
}

/** Who someone is, as a gazetteer names them: their honorific, their name, and their species. */
export function describeRuler(ruler: StoredCharacter): string {
  const honorific = getHonorific(
    ruler.gender.name,
    ruler.titles?.[0] ?? null,
    ruler.gender.pronouns,
  );
  const name = [ruler.firstName, ruler.lastName].filter(isPrintable).join(' ');
  const who = [honorific, name].filter(isPrintable).join(' ');
  return isPrintable(ruler.speciesName) ? `${who}, ${ruler.speciesName}` : who;
}

/** One realm, as a line: what it is called, what kind of thing it is, and who holds it. */
function realmLine(realm: StoredRealm, snapshot: RegionSnapshot, index: number): string {
  const name = isPrintable(realm.name) ? realm.name.trim() : `Realm ${index + 1}`;
  const kind = isPrintable(realm.realmTypeName) ? ` (${realm.realmTypeName})` : '';
  const seat = index === snapshot.mainRealm ? ' — the seat of this region' : '';
  return `${name}${kind}: ${describeRuler(realm.authority)}${seat}`;
}

function namedList(
  heading: string,
  places: { name: string; description: string }[],
): RegionSection[] {
  const lines = places
    .map((place) => {
      const name = isPrintable(place.name) ? place.name.trim() : '';
      const description = isPrintable(place.description) ? place.description.trim() : '';
      return [name, description].filter(isPrintable).join(': ');
    })
    .filter(isPrintable);
  return lines.length === 0 ? [] : [{ heading, lines }];
}

/** Arrange a region for reading. */
export function regionToDocument(snapshot: RegionSnapshot): RegionDocument {
  const culture = snapshot.dominantCulture;
  const paragraphs = [
    snapshot.description,
    culture !== null && isPrintable(culture.name)
      ? `The dominant culture here is the ${culture.name}.`
      : '',
    `It is ruled by ${describeRuler(snapshot.authority)}.`,
  ].filter(isPrintable);

  const realmLines = snapshot.realms.map((realm, index) => realmLine(realm, snapshot, index));

  return {
    title: regionDisplayName(snapshot),
    paragraphs,
    sections: [
      ...(realmLines.length === 0 ? [] : [{ heading: 'Realms', lines: realmLines }]),
      ...namedList('Settlements', snapshot.settlements),
      ...namedList('Organizations', snapshot.organizations),
    ],
  };
}

/** A region as Markdown, for a referee who wants the gazetteer in their own notes. */
export function regionToMarkdown(snapshot: RegionSnapshot): string {
  const document = regionToDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(`## ${section.heading}`, section.lines.map((line) => `- ${line}`).join('\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function regionToText(snapshot: RegionSnapshot): string {
  const document = regionToDocument(snapshot);
  const blocks = [...document.paragraphs];

  for (const section of document.sections) {
    blocks.push([section.heading.toUpperCase(), ...section.lines].join('\n'));
  }

  return blocks.join('\n\n');
}

/**
 * The region's map, drawn.
 *
 * The settlements are handed over so the map labels its towns and marks the capital — the
 * renderer takes them separately because a map may be drawn without them, as the CLI script does.
 * The capital is the settlement in the realm the region is seated in, which is what a reader means
 * by "the capital" whatever the payload calls it.
 */
export function regionToMapSvg(snapshot: RegionSnapshot): string {
  const settlements: RegionMapSvgSettlement[] = snapshot.settlements.map((settlement, index) => ({
    ...(settlement.mapNodeId === undefined ? {} : { mapNodeId: settlement.mapNodeId }),
    isCapital: index === 0,
    name: settlement.name,
    population: settlement.population,
  }));

  return buildRegionMapSvgString(snapshot.map, {
    title: regionDisplayName(snapshot),
    settlements,
  });
}

/**
 * The same map, as a data URL for an `<img>`.
 *
 * An image rather than inline markup, matching every other generated picture on the site. Inlining
 * it looked simpler and was not: the map's paths are drawn in viewBox units and extend well past
 * the viewBox that clips them, so `getBoundingClientRect` reports each one at its full geometry —
 * up to 1,888px wide inside a 320px phone — and `pages.mobile.spec.ts` reads those as horizontal
 * overflow. An `<img>` has no children to measure and scales with `max-width`.
 */
export function regionMapDataUrl(snapshot: RegionSnapshot): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(regionToMapSvg(snapshot))}`;
}

/** A filename stem for an exported region, reduced to something a filesystem takes. */
export function regionFileStem(region: { name: string }): string {
  const stem = regionDisplayName(region)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'region' ? 'region' : `region-${stem}`;
}
