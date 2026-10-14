import { composeNarrative, type NarrativeCandidate, type NarrativeResult } from '$lib/narrative';
import type { RNG } from '@ironarachne/rng';
import type Region from './region';
import type { FactBase, FactSource, SettlementRoleFact } from './region_fact_types';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { resourceNarrativeOptions } from './region_resource_narrative';
import {
  geographyCandidate,
  overviewLandscape,
  overviewRoad,
  overviewSettlement,
} from './region_geography_narrative';

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
  const checkEvidence = facts ? createRegionEvidenceChecker({ ...region, facts }) : () => false;
  const usable = (fact: FactBase) => checkEvidence(fact);
  const extraSources = new Map<string, FactSource[]>();
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
      add(area, 'terrain', [area.description], 'defining');
  for (const range of facts?.mountainRanges ?? [])
    add(
      range,
      'geography',
      [`${region.name} includes ${range.name}, a chain of linked mountain ridges.`],
      'defining',
    );
  const landscape = overviewLandscape(region, usable);
  if (landscape) {
    candidates.push(landscape.candidate);
    extraSources.set(landscape.candidate.id, landscape.sources);
  }
  const sites = (facts?.settlementRoles ?? []).filter(usable).flatMap((role) => {
    const settlement = overviewSettlement(region, role);
    const clauses = siteClause(role);
    return settlement && clauses.length ? [{ role, settlement, clauses }] : [];
  });
  for (const { role, settlement, clauses } of sites)
    add(
      role,
      'place',
      clauses.map((clause) => `${settlement.name.trim()} ${clause}.`),
    );
  for (const resource of facts?.resources ?? [])
    add(resource, 'resource', resourceNarrativeOptions(resource));
  for (const route of facts?.routes ?? []) {
    if (route.kind !== 'road' || !usable(route)) continue;
    const road = overviewRoad(region, route);
    if (!road) continue;
    const site = sites.find(({ settlement }) => road.settlements.includes(settlement));
    let options = road.options;
    if (site) {
      const other = road.settlements.find((entry) => entry !== site.settlement)!;
      // A crossing at the settlement is already expressed by its site clause.
      const crossing =
        road.crossing && site.role.reason?.ruleId !== 'fantasy:region:river-crossing:v1'
          ? ', meeting a river along the way'
          : '';
      options = site.clauses.map(
        (clause) =>
          `${site.settlement.name.trim()} ${clause}, with a road leading through the surrounding country to ${other.name.trim()}${crossing}.`,
      );
    }
    const candidate = geographyCandidate(
      route.id,
      'place',
      options,
      site ? [route, site.role] : [route],
    );
    candidates.push(candidate);
    extraSources.set(candidate.id, road.sources);
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
  // Compose in reading order, so terrain introduces the country before its inhabited places.
  const results: NarrativeResult[] = [];
  for (const topics of [
    ['terrain'],
    ['landscape'],
    ['geography'],
    ['place'],
    ['resource', 'hazard'],
  ]) {
    const remaining = 5 - results.reduce((sum, result) => sum + result.selections.length, 0);
    if (!remaining) break;
    results.push(
      composeNarrative(
        {
          id: 'region:overview',
          kind: 'region',
          candidates: candidates.filter((candidate) => topics.includes(candidate.topic)),
        },
        { maxSentences: topics.length === 1 ? 1 : remaining, maxPerTopic: 1, repetitionWindow: 0 },
        { recentSelections: [] },
        rng,
      ),
    );
  }
  const result = {
    text: results
      .map((entry) => entry.text)
      .filter(Boolean)
      .join(' '),
    selections: results.flatMap((entry) => entry.selections),
  };
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
      ruleId: 'fantasy:region:overview:v3',
      status: 'current',
      sources: [
        ...sourceIds.map((factId): FactSource => ({ kind: 'fact', factId })),
        ...[...selected].sort().flatMap((id) => extraSources.get(id) ?? []),
      ],
    };
  else delete region.overviewReason;
  return result.text;
}
