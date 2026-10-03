import { title, getOrdinal } from '@ironarachne/words';
import { describeRuler, regionSupportingFacts, regionToDocument } from './region_presentation';
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
    capital === undefined
      ? index === 0 &&
        !snapshot.facts.settlementRoles.some((role) => role.id.startsWith('role:site:'))
      : capital.settlement.kind === 'embedded' && capital.settlement.settlementId === id;
  const category = title(settlement.category.name.trim() || 'settlement');
  return `The ${isCapital ? 'Capital ' : ''}${category} of ${displayName(settlement.name, 'an Unnamed Settlement')}`;
}

function realmHeading(realm: StoredRealm, index: number, mainRealm: number): string {
  const type = realm.realmTypeName.trim() || 'realm';
  const name = displayName(realm.name, 'an Unnamed Realm');
  const prefix = `the ${type} of `;
  const shortName = name.toLowerCase().startsWith(prefix.toLowerCase())
    ? name.slice(prefix.length)
    : name;
  return `The ${index === mainRealm ? 'Regional ' : 'Neighboring '}${title(type)} of ${shortName}`;
}

function factHeading(snapshot: RegionSnapshot, section: string, fact: FactBase): string {
  const name = displayName(fact.name, 'an Unnamed Feature');
  if (section === 'Settlement character') {
    const role = snapshot.facts.settlementRoles.find((entry) => entry.id === fact.id)!;
    return `The ${title(name)} at ${settlementName(snapshot, role.settlement)}`;
  }
  if (section === 'Livelihoods') {
    const livelihood = [...snapshot.facts.dailyLife, ...snapshot.facts.supply].find(
      (entry) => entry.id === fact.id,
    )!;
    return `The ${title(name)} in ${settlementName(snapshot, livelihood.settlement)}`;
  }
  if (section === 'Travel') {
    const route = snapshot.facts.routes.find((entry) => entry.id === fact.id)!;
    return `The ${title(name)} from ${endpointName(snapshot, route.endpoints[0])} to ${endpointName(snapshot, route.endpoints[1])}`;
  }
  const qualifiers: Record<string, string> = {
    Landscape: 'Landscape',
    'Flora and fauna': 'Local Population',
    'Notable places': 'Landmark',
    Travel: 'Route',
    Hazards: 'Hazard',
  };
  if (section === 'Inhabitants') return `The Local Inhabitants Known as ${name}`;
  return `The ${qualifiers[section]} of ${name}`;
}

function factEntry(snapshot: RegionSnapshot, section: string, fact: FactBase): RegionUiEntry {
  const warning =
    fact.reason?.status === 'stale' ? '[Supporting explanation needs review.]' : undefined;
  const body = fact.description.trim();
  const heading = factHeading(snapshot, section, fact);
  // A stored notable's explicitly labeled hook is a subheading, not part of its title.
  const hookIndex = ['Notable places', 'Hazards'].includes(section) ? body.indexOf(' Hook:') : -1;
  if (hookIndex < 0) return { heading, body, factId: fact.id, warning };
  return {
    heading,
    body: body.slice(0, hookIndex),
    factId: fact.id,
    warning,
    hook: body.slice(hookIndex + ' Hook:'.length).trim(),
  };
}

/** Build heading/body pairs from source fields, never by splitting names or prose at a colon. */
export function regionToUiDocument(snapshot: RegionSnapshot): RegionUiDocument {
  const document = regionToDocument(snapshot);
  const facts = new Map(regionSupportingFacts(snapshot).map((fact) => [fact.id, fact]));
  const review = regionFactsNeedingReview(snapshot);
  const settlements = snapshot.settlements
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => printable(entry.snapshot));
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
      if (factId) entry = factEntry(snapshot, section.heading, facts.get(factId)!);
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
        const { entry: settlement, index: originalIndex } = settlements[index];
        entry = {
          heading: settlementHeading(snapshot, settlement.id, originalIndex),
          body: settlement.snapshot.description.trim(),
        };
      } else {
        const organization = organizations[index];
        entry = {
          heading: `The Organization Known as ${displayName(organization.name, 'an Unnamed Organization')}`,
          body: organization.description.trim(),
        };
      }
      entry.heading = uniqueHeading(entry.heading, used);
      if (entry.hook)
        entry.hookHeading = uniqueHeading(`An Adventure Hook for ${entry.heading}`, used);
      return entry;
    }),
  }));
  return { title: document.title, paragraphs: document.paragraphs, sections };
}
