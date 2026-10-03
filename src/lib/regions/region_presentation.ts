/** Shared sourcebook presentation for the page, Markdown and PDF. Saved prose is never rerolled. */

import { getHonorific, type StoredCharacter } from '$lib/characters';
import { buildRegionMapSvgString, type RegionMapSvgSettlement } from '$lib/map';

import type { RegionSnapshot, StoredRealm } from './region_snapshot.js';
import { regionFactsNeedingReview } from './region_editing';
import type { FactBase, SettlementTarget, RouteEndpoint } from './region_fact_types';
import { regionSemanticFactLists } from './region_resource_editing';

/** A titled list of lines; dropped entirely when it has no lines. */
export type RegionSection = {
  heading: string;
  lines: string[];
  /** Optional semantic identities for links to supporting explanations on screen. */
  factIds?: string[];
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
  return `${name}${kind}: ${describeRuler(realm.authority)}${seat}${isPrintable(realm.description) ? `. ${realm.description}` : ''}`;
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

/** Resolve identities against current saved names, never array order or cached prose. */
function targetName(snapshot: RegionSnapshot, target: SettlementTarget): string {
  return target.kind === 'embedded'
    ? snapshot.settlements
        .find((entry) => entry.id === target.settlementId)
        ?.snapshot.name.trim() || 'Unnamed settlement'
    : 'Referenced settlement';
}

function endpointName(snapshot: RegionSnapshot, endpoint: RouteEndpoint): string {
  if (endpoint.kind === 'settlement') return targetName(snapshot, endpoint.settlement);
  if (endpoint.kind === 'boundary') return 'the map boundary';
  return (
    snapshot.facts.notables.find((fact) => fact.id === endpoint.notableId)?.name.trim() ||
    'Unnamed notable place'
  );
}

function factSections(heading: string, facts: FactBase[]): RegionSection[] {
  const printable = facts.filter((fact) => isPrintable(fact.name) || isPrintable(fact.description));
  return printable.length === 0
    ? []
    : [
        {
          heading,
          lines: printable.map(
            (fact) =>
              [fact.name.trim(), fact.description.trim()].filter(isPrintable).join(': ') +
              (fact.reason?.status === 'stale' ? ' [Supporting explanation needs review.]' : ''),
          ),
          factIds: printable.map((fact) => fact.id),
        },
      ];
}

/** One generated example per topic; all authored entries survive the concise selection. */
function representativeFacts<T extends FactBase>(facts: T[], topic: (fact: T) => string): T[] {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    if (!isPrintable(fact.name) && !isPrintable(fact.description)) return false;
    const key = topic(fact);
    const first = !seen.has(key);
    seen.add(key);
    return fact.origin === 'authored' || first;
  });
}

function atSettlement<T extends FactBase & { settlement: SettlementTarget }>(
  snapshot: RegionSnapshot,
  facts: T[],
): T[] {
  return facts
    .filter((fact) => isPrintable(fact.name) || isPrintable(fact.description))
    .map((fact) => ({
      ...fact,
      name: `${targetName(snapshot, fact.settlement)} — ${fact.name}`,
    }));
}

/** All supporting saved assertions remain inspectable, even those omitted from the short entry. */
export function regionSupportingFacts(snapshot: RegionSnapshot): FactBase[] {
  return regionSemanticFactLists.flatMap<FactBase>((list) => snapshot.facts[list]);
}

/** Show saved supporting prose, keeping raw generation evidence out of reading formats. */
export function regionFactExplanation(snapshot: RegionSnapshot, fact: FactBase): string[] {
  if (!fact.reason) return [];
  if (fact.reason.status === 'stale')
    return ['Supporting information changed; this explanation needs review.'];
  const facts = regionSupportingFacts(snapshot);
  return fact.reason.sources.flatMap((source) => {
    if (source.kind !== 'fact') return [];
    const supporting = facts.find((entry) => entry.id === source.factId);
    if (!supporting || (!isPrintable(supporting.name) && !isPrintable(supporting.description)))
      return [];
    return [
      `${supporting.name.trim() || 'Unnamed fact'}: ${supporting.description}${supporting.reason?.status === 'stale' ? ' [Needs review.]' : ''}`,
    ];
  });
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
      ...namedList(
        'Facts needing review',
        regionFactsNeedingReview(snapshot).map((fact) => ({
          name: fact.name.trim() || 'Unnamed fact',
          description: 'Supporting information changed; saved text has not been recomputed.',
        })),
      ),
      ...factSections('Landscape', [...snapshot.facts.areas, ...snapshot.facts.habitats]),
      ...factSections(
        'Flora and fauna',
        snapshot.facts.ecologyInhabitants.filter((fact) => fact.category !== 'fantastical'),
      ),
      ...factSections(
        'Settlement character',
        atSettlement(snapshot, snapshot.facts.settlementRoles),
      ),
      ...factSections(
        'Inhabitants',
        snapshot.facts.ecologyInhabitants.filter((fact) => fact.category === 'fantastical'),
      ),
      ...factSections(
        'Livelihoods',
        atSettlement(snapshot, [
          ...representativeFacts(snapshot.facts.dailyLife, (fact) =>
            JSON.stringify([fact.settlement, fact.category]),
          ),
          ...representativeFacts(snapshot.facts.supply, (fact) => JSON.stringify(fact.settlement)),
        ]),
      ),
      ...factSections(
        'Notable places',
        snapshot.facts.notables.filter((fact) => fact.kind === 'landmark'),
      ),
      ...factSections(
        'Travel',
        snapshot.facts.routes
          .filter((fact) => isPrintable(fact.name) || isPrintable(fact.description))
          .map((fact) => ({
            ...fact,
            name: `${fact.name} (${fact.endpoints.map((endpoint) => endpointName(snapshot, endpoint)).join(' to ')})`,
          })),
      ),
      ...factSections(
        'Hazards',
        snapshot.facts.notables.filter((fact) => fact.kind === 'hazard'),
      ),
      ...(realmLines.length === 0 ? [] : [{ heading: 'Realms', lines: realmLines }]),
      ...namedList(
        'Settlements',
        snapshot.settlements.map(({ snapshot: settlement }) => settlement),
      ),
      ...namedList('Organizations', snapshot.organizations),
    ],
  };
}

/** Exports use the same concise narrative as the page, without an evidence appendix. */
export function regionToExportDocument(snapshot: RegionSnapshot): RegionDocument {
  return regionToDocument(snapshot);
}

/** A complete region as Markdown; the illustrative map remains a separate SVG export. */
export function regionToMarkdown(snapshot: RegionSnapshot): string {
  const document = regionToExportDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(`## ${section.heading}`, section.lines.map((line) => `- ${line}`).join('\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function regionToText(snapshot: RegionSnapshot): string {
  const document = regionToExportDocument(snapshot);
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
  const capital = snapshot.facts.settlementRoles.find((role) => role.id === 'role:capital');
  const settlements: RegionMapSvgSettlement[] = snapshot.settlements.map(
    ({ id, snapshot: settlement }, index) => ({
      id,
      ...(settlement.mapNodeId === undefined ? {} : { mapNodeId: settlement.mapNodeId }),
      isCapital:
        capital === undefined
          ? index === 0 &&
            !snapshot.facts.settlementRoles.some((role) => role.id.startsWith('role:site:'))
          : capital.settlement.kind === 'embedded' && capital.settlement.settlementId === id,
      name: settlement.name,
      population: settlement.population,
    }),
  );

  return buildRegionMapSvgString(snapshot.map, {
    title: regionDisplayName(snapshot),
    settlements,
    features: [
      ...snapshot.facts.habitats.map((fact) => ({ ...fact, kind: 'habitat' as const })),
      ...snapshot.facts.notables,
    ].map((fact) => ({
      id: fact.id,
      name: fact.name,
      kind: fact.kind,
      nodeIds: fact.anchor?.nodeIds ?? [],
      edgeIds: fact.anchor?.edgeIds ?? [],
    })),
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
