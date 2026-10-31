import { createRegionEvidenceChecker } from './region_context_evidence';
import { compassPosition } from './region_prose';
import { riverAssessments } from './region_resource_narrative';
import { isUsableRegionResource } from './region_resources';
import { ecologyHarvestRisks } from './region_ecology_relationships';
import { Climates } from '$lib/environment';
import type { RNG } from '@ironarachne/rng';
import type { MapNode, MapEdge } from '$lib/map';
import type Region from './region.js';
import type { FactSource, NotableFact } from './region_fact_types.js';

function location(node: MapNode, region: Region): string {
  const x = node.center.x / region.map.width;
  const y = node.center.y / region.map.height;
  return compassPosition(x, y);
}

function observation(
  node: MapNode,
  property: 'elevation' | 'temperature' | 'moisture',
): FactSource {
  return { kind: 'map-node', nodeId: node.id, property, observedValue: String(node[property]) };
}

function climateObservation(region: Region): FactSource {
  return {
    kind: 'environment',
    field: 'climate',
    observedValue: JSON.stringify(region.environment.climate),
  };
}

function notable(
  region: Region,
  node: MapNode,
  kind: NotableFact['kind'],
  rule: string,
  name: string,
  description: string,
  sources: FactSource[],
  edges: MapEdge[] = [],
): NotableFact {
  return {
    id: `${kind}:${rule}:${node.id}${sources[0]?.kind === 'fact' ? `:${sources[0].factId}` : edges.length ? `:${edges[0].id}` : ''}`,
    kind,
    name,
    description: `This site lies in the ${location(node, region)} part of the region. ${description}`,
    origin: 'generated',
    areaIds: region
      .facts!.areas.filter((area) => area.mapNodeIds.includes(node.id))
      .map((area) => area.id),
    anchor: { nodeIds: [node.id], edgeIds: edges.map((edge) => edge.id).sort((a, b) => a - b) },
    reason: { ruleId: `fantasy:region:${rule}:v1`, status: 'current', sources },
  };
}

function naturalPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  const resources = region.facts!.resources.flatMap((resource) => {
    if (
      !isUsableRegionResource(resource) ||
      resource.reason?.status === 'stale' ||
      resource.availability !== 'limited'
    )
      return [];
    const node = nodes.find((node) => resource.anchor?.nodeIds.includes(node.id));
    if (!node) return [];
    const edges = region.map.edges.filter((edge) => resource.anchor?.edgeIds.includes(edge.id));
    return [
      notable(
        region,
        node,
        'landmark',
        'resource-reach',
        `${resource.name} reach`,
        resource.description,
        [{ kind: 'fact', factId: resource.id }],
        edges,
      ),
    ];
  });
  const opportunities = region.facts!.resourceSources.flatMap((source) => {
    const node = nodes.find((entry) => source.anchor.nodeIds.includes(entry.id));
    if (!node || !source.requirements.length || source.reason?.status === 'stale') return [];
    return [
      notable(
        region,
        node,
        'landmark',
        'resource-reach',
        `${source.name} reach`,
        `Collection here requires ${source.requirements.join(' and ')}.`,
        [{ kind: 'fact', factId: source.id }],
        region.map.edges.filter((edge) => source.anchor.edgeIds.includes(edge.id)),
      ),
    ];
  });
  return [...resources, ...opportunities];
}

function inhabitedPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  return region
    .facts!.settlementRoles.filter((role) => role.id.startsWith('role:site:'))
    .flatMap((role) => {
      const node = nodes.find((node) => role.anchor.nodeIds.includes(node.id));
      if (
        !node ||
        !role.anchor.edgeIds.some((id) =>
          region.map.edges.some(
            (edge) =>
              edge.id === id &&
              edge.river > 0 &&
              (edge.road ?? 0) > 0 &&
              (edge.d0 === node.id || edge.d1 === node.id),
          ),
        )
      )
        return [];
      return [
        notable(
          region,
          node,
          'landmark',
          'settlement-approach',
          `${role.name} approach`,
          role.description,
          [{ kind: 'fact', factId: role.id }],
          region.map.edges.filter((edge) => role.anchor.edgeIds.includes(edge.id)),
        ),
      ];
    });
}

function riverPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  return [...region.map.edges]
    .sort((a, b) => a.id - b.id)
    .filter((edge) => edge.river > 0 && (edge.road ?? 0) > 0)
    .flatMap((edge) => {
      const node = nodes.find((node) => node.id === edge.d0 || node.id === edge.d1);
      if (!node) return [];
      const road = (edge.road ?? 0) > 0;
      return [
        notable(
          region,
          node,
          'landmark',
          'river-meeting',
          road ? 'Road and river meeting' : 'River banks',
          'A road meets the river here, making passage a route-planning concern.',
          [
            {
              kind: 'map-edge',
              edgeId: edge.id,
              property: 'river',
              observedValue: String(edge.river),
            },
            {
              kind: 'map-edge',
              edgeId: edge.id,
              property: 'road',
              observedValue: String(edge.road),
            },
          ],
          [edge],
        ),
      ];
    });
}

function terrainObstacles(region: Region, nodes: MapNode[]): NotableFact[] {
  return nodes.flatMap((node) => {
    const candidates: NotableFact[] = [];
    const site = Climates.siteTemperature(region.environment.climate, node.temperature);
    if (node.elevation >= 0.65)
      candidates.push(
        notable(
          region,
          node,
          'hazard',
          'high-ground-obstacle',
          'High-ground traverse',
          'High ground complicates overland route planning.',
          [observation(node, 'elevation')],
        ),
      );
    if (site.coldestMonth <= 0)
      candidates.push(
        notable(
          region,
          node,
          'hazard',
          'cold-travel',
          'Cold travel country',
          `Freezing temperatures${site.coldestSeason.trim() === '' ? '' : ` during ${site.coldestSeason}`} make exposure a travel concern.`,
          [observation(node, 'temperature'), climateObservation(region)],
        ),
      );
    if (site.warmestMonth >= 25 && node.moisture <= 0.2)
      candidates.push(
        notable(
          region,
          node,
          'hazard',
          'hot-dry-travel',
          'Hot dry traverse',
          'Heat and dry conditions make water planning a travel concern.',
          [
            observation(node, 'temperature'),
            observation(node, 'moisture'),
            climateObservation(region),
          ],
        ),
      );
    return candidates;
  });
}

function ecologyGatheringHazards(region: Region): NotableFact[] {
  return ecologyHarvestRisks(region).map((risk) =>
    notable(
      region,
      risk.node,
      'hazard',
      'ecology-bank-gathering',
      'Hazardous bank gathering',
      `The freshwater patch used for ${risk.use.name} also supports the local ${risk.inhabitant.name} population. Gathering here calls for care.`,
      risk.sources,
    ),
  );
}

/** Select at most four supported places using only the notable-places stream. */
export function generateNotableFacts(region: Region, rng: RNG, forestLandmark?: NotableFact): void {
  const nodes = region.map.nodes
    .filter((node) => !node.isWater && !node.isOcean)
    .sort((a, b) => a.id - b.id);
  const candidates = [
    ...(forestLandmark ? [forestLandmark] : []),
    ...naturalPlaces(region, nodes),
    ...inhabitedPlaces(region, nodes),
    ...riverPlaces(region, nodes),
    ...terrainObstacles(region, nodes),
    ...ecologyGatheringHazards(region),
  ].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  // Consequential use/danger relationships outrank ordinary travel constraints. Randomize only
  // canonical equals; no category is entitled to a slot and no wording draw changes this choice.
  const priority = (fact: NotableFact) => [
    fact.reason?.ruleId === 'fantasy:region:ecology-bank-gathering:v1' ? 0 : 1,
    fact === forestLandmark ? 1 : 0,
    fact.reason?.sources.some((source) => source.kind === 'fact') ||
    fact.reason?.ruleId === 'fantasy:region:river-meeting:v1'
      ? 0
      : 1,
  ];
  const compare = (a: NotableFact, b: NotableFact) => {
    const left = priority(a),
      right = priority(b);
    return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
  };
  const current = createRegionEvidenceChecker({
    facts: region.facts!,
    map: region.map,
    environment: region.environment,
  });
  const seenRules = new Set<string>();
  const selected = rng
    .shuffle(candidates.filter((fact) => current(fact)))
    .sort(compare)
    .filter((fact) => {
      const key = fact.reason!.ruleId;
      if (seenRules.has(key)) return false;
      seenRules.add(key);
      return true;
    })
    .slice(0, 4);
  // A named forest's alias must stay discoverable under the landscape ownership contract.
  if (forestLandmark && !selected.includes(forestLandmark)) {
    if (selected.length === 4) selected.pop();
    selected.push(forestLandmark);
  }
  region.facts!.notables.push(...selected.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)));
  for (const fact of region.facts!.notables) {
    if (fact.reason?.ruleId === 'fantasy:region:river-meeting:v1') {
      const edge = region.map.edges.find((entry) => fact.anchor?.edgeIds.includes(entry.id));
      fact.assessments = riverAssessments(fact.reason.sources, (edge?.road ?? 0) > 0);
    }
    if (fact.reason?.ruleId === 'fantasy:region:resource-reach:v1') {
      const source = fact.reason.sources[0];
      const resource =
        source?.kind === 'fact'
          ? region.facts!.resources.find((entry) => entry.id === source.factId)
          : undefined;
      if (resource?.assessments)
        fact.assessments = resource.assessments.map((entry) => ({
          ...entry,
          sources: [{ kind: 'fact', factId: resource.id }],
        }));
    }
  }
}
