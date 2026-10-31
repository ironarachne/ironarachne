import { notableHeading, notableApproachRole } from './region_notable_identity';
import type { RegionNotableReferenceContext } from './region_notable_reading_types';
import { sentenceCase, regionHook, REGION_HOOK_SECTIONS } from './region_prose';
import { title, getOrdinal } from '@ironarachne/words';
import {
  describeRuler,
  regionSupportingFacts,
  regionToDocument,
  regionSettlementEntries,
} from './region_presentation';
import { landscapeSummaryHeading } from './region_landscape_names';
import { regionFactsNeedingReview } from './region_editing';
import type { RegionSnapshot, StoredRealm } from './region_snapshot';
import type { FactBase, SettlementTarget, RouteEndpoint } from './region_fact_types';
import type { RegionUiDocument, RegionUiEntry } from './region_ui_presentation_types';

const printable = (place: { name: string; description: string }) =>
  !!(place.name.trim() || place.description.trim());
const displayName = (name: string, fallback: string) => name.trim() || fallback;
const headingKey = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

function uniqueHeading(base: string, used: Set<string>, qualifier = 'Entry'): string {
  const ordinals = [
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
  ];
  let candidate = base;
  let duplicate = 0;
  while (used.has(headingKey(candidate))) {
    candidate = `${base} (${ordinals[duplicate] ?? `${duplicate + 2}${getOrdinal(duplicate + 2)}`} ${qualifier})`;
    duplicate++;
  }
  used.add(headingKey(candidate));
  return candidate;
}

function settlementName(snapshot: RegionSnapshot, target: SettlementTarget): string {
  return target.kind === 'embedded'
    ? displayName(
        snapshot.settlements.find((entry) => entry.id === target.settlementId)?.snapshot.name ?? '',
        'an Unnamed Settlement',
      )
    : 'a Referenced Settlement';
}

function endpointName(snapshot: RegionSnapshot, endpoint: RouteEndpoint): string {
  if (endpoint.kind === 'settlement') return settlementName(snapshot, endpoint.settlement);
  if (endpoint.kind === 'boundary') return 'the Region Boundary';
  return displayName(
    snapshot.facts.notables.find((fact) => fact.id === endpoint.notableId)?.name ?? '',
    'an Unnamed Place',
  );
}

function settlementHeading(snapshot: RegionSnapshot, id: string, index: number): string {
  const settlement = snapshot.settlements[index].snapshot;
  const capital = snapshot.facts.settlementRoles.find((role) => role.id === 'role:capital');
  const isCapital =
    snapshot.affiliation === 'affiliated' &&
    (capital === undefined
      ? index === 0 &&
        !snapshot.facts.settlementRoles.some((role) => role.id.startsWith('role:site:'))
      : capital.settlement.kind === 'embedded' && capital.settlement.settlementId === id);
  const category = title(settlement.category.name.trim() || 'settlement');
  return `The ${isCapital ? 'Capital ' : ''}${category} of ${displayName(settlement.name, 'an Unnamed Settlement')}`;
}

function realmHeading(realm: StoredRealm, index: number, mainRealm: number | null): string {
  const type = realm.realmTypeName.trim() || 'realm';
  const name = displayName(realm.name, 'an Unnamed Realm');
  const prefix = `the ${type} of `;
  const shortName = name.toLowerCase().startsWith(prefix.toLowerCase())
    ? name.slice(prefix.length)
    : name;
  return `The ${index === mainRealm ? 'Regional ' : 'Neighboring '}${title(type)} of ${shortName}`;
}

function factHeading(snapshot: RegionSnapshot, section: string, fact: FactBase): string {
  if (section === 'Flora and fauna') return '';
  if (section === 'Landscape' && fact.id === 'area:land') return '';
  const name = displayName(fact.name, 'an Unnamed Feature');
  if (section === 'Regional identity') return `The ${name}`;
  if (section === 'Landscape')
    return fact.origin !== 'authored' &&
      snapshot.facts.habitats.some((habitat) => habitat.id === fact.id)
      ? landscapeSummaryHeading(fact.name)
      : fact.origin === 'authored'
        ? name
        : sentenceCase(name);
  if (section === 'Travel') {
    const route = snapshot.facts.routes.find((entry) => entry.id === fact.id)!;
    return `The ${name} from ${endpointName(snapshot, route.endpoints[0])} to ${endpointName(snapshot, route.endpoints[1])}`;
  }
  if (section === 'Notable places' || section === 'Hazards') {
    const notable = snapshot.facts.notables.find((entry) => entry.id === fact.id);
    if (notable) return notableHeading(snapshot, notable);
  }
  const qualifiers: Record<string, string> = {
    Landscape: 'Landscape',
    'Notable places': 'Landmark',
    Travel: 'Route',
    Hazards: 'Hazard',
  };
  return `The ${qualifiers[section]} of ${name}`;
}

function factEntry(snapshot: RegionSnapshot, section: string, fact: FactBase): RegionUiEntry {
  const warning =
    section === 'Regional identity' && fact.reason?.status === 'stale'
      ? 'Needs review: supporting information changed; saved text has not been recomputed.'
      : undefined;
  const body = fact.description.trim();
  const heading = factHeading(snapshot, section, fact);
  const text = REGION_HOOK_SECTIONS.includes(section) ? regionHook(body) : { body };
  return { heading, ...text, factId: fact.id, warning };
}

/** Build heading/body pairs from source fields, never by splitting names or prose at a colon. */
export function regionToUiDocument(
  snapshot: RegionSnapshot,
  references: RegionNotableReferenceContext = {},
): RegionUiDocument {
  const document = regionToDocument(snapshot, references);
  if (snapshot.gazetteer) {
    const used = new Set([document.title.toLowerCase(), 'region generator']);
    const facts = new Map(regionSupportingFacts(snapshot).map((fact) => [fact.id, fact]));
    return {
      title: document.title,
      paragraphs: document.paragraphs,
      sections: document.sections.map((section) => ({
        heading: uniqueHeading(section.heading, used, 'Section'),
        ...(section.landscapeReferences
          ? { landscapeReferences: section.landscapeReferences }
          : {}),
        entries: section.lines.map((body, index) => {
          const anchorId = section.entryAnchors?.[index];
          if (anchorId) {
            const heading = section.entryHeadings?.[index] ?? '';
            return {
              heading,
              body:
                heading && body.startsWith(`${heading}\n\n`)
                  ? body.slice(heading.length + 2)
                  : body === heading
                    ? ''
                    : body,
              anchorId,
              location: section.entryLocations?.[index],
              relatedAnchorId: (() => {
                const notable = snapshot.facts.notables.find(
                  (fact) => fact.id === section.factIds?.[index],
                );
                const role = notable && notableApproachRole(snapshot, notable);
                const target = role?.settlement;
                return target?.kind === 'embedded' &&
                  snapshot.settlements.some((entry) => entry.id === target.settlementId)
                  ? `settlement-${encodeURIComponent(target.settlementId)}`
                  : undefined;
              })(),
              hook: section.entryPrompts?.[index] || undefined,
              hookHeading: section.entryPrompts?.[index]
                ? section.entryPromptHeadings?.[index] || 'Suggested adventure'
                : undefined,
              factId: section.factIds?.[index],
              inspectionFactIds: section.inspectionFactIds?.[index],
            };
          }
          const id = section.factIds?.[index];
          if (!id) {
            const heading = section.entryHeadings?.[index] ?? '';
            return {
              heading: heading ? uniqueHeading(heading, used) : '',
              body:
                heading && body.startsWith(`${heading}\n\n`)
                  ? body.slice(heading.length + 2)
                  : body === heading
                    ? ''
                    : body,
            };
          }
          const fact = facts.get(id)!;
          const text = REGION_HOOK_SECTIONS.includes(section.heading)
            ? regionHook(fact.description)
            : { body: fact.description };
          return {
            ...text,
            heading: section.heading === 'Flora and fauna' ? '' : uniqueHeading(fact.name, used),
            factId: id,
            ...('hook' in text && text.hook
              ? { hookHeading: uniqueHeading(`An Adventure Hook for ${fact.name}`, used) }
              : {}),
          };
        }),
      })),
    };
  }
  const facts = new Map(regionSupportingFacts(snapshot).map((fact) => [fact.id, fact]));
  const review = regionFactsNeedingReview(snapshot);
  const settlements = regionSettlementEntries(snapshot);
  const organizations = snapshot.organizations.filter(printable);
  const used = new Set(
    [
      document.title,
      'Region Generator',
      'Inspect the map',
      'Nearby Sovereignties',
      'Nearby Realms',
    ].map(headingKey),
  );
  const sectionHeadings = new Map(
    document.sections.map((section) => [
      section.heading,
      uniqueHeading(section.heading, used, 'Section'),
    ]),
  );
  const sections = document.sections.map((section) => ({
    heading: sectionHeadings.get(section.heading)!,
    entries: section.lines.map((_line, index): RegionUiEntry => {
      const factId = section.factIds?.[index];
      let entry: RegionUiEntry;
      if (factId) {
        entry = factEntry(snapshot, section.heading, facts.get(factId)!);
        const notable = snapshot.facts.notables.find((fact) => fact.id === factId);
        if (notable) entry.heading = notableHeading(snapshot, notable, references);
      } else if (section.heading === 'Flora and fauna') entry = { heading: '', body: _line };
      else if (section.heading === 'Facts needing review') {
        entry = {
          heading: `A Review of ${displayName(review[index].name, 'an Unnamed Fact')}`,
          body: 'Supporting information changed; saved text has not been recomputed.',
        };
      } else if (section.heading === 'Realms') {
        const realm = snapshot.realms[index];
        entry = {
          heading: realmHeading(realm, index, snapshot.mainRealm),
          body: `${describeRuler(realm.authority)}${index === snapshot.mainRealm ? ' — the seat of this region' : ''}${realm.description.trim() ? `. ${realm.description}` : ''}`,
        };
      } else if (section.heading === 'Settlements') {
        const settlement = settlements[index];
        const target = settlement.target;
        const originalIndex =
          target.kind === 'embedded'
            ? snapshot.settlements.findIndex((entry) => entry.id === target.settlementId)
            : -1;
        entry = {
          heading:
            originalIndex >= 0
              ? settlementHeading(snapshot, snapshot.settlements[originalIndex].id, originalIndex)
              : `The Settlement of ${settlement.name}`,
          body: settlement.description,
          paragraphs: settlement.paragraphs,
          character: settlement.character,
        };
      } else {
        const organization = organizations[index];
        entry = {
          heading: `The Organization Known as ${displayName(organization.name, 'an Unnamed Organization')}`,
          body: organization.description.trim(),
        };
      }
      if (entry.heading) entry.heading = uniqueHeading(entry.heading, used);
      if (entry.character?.length)
        entry.characterHeading = uniqueHeading(
          `Settlement character of ${settlements[index].name}`,
          used,
        );
      if (entry.hook)
        entry.hookHeading = uniqueHeading(`An Adventure Hook for ${entry.heading}`, used);
      return entry;
    }),
  }));
  return { title: document.title, paragraphs: document.paragraphs, sections };
}
