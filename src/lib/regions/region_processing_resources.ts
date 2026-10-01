import { allSpecies } from '$lib/species';
import {
  deriveResourcesFromSpecies,
  getBuildingMaterialResources,
  getGeologicalResources,
  getPlantProducts,
  type Resource,
} from '$lib/resources';
import type Region from './region';
import type { RegionFacts, ResourceFact } from './region_fact_types';
import type { AccessibleProcessingResource } from './region_processing_types';
import { processingEvidenceCurrent } from './region_evidence';
export { processingEvidenceCurrent, reachableProcessingNodes } from './region_evidence';

function descriptor(fact: ResourceFact, facts: RegionFacts): Resource | undefined {
  const source = fact.catalogSource;
  if (source?.kind === 'geological-resource')
    return getGeologicalResources().find((entry) => entry.resource.name === source.resourceName)
      ?.resource;
  if (source?.kind === 'building-material')
    return getBuildingMaterialResources().find((entry) => entry.name === source.resourceName);
  if (source?.kind === 'plant-product')
    return getPlantProducts(source.plantName).find((entry) => entry.name === source.resourceName);
  if (source?.kind === 'species-product') {
    const species = allSpecies.find((entry) => entry.name === source.speciesName);
    return species
      ? deriveResourcesFromSpecies(species).find((entry) => entry.name === source.resourceName)
      : undefined;
  }
  if (source !== undefined) return undefined;
  if (fact.kind === 'fiber') {
    for (const input of fact.reason?.sources ?? []) {
      if (input.kind !== 'fact') continue;
      const inhabitant = facts.ecologyInhabitants.find(
        (entry) =>
          entry.id === input.factId &&
          entry.category === 'flora' &&
          entry.roles.includes('producer'),
      );
      if (inhabitant?.source.kind === 'described') {
        const product = getPlantProducts(inhabitant.source.label)[0];
        if (product) return product;
      }
    }
    return undefined;
  }
  if (fact.kind !== 'timber' && fact.kind !== 'freshwater') return undefined;
  return {
    name: fact.kind === 'timber' ? 'timber' : 'freshwater',
    description: 'A structured saved source.',
    major_type: fact.kind === 'timber' ? 'wood' : 'water',
    minor_type: fact.kind === 'timber' ? 'timber' : 'freshwater',
    is_refineable: false,
    properties: [],
    commonality: 1,
  };
}
export function accessibleProcessingResources(
  region: Pick<Region, 'facts' | 'map'>,
  reached: Set<number>,
): AccessibleProcessingResource[] {
  const facts = region.facts!;
  const results: AccessibleProcessingResource[] = [];
  for (const fact of [...facts.resources].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  )) {
    if (
      !['available', 'limited'].includes(fact.availability) ||
      !processingEvidenceCurrent(fact, facts)
    )
      continue;
    const resource = descriptor(fact, facts);
    if (!resource) continue;
    let nodeIds = (fact.anchor?.nodeIds ?? []).filter((id) => reached.has(id));
    let depositIds: string[] = [];
    if (fact.depositIds.length) {
      const deposits = facts.resourceDeposits.filter(
        (entry) =>
          fact.depositIds.includes(entry.id) &&
          entry.concentration !== 'trace' &&
          entry.exposure !== 'deep' &&
          entry.extraction !== 'drilling' &&
          processingEvidenceCurrent(entry, facts) &&
          entry.anchor.nodeIds.some((id) => nodeIds.includes(id)),
      );
      depositIds = deposits.map((entry) => entry.id).sort();
      nodeIds = nodeIds.filter((id) => deposits.some((entry) => entry.anchor.nodeIds.includes(id)));
      if (!depositIds.length) continue;
    }
    if (!nodeIds.length) continue;
    results.push({
      fact,
      resource,
      depositIds,
      anchor: {
        nodeIds: [...new Set(nodeIds)].sort((a, b) => a - b),
        edgeIds: [...(fact.anchor?.edgeIds ?? [])].sort((a, b) => a - b),
      },
    });
  }
  return results;
}
