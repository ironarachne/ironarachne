import type { RNG } from '@ironarachne/rng';
import { composeNarrative } from '$lib/narrative';
import type Region from './region';
import type { CausalFact, FactBase, FactSource } from './region_fact_types';
import type { RegionIdentityCandidate } from './region_identity_types';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { overviewRoad, overviewSettlement } from './region_geography_narrative';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
export const isRegionIdentityFact = (fact: FactBase): boolean =>
  fact.id.startsWith('claim:identity:');

function landSources(region: Region, ids: number[]): FactSource[] {
  return [...new Set(ids)]
    .sort((a, b) => a - b)
    .flatMap((nodeId) => {
      const node = region.map.nodes.find((entry) => entry.id === nodeId)!;
      return (['isWater', 'isOcean'] as const).map((property) => ({
        kind: 'map-node' as const,
        nodeId,
        property,
        observedValue: String(node[property]),
      }));
    });
}

function candidate(
  family: RegionIdentityCandidate['family'],
  subject: FactBase,
  related: FactBase[],
  observations: FactSource[],
  options: string[],
  conflicts: string[] = [],
): RegionIdentityCandidate {
  const relatedIds = [...new Set(related.map((fact) => fact.id))].sort(lexical);
  return {
    family,
    options: options.map((text) => text.charAt(0).toUpperCase() + text.slice(1)),
    conflicts,
    fact: {
      id: `claim:identity:${JSON.stringify([family, subject.id, relatedIds])}`,
      name: {
        'road-landscape': 'Landscape road',
        'settlement-forest': 'Forest settlement',
        'resource-range': 'Mountain material',
      }[family],
      description: '',
      origin: 'generated',
      subjectId: subject.id,
      relatedIds,
      reason: {
        ruleId: `fantasy:region:identity-${family}:v1`,
        status: 'current',
        sources: [
          ...[subject.id, ...relatedIds].map((factId): FactSource => ({ kind: 'fact', factId })),
          ...observations,
        ],
      },
    },
  };
}

function identityCandidates(region: Region): RegionIdentityCandidate[] {
  const facts = region.facts!;
  const current = createRegionEvidenceChecker({ ...region, facts });
  const dry = (id: number) =>
    region.map.nodes.some((node) => node.id === id && !node.isWater && !node.isOcean);
  const forests = facts.denseForests.filter((fact) => current(fact) && fact.name.trim());
  const ranges = facts.mountainRanges.filter((fact) => current(fact) && fact.name.trim());
  const sites = facts.settlementRoles
    .filter((fact) => current(fact))
    .flatMap((role) => {
      const settlement = overviewSettlement(region, role);
      return settlement ? [{ role, settlement }] : [];
    });
  const candidates: RegionIdentityCandidate[] = [];
  for (const route of facts.routes.filter((fact) => fact.kind === 'road' && current(fact))) {
    const road = overviewRoad(region, route);
    if (!road) continue;
    for (const landscape of [...forests, ...ranges]) {
      const overlap = route.anchor.nodeIds.filter((id) => landscape.mapNodeIds.includes(id));
      if (!overlap.length) continue;
      const roles = sites.filter(({ settlement }) => road.settlements.includes(settlement));
      const [start, end] = road.settlements.map((settlement) => settlement.name.trim());
      candidates.push(
        candidate(
          'road-landscape',
          route,
          [landscape, ...roles.map(({ role }) => role)],
          [...road.sources, ...landSources(region, overlap)],
          [
            `A road connects ${start} and ${end} through ${landscape.name.trim()}.`,
            `From ${start}, a road leads through ${landscape.name.trim()} to ${end}.`,
          ],
          road.settlements.map((settlement) =>
            JSON.stringify([landscape.id, settlement.mapNodeId]),
          ),
        ),
      );
    }
  }
  for (const { role, settlement } of sites) {
    for (const forest of forests) {
      const nodeId = settlement.mapNodeId!;
      if (!forest.mapNodeIds.includes(nodeId)) continue;
      candidates.push(
        candidate(
          'settlement-forest',
          role,
          [forest],
          landSources(region, [nodeId]),
          [
            `${settlement.name.trim()} stands within ${forest.name.trim()}.`,
            `Within ${forest.name.trim()} lies ${settlement.name.trim()}.`,
          ],
          [JSON.stringify([forest.id, nodeId])],
        ),
      );
    }
  }
  for (const resource of facts.resources) {
    if (
      !['stone', 'ore', 'gemstone', 'geological-material'].includes(resource.kind) ||
      !['available', 'limited'].includes(resource.availability) ||
      !current(resource)
    )
      continue;
    for (const deposit of facts.resourceDeposits.filter(
      (fact) =>
        resource.depositIds.includes(fact.id) &&
        current(fact) &&
        fact.resourceName.trim() &&
        fact.concentration !== 'trace',
    )) {
      for (const range of ranges) {
        const overlap = (resource.anchor?.nodeIds ?? []).filter(
          (id) => dry(id) && deposit.anchor.nodeIds.includes(id) && range.mapNodeIds.includes(id),
        );
        if (!overlap.length) continue;
        const material = deposit.resourceName.trim();
        const qualification = resource.availability === 'limited' ? ' in limited supply' : '';
        candidates.push(
          candidate('resource-range', resource, [deposit, range], landSources(region, overlap), [
            `${material} occurs${qualification} in ${range.name.trim()}.`,
            `Within ${range.name.trim()}, ${material} is present${qualification}.`,
          ]),
        );
      }
    }
  }
  return candidates.sort((a, b) => lexical(a.fact.id, b.fact.id));
}

/** Optional enrichment. Saved claims (including authored ones) are never rerolled. */
export function generateRegionIdentity(region: Region, rng: RNG): void {
  const facts = region.facts;
  if (!facts || facts.claims.some(isRegionIdentityFact)) return;
  const candidates = identityCandidates(region);
  const conflicts = new Set<string>();
  for (const family of ['road-landscape', 'settlement-forest', 'resource-range'] as const) {
    const eligible = candidates.filter(
      (entry) => entry.family === family && !entry.conflicts.some((key) => conflicts.has(key)),
    );
    if (!eligible.length) continue;
    const selected = rng.item(eligible);
    const fact: CausalFact = selected.fact;
    fact.description = composeNarrative(
      {
        id: fact.id,
        kind: 'region-identity',
        candidates: [
          {
            id: fact.id,
            topic: family,
            importance: 'distinctive',
            sourceIds: [fact.id],
            templates: [
              { id: `${family}:sentence`, parts: [{ id: 'sentence', options: selected.options }] },
            ],
          },
        ],
      },
      { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 0 },
      { recentSelections: [] },
      rng,
    ).text;
    facts.claims.push(fact);
    selected.conflicts.forEach((key) => conflicts.add(key));
  }
}
