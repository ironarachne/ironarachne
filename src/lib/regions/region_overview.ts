import { composeNarrative, type NarrativeCandidate } from '$lib/narrative';
import type { RNG } from '@ironarachne/rng';
import type Region from './region';
import type { FactBase, SettlementRoleFact } from './region_fact_types';
import { regionContextEvidenceCurrent } from './region_context_evidence';
import { resourceNarrativeOptions } from './region_resource_narrative';

function siteClause(role: SettlementRoleFact): string[] {
  switch (role.reason?.ruleId) {
    case 'fantasy:region:river-crossing:v1':
      return ['stands where a road meets a river', 'lies at a meeting of road and river'];
    case 'fantasy:region:coastal-port-site:v1':
      return ['adjoins the sea', 'stands on the coast'];
    case 'fantasy:region:agricultural-site:v1':
      return [
        'has grassland that could support cultivation',
        'lies beside ground suitable for cultivation',
      ];
    case 'fantasy:region:river-settlement:v1':
      return ['borders a river that provides local freshwater', 'stands beside a freshwater river'];
    case 'fantasy:region:forest-settlement:v1':
      return [
        'lies in forest, giving its inhabitants access to woodland resources',
        'has woodland on its doorstep',
      ];
    default:
      return [];
  }
}
/** Build supported meanings first; the composer selects and words them on the prose stream. */
export function generateRegionOverview(region: Region, rng: RNG): string {
  const facts = region.facts;
  const candidates: NarrativeCandidate[] = [];
  const usable = (fact: FactBase) =>
    facts !== undefined && regionContextEvidenceCurrent({ ...region, facts }, fact);
  const add = (
    fact: FactBase,
    topic: string,
    options: string[],
    importance: NarrativeCandidate['importance'] = 'distinctive',
  ) => {
    if (!usable(fact) || !options.length) return;
    candidates.push({
      id: `overview:${fact.id}`,
      topic,
      importance,
      sourceIds: [fact.id],
      templates: [{ id: `overview:${topic}`, parts: [{ id: 'sentence', options }] }],
    });
  };
  for (const area of facts?.areas ?? [])
    if (area.id === 'area:land' && area.description.trim())
      add(area, 'geography', [area.description], 'defining');
  for (const range of facts?.mountainRanges ?? [])
    add(
      range,
      'geography',
      [`${region.name} includes ${range.name}, a chain of linked mountain ridges.`],
      'defining',
    );
  for (const role of facts?.settlementRoles ?? []) {
    if (role.settlement.kind !== 'embedded') continue;
    const index = region.settlementIds?.indexOf(role.settlement.settlementId) ?? -1;
    const name = region.settlements[index]?.name.trim();
    if (name)
      add(
        role,
        'habitation',
        siteClause(role).map((clause) => `${name} ${clause}.`),
      );
  }
  for (const resource of facts?.resources ?? [])
    add(resource, 'resource', resourceNarrativeOptions(resource));
  for (const route of facts?.routes ?? []) {
    if (route.kind !== 'road') continue;
    const names = route.endpoints.map((endpoint) => {
      if (endpoint.kind !== 'settlement' || endpoint.settlement.kind !== 'embedded') return '';
      const index = region.settlementIds?.indexOf(endpoint.settlement.settlementId) ?? -1;
      return region.settlements[index]?.name.trim() ?? '';
    });
    if (names.every(Boolean))
      add(route, 'travel', [
        `A road links ${names[0]} and ${names[1]}.`,
        `${names[0]} and ${names[1]} are linked by a road.`,
      ]);
  }
  for (const hazard of facts?.notables ?? []) {
    // These domain rules establish a qualitative travel concern, not crossing safety.
    if (
      hazard.kind === 'hazard' &&
      [
        'fantasy:region:high-ground-obstacle:v1',
        'fantasy:region:cold-travel:v1',
        'fantasy:region:hot-dry-travel:v1',
        'fantasy:region:ecology-bank-gathering:v1',
      ].includes(hazard.reason?.ruleId ?? '')
    )
      add(hazard, 'hazard', [hazard.description.split(' Hook:')[0].trim()]);
  }
  const result = composeNarrative(
    { id: 'region:overview', kind: 'region', candidates },
    { maxSentences: 5, maxPerTopic: 1, repetitionWindow: 0 },
    { recentSelections: [] },
    rng,
  );
  const selected = new Set(result.selections.map((selection) => selection.candidateId));
  const sourceIds = [
    ...new Set(
      candidates
        .filter((candidate) => selected.has(candidate.id))
        .flatMap((candidate) => candidate.sourceIds),
    ),
  ].sort();
  if (sourceIds.length)
    region.overviewReason = {
      ruleId: 'fantasy:region:overview:v2',
      status: 'current',
      sources: sourceIds.map((factId) => ({ kind: 'fact', factId })),
    };
  else delete region.overviewReason;
  return result.text;
}
