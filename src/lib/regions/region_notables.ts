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
  const vertical = y < 1 / 3 ? 'northern' : y > 2 / 3 ? 'southern' : '';
  const horizontal = x < 1 / 3 ? 'western' : x > 2 / 3 ? 'eastern' : '';
  return [vertical, horizontal].filter(Boolean).join(' ') || 'central';
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
    description: `In the ${location(node, region)} part of the region: ${description}`,
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
    if (!isUsableRegionResource(resource) || resource.reason?.status === 'stale') return [];
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
        `${resource.description} Hook: survey access to this source and assess the requirements for its use.`,
        [{ kind: 'fact', factId: resource.id }],
        edges,
      ),
    ];
  });
  const habitats = region.facts!.habitats.flatMap((habitat) => {
    const node = nodes.find((node) => habitat.anchor?.nodeIds.includes(node.id));
    if (!node) return [];
    return [
      notable(
        region,
        node,
        'landmark',
        'habitat-study',
        `${habitat.name} study site`,
        `this site lies within the ${habitat.name} habitat. Hook: guide a survey of this habitat and compare it with nearby terrain.`,
        [{ kind: 'fact', factId: habitat.id }],
      ),
    ];
  });
  return [...resources, ...habitats];
}

function inhabitedPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  return region
    .facts!.settlementRoles.filter((role) => role.id.startsWith('role:site:'))
    .flatMap((role) => {
      const node = nodes.find((node) => role.anchor.nodeIds.includes(node.id));
      if (!node) return [];
      return [
        notable(
          region,
          node,
          'landmark',
          'settlement-approach',
          `${role.name} approach`,
          `${role.description} Hook: escort travelers to this inhabited site and survey its approach.`,
          [{ kind: 'fact', factId: role.id }],
          region.map.edges.filter((edge) => role.anchor.edgeIds.includes(edge.id)),
        ),
      ];
    });
}

function riverPlaces(region: Region, nodes: MapNode[]): NotableFact[] {
  return [...region.map.edges]
    .sort((a, b) => a.id - b.id)
    .filter((edge) => edge.river > 0)
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
          `${road ? 'a road meets the river here' : 'a river runs through this country'}. Hook: explore the banks and look for a crossing.`,
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
          'high ground complicates overland route planning. Hook: scout an approach through the high terrain before leading a caravan onward.',
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
          `freezing temperatures${site.coldestSeason.trim() === '' ? '' : ` during ${site.coldestSeason}`}, making exposure a travel concern. Hook: arrange shelter and supplies for a journey through the cold country.`,
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
          'heat and dry conditions make water planning a travel concern. Hook: survey water access before attempting this traverse.',
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
      `the freshwater patch used for ${risk.use.name} also supports ${risk.inhabitant.name}. Gathering here calls for care. Hook: scout the banks before bringing gatherers to this site.`,
      risk.sources,
    ),
  );
}

/** Select at most four supported places using only the notable-places stream. */
export function generateNotableFacts(region: Region, rng: RNG, forestLandmark?: NotableFact): void {
  const nodes = region.map.nodes
    .filter((node) => !node.isWater && !node.isOcean)
    .sort((a, b) => a.id - b.id);
  const groups = [
    forestLandmark ? [forestLandmark] : naturalPlaces(region, nodes),
    inhabitedPlaces(region, nodes),
    riverPlaces(region, nodes),
    [...terrainObstacles(region, nodes), ...ecologyGatheringHazards(region)],
  ];
  for (const candidates of groups) {
    candidates.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (candidates.length > 0) region.facts!.notables.push(rng.item(candidates));
  }
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
