import type Region from './region';
import type { ResourceFact } from './region_fact_types';
import {
  accessibleProcessingResources,
  processingEvidenceCurrent,
  reachableProcessingNodes,
} from './region_processing_resources';
export { dailyLifeInputCurrent, sameSettlement } from './region_livelihood_evidence';

/** Fish access is at the actual shore site, never every water cell beside connected land. */
export function accessibleDailyLifeResources(region: Pick<Region, 'facts' | 'map'>, start: number) {
  const land = accessibleProcessingResources(
    region,
    reachableProcessingNodes(region, start),
  ).filter((entry) => entry.fact.kind !== 'fish');
  const site = region.map.nodes.find((node) => node.id === start);
  const shore = new Set(
    region.map.nodes
      .filter(
        (node) =>
          node.id === start ||
          ((node.isWater || node.isOcean) &&
            (site?.neighbors.includes(node.id) || node.neighbors.includes(start))),
      )
      .map((node) => node.id),
  );
  const fish = accessibleProcessingResources(region, shore).filter(
    (entry) => entry.fact.kind === 'fish',
  );
  return [...land, ...fish].sort((a, b) =>
    a.fact.id < b.fact.id ? -1 : a.fact.id > b.fact.id ? 1 : 0,
  );
}

export function accessibleCultivationGround(
  region: Pick<Region, 'facts' | 'map'>,
  start: number,
): ResourceFact[] {
  const reached = reachableProcessingNodes(region, start);
  return region
    .facts!.resources.filter(
      (resource) =>
        resource.kind === 'arable-land' &&
        ['available', 'limited'].includes(resource.availability) &&
        processingEvidenceCurrent(resource, region.facts!) &&
        resource.anchor?.nodeIds.some((id) => reached.has(id)),
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
